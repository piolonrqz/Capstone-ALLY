import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquarePlus, Folder, FileText, Calendar, UserSearch, MessageCircle, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { logout } from '../utils/auth.jsx';
import { useSidebar } from '../contexts/SidebarContext';

const ChatSidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebar();

  const navigationItems = [
    { name: 'New Chat', path: '/', icon: MessageSquarePlus, action: 'newChat' },
    { name: 'My Cases', path: '/my-cases', icon: Folder },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Appointment', path: '/appointments', icon: Calendar },
    { name: 'Find Lawyer', path: '/lawyers', icon: UserSearch },
  ];

  const handleNewChat = () => {
    navigate('/');
    window.dispatchEvent(new Event('reset-chat'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (item) => {
    if (item.action === 'newChat') {
      handleNewChat();
    } else {
      navigate(item.path);
    }
  };

  return (
    <div 
      className={`hidden md:flex fixed left-0 top-0 h-screen bg-[#F9FAFB] border-r border-gray-200 flex-col z-50 shadow-sm transition-all duration-300 ease-in-out ${
        isExpanded ? 'w-[240px]' : 'w-[60px]'
      }`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
        {isExpanded && (
          <img src="/ally_logo.svg" alt="ALLY" className="w-[114px] h-10" />
        )}
        {!isExpanded && (
          <img src="/logo_notext.svg" alt="ALLY" className="w-9 h-10" />
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 z-50"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => handleNavigation(item)}
                className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-[8px] text-base font-medium transition-all duration-200 ${
                  active
                    ? 'bg-[#1A6EFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!isExpanded ? 'justify-center' : ''}`}
                title={!isExpanded ? item.name : ''}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500'}`} />
                {isExpanded && <span className="truncate">{item.name}</span>}
              </button>
              
              {/* Tooltip for collapsed state */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 -translate-y-1/2 pointer-events-none">
                  {item.name}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 space-y-2">
        <div className="relative group">
          <button
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-[8px] text-base font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200 ${
              !isExpanded ? 'justify-center' : ''
            }`}
            title={!isExpanded ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5 flex-shrink-0 text-gray-500" />
            {isExpanded && <span>Settings</span>}
          </button>
          
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 -translate-y-1/2 pointer-events-none">
              Settings
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
        
        <div className="relative group">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-[8px] text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200 ${
              !isExpanded ? 'justify-center' : ''
            }`}
            title={!isExpanded ? 'Sign out' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 text-red-500" />
            {isExpanded && <span>Sign out</span>}
          </button>
          
          {!isExpanded && (
            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 top-1/2 -translate-y-1/2 pointer-events-none">
              Sign out
              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;

