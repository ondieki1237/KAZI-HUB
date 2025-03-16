import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Search, User, Users, Clock, DollarSign, Phone, Globe, Mail, MapPin, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import { skills as skillsApi } from '../services/api';

// Define the Skill type based on PostMySkill data structure
interface Skill {
  _id: string;
  userId: string;
  isGroup: boolean;
  skillDescription: string;
  availability: string;
  charges: number;
  groupName?: string | null;
  pastWorkFiles: string[]; // Array of file URLs
  contact: {
    phone: string;
    website?: string | null;
    email?: string | null;
    location: string;
  };
}

const FindSkill: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      setLoading(true);
      try {
        const response = await skillsApi.getAll();
        setSkills(response);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast.error('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // Filter skills based on search query
  const filteredSkills = skills.filter((skill) =>
    `${skill.skillDescription} ${skill.groupName || ''} ${skill.contact.location}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-teal-500 shadow-md">
        <h1 className="text-xl font-semibold text-white">Find a Skill</h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 text-white hover:text-gray-100 transition-colors"
        >
          <Home className="h-5 w-5 mr-2" />
          Home
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-600 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search skills, group names, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
              style={{
                borderColor: '#e5e7eb',
                fontSize: '1rem',
              }}
            />
          </div>
        </div>

        {/* Skills List */}
        {loading ? (
          <div className="text-center text-gray-600">Loading skills...</div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center text-gray-600">No skills found</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSkills.map((skill) => (
              <div
                key={skill._id}
                className="bg-white p-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Skill Header */}
                <div className="flex items-center gap-2 mb-2">
                  {skill.isGroup ? (
                    <Users className="h-5 w-5 text-teal-500" />
                  ) : (
                    <User className="h-5 w-5 text-teal-500" />
                  )}
                  <h2 className="text-lg font-semibold text-gray-800">
                    {skill.isGroup && skill.groupName ? skill.groupName : 'Individual Worker'}
                  </h2>
                </div>

                {/* Skill Details */}
                <p className="text-gray-700 mb-1">{skill.skillDescription}</p>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Clock className="h-4 w-4" />
                  <span>{skill.availability}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <DollarSign className="h-4 w-4" />
                  <span>KES {skill.charges.toLocaleString()}</span>
                </div>

                {/* Past Work */}
                {skill.pastWorkFiles.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Image className="h-4 w-4" />
                      <span>Past Work:</span>
                    </div>
                    <div
                      className="flex gap-2 mt-1 overflow-x-auto"
                      style={{
                        scrollbarWidth: 'thin',
                        scrollbarColor: '#14b8a6 #e5e7eb',
                      }}
                    >
                      {skill.pastWorkFiles.map((fileUrl, index) => (
                        <img
                          key={index}
                          src={fileUrl}
                          alt={`Past work ${index + 1}`}
                          className="h-20 w-20 object-cover rounded"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Info */}
                <div className="text-gray-600 text-sm mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{skill.contact.phone}</span>
                  </div>
                  {skill.contact.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <a
                        href={skill.contact.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-500 hover:underline"
                      >
                        {skill.contact.website}
                      </a>
                    </div>
                  )}
                  {skill.contact.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{skill.contact.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{skill.contact.location}</span>
                  </div>
                </div>

                {/* Contact Button */}
                <button
                  onClick={() => navigate(`/skill/${skill._id}`)}
                  className="mt-3 w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
                >
                  See More
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default FindSkill;