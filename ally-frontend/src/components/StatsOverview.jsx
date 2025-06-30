import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Users, UserCheck, UserX, Scale, Clock } from 'lucide-react';

const StatsOverview = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    verifiedLawyers: 0,
    pendingVerifications: 0
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    setStats({
      totalUsers: 1230,
      activeUsers: 1180,
      inactiveUsers: 50,
      verifiedLawyers: 342,
      pendingVerifications: 20
    });
  }, []);

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      change: '+12%',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Users',
      value: stats.activeUsers,
      change: '+5%',
      icon: UserCheck,
      color: 'green'
    },
    {
      title: 'Inactive Users',
      value: stats.inactiveUsers,
      change: '-2%',
      icon: UserX,
      color: 'red'
    },
    {
      title: 'Verified Lawyers',
      value: stats.verifiedLawyers,
      change: '+8%',
      icon: Scale,
      color: 'purple'
    }
  ];

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
          <button className="px-4 py-2 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
            Review
          </button>
        </div>
      )}
    </div>
  );
};

export default StatsOverview;
