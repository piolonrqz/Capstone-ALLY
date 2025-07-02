import React from 'react';
import { Link } from 'react-router-dom';
import { Users, CheckSquare, BarChart2, Clock } from 'lucide-react';
import StatsOverview from './StatsOverview';

const DashboardOverview = () => {
  // Quick action cards configuration
  const quickActions = [
    {
      title: 'Lawyer Verification',
      description: 'Review and verify lawyer applications',
      icon: CheckSquare,
      link: '/admin/verification',
      color: 'bg-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage user accounts and roles',
      icon: Users,
      link: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: 'Analytics',
      description: 'View detailed system analytics',
      icon: BarChart2,
      link: '/admin/analytics',
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Last updated:</span>
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-500">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Overview Section */}
      <StatsOverview />

      {/* Quick Actions Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="block p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${action.color} bg-opacity-10`}>
                  <action.icon className={`w-6 h-6 ${action.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{action.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4">
            {/* Placeholder for recent activity - will be implemented with real data */}
            <p className="text-gray-500 text-sm">Recent activity will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview; 