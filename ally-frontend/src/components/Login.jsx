import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import { Shield, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8080/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      localStorage.setItem('token', data.token); 
      localStorage.setItem('role', data.accountType);
      localStorage.setItem('profilePhoto', data.profilePhoto);
      localStorage.setItem('userId', data.id);
      console.log('Login successful:', data);

      
      // If user is admin, fetch department information
      if (data.accountType === 'ADMIN') {
        try {
          const adminResponse = await fetch(`http://localhost:8080/admins/${data.id}`, {
            headers: {
              Authorization: `Bearer ${data.token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (adminResponse.ok) {
            const adminData = await adminResponse.json();
            localStorage.setItem('department', adminData.department);
            navigate('/admin', { replace: true });
            return;
          }
        } catch (error) {
          console.error('Error fetching admin details:', error);
        }
      }

      // For non-admin users or admins without ADMIN department
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

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
      
      <div className="w-full max-w-md p-6 mt-16 bg-white border rounded-lg shadow-lg sm:max-w-lg md:max-w-2xl sm:p-8 md:p-10 sm:mt-0">
        <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-center text-[#11265A] font-['Poppins']">Log in To ALLY</h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-center text-gray-450 font-['Poppins']">Enter your credentials to access your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="block w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm text-blue-500 hover:text-blue-700 hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm sm:px-4 sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="remember" className="block ml-2 text-sm text-gray-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-semibold text-white transition bg-blue-600 rounded-md sm:py-3 sm:text-base hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm text-gray-600">
              Don't have an account?
            </p>
            <button
              onClick={() => navigate('/signup')}
              className="text-sm text-blue-500 font-medium hover:text-blue-700 hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-4 text-sm text-gray-500">OR CONTINUE WITH</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <button 
          className="flex items-center justify-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-300 rounded-md sm:text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            window.location.href = 'http://localhost:8080/oauth2/authorization/google';
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </g>
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default Login;