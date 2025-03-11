import React, { useEffect, useState } from 'react';
import { Search, Briefcase, MessageSquare, Bell, MapPin, DollarSign, Clock, Flame, Mail, Phone, Facebook, Twitter, Instagram, Linkedin, User } from 'lucide-react';
import Menu from '../components/Menu';
import JobCategories from '../components/JobCategories';
import { useNavigate } from 'react-router-dom';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import MessageNotification from '../components/MessageNotification';
import io from 'socket.io-client';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);

  // Define job categories with keywords
  const jobCategories = {
    'All': [],
    'Electrical': ['electric', 'wiring', 'circuit', 'lighting', 'power'],
    'Plumbing': ['plumb', 'pipe', 'water', 'drain', 'leak'],
    'Carpentry': ['carpenter', 'wood', 'furniture', 'cabinet', 'frame'],
    'Painting': ['paint', 'color', 'wall', 'finish', 'coat'],
    'Gardening': ['garden', 'landscape', 'plant', 'lawn', 'tree']
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      // Connect to socket
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      // Fetch initial unread messages
      fetchUnreadMessages();

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      // Listen for new messages
      socket.on('new_message', (message: Message) => {
        if (message.recipientId._id === user.id && !message.read) {
          setUnreadMessages(prev => [...prev, message]);
          // Play notification sound
          new Audio('/notification.mp3').play().catch(console.error);
        }
      });

      return () => {
        socket.off('new_message');
      };
    }
  }, [socket, user]);

  const fetchUnreadMessages = async () => {
    try {
      const conversations = await chat.getConversations();
      const unread = conversations.reduce((acc: Message[], conv: any) => {
        if (conv.unreadCount > 0) {
          acc.push({
            _id: conv._id,
            jobId: conv.jobId,
            jobTitle: conv.jobTitle,
            senderId: conv.otherUser,
            content: conv.lastMessage,
            createdAt: conv.updatedAt,
            read: false
          });
        }
        return acc;
      }, []);
      setUnreadMessages(unread);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleMessageClose = async (messageId: string) => {
    setUnreadMessages(prev => prev.filter(msg => msg._id !== messageId));
  };

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const response = await jobs.getFeatured(selectedCategory);
        setFeaturedJobs(response);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        toast.error('Failed to load featured jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, [selectedCategory]); // Re-fetch when category changes

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const handleViewAllJobs = () => navigate('/jobs');
  
  const handleChatClick = () => {
    if (isAuthenticated) {
      navigate('/messages');
    } else {
      toast.error('Please login to access chats');
      navigate('/login');
    }
  };

  return (
    <div id="main-content" className="transition-all duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Menu onLogout={handleLogout} />
              <h1 className="text-2xl font-bold">BlueCollar</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Bell className="h-6 w-6 cursor-pointer" />
                  <MessageSquare className="h-6 w-6 cursor-pointer" onClick={handleChatClick} />
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm bg-white text-teal-dark px-3 py-1 rounded-full hover:bg-gray-100"
                >
                  Login
                </button>
              )}
            </div>
          </div>
          <div className="mb-6">
            <button
              onClick={() => navigate('/cv-maker')}
              className="mx-auto max-w-2xl bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg shadow-lg transform transition-all hover:scale-105 flex items-center justify-center space-x-2 group"
            >
              <Flame className="h-5 w-5 animate-pulse text-yellow-200" />
              <span className="text-base font-bold">Create Your Professional CV Now!</span>
              <Flame className="h-5 w-5 animate-pulse text-yellow-200" />
            </button>
          </div>
          <div className="mt-6 mb-4 relative">
            <div className="flex items-center bg-white rounded-lg px-4 py-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services in your area..."
                className="w-full ml-2 outline-none text-gray-800"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Categories */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Categories</h2>
          <div className="flex flex-wrap gap-2">
            {Object.keys(jobCategories).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-4 py-2 rounded-full transition-colors ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedCategory === 'All' ? 'Featured Jobs' : `${selectedCategory} Jobs`}
            </h2>
            <button
              onClick={handleViewAllJobs}
              className="text-teal-600 hover:text-teal-700"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                No {selectedCategory === 'All' ? 'featured' : selectedCategory.toLowerCase()} jobs available at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {featuredJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.locationArea}, {job.locationCity}</span>
                      </div>
                    </div>
                    {job.status === 'open' && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">
                        Open
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center text-teal-dark">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span className="font-semibold">KES {job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skills Section */}
        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/post-skill')}
              className="flex items-center justify-center space-x-2 bg-teal-600 text-white py-4 px-4 rounded-lg hover:bg-teal-700 transition-colors group"
            >
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1">Post Your Skills</h3>
                <p className="text-teal-100 text-sm">Share your expertise</p>
              </div>
              <div className="group-hover:translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
            <button
              onClick={() => navigate('/find-skill')}
              className="flex items-center justify-center space-x-2 bg-white text-teal-600 py-4 px-4 rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-colors group"
            >
              <div className="text-left">
                <h3 className="text-lg font-semibold mb-1">Find Skilled Workers</h3>
                <p className="text-teal-600 text-sm">Discover talent near you</p>
              </div>
              <div className="group-hover:translate-x-1 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Add the MessageNotification component in your header/navbar */}
      <div className="fixed top-4 right-4 z-50">
        <MessageNotification 
          unreadMessages={unreadMessages}
          onClose={handleMessageClose}
        />
      </div>
    </div>
  );
}

export default Home;