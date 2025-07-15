import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LawyerDirectoryNav = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

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
            ) : (
              <div className="flex items-center">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LawyerDirectoryNav; 