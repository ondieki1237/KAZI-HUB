import React, { useEffect, useState } from 'react';
import { MapPin, Clock } from 'lucide-react';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

function FeaturedJobs() {
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await jobs.getAllJobs(1, 10); // Fetch exactly 10 jobs
        setDisplayedJobs(response.jobs);
        setError(null);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        setError('Failed to load jobs');
        toast.error('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []); // Run once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">{error}</div>
    );
  }

  if (displayedJobs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No jobs available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayedJobs.map((job) => (
        <div
          key={job._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border border-gray-100"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-xl text-gray-800 hover:text-teal-600 transition-colors">
                {job.title}
              </h3>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <MapPin className="h-4 w-4 mr-2" />
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
              <span className="font-semibold text-lg">Ksh {job.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-2" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default FeaturedJobs;