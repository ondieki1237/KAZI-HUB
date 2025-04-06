import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await auth.requestPasswordReset(email);
      toast.success(
        'Password reset instructions have been sent to your email. Please check your inbox.'
      );
      // Wait a bit before redirecting to ensure the user sees the success message
      setTimeout(() => {
        setEmail('');
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to send reset instructions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-teal-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to receive password reset instructions
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-medium text-teal-dark hover:text-teal-medium transition-colors duration-200"
            >
              Sign in
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="relative">
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-teal-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-dark to-teal-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium ${
                isLoading
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:from-teal-medium hover:to-teal-light'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
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
                  Sending Reset Instructions...
                </span>
              ) : (
                'Send Reset Instructions'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;