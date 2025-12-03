import React from 'react';
import { useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth.jsx';
import NavigationBar from './NavigationBar';
import ChatSidebar from './ChatSidebar';
import { useSidebar } from '../contexts/SidebarContext';
import useLawyerStatus from '../hooks/useLawyerStatus.js';
import LawyerApprovalWarning from './LawyerApprovalWarning.jsx';

const PageLayout = ({ children }) => {
  const isLoggedIn = isAuthenticated();
  const { isExpanded } = useSidebar();
  const location = useLocation();
  const { status, loading, isLawyer } = useLawyerStatus();

  const shouldShowWarning = () => {
    const result = !isLawyer || loading || status === 'approved' || 
                   location.pathname.startsWith('/settings') || 
                   location.pathname === '/lawyer-settings' ? false : true;
    console.log('Warning check:', { 
      isLawyer, 
      loading, 
      status, 
      pathname: location.pathname,
      willShow: result 
    });
    return result;
  };

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
        
        {/* Lawyer Approval Warning - positioned below fixed nav bar */}
        {shouldShowWarning() && (
          <div className={`fixed top-16 z-30 transition-all duration-300 ${
            isLoggedIn 
              ? `md:${isExpanded ? 'left-[240px]' : 'left-[60px]'} left-0 right-0` 
              : 'left-0 right-0'
          }`}>
            <LawyerApprovalWarning status={status} />
          </div>
        )}
        
        {/* Main Content - adjust padding if warning is shown */}
        <main className={shouldShowWarning() ? "pt-28" : "pt-12"}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default PageLayout;

