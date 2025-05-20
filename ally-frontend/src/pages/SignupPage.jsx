import React, { useState } from 'react';
import { User, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  return (    <div className="h-screen bg-white flex flex-col items-center pt-64 p-6 fixed inset-0 overflow-hidden">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-neutral-900 mb-4">
          Join <span className="text-blue-600">ALLY</span>
        </h1>
        <p className="text-lg text-neutral-600">Choose how you want to use our platform</p>
      </div>      <div className="grid md:grid-cols-2 gap-6 w-full max-w-[1000px] px-4">
        {/* Client Option */}
        <div className={`bg-stone-100 rounded-xl p-6 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'client' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-neutral-200'
          }`}
          onClick={() => setSelectedOption('client')}
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-blue-600" />
            </div>
          </div>          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">I Need Legal Help</h2>
          <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
            Sign up as a client to find and connect with qualified legal professionals.
          </p>          
          <button 
            onClick={() => navigate('/signup/client')}
            className="w-full py-3 rounded-lg font-normal bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Register as a Client
          </button>
        </div>

        {/* Lawyer Option */}
        <div className={`bg-stone-100 rounded-xl p-8 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'lawyer' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-neutral-200'
          }`}
          onClick={() => setSelectedOption('lawyer')}
        >
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-200 rounded-full flex items-center justify-center mx-auto">
              <Briefcase className="w-10 h-10 text-blue-600" />
            </div>
          </div>          <h2 className="text-2xl font-semibold text-neutral-900 mb-4">I'm a Legal Professional</h2>
          <p className="text-neutral-600 mb-6 text-sm leading-relaxed">
            Sign up as a lawyer to grow your practice and connect with potential clients.
          </p>
          <button 
            onClick={() => navigate('/signup/lawyer')}
            className="w-full py-3 rounded-lg font-normal bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            Register as a Lawyer
          </button>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center mt-8">          <p className="text-neutral-600">
            Already have an account?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;