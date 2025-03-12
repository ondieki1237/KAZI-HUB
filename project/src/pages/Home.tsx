import React, { useEffect, useState } from 'react';
import { Search, Briefcase, MessageSquare, Bell, MapPin, DollarSign, Clock, Flame } from 'lucide-react';
import Menu from '../components/Menu';
import { useNavigate } from 'react-router-dom';
import { jobs, chat } from '../services/api';
import { Job, Message } from '../types';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import MessageNotification from '../components/MessageNotification';
import io from 'socket.io-client';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [unreadMessages, setUnreadMessages] = useState<Message[]>([]);
  const [socket, setSocket] = useState<any>(null);

  const jobCategories = {
    'All': [],
    'Electrical': ['electric', 'wiring', 'circuit', 'lighting', 'power'],
    'Plumbing': ['plumb', 'pipe', 'water', 'drain', 'leak'],
    'Carpentry': ['carpenter', 'wood', 'furniture', 'cabinet', 'frame'],
    'Painting': ['paint', 'color', 'wall', 'finish', 'coat'],
    'Gardening': ['garden', 'landscape', 'plant', 'lawn', 'tree']
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);
      fetchUnreadMessages();
      return () => newSocket.close();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.on('new_message', (message: Message) => {
        if (message.recipientId._id === user.id && !message.read) {
          setUnreadMessages(prev => [...prev, message]);
          new Audio('/notification.mp3').play().catch(console.error);
        }
      });
      return () => socket.off('new_message');
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
  }, [selectedCategory]);

  const handleCategoryClick = (category: string) => setSelectedCategory(category);
  const handleViewAllJobs = () => navigate('/jobs');
  const handleChatClick = () => {
    if (isAuthenticated) navigate('/messages');
    else {
      toast.error('Please login to access chats');
      navigate('/login');
    }
  };

  return (
    <div id="main-content" className="min-h-screen bg-gray-50 transition-all duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-500 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Menu onLogout={handleLogout} />
              <h1 className="text-3xl font-bold tracking-tight">BlueCollar</h1>
            </div>
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <>
                  <Bell className="h-6 w-6 cursor-pointer hover:text-teal-200 transition-colors" />
                  <MessageSquare
                    className="h-6 w-6 cursor-pointer hover:text-teal-200 transition-colors"
                    onClick={handleChatClick}
                  />
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-teal-700 px-4 py-2 rounded-full font-medium hover:bg-teal-50 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/cv-maker')}
              className="inline-flex items-center space-x-3 bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg shadow-md transform transition-all hover:scale-105"
            >
              <Flame className="h-6 w-6 animate-pulse text-yellow-200" />
              <span className="text-lg font-semibold">Create Your Professional CV Now!</span>
              <Flame className="h-6 w-6 animate-pulse text-yellow-200" />
            </button>
          </div>
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-lg shadow-sm px-4 py-3 border border-gray-200">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services in your area..."
                className="w-full ml-3 outline-none text-gray-700 text-lg"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Categories */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.keys(jobCategories).map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`px-6 py-3 rounded-full text-lg font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {selectedCategory === 'All' ? 'Featured Jobs' : `${selectedCategory} Jobs`}
            </h2>
            <button
              onClick={handleViewAllJobs}
              className="text-teal-600 hover:text-teal-700 font-medium text-lg"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">
                No {selectedCategory === 'All' ? 'featured' : selectedCategory.toLowerCase()} jobs available at the moment
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all cursor-pointer border border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-xl text-gray-800 hover:text-teal-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex items-center text-gray-500 text-sm mt-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.locationArea}, {job.locationCity}</span>
                      </div>
                    </div>
                    {job.status === 'open' && (
                      <span className="px-3 py-1 bg-green-100 text-green-600 text-sm rounded-full font-medium">
                        Open
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center text-teal-700">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span className="font-semibold text-lg">KES {job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Skills Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => navigate('/post-skill')}
              className="flex items-center justify-between bg-teal-600 text-white py-6 px-8 rounded-lg shadow-md hover:bg-teal-700 transition-all group"
            >
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Post Your Skills</h3>
                <p className="text-teal-100 text-base">Share your expertise</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 group-hover:translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => navigate('/find-skill')}
              className="flex items-center justify-between bg-white text-teal-600 py-6 px-8 rounded-lg border-2 border-teal-600 hover:bg-teal-50 transition-all group shadow-md"
            >
              <div className="text-left">
                <h3 className="text-xl font-semibold mb-2">Find Skilled Workers</h3>
                <p className="text-teal-600 text-base">Discover talent near you</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 group-hover:translate-x-2 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Message Notification */}
      <div className="fixed top-6 right-6 z-50">
        <MessageNotification unreadMessages={unreadMessages} onClose={handleMessageClose} />
      </div>
    </div>
  );
}

export default Home;