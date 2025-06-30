import React from 'react';
import { useLocation } from 'react-router-dom';
import { Users, UserCheck, UserX, Scale, CheckCircle, Clock, ArrowUp, ArrowDown } from 'lucide-react';

const StatsOverview = () => {
  const location = useLocation();
  const isUserManagement = location.pathname === '/admin/users';

  const stats = isUserManagement ? [
    {
      title: 'Total Users',
      value: '1,230',
      change: '12',
      isIncrease: true,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Active Users',
      value: '1,180',
      change: '5',
      isIncrease: true,
      icon: UserCheck,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100'
    },
    {
      title: 'Inactive Users',
      value: '50',
      change: '2',
      isIncrease: false,
      icon: UserX,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-100'
    }
  ] : [
    {
      title: 'Total Users',
      value: '1,230',
      change: '12',
      isIncrease: true,
      icon: Users,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Verified Lawyers',
      value: '342',
      change: '8',
      isIncrease: true,
      icon: Scale,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100'
    },
    {
      title: 'Pending Verifications',
      value: '1',
      change: '5',
      isIncrease: true,
      icon: Clock,
      bgColor: 'bg-yellow-50',
      iconColor: 'text-yellow-600',
      borderColor: 'border-yellow-100'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-white p-6 rounded-xl border ${stat.borderColor} shadow-sm 
            transition-all duration-300 ease-in-out hover:shadow-md hover:scale-[1.02] 
            hover:border-opacity-75`}
        >
          <div className="flex justify-between items-start">
            <div className={`${stat.bgColor} p-3 rounded-lg`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full ${
              stat.isIncrease ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
            }`}>
              {stat.isIncrease ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-xs font-medium">{stat.change}%</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-600">{stat.title}</h3>
            <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">
              vs. previous month
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsOverview;
