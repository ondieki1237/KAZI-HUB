import axios from 'axios';
import type { Job, JobApplication } from '../types';
import { toast } from 'react-hot-toast';

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
    addressString?: string; // Added explicitly for clarity
  };
  createdAt: string;
  updatedAt: string;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://192.168.1.157:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request');
    }
    console.log('Making request to:', config.url);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    });

    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the backend server is running');
      toast.error('Network error - please check server connection');
    } else if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (error.response?.status === 404) {
      toast.error('Resource not found');
    } else {
      toast.error(error.response?.data?.message || error.message || 'An error occurred');
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      if (!token || !user || !user._id) {
        throw new Error('Invalid response from server');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        _id: user._id.toString(),
        id: user._id.toString(),
      }));

      console.log('Auth successful:', {
        userId: user._id,
        tokenPreview: token.substring(0, 20) + '...',
      });

      return { token, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'worker' | 'employer';
    location: string;
  }) => {
    try {
      console.log('Making registration request with data:', {
        ...userData,
        password: '[REDACTED]',
      });
      
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error.response?.data || error);
      throw error;
    }
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export interface ExtendedJob extends Job {
  expirationDate: string;
}

export const jobs = {
  getFeatured: async (category?: string): Promise<ExtendedJob[]> => {
    try {
      const response = await api.get('/jobs/featured', {
        params: { category },
      });
      console.log('Featured jobs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  },
  create: async (jobData: Omit<ExtendedJob, '_id' | 'employerId' | 'createdAt'>) => {
    try {
      console.log('Creating job with data:', jobData);
      const response = await api.post('/jobs', jobData);
      console.log('Job creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },
  getById: async (id: string) => {
    try {
      if (!id) throw new Error('Job ID is required');

      console.log('Fetching job with ID:', id);
      const response = await api.get(`/jobs/${id}`);
      
      if (!response.data) throw new Error('No data received from server');

      console.log('Job details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      if (error.response?.status === 404) throw new Error('Job not found');
      throw error;
    }
  },
  apply: async (jobId: string, application: { message: string; coverLetter: string }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`, application);
      return response.data;
    } catch (error) {
      console.error('Error applying for job:', error);
      throw error;
    }
  },
  updateStatus: async (jobId: string, status: ExtendedJob['status']) => {
    try {
      const response = await api.patch(`/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating job status:', error);
      throw error;
    }
  },
  search: async (params: { category?: string; location?: string; query?: string }) => {
    try {
      const response = await api.get('/jobs/search', { params });
      return response.data;
    } catch (error) {
      console.error('Error searching jobs:', error);
      throw error;
    }
  },
  getMyPostedJobs: async () => {
    try {
      const response = await api.get('/jobs/my-posted');
      console.log('My posted jobs:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching posted jobs:', error);
      throw error;
    }
  },
  createNotification: async (jobId: string, notification: { type: string; message: string }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/notifications`, notification);
      return response.data;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },
  getJobApplications: async (jobId: string) => {
    try {
      const response = await api.get(`/jobs/${jobId}/applications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching job applications:', error);
      throw error;
    }
  },
  updateApplicationStatus: async (jobId: string, applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      console.log('Updating application status:', { jobId, applicationId, status });
      const response = await api.patch(`/jobs/${jobId}/applications/${applicationId}`, { status });
      console.log('Status update response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  },
  getAllJobs: async (page = 1, limit = 10, category?: string) => {
    try {
      const response = await api.get('/jobs', {
        params: { page, limit, category },
      });
      return {
        jobs: response.data.jobs,
        hasMore: response.data.hasMore,
      };
    } catch (error) {
      console.error('Error fetching all jobs:', error);
      throw error;
    }
  },
  getMyApplications: async () => {
    try {
      const response = await api.get('/jobs/applications/my');
      return response.data;
    } catch (error) {
      console.error('Error fetching my applications:', error);
      throw error;
    }
  },
  cancelApplication: async (applicationId: string) => {
    try {
      if (!applicationId || typeof applicationId !== 'string') {
        throw new Error('Invalid application ID');
      }
      const response = await api.delete(`/jobs/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling application:', error);
      throw error;
    }
  },
  getMyJobHistory: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user._id) throw new Error('User not authenticated');

      const userId = user._id.toString();
      console.log('Fetching job history for user:', userId);

      const response = await api.get(`/jobs/history/user/${userId}`);
      console.log('Job history response:', response.data);

      if (!Array.isArray(response.data)) throw new Error('Invalid response format');

      const groupedApplications = response.data.reduce((acc: any, app: any) => {
        if (!acc[app.status]) acc[app.status] = [];
        acc[app.status].push(app);
        return acc;
      }, {});

      return {
        all: response.data,
        pending: groupedApplications.pending || [],
        accepted: groupedApplications.accepted || [],
        completed: groupedApplications.completed || [],
        rejected: groupedApplications.rejected || [],
      };
    } catch (error) {
      console.error('Error fetching job history:', error);
      throw error;
    }
  },
  completeWork: async (applicationId: string, rating: number) => {
    try {
      if (!applicationId || typeof applicationId !== 'string') throw new Error('Invalid application ID');
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) throw new Error('Invalid rating');

      const response = await api.post(`/jobs/applications/${applicationId}/complete`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error completing work:', error);
      throw error;
    }
  },
  deleteJob: async (jobId: string): Promise<void> => {
    try {
      const response = await api.delete(`/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },
  updateExpirationDate: async (jobId: string, expirationDate: string): Promise<ExtendedJob> => {
    try {
      const response = await api.put(`/jobs/${jobId}/expiration`, { expirationDate });
      return response.data;
    } catch (error) {
      console.error('Error updating expiration date:', error);
      throw error;
    }
  },
};

export const profiles = {
  getMyProfile: async (): Promise<ProfileData> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await api.get('/users/my-profile');
      console.log('Profile data received:', response.data);

      // Transform the data to match ProfileData interface
      const profileData: ProfileData = {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        phoneNumber: response.data.phoneNumber || '',
        role: response.data.role,
        verified: response.data.verified,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };

      if (response.data.profile) {
        profileData.profile = {
          location: response.data.profile.location,
          bio: response.data.profile.bio,
          avatar: response.data.profile.avatar,
          skills: response.data.profile.skills || [],
          rating: response.data.profile.rating,
          completedJobs: response.data.profile.completedJobs || 0,
          yearsOfExperience: response.data.profile.yearsOfExperience,
          addressString: response.data.profile.addressString, // Added
        };
      }

      return profileData;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  },
  updateProfile: async (profileData: Partial<ProfileData>): Promise<ProfileData> => {
    try {
      // Transform the input data to match backend expectations
      const backendData = {
        name: profileData.username,
        phone: profileData.phoneNumber,
        locationString: profileData.profile?.location, // Store original location string
        location: profileData.profile?.location ? {
          type: 'Point',
          coordinates: profileData.profile.location.split(',').map(coord => parseFloat(coord.trim())).reverse() // Reverse to [lng, lat]
        } : undefined,
        bio: profileData.profile?.bio,
        skills: profileData.profile?.skills,
        addressString: profileData.profile?.addressString
      };

      console.log('Sending profile update data:', backendData);

      const response = await api.patch('/users/profile', backendData);
      console.log('Profile update response:', response.data);

      // Transform the response data to match ProfileData interface
      const updatedProfile: ProfileData = {
        _id: response.data._id,
        username: response.data.name || response.data.username,
        email: response.data.email,
        phoneNumber: response.data.phone || response.data.phoneNumber || '',
        role: response.data.role,
        verified: response.data.verified,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
        profile: {
          location: response.data.profile?.location || response.data.locationString || '',
          bio: response.data.profile?.bio || response.data.bio || '',
          avatar: response.data.profile?.avatar || response.data.avatar || '',
          skills: response.data.profile?.skills || response.data.skills || [],
          rating: response.data.profile?.rating || response.data.rating || 0,
          completedJobs: response.data.profile?.completedJobs || response.data.completedJobs || 0,
          yearsOfExperience: response.data.profile?.yearsOfExperience || response.data.yearsOfExperience || 0,
          addressString: response.data.profile?.addressString || response.data.addressString || ''
        }
      };

      return updatedProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  uploadAvatar: async (formData: FormData): Promise<{ avatar: string }> => {
    try {
      const response = await api.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Avatar upload response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      throw error;
    }
  },
  getUserDocuments: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/documents`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  },
  uploadDocument: async (userId: string, file: File, type: 'cv' | 'certificate' | 'other') => {
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('type', type);
      
      const response = await api.post(`/users/${userId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },
  saveCV: async (cvData: any, userId: string) => {
    try {
      const response = await api.post(`/users/${userId}/cv`, cvData);
      console.log('CV saved:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving CV:', error);
      throw error;
    }
  },
  getCVs: async (userId: string) => {
    try {
      const response = await api.get(`/users/${userId}/cv`);
      return response.data;
    } catch (error) {
      console.error('Error fetching CVs:', error);
      throw error;
    }
  },
};

export const payments = {
  initiateMpesa: async (jobId: string, amount: number, phone: string) => {
    try {
      const response = await api.post('/payments/mpesa/initiate', { jobId, amount, phone });
      return response.data;
    } catch (error) {
      console.error('Error initiating Mpesa payment:', error);
      throw error;
    }
  },
  getStatus: async (paymentId: string) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  },
};

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch (error) {
    console.error('Error parsing stored user:', error);
    return {};
  }
};

export const chat = {
  getMessages: async (jobId: string, userId: string) => {
    try {
      if (!jobId || !userId) throw new Error('Both Job ID and User ID are required');
      const response = await api.get(`/chats/${jobId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  sendMessage: async (jobId: string, content: string, userId: string) => {
    try {
      if (!jobId || !content || !userId) throw new Error('JobId, content, and userId are required');
      const response = await api.post(`/chats/${jobId}`, { content, recipientId: userId });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  getUserDetails: async (userId: string) => {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/chats/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },
  getConversations: async () => {
    const user = getStoredUser();
    if (!user?._id) {
      console.error('No user ID found in localStorage');
      return [];
    }
    
    if (!/^[0-9a-fA-F]{24}$/.test(user._id)) {
      console.error('Invalid user ID format:', user._id);
      return [];
    }

    console.log('Fetching conversations for user:', user._id);
    const response = await api.get(`/chats/conversations/${user._id}`);
    return response.data;
  },
};

export const skills = {
  create: async (skillData: FormData) => {
    try {
      const response = await api.post('/skills', skillData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const response = await api.get('/skills');
      return response.data;
    } catch (error) {
      console.error('Error fetching skills:', error);
      throw error;
    }
  },
  getByUser: async (userId: string) => {
    try {
      const response = await api.get(`/skills/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user skills:', error);
      throw error;
    }
  },
  getById: async (skillId: string) => {
    try {
      const response = await api.get(`/skills/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill details:', error);
      throw error;
    }
  },
};

export const admin = {
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },
  deleteJob: async (jobId: string) => {
    try {
      const response = await api.delete(`/admin/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },
};

export const notifications = {
  getUserNotifications: async (userId: string): Promise<Notification[]> => {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await api.get(`/notifications/user/${userId}`);
      console.log('User notifications:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },
  markAsRead: async (userId: string) => {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await api.put(`/notifications/mark-read/${userId}`);
      console.log('Notifications marked as read:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  },
  toggleAlerts: async (notificationId: string) => {
    try {
      if (!notificationId) throw new Error('Notification ID is required');
      const response = await api.put(`/notifications/${notificationId}/toggle-alerts`);
      console.log('Alerts toggled:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling notification alerts:', error);
      throw error;
    }
  },
  deleteNotification: async (notificationId: string) => {
    try {
      if (!notificationId) throw new Error('Notification ID is required');
      const response = await api.put(`/notifications/${notificationId}`, { visible: false });
      console.log('Notification deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

export default api;