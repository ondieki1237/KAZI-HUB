import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobs } from '../services/api';
import type { Job } from '../types';

const SeeMyPostedJobs: React.FC = () => {
  const navigate = useNavigate();
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostedJobs = async () => {
      try {
        setLoading(true);
        const response = await jobs.getMyPostedJobs();
        setPostedJobs(response);
      } catch (error) {
        console.error('Error fetching posted jobs:', error);
        toast.error('Failed to fetch your posted jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchPostedJobs();

    // Set up polling to refresh job data
    const interval = setInterval(fetchPostedJobs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleViewApplications = (jobId: string) => {
    navigate(`/jobs/${jobId}/applications`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">My Posted Jobs</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
          </div>
        ) : postedJobs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            You haven't posted any jobs yet.
          </div>
        ) : (
          <div className="space-y-6">
            {postedJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                {/* Job Title and Category */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-xl">{job.title}</h3>
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full mt-2 inline-block">
                      {job.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      Applications: <span className="font-semibold">{job.applications?.length || 0}</span>
                    </div>
                    <button
                      onClick={() => handleViewApplications(job._id)}
                      className="mt-2 text-teal-dark hover:text-teal-medium text-sm font-medium"
                    >
                      View Applications
                    </button>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    {/* Location */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{`${job.locationArea}, ${job.locationCity}`}</span>
                    </div>

                    {/* Budget */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <DollarSign className="h-4 w-4 mr-2" />
                      <span>KES {job.budget.toLocaleString()}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{job.duration}</span>
                    </div>
                  </div>

                  <div>
                    {/* Recent Applications */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Recent Applications:</h4>
                      {job.applications && job.applications.length > 0 ? (
                        <ul className="space-y-2">
                          {job.applications.slice(0, 3).map((application) => (
                            <li key={application._id} className="flex items-center text-gray-600">
                              <User className="h-4 w-4 mr-2" />
                              <span>{application.worker?.name || 'Anonymous'}</span>
                              <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                {application.status}
                              </span>
                            </li>
                          ))}
                          {job.applications.length > 3 && (
                            <li className="text-sm text-teal-dark">
                              +{job.applications.length - 3} more applications
                            </li>
                          )}
                        </ul>
                      ) : (
                        <p className="text-gray-500 text-sm">No applications yet</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills Required */}
                <div className="mt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Skills Required:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SeeMyPostedJobs;