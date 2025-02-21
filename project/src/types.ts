export interface Job {
  _id: string;
  title: string;
  description: string;
  category: string;
  locationArea: string;
  locationCity: string;
  budget: number;
  status: 'open' | 'in-progress' | 'completed';
  employerId: {
    _id: string;
    name: string;
    email: string;
    location: string;
  };
  skillsRequired: string[];
  duration: string;
  createdAt: string;
  applications: Array<{
    _id: string;
    workerId: string;
    status: 'pending' | 'accepted' | 'rejected';
    message: string;
    createdAt: string;
    worker?: {
      _id: string;
      name: string;
      email: string;
    };
  }>;
}

export interface JobApplication {
  _id: string;
  jobId: string;
  workerId: string;
  status: 'pending' | 'accepted' | 'rejected';
  message: string;
  coverLetter?: string;
  createdAt: string;
} 