import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, UserCheck, UserX, Scale, Clock } from 'lucide-react';
import { userService } from '../services/userService';

const StatsOverview = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    verifiedLawyers: 0,
    pendingVerifications: 0,
    percentageChanges: {
      totalUsers: '0%',
      activeUsers: '0%',
      inactiveUsers: '0%',
      verifiedLawyers: '0%'
    }
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get all users
      const users = await userService.getUsers();
      
      // Calculate statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.isVerified).length;
      const inactiveUsers = totalUsers - activeUsers;
      const verifiedLawyers = users.filter(user => 
        user.accountType?.toLowerCase() === 'lawyer' && user.credentialsVerified
      ).length;
      const pendingVerifications = users.filter(user => 
        user.accountType?.toLowerCase() === 'lawyer' && !user.credentialsVerified
      ).length;

      setStats({
        totalUsers,
        activeUsers,
        inactiveUsers,
        verifiedLawyers,
        pendingVerifications,
        percentageChanges: {
          totalUsers: '+0%',
          activeUsers: '+0%',
          inactiveUsers: '+0%',
          verifiedLawyers: '+0%'
        }
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    // Fetch stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: stats.percentageChanges.totalUsers,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: stats.percentageChanges.activeUsers,
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      change: stats.percentageChanges.inactiveUsers,
      icon: UserX,
      color: 'red'
    },
    {
      title: 'Verified Lawyers',
      value: stats.verifiedLawyers,
      change: stats.percentageChanges.verifiedLawyers,
      icon: Scale,
      color: 'purple'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="bg-gray-50 p-6 rounded-xl border border-gray-100 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
            </div>
            <div className="mt-4">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="mt-2 w-32 h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-red-50 p-6 rounded-xl border border-red-100"
          >
            <div className="flex justify-between items-start">
              <div className="p-3 rounded-lg bg-red-100">
                <card.icon className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <p className="mt-2 text-sm text-red-600">Failed to load</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statsCards.map((card, index) => (
        <div
          key={index}
          className={`bg-${card.color}-50 p-6 rounded-xl border border-${card.color}-100 
            transition-all duration-300 ease-in-out hover:shadow-md`}
        >
          <div className="flex justify-between items-start">
            <div className={`p-3 rounded-lg bg-${card.color}-100`}>
              <card.icon className={`w-6 h-6 text-${card.color}-600`} />
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
              ${card.change.startsWith('+') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {card.change}
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        </div>
      ))}

      {/* Pending Verifications Card */}
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

export default StatsOverview;
