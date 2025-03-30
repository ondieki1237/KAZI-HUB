import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobs } from '../services/api';
import { MessageSquare, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  workerId: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
}

interface JobWithApplications {
  _id: string;
  title: string;
  applications: Application[];
}

const ViewApplications: React.FC = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobWithApplications | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobApplications = async () => {
      try {
        setLoading(true);
        const response = await jobs.getJobApplications(jobId!);
        setJob(response);
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Failed to fetch applications');
      } finally {
        setLoading(false);
      }
    };

    fetchJobApplications();
  }, [jobId]);

  const handleStatusChange = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    try {
      // First validate the IDs
      if (!jobId || !applicationId) {
        toast.error('Missing required information');
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading(`${newStatus === 'accepted' ? 'Accepting' : 'Rejecting'} application...`);

      // Update the application status
      await jobs.updateApplicationStatus(jobId, applicationId, newStatus);

      // Fetch updated job data
      const updatedJob = await jobs.getJobApplications(jobId);
      setJob(updatedJob);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Application ${newStatus} successfully`);

    } catch (error: any) {
      console.error('Error updating application status:', error);
      toast.error(error.response?.data?.message || 'Failed to update application status');
    }
  };

  const handleContactClick = (workerId: string) => {
    navigate(`/chat/${jobId}/${workerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">
          {job?.title ? `Applications for ${job.title}` : 'Applications'}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : !job?.applications.length ? (
          <div className="text-center py-8 text-gray-500">No applications yet</div>
        ) : (
          <div className="grid gap-4">
            {job.applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <User className="h-10 w-10 text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-800">
                      {application.workerId.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {application.workerId.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {application.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleStatusChange(application._id, 'accepted')}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleStatusChange(application._id, 'rejected')}
                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                      >
                        Reject
                      </button>
                    </>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        application.status === 'accepted'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleContactClick(application.workerId._id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                    title="Contact Applicant"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewApplications;