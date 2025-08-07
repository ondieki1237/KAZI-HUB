import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, MapPin, Chrome } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import buildingImage from '../public/images/background-login.png';

declare global {
  interface Window {
    google: any;
  }
}

const Register: React.FC = () => {
  const { isAuthenticated, setUser, setIsAuthenticated } = useAuth();
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
    if (isAuthenticated) navigate('/home');

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
  }, [isAuthenticated, navigate]);

  // Handle Google Sign-Up response
  const handleGoogleSignUp = async (response: any) => {
    setLoading(true);
    try {
      const { credential } = response;
      const profile = JSON.parse(atob(credential.split('.')[1]));

      const userData = {
        name: profile.name,
        email: profile.email,
        googleId: profile.sub,
        role: formData.role,
      };

      const authResponse = await auth.registerWithGoogle(userData);
      setUser(authResponse.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', authResponse.token);
      localStorage.setItem('user', JSON.stringify(authResponse.user));
      toast.success('Registration successful with Google!');
      setShowSuccessPopup(true);
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
      setUser(response.user);
      setIsAuthenticated(true);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Registration successful! Please verify your email.');
      setShowSuccessPopup(true);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
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

      {/* Right: Register Form with Angled Edges */}
      <div
        className="w-full md:w-1/2 bg-white bg-opacity-50 flex flex-col justify-center items-center px-8 py-12 relative overflow-hidden"
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
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
          >
            Login
          </Link>
          <button className="px-4 py-2 bg-teal-medium text-white rounded-full shadow hover:bg-teal-bright transition">
            Sign up
          </button>
        </div>

        {/* Register Form */}
        <form className="w-full max-w-sm space-y-4 z-10" onSubmit={handleSubmit}>
          {/* Name */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Username */}
          <div className="relative">
            <User className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone number"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          {/* Location */}
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="text"
              name="location"
              placeholder="Location"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>

          {/* Role */}
          <div>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="pl-4 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              required
            >
              <option value="worker">Find Work (Worker)</option>
              <option value="employer">Hire Workers (Employer)</option>
            </select>
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="password"
              name="password"
              placeholder="Confirm Password"
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 bg-gradient-to-r from-teal-dark to-teal-medium text-white font-semibold rounded-lg shadow transition-all duration-200 ${
              loading ? 'opacity-75 cursor-not-allowed' : 'hover:from-teal-medium hover:to-teal-bright'
            }`}
          >
            {loading ? (
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
                Creating Account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Gmail Sign-Up */}
        <div className="mt-6 flex items-center space-x-4">
          <p className="text-sm text-gray-400">Sign up with</p>
          <button
            className="p-2 rounded-lg bg-white border border-teal-light hover:border-teal-medium transition"
            onClick={triggerGoogleSignUp}
            disabled={loading}
          >
            <Chrome className="h-5 w-5 text-teal-medium" />
          </button>
        </div>
      </div>

      {/* Success Pop-up */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-teal-light transform transition-all duration-500 ease-out animate-pop-in">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-teal-dark mb-2">
                Sign up successful! 🎉
              </h3>
              <p className="text-lg text-gray-700 mb-4">Welcome to Kazi Hub 😊</p>
              <Link
                to="/login"
                className="inline-block bg-gradient-to-r from-teal-dark to-teal-medium text-white py-2 px-6 rounded-md hover:from-teal-medium hover:to-teal-bright transition-all duration-200"
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