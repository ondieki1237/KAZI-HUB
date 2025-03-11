export interface User {
  id: string;
  name: string;
  email: string;
  role: 'worker' | 'employer';
  phone?: string;
  avatar?: string;
  verified: boolean;
  location: string;
  skills?: string[];
  bio?: string;
  rating?: number;
  completedJobs?: number;
  documents?: VerificationDocument[];
}

export interface VerificationDocument {
  id: string;
  type: 'id' | 'certificate' | 'license';
  status: 'pending' | 'verified' | 'rejected';
  url: string;
  uploadedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  locationArea: string;
  locationCity: string;
  budget: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  skillsRequired: string[];
  duration: string;
  employerId: string;
  createdAt: string;
  interestedUsers?: {
    id: string;
    name: string;
  }[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  workerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposal: string;
  bid: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface Payment {
  id: string;
  jobId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  type: 'mpesa' | 'card';
  transactionId?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}