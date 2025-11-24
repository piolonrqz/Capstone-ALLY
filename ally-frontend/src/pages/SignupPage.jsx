import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useSearchParams } from 'react-router-dom';
import { Handshake, Scale } from 'lucide-react';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchParams] = useSearchParams();
  const oemail = searchParams.get("email");
  const fname = searchParams.get("fname");
  const lname = searchParams.get("lname");
  localStorage.setItem('email', oemail || '');
  localStorage.setItem('fName', fname || '');
  localStorage.setItem('lName', lname || ''); 

  return (   
    <div className="flex items-center justify-center min-h-screen font-['Poppins'] relative p-4">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div onClick={() => navigate('/')} className="cursor-pointer">
              <img src="/ally_logo.svg" alt="ALLY" className="w-28 h-10" />
            </div>
            
            {/* Navigation Links */}
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
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full max-w-4xl p-6 mt-16 bg-white border rounded-lg shadow-lg sm:p-8 md:p-10 sm:mt-0">
        <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-center font-['Poppins']">Join <span className="text-blue-600">ALLY</span></h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-center text-gray-600 font-['Poppins']">Choose how you want to use our platform</p>

        <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
          {/* Client Option */}
          <div 
            className={`bg-white border rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedOption === 'client' 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:border-blue-200'
            }`}
            onClick={() => setSelectedOption('client')}
          >
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto sm:w-20 sm:h-20">
                <img src="/legal.png" alt="Legal Help" className="object-contain w-full h-full" />
              </div>
            </div>          
            <h2 className="mb-2 text-xl font-semibold sm:text-2xl text-gray-800">I Need Legal Help</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Sign up as a client to find and connect with qualified legal professionals.
            </p>          
            <button 
              onClick={() => navigate('/signup/client')}
              className="w-full px-4 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-md sm:py-3 sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register as a Client
            </button>
          </div>

          {/* Lawyer Option */}
          <div 
            className={`bg-white border rounded-xl p-6 text-center cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedOption === 'lawyer' 
                ? 'ring-2 ring-blue-500 shadow-lg' 
                : 'hover:border-blue-200'
            }`}
            onClick={() => setSelectedOption('lawyer')}
          >
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto sm:w-20 sm:h-20">
                <img src="/pro.png" alt="Legal Professional" className="object-contain w-full h-full" />
              </div>
            </div>
            <h2 className="mb-2 text-xl font-semibold sm:text-2xl text-gray-800">I'm a Legal Professional</h2>
            <p className="mb-6 text-sm leading-relaxed text-gray-600">
              Sign up as a lawyer to grow your practice and connect with potential clients.
            </p>
            <button 
              onClick={() => navigate('/signup/lawyer')}
              className="w-full px-4 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-md sm:py-3 sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register as a Lawyer
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-gray-600">Already have an account?</p>
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-blue-500 font-medium hover:text-blue-700 hover:underline"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;