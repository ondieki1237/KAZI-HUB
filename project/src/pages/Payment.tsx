import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobs } from '../services/api';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Home } from 'lucide-react';
import Footer from '../components/Footer';
import { io, Socket } from 'socket.io-client';
import './Payment.css';

interface JobDetails {
  _id: string;
  title: string;
  budget: number;
  employerId: {
    _id: string;
    email?: string;
    name?: string;
    phone?: string;
  };
}

interface PaymentNotification {
  _id: string;
  paymentId: string;
  jobId: string;
  status: 'initiated' | 'completed' | 'failed';
  amount: number;
  userId: string;
  message: string;
  createdAt: string;
}

// Add these styles at the top of your file, after the imports
const styles = {
  container: `min-h-screen bg-gray-50 flex flex-col`,
  header: `flex items-center justify-between p-4 bg-white shadow-sm`,
  headerTitle: `text-xl font-semibold text-gray-800`,
  homeButton: `flex items-center px-4 py-2 text-gray-600 hover:text-gray-900`,
  mainContent: `flex-grow container mx-auto px-4 py-8`,
  paymentCard: `bg-white rounded-lg shadow-md p-6 max-w-md mx-auto`,
  jobDetails: `mb-6`,
  amountDisplay: `mb-6`,
  ratingGroup: `mb-6`,
  stars: `flex gap-2`,
  starButton: `focus:outline-none transition-colors`,
  submitButton: `w-full py-3 px-4 rounded-lg text-white font-medium 
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500
    bg-teal-500 hover:bg-teal-600 active:bg-teal-700`,
  confirmPopup: `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4`,
  popupContent: `bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4`,
};

const Payment: React.FC = () => {
  const { jobId, workerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  // Check authentication first
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !user) {
      toast.error('Please login to make payments');
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!user?._id || !jobId) return;

    const isProduction = import.meta.env.MODE === 'production';
    const SOCKET_URL = isProduction 
      ? 'https://kazi-hub.onrender.com'  // Your Render Backend URL
      : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

    if (socketRef.current) {
      socketRef.current.disconnect();  // Disconnect previous socket if exists
    }

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      path: '/socket.io',  // Make sure this matches your backend Socket.IO path
      transports: ['websocket'], // Force WebSocket (optional, helps avoid polling issues)
      withCredentials: true,
    });

    console.log('🟢 Connected to Socket:', SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      socketRef.current?.emit('join', user._id);
    });

    socketRef.current.on('payment_update', (notification: PaymentNotification) => {
      console.log('Received payment update:', notification);
      if (notification.userId === user._id && notification.jobId === jobId) {
        if (notification.status === 'completed') {
          toast.success('Payment completed successfully!');
          navigate(`/jobs/${jobId}`);
        } else if (notification.status === 'failed') {
          toast.error(notification.message || 'Payment failed');
        } else {
          toast.success('Payment initiated. Please complete on your phone.');
        }
      }
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to real-time payment updates');
    });

    socketRef.current.on('disconnect', () => {
      console.warn('🔌 Socket disconnected');
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🛑 Socket disconnected on component unmount');
      }
    };
  }, [user?._id, jobId, navigate]);

  // Fetch job details
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch job details including employer's phone
        const jobResponse = await jobs.getById(jobId!);
        
        // Fetch employer's phone number
        const employerResponse = await axios.get(
          `${isProduction ? 'https://kazi-hub.onrender.com' : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000')}/api/users/${jobResponse.employerId._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setJobDetails({
          ...jobResponse,
          employerId: {
            ...jobResponse.employerId,
            phone: employerResponse.data.phone
          }
        });

      } catch (error: any) {
        console.error('Error fetching details:', error);
        toast.error(error.response?.data?.message || 'Failed to load payment details');
        navigate('/jobs');
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to make payments');
      navigate('/login');
      return;
    }
    
    if (!rating) {
      toast.error('Please provide a rating');
      return;
    }
    
    if (!jobDetails) {
      toast.error('Job details not found');
      return;
    }

    if (!jobDetails.employerId.phone) {
      toast.error('Employer phone number not found');
      return;
    }
    
    setShowConfirmPopup(true);
  };

  const confirmPayment = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const isProduction = import.meta.env.MODE === 'production';
      const API_URL = isProduction 
        ? 'https://kazi-hub.onrender.com' 
        : (import.meta.env.VITE_API_URL || 'http://192.168.1.246:5000');

      if (!token) {
        throw new Error('No authentication token found');
      }

      // First create payment record
      const paymentRecord = await axios.post(
        `${API_URL}/api/payments`,
        {
          jobId,
          workerId,
          employerId: jobDetails!.employerId._id,
          amount: jobDetails!.budget,
          rating
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Format phone number for M-Pesa
      const formattedPhone = jobDetails!.employerId.phone!.startsWith('+254')
        ? jobDetails!.employerId.phone!.slice(1)
        : jobDetails!.employerId.phone!.startsWith('0')
          ? '254' + jobDetails!.employerId.phone!.slice(1)
          : jobDetails!.employerId.phone;

      // Then initiate M-Pesa payment
      const mpesaResponse = await axios.post(
        `${API_URL}/api/mpesa/send-payment`,
        {
          phoneNumber: formattedPhone,
          amount: jobDetails!.budget,
          paymentId: paymentRecord.data.payment._id
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (mpesaResponse.data.ResponseCode === '0') {
        toast.success('Payment initiated successfully! Please complete the payment on your phone.');
        // Note: Navigation is handled by the socket 'payment_update' event for 'completed' status
      } else {
        toast.error('Payment failed to initiate');
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setLoading(false);
      setShowConfirmPopup(false);
    }
  };

  if (!jobDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.headerTitle}>Payment for Job</h1>
        <button
          onClick={() => navigate('/')}
          className={styles.homeButton}
        >
          <Home className="h-5 w-5 mr-2" />
          Home
        </button>
      </div>

      <div className={styles.mainContent}>
        <div className={styles.paymentCard}>
          <div className={styles.jobDetails}>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">{jobDetails.title}</h2>
            <p className="text-lg text-gray-600">Amount to Pay: KES {jobDetails.budget.toLocaleString()}</p>
            <p className="text-lg text-gray-600">To: {jobDetails.employerId.phone}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={styles.amountDisplay}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount
              </label>
              <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-center">
                <span className="text-2xl font-semibold text-gray-900">
                  KES {jobDetails.budget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.ratingGroup}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate the Work
              </label>
              <div className={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className={styles.starButton}
                  >
                    <svg
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || rating === 0}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processing...
                </div>
              ) : (
                `Pay KES ${jobDetails.budget.toLocaleString()}`
              )}
            </button>
          </form>
        </div>
      </div>

      {showConfirmPopup && (
        <div className={styles.confirmPopup}>
          <div className={styles.popupContent}>
            <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
            <p className="text-gray-700 mb-6">
              Confirm you are to pay{' '}
              <span className="font-medium">{jobDetails.employerId.phone}</span>{' '}
              KES {jobDetails.budget.toLocaleString()}.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmPopup(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={confirmPayment}
                className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center min-w-[80px]"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Payment;