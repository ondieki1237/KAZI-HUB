import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import { Home, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  content: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  recipientId: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  read: boolean;
}

const Chat: React.FC = () => {
  const { jobId, userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [recipientDetails, setRecipientDetails] = useState<{ name: string; email: string } | null>(null);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!jobId || !userId || !user) return;
      
      try {
        setLoading(true);
        const response = await chat.getMessages(jobId, userId);
        setMessages(response);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    // Fetch recipient details
    const fetchRecipientDetails = async () => {
      if (!userId) return;
      try {
        const response = await chat.getUserDetails(userId);
        setRecipientDetails(response);
      } catch (error) {
        console.error('Error fetching recipient details:', error);
      }
    };

    fetchMessages();
    fetchRecipientDetails();

    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [jobId, userId, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !jobId || !userId || !user) return;

    try {
      const response = await chat.sendMessage(jobId, newMessage.trim(), userId);
      setMessages(prev => [...prev, response]);
      setNewMessage('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link to="/" className="p-2 rounded-full hover:bg-gray-100">
                <Home className="h-5 w-5" />
              </Link>
            </div>
            {recipientDetails && (
              <div className="text-right">
                <h2 className="text-sm font-medium">{recipientDetails.name}</h2>
                <p className="text-xs text-gray-500">{recipientDetails.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${message.senderId._id === user?.id ? 'justify-end' : 'justify-start'} mb-4`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId._id === user?.id 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-gray-200'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-75">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                  {message.senderId._id === user?.id && (
                    <span className="text-xs ml-2">
                      {message.read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage}
        className="bg-white border-t p-4"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;