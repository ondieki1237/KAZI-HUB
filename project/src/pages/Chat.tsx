import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import { Home, ArrowLeft, Check, CheckCheck, MessageSquare } from 'lucide-react';
import ErrorModal from '../components/ErrorModal';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<{ show: boolean; message: string; severity?: 'error' | 'warning' | 'info' }>({
    show: false,
    message: ''
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (silent = false) => {
    if (!jobId || !userId || !user) return;
    try {
      if (!silent) setLoading(true);
      const response = await chat.getMessages(jobId, userId);
      setMessages(response);
      if (!silent) scrollToBottom();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load messages';
      setError({
        show: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [jobId, userId, user]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(() => fetchMessages(true), 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    const fetchRecipientDetails = async () => {
      if (!userId) return;
      try {
        const response = await chat.getUserDetails(userId);
        setRecipientDetails(response);
      } catch (error: any) {
        setError({
          show: true,
          message: 'Failed to load recipient details',
          severity: 'warning'
        });
      }
    };
    fetchRecipientDetails();
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !jobId || !userId || !user) return;
    try {
      const response = await chat.sendMessage(jobId, newMessage.trim(), userId);
      setMessages((prev) => [...prev, response]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      setError({
        show: true,
        message: error.response?.data?.message || 'Failed to send message',
        severity: 'error'
      });
    }
  };

  // Sent Message Component (Teal, Right-Aligned)
  const SentMessage = ({ message }: { message: Message }) => {
    const formatTime = (dateString: string) =>
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="flex justify-end mb-3">
        <div className="relative max-w-[80%] sm:max-w-[70%] bg-teal-500 text-white rounded-lg px-3 py-2 shadow-md">
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div className="flex items-center justify-end mt-1 text-xs text-white opacity-80">
            <span>{formatTime(message.createdAt)}</span>
            <span className="ml-1">
              {message.read ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          </div>
          <div className="absolute -bottom-1 right-2 w-0 h-0 border-t-[6px] border-t-teal-500 border-l-[6px] border-l-transparent" />
        </div>
      </div>
    );
  };

  // Received Message Component (White/Gray, Left-Aligned)
  const ReceivedMessage = ({ message }: { message: Message }) => {
    const formatTime = (dateString: string) =>
      new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="flex justify-start mb-3">
        <div className="relative max-w-[80%] sm:max-w-[70%] bg-white text-gray-900 rounded-lg px-3 py-2 shadow-md">
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          <div className="text-xs text-gray-500 mt-1">{formatTime(message.createdAt)}</div>
          <div className="absolute -bottom-1 left-2 w-0 h-0 border-t-[6px] border-t-white border-r-[6px] border-r-transparent" />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <ErrorModal
        isOpen={error.show}
        message={error.message}
        severity={error.severity}
        onClose={() => {
          setError({ show: false, message: '' });
          navigate(-1); // Navigate back to the previous page
        }}
      />

      {/* Navigation Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex flex-wrap justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate('/conversations')}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Back to conversations"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <Link to="/" className="p-2 rounded-full hover:bg-gray-100" aria-label="Home">
                <Home className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </div>
            {recipientDetails && (
              <div className="text-center flex-1 min-w-0 px-2 sm:px-4">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {recipientDetails.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{recipientDetails.email}</p>
              </div>
            )}
            <button
              onClick={() => navigate('/conversations')}
              className="p-2 rounded-full hover:bg-gray-100 flex items-center"
              aria-label="All chats"
            >
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1" />
              <span className="hidden sm:inline text-xs sm:text-sm">All Chats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-100 min-h-0">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500" />
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message) => {
              const isSentByMe = String(message.senderId._id) === String(user?.id || user?._id);
              return isSentByMe ? (
                <SentMessage key={message._id} message={message} />
              ) : (
                <ReceivedMessage key={message._id} message={message} />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-gray-100 border-t p-2 sm:p-3 flex items-center">
        <div className="flex w-full max-w-4xl mx-auto gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 sm:px-4 sm:py-2 bg-white border rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-3 py-2 sm:px-4 sm:py-2 bg-teal-500 text-white rounded-full text-sm sm:text-base hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;