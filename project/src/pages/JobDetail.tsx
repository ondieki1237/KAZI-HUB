import React, { useEffect, useState } from 'react';
import {
  useParams,
  useNavigate,
} from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
  Bookmark,
  MessageSquare,
} from 'lucide-react';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    console.log('Current auth state:', { 
      isLoggedIn: !!user, 
      user,
      token: localStorage.getItem('token')
    });
  }, [user]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!jobId) {
          throw new Error('Invalid job ID');
        }
        console.log('Fetching job details for ID:', jobId); // Debug log
        const response = await jobs.getById(jobId);
        if (!response || !response._id) {
          throw new Error('Invalid job data received');
        }
        setJob(response);
      } catch (error: any) {
        console.error('Error fetching job details:', error);
        const errorMessage =
          error.response?.data?.message || error.message || 'Failed to load job details';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  useEffect(() => {
    if (user && job) {
      const userApplication = job.applications?.find(
        app => app.workerId === user.id
      );
      setHasApplied(!!userApplication);
      console.log('User application status:', {
        hasApplied: !!userApplication,
        userId: user.id,
        applications: job.applications
      });
    }
  }, [user, job]);

  const handleApply = async () => {
    console.log('Apply clicked, auth state:', {
      user,
      token: localStorage.getItem('token')
    });

    if (!user || !localStorage.getItem('token')) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }

    if (hasApplied) {
      toast.error('You have already applied for this job');
      return;
    }

    try {
      setApplying(true);

      const applicationData = {
        message: `I am interested in this job opportunity.`,
        coverLetter: `Application from ${user.email}`
      };

      const response = await jobs.apply(job!._id, applicationData);
      
      if (response.message === 'Application submitted successfully') {
        setHasApplied(true);
        toast.success('Application submitted successfully!');
        
        // Refresh job details to update application count
        const updatedJob = await jobs.getById(job!._id);
        setJob(updatedJob);
      } else {
        throw new Error('Failed to submit application');
      }
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Loading Job Details" />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Error" />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">{error}</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="px-6 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-medium"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Job Not Found" />
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700">Job Not Found</h2>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 px-4 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-medium"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Job Details" />
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-dark hover:text-teal-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Jobs
          </button>
        </div>

        {/* Job Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-teal-dark to-teal-medium text-white p-6">
            <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{`${job.locationArea}, ${job.locationCity}`}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                <span>KES {job.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{job.duration}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="p-6">
            {/* Status Badge */}
            <div className="mb-6">
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  job.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : job.status === 'in-progress'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
              <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
            </div>

            {/* Required Skills */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired?.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Employer Info */}
            {job.employerId && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-3">Posted by</h2>
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 rounded-full p-3">
                    <User className="h-6 w-6 text-teal-dark" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800">{job.employerId.name}</h3>
                    <p className="text-gray-500 text-sm">{job.employerId.location}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleApply}
                disabled={applying || hasApplied || !user || job?.employerId?._id === user?.id}
                className={`w-full sm:w-auto flex items-center justify-center px-6 py-2 rounded-lg transition-colors ${
                  !user 
                    ? 'bg-gray-400 cursor-not-allowed'
                    : applying 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : hasApplied
                    ? 'bg-green-700 cursor-not-allowed'
                    : job?.employerId?._id === user?.id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
              >
                <Briefcase className="h-5 w-5 mr-2" />
                {!user 
                  ? 'Login to Apply'
                  : applying 
                  ? 'Applying...' 
                  : hasApplied 
                  ? 'Applied' 
                  : 'Apply Now'
                }
              </button>

              {/* Contact button */}
              {user && job?.employerId?._id !== user?.id && (
                <button
                  onClick={() => navigate(`/chat/${job._id}`)}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Employer
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;