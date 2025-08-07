import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, Chrome } from 'lucide-react';
import toast from 'react-hot-toast';
import { auth } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import buildingImage from '../public/images/background-login.png';

function Login() {
  const { isAuthenticated, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });

  useEffect(() => {
    if (isAuthenticated) navigate('/home');
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user, token } = await auth.login(formData.email, formData.password);
      setUser(user);
      setIsAuthenticated(true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      toast.success('Login successful!');
      navigate(user.email === 'admin@gmail.com' ? '/admin' : '/home');
    } catch {
      toast.error('Login failed');
    }
  };

  // Placeholder for Google Sign-In (to be implemented)
  const handleGoogleSignIn = () => {
    toast.info('Google Sign-In not implemented yet.');
    // Add Google OAuth logic here
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

      {/* Right: Login Form with Angled Edges */}
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
          <button className="px-4 py-2 bg-teal-medium text-white rounded-full shadow hover:bg-teal-bright transition">
            Login
          </button>
          <Link
            to="/register"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
          >
            Sign up
          </Link>
        </div>

        {/* Login Form */}
        <form className="w-full max-w-sm space-y-4 z-10" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="email"
              placeholder="Username, email address or phone..."
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-teal-medium animate-shake" />
            <input
              type="password"
              placeholder="Enter Password..."
              className="pl-10 pr-4 py-3 w-full rounded-lg border border-teal-light focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-bright"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <Eye className="absolute right-3 top-3 text-teal-medium cursor-pointer animate-shake" />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-teal-dark to-teal-medium text-white font-semibold rounded-lg shadow hover:from-teal-medium hover:to-teal-bright transition-all duration-200"
          >
            Login
          </button>

          {/* Forgot Password */}
          <div className="text-center text-sm text-gray-500 mt-1">
            <Link to="/forgot-password" className="hover:text-teal-medium transition">
              Forgot password?
            </Link>
          </div>
        </form>

        {/* Gmail Login */}
        <div className="mt-6 flex items-center space-x-4">
          <p className="text-sm text-gray-400">Sign in with</p>
          <button
            className="p-2 rounded-lg bg-white border border-teal-light hover:border-teal-medium transition"
            onClick={handleGoogleSignIn}
          >
            <Chrome className="h-5 w-5 text-teal-medium" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;