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
import Footer from '../components/Footer';

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    console.log('Current auth state:', { 
      isLoggedIn: !!authUser, 
      user: authUser,
      token: localStorage.getItem('token')
    });
  }, [authUser]);

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
        
        // Check if user has already applied
        const userApplication = response.applications?.find(
          (app: { workerId: string }) => app.workerId === authUser.id
        );
        setHasApplied(!!userApplication);
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
  }, [jobId, authUser]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authUser) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }

    if (job && authUser.id === job.employerId._id) {
      toast.error('You cannot apply to your own job');
      return;
    }

    if (!applicationMessage.trim()) {
      toast.error('Please write a message to the employer');
      return;
    }

    try {
      setApplying(true);
      await jobs.apply(jobId!, { 
        message: applicationMessage,
        coverLetter: '' // Add cover letter if needed
      });
      setHasApplied(true);
      setShowApplicationForm(false);
      toast.success('Application submitted successfully!');
      setApplicationMessage('');
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

            {/* Application Section */}
            <div className="mt-6 space-y-4">
              {hasApplied ? (
                // Show applied message if user has already applied
                <div className="p-4 bg-green-50 text-green-700 rounded-lg">
                  You have already applied for this job
                </div>
              ) : !authUser ? (
                // Show login button if user is not authenticated
                <button
                  onClick={() => navigate('/login')}
                  className="w-full py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors"
                >
                  Login to Apply
                </button>
              ) : authUser.id === job.employerId._id ? (
                // Show message for job poster
                <div className="p-4 bg-blue-50 text-blue-700 rounded-lg">
                  This is your posted job
                </div>
              ) : (
                // Show apply button/form for everyone except job poster and those who already applied
                <>
                  {!showApplicationForm ? (
                    <button
                      onClick={() => setShowApplicationForm(true)}
                      className="w-full py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors"
                    >
                      Apply for this Job
                    </button>
                  ) : (
                    <form onSubmit={handleApply} className="space-y-4">
                      <textarea
                        value={applicationMessage}
                        onChange={(e) => setApplicationMessage(e.target.value)}
                        placeholder="Write a message to the employer..."
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
                        rows={4}
                        required
                      />
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={applying}
                          className="flex-1 py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors disabled:opacity-50"
                        >
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplicationForm(false)}
                          className="py-3 px-6 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Contact Employer Button - always show if user is logged in and not the job poster */}
              {authUser && authUser.id !== job.employerId._id && (
                <button
                  onClick={() => navigate(`/chat/${job._id}/${job.employerId._id}`)}
                  className="w-full flex items-center justify-center py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Contact Employer
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;