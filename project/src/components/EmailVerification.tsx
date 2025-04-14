import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/api';
import { toast } from 'react-hot-toast';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent multiple digits
    if (value && !/^\d+$/.test(value)) return; // Only allow digits

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      await auth.verifyEmail(email, code);
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await auth.resendVerification(email);
      setTimeLeft(300); // Reset timer to 5 minutes
      toast.success('Verification code resent successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Verify your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We sent a verification code to {email}
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex justify-center space-x-2">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-2xl border-2 rounded-lg focus:border-blue-500 focus:ring-blue-500"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>
          <div>
            <button
              onClick={handleVerify}
              disabled={loading || verificationCode.includes('')}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                loading || verificationCode.includes('')
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{' '}
              {timeLeft > 0 ? (
                <span>Resend in {formatTime(timeLeft)}</span>
              ) : (
                <button
                  onClick={handleResendCode}
                  className="text-blue-600 hover:text-blue-500"
                >
                  Resend code
                </button>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 