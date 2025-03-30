import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bell, MessageSquare, CheckCircle, XCircle, Briefcase, Trash2, BellOff } from 'lucide-react';
import { notifications } from '../services/api'; // Specific import
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import PageHeader from '../components/PageHeader';

// Notification interfaces (unchanged from your version)
interface BaseNotification {
  _id: string;
  userId: string;
  type: 'message' | 'jobAccepted' | 'jobRejected' | 'newJob' | 'applicationSubmitted';
  read: boolean;
  visible: boolean;
  sendAlerts: boolean;
  createdAt: string;
  jobId: string;
  jobTitle: string;
}

interface MessageNotification extends BaseNotification {
  type: 'message';
  senderId: string;
  senderName: string;
  content: string;
}

interface JobStatusNotification extends BaseNotification {
  type: 'jobAccepted' | 'jobRejected';
  employerName: string;
}

interface NewJobNotification extends BaseNotification {
  type: 'newJob';
  employerName: string;
}

interface ApplicationSubmittedNotification extends BaseNotification {
  type: 'applicationSubmitted';
  applicantName: string;
}

type Notification = MessageNotification | JobStatusNotification | NewJobNotification | ApplicationSubmittedNotification;

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notificationsList, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      setError('Please log in to view notifications');
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = storedUser._id || user._id;

        if (!userId || typeof userId !== 'string') {
          throw new Error('Invalid user ID format');
        }

        console.log('Fetching notifications for user:', userId);
        const response = await notifications.getUserNotifications(userId);
        console.log('Notifications response:', response);

        setNotifications(Array.isArray(response) ? response : []);
        await notifications.markAsRead(userId);
        console.log('Marked notifications as read');
      } catch (err: any) {
        console.error('Error fetching notifications:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch notifications';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    const socketUrl = process.env.REACT_APP_API_URL || 'http://192.168.1.157:5000';
    console.log('Connecting to socket at:', socketUrl);
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join', user._id);
    });

    newSocket.on('new_notification', (notification: Notification) => {
      console.log('Received new notification:', notification);
      if (notification.userId === user._id) {
        setNotifications(prev => [notification, ...prev]);
        toast.success('New notification received!');
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      toast.error('Failed to connect to real-time updates');
    });

    newSocket.on('reconnect', (attempt) => {
      console.log('Socket reconnected after attempt:', attempt);
      toast.success('Reconnected to real-time updates');
    });

    return () => {
      newSocket.disconnect();
      console.log('Socket disconnected');
    };
  }, [user?._id]);

  const handleToggleAlerts = async (notificationId: string) => {
    try {
      if (!notificationId || typeof notificationId !== 'string') throw new Error('Invalid notification ID');
      await notifications.toggleAlerts(notificationId);
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, sendAlerts: !notification.sendAlerts }
            : notification
        )
      );
      toast.success('Notification preferences updated');
    } catch (err) {
      console.error('Error toggling alerts:', err);
      toast.error('Failed to update notification preferences');
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      if (!notificationId || typeof notificationId !== 'string') throw new Error('Invalid notification ID');
      await notifications.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notification => notification._id !== notificationId));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Error deleting notification:', err);
      toast.error('Failed to delete notification');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        navigate(`/chat/${notification.jobId}/${notification.senderId}`);
        break;
      case 'jobAccepted':
      case 'jobRejected':
      case 'newJob':
      case 'applicationSubmitted':
        navigate(`/jobs/${notification.jobId}`);
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="w-5 h-5" />;
      case 'jobAccepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'jobRejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'newJob':
        return <Briefcase className="w-5 h-5" />;
      case 'applicationSubmitted':
        return <Bell className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const renderNotificationContent = (notification: Notification) => {
    switch (notification.type) {
      case 'message':
        return (
          <div>
            <p className="font-medium">{notification.senderName}</p>
            <p className="text-sm text-gray-600">{notification.content}</p>
          </div>
        );
      case 'jobAccepted':
        return (
          <div>
            <p className="font-medium">Job Accepted</p>
            <p className="text-sm text-gray-600">
              Your application for {notification.jobTitle} has been accepted by {notification.employerName}
            </p>
          </div>
        );
      case 'jobRejected':
        return (
          <div>
            <p className="font-medium">Job Rejected</p>
            <p className="text-sm text-gray-600">
              Your application for {notification.jobTitle} has been rejected by {notification.employerName}
            </p>
          </div>
        );
      case 'newJob':
        return (
          <div>
            <p className="font-medium">New Job Posted</p>
            <p className="text-sm text-gray-600">
              {notification.employerName} posted a new job: {notification.jobTitle}
            </p>
          </div>
        );
      case 'applicationSubmitted':
        return (
          <div>
            <p className="font-medium">New Application</p>
            <p className="text-sm text-gray-600">
              {notification.applicantName} applied for {notification.jobTitle}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Notifications" />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-dark"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Notifications" />
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Notifications" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center">
          <Bell className="h-6 w-6 mr-2 text-teal-600" />
          Notifications
        </h1>
        {notificationsList.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No notifications yet
          </div>
        ) : (
          <div className="space-y-4">
            {notificationsList.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow p-4 flex items-start space-x-4 cursor-pointer ${
                  !notification.read ? 'border-l-4 border-teal-500' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-grow">
                  {renderNotificationContent(notification)}
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleAlerts(notification._id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title={notification.sendAlerts ? 'Mute notifications' : 'Enable notifications'}
                  >
                    {notification.sendAlerts ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNotification(notification._id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;