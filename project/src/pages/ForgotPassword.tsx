import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Chrome } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';
import buildingImage from '../public/images/background-login.png';

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

  // Placeholder for Google Sign-In
  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In not implemented yet.');
    // Add Google OAuth logic here if needed
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-teal-50">
      {/* Left: Building Image */}
      <div
        className="w-full md:w-1/2 hidden md:block"
        style={{
          backgroundImage: `url(${buildingImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Right: Forgot Password Form with Angled Edges */}
      <div
        className="w-full md:w-1/2 bg-white bg-opacity-50 flex flex-col justify-center items-center px-8 py-20 relative overflow-hidden"
        style={{
          clipPath: 'polygon(0 0, calc(100% - 60px) 0, 100% 60px, 100% calc(100% - 60px), calc(100% - 60px) 100%, 0 100%)',
        }}
      >
        {/* Brand Title */}
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-dark to-teal-medium text-transparent bg-clip-text mb-6">
          Kazi Hub
        </h1>

        {/* Toggle: Login/Signup */}
        <div className="mb-6 flex space-x-2">
          <Link
            to="/login"
            className="px-4 py-2 bg-teal-medium text-white rounded-full shadow hover:bg-teal-bright transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
          >
            Sign up
          </Link>
        </div>

        {/* Forgot Password Form */}
        <form className="w-full max-w-sm space-y-4 z-10" onSubmit={handleSubmit}>
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
              Reset Your Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email to receive password reset instructions
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-medium hover:text-teal-bright transition"
              >
                Sign in
              </Link>
            </p>
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              id="email"
              name="email"
              type="email"
              required
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 bg-gradient-to-r from-teal-dark to-teal-medium text-white font-semibold rounded-lg shadow transition-all duration-200 ${
              isLoading
                ? 'opacity-75 cursor-not-allowed'
                : 'hover:from-teal-medium hover:to-teal-bright'
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
        </form>

        {/* Gmail Sign-In */}
        <div className="mt-6 flex items-center space-x-4">
          <p className="text-sm text-gray-400">Sign in with</p>
          <button
            className="p-2 rounded-lg bg-white border border-teal-light hover:border-teal-medium transition"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Chrome className="h-5 w-5 text-teal-medium" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;