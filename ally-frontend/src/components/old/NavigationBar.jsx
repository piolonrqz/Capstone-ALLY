import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, MessageCircle, Bell } from 'lucide-react';
import { getAuthData, isAuthenticated, logout, fetchUserDetails } from '../utils/auth.jsx';
import { shouldHideNavigation } from '../utils/navigation.js';
import NotificationDropdown from './NotificationDropdown';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  
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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-[1440px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => navigate('/')} className="cursor-pointer">
            <img src="/ally_logo.svg" alt="ALLY" className="w-28 h-10" />
          </div>
          
          {/* Navigation Links */}
          <div className="flex items-center">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-8">
                  <Link
                    to="/my-cases"
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    My Cases
                  </Link>
                  <Link
                    to="/appointments"
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    Appointment
                  </Link>
                  <Link
                    to="/documents"
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    Documents
                  </Link>
                </div>

                {/* Right Side Icons and Profile */}
                <div className="flex items-center gap-4 ml-8 border-l pl-8">
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
                  
                  {/* User Type Badge */}
                  <UserTypeBadge />
                  
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={toggleDropdown}
                      className="flex items-center gap-2 hover:bg-gray-50 rounded-full p-2 transition-all duration-200"
                    >
                      {userDetails?.profilePhotoUrl ? (
                        <img
                          src={userDetails.profilePhotoUrl}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-[#2B62C4] to-[#1A6EFF] text-white rounded-full text-sm font-semibold">
                          {getUserInitials()}
                        </div>
                      )}
                      <ChevronDown className={`w-4 h-4 text-[#11265A] transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                  
                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                        <div className="px-4 py-2 border-b border-gray-200">
                          <p className="text-sm text-gray-600">Signed in as</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {authData?.email || 'User'}
                          </p>
                        </div>
                        <button
                          onClick={handleProfileSettings}
                          className="flex items-center gap-3 w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-5 h-5 text-gray-500" />
                          <span>Profile Settings</span>
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5 text-red-500" />
                          <span>Logout</span>
                        </button>              
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-8">
                  <Link 
                    to="#" 
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    About
                  </Link>
                  <Link 
                    to="#" 
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    Legal Resources
                  </Link>
                  <Link 
                    to="#" 
                    className="text-[#11265A] text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
                <div className="flex items-center gap-4 ml-8 border-l pl-8">
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-medium text-[#1A6EFF] hover:text-blue-700 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1A6EFF] rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Get Started
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;

