import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { adminService } from '../services/adminService';
import { toast } from 'react-toastify';

const LawyerVerificationStats = () => {
  const [stats, setStats] = useState({
    pendingVerifications: 0,
    totalVerified: 0,
    totalRejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getVerificationStats();
      setStats({
        pendingVerifications: data.pending || 0,
        totalVerified: data.verified || 0,
        totalRejected: data.rejected || 0
      });
    } catch (error) {
      console.error('Failed to fetch verification stats:', error);
      setError('Failed to load statistics');
      toast.error('Failed to load verification statistics');
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
        <div className="lg:col-span-4 p-4 bg-gray-50 rounded-xl animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
        <div className="lg:col-span-4 p-4 bg-gray-50 rounded-xl animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
        <div className="lg:col-span-4 p-4 bg-gray-50 rounded-xl animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
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
            <p className="text-sm font-medium text-blue-600">Total Verified</p>
            <p className="mt-1 text-2xl font-semibold text-blue-900">{stats.totalVerified}</p>
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 bg-red-50 p-4 rounded-xl border border-red-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-600">Total Rejected</p>
            <p className="mt-1 text-2xl font-semibold text-red-900">{stats.totalRejected}</p>
          </div>
        </div>
      </div>

      {stats.pendingVerifications > 0 && (
        <div className="lg:col-span-4 bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <span className="text-sm font-medium text-yellow-800">
              {stats.pendingVerifications} lawyer verification{stats.pendingVerifications !== 1 ? 's' : ''} pending review
            </span>
          </div>
          <button 
            onClick={() => window.location.href = '/admin/verification'}
            className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Review
          </button>
        </div>
      )}
    </div>
  );
};

export default LawyerVerificationStats; 