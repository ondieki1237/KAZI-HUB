import React, { useEffect, useState } from 'react';
import { Search, Briefcase, MessageSquare, Bell, MapPin, DollarSign, Clock, Flame } from 'lucide-react';
import Menu from '../components/Menu'; // Import the Menu component
import JobCategories from '../components/JobCategories';
import { useNavigate } from 'react-router-dom';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const isAuthenticated = !!user._id;
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser({});
    toast.success('Logged out successfully');
    navigate('/login');
  };

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await jobs.getFeatured();
        console.log('Featured jobs:', response); // Debug log
        setFeaturedJobs(response);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        toast.error('Failed to load featured jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  // Function to handle View All click
  const handleViewAllJobs = () => {
    navigate('/jobs');
  };

  const handleChatClick = () => {
    if (isAuthenticated) {
      navigate('/messages');
    } else {
      toast.error('Please login to access chats');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white">
        <div className="container mx-auto px-4 py-4">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Menu onLogout={handleLogout} />
              <h1 className="text-2xl font-bold">BlueCollar</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Bell className="h-6 w-6 cursor-pointer" />
                  <MessageSquare className="h-6 w-6 cursor-pointer" />
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

          {/* CV Maker Button - New Feature */}
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

          {/* Search Bar */}
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Categories</h2>
            <button
              onClick={handleViewAllJobs}
              className="text-teal-dark hover:text-teal-medium"
            >
              View All
            </button>
          </div>
          <JobCategories />
        </section>

        {/* Featured Jobs */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Featured Jobs</h2>
            <button
              onClick={handleViewAllJobs}
              className="text-teal-dark hover:text-teal-medium"
            >
              View All
            </button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
            </div>
          ) : featuredJobs.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No featured jobs available at the moment
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
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-around py-3">
            <button
              onClick={() => navigate('/jobs')}
              className="flex flex-col items-center text-teal-dark"
            >
              <Briefcase className="h-6 w-6" />
              <span className="text-xs mt-1">Jobs</span>
            </button>
            <button 
              onClick={handleChatClick}
              className="flex flex-col items-center text-gray-400 hover:text-teal-dark"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="text-xs mt-1">Chats</span>
            </button>
            <button className="flex flex-col items-center text-gray-400">
              <Bell className="h-6 w-6" />
              <span className="text-xs mt-1">Notifications</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Home;