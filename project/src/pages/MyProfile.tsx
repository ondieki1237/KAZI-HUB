import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Camera, MapPin, Phone, Mail, Star, Briefcase, FileText, Share2, X, Plus } from 'lucide-react';
import { profiles } from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

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
  yearsOfExperience?: number;
}

const MyProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<ProfileData>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your profile');
      navigate('/login');
      return;
    }
    
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching profile...');
      const data = await profiles.getMyProfile();
      console.log('Profile data:', data);
      
      if (!data) {
        toast.error('Failed to load profile data');
        return;
      }

      setProfile(data);
      setEditData({
        name: data.name,
        phone: data.phone,
        location: data.location,
        bio: data.bio,
        skills: data.skills,
      });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const updatedProfile = await profiles.uploadAvatar(formData);
      setProfile((prev) => (prev ? { ...prev, avatar: updatedProfile.avatar } : null));
      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
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
      setProfile(updatedProfile);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleSkillAdd = () => {
    if (!newSkill.trim()) return;

    if (!editData.skills?.includes(newSkill)) {
      setEditData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()],
      }));
      setNewSkill('');
    }
  };

  const handleSkillRemove = (skillToRemove: string) => {
    setEditData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((skill) => skill !== skillToRemove),
    }));
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Cover Image */}
        <div className="relative h-56 bg-gradient-to-r from-teal-600 to-teal-400 rounded-t-xl">
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <h2 className="text-white text-3xl md:text-4xl font-bold">My Profile</h2>
          </div>
        </div>

        <div className="bg-white rounded-b-xl shadow-lg -mt-10 p-8">
          {/* Avatar Section */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-white overflow-hidden bg-gray-100 relative group">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white text-5xl font-bold">
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="h-12 w-12 text-white" />
                  {uploadingImage && (
                    <div className="absolute bottom-2 w-full flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent"></div>
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
                      name: profile.name,
                      phone: profile.phone,
                      location: profile.location,
                      bio: profile.bio,
                      skills: profile.skills,
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
                className="px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Info */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 text-lg"
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={editData.phone || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                      placeholder="Your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={editData.location || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, location: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                      placeholder="Your location"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea
                      value={editData.bio || ''}
                      onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-900">{profile.name}</h1>
                    {profile.verified && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-5 w-5 mr-3" />
                      <span className="text-lg">{profile.email}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="h-5 w-5 mr-3" />
                      <span className="text-lg">{profile.phone || 'No phone added'}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <MapPin className="h-5 w-5 mr-3" />
                      <span className="text-lg">{profile.location || 'No location added'}</span>
                    </div>
                  </div>
                  {profile.bio && (
                    <div className="mt-4">
                      <h3 className="text-xl font-semibold text-gray-800 mb-2">About</h3>
                      <p className="text-lg text-gray-600">{profile.bio}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Stats and Skills */}
            <div>
              {/* Stats Section */}
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Star className="h-5 w-5 mr-3 text-yellow-400" />
                    <span className="text-lg">{profile.rating || 0} ({profile.completedJobs || 0} jobs)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="h-5 w-5 mr-3" />
                    <span className="text-lg">{profile.yearsOfExperience || 0} Years of Experience</span>
                  </div>
                </div>
              </div>

              {/* Skills Section */}
              {profile.role === 'worker' && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {(isEditing ? editData.skills : profile.skills)?.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm flex items-center shadow-sm"
                      >
                        {skill}
                        {isEditing && (
                          <button
                            onClick={() => handleSkillRemove(skill)}
                            className="ml-2 text-teal-700 hover:text-teal-800"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <div className="flex space-x-2 mt-2">
                        <input
                          type="text"
                          placeholder="Add skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          className="px-3 py-1 border rounded-full text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <button
                          onClick={handleSkillAdd}
                          className="px-3 py-1 bg-teal-600 text-white rounded-full text-sm hover:bg-teal-700 transition-colors flex items-center"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Recent Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'E-Commerce Platform', description: 'Built a scalable e-commerce site using React and Node.js.', link: 'https://example.com/ecommerce' },
                { title: 'Task Management App', description: 'A productivity app with real-time collaboration using Firebase.', link: 'https://example.com/taskapp' },
                { title: 'Portfolio Website', description: 'A personal portfolio built with Next.js and Tailwind CSS.', link: 'https://example.com/portfolio' },
              ].map((project) => (
                <div key={project.title} className="bg-gray-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <h4 className="text-lg font-semibold text-gray-800">{project.title}</h4>
                  <p className="text-gray-600 mt-2">{project.description}</p>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:underline mt-2 inline-block"
                  >
                    View Project
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <button
              onClick={() => {
                navigator.share({
                  title: `${profile.name}'s Profile`,
                  text: `Check out my profile on BlueCollar!`,
                  url: window.location.href,
                }).catch(() => toast.error('Sharing not supported on this device'));
              }}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Share2 className="h-5 w-5 mr-2" /> Share Profile
            </button>
            <a
              href="/resume.pdf"
              download
              className="flex items-center px-4 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
            >
              <FileText className="h-5 w-5 mr-2" /> Download Resume
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;