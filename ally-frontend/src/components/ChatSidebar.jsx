import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquarePlus, Folder, FileText, Calendar, UserSearch, MessageCircle, Settings, LogOut } from 'lucide-react';
import { logout } from '../utils/auth.jsx';

const ChatSidebar = ({ userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { name: 'My Cases', path: '/my-cases', icon: Folder },
    { name: 'Documents', path: '/documents', icon: FileText },
    { name: 'Appointment', path: '/appointments', icon: Calendar },
    { name: 'Find Lawyer', path: '/lawyers', icon: UserSearch },
    { name: 'Chat History', path: '/chat', icon: MessageCircle },
  ];

  const handleNewChat = () => {
    navigate('/');
    // Optionally trigger a reset event if needed
    window.dispatchEvent(new Event('reset-chat'));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="hidden md:flex fixed left-0 top-0 h-screen w-[200px] bg-[#F9FAFB] border-r border-gray-200 flex-col z-40 shadow-sm">
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-gray-200">
        <img src="/ally_logo.svg" alt="ALLY" className="w-20 h-8" />
      </div>

      {/* New Chat Button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 font-medium text-sm transition-all duration-200"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-1">
        <button
          onClick={() => navigate('/settings')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span>Settings</span>
        </button>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );
};

export default ChatSidebar;

