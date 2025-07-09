import React, { useState, useEffect } from 'react';
import { Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { userService } from '../services/userService';
import { toast } from 'react-toastify';

const StatsOverview = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await userService.getUserStats();
      setStats({
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        inactiveUsers: data.inactiveUsers || 0
      });
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      setError('Failed to load statistics');
      toast.error('Failed to load user statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 lg:grid-cols-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="lg:col-span-4 p-4 bg-gray-50 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-50 rounded-lg">
        <div className="flex items-center justify-between">
          <p>{error}</p>
          <button
            onClick={fetchStats}
            className="flex items-center px-3 py-1 text-sm bg-red-100 rounded-md hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              <p className="text-sm font-medium text-blue-600">Total Users</p>
            </div>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.totalUsers}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bg-green-50 p-4 rounded-xl border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <UserCheck className="w-5 h-5 text-green-600 mr-2" />
              <p className="text-sm font-medium text-green-600">Active Users</p>
            </div>
            <p className="mt-1 text-2xl font-semibold text-green-900">{stats.activeUsers}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bg-red-50 p-4 rounded-xl border border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <UserX className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-sm font-medium text-red-600">Inactive Users</p>
            </div>
            <p className="mt-1 text-2xl font-semibold text-red-900">{stats.inactiveUsers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
