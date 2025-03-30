import React, { useState, useEffect, useCallback } from 'react';
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
  AlertCircle,
  ArrowLeft
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
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobHistory, setJobHistory] = useState<JobHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'rejected'>('pending');
  const [activeView, setActiveView] = useState<'applications' | 'history'>('applications');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchApplications = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      if (silent) setIsRefreshing(true);
      
      const [applicationsRes, historyRes] = await Promise.all([
        jobs.getMyApplications(),
        jobs.getMyJobHistory()
      ]);
      
      setApplications(applicationsRes);
      setJobHistory(historyRes);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401) {
        toast.error('Please login again');
        navigate('/login');
      } else if (!silent) {
        toast.error(error.message || 'Failed to load data');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || (!user.id && !user._id)) {
      console.log('No user found:', user);
      toast.error('Please login to view your applications');
      navigate('/login');
      return;
    }

    fetchApplications();
    
    // Silent refresh every 30 seconds
    const interval = setInterval(() => fetchApplications(true), 30000);
    return () => clearInterval(interval);
  }, [user, navigate, fetchApplications]);

  const filteredApplications = applications.filter(app => app.status === activeTab);

  const handleContactEmployer = (application: JobApplication) => {
    navigate(`/chat/${application.jobId._id}/${application.jobId.employerId._id}`);
  };

  const renderJobHistory = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobHistory.map((job) => (
        <div
          key={job._id}
          className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-lg text-gray-800">
              {job.jobId.title}
            </h3>
            <div className="flex items-center">
              {job.rating && (
                <div className="flex items-center text-yellow-400 mr-2">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="ml-1 text-sm">{job.rating}</span>
                </div>
              )}
              <span className={`px-3 py-1 rounded-full text-sm ${
                job.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </span>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{job.jobId.locationArea}, {job.jobId.locationCity}</span>
            </div>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              <span>KES {job.jobId.budget.toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Applied: {new Date(job.appliedAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center">
              <Briefcase className="h-4 w-4 mr-2" />
              <span>Posted by: {job.jobId.employerId.name}</span>
            </div>
            {job.feedback && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">{job.feedback}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveView('applications')}
            className={`px-4 py-2 rounded-lg ${
              activeView === 'applications'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Current Applications
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`px-4 py-2 rounded-lg ${
              activeView === 'history'
                ? 'bg-teal-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Job History
          </button>
        </div>

        {activeView === 'applications' ? (
          <>
            {/* Existing Tabs */}
            <div className="flex space-x-4 border-b">
              {(['pending', 'accepted', 'rejected'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-4 text-sm font-medium ${
                    activeTab === tab
                      ? 'border-b-2 border-teal-500 text-teal-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="ml-2 text-xs">
                    ({applications.filter(app => app.status === tab).length})
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : activeView === 'applications' ? (
          // Applications View
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredApplications.map((application) => (
              <div key={application._id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {application.jobId.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                    application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{application.jobId.locationArea}, {application.jobId.locationCity}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>KES {application.jobId.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2" />
                    <span>Posted by: {application.jobId.employerId.name}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => navigate(`/jobs/${application.jobId._id}`)}
                    className="flex-1 bg-teal-50 text-teal-600 py-2 rounded-lg hover:bg-teal-100 transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleContactEmployer(application)}
                    className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    Contact Employer
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Job History View
          renderJobHistory()
        )}
      </div>

      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
          Refreshing...
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;