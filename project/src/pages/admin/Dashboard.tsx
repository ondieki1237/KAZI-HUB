import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { Home, Users, Briefcase, Wrench, Activity, Trash2 } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  totalUsers: number;
  totalJobs: number;
  totalSkills: number;
  activeUsers: number;
  jobsByCategory: { name: string; value: number }[];
  usersByRole: { name: string; value: number }[];
  recentActivities: {
    _id: string;
    user: string;
    action: string;
    timestamp: string;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalJobs: 0,
    totalSkills: 0,
    activeUsers: 0,
    jobsByCategory: [],
    usersByRole: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.email !== 'admin@gmail.com') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('Token being sent:', token);

      if (!token) {
        throw new Error('No authentication token found');
      }

      await api.get('/admin/test');
      const response = await api.get('/admin/dashboard');
      console.log('Dashboard response:', response);

      if (!response.data) {
        throw new Error('No data received from server');
      }

      setStats(response.data);
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      let errorMessage = 'Failed to load dashboard data';

      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - Please check if the server is running';
      } else if (error.response?.status === 401) {
        errorMessage = 'Unauthorized - Please log in again';
        navigate('/login');
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied - Admin privileges required';
        navigate('/login');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await api.delete(`/admin/activities/${activityId}`);
        toast.success('Activity deleted successfully');
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting activity:', error);
        toast.error('Failed to delete activity');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm mb-6">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-4">
            <Link
              to="/admin/users"
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Users className="h-5 w-5 mr-2" />
              Manage Users
            </Link>
            <Link
              to="/admin/jobs"
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              <Briefcase className="h-5 w-5 mr-2" />
              Manage Jobs
            </Link>
            <Link
              to="/admin/skills"
              className="flex items-center px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              <Wrench className="h-5 w-5 mr-2" />
              Manage Skills
            </Link>
            <button
              onClick={() => navigate('/')}
              className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Users</h3>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-teal-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Jobs</h3>
                <p className="text-2xl font-bold">{stats.totalJobs}</p>
              </div>
              <Briefcase className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Total Skills</h3>
                <p className="text-2xl font-bold">{stats.totalSkills}</p>
              </div>
              <Wrench className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 text-sm">Active Users</h3>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Jobs by Category</h2>
            <div className="w-full overflow-x-auto">
              <BarChart width={500} height={300} data={stats.jobsByCategory} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0088FE" />
              </BarChart>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Users by Role</h2>
            <div className="w-full flex justify-center">
              <PieChart width={400} height={300}>
                <Pie
                  data={stats.usersByRole}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          </div>
        </div>

        {/* Recent Activities Table */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-4 py-3 font-medium text-gray-700">User</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Action</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Time</th>
                  <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-3 text-center text-gray-500">
                      No recent activities found
                    </td>
                  </tr>
                ) : (
                  stats.recentActivities.map((activity) => (
                    <tr key={activity._id} className="border-t hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">{activity.user}</td>
                      <td className="px-4 py-3">{activity.action}</td>
                      <td className="px-4 py-3">
                        {new Date(activity.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteActivity(activity._id)}
                          className="text-red-500 hover:text-red-700 focus:outline-none"
                          title="Delete Activity"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;