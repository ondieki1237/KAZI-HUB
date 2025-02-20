import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, X } from 'lucide-react';
import { jobs } from '../services/api';
import toast from 'react-hot-toast';

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
  const [jobData, setJobData] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    budget: 0,
    deadline: '',
    requirements: [] as string[],
  });
  const [requirement, setRequirement] = useState('');

  const handleAddRequirement = () => {
    if (requirement.trim()) {
      setJobData({
        ...jobData,
        requirements: [...jobData.requirements, requirement.trim()],
      });
      setRequirement('');
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setJobData({
      ...jobData,
      requirements: jobData.requirements.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await jobs.create(jobData);
      toast.success('Job posted successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to post job. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Post a New Job</h1>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Job Title
            </label>
            <input
              type="text"
              id="title"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.title}
              onChange={(e) => setJobData({ ...jobData, title: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category
            </label>
            <select
              id="category"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.category}
              onChange={(e) => setJobData({ ...jobData, category: e.target.value })}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              required
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.description}
              onChange={(e) => setJobData({ ...jobData, description: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              required
              placeholder="e.g., Westlands, Nairobi"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.location}
              onChange={(e) => setJobData({ ...jobData, location: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
              Budget (KES)
            </label>
            <input
              type="number"
              id="budget"
              required
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.budget}
              onChange={(e) => setJobData({ ...jobData, budget: Number(e.target.value) })}
            />
          </div>

          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              id="deadline"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
              value={jobData.deadline}
              onChange={(e) => setJobData({ ...jobData, deadline: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Requirements</label>
            <div className="mt-1 flex">
              <input
                type="text"
                className="flex-1 rounded-l-md border-gray-300 focus:border-teal-medium focus:ring focus:ring-teal-light focus:ring-opacity-50"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                placeholder="Add a requirement"
              />
              <button
                type="button"
                onClick={handleAddRequirement}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-teal-dark hover:bg-teal-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {jobData.requirements.map((req, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                >
                  <span className="text-sm text-gray-700">{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(index)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-dark to-teal-medium hover:from-teal-medium hover:to-teal-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-medium"
            >
              Post Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;