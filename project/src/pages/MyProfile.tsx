import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../contexts/AuthContext';
import { profiles } from '../services/api';
import Footer from '../components/Footer';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  addressString: string;
  bio?: string;
  skills?: string[];
}

const MyProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    addressString: '',
    bio: '',
  });

  useEffect(() => {
    if (!authUser) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    fetchUserProfile();
  }, [authUser, navigate]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await profiles.getMyProfile();
      setProfile(response);
      setFormData({
        name: response.name || '',
        email: response.email || '',
        phone: response.phone || '',
        addressString: response.addressString || '',
        bio: response.bio || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !authUser) {
      toast.error('Unable to update profile. Please try again.');
      return;
    }

    try {
      setLoading(true);
      
      // Check if any fields have changed
      const hasChanges = Object.keys(formData).some(key => 
        formData[key as keyof typeof formData] !== profile[key as keyof UserProfile]
      );

      if (!hasChanges) {
        toast.error('No changes to save');
        setIsEditing(false);
        return;
      }

      // Update profile with current user ID
      const updatedProfile = await profiles.updateProfile({
        ...formData,
        _id: authUser.id // Use authUser.id instead of profile._id
      });

      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="My Profile" />
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="My Profile" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Profile Information</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
                className="flex items-center text-teal-dark hover:text-teal-medium"
              >
                {isEditing ? (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Edit className="h-5 w-5 mr-2" />
                    <span>Edit</span>
                  </>
                )}
            </button>
          </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Name Field */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
              <input
                type="text"
                name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                disabled={!isEditing}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
              />
            </div>

                {/* Email Field */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
              <input
                type="email"
                name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                disabled={!isEditing}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
              />
            </div>

                {/* Phone Field */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
              <input
                type="tel"
                name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                disabled={!isEditing}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
              />
            </div>

                {/* Location Field */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
              <input
                type="text"
                    name="addressString"
                    value={formData.addressString}
                    onChange={handleInputChange}
                disabled={!isEditing}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
              />
            </div>

                {/* Bio Field */}
            <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
              <textarea
                name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                disabled={!isEditing}
                rows={4}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
              />
            </div>

                {/* Save Button */}
            {isEditing && (
                  <div className="flex justify-end">
                <button
                      type="submit"
                      className="px-6 py-2 bg-teal-dark text-white rounded-md hover:bg-teal-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyProfile;