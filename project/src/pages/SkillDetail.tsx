import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Home, User, Users, Clock, DollarSign, Phone, Globe, Mail, MapPin, Image as ImageIcon, Bell, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { skills } from '../services/api';
import Menu from '../components/Menu';

interface Skill {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    rating?: number;
    completedJobs?: number;
  };
  isGroup: boolean;
  skillDescription: string;
  availability: string;
  charges: number;
  groupName?: string | null;
  pastWorkFiles: string[];
  contact: {
    phone: string;
    website?: string | null;
    email?: string | null;
    location: string;
  };
  createdAt: string;
}

const SkillDetail: React.FC = () => {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user?._id;

  useEffect(() => {
    const fetchSkillDetails = async () => {
      try {
        setLoading(true);
        const response = await skills.getById(skillId as string);
        setSkill(response);
      } catch (error) {
        console.error('Error fetching skill details:', error);
        toast.error('Failed to load skill details');
      } finally {
        setLoading(false);
      }
    };

    if (skillId) {
      fetchSkillDetails();
    }
  }, [skillId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const handleChatClick = () => {
    if (isAuthenticated) {
      navigate('/messages');
    } else {
      toast.error('Please login to access chats');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Skill Not Found</h2>
        <button
          onClick={() => navigate('/find-skill')}
          className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600"
        >
          Browse Other Skills
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-800 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Menu onLogout={handleLogout} />
              <Link to="/" className="flex items-center space-x-2 text-white hover:text-teal-100 transition-colors">
                <Home className="h-6 w-6" />
                <span className="font-medium">Home</span>
              </Link>
              <h1 className="text-2xl font-bold">BlueCollar</h1>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <Bell className="h-6 w-6 cursor-pointer" />
                  <MessageSquare 
                    className="h-6 w-6 cursor-pointer" 
                    onClick={handleChatClick} 
                  />
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm bg-white text-teal-800 px-3 py-1 rounded-full hover:bg-gray-100"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Skill Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  {skill.isGroup ? skill.groupName : 'Individual Service Provider'}
                </h1>
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{skill.contact.location}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-600">
                  KES {skill.charges.toLocaleString()}
                </div>
                <div className="text-gray-500">per service</div>
              </div>
            </div>

            {/* Provider Info */}
            <div className="border-t border-b border-gray-200 py-4 mb-6">
              <div className="flex items-center mb-4">
                <User className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium">{skill.userId.name}</span>
                {skill.userId.rating && (
                  <div className="ml-4 flex items-center">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1">{skill.userId.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
              {skill.userId.completedJobs && (
                <div className="flex items-center text-gray-600">
                  <Clock className="h-5 w-5 mr-2" />
                  <span>{skill.userId.completedJobs} jobs completed</span>
                </div>
              )}
            </div>

            {/* Skill Description */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Service Description</h2>
              <p className="text-gray-700 whitespace-pre-line">{skill.skillDescription}</p>
            </div>

            {/* Availability */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Availability</h2>
              <p className="text-gray-700">{skill.availability}</p>
            </div>

            {/* Past Work */}
            {skill.pastWorkFiles.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Past Work</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {skill.pastWorkFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/${file}`}
                        alt={`Past work ${index + 1}`}
                        className="rounded-lg shadow-md w-full h-48 object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/placeholder-image.jpg'; // Add a placeholder image
                          console.error(`Failed to load image: ${file}`);
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Information */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-teal-600 mr-3" />
                  <span>{skill.contact.phone}</span>
                </div>
                {skill.contact.email && (
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-teal-600 mr-3" />
                    <span>{skill.contact.email}</span>
                  </div>
                )}
                {skill.contact.website && (
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-teal-600 mr-3" />
                    <a
                      href={skill.contact.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-600 hover:underline"
                    >
                      {skill.contact.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (!user) {
                    toast.error('Please login to contact the service provider');
                    navigate('/login');
                    return;
                  }
                  navigate(`/chat/${skill.userId._id}`);
                }}
                className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Contact Provider
              </button>
              <button
                onClick={() => navigate('/find-skill')}
                className="flex-1 border-2 border-teal-600 text-teal-600 py-3 rounded-lg hover:bg-teal-50 transition-colors"
              >
                Back to Skills
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SkillDetail;