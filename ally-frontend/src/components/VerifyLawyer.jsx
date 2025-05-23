import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyLawyer = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      console.log('No email provided, redirecting to registration');
      setTimeout(() => {
        navigate('/signup/lawyer');
      }, 100);
    }
  }, [email, navigate]);
  
  // Display the email that was passed
  const maskedEmail = email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : '';

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate verification process
    setTimeout(() => {
      setIsLoading(false);
      // Handle verification logic here
    }, 1500);
  };

  const handleResendCode = () => {
    // Implement resend code logic
    alert('Verification code resent!');
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-200">        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-600 mt-2">We've sent a verification code to {maskedEmail}</p>
        </div>
          <div>
          <div className="mb-4 flex flex-col items-center">
            <div className="flex justify-start w-[330px] mb-3">
              <label className="text-sm font-medium text-gray-700">
                Verification Code
              </label>
            </div>
            <div className="flex justify-center gap-2">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={verificationCode[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^[0-9]*$/.test(value)) return; // Only allow numbers
                    
                    const newCode = verificationCode.split('');
                    newCode[index] = value;
                    setVerificationCode(newCode.join(''));
                    
                    // Auto-focus next input
                    if (value && index < 5) {
                      const nextInput = e.target.parentElement.nextElementSibling?.querySelector('input');
                      if (nextInput) nextInput.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace
                    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                      const prevInput = e.target.parentElement.previousElementSibling?.querySelector('input');
                      if (prevInput) prevInput.focus();
                    }
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pastedData = e.clipboardData.getData('text').slice(0, 6).replace(/[^0-9]/g, '');
                    setVerificationCode(pastedData);
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
          <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Didn't receive a code?{' '}
            <span
              onClick={handleResendCode}
              className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
            >
              Resend code
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyLawyer;