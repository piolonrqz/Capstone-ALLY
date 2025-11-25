import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, MessageCircle, Bell } from 'lucide-react';
import { getAuthData, isAuthenticated, logout, fetchUserDetails } from '../utils/auth.jsx';
import { shouldHideNavigation } from '../utils/navigation.js';
import NotificationDropdown from './NotificationDropdown';
import { useSidebar } from '../contexts/SidebarContext';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  const { isExpanded } = useSidebar();
  
  // Memoize authData to prevent infinite re-renders
  const authData = useMemo(() => getAuthData(), [isLoggedIn]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  // Fetch user details when logged in
  useEffect(() => {
    const getUserDetails = async () => {
      if (isLoggedIn && authData?.userId && !isLoadingUser) {
        setIsLoadingUser(true);
        try {
          const details = await fetchUserDetails(authData.userId);
          setUserDetails(details);
          
          
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
    
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
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

  const handleAuthAction = () => {
    if (!isLoggedIn) {
      navigate('/signup');
    }
  };

  const handleProfileSettings = () => {
    setIsDropdownOpen(false);
    navigate('/settings');
  };

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
        ? `${isExpanded ? 'left-[240px]' : 'left-[60px]'} right-0` 
        : 'left-0 right-0'
    }`}>
      <div className="h-full px-8">
        <div className="h-full flex items-center justify-between">
          {/* Logo - Only show when NOT logged in */}
          {!isLoggedIn && (
            <div onClick={() => navigate('/')} className="cursor-pointer">
              <img src="/ally_logo.svg" alt="ALLY" className="w-28 h-10" />
            </div>
          )}
          
          {/* Right Side */}
          <div className={`flex items-center ${isLoggedIn ? 'ml-auto' : ''}`}>
            {isLoggedIn ? (
              <>
                {/* Right Side Icons and Profile */}
                <div className="flex items-center gap-4">
                  {/* Message and Notification Icons */}
                  <div className="relative" ref={notificationRef}>
                    <button
                      onClick={toggleNotifications}
                      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-all duration-200"
                    >
                      <Bell className="w-5 h-5 text-[#2B62C4]" strokeWidth={1.8} />
                    </button>
                    <NotificationDropdown
                      isOpen={isNotificationOpen}
                      onClose={() => setIsNotificationOpen(false)}
                      currentUser={userDetails}
                    />
                  </div>

                  <button
                    onClick={() => navigate('/chat')}
                    className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-all duration-200"
                  >
                    <MessageCircle className="w-5 h-5 text-[#2B62C4]" strokeWidth={1.8} />
                  </button>
                  
                  <div className="flex items-center gap-2 px-3 py-2">
                    {userDetails?.profilePhotoUrl ? (
                      <img
                        src={userDetails.profilePhotoUrl}
                        alt="Profile"
                        className="w-9 h-9 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-[#2B62C4] to-[#1A6EFF] text-white rounded-full text-sm font-semibold border-2 border-blue-100">
                        {getUserInitials()}
                      </div>
                    )}
                    <span className="text-sm font-medium text-gray-800">
                      {userDetails?.firstName && userDetails?.lastName 
                        ? `${userDetails.firstName}, ${userDetails.lastName}`
                        : 'User'}
                    </span>
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