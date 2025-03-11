import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { skills } from '../../services/skills';

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

      // Add loading toast
      const loadingToast = toast.loading('Posting your skill...');

      const response = await skills.create(skillData);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success('Skill posted successfully!');
      
      console.log('Skill posted successfully:', response);
      
      // Clear form or redirect
      setTimeout(() => {
        navigate('/find-skill');
      }, 2000);

    } catch (error: any) {
      console.error('Error posting skill:', error);
      toast.error(error.response?.data?.message || 'Failed to post skill');
    } finally {
      setLoading(false);
    }
  };

  // ... rest of your component code ...
};

export default PostMySkill; 