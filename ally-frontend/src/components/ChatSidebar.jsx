import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MessageSquarePlus, Folder, FileText, Calendar, UserSearch, MessageCircle, Settings, LogOut, ChevronLeft, ChevronRight, ChevronsUpDown, User, Shield } from 'lucide-react';
import { useSidebar } from '../contexts/SidebarContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';

const ChatSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isExpanded, toggleSidebar } = useSidebar();
  
  // Auto-expand settings if user is on a settings page
  const isOnSettingsPage = location.pathname.startsWith('/settings');
  const [settingsExpanded, setSettingsExpanded] = useState(isOnSettingsPage);

  // Keep settings expanded if navigating to settings routes
  useEffect(() => {
    if (isOnSettingsPage) {
      setSettingsExpanded(true);
    }
  }, [isOnSettingsPage]);

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
        className="absolute -right-3 top-20 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:border-blue-400 transition-all duration-200 hover:bg-blue-50 z-50"
        aria-label={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {isExpanded ? (
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <div key={item.path}>
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
            </div>
          );
        })}

        {/* Settings - Collapsible (in navigation) */}
        <Collapsible open={settingsExpanded} onOpenChange={setSettingsExpanded}>
          <CollapsibleTrigger asChild>
            <button
              onClick={() => {
                if (!isExpanded) {
                  navigate('/settings');
                }
              }}
              className={`w-full flex items-center gap-3 px-3 py-3.5 rounded-[8px] text-base font-medium transition-all duration-200 text-gray-700 hover:bg-gray-100 ${!isExpanded ? 'justify-center' : 'justify-between'}`}
              title={!isExpanded ? 'Settings' : ''}
            >
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 flex-shrink-0 text-gray-500" />
                {isExpanded && <span>Settings</span>}
              </div>
              {isExpanded && (
                <ChevronsUpDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </CollapsibleTrigger>
          
          {/* Settings Submenu */}
          {isExpanded && (
            <CollapsibleContent className="space-y-1">
              <button
                onClick={() => navigate('/settings')}
                className={`w-full mt-2 flex items-center gap-3 pl-12 pr-3 py-3.5 rounded-[8px] text-base font-medium transition-all duration-200 ${
                  location.pathname === '/settings'
                    ? 'bg-[#1A6EFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5 flex-shrink-0" />
                <span>Profile</span>
              </button>
              <button
                onClick={() => navigate('/settings/security')}
                className={`w-full flex items-center gap-3 pl-12 pr-3 py-3.5 rounded-[8px] text-base font-medium transition-all duration-200 ${
                  location.pathname === '/settings/security'
                    ? 'bg-[#1A6EFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                <span>Security</span>
              </button>
            </CollapsibleContent>
          )}
        </Collapsible>
      </nav>

    </div>
  );
};

export default ChatSidebar;

