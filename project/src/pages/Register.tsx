import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

declare global {
  interface Window {
    google: any;
  }
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    location: '',
    role: 'worker' as 'worker' | 'employer',
  });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Load Google Sign-In SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
        callback: handleGoogleSignUp,
      });
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Handle Google Sign-Up response
  const handleGoogleSignUp = async (response: any) => {
    setLoading(true);
    try {
      const { credential } = response; // Google ID token
      const profile = JSON.parse(atob(credential.split('.')[1])); // Decode JWT to get user info

      const userData = {
        name: profile.name,
        email: profile.email,
        googleId: profile.sub, // Google user ID
        role: formData.role, // Use the role from the form
      };

      // Send Google user data to your backend
      const authResponse = await auth.registerWithGoogle(userData);

      toast.success('Registration successful with Google!');
      navigate('/verify-email', { state: { email: userData.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Google sign-up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger Google Sign-In
  const triggerGoogleSignUp = () => {
    window.google.accounts.id.prompt();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    const phoneRegex = /^\d{10,12}$/;
    if (!phoneRegex.test(formData.phone.replace(/[^0-9]/g, ''))) {
      toast.error('Please enter a valid phone number');
      setLoading(false);
      return;
    }

    try {
      const response = await auth.register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phone,
        location: formData.location,
        role: formData.role,
      });

      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex flex-col">
      <PageHeader title="Create Account" />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-teal-100 space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
              Join BlueCollar
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-teal-dark hover:text-teal-medium transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Google Sign-Up Button */}
          <div>
            <button
              type="button"
              onClick={triggerGoogleSignUp}
              disabled={loading}
              className={`group relative w-full flex justify-center items-center py-2.5 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium ${
                loading ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              <img
                src="https://www.google.com/favicon.ico"
                alt="Google logo"
                className="w-5 h-5 mr-2"
              />
              Sign up with Google
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="relative">
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Full Name"
              />
            </div>

            {/* Username */}
            <div className="relative">
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Username"
              />
            </div>

            {/* Email */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email Address
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Email address"
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <label htmlFor="phone" className="sr-only">
                Phone Number
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Phone number"
              />
            </div>

            {/* Location */}
            <div className="relative">
              <label htmlFor="location" className="sr-only">
                Location
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Location"
              />
            </div>

            {/* Role */}
            <div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
              >
                <option value="worker">Find Work (Worker)</option>
                <option value="employer">Hire Workers (Employer)</option>
              </select>
            </div>

            {/* Password */}
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Password"
              />
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Confirm Password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-dark to-teal-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium ${
                loading
                  ? 'opacity-75 cursor-not-allowed'
                  : 'hover:from-teal-medium hover:to-teal-light'
              }`}
            >
              {loading ? (
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
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Success Pop-up */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-teal-100 transform transition-all duration-500 ease-out animate-pop-in">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-teal-dark mb-2">
                Sign up successful! 🎉
              </h3>
              <p className="text-lg text-gray-700 mb-4">Welcome to BlueCollar 😊</p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-teal-dark to-teal-medium text-white py-2 px-6 rounded-md hover:from-teal-medium hover:to-teal-light transition-all duration-200"
                onClick={() => setShowSuccessPopup(false)}
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation for Pop-up */}
      <style>{`
        @keyframes popIn {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-pop-in {
          animation: popIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Register;