import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { jobs } from '../services/api';
import { Job } from '../types';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          </div>
        </div>
      </main>
    </div>
  );
};

export default JobDetail;