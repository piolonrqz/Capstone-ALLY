import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  return (   
     <div className="fixed inset-0 flex flex-col items-center h-screen p-6 pt-64 overflow-hidden bg-white">
      <Logo />
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-neutral-900">
          Join <span className="text-blue-600">ALLY</span>
        </h1>
        <p className="text-lg text-neutral-600">Choose how you want to use our platform</p>
      </div>      
      <div className="grid md:grid-cols-2 gap-6 w-full max-w-[1000px] px-4">
        {/* Client Option */}
        <div className={`bg-blue-50 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'client' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-sky-50'
          }`}
          onClick={() => setSelectedOption('client')}
        >          <div className="mb-6">
            <div className="flex items-center justify-center w-20 h-20 mx-auto">
              <img src="/legal.png" alt="Legal Help" className="object-contain w-20 h-20" />
            </div>
          </div>          
          <h2 className="mb-4 text-2xl font-semibold text-neutral-600">I Need Legal Help</h2>
          <p className="mb-6 text-sm leading-relaxed text-neutral-600">
            Sign up as a client to find and connect with qualified legal professionals.
          </p>          
          <button 
            onClick={() => navigate('/signup/client')}
            className="w-full py-3 font-normal text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Register as a Client
          </button>
        </div>

        {/* Lawyer Option */}
        <div className={`bg-blue-50 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'lawyer' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-sky-50'
          }`}
          onClick={() => setSelectedOption('lawyer')}
        >          <div className="mb-6">
            <div className="flex items-center justify-center w-20 h-20 mx-auto">
              <img src="/pro.png" alt="Legal Professional" className="object-contain w-20 h-20" />
            </div>
          </div>          <h2 className="mb-4 text-2xl font-semibold text-neutral-600">I'm a Legal Professional</h2>
          <p className="mb-6 text-sm leading-relaxed text-neutral-600">
            Sign up as a lawyer to grow your practice and connect with potential clients.
          </p>
          <button 
            onClick={() => navigate('/signup/lawyer')}
            className="w-full py-3 font-normal text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700">
            Register as a Lawyer
          </button>
        </div>
      </div>      {/* Login Link */}
      <div className="mt-8 text-center">
        <p className="text-neutral-600">
            Already have an account?{' '}
            <span 
              onClick={() => navigate('/login')} 
              className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
            >
              Login
            </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;