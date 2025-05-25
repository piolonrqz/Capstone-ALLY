import React from 'react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-2xl p-8 bg-gray-200 rounded-lg shadow-lg border">
        <h2 className="text-2xl font-bold text-center mb-1">Log in To ALLY</h2>
        <p className="text-center text-gray-600 mb-6">Enter your credentials to access your account</p>

        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-sm text-blue-500 hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              placeholder="********"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
          >
            Log in
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
        </p>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="mx-3 text-sm text-gray-500">OR CONTINUE WITH</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="flex space-x-4">
          <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            Google
          </button>
          <button className="w-full py-2 border border-gray-300 rounded-md hover:bg-gray-100">
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
