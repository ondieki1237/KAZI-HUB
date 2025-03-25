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
  duration: string;
  expirationDate: string;
  requirements: {
    isRemote: boolean;
    numberOfOpenings: number;
    isConfidential: boolean;
  };
  skillsRequired: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  applications: any[];
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
  _id: string;
  jobId: string;
  jobTitle: string;
  senderId: {
    _id: string;
    name: string;
  };
  recipientId: {
    _id: string;
    name: string;
  };
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  type: 'message' | 'jobAccepted' | 'jobRejected';
  _id: string;
  jobId: string;
  jobTitle: string;
  message?: string;
  content?: string;
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