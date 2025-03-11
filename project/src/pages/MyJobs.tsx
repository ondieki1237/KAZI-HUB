import React, { useEffect, useState } from 'react';
import { jobs } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Job } from '../types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { Calendar, DollarSign, Users } from 'lucide-react';

function MyJobs() {
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyJobs = async () => {
      try {
        setLoading(true);
        console.log('Fetching jobs for user:', user?.id);
        const fetchedJobs = await jobs.getMyPostedJobs();
        console.log('Fetched jobs:', fetchedJobs);
        setMyJobs(fetchedJobs);
      } catch (error: any) {
        console.error('Error fetching my jobs:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch your jobs');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyJobs();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="My Posted Jobs" />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="My Posted Jobs" />
      <main className="container mx-auto px-4 py-8">
        {myJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-gray-600">You haven't posted any jobs yet.</p>
            <button
              onClick={() => navigate('/post-job')}
              className="mt-4 px-6 py-2 bg-teal-dark text-white rounded-lg hover:bg-teal-medium"
            >
              Post Your First Job
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myJobs.map((job) => (
              <div 
                key={job._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/jobs/${job._id}`)}
              >
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    {job.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {job.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="h-5 w-5 mr-2" />
                      <span>Budget: KES {job.budget.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <Calendar className="h-5 w-5 mr-2" />
                      <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-500">
                      <Users className="h-5 w-5 mr-2" />
                      <span>Applications: {job.applications.length}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                      job.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : job.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default MyJobs; 