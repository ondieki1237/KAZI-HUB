import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { jobs } from '../services/api';
import { Job } from '../types';
import PageHeader from '../components/PageHeader';

const CreateJob: React.FC = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!user._id) {
      toast.error('Please login to post a job');
      navigate('/login');
    }
  }, [navigate, user._id]);

  // If not authenticated, don't render the form
  if (!user._id) {
    return null;
  }

  // State for form inputs
  const [job, setJob] = useState({
    title: '',
    description: '',
    category: '',
    locationArea: '',
    locationCity: '',
    budget: '',
    skillsRequired: [] as string[],
    duration: '',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setJob((prev) => ({ ...prev, [name]: value }));
  };

  // Handle skill tags
  const [skillInput, setSkillInput] = useState('');
  const addSkill = () => {
    if (skillInput.trim() && !job.skillsRequired.includes(skillInput)) {
      setJob((prev) => ({
        ...prev,
        skillsRequired: [...prev.skillsRequired, skillInput],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setJob((prev) => ({
      ...prev,
      skillsRequired: prev.skillsRequired.filter((s) => s !== skill),
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all fields are filled
      if (!job.title || !job.description || !job.category || !job.locationArea || 
          !job.locationCity || !job.budget || job.skillsRequired.length === 0 || !job.duration) {
        toast.error('Please fill in all fields');
        return;
      }

      // Create the job object with proper typing
      const newJob: Omit<Job, '_id' | 'employerId' | 'createdAt' | 'status'> = {
        title: job.title,
        description: job.description,
        category: job.category,
        locationArea: job.locationArea,
        locationCity: job.locationCity,
        budget: Number(job.budget),
        skillsRequired: job.skillsRequired,
        duration: job.duration,
        status: 'open' as const,
      };

      // Send to the server
      const response = await jobs.create(newJob);
      
      if (response._id) {
        toast.success('Job posted successfully!');
        // Wait for the toast to show before navigating
        setTimeout(() => {
          navigate('/jobs/my-posted');
        }, 2000);
      } else {
        throw new Error('Job creation failed');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Create a New Job" />
      <main className="container mx-auto px-4 py-8 flex-1">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={job.title}
              onChange={handleChange}
              placeholder="Enter job title"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Job Description
            </label>
            <textarea
              id="description"
              name="description"
              value={job.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the job requirements..."
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              required
            ></textarea>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Job Category
            </label>
            <input
              type="text"
              id="category"
              name="category"
              value={job.category}
              onChange={handleChange}
              placeholder="Enter job category"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              required
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="locationArea" className="block text-sm font-medium text-gray-700">
                Area
              </label>
              <input
                type="text"
                id="locationArea"
                name="locationArea"
                value={job.locationArea}
                onChange={handleChange}
                placeholder="Enter area"
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
                required
              />
            </div>
            <div>
              <label htmlFor="locationCity" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="locationCity"
                name="locationCity"
                value={job.locationCity}
                onChange={handleChange}
                placeholder="Enter city"
                className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
                required
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label htmlFor="budget" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <DollarSign className="h-5 w-5 text-teal-dark" />
              <span>Budget</span>
            </label>
            <input
              type="number"
              id="budget"
              name="budget"
              value={job.budget}
              onChange={handleChange}
              placeholder="Enter budget"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              required
            />
          </div>

          {/* Skills Required */}
          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
              Skills Required
            </label>
            <div className="flex items-center space-x-2 mt-1">
              <input
                type="text"
                id="skillInput"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  addSkill();
                }}
                className="bg-teal-dark text-white py-2 px-4 rounded-md hover:bg-teal-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap mt-2">
              {job.skillsRequired.map((skill) => (
                <div
                  key={skill}
                  className="bg-gray-200 text-gray-700 rounded-md py-1 px-3 mr-2 mb-2 flex items-center"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div>
            <label htmlFor="duration" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="h-5 w-5 text-teal-dark" />
              <span>Duration</span>
            </label>
            <input
              type="text"
              id="duration"
              name="duration"
              value={job.duration}
              onChange={handleChange}
              placeholder="Enter duration (e.g., 2 days)"
              className="mt-1 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-teal-dark focus:border-teal-dark"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-teal-dark text-white py-2 px-4 rounded-md hover:bg-teal-medium disabled:opacity-50"
            >
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CreateJob;