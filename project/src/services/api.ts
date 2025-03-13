import axios from 'axios';
import type { Job, JobApplication, User, VerificationDocument, Payment } from '../types';
import { toast } from 'react-hot-toast';

// Update the API URL configuration to use the local network IP
const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.1.157:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Improve error handling in the interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the backend server is running');
      toast.error('Network error - please check server connection');
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Adding token to request:', token.substring(0, 10) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found for request');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const auth = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Validate token and user data
      if (!token || !user || !user._id) {
        throw new Error('Invalid response from server');
      }

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        ...user,
        _id: user._id.toString(),
        id: user._id.toString()
      }));

      // Log successful auth
      console.log('Auth successful:', {
        userId: user._id,
        tokenPreview: token.substring(0, 20) + '...'
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
        password: '[REDACTED]'
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

export const jobs = {
  getFeatured: async (category?: string): Promise<Job[]> => {
    try {
      const response = await api.get('/jobs/featured', {
        params: { category }
      });
      console.log('Featured jobs response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching featured jobs:', error);
      throw error;
    }
  },
  create: async (jobData: Omit<Job, '_id' | 'employerId' | 'createdAt'>) => {
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
      if (!id) {
        throw new Error('Job ID is required');
      }

      console.log('Fetching job with ID:', id);
      const response = await api.get(`/jobs/${id}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }

      console.log('Job details response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching job details:', error);
      if (error.response?.status === 404) {
        throw new Error('Job not found');
      } else if (error.response?.status === 400) {
        throw new Error('Invalid job ID');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Error fetching job details');
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
  updateStatus: async (jobId: string, status: Job['status']) => {
    const response = await api.patch(`/jobs/${jobId}/status`, { status });
    return response.data;
  },
  search: async (params: { category?: string; location?: string; query?: string }) => {
    const response = await api.get('/jobs/search', { params });
    return response.data;
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
    const response = await api.post(`/jobs/${jobId}/notifications`, notification);
    return response.data;
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
      
      const response = await api.patch(`/jobs/${jobId}/applications/${applicationId}`, { 
        status 
      });
      
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
        params: { page, limit, category }
      });
      return {
        jobs: response.data.jobs,
        hasMore: response.data.hasMore
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
      // Validate applicationId format before sending
      if (!applicationId || typeof applicationId !== 'string') {
        throw new Error('Invalid application ID');
      }

      const response = await api.delete(`/api/jobs/applications/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error('Error cancelling application:', error);
      throw error;
    }
  },
  getMyJobHistory: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user._id) {
        throw new Error('User not authenticated');
      }

      const userId = user._id.toString();
      console.log('Fetching job history for user:', userId);

      const response = await api.get(`/jobs/history/user/${userId}`);
      console.log('Job history response:', response.data);

      // Validate and transform the response data
      if (!Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }

      // Group applications by status
      const groupedApplications = response.data.reduce((acc, app) => {
        if (!acc[app.status]) {
          acc[app.status] = [];
        }
        acc[app.status].push(app);
        return acc;
      }, {});

      return {
        all: response.data,
        pending: groupedApplications.pending || [],
        accepted: groupedApplications.accepted || [],
        completed: groupedApplications.completed || [],
        rejected: groupedApplications.rejected || []
      };
    } catch (error) {
      console.error('Error fetching job history:', error);
      throw error;
    }
  },
  completeWork: async (applicationId: string, rating: number) => {
    try {
      // Validate inputs
      if (!applicationId || typeof applicationId !== 'string') {
        throw new Error('Invalid application ID');
      }
      if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
        throw new Error('Invalid rating');
      }

      const response = await api.post(`/api/jobs/applications/${applicationId}/complete`, { rating });
      return response.data;
    } catch (error) {
      console.error('Error completing work:', error);
      throw error;
    }
  },
};

export const profiles = {
  getMyProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await api.get('/users/my-profile', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Profile data received:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw error;
    }
  },

  updateProfile: async (profileData: Partial<User>) => {
    try {
      const response = await api.patch('/users/profile', profileData);
      console.log('Profile update response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  uploadAvatar: async (formData: FormData) => {
    try {
      const response = await api.post('/users/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Avatar upload response:', response.data);
      return response.data;
    } catch (error) {
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
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);
    
    const response = await api.post(`/users/${userId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
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
  }
};

export const payments = {
  initiateMpesa: async (jobId: string, amount: number, phone: string) => {
    const response = await api.post('/payments/mpesa/initiate', {
      jobId,
      amount,
      phone,
    });
    return response.data;
  },
  getStatus: async (paymentId: string) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },
};

export const chat = {
  getMessages: async (jobId: string, userId: string) => {
    try {
      // Validate both jobId and userId
      if (!jobId || !userId) {
        throw new Error('Both Job ID and User ID are required');
      }
      const response = await api.get(`/chats/${jobId}?userId=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },
  
  sendMessage: async (jobId: string, content: string, userId: string) => {
    try {
      if (!jobId || !content || !userId) {
        throw new Error('JobId, content, and userId are required');
      }
      
      const response = await api.post(`/chats/${jobId}`, { 
        content,
        recipientId: userId 
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },
  
  getUserDetails: async (userId: string) => {
    try {
      const response = await api.get(`/chats/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user details:', error);
      throw error;
    }
  },
  
  getConversations: async () => {
    try {
      const response = await api.get('/chats/conversations');
      return response.data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Return empty array instead of throwing
      return [];
    }
  }
};

export const skills = {
  create: async (skillData: FormData) => {
    try {
      const response = await api.post('/skills', skillData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
  },

  getAll: async () => {
    const response = await api.get('/skills');
    return response.data;
  },

  getByUser: async (userId: string) => {
    const response = await api.get(`/skills/user/${userId}`);
    return response.data;
  },

  getById: async (skillId: string) => {
    try {
      const response = await api.get(`/skills/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill details:', error);
      throw error;
    }
  }
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
  }
};

export default api;