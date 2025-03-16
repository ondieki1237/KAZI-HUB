import React, { useEffect, useState } from 'react';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';

function FeaturedJobs() {
  const [allJobs, setAllJobs] = useState<Job[]>([]); // Store all fetched jobs
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]); // Displayed jobs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sliceLimit = 10; // Show 10 jobs

  // Fetch all featured jobs once
  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        setLoading(true);
        const response = await jobs.getFeatured();
        console.log('Featured jobs response:', response);

        const jobsData = Array.isArray(response) ? response : response.data || [];
        console.log('Processed jobs data:', jobsData);

        if (!jobsData.length) {
          console.warn('No jobs found in response');
          setAllJobs([]);
          setFeaturedJobs([]);
        } else {
          setAllJobs(jobsData); // Store all jobs
          // Immediately set featured jobs with the correct slice
          setFeaturedJobs(jobsData.slice(0, sliceLimit));
        }
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
  }, []); // Run once on mount

  // Update displayed jobs when allJobs changes
  useEffect(() => {
    if (allJobs.length > 0) {
      const slicedJobs = allJobs.slice(0, sliceLimit);
      console.log('Sliced jobs for display:', slicedJobs);
      setFeaturedJobs(slicedJobs);
    }
  }, [allJobs]); // Remove sliceLimit from dependencies since it's now a constant

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

  if (featuredJobs.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        No featured jobs available at the moment
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredJobs.map((job) => (
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
                <span>{job.location}</span>
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
  );
}

export default FeaturedJobs;