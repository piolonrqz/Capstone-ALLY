import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, MessageCircle, Bell } from 'lucide-react';
import { getAuthData, isAuthenticated, logout, fetchUserDetails } from '../utils/auth.jsx';
import { shouldHideNavigation } from '../utils/navigation.js';
import NotificationDropdown from './NotificationDropdown';
import MessageDropdown from './MessageDropdown';
import { useSidebar } from '../contexts/SidebarContext';
import { fetchActiveConversations } from '../services/chatService';
import useLawyerStatus from '../hooks/useLawyerStatus.js';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const { isExpanded } = useSidebar();
  
  // Memoize authData to prevent infinite re-renders
  const authData = useMemo(() => getAuthData(), [isLoggedIn]);
  const { status, loading: statusLoading, isLawyer } = useLawyerStatus();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const messageRef = useRef(null);

  // Check if there are notifications (lawyer approval warning or other notifications)
  const hasNotifications = useMemo(() => {
    if (!statusLoading && isLawyer && status && status !== 'approved') {
      return true;
    }
    // TODO: Add check for other backend notifications when implemented
    return false;
  }, [status, isLawyer, statusLoading]);

  // Fetch user details and conversations when logged in
  useEffect(() => {
    const getUserDetails = async () => {
      if (isLoggedIn && authData?.userId && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          const details = await fetchUserDetails(authData.userId);
          setUserDetails(details);
          
          // Fetch conversations after getting user details
          await loadConversations(details.id);
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          setUserDetails(null);
        } finally {
          setIsLoadingUser(false);
        }
      }
    };

    getUserDetails();
  }, [isLoggedIn, authData?.userId]);

  // Load conversations
  const loadConversations = async (userId) => {
    if (!userId) return;
    
    setLoadingConversations(true);
    try {
      const activeConvos = await fetchActiveConversations(userId);
      setConversations(activeConvos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Poll for new messages every 30 seconds
  useEffect(() => {
    if (!isLoggedIn || !userDetails?.id) return;

    const interval = setInterval(() => {
      loadConversations(userDetails.id);
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, userDetails?.id]);
    
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      if (messageRef.current && !messageRef.current.contains(event.target)) {
        setIsMessageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Don't show nav bar on specific routes
  if (shouldHideNavigation(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotificationOpen(false);
  };

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
    setIsDropdownOpen(false);
    setIsMessageOpen(false);
  };

  const toggleMessages = () => {
    setIsMessageOpen(!isMessageOpen);
    setIsNotificationOpen(false);
    setIsDropdownOpen(false);
  };

  // Get user's initials for profile display
  const getUserInitials = () => {
    if (userDetails?.firstName && userDetails?.lastName) {
      return `${userDetails.firstName.charAt(0)}${userDetails.lastName.charAt(0)}`.toUpperCase();
    }
    
    
  };

  // Get user type for badge display
  const getUserType = () => {
    const accountType = userDetails?.accountType;
    if (!accountType) return null;
    
    // Convert to title case for display
    return accountType.charAt(0).toUpperCase() + accountType.slice(1).toLowerCase();
  };

  // UserTypeBadge component
  const UserTypeBadge = () => {
    const userType = getUserType();
    
    if (!userType) return null;

    return (
      <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border border-white/30 transition-all duration-200 hover:shadow-md relative z-10 bg-gradient-to-r from-blue-500 to-teal-500 text-white`}>
        <span className="tracking-wide whitespace-nowrap">{userType}</span>
      </div>
    );
  };

  return (
    <nav className={`fixed top-0 z-40 bg-white shadow-sm h-16 transition-all duration-300 ${
      isLoggedIn 
        ? `md:${isExpanded ? 'left-[240px]' : 'left-[60px]'} left-0 right-0` 
        : 'left-0 right-0'
    }`}>
      <div className="h-full px-4 md:px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo - Only show when NOT logged in */}
          {!isLoggedIn && (
            <div onClick={() => navigate('/')} className="cursor-pointer">
              <img src="/ally_logo.svg" alt="ALLY" className="w-20 md:w-28 h-8 md:h-10" />
            </div>
          )}
          
          {/* Right Side */}
          <div className={`flex items-center ${isLoggedIn ? 'ml-auto' : ''}`}>
            {isLoggedIn ? (
              <>
                {/* Right Side Icons and Profile */}
                <div className="flex items-center gap-2 md:gap-4">
                  {/* Message and Notification Icons */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={toggleNotifications}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                        isNotificationOpen ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Bell 
                        className={`w-5 h-5 ${isNotificationOpen ? 'text-blue-600' : 'text-[#2B62C4]'}`} 
                        strokeWidth={1.8} 
                      />
                      {/* Notification Badge */}
                      {hasNotifications && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                      )}
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                      currentUser={userDetails}
                    />
                  </div>

                  <div className="relative" ref={messageRef}>
                    <button
                      onClick={toggleMessages}
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 ${
                        isMessageOpen ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <MessageCircle 
                        className={`w-5 h-5 ${isMessageOpen ? 'text-blue-600' : 'text-[#2B62C4]'}`} 
                        strokeWidth={1.8} 
                      />
                    </button>
                    <MessageDropdown
                      isOpen={isMessageOpen}
                      onClose={() => setIsMessageOpen(false)}
                      conversations={conversations}
                      currentUser={userDetails}
                      loading={loadingConversations}
                      onRefresh={() => loadConversations(userDetails?.id)}
                    />
                  </div>
                  
                  {/* Profile Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <div 
                      onClick={toggleDropdown}
                      className={`flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isDropdownOpen ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {userDetails?.profilePhotoUrl && userDetails.profilePhotoUrl.trim() !== '' ? (
                        <img
                          src={userDetails.profilePhotoUrl}
                          alt="Profile"
                          className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-blue-100"
                          onError={(e) => {
                            // If image fails to load, hide img and show initials
                            e.target.style.display = 'none';
                            const initialsDiv = e.target.parentElement.querySelector('.initials-fallback');
                            if (initialsDiv) {
                              initialsDiv.style.display = 'flex';
                              initialsDiv.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <div className={`initials-fallback flex items-center justify-center w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-[#2B62C4] to-[#1A6EFF] text-white rounded-full text-xs md:text-sm font-semibold border-2 border-blue-100 ${userDetails?.profilePhotoUrl && userDetails.profilePhotoUrl.trim() !== '' ? 'hidden' : ''}`}>
                        {getUserInitials()}
                      </div>
                      <span className="hidden sm:inline text-sm font-medium text-gray-800">
                        {userDetails?.firstName && userDetails?.lastName 
                          ? `${userDetails.firstName} ${userDetails.lastName}`
                          : 'User'}
                      </span>
                      <ChevronDown className="hidden sm:block w-4 h-4 text-gray-500 transition-transform duration-200" />
                    </div>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-red-600" />
                          <span>Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-5 py-2 text-base font-medium bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-5 py-2 text-m font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;