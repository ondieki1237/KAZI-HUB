import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Mail, Phone, Star, Briefcase, X, CheckCircle } from 'lucide-react';
import { profiles } from '../services/api';
import toast from 'react-hot-toast';

interface ProfileData {
  _id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  role: 'worker' | 'employer';
  skills: string[];
  rating?: number;
  completedJobs?: number;
  verified: boolean;
}

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Check auth state
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!token || !storedUser) {
          throw new Error('Not authenticated');
        }

        // Validate stored user data
        const user = JSON.parse(storedUser);
        if (!user._id) {
          console.error('Invalid user data:', user);
          throw new Error('Invalid user data');
        }

        console.log('Fetching profile for user:', user._id);
        const data = await profiles.getMyProfile();
        
        if (!data) {
          throw new Error('No profile data received');
        }

        setProfile(data);
      } catch (error: any) {
        console.error('Profile fetch error:', error);
        setError(error.message || 'Failed to load profile');
        
        if (error.message === 'Not authenticated' || error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', file);
      
      const updatedProfile = await profiles.uploadAvatar(formData);
      setProfile(prev => prev ? { ...prev, avatar: updatedProfile.avatar } : null);
      toast.success('Profile picture updated successfully');
    } catch (error) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!editData.name?.trim()) {
        toast.error('Name is required');
        return;
      }

      const updatedProfile = await profiles.updateProfile(editData);
      console.log('Profile updated:', updatedProfile);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">No profile data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Section */}
          <div className="h-48 bg-gradient-to-r from-teal-600 to-teal-400 relative">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-24 mb-4 flex justify-center">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white text-4xl font-bold">
                      {profile.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 
                           transition-opacity cursor-pointer flex items-center justify-center"
                >
                  <Camera className="h-8 w-8 text-white" />
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              {/* Header with Edit Button */}
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-gray-500">{profile.role}</span>
                    {profile.verified && (
                      <span className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Verified
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isEditing 
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      : 'bg-teal-50 text-teal-600 hover:bg-teal-100'
                    }`}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Your name"
                      />
                      <input
                        type="tel"
                        value={editData.phone || ''}
                        onChange={e => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Phone number"
                      />
                      <input
                        type="text"
                        value={editData.location || ''}
                        onChange={e => setEditData(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                        placeholder="Location"
                      />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-5 w-5 mr-3" />
                        <span>{profile.phone || 'No phone added'}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Mail className="h-5 w-5 mr-3" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-5 w-5 mr-3" />
                        <span>{profile.location || 'No location added'}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Star className="h-5 w-5 mr-3 text-yellow-400" />
                    <span>{profile.rating || 0} Rating ({profile.completedJobs || 0} jobs)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-5 w-5 mr-3" />
                    <span>{profile.completedJobs || 0} Jobs Completed</span>
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
                {isEditing ? (
                  <textarea
                    value={editData.bio || ''}
                    onChange={e => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    rows={4}
                    placeholder="Tell us about yourself"
                  />
                ) : (
                  <p className="text-gray-600">{profile.bio || 'No bio added'}</p>
                )}
              </div>

              {/* Skills Section */}
              {profile.role === 'worker' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.map(skill => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateProfile}
                    className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 
                             transition-colors font-medium"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;