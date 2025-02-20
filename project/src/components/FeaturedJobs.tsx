import React, { useEffect, useState } from 'react';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

function FeaturedJobs() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await jobs.getFeatured();
        console.log('Featured jobs response:', response); // Debug log
        setFeaturedJobs(response.slice(0, 5)); // Only take the first 5 jobs
        setError(null);
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
        setError('Failed to load featured jobs');
        toast.error('Failed to load featured jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        {error}
      </div>
    );
  }

  if (featuredJobs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No featured jobs available at the moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {featuredJobs.map((job) => (
        <div
          key={job._id}
          className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800">{job.title}</h3>
              <div className="flex items-center text-gray-500 text-sm mt-2">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
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
  );
}

export default FeaturedJobs;