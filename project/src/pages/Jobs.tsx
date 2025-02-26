import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, DollarSign, Clock, Search } from 'lucide-react';
import { jobs } from '../services/api';
import toast from 'react-hot-toast';
import type { Job } from '../types';
import PageHeader from '../components/PageHeader';

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [displayedJobsCount, setDisplayedJobsCount] = useState(10); // Track how many jobs are displayed

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await jobs.getFeatured();
      setAllJobs(response); // Ensure this contains all jobs
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
      // Filter jobs based on search criteria
      const filteredJobs = allJobs.filter((job) => {
        const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = category ? job.category === category : true;
        const matchesLocation = location ? 
          (job.locationArea + job.locationCity).toLowerCase().includes(location.toLowerCase()) : 
          true;
        return matchesSearch && matchesCategory && matchesLocation;
      });

      setAllJobs(filteredJobs); // Update the jobs list with filtered results
      setDisplayedJobsCount(10); // Reset displayed jobs count after search
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to search jobs');
    } finally {
      setSearching(false);
    }
  };

  const handleLoadMore = () => {
    setDisplayedJobsCount((prevCount) => prevCount + 5); // Increment displayed jobs by 5
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Available Jobs" />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      </div>
    );
  }

  const jobsToDisplay = allJobs.slice(0, displayedJobsCount); // Slice the jobs to display

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Available Jobs" />
      
      <main className="container mx-auto px-4 py-8">
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
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Carpentry">Carpentry</option>
                <option value="Painting">Painting</option>
                <option value="Gardening">Gardening</option>
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
        ) : jobsToDisplay.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No jobs found matching your criteria</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobsToDisplay.map((job) => (
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
                      {job.category}
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

            {/* "More Jobs" Button */}
            {displayedJobsCount < allJobs.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors"
                >
                  More Jobs
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Jobs;