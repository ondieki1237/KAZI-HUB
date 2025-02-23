import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobs } from '../services/api';
import PageHeader from '../components/PageHeader';
import { User, Calendar, MessageSquare, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface Application {
  _id: string;
  workerId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    cv?: {
      url: string;
      updatedAt: string;
    };
  };
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
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
      await jobs.updateApplicationStatus(jobId!, applicationId, newStatus);
      // Refresh job data
      const updatedJob = await jobs.getJobApplications(jobId!);
      setJob(updatedJob);
      toast.success(`Application ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleContactClick = (workerId: string) => {
    navigate(`/chat/${jobId}/${workerId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title={`Applications for ${job?.title || 'Job'}`} />
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
          </div>
        ) : !job?.applications.length ? (
          <div className="text-center text-gray-500">No applications yet</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {job.applications.map((application) => (
              <div
                key={application._id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <User className="h-10 w-10 text-gray-400 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-800">
                        {application.workerId.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {application.workerId.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Applied: {new Date(application.appliedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm">{application.message}</p>

                  {application.workerId.cv && (
                    <div className="flex items-center text-gray-500">
                      <Download className="h-4 w-4 mr-2" />
                      <a
                        href={application.workerId.cv.url}
                        download
                        className="text-sm text-blue-500 hover:text-blue-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success('Downloading CV...');
                        }}
                      >
                        Download CV
                      </a>
                      <span className="text-xs text-gray-400 ml-2">
                        (Updated: {new Date(application.workerId.cv.updatedAt).toLocaleDateString()})
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 mt-4">
                    {application.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusChange(application._id, 'accepted')}
                          className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusChange(application._id, 'rejected')}
                          className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                    <button
                      onClick={() => handleContactClick(application.workerId._id)}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Contact Applicant
                    </button>
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

export default ViewApplications; 