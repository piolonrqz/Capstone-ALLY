import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut, Settings, ChevronDown, MessageCircle, Bell } from 'lucide-react';
import { getAuthData, isAuthenticated, logout, fetchUserDetails } from '../utils/auth.jsx';
import { shouldHideNavigation } from '../utils/navigation.js';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = isAuthenticated();
  
  // Memoize authData to prevent infinite re-renders
  const authData = useMemo(() => getAuthData(), [isLoggedIn]);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const dropdownRef = useRef(null);
  // Fetch user details when logged in
  useEffect(() => {
    const getUserDetails = async () => {
      // Only fetch if logged in, have userId, and not already loading
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
      } else if (!isLoggedIn) {
        // Clear user details when logged out
        setUserDetails(null);
        setIsLoadingUser(false);
      }
    };

    getUserDetails();
  }, [isLoggedIn, authData?.userId]); // Only depend on login status and userId

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };  }, []);

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
    if (authData?.accountType?.toLowerCase() === 'lawyer') {
      navigate('/lawyer-profile');
    } else {
      navigate('/settings');
    }
  };

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Get user's initials for profile display
  const getUserInitials = () => {
    if (userDetails?.firstName && userDetails?.lastName) {
      return `${userDetails.firstName.charAt(0)}${userDetails.lastName.charAt(0)}`.toUpperCase();
    }
    if (userDetails?.firstName) {
      return userDetails.firstName.charAt(0).toUpperCase();
    }
    if (authData?.email) {
      return authData.email.charAt(0).toUpperCase();
    }
    return 'U';
  };
  return (
    <nav className="fixed top-0 bg-[#F7FBFF] w-full h-[104px] px-8 flex justify-between items-center z-50" style={{boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'}}>
      {/* Logo */}
      <Link to="/" className="flex items-center justify-center h-10">
        <img src="/ally_logo.svg" alt="ALLY Logo" className="w-[114px] h-10" />
      </Link>      
      {/* Navigation Links */}
      <div className="flex items-center gap-8">
        {isLoggedIn ? (
          <>
            <Link 
              to="/my-cases" 
              className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
            >
              My Cases
            </Link>
            <Link 
              to="/appointments" 
              className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
            >
              Appointment
            </Link>
            {/* Lawyer Settings link, only for lawyers */}
              <Link
                to="/lawyer-settings"
                className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
              >
                Settings
              </Link>
          </> /* End fragment for logged-in links */
        ) : (
          <>
            <Link 
              to="#" 
              className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link 
              to="#" 
              className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
            >
              Legal Resources
            </Link>
            <Link 
              to="#" 
              className="text-[#11265A] text-2xl font-medium hover:text-blue-600 transition-colors"
            >
              FAQ
            </Link>
          </>
        )}
      </div>        
      {/* Right Side Buttons */}
      <div className="flex items-center gap-3">
        {/* Login/Register or Profile Dropdown */}        
        {isLoggedIn ? (
          <>
            {/* Message and Notification Icons */}
            <button className="relative flex items-center justify-center w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full border border-[#E8F2FF] hover:border-[#2B62C4]/30 hover:bg-white hover:shadow-lg transition-all duration-300 ease-in-out group">
              <MessageCircle className="w-5 h-5 text-[#2B62C4] group-hover:text-[#1A6EFF] transition-colors duration-200" strokeWidth={1.8} />
            </button>
            <button className="relative flex items-center justify-center w-11 h-11 bg-white/80 backdrop-blur-sm rounded-full border border-[#E8F2FF] hover:border-[#2B62C4]/30 hover:bg-white hover:shadow-lg transition-all duration-300 ease-in-out group">
              <Bell className="w-5 h-5 text-[#2B62C4] group-hover:text-[#1A6EFF] transition-colors duration-200" strokeWidth={1.8} />
              {/* Optional notification badge */}
              <span className="absolute w-3 h-3 transition-opacity duration-200 bg-red-500 border-2 border-white rounded-full opacity-0 -top-1 -right-1 group-hover:opacity-100"></span>
            </button>
            
            <div className="relative" ref={dropdownRef}>
          <button
              onClick={toggleDropdown}
              className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-[#E8F2FF] transition-all duration-200 ease-in-out hover:shadow-md"
            >
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-[#2B62C4] to-[#1A6EFF] text-white rounded-full text-base font-semibold shadow-lg">
                {getUserInitials()}
              </div>
              <ChevronDown className={`w-5 h-5 text-[#11265A] transition-all duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-[#E8F2FF] py-2 z-50 backdrop-blur-sm">
                <div className="px-4 py-3 border-b border-[#E8F2FF]">
                  <p className="text-sm text-[#11265A]/60">Signed in as</p>
                  <p className="text-sm font-semibold text-[#11265A] truncate">
                    {userDetails?.email || authData?.email || 'User'}
                  </p>
                </div>
                <button
                  onClick={handleProfileSettings}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-[#11265A] hover:bg-[#E8F2FF] transition-colors group"
                >
                  <Settings className="w-5 h-5 text-[#2B62C4] group-hover:text-[#1A6EFF] transition-colors" />
                  <span className="font-medium">Profile Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full gap-3 px-4 py-3 text-left text-red-600 transition-colors hover:bg-red-50 group"
                >
                  <LogOut className="w-5 h-5 text-red-500 transition-colors group-hover:text-red-600" />
                  <span className="font-medium">Logout</span>
                </button>              
                </div>
            )}
          </div>
          </>
        ) : (
          <button
            onClick={handleAuthAction}
            className="flex items-center gap-3 px-4 py-1.5 border border-[#2B62C4] rounded-lg hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center justify-center w-6 h-6">
              <User className="w-5 h-5 text-[#11265A]" strokeWidth={1.5} />
            </div>
            <span className="text-[#11265A] text-xl font-semibold">
              Login / Register
            </span>
          </button>
        )}
      </div>
    </nav>
  );
};

export default NavigationBar;