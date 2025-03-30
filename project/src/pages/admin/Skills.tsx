import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Skill {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
}

const Skills: React.FC = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await api.get('/admin/skills');
      setSkills(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        await api.delete(`/admin/skills/${skillId}`);
        toast.success('Skill deleted successfully');
        fetchSkills();
      } catch (error) {
        console.error('Error deleting skill:', error);
        toast.error('Failed to delete skill');
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Skills Management</h1>
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            <Wrench className="h-5 w-5 mr-2" /> Back to Dashboard
          </button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">Title</th>
              <th className="px-6 py-3 text-left">Category</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill._id} className="border-t">
                <td className="px-6 py-4">{skill.title}</td>
                <td className="px-6 py-4">{skill.category}</td>
                <td className="px-6 py-4">{skill.status}</td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Skills;