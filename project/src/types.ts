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
    location: string;
  };
  skillsRequired: string[];
  duration: string;
  createdAt: string;
  applications: JobApplication[];
}

export interface JobApplication {
  _id: string;
  workerId: string;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
} 