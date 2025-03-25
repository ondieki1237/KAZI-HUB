import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, MapPin, Phone, Mail, Star, Briefcase, FileText, Share2, X, Plus, Home } from 'lucide-react';
import { profiles, jobs } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ProfileData {
  _id: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: 'worker' | 'employer';
  verified: boolean;
  profile?: {
    location?: string;
    bio?: string;
    avatar?: string;
    skills?: string[];
    rating?: number;
    completedJobs?: number;
  yearsOfExperience?: number;
    addressString?: string; // Add addressString to the interface
  };
  createdAt: string;
  updatedAt: string;
}

const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [jobHistory, setJobHistory] = useState<any[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    
    const fetchData = async () => {
    try {
      setLoading(true);
        const [profileData, historyData] = await Promise.all([
          profiles.getMyProfile(),
          jobs.getMyJobHistory()
        ]);

        if (!profileData) {
        toast.error('Failed to load profile data');
        return;
      }

        setProfile(profileData);
      setEditData({
          username: profileData.username,
          phoneNumber: profileData.phoneNumber,
          profile: {
            location: profileData.profile?.location || '',
            bio: profileData.profile?.bio || '',
            skills: profileData.profile?.skills || [],
            addressString: profileData.profile?.addressString || '', // Initialize addressString
          }
        });
        setJobHistory(historyData.completed || []);
    } catch (error: any) {
        console.error('Error fetching data:', error);
        toast.error(error.response?.data?.message || 'Failed to load data');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

    fetchData();
  }, [user, navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await profiles.uploadAvatar(formData);
      setProfile((prev) => prev ? {
        ...prev,
        profile: {
          ...prev.profile,
          avatar: response.avatar
        }
      } : null);
      toast.success('Profile picture updated successfully');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      if (!editData.username?.trim()) {
        toast.error('Username is required');
        return;
      }
      if (!editData.profile?.addressString?.trim()) {
        toast.error('Address is required');
        return;
      }

      const updatedProfile = await profiles.updateProfile(editData);
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleSkillAdd = () => {
    if (!newSkill.trim()) return;

    if (!editData.profile?.skills?.includes(newSkill)) {
      setEditData((prev) => ({
        ...prev,
        profile: {
          ...prev.profile,
          skills: [...(prev.profile?.skills || []), newSkill.trim()],
        },
      }));
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setEditData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        skills: prev.profile?.skills?.filter((skill) => skill !== skillToRemove) || [],
      },
    }));
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        const locationString = `${longitude}, ${latitude}`;
        setEditData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            location: locationString
          }
        }));
        toast.success('Location updated successfully');
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Unable to get your location. Please enter it manually.');
        setIsGettingLocation(false);
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-teal-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">No profile data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Cover Image */}
          <div className="relative h-48 md:h-56 bg-gradient-to-r from-teal-600 to-teal-400 rounded-t-xl">
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-4xl font-bold">My Profile</h2>
          </div>
        </div>

          <div className="bg-white rounded-b-xl shadow-lg -mt-10 p-4 md:p-8">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="relative">
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-gray-100 relative group">
                  {profile.profile?.avatar ? (
                  <img
                      src={profile.profile.avatar}
                      alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white text-4xl md:text-5xl font-bold">
                      {(profile.username || '').charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                    <Camera className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  {uploadingImage && (
                    <div className="absolute bottom-2 w-full flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 md:h-8 md:w-8 border-2 border-teal-500 border-t-transparent"></div>
                    </div>
                  )}
                </label>
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                />
              </div>
            </div>
          </div>

          {/* Edit/Save Buttons */}
          <div className="flex justify-end mt-4">
            {isEditing ? (
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditData({
                        username: profile.username,
                        phoneNumber: profile.phoneNumber,
                        profile: {
                          location: profile.profile?.location || '',
                          bio: profile.profile?.bio || '',
                          skills: profile.profile?.skills || [],
                          addressString: profile.profile?.addressString || '', // Reset addressString
                        }
                    });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Info */}
            <div className="mt-8 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                  <label className="block text-sm font-medium text-gray-700">Username</label>
              {isEditing ? (
                    <input
                      type="text"
                      value={editData.username || ''}
                      onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.username}</p>
                  )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.phoneNumber || ''}
                      onChange={(e) => setEditData({ ...editData, phoneNumber: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  {isEditing ? (
                    <div className="mt-1 flex space-x-2">
                      <input
                        type="text"
                        value={editData.profile?.location || ''}
                        onChange={(e) => setEditData({
                          ...editData,
                          profile: { ...editData.profile, location: e.target.value }
                        })}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                        placeholder="Enter location or use current location"
                      />
                      <button
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      >
                        {isGettingLocation ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 mr-2" />
                            Use Current Location
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.profile?.location || 'Not specified'}</p>
                  )}
                  </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.profile?.addressString || ''}
                      onChange={(e) => setEditData({
                        ...editData,
                        profile: { ...editData.profile, addressString: e.target.value }
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{profile.profile?.addressString || 'Not specified'}</p>
              )}
            </div>

            <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{profile.email}</p>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                {isEditing ? (
                  <textarea
                    value={editData.profile?.bio || ''}
                    onChange={(e) => setEditData({
                      ...editData,
                      profile: { ...editData.profile, bio: e.target.value }
                    })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  />
                ) : (
                  <p className="mt-1 text-gray-900">{profile.profile?.bio || 'No bio yet'}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Skills</label>
                {isEditing ? (
                  <div className="mt-2 space-y-2">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                      />
                      <button
                        onClick={handleSkillAdd}
                        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                  <div className="flex flex-wrap gap-2">
                      {editData.profile?.skills?.map((skill) => (
                      <span
                        key={skill}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                      >
                        {skill}
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-teal-600 hover:text-teal-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.profile?.skills?.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-teal-100 text-teal-800"
                      >
                        {skill}
                      </span>
                    ))}
                      </div>
                    )}
                  </div>

              {/* Job History */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Projects</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jobHistory.map((job) => (
                    <div
                      key={job._id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-medium text-gray-900">{job.job.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">{job.job.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span>{job.job.location}</span>
                </div>
                      <div className="mt-2 text-sm font-medium text-teal-600">
                        KES {job.job.budget.toLocaleString()}
            </div>
          </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;