import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import { Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50 font-['Poppins'] relative p-4">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
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
        <h2 className="mb-2 text-2xl sm:text-3xl md:text-4xl font-semibold text-center font-['Poppins']">Log in To ALLY</h2>
        <p className="mb-6 sm:mb-8 text-sm sm:text-base text-center text-gray-600 font-['Poppins']">Enter your credentials to access your account</p>

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
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="block w-full px-4 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            />
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
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 transition bg-white border border-gray-300 rounded-md sm:text-base hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          onClick={() => {
            window.location.href = 'http://localhost:8080/oauth2/authorization/google';
          }}
        >
          Google
        </button>
      </div>
    </div>
  );
};

export default Login;
