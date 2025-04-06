import React, { useEffect, useState, useCallback } from 'react';
import {
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  Calendar,
  Bookmark,
  MessageSquare,
  Upload,
  FileText,
  AlertCircle,
  X,
  Share2, // Added Share2 icon for the share button
} from 'lucide-react';
import { jobs, profiles } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import Footer from '../components/Footer';

interface Document {
  _id: string;
  name: string;
  url: string;
  type: 'cv' | 'certificate' | 'other';
  uploadedAt: string;
}

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
  const [documents, setDocuments] = useState<File[]>([]);
  const [userCVs, setUserCVs] = useState<Document[]>([]);
  const [loadingCVs, setLoadingCVs] = useState(true);

  const fetchJobDetails = useCallback(async () => {
    if (!jobId || !authUser) {
      setLoading(false);
      setError('Please log in to view job details');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Fetching job details for ID:', jobId, 'UserID:', authUser?._id);
      
      const response = await jobs.getById(jobId);
      if (!response || !response._id) {
        throw new Error('Invalid job data received');
      }
      
      setJob(response);
      const userApplication = response.applications?.find(
        (app: { workerId: string }) => app.workerId === authUser._id
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
  }, [jobId, authUser]);

  const fetchUserCVs = useCallback(async () => {
    if (!authUser) return;
    
    try {
      setLoadingCVs(true);
      const response = await profiles.getUserDocuments(authUser._id);
      setUserCVs(response.filter((doc: Document) => doc.type === 'cv'));
    } catch (error) {
      console.error('Error fetching CVs:', error);
      toast.error('Failed to load CVs');
    } finally {
      setLoadingCVs(false);
    }
  }, [authUser]);

  useEffect(() => {
    console.log('Current auth state:', {
      isLoggedIn: !!authUser,
      userId: authUser?._id,
      token: localStorage.getItem('token')
    });
  }, [authUser]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  useEffect(() => {
    fetchUserCVs();
  }, [fetchUserCVs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      toast.error('Please login to apply for jobs');
      navigate('/login');
      return;
    }
    if (job && authUser._id === job.employerId._id) {
      toast.error('You cannot apply to your own job');
      return;
    }
    if (!applicationMessage.trim()) {
      toast.error('Please write a message to the employer');
      return;
    }
    if (documents.length === 0 && userCVs.length === 0) {
      toast.error('Please attach at least one CV document');
      return;
    }
    try {
      setApplying(true);
      const uploadedDocs = [];
      for (const file of documents) {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('type', 'cv');
        const uploadedDoc = await profiles.uploadDocument(authUser._id, file, 'cv');
        uploadedDocs.push(uploadedDoc._id);
      }
      await jobs.apply(jobId!, {
        message: applicationMessage,
        coverLetter: applicationMessage,
        documents: [...uploadedDocs, ...userCVs.map(cv => cv._id)]
      });
      setHasApplied(true);
      setShowApplicationForm(false);
      toast.success('Application submitted successfully!');
      setApplicationMessage('');
      setDocuments([]);
    } catch (error: any) {
      console.error('Error applying for job:', error);
      toast.error(error.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleShareJob = () => {
    if (!jobId) return;

    // Construct the shareable URL
    const jobUrl = `${window.location.origin}/jobs/${jobId}`;
    const shareText = `Check out this job on BlueCollar: ${job?.title}\n\n${jobUrl}`;

    // Check if Web Share API is supported (typically on mobile devices)
    if (navigator.share) {
      navigator
        .share({
          title: job?.title || 'Job Opportunity',
          text: shareText,
          url: jobUrl,
        })
        .then(() => {
          console.log('Job shared successfully');
          toast.success('Job shared successfully!');
        })
        .catch((error) => {
          console.error('Error sharing job:', error);
          // Fallback to copy if sharing fails
          copyToClipboard(jobUrl);
        });
    } else {
      // Fallback for desktops/laptops: Copy to clipboard
      copyToClipboard(jobUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success('Job link copied to clipboard!');
      })
      .catch((error) => {
        console.error('Error copying to clipboard:', error);
        toast.error('Failed to copy link');
      });
  };

  const renderApplicationForm = () => (
    <form onSubmit={handleApply} className="space-y-6 md:border md:p-6 md:rounded-lg md:bg-gray-50">
      <textarea
        value={applicationMessage}
        onChange={(e) => setApplicationMessage(e.target.value)}
        placeholder="Write a message to the employer..."
        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-teal-dark focus:border-transparent"
        rows={4}
        required
      />
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-gray-900">CV Documents</h3>
          {userCVs.length === 0 && (
            <Link
              to="/cv-maker"
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              Create New CV
            </Link>
          )}
        </div>
        {loadingCVs ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : userCVs.length > 0 ? (
          <div className="space-y-2">
            {userCVs.map(cv => (
              <div key={cv._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  <span className="text-sm text-gray-600">{cv.name}</span>
                </div>
                <a
                  href={cv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 text-sm"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <AlertCircle className="h-8 w-8 text-yellow-500 mx-auto" />
            <p className="text-gray-600">No CV found in your profile</p>
          </div>
        )}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Upload Additional Documents
          </label>
          <div className="flex items-center justify-center w-full">
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border-2 border-dashed cursor-pointer hover:bg-gray-50">
              <Upload className="h-8 w-8 text-teal-600" />
              <span className="mt-2 text-sm">Click to upload documents</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          </div>
        </div>
        {documents.length > 0 && (
          <div className="space-y-2">
            {documents.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-teal-600 mr-2" />
                  <span className="text-sm text-gray-600">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeDocument(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
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
  );

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
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-teal-dark hover:text-teal-medium"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Jobs
          </button>
        </div>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 md:mb-0">
              <div className="bg-gradient-to-r from-teal-dark to-teal-medium text-white p-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{job.title}</h1>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>
                      {job.employerId.location && typeof job.employerId.location === 'object'
                        ? `${job.locationArea}, ${job.locationCity}`
                        : job.employerId.location || `${job.locationArea}, ${job.locationCity}`}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span>KES {job.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{job.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Posted: {new Date(job.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Expires: {job.expirationDate ? new Date(job.expirationDate).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Not set'}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      job.status === 'open'
                        ? 'bg-green-100 text-green-700'
                        : job.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-700'
                        : job.status === 'closed'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">Description</h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{job.description}</p>
                </div>
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skillsRequired?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-teal-50 text-teal-700 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="md:col-span-1 space-y-6">
            {job.employerId && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Posted by</h2>
                <div className="flex items-center space-x-4">
                  <div className="bg-teal-50 rounded-full p-3">
                    <User className="h-6 w-6 text-teal-dark" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 text-lg">{job.employerId.name}</h3>
                    <p className="text-gray-500 text-sm">
                      {job.employerId.location && typeof job.employerId.location === 'object'
                        ? `${job.locationArea}, ${job.locationCity}`
                        : job.employerId.location || `${job.locationArea}, ${job.locationCity}`}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="space-y-4">
                {hasApplied ? (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    You have already applied for this job
                  </div>
                ) : job.status === 'closed' ? (
                  <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    This job is no longer accepting applications
                  </div>
                ) : !authUser ? (
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors font-medium"
                  >
                    Login to Apply
                  </button>
                ) : authUser.id === job.employerId._id ? (
                  <div className="p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    This is your posted job
                  </div>
                ) : (
                  <>
                    {!showApplicationForm ? (
                      <button
                        onClick={() => setShowApplicationForm(true)}
                        className="w-full py-3 bg-teal-dark text-white rounded-lg hover:bg-teal-medium transition-colors font-medium"
                      >
                        Apply for this Job
                      </button>
                    ) : (
                      renderApplicationForm()
                    )}
                  </>
                )}
                {authUser && authUser.id !== job.employerId._id && (
                  <button
                    onClick={() => navigate(`/chat/${job._id}/${job.employerId._id}`)}
                    className="w-full flex items-center justify-center py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                  >
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Contact Employer
                  </button>
                )}
                <button
                  onClick={handleShareJob}
                  className="w-full flex items-center justify-center py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share Job
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default JobDetail;