import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo';

const VerifyClient = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  // Create refs for each input
  const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

  useEffect(() => {
    if (!email) {
      setTimeout(() => {
        navigate('/signup');
      }, 100);
    }
  }, [email, navigate]);

  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(async () => {
      setIsLoading(false);
      await fetch("http://localhost:8080/verifyClient?token=" + verificationCode, {
        method: "POST"
      });
      alert("Registration successful! Please login.");
      navigate('/login');
    }, 1500);
  };

  const handleResendCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(async () => {
      setIsLoading(false);
      await fetch("http://localhost:8080/resendCodeClient?email=" + email, {
        method: "POST"
      });
    alert('Verification code resent!');
    }, 1500);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-['Poppins'] relative">
      <Logo />
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-md rounded-2xl">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="mt-2 text-gray-600">We've sent a verification code to {maskedEmail}</p>
        </div>
        <div>
          <div className="flex flex-col items-center mb-4">
            <div className="flex justify-start w-[330px] mb-3">
              <label className="text-sm font-medium text-gray-700">
                Verification Code
              </label>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  ref={inputRefs.current[index]}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-xl font-semibold text-center border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={verificationCode[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^[0-9]*$/.test(value)) return;
                    const newCode = verificationCode.split('');
                    newCode[index] = value;
                    setVerificationCode(newCode.join(''));
                    // Auto-focus next input
                    if (value && index < 5) {
                      inputRefs.current[index + 1].current.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace') {
                      if (verificationCode[index]) {
                        // Clear current
                        const newCode = verificationCode.split('');
                        newCode[index] = '';
                        setVerificationCode(newCode.join(''));
                      } else if (index > 0) {
                        // Move to previous
                        inputRefs.current[index - 1].current.focus();
                      }
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
                    setVerificationCode(pastedData);
                    // Focus last filled input
                    if (pastedData.length > 0) {
                      const last = Math.min(pastedData.length - 1, 5);
                      setTimeout(() => {
                        inputRefs.current[last].current.focus();
                      }, 0);
                    }
                  }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              onClick={handleSubmit}
              className="bg-blue-600 text-white py-2 w-[30.6svh] px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-300"
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive a code?{' '}
            <span
              onClick={handleResendCode}
              className="font-medium text-blue-600 cursor-pointer hover:text-blue-800"
            >
              Resend code
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyClient;