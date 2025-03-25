import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, Banknote, Clock, User, MessageSquare, Trash2, Calendar } from 'lucide-react'; // No Home icon needed
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

  const handleContactEmployee = (jobId: string, workerId: string) => {
    navigate(`/chat/${jobId}/${workerId}`);
  };

  const handleHomeClick = () => {
    navigate('/'); // Redirects to homepage
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      await jobs.deleteJob(jobId);
      setPostedJobs(prev => prev.filter(job => job._id !== jobId));
      toast.success('Job deleted successfully');
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleExtendExpiration = async (jobId: string) => {
    const newDate = prompt('Enter new expiration date (YYYY-MM-DD HH:mm):');
    if (!newDate) return;

    try {
      await jobs.updateExpirationDate(jobId, newDate);
      setPostedJobs(prev => prev.map(job => 
        job._id === jobId 
          ? { ...job, expirationDate: newDate }
          : job
      ));
      toast.success('Job expiration date updated successfully');
    } catch (error) {
      console.error('Error updating expiration date:', error);
      toast.error('Failed to update expiration date');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Posted Jobs</h1>
          <div className="flex justify-end">
            <button
              onClick={handleHomeClick}
              className="bg-teal-dark text-white py-2 px-4 rounded-md hover:bg-teal-medium"
            >
              Home
            </button>
          </div>
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
                {/* Job Title and Actions */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 text-xl">{job.title}</h3>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                        {job.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        new Date(job.expirationDate) > new Date()
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {new Date(job.expirationDate) > new Date()
                          ? 'Active'
                          : 'Expired'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleDeleteJob(job._id)}
                      className="p-2 text-red-500 hover:text-red-700"
                      title="Delete Job"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewApplications(job._id)}
                      className="text-teal-dark hover:text-teal-medium text-sm font-medium"
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
                      <Banknote className="h-4 w-4 mr-2" />
                      <span>Budget (Ksh) {job.budget.toLocaleString()}</span>
                    </div>

                    {/* Duration */}
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{job.duration}</span>
                    </div>

                    {/* Expiration Date */}
                    <div className="flex items-center text-gray-600 mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Expires: {job.expirationDate ? new Date(job.expirationDate).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Not set'}</span>
                    </div>
                    
                    {/* Extend Expiration Button */}
                    {job.expirationDate && new Date(job.expirationDate) <= new Date() && (
                      <button
                        onClick={() => handleExtendExpiration(job._id)}
                        className="text-teal-600 hover:text-teal-700 text-sm font-medium"
                      >
                        Extend Expiration
                      </button>
                    )}
                  </div>

                  <div>
                    {/* Recent Applications */}
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Recent Applications:</h4>
                      {job.applications && job.applications.length > 0 ? (
                        <ul className="space-y-2">
                          {job.applications.slice(0, 3).map((application) => (
                            <li key={application._id} className="flex items-center justify-between text-gray-600">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-2" />
                                <span>{application.worker?.name || 'Anonymous'}</span>
                                <span className="ml-2 text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                  {application.status}
                                </span>
                              </div>
                              {application.status === 'accepted' && (
                                <button
                                  onClick={() => handleContactEmployee(job._id, application.worker._id)}
                                  className="flex items-center text-sm text-teal-600 hover:text-teal-700"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Contact
                                </button>
                              )}
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