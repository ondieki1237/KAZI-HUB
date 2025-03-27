import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import { Home, ArrowLeft, Check, CheckCheck } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (silent = false) => {
    if (!jobId || !userId || !user) return;
    
    try {
      if (!silent) setLoading(true);
      if (silent) setIsRefreshing(true);
      
      const response = await chat.getMessages(jobId, userId);
      setMessages(response);
      
      if (!silent) scrollToBottom();
    } catch (error: any) {
      if (!silent) toast.error(error.response?.data?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
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
      } catch (error) {
        console.error('Error fetching recipient details:', error);
      }
    };
    fetchRecipientDetails();
  }, [userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !jobId || !userId || !user) return;

    try {
      const response = await chat.sendMessage(jobId, newMessage.trim(), userId);
      setMessages(prev => [...prev, response]);
      setNewMessage('');
      scrollToBottom();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const SentMessage = ({ message }: { message: Message }) => (
    <div className="flex justify-end mb-4">
      <div className="max-w-[70%]">
        <div className="bg-teal-500 text-white rounded-lg rounded-br-none px-4 py-2 shadow-md">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="flex justify-end items-center mt-1 text-xs text-gray-500">
          <span>{formatTime(message.createdAt)}</span>
          <span className="ml-1">
            {message.read ? (
              <CheckCheck className="h-4 w-4 text-teal-500" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </span>
        </div>
      </div>
    </div>
  );

  const ReceivedMessage = ({ message, showAvatar }: { message: Message; showAvatar: boolean }) => (
    <div className="flex justify-start mb-4">
      {showAvatar && (
        <img
          src={`https://ui-avatars.com/api/?name=${message.senderId.name}`}
          alt={message.senderId.name}
          className="h-8 w-8 rounded-full mr-2 mt-1 flex-shrink-0"
        />
      )}
      <div className="max-w-[70%]">
        {showAvatar && (
          <span className="text-xs text-gray-500 mb-1 block">{message.senderId.name}</span>
        )}
        <div className="bg-white text-gray-800 rounded-lg rounded-bl-none px-4 py-2 shadow-md">
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Navigation Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link to="/" className="p-2 rounded-full hover:bg-gray-100">
                <Home className="h-5 w-5" />
              </Link>
            </div>
            {recipientDetails && (
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900">{recipientDetails.name}</h2>
                <p className="text-sm text-gray-500">{recipientDetails.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
          </div>
        ) : (
          <div>
            {messages.map((message, index) => {
              const isSentByMe = message.senderId._id === user?.id;
              const showAvatar = !isSentByMe && (!messages[index - 1] || messages[index - 1].senderId._id !== message.senderId._id);
              
              return isSentByMe ? (
                <SentMessage key={message._id} message={message} />
              ) : (
                <ReceivedMessage key={message._id} message={message} showAvatar={showAvatar} />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="bg-white border-t p-4">
        <div className="flex gap-2 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>

      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-3 py-1 rounded-full text-sm shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white mr-2"></div>
          Updating...
        </div>
      )}
    </div>
  );
};

export default Chat;