import React from 'react';
import { Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <footer className="w-full bg-gradient-to-r from-teal-800 to-teal-600 text-white">
      <div className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* About Section */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl md:text-2xl font-bold">About BlueCollar</h3>
            <p className="text-sm md:text-base text-gray-200 leading-relaxed max-w-xs mx-auto">
              BlueCollar connects skilled workers with job opportunities, empowering communities and driving economic growth.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl md:text-2xl font-bold">Quick Links</h3>
            <ul className="space-y-3 flex flex-col items-center">
              <li>
                <button 
                  onClick={() => navigate('/jobs')} 
                  className="text-sm md:text-base text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Find Jobs
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/cv-maker')} 
                  className="text-sm md:text-base text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Create CV
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/login')} 
                  className="text-sm md:text-base text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Login
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/register')} 
                  className="text-sm md:text-base text-gray-200 hover:text-white transition-colors duration-200"
                >
                  Register
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl md:text-2xl font-bold">Contact Us</h3>
            <ul className="space-y-4 flex flex-col items-center">
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm md:text-base text-gray-200 break-all">
                  support@bluecollar.com
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm md:text-base text-gray-200">
                  +254 700 123 456
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="space-y-4 text-center">
            <h3 className="text-xl md:text-2xl font-bold">Follow Us</h3>
            <div className="flex space-x-6 justify-center">
              <a 
                href="https://facebook.com" 
                className="text-gray-200 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6 md:h-7 md:w-7" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-200 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-6 w-6 md:h-7 md:w-7" />
              </a>
              <a 
                href="https://instagram.com" 
                className="text-gray-200 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6 md:h-7 md:w-7" />
              </a>
              <a 
                href="https://linkedin.com" 
                className="text-gray-200 hover:text-white transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-6 w-6 md:h-7 md:w-7" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-teal-700 mt-10 pt-6 text-center">
          <p className="text-sm md:text-base text-gray-200">
            © {new Date().getFullYear()} BlueCollar. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;