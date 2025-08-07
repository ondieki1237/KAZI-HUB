import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Key } from 'lucide-react';
import { auth } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { isAuthenticated, setUser, setIsAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
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
      // Redirect to /admin for admin user, otherwise /home
      if (user.email === 'admin@gmail.com') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (error) {
      toast.error('Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-teal-100">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 bg-gradient-to-r from-teal-dark to-teal-medium bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-teal-dark hover:text-teal-medium transition-colors duration-200"
            >
              Create one now
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
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
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-teal-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-3 pl-10 border border-teal-200 placeholder-gray-400 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-medium focus:border-teal-medium transition-all duration-200 hover:border-teal-300"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-teal-dark hover:text-teal-medium transition-colors duration-200 flex items-center gap-1"
            >
              <Key className="h-4 w-4" />
              Forgot password?
            </Link>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-dark to-teal-medium hover:from-teal-medium hover:to-teal-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium transition-all duration-200 transform hover:scale-[1.02]"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;