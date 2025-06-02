import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckSquare, Users, BarChart2, Settings } from 'lucide-react';

const Sidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const path = location.pathname;

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white shadow-lg">
      {/* Close button for mobile */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <Link to="/admin">
          <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
        </Link>
        <button
          onClick={onCloseMobile}
          className="p-2 text-gray-600 rounded-md hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Logo for desktop */}
      <div className="hidden p-4 lg:block">
        <Link to="/admin">
          <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="px-2 mt-4">
        <ul>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin" className={`flex items-center ${path === '/admin' ? 'text-blue-600' : 'text-gray-700'}`}>
              <CheckSquare className="w-5 h-5 mr-3" />
              <span className={path === '/admin' ? 'font-medium' : ''}>Lawyer Verification</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/users' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/users" className={`flex items-center ${path === '/admin/users' ? 'text-blue-600' : 'text-gray-700'}`}>
              <Users className="w-5 h-5 mr-3" />
              <span className={path === '/admin/users' ? 'font-medium' : ''}>User Management</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/analytics' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/analytics" className={`flex items-center ${path === '/admin/analytics' ? 'text-blue-600' : 'text-gray-700'}`}>
              <BarChart2 className="w-5 h-5 mr-3" />
              <span className={path === '/admin/analytics' ? 'font-medium' : ''}>Analytics</span>
            </Link>
          </li>
          <li className={`mx-2 px-4 py-3 rounded-lg ${path === '/admin/settings' ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-gray-50'}`}>
            <Link to="/admin/settings" className={`flex items-center ${path === '/admin/settings' ? 'text-blue-600' : 'text-gray-700'}`}>
              <Settings className="w-5 h-5 mr-3" />
              <span className={path === '/admin/settings' ? 'font-medium' : ''}>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
