import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { useSearchParams } from 'react-router-dom';
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
     <div className="fixed inset-0 flex flex-col items-center min-h-screen p-4 pt-8 overflow-y-auto bg-white sm:p-6 sm:pt-16 md:pt-24">
      <div className="w-16 h-16 sm:w-20 sm:h-20">
        <Logo />
      </div>
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl text-neutral-900">
          Join <span className="text-blue-600">ALLY</span>
        </h1>
        <p className="text-base sm:text-lg text-neutral-600">Choose how you want to use our platform</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-[1000px] px-2 sm:px-4">
        {/* Client Option */}
        <div className={`bg-blue-50 rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'client' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-sky-50'
          }`}
          onClick={() => setSelectedOption('client')}
        >
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto sm:w-20 sm:h-20">
              <img src="/legal.png" alt="Legal Help" className="object-contain w-full h-full" />
            </div>
          </div>          
          <h2 className="mb-2 text-xl font-semibold sm:mb-4 sm:text-2xl text-neutral-600">I Need Legal Help</h2>
          <p className="mb-4 text-sm leading-relaxed sm:mb-6 text-neutral-600">
            Sign up as a client to find and connect with qualified legal professionals.
          </p>          
          <button 
            onClick={() => navigate('/signup/client')}
            className="w-full py-2 text-sm font-normal text-white transition-colors bg-blue-600 rounded-lg sm:py-3 sm:text-base hover:bg-blue-700"
          >
            Register as a Client
          </button>
        </div>

        {/* Lawyer Option */}
        <div className={`bg-blue-50 rounded-xl p-4 sm:p-6 md:p-8 text-center cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl ${
            selectedOption === 'lawyer' 
              ? 'ring-2 ring-blue-500 bg-blue-50' 
              : 'hover:bg-sky-50'
          }`}
          onClick={() => setSelectedOption('lawyer')}
        >
          <div className="mb-4 sm:mb-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto sm:w-20 sm:h-20">
              <img src="/pro.png" alt="Legal Professional" className="object-contain w-full h-full" />
            </div>
          </div>
          <h2 className="mb-2 text-xl font-semibold sm:mb-4 sm:text-2xl text-neutral-600">I'm a Legal Professional</h2>
          <p className="mb-4 text-sm leading-relaxed sm:mb-6 text-neutral-600">
            Sign up as a lawyer to grow your practice and connect with potential clients.
          </p>
          <button 
            onClick={() => navigate('/signup/lawyer')}
            className="w-full py-2 text-sm font-normal text-white transition-colors bg-blue-600 rounded-lg sm:py-3 sm:text-base hover:bg-blue-700">
            Register as a Lawyer
          </button>
        </div>
      </div>

      {/* Login Link */}
      <div className="mt-6 text-center sm:mt-8">
        <p className="text-sm sm:text-base text-neutral-600">
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