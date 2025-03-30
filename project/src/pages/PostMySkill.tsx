import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, User, Clock, DollarSign, Upload, Phone, Globe, Mail, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import './PostMySkill.css';
import { skills } from '../services/api';

const PostMySkill: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    isGroup: false,
    skillDescription: '',
    availability: '',
    charges: '',
    groupName: '',
    pastWorkFiles: [] as File[],
    contact: {
      phone: '',
      website: '',
      email: '',
      location: ''
    }
  });
  const [loading, setLoading] = useState(false);

  // Redirect to login if not authenticated
  if (!user) {
    toast.error('Please login to post your skill');
    navigate('/login');
    return null;
  }

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
        toast.error('Maximum 5 files allowed');
        return;
      }
      setFormData(prev => ({ ...prev, pastWorkFiles: files }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillData = new FormData();
      
      // Append basic data
      skillData.append('isGroup', String(formData.isGroup));
      skillData.append('skillDescription', formData.skillDescription);
      skillData.append('availability', formData.availability);
      skillData.append('charges', formData.charges);
      if (formData.isGroup && formData.groupName) {
        skillData.append('groupName', formData.groupName);
      }

      // Append contact information
      skillData.append('contact', JSON.stringify({
        phone: formData.contact.phone,
        website: formData.contact.website || undefined,
        email: formData.contact.email || undefined,
        location: formData.contact.location
      }));

      // Append files if any
      formData.pastWorkFiles.forEach((file) => {
        skillData.append('pastWorkFiles', file);
      });

      await skills.create(skillData);
      console.log('Skill posted successfully');
      navigate('/find-skill');
    } catch (error) {
      console.error('Error posting skill:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800">Post My Skill</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <Home className="h-5 w-5 mr-2" />
          Home
        </button>
      </div>

      {/* Form Container */}
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Individual/Group Toggle */}
            <div className="flex items-center gap-4">
              <label className="text-gray-700 font-medium">I am posting as:</label>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isGroup: false }))}
                className={`px-3 py-1 rounded ${!formData.isGroup ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <User className="h-4 w-4 inline mr-1" />
                Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isGroup: true }))}
                className={`px-3 py-1 rounded ${formData.isGroup ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                <Users className="h-4 w-4 inline mr-1" />
                Group
              </button>
            </div>

            {/* Group Name (Visible only for groups) */}
            {formData.isGroup && (
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Group Name (e.g., Mombasa Carpenters)"
                  value={formData.groupName}
                  onChange={(e) => setFormData(prev => ({ ...prev, groupName: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            )}

            {/* Skill Description */}
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-gray-600" />
              <textarea
                placeholder="What I can do (e.g., Carpentry, Build tables and chairs)"
                value={formData.skillDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, skillDescription: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows={3}
                required
              />
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              <input
                type="text"
                placeholder="Availability (e.g., Mon-Fri, 8 AM - 5 PM)"
                value={formData.availability}
                onChange={(e) => setFormData(prev => ({ ...prev, availability: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            {/* Charges */}
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-600" />
              <input
                type="number"
                placeholder="Charges (KES per job/hour/day)"
                value={formData.charges}
                onChange={(e) => setFormData(prev => ({ ...prev, charges: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                min="0"
                required
              />
            </div>

            {/* Past Work Upload */}
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-gray-600" />
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            {formData.pastWorkFiles.length > 0 && (
              <p className="text-sm text-gray-500">{formData.pastWorkFiles.length} file(s) selected</p>
            )}

            {/* Contact Details */}
            <div className="space-y-2">
              <h3 className="text-md font-semibold text-gray-800">Contact Details</h3>
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-gray-600" />
                <input
                  type="tel"
                  placeholder="Phone (e.g., +254 712 345 678)"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      phone: e.target.value
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600" />
                <input
                  type="url"
                  placeholder="Website (optional)"
                  value={formData.contact.website}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      website: e.target.value
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-600" />
                <input
                  type="email"
                  placeholder="Email (optional)"
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      email: e.target.value
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                <input
                  type="text"
                  placeholder="Location (e.g., Kisumu)"
                  value={formData.contact.location}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    contact: {
                      ...prev.contact,
                      location: e.target.value
                    }
                  }))}
                  className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-teal-500 text-white py-2 rounded hover:bg-teal-600 disabled:bg-teal-300 transition-colors"
              disabled={loading}
            >
              {loading ? 'Posting...' : 'Post My Skill'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PostMySkill;