import React, { useEffect, useState } from 'react';
import { Search, Briefcase, Bell, MapPin, Clock, Flame, MessageSquare } from 'lucide-react';
import Menu from '../components/Menu';
import { useNavigate } from 'react-router-dom';
import { jobs, chat } from '../services/api';
import { Job, Message, Notification } from '../types';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

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
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser._id || user._id;
      
      if (!userId) {
        console.error('No valid user ID found');
        return;
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('Invalid user ID format:', userId);
        return;
      }

      const newSocket = io('http://192.168.1.157:5000');
      setSocket(newSocket);
      fetchUnreadMessages();
      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = storedUser._id || user._id;
      
      if (!userId) {
        console.error('No valid user ID found');
        return;
      }

      // Validate MongoDB ObjectId format
      if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('Invalid user ID format:', userId);
        return;
      }

      socket.on('new_message', (message: Message) => {
        if (message.recipientId._id === userId && !message.read) {
          setNotifications(prev => [...prev, {
            type: 'message',
            _id: message._id,
            jobId: message.jobId,
            jobTitle: message.jobTitle,
            content: message.content
          }]);
          new Audio('/notification.mp3').play().catch(console.error);
        }
      });

      socket.on('application_status_updated', (data: { jobId: string; workerId: string; status: 'accepted' | 'rejected' }) => {
        if (data.workerId === userId && data.status === 'accepted') {
          setNotifications(prev => [...prev, {
            type: 'jobAccepted',
            _id: data.jobId,
            jobId: data.jobId,
            jobTitle: data.jobTitle,
            message: `You've been accepted for ${data.jobTitle}!`
          }]);
          new Audio('/notification.mp3').play().catch(console.error);
          toast.success(`You've been accepted for ${data.jobTitle}!`);
        }
      });

      return () => {
        socket.off('new_message');
        socket.off('application_status_updated');
      };
    }
  }, [socket, user]);

  const fetchUnreadMessageCount = async () => {
    try {
      const conversations = await chat.getConversations();
      if (!Array.isArray(conversations)) {
        console.warn('Received non-array conversations:', conversations);
        setUnreadMessageCount(0);
        return;
      }
      const totalUnread = conversations.reduce((acc, conv) => {
        const unreadCount = typeof conv.unreadCount === 'number' ? conv.unreadCount : 0;
        return acc + unreadCount;
      }, 0);
      setUnreadMessageCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      setUnreadMessageCount(0);
    }
  };

  const fetchUnreadMessages = async () => {
    try {
      const conversations = await chat.getConversations();
      if (!Array.isArray(conversations)) {
        console.warn('Received non-array conversations:', conversations);
        setNotifications([]);
        return;
      }
      const unread = conversations.reduce((acc, conv) => {
        if (conv.unreadCount > 0) {
          acc.push({
            type: 'message',
            _id: conv._id || '',
            jobId: conv.jobId || '',
            jobTitle: conv.jobTitle || 'Untitled Job',
            content: conv.lastMessage || ''
          });
        }
        return acc;
      }, []);
      setNotifications(prev => [...prev, ...unread]);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };

  const handleNotificationClose = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
  };

  const fetchJobsByCategory = async (category: string) => {
      try {
        setLoading(true);
      if (category === 'All') {
        const response = await jobs.getAllJobs(1, 10);
        setFeaturedJobs(response.jobs);
      } else {
        const keywords = jobCategories[category as keyof typeof jobCategories];
        const response = await jobs.getAllJobs(1, 100);
        const filteredJobs = response.jobs.filter((job: Job) => {
          const jobText = `${job.title} ${job.description}`.toLowerCase();
          return keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
        });
        setFeaturedJobs(filteredJobs);
      }
      } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchJobsByCategory(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    fetchJobsByCategory(category);
  };

  const handleViewAllJobs = () => navigate('/jobs');
  const handleBellClick = () => {
    if (isAuthenticated) navigate('/notifications');
    else {
      toast.error('Please login to view notifications');
      navigate('/login');
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // Search in jobs
      const jobsResponse = await jobs.getAllJobs(1, 100);
      const filteredJobs = jobsResponse.jobs.filter((job: Job) => {
        const searchText = `${job.title} ${job.description} ${(job.skillsRequired || []).join(' ')}`.toLowerCase();
        return searchText.includes(query.toLowerCase());
      });
      
      setSearchResults(filteredJobs);
    } catch (error) {
      console.error('Error searching:', error);
      toast.error('Failed to search jobs');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    handleSearch(query);
  };

  useEffect(() => {
    if (socket && user) {
      socket.on('new_message', () => {
        fetchUnreadMessageCount();
      });
    }
    fetchUnreadMessageCount();
  }, [socket, user]);

  return (
    <div id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-300">
      {/* Header */}
      <header className="bg-teal-700 text-white shadow-md">
        <div className="hidden md:flex w-full px-6 py-3 items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold tracking-tight hover:text-teal-200 cursor-pointer" onClick={() => navigate('/')}>
              BlueCollar
            </h1>
            <div className="flex items-center bg-white rounded-md px-2 py-1 relative">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search jobs or skills..."
                className="w-40 outline-none text-gray-700 text-sm ml-2 placeholder-gray-500"
              />
              {isSearching && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                </div>
              )}
            </div>
          </div>
            <div className="flex items-center space-x-6">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  navigate('/conversations');
                } else {
                  toast.error('Please login to view messages');
                  navigate('/login');
                }
              }}
              className="text-sm font-medium hover:text-teal-200 transition-colors flex items-center"
            >
              <div className="relative">
                <MessageSquare className="h-5 w-5 mr-1" />
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
                    {unreadMessageCount}
                  </span>
                )}
              </div>
              Messages
            </button>
            <button
              onClick={() => navigate('/cv-maker')}
              className="text-sm font-medium hover:text-teal-200 transition-colors flex items-center"
            >
              <Flame className="h-4 w-4 mr-1 text-orange-400" />
              Create CV
            </button>
            <div className="px-[25px]">
              <Menu onLogout={handleLogout} />
            </div>
                <div className="relative">
                  <Bell
                className="h-5 w-5 cursor-pointer hover:text-teal-200 transition-colors"
                    onClick={handleBellClick}
                  />
                  {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
            {!isAuthenticated && (
                <button
                  onClick={() => navigate('/login')}
                className="bg-teal-600 text-white px-3 py-1 rounded-md font-medium hover:bg-teal-500 transition-colors text-sm"
                >
                  Login
                </button>
              )}
          </div>
        </div>
        {/* Updated Mobile View */}
        <div className="md:hidden w-full px-4 py-4 relative">
          <div className="flex items-center justify-between">
            <div className="px-[25px]">
              <Menu onLogout={handleLogout} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">BlueCollar</h1>
            <div className="flex items-center space-x-4">
              <button
                className="p-1"
                onClick={() => setShowSearch(!showSearch)}
              >
                <Search className="h-6 w-6 cursor-pointer hover:text-teal-200 transition-colors" />
              </button>
            <button
              onClick={() => navigate('/cv-maker')}
                className="flex items-center p-1 space-x-1"
            >
                <Flame className="h-6 w-6 text-orange-400 hover:text-orange-300 transition-colors" />
                <span className="text-sm font-medium hover:text-teal-200">Make CV</span>
            </button>
              <Bell
                className="h-6 w-6 cursor-pointer hover:text-teal-200 transition-colors"
                onClick={handleBellClick}
              />
            </div>
          </div>
          {/* Dropdown Search Bar */}
          {showSearch && (
            <div className="absolute top-16 left-4 right-4 z-50">
              <div className="flex items-center bg-white rounded-md px-3 py-2 shadow-lg relative">
                <Search className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  placeholder="Search jobs or skills..."
                  className="w-full outline-none text-gray-700 text-sm placeholder-gray-500"
                />
                {isSearching && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-4 md:px-8 py-12">
        {/* Search Results */}
        {searchQuery && (
          <section className="mb-12">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Search Results</h2>
            {isSearching ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"></div>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-xl text-gray-800 hover:text-teal-600 transition-colors">
                          {job.title}
                        </h3>
                        <div className="flex items-center text-gray-500 text-sm mt-2">
                          <MapPin className="h-5 w-5 mr-1 text-teal-600" />
                          <span>{job.locationArea}, {job.locationCity}</span>
                        </div>
                </div>
                      {job.status === 'open' && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
                          Open
                        </span>
              )}
            </div>
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center text-teal-700">
                        <span className="font-bold text-lg">Ksh {job.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Clock className="h-5 w-5 mr-2 text-teal-600" />
                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
            )}
          </section>
        )}

        {/* Categories */}
        {!searchQuery && (
          <>
            <section className="mb-12">
              <h2 className="text-2xl font-medium text-gray-900 mb-6">Browse Categories</h2>
              <div className="flex flex-wrap gap-2 md:flex-nowrap">
                {Object.keys(jobCategories).map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-normal transition-all whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-teal-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-teal-300'
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
                <h2 className="text-3xl font-extrabold text-gray-800">
                  {selectedCategory === 'All' ? 'Featured Jobs' : `${selectedCategory} Jobs`}
                </h2>
                <button
                  onClick={handleViewAllJobs}
                  className="text-teal-600 hover:text-teal-800 font-semibold text-lg transition-colors"
                >
                  View All
                </button>
              </div>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-600"></div>
                </div>
              ) : featuredJobs.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-md">
                  <p className="text-gray-500 text-lg">
                    No {selectedCategory === 'All' ? 'featured' : selectedCategory.toLowerCase()} jobs available at the moment
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredJobs.map((job) => (
                    <div
                      key={job._id}
                      onClick={() => navigate(`/jobs/${job._id}`)}
                      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-100"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-xl text-gray-800 hover:text-teal-600 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center text-gray-500 text-sm mt-2">
                            <MapPin className="h-5 w-5 mr-1 text-teal-600" />
                            <span>{job.locationArea}, {job.locationCity}</span>
                          </div>
                        </div>
                        {job.status === 'open' && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-semibold">
                            Open
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center text-teal-700">
                          <span className="font-bold text-lg">Ksh {job.budget.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Clock className="h-5 w-5 mr-2 text-teal-600" />
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
                  className="flex items-center justify-between bg-teal-600 text-white py-6 px-8 rounded-xl shadow-lg hover:bg-teal-700 hover:scale-105 transition-all duration-300 group"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-2">Post Your Skills</h3>
                    <p className="text-teal-100 text-base">Share your expertise</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 group-hover:translate-x-3 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/find-skill')}
                  className="flex items-center justify-between bg-white text-teal-600 py-6 px-8 rounded-xl border-2 border-teal-600 hover:bg-teal-50 hover:scale-105 transition-all duration-300 group shadow-lg"
                >
                  <div className="text-left">
                    <h3 className="text-xl font-bold mb-2">Find Skilled Workers</h3>
                    <p className="text-teal-600 text-base">Discover talent near you</p>
                  </div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-7 w-7 group-hover:translate-x-3 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />

      {/* Notification Panel */}
      <div className="fixed top-6 right-6 z-50">
        {notifications.map((notification, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-xl p-4 mb-3 border border-gray-200 max-w-sm transform transition-all hover:scale-105"
          >
            {notification.type === 'jobAccepted' ? (
              <div>
                <p className="text-gray-800 font-bold">Job Acceptance</p>
                <p className="text-gray-600">{notification.message}</p>
                <button
                  onClick={() => navigate(`/jobs/${notification._id}`)}
                  className="text-teal-600 hover:text-teal-800 text-sm mt-2 font-semibold"
                >
                  View Job
                </button>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 font-bold">New Message</p>
                <p className="text-gray-600">{notification.content}</p>
                <button
                  onClick={() => navigate(`/conversations`)}
                  className="text-teal-600 hover:text-teal-800 text-sm mt-2 font-semibold"
                >
                  View Messages
                </button>
              </div>
            )}
            <button
              onClick={() => handleNotificationClose(notification._id || index.toString())}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;