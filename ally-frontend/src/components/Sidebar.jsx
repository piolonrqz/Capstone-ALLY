import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  BarChart2, 
  Settings, 
  FileText, 
  Calendar,
  HelpCircle,
  LogOut
} from 'lucide-react';

const Sidebar = ({ onCloseMobile }) => {
  const location = useLocation();
  const path = location.pathname;

  const navigationItems = [
    {
      group: 'Main',
      items: [
        {
          label: 'Reports & Analytics',
          icon: BarChart2,
          path: '/admin/analytics',
          active: path === '/admin/analytics'
        },
        {
          label: 'Lawyer Verifications',
          icon: CheckSquare,
          path: '/admin/verification',
          active: path === '/admin/verification'
        },
        {
          label: 'User Management',
          icon: Users,
          path: '/admin/users',
          active: path === '/admin/users'
        }
      ]
    },
    {
      group: 'Management',
      items: [
        {
          label: 'Case Oversights',
          icon: FileText,
          path: '/admin/cases',
          active: path === '/admin/cases'
        },
        {
          label: 'Appointments',
          icon: Calendar,
          path: '/admin/appointments',
          active: path === '/admin/appointments'
        },
        {
          label: 'System Settings',
          icon: Settings,
          path: '/admin/settings',
          active: path === '/admin/settings'
        }
      ]
    }
  ];

  return (
    <aside className="fixed top-0 left-0 w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Close button for mobile */}
      <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
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

      {/* Logo and Title for desktop */}
      <div className="hidden lg:flex flex-col items-start px-6 py-4 border-b border-gray-200">
        <Link to="/admin" className="flex items-center gap-3">
          <img src="/small_logo.png" alt="ALLY Logo" className="h-8" />
          <span className="text-xl font-bold text-blue-600">Admin Portal</span>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        {navigationItems.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6 last:mb-0">
            <h2 className="px-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {group.group}
            </h2>
            <ul className="space-y-1">
              {group.items.map((item, index) => (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group
                      ${item.active 
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200
                      ${item.active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`} 
                    />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-4 border-t border-gray-200">
        <ul className="space-y-1">
          <li>
            <Link
              to="/admin/help"
              className="flex items-center px-2 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <HelpCircle className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              Help?
            </Link>
          </li>
          <li>
            <button
              onClick={() => {/* Add logout handler */}}
              className="flex items-center w-full px-2 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 group"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-500" />
              Logout
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
