import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

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
      console.log('Login response:', data);
      console.log('Login successful:', data);

      
      alert('Login successful!');
       if (data.accountType === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/'); 
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your credentials.');
    }
  };  return (    
    <div className="flex items-center justify-center min-h-screen bg-blue-50 font-['Poppins'] relative">
      {/* Logo in upper left corner */}      <div className="absolute flex items-center gap-2 top-4 left-4">
        <img src="/small_logo.png" alt="ALLY Logo" className="w-12 h-12" />
        <h1 className="text-4xl font-bold text-blue-600">ALLY</h1>
      </div>
      
      <div className="w-full max-w-2xl p-8 bg-white border rounded-lg shadow-lg">
        <h2 className="mb-1 text-4xl font-semibold text-center font-['Poppins']">Log in To ALLY</h2>
        <p className="mb-6 text-center text-gray-600 font-['Poppins']">Enter your credentials to access your account</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className="block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              className="block w-full px-4 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="block ml-2 text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-semibold text-white transition bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Log in
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? 
          </p>
          <div className="mt-2 space-x-4">
            <button
              onClick={() => navigate('/signup/client')}
              className="text-sm text-blue-500 hover:underline"
            >
              Register as Client
            </button>
            <span className="text-gray-500">or</span>
            <button
              onClick={() => navigate('/signup/lawyer')}
              className="text-sm text-blue-500 hover:underline"
            >
              Register as Lawyer
            </button>
          </div>
        </div>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-sm text-gray-500">OR CONTINUE WITH</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex space-x-4">
          <button className="block w-1/2 py-2 mx-auto hover:bg-gray-100">
            Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
