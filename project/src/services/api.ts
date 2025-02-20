import axios from 'axios';
import type { Job, JobApplication, User, VerificationDocument, Payment } from '../types';

// Update the API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - please check if the backend server is running');
    }
    return Promise.reject(error);
  }
);

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    console.log('Adding token to request:', token.substring(0, 10) + '...');
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.log('No token found for request');
  }
  return config;
});

export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'worker' | 'employer';
    location: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const jobs = {
  getFeatured: async () => {
    try {
    const response = await api.get('/jobs/featured');
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
  apply: async (jobId: string, application: Omit<JobApplication, 'id' | 'jobId' | 'status' | 'createdAt'>) => {
    const response = await api.post(`/jobs/${jobId}/apply`, application);
    return response.data;
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
    const response = await api.get('/jobs/mine');
    return response.data;
  },
};

export const profiles = {
  getMyProfile: async () => {
    try {
      console.log('Fetching user profile');
      const response = await api.get('/users/my-profile');
      console.log('Profile response:', response.data);
    return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  updateProfile: async (profileData: Partial<User>) => {
    try {
      console.log('Updating profile with data:', profileData);
      const response = await api.put('/users/my-profile', profileData);
      console.log('Profile update response:', response.data);
    return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },
  uploadDocument: async (userId: string, file: File, type: VerificationDocument['type']) => {
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
  getChats: async () => {
    const response = await api.get('/chats');
    return response.data;
  },
  getMessages: async (chatId: string) => {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data;
  },
  sendMessage: async (chatId: string, content: string) => {
    const response = await api.post(`/chats/${chatId}/messages`, { content });
    return response.data;
  },
};

export default api;