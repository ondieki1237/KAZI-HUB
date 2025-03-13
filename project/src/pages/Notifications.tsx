import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { jobs, chat } from '../services/api';
import { Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

interface MessageNotification {
  type: 'message';
  _id: string;
  jobId: string;
  jobTitle: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface JobNotification {
  type: 'jobAccepted' | 'jobRejected';
  jobId: string;
  jobTitle: string;
}

type Notification = MessageNotification | JobNotification;

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAuthenticated = Boolean(user?.id || user?._id);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Initialize Socket.IO and fetch initial notifications
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setLoading(false);
      return;
    }

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch initial notifications
    const fetchInitialNotifications = async () => {
      try {
        // Fetch unread messages
        const conversations = await chat.getConversations();
        const unreadMessages = conversations.reduce((acc: MessageNotification[], conv: any) => {
          if (conv.unreadCount > 0) {
            acc.push({
              type: 'message',
              _id: conv._id,
              jobId: conv.jobId,
              jobTitle: conv.jobTitle,
              senderId: conv.otherUser._id,
              content: conv.lastMessage,
              createdAt: conv.updatedAt,
            });
          }
          return acc;
        }, []);

        // Fetch recent job applications (assuming worker role)
        const appliedJobs = await jobs.getWorkerApplications(user.id);
        const jobNotifications = appliedJobs
          .filter((app: any) => app.status === 'accepted' || app.status === 'rejected')
          .map((app: any) => ({
            type: app.status === 'accepted' ? 'jobAccepted' : 'jobRejected',
            jobId: app.jobId._id,
            jobTitle: app.jobId.title,
          }));

        setNotifications([...unreadMessages, ...jobNotifications]);
      } catch (error) {
        console.error('Error fetching initial notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialNotifications();

    return () => newSocket.close();
  }, [isAuthenticated, user]);

  // Socket.IO listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    // New message listener
    socket.on('new_message', (message: any) => {
      if (message.recipientId._id === user.id && !message.read) {
        const newNotification: MessageNotification = {
          type: 'message',
          _id: message._id,
          jobId: message.jobId,
          jobTitle: message.jobTitle || 'Unknown Job',
          senderId: message.senderId._id,
          content: message.content,
          createdAt: message.createdAt,
        };
        setNotifications(prev => [newNotification, ...prev]);
        new Audio('/notification.mp3').play().catch(console.error);
        toast.success('New message received!');
      }
    });

    // Job status change listener (for workers)
    socket.on('application_status_updated', (data: { jobId: string; jobTitle: string; workerId: string; status: 'accepted' | 'rejected' }) => {
      if (data.workerId === user.id) {
        const newNotification: JobNotification = {
          type: data.status === 'accepted' ? 'jobAccepted' : 'jobRejected',
          jobId: data.jobId,
          jobTitle: data.jobTitle,
        };
        setNotifications(prev => [newNotification, ...prev]);
        new Audio('/notification.mp3').play().catch(console.error);
        toast.success(`Job application ${data.status}!`);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('application_status_updated');
    };
  }, [socket, user]);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === 'message') {
      navigate(`/chat/${notification.jobId}/${notification.senderId}`);
    } else {
      navigate(`/jobs/${notification.jobId}`);
    }
  };

  const handleNotificationClose = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => (n as MessageNotification)._id !== notificationId));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Please log in to view notifications.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <Bell className="h-6 w-6 mr-2 text-teal-600" />
            Notifications
          </h1>
          <span className="text-sm text-gray-500">
            {notifications.length} {notifications.length === 1 ? 'notification' : 'notifications'}
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg shadow-sm">
            <p className="text-gray-500 text-lg">No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div
                key={notification.type === 'message' ? (notification as MessageNotification)._id : `${notification.jobId}-${index}`}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => handleNotificationClick(notification)}
              >
                <div>
                  {notification.type === 'message' ? (
                    <>
                      <p className="font-semibold text-gray-800">New Message</p>
                      <p className="text-gray-600 text-sm">
                        {notification.content} <span className="text-gray-400">— {notification.jobTitle}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-gray-800">
                        Job Application {notification.type === 'jobAccepted' ? 'Accepted' : 'Rejected'}
                      </p>
                      <p className="text-gray-600 text-sm">{notification.jobTitle}</p>
                    </>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent navigation when closing
                    handleNotificationClose((notification as MessageNotification)._id || `${notification.jobId}-${index}`);
                  }}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;