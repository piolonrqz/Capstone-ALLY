import React from 'react';
import { useLocation } from 'react-router-dom';

const StatsOverview = () => {
  const location = useLocation();
  const isUserManagement = location.pathname === '/admin/users';

  const stats = isUserManagement ? [
    {
      title: 'Total Users',
      value: '1,230',
      change: '12% from last month',
      bgColor: 'bg-blue-100',
      iconColor: 'bg-blue-500'
    },
    {
      title: 'Active Users',
      value: '1,180',
      change: '5% from last month',
      bgColor: 'bg-green-100',
      iconColor: 'bg-green-500'
    },
    {
      title: 'Inactive Users',
      value: '50',
      change: '-2% from last month',
      bgColor: 'bg-red-100',
      iconColor: 'bg-red-500'
    }
  ] : [
    {
      title: 'Total Users',
      value: '1,230',
      change: '12% from last month',
      bgColor: 'bg-blue-100',
      iconColor: 'bg-blue-500'
    },
    {
      title: 'Verified Lawyers',
      value: '342',
      change: '8% from last month',
      bgColor: 'bg-green-100',
      iconColor: 'bg-green-500'
    },
    {
      title: 'Pending Verifications',
      value: '1',
      change: '5% from last month',
      bgColor: 'bg-yellow-100',
      iconColor: 'bg-yellow-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{stat.title}</h3>
              <p className="mt-1 text-xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-500">{stat.change}</p>
            </div>
            <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
              <div className={`w-6 h-6 rounded-full ${stat.iconColor}`}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
