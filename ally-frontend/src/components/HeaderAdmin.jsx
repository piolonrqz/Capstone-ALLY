import React, { useState } from 'react';
import { Bell, Menu, ChevronDown } from 'lucide-react';
import useCurrentUser from '../hooks/useCurrentUser';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/auth';

const HeaderAdmin = ({ onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { currentUser, loading } = useCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettingsClick = () => {
    setShowProfile(false);
    navigate('/settings');
  };

  // Get user's initials for the avatar fallback
  const getInitials = () => {
    if (!currentUser?.name) return 'A';
    return currentUser.name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left Section: Mobile Menu */}
        <div className="flex items-center">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="p-2 -ml-2 rounded-md text-gray-600 lg:hidden hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right Section: Notifications + Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg hover:bg-gray-50 relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {/* Example Notification */}
                  <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                    <p className="text-sm text-gray-800">New lawyer verification request</p>
                    <p className="text-xs text-gray-500 mt-1">2 minutes ago</p>
                  </div>
                  {/* Add more notifications here */}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center bg-gray-50 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {/* Profile Picture or Initials */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                {loading ? (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    A
                  </div>
                ) : currentUser?.profilePhoto ? (
                  <img 
                    src={currentUser.profilePhoto} 
                    alt={currentUser.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {getInitials()}
                  </div>
                )}
              </div>
              
              {/* Profile Info */}
              <div className="ml-3 pr-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  {loading ? 'Loading...' : currentUser?.name || 'Admin'}
                </h2>
                <p className="text-xs text-gray-500">{loading ? '' : currentUser?.accountType?.toUpperCase() || 'ADMIN'}</p>
              </div>

              <ChevronDown className="h-4 w-4 ml-2 text-gray-400" />
            </button>

            {/* Profile Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <button 
                  onClick={handleSettingsClick}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Account Settings
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderAdmin;