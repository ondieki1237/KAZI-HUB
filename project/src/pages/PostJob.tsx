import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X } from 'lucide-react';
import { jobs } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const categories = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Cleaning',
  'Moving',
  'Gardening',
  'General Repair',
];

function PostJob() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      toast.error('Please login to post a job');
      navigate('/login');
    }
  }, [user, navigate]);

  // State for job data and skills
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: '',
    locationArea: '',
    locationCity: '',
    budget: 0,
    duration: '',
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Default to 30 days from now
    requirements: {
      isRemote: false,
      numberOfOpenings: 1,
      isConfidential: false,
    },
    skillsRequired: [] as string[],
    status: 'open',
    applications: [],
  });

  const [skill, setSkill] = useState('');

  // Add a skill to the list
  const handleAddSkill = () => {
    if (skill.trim()) {
      setJobData({
        ...jobData,
        skillsRequired: [...jobData.skillsRequired, skill.trim()],
      });
      setSkill('');
    }
  };

  // Remove a skill from the list
  const handleRemoveSkill = (index: number) => {
    setJobData({
      ...jobData,
      skillsRequired: jobData.skillsRequired.filter((_, i) => i !== index),
    });
  };

  // Handle location input change (split into area and city)
  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [area, city] = e.target.value.split(',').map((s) => s.trim());
    setJobData({
      ...jobData,
      locationArea: area || '',
      locationCity: city || '',
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.id) {
      toast.error('Please login to post a job');
      navigate('/login');
      return;
    }

    try {
      // Validate required fields
      if (
        !jobData.title ||
        !jobData.description ||
        !jobData.category ||
        !jobData.locationArea ||
        !jobData.locationCity ||
        !jobData.duration
      ) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Ensure budget is a positive number
      if (jobData.budget <= 0) {
        toast.error('Budget must be a positive number');
        return;
      }

      // Format the data for the API
      const jobPayload = {
        ...jobData,
        location: `${jobData.locationArea}, ${jobData.locationCity}`,
        status: 'open' as const,
        applications: []
      };

      console.log('Submitting job data:', jobPayload);

      await jobs.create(jobPayload);
      toast.success('Job posted successfully');
      navigate('/jobs');
    } catch (error: any) {
      console.error('Error posting job:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to post job');
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Post a New Job</h2>
      <form onSubmit={handleSubmit}>
        {/* Job Title */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Job Title</label>
          <input
            type="text"
            value={jobData.title}
            onChange={(e) =>
              setJobData({ ...jobData, title: e.target.value })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter job title"
            required
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <select
            value={jobData.category}
            onChange={(e) =>
              setJobData({ ...jobData, category: e.target.value })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            required
          >
            <option value="" disabled>Select a category</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea
            value={jobData.description}
            onChange={(e) =>
              setJobData({ ...jobData, description: e.target.value })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            rows={4}
            placeholder="Enter job description"
            required
          ></textarea>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Location (Area, City)</label>
          <input
            type="text"
            value={`${jobData.locationArea}, ${jobData.locationCity}`}
            onChange={handleLocationChange}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter area, city"
            required
          />
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Duration</label>
          <input
            type="text"
            value={jobData.duration}
            onChange={(e) =>
              setJobData({ ...jobData, duration: e.target.value })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter job duration"
            required
          />
        </div>

        {/* Skills Required */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Skills Required</label>
          <div className="flex items-center mb-2">
            <input
              type="text"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500 mr-2"
              placeholder="Add a required skill"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              <PlusCircle size={16} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {jobData.skillsRequired.map((skill, index) => (
              <div key={index} className="flex items-center bg-gray-200 px-3 py-1 rounded">
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className="ml-2 text-gray-400 hover:text-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Requirements */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Requirements</label>
          <div className="flex items-center mb-2">
            <input
              type="checkbox"
              checked={jobData.requirements.isRemote}
              onChange={(e) =>
                setJobData({
                  ...jobData,
                  requirements: { ...jobData.requirements, isRemote: e.target.checked },
                })
              }
              className="mr-2"
            />
            <span>Remote Work Available</span>
          </div>
          <div className="flex items-center mb-2">
            <label className="mr-2">Number of Openings</label>
            <input
              type="number"
              min={1}
              value={jobData.requirements.numberOfOpenings}
              onChange={(e) =>
                setJobData({
                  ...jobData,
                  requirements: {
                    ...jobData.requirements,
                    numberOfOpenings: parseInt(e.target.value, 10),
                  },
                })
              }
              className="w-20 px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            />
          </div>
        </div>

        {/* Budget */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Budget (KES)</label>
          <input
            type="number"
            min={1}
            value={jobData.budget}
            onChange={(e) =>
              setJobData({ ...jobData, budget: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            placeholder="Enter budget in KES"
            required
          />
        </div>

        {/* Expiration Date */}
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Job Expiration Date</label>
          <input
            type="datetime-local"
            value={jobData.expirationDate}
            onChange={(e) =>
              setJobData({ ...jobData, expirationDate: e.target.value })
            }
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-500"
            required
            min={new Date().toISOString().slice(0, 16)}
          />
          <p className="text-sm text-gray-500 mt-1">
            After this date, the job will no longer be visible to the public
          </p>
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Post Job
          </button>
        </div>
      </form>
    </div>
  );
}

export default PostJob;