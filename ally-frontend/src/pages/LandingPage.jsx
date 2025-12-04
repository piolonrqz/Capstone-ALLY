import React from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, getAuthData } from '../utils/auth.jsx';
import NavigationBar from '../components/NavigationBar';
import ChatSidebar from '../components/ChatSidebar';
import AllyConsultationChat from '../components/AllyConsultationChat';
import { useSidebar } from '../contexts/SidebarContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const isLoggedIn = isAuthenticated();
  const authData = getAuthData();
  const userRole = authData?.role || null;
  const { isExpanded } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditional Sidebar - Only show when logged in */}
      {isLoggedIn && <ChatSidebar userRole={userRole} />}
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${
        isLoggedIn 
          ? (isExpanded ? 'ml-[240px]' : 'ml-[60px]')
          : ''
      }`}>
        {/* Navigation Bar */}
        <NavigationBar />
        
        {/* Main Content */}
        <main className={isLoggedIn ? 'pt-16 h-[calc(100vh-4rem)]' : 'pt-16'}>
          <AllyConsultationChat />
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
