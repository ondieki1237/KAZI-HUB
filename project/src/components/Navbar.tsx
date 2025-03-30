import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';

const Navbar = () => {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count
  useEffect(() => {
    if (isAuthenticated) {
      const fetchUnreadCount = async () => {
        try {
          const conversations = await chat.getConversations();
          if (Array.isArray(conversations)) {
            const total = conversations.reduce((acc, conv) => acc + (conv.unreadCount || 0), 0);
            setUnreadCount(total);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.png" alt="Logo" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link 
                  to="/conversations" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-teal-600 transition-colors relative"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/profile" 
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-teal-600 transition-colors"
                >
                  <User className="h-5 w-5 mr-2" />
                  Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 