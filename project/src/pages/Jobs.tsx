import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Search } from 'lucide-react';
import { jobs } from '../services/api';
import toast from 'react-hot-toast';
import type { Job } from '../types';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';
import Menu from '../components/Menu';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const jobsPerPage = 10;

  // Define job categories with keywords
  const jobCategories = {
    'All': [],
    'Electrical': ['electric', 'wiring', 'circuit', 'lighting', 'power'],
    'Plumbing': ['plumb', 'pipe', 'water', 'drain', 'leak'],
    'Carpentry': ['carpenter', 'wood', 'furniture', 'cabinet', 'frame'],
    'Painting': ['paint', 'color', 'wall', 'finish', 'coat'],
    'Gardening': ['garden', 'landscape', 'plant', 'lawn', 'tree']
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (isLoadMore = false) => {
    try {
      setLoading(true);
      const currentPage = isLoadMore ? page : 1;
      const response = await jobs.getAllJobs(currentPage, jobsPerPage);
      
      let filteredJobs = response.jobs;
      
      // Apply category filter if selected
      if (category && category !== 'All') {
        const keywords = jobCategories[category as keyof typeof jobCategories];
        filteredJobs = response.jobs.filter(job => {
          const jobText = `${job.title} ${job.description}`.toLowerCase();
          return keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
        });
      }

      if (isLoadMore) {
        setAllJobs(prev => [...prev, ...filteredJobs]);
      } else {
        setAllJobs(filteredJobs);
      }
      
      setHasMore(response.hasMore);
      if (isLoadMore) {
        setPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearching(true);

    try {
      let response = await jobs.getAllJobs(1, jobsPerPage);
      
      // Filter jobs based on search criteria
      let filteredJobs = response.jobs;

      // Apply category filter
      if (category && category !== 'All') {
        const keywords = jobCategories[category as keyof typeof jobCategories];
        filteredJobs = filteredJobs.filter(job => {
          const jobText = `${job.title} ${job.description}`.toLowerCase();
          return keywords.some(keyword => jobText.includes(keyword.toLowerCase()));
        });
      }

      // Apply search query filter
      if (searchQuery) {
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Apply location filter
      if (location) {
        filteredJobs = filteredJobs.filter(job => 
          `${job.locationArea} ${job.locationCity}`.toLowerCase().includes(location.toLowerCase())
        );
      }

      setAllJobs(filteredJobs);
      setHasMore(false); // Disable load more when searching
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search jobs');
    } finally {
      setSearching(false);
    }
  };

  const handleLoadMore = () => {
    fetchJobs(true);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(e.target.value);
    setPage(1); // Reset page when category changes
    fetchJobs(); // Fetch jobs immediately when category changes
  };

  if (loading && !allJobs.length) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Menu />
        <main className="flex-grow container mx-auto px-4 py-8 mb-16">
          <PageHeader title="Available Jobs" />
          <div className="flex justify-center items-center h-[calc(100vh-200px)]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Menu />
      <main className="flex-grow container mx-auto px-4 py-8 mb-16">
        <PageHeader title="Available Jobs" />
        
        {/* Search Form */}
        <form onSubmit={handleSearch} className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={category}
                onChange={handleCategoryChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
              >
                {Object.keys(jobCategories).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={searching}
            className="mt-4 w-full md:w-auto px-6 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {searching ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Searching...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <Search className="h-5 w-5 mr-2" />
                Search Jobs
              </span>
            )}
          </button>
        </form>

        {/* Jobs List */}
        {searching ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
          </div>
        ) : allJobs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allJobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => navigate(`/jobs/${job._id}`)}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mt-4">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.locationArea}, {job.locationCity}</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm">
                      {job.category || category || 'Uncategorized'}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <div className="flex items-center text-teal-dark">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>KES {job.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{job.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className={`px-6 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Loading...
                    </span>
                  ) : (
                    'Load More Jobs'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Jobs;