import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    try {
      await auth.resetPassword(token, passwords.newPassword);
      toast.success('Password has been reset successfully!');
      // Wait a bit before redirecting to ensure the user sees the success message
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast.error(
        error.response?.data?.message || 
        'Failed to reset password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-teal-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
            Create New Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="relative">
              <label htmlFor="newPassword" className="sr-only">
                New Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Enter new password"
                value={passwords.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Confirm new password"
                value={passwords.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                minLength={6}
              />
            </div>
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
                  Resetting Password...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword; 