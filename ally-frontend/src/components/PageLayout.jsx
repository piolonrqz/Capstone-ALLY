import React from 'react';
import { isAuthenticated } from '../utils/auth.jsx';
import NavigationBar from './NavigationBar';
import ChatSidebar from './ChatSidebar';
import { useSidebar } from '../contexts/SidebarContext';

const PageLayout = ({ children }) => {
  const isLoggedIn = isAuthenticated();
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Sidebar - Only show when logged in */}
      {isLoggedIn && <ChatSidebar />}
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        isLoggedIn 
          ? `md:${isExpanded ? 'ml-[240px]' : 'ml-[60px]'}`
          : ''
      }`}>
        {/* Navigation Bar */}
        <NavigationBar />
        
        {/* Main Content */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;

