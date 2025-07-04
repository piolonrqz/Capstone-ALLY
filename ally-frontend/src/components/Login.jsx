import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';

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
      {/* Logo in upper left corner */}
      <div className="absolute flex items-center gap-2 top-4 left-4 md:left-8">
        <img src="/small_logo.png" alt="ALLY Logo" className="w-8 h-8 sm:w-12 sm:h-12" />
        <h1 className="text-2xl font-bold text-blue-600 sm:text-4xl">ALLY</h1>
      </div>
      
      <div className="w-full max-w-md p-4 mt-16 bg-white border rounded-lg shadow-lg sm:max-w-lg md:max-w-2xl sm:p-6 md:p-8 sm:mt-0">
        <h2 className="mb-1 text-2xl sm:text-3xl md:text-4xl font-semibold text-center font-['Poppins']">Log in To ALLY</h2>
        <p className="mb-4 sm:mb-6 text-sm sm:text-base text-center text-gray-600 font-['Poppins']">Enter your credentials to access your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm sm:px-4 sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-blue-500 sm:text-sm hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="block w-full px-3 py-2 mt-1 text-sm border border-gray-300 rounded-md shadow-sm sm:px-4 sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="block ml-2 text-xs text-gray-900 sm:text-sm">
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

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600 sm:text-sm">
            Don't have an account? 
          </p>
          <div className="mt-2 space-y-2 sm:space-y-0 sm:space-x-4">
            <button
              onClick={() => navigate('/signup/client')}
              className="block w-full text-sm text-blue-500 sm:inline sm:w-auto hover:underline"
            >
              Register as Client
            </button>
            <span className="hidden text-gray-500 sm:inline">or</span>
            <button
              onClick={() => navigate('/signup/lawyer')}
              className="block w-full text-sm text-blue-500 sm:inline sm:w-auto hover:underline"
            >
              Register as Lawyer
            </button>
          </div>
        </div>

        <div className="flex items-center my-4 sm:my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-xs text-gray-500 sm:text-sm">OR CONTINUE WITH</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex space-x-4">
          <button className="block w-full py-2 text-sm transition border border-gray-300 rounded-md sm:text-base hover:bg-gray-50"
          onClick={() => {
          window.location.href = 'http://localhost:8080/oauth2/authorization/google';
          }}>
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
