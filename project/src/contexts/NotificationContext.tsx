import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { jobs, chat } from '../services/api';
import toast from 'react-hot-toast';
import io from 'socket.io-client';
import { Bell } from 'lucide-react';

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
  type: 'jobAccepted' | 'jobRejected' | 'jobApplication';
  jobId: string;
  jobTitle: string;
  message?: string;
}

export type Notification = MessageNotification | JobNotification;

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsRead: (id: string) => void;
  socket: any;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

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

        // Fetch job applications status
        const appliedJobs = await jobs.getWorkerApplications(user.id);
        const jobNotifications = appliedJobs
          .filter((app: any) => app.status === 'accepted' || app.status === 'rejected')
          .map((app: any) => ({
            type: app.status === 'accepted' ? 'jobAccepted' : 'jobRejected',
            jobId: app.jobId._id,
            jobTitle: app.jobId.title,
            message: app.status === 'accepted' 
              ? 'Congratulations! Your job application has been accepted.' 
              : 'Your job application was not selected this time.',
          }));

        setNotifications([...unreadMessages, ...jobNotifications]);
        setUnreadCount(unreadMessages.length + jobNotifications.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchInitialNotifications();

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated, user]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !user) return;

    // New message notification
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
        setUnreadCount(prev => prev + 1);
        
        // Show toast notification
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell className="h-10 w-10 text-teal-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    New Message
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {message.content}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/chat/${message.jobId}/${message.senderId._id}`);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
              >
                View
              </button>
            </div>
          </div>
        ), {
          duration: 5000,
        });

        // Play notification sound
        new Audio('/notification.mp3').play().catch(console.error);
      }
    });

    // Job application status update
    socket.on('application_status_updated', (data: { jobId: string; jobTitle: string; workerId: string; status: 'accepted' | 'rejected' }) => {
      if (data.workerId === user.id) {
        const newNotification: JobNotification = {
          type: data.status === 'accepted' ? 'jobAccepted' : 'jobRejected',
          jobId: data.jobId,
          jobTitle: data.jobTitle,
          message: data.status === 'accepted'
            ? 'Congratulations! Your job application has been accepted.'
            : 'Your job application was not selected this time.',
        };

        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? 'animate-enter' : 'animate-leave'
            } max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <Bell className="h-10 w-10 text-teal-500" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    Job Application {data.status === 'accepted' ? 'Accepted' : 'Rejected'}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {data.jobTitle}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  navigate(`/jobs/${data.jobId}`);
                }}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-teal-600 hover:text-teal-500 focus:outline-none"
              >
                View
              </button>
            </div>
          </div>
        ), {
          duration: 5000,
        });

        // Play notification sound
        new Audio('/notification.mp3').play().catch(console.error);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('application_status_updated');
    };
  }, [socket, user, navigate]);

  const clearNotification = (id: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => (n as MessageNotification)._id !== id);
      setUnreadCount(filtered.length);
      return filtered;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => {
        if ((n as MessageNotification)._id === id) {
          return { ...n, read: true };
        }
        return n;
      });
      setUnreadCount(updated.filter(n => !n.read).length);
      return updated;
    });
  };

  const value = {
    notifications,
    unreadCount,
    clearNotification,
    clearAllNotifications,
    markAsRead,
    socket
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 