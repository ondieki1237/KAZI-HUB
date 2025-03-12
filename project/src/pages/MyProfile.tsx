import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Upload, Star, Briefcase, MapPin, Phone, Mail } from 'lucide-react';
import { profiles } from '../services/api';
import toast from 'react-hot-toast';
import type { User, VerificationDocument } from '../types';

function Profile() {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<User>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profiles.getProfile(userId!);
        setProfile(data);
        setEditData(data);
      } catch (error) {
        toast.error('Failed to load profile');
      }
    };
    fetchProfile();
  }, [userId]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await profiles.updateProfile(userId!, editData);
      setProfile(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: VerificationDocument['type']) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await profiles.uploadDocument(userId!, file, type);
        const updated = await profiles.getProfile(userId!);
        setProfile(updated);
        toast.success('Document uploaded successfully');
      } catch (error) {
        toast.error('Failed to upload document');
      }
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-teal-dark to-teal-medium" />
          
          {/* Profile Info */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-100">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-teal-dark text-white text-3xl font-bold">
                    {profile.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.verified && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Verified
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-4 text-gray-500">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-400" />
                  <span>{profile.rating || 0} ({profile.completedJobs || 0} jobs)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-500">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center text-gray-500">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{profile.email}</span>
                </div>
              </div>

              {profile.bio && (
                <div className="text-gray-600">
                  <h3 className="font-medium text-gray-900 mb-2">About</h3>
                  <p>{profile.bio}</p>
                </div>
              )}

              {profile.role === 'worker' && (
                <>
                  {/* Skills */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills?.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-teal-50 text-teal-700 rounded-full text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verification Documents */}
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Verification Documents</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID Document
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentUpload(e, 'id')}
                            className="hidden"
                            id="id-upload"
                          />
                          <label
                            htmlFor="id-upload"
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload ID
                          </label>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Certificates
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={(e) => handleDocumentUpload(e, 'certificate')}
                            className="hidden"
                            id="cert-upload"
                          />
                          <label
                            htmlFor="cert-upload"
                            className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Certificate
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;