import React, { useEffect, useState } from 'react';
import { Search, Briefcase, Bell, MapPin, DollarSign, Clock, Flame } from 'lucide-react';
import Menu from '../components/Menu';
import { useNavigate } from 'react-router-dom';
import { jobs, chat } from '../services/api';
import { Job, Message } from '../types';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [notifications, setNotifications] = useState<(Message | { type: 'jobAccepted'; jobId: string; jobTitle: string })[]>([]);
  const [socket, setSocket] = useState<any>(null);  const jobCategories = {
    'All': [],
    'Electrical': ['electric', 'wiring', 'circuit', 'lighting', 'power'],
    'Plumbing': ['plumb', 'pipe', 'water', 'drain', 'leak'],
    'Carpentry': ['carpenter', 'wood', 'furniture', 'cabinet', 'frame'],
    'Painting': ['paint', 'color', 'wall', 'finish', 'coat'],
    'Gardening': ['garden', 'landscape', 'plant', 'lawn', 'tree']
  };  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);
      fetchUnreadMessages();
      return () => newSocket.close();
    }
  }, [user]);  useEffect(() => {
    if (socket && user) {
      socket.on('new_message', (message: Message) => {
        if (message.recipientId._id === user.id && !message.read) {
          setNotifications(prev => [...prev, message]);
          new Audio('/notification.mp3').play().catch(console.error);
        }
      });

  socket.on('application_status_updated', (data: { jobId: string; jobTitle: string; workerId: string; status: 'accepted' | 'rejected' }) => {
    if (data.workerId === user.id && data.status === 'accepted') {
      setNotifications(prev => [...prev, { type: 'jobAccepted', jobId: data.jobId, jobTitle: data.jobTitle }]);
      new Audio('/notification.mp3').play().catch(console.error);
      toast.success(`You've been accepted for ${data.jobTitle}!`);
    }
  });

  return () => {
    socket.off('new_message');
    socket.off('application_status_updated');
  };
}

  }, [socket, user]);  const fetchUnreadMessages = async () => {
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
      setNotifications(prev => [...prev, ...unread]);
    } catch (error) {
      console.error('Error fetching unread messages:', error);
    }
  };  const handleNotificationClose = async (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => (notif as Message)._id !== notificationId));
  };  useEffect(() => {
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
  }, [selectedCategory]);  const handleCategoryClick = (category: string) => setSelectedCategory(category);
  const handleViewAllJobs = () => navigate('/jobs');
  const handleBellClick = () => {
    if (isAuthenticated) navigate('/notifications');
    else {
      toast.error('Please login to view notifications');
      navigate('/login');
    }
  };  return (
    <div id="main-content" className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 transition-all duration-300">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-700 to-teal-500 text-white shadow-lg">
        <div className="w-full px-4 md:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Menu onLogout={handleLogout} />
              <h1 className="text-4xl font-extrabold tracking-tight">BlueCollar</h1>
            </div>
            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <div className="relative">
                  <Bell
                    className="h-7 w-7 cursor-pointer hover:text-teal-200 transition-colors"
                    onClick={handleBellClick}
                  />
                  {notifications.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-white text-teal-700 px-5 py-2 rounded-full font-semibold hover:bg-teal-50 transition-colors shadow-md"
                >
                  Login
                </button>
              )}
            </div>
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/cv-maker')}
              className="inline-flex items-center space-x-3 bg-orange-500 hover:bg-orange-600 text-white py-4 px-8 rounded-xl shadow-lg transform transition-all hover:scale-105"
            >
              <Flame className="h-7 w-7 animate-pulse text-yellow-200" />
              <span className="text-xl font-bold">Create Your Professional CV Now!</span>
              <Flame className="h-7 w-7 animate-pulse text-yellow-200" />
            </button>
          </div>
          <div className="mt-8 max-w-3xl mx-auto">
            <div className="flex items-center bg-white rounded-xl shadow-md px-5 py-4 border border-gray-200 focus-within:ring-2 focus-within:ring-teal-400 transition-all">
              <Search className="h-6 w-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services in your area..."
                className="w-full ml-4 outline-none text-gray-700 text-lg placeholder-gray-500"
              />
            </div>
          </div>
        </div>
      </header>

  {/* Main Content */}
  <main className="w-full px-4 md:px-8 py-12">
    {/* Categories */}
    <section className="mb-12">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {Object.keys(jobCategories).map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-6 py-3 rounded-full text-lg font-semibold transition-all transform hover:scale-105 ${
              selectedCategory === category
                ? 'bg-teal-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-md'
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
                  <DollarSign className="h-6 w-6 mr-2 text-teal-600" />
                  <span className="font-bold text-lg">KES {job.budget.toLocaleString()}</span>
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
  </main>

  <Footer />

  {/* Notification Panel */}
  <div className="fixed top-6 right-6 z-50">
    {notifications.map((notification, index) => (
      <div
        key={index}
        className="bg-white rounded-xl shadow-xl p-4 mb-3 border border-gray-200 max-w-sm transform transition-all hover:scale-105"
      >
        {'type' in notification && notification.type === 'jobAccepted' ? (
          <div>
            <p className="text-gray-800 font-bold">Job Acceptance</p>
            <p className="text-gray-600">You've been accepted for "{notification.jobTitle}"!</p>
            <button
              onClick={() => navigate(`/jobs/${notification.jobId}`)}
              className="text-teal-600 hover:text-teal-800 text-sm mt-2 font-semibold"
            >
              View Job
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-800 font-bold">New Message</p>
            <p className="text-gray-600">{(notification as Message).content}</p>
            <button
              onClick={() => navigate(`/chat/${(notification as Message).jobId}/${(notification as Message).senderId}`)}
              className="text-teal-600 hover:text-teal-800 text-sm mt-2 font-semibold"
            >
              View Message
            </button>
          </div>
        )}
        <button
          onClick={() => handleNotificationClose((notification as Message)._id || index.toString())}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
    ))}
  </div>
</div>

  );
}export default Home;

