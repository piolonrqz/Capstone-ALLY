import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { getAuthData, isAuthenticated, logout } from '../utils/auth.jsx';

const NavigationBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const authData = getAuthData();
  const isLoggedIn = isAuthenticated();

  // Don't show nav bar on admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }
  const handleAuthAction = () => {
    if (isLoggedIn) {
      logout();
    } else {
      navigate('/signup');
    }
  };

  const handleGetLegalHelp = () => {
    navigate('/lawyers');
  };  return (
    <nav className="fixed top-0 bg-[#F7FBFF] w-full h-[104px] px-8 flex justify-between items-center z-50" style={{boxShadow: '0px 0px 4px 0px rgba(0, 0, 0, 0.25)'}}>
      {/* Logo */}
      <Link to="/" className="flex items-center justify-center h-10">
        <img src="/ally_logo.svg" alt="ALLY Logo" className="w-[114px] h-10" />
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center gap-8">
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
      </div>
      
      {/* Right Side Buttons */}
      <div className="flex items-center gap-3">
        {/* Login/Register or User Info Button */}
        <button
          onClick={handleAuthAction}
          className="flex items-center gap-3 px-4 py-1.5 border border-[#2B62C4] rounded-lg hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6">
            {isLoggedIn ? (
              <LogOut className="w-5 h-5 text-[#11265A]" strokeWidth={1.5} />
            ) : (
              <User className="w-5 h-5 text-[#11265A]" strokeWidth={1.5} />
            )}
          </div>
          <span className="text-[#11265A] text-xl font-semibold">
            {isLoggedIn ? 'Logout' : 'Login / Register'}
          </span>
        </button>
        
        {/* Get Legal Help Button */}
        <button
          onClick={handleGetLegalHelp}
          className="px-4 py-1.5 bg-[#1A6EFF] text-white text-xl font-semibold rounded-lg border border-[#1A6EFF] hover:bg-blue-700 transition-colors"
        >
          Get Legal Help
        </button>
      </div>
    </nav>
  );
};

export default NavigationBar;