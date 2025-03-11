import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobs } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Briefcase, 
  MapPin, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  AlertCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer';

interface JobApplication {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    locationArea: string;
    locationCity: string;
    budget: number;
    status: string;
    employerId: {
      name: string;
      email: string;
    };
  };
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  appliedAt: string;
  message: string;
}

interface JobHistory {
  _id: string;
  jobId: {
    _id: string;
    title: string;
    description: string;
    locationArea: string;
    locationCity: string;
    budget: number;
    employerId: {
      name: string;
      rating?: number;
    };
  };
  status: 'completed' | 'rejected';
  appliedAt: string;
  updatedAt: string;
  rating?: number;
  feedback?: string;
}

const AppliedJobs: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [rating, setRating] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobHistory, setJobHistory] = useState<{
    all: JobApplication[];
    pending: JobApplication[];
    accepted: JobApplication[];
    completed: JobApplication[];
    rejected: JobApplication[];
  }>({
    all: [],
    pending: [],
    accepted: [],
    completed: [],
    rejected: []
  });
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    if (!user?._id) {
      toast.error('Please login to view your applications');
      navigate('/login');
      return;
    }

    fetchJobHistory();
  }, [user, navigate]);

  const fetchJobHistory = async () => {
    try {
      setLoading(true);
      const response = await jobs.getMyJobHistory();
      setJobHistory(response);
    } catch (error: any) {
      console.error('Error fetching job history:', error);
      toast.error(error.message || 'Failed to load job history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelApplication = async (applicationId: string) => {
    try {
      if (!applicationId) {
        toast.error('Invalid application ID');
        return;
      }

      await jobs.cancelApplication(applicationId.toString());
      toast.success('Application cancelled successfully');
      fetchJobHistory();
    } catch (error: any) {
      console.error('Error cancelling application:', error);
      toast.error(error.message || 'Failed to cancel application');
    }
  };

  const handleMarkAsCompleted = async (applicationId: string) => {
    try {
      if (!applicationId) {
        toast.error('Invalid application ID');
        return;
      }

      setSelectedJobId(applicationId.toString());
      setShowRatingModal(true);
    } catch (error: any) {
      console.error('Error preparing completion:', error);
      toast.error(error.message || 'Failed to prepare completion');
    }
  };

  const handleSubmitRating = async () => {
    try {
      await jobs.completeWork(selectedJobId, rating);
      toast.success('Work marked as completed successfully');
      setShowRatingModal(false);
      setRating(0);
      fetchJobHistory();
    } catch (error) {
      console.error('Error marking work as completed:', error);
      toast.error('Failed to mark work as completed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const renderApplications = (applications: JobApplication[]) => {
    if (applications.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No applications found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {applications.map((application) => (
          <div
            key={application._id}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800">
                  {application.jobId.title}
                </h3>
                <p className="text-gray-600 mt-1">
                  Posted by: {application.jobId.employerId.name}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-2 ${getStatusColor(application.status)}`}>
                {getStatusIcon(application.status)}
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center text-gray-600">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{application.jobId.locationArea}, {application.jobId.locationCity}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <DollarSign className="h-5 w-5 mr-2" />
                <span>KES {application.jobId.budget.toLocaleString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Calendar className="h-5 w-5 mr-2" />
                <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Briefcase className="h-5 w-5 mr-2" />
                <span>Job Status: {application.jobId.status}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => navigate(`/jobs/${application.jobId._id}`)}
                className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition-colors"
              >
                View Job Details
              </button>
              {application.status === 'pending' && (
                <button
                  onClick={() => handleCancelApplication(application._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Cancel Application
                </button>
              )}
              {application.status === 'accepted' && (
                <button
                  onClick={() => handleMarkAsCompleted(application._id)}
                  className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="My Job Applications" />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-center gap-4">
          {['pending', 'accepted', 'completed', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === status 
                  ? 'bg-teal-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              <span className="ml-2 text-sm">
                ({jobHistory[status as keyof typeof jobHistory]?.length || 0})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          renderApplications(jobHistory[activeTab as keyof typeof jobHistory] || [])
        )}
      </main>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Rate Work Experience</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRating(0);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                disabled={rating === 0}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default AppliedJobs;