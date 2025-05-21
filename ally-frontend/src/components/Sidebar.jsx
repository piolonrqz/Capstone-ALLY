import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckSquare, Users, BarChart2, Settings } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="fixed left-0 top-0 w-64 bg-white shadow-lg h-screen">
      <div className="p-6 border-b border-gray-200">
        <Link to="/admin">
          <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
        </Link>
      </div>
      <nav className="mt-6">
        <ul>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin" className={`flex items-center ${path === '/admin' ? 'text-blue-600' : 'text-gray-700'}`}>
              <CheckSquare className="mr-3 h-5 w-5" />
              <span className={path === '/admin' ? 'font-medium' : ''}>Lawyer Verification</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/users' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/users" className={`flex items-center ${path === '/admin/users' ? 'text-blue-600' : 'text-gray-700'}`}>
              <Users className="mr-3 h-5 w-5" />
              <span className={path === '/admin/users' ? 'font-medium' : ''}>User Management</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/analytics' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/analytics" className={`flex items-center ${path === '/admin/analytics' ? 'text-blue-600' : 'text-gray-700'}`}>
              <BarChart2 className="mr-3 h-5 w-5" />
              <span className={path === '/admin/analytics' ? 'font-medium' : ''}>Analytics</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/settings' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/settings" className={`flex items-center ${path === '/admin/settings' ? 'text-blue-600' : 'text-gray-700'}`}>
              <Settings className="mr-3 h-5 w-5" />
              <span className={path === '/admin/settings' ? 'font-medium' : ''}>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
