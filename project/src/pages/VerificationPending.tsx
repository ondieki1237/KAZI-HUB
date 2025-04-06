import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

function VerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const email = location.state?.email;

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Email information is missing');
      return;
    }

    setIsLoading(true);
    try {
      await auth.verifyEmail(email, verificationCode);
      toast.success('Email verified successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        'Failed to verify email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email information is missing');
      return;
    }

    try {
      await auth.resendVerification(email);
      toast.success('New verification code sent to your email');
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 
        'Failed to resend verification code'
      );
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Invalid Access</h2>
          <p className="mt-2 text-gray-600">Please complete registration first.</p>
          <button
            onClick={() => navigate('/register')}
            className="mt-4 text-teal-600 hover:text-teal-700"
          >
            Go to Registration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-teal-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-teal-500 mb-4">
            <Mail size={48} />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a verification code to {email}.<br />
            Please check your email and enter the code below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerification}>
          <div>
            <label htmlFor="code" className="sr-only">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-3 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium text-center text-lg tracking-widest"
              placeholder="Enter 6-digit code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              maxLength={6}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || verificationCode.length !== 6}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-dark to-teal-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium ${
                isLoading || verificationCode.length !== 6
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:from-teal-medium hover:to-teal-light'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center">
                  Verify Email <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              Didn't receive the code? Click to resend
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerificationPending; 