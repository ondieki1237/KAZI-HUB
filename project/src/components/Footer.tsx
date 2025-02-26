import React from 'react';
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="bg-gradient-to-r from-teal-dark to-teal-medium text-white mt-8">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-bold mb-4">About BlueCollar</h3>
            <p className="text-sm text-gray-200">
              BlueCollar connects skilled workers with job opportunities, empowering communities and driving economic growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/jobs')} className="text-sm text-gray-200 hover:text-white">Find Jobs</button></li>
              <li><button onClick={() => navigate('/cv-maker')} className="text-sm text-gray-200 hover:text-white">Create CV</button></li>
              <li><button onClick={() => navigate('/login')} className="text-sm text-gray-200 hover:text-white">Login</button></li>
              <li><button onClick={() => navigate('/register')} className="text-sm text-gray-200 hover:text-white">Register</button></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm text-gray-200">support@bluecollar.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm text-gray-200">+254 700 123 456</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-xl font-bold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-200 hover:text-white">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" className="text-gray-200 hover:text-white">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" className="text-gray-200 hover:text-white">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://linkedin.com" className="text-gray-200 hover:text-white">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-200">
            &copy; {new Date().getFullYear()} BlueCollar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 