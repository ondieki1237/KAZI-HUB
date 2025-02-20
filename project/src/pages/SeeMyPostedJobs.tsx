import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock, User } from 'lucide-react';
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
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-dark to-teal-medium text-white py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">My Posted Jobs</h1>
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
                className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                {/* Job Title and Category */}
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{job.title}</h3>
                  <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded-full">
                    {job.category}
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{`${job.locationArea}, ${job.locationCity}`}</span>
                </div>

                {/* Budget */}
                <div className="flex items-center text-teal-dark mt-2">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span className="font-semibold">KES {job.budget.toLocaleString()}</span>
                </div>

                {/* Duration */}
                <div className="flex items-center text-gray-500 text-sm mt-2">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>{job.duration}</span>
                </div>

                {/* Skills Required */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Skills Required:</p>
                  <div className="flex flex-wrap mt-2">
                    {job.skillsRequired.map((skill) => (
                      <span
                        key={skill}
                        className="bg-gray-200 text-gray-700 rounded-md py-1 px-3 mr-2 mb-2"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interested Users */}
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">People Interested:</p>
                  <ul className="list-disc pl-6 mt-2">
                    {job.interestedUsers?.length > 0 ? (
                      job.interestedUsers.map((user, index) => (
                        <li key={index} className="text-gray-600">
                          <User className="h-4 w-4 inline mr-1" /> {user.name}
                        </li>
                      ))
                    ) : (
                      <li className="text-gray-500">No one has shown interest yet.</li>
                    )}
                  </ul>
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