import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MessageSquare, Search, CheckCheck, ArrowLeft, Home, Phone, Video } from 'lucide-react';
import { chat } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';
import ErrorModal from '../components/ErrorModal';

interface Conversation {
  jobId: string;
  jobTitle: string;
  otherUser: {
    _id: string;
    name: string;
    email: string;
  };
  lastMessage: string;
  updatedAt: string;
  messageCount: number;
  unreadCount: number;
}

interface Message {
  _id: string;
  content: string;
  senderId: string;
  recipientId: string;
  jobId: string;
  createdAt: string;
  read: boolean;
}

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [error, setError] = useState<{ show: boolean; message: string; severity?: 'error' | 'warning' | 'info' }>({
    show: false,
    message: '',
  });

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchConversations = useCallback(async (silent = false) => {
    if (!currentUser?._id && !currentUser?.id) {
      setError({
        show: true,
        message: 'User not authenticated. Please log in.',
        severity: 'warning',
      });
      return;
    }

    try {
      if (!silent) setLoading(true);
      const response = await chat.getConversations();
      console.log('Conversations response:', response);

      if (Array.isArray(response)) {
        setConversations(response);
      } else {
        setError({
          show: true,
          message: 'Failed to load conversations: Invalid response from server',
          severity: 'error',
        });
        setConversations([]);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error.response || error);
      const errorMessage = error.response?.data?.message || 
        (error.response?.status === 404 ? 'No conversations found' : 'Failed to load conversations');
      setError({
        show: true,
        message: errorMessage,
        severity: error.response?.status === 404 ? 'info' : 'error',
      });
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?._id || currentUser?.id) {
      fetchConversations();
      const interval = setInterval(() => fetchConversations(true), 10000);
      return () => clearInterval(interval);
    }
  }, [fetchConversations, currentUser]);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const navigateToChat = (jobId: string) => {
    const conversation = conversations.find((c) => c.jobId === jobId);
    const chatPartnerId = conversation?.otherUser._id;

    if (chatPartnerId) {
      navigate(`/chat/${jobId}/${chatPartnerId}`);
    } else {
      setError({
        show: true,
        message: 'Could not find chat partner',
        severity: 'error',
      });
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (!userId) return;

    const isProduction = import.meta.env.MODE === 'production';
    const SOCKET_URL = isProduction
      ? 'https://kazi-hub.onrender.com'
      : (import.meta.env.VITE_API_URL || 'https://kazi-hub.onrender.com').replace('/api', '');

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      forceNew: true,
    });

    console.log('🟢 Connecting to Socket:', SOCKET_URL);

    socketRef.current.on('connect', () => {
      console.log('🟢 Socket connected');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error.message);
    });

    socketRef.current.on('error', (error) => {
      console.error('🔴 Socket error:', error);
    });

    socketRef.current.on('connect_timeout', () => {
      console.error('🔴 Socket connection timeout');
    });

    socketRef.current.on('new_message', (message: Message) => {
      if (selectedChat?.jobId === message.jobId) {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.jobId === message.jobId) {
            return {
              ...conv,
              lastMessage: message.content,
              updatedAt: message.createdAt,
              unreadCount:
                message.recipientId === userId
                  ? conv.unreadCount + 1
                  : conv.unreadCount,
            };
          }
          return conv;
        })
      );
    });

    socketRef.current.on('disconnect', () => {
      console.warn('🔌 Socket disconnected');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('🛑 Socket disconnected on component unmount');
      }
    };
  }, [currentUser, selectedChat?.jobId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch messages when selecting a chat
  useEffect(() => {
    const userId = currentUser?._id || currentUser?.id;
    if (selectedChat && userId) {
      const fetchMessages = async () => {
        try {
          const response = await chat.getMessages(selectedChat.jobId, selectedChat.otherUser._id);
          if (Array.isArray(response)) {
            setMessages(response);
            scrollToBottom();
          } else {
            setError({
              show: true,
              message: 'Invalid messages response from server',
              severity: 'error',
            });
            setMessages([]);
          }
        } catch (error) {
          console.error('Error fetching messages:', error);
          setError({
            show: true,
            message: 'Failed to load messages',
            severity: 'error',
          });
          setMessages([]);
        }
      };
      fetchMessages();
    }
  }, [selectedChat, currentUser]);

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !currentUser?._id) return;

    try {
      const message = await chat.sendMessage(
        selectedChat.jobId,
        newMessage.trim(),
        selectedChat.otherUser._id
      );

      setMessages((prev) => [...prev, message]);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.jobId === selectedChat.jobId
            ? {
                ...conv,
                lastMessage: message.content,
                updatedAt: message.createdAt,
                messageCount: conv.messageCount + 1,
              }
            : conv
        )
      );
      setNewMessage('');
      scrollToBottom();

      socketRef.current?.emit('send_message', message);
    } catch (error) {
      console.error('Error sending message:', error);
      setError({
        show: true,
        message: 'Failed to send message. Please try again.',
        severity: 'error',
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-4" />
        <p className="text-base sm:text-lg text-gray-600">Please log in to view your messages</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-4 sm:px-6 py-2 bg-teal-500 text-white rounded-full text-sm sm:text-base hover:bg-teal-600"
        >
          Log In
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <ErrorModal
        isOpen={error.show}
        message={error.message}
        severity={error.severity}
        onClose={() => {
          setError({ show: false, message: '' });
          if (error.severity === 'error') navigate('/dashboard'); // Navigate to dashboard on critical errors
        }}
      />
      {/* Conversations List - Hide on mobile when chat is selected */}
      <div
        className={`${
          isMobile && selectedChat ? 'hidden' : 'w-full md:w-1/3 lg:w-1/4'
        } bg-white border-r border-gray-200 min-h-0 flex flex-col`}
      >
        {/* Header */}
        <div className="bg-teal-600 text-white shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
            <div className="flex flex-wrap justify-between items-center py-3 sm:py-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="p-2 rounded-full hover:bg-teal-700"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <Link to="/" className="p-2 rounded-full hover:bg-teal-700" aria-label="Home">
                  <Home className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <h1 className="text-base sm:text-xl font-semibold">Messages</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-teal-700" aria-label="Video call">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-teal-700" aria-label="Phone call">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white sticky top-[64px] sm:top-[72px] z-10">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full bg-gray-50 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-teal-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mb-4" />
              <p className="text-base sm:text-lg text-center">No conversations found</p>
              {searchQuery ? (
                <p className="text-sm mt-2 text-center">Try a different search term</p>
              ) : (
                <p className="text-sm mt-2 text-center">Start applying to jobs to begin conversations</p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.jobId}
                  onClick={() => {
                    setSelectedChat(conversation);
                    navigateToChat(conversation.jobId);
                  }}
                  className={`px-3 sm:px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    selectedChat?.jobId === conversation.jobId ? 'bg-teal-50' : ''
                  } ${conversation.unreadCount > 0 ? 'bg-teal-50/60' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            conversation.otherUser.name
                          )}&background=26A69A&color=fff`
                        }
                        alt={conversation.otherUser.name}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                      />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                          {conversation.otherUser.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.updatedAt && formatTime(conversation.updatedAt)}
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-teal-600 font-medium truncate mt-0.5">
                        {conversation.jobTitle}
                      </p>
                      <div className="flex items-center mt-0.5">
                        <p className="text-xs sm:text-sm text-gray-500 truncate">
                          {conversation.lastMessage
                            ? conversation.lastMessage
                            : 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Window - Show on mobile only when chat is selected */}
      <div
        className={`${
          isMobile && !selectedChat ? 'hidden' : 'flex flex-col flex-1'
        } min-h-0 bg-gray-100`}
      >
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-3 sm:px-4 py-3 flex items-center sticky top-0 z-10">
              {isMobile && (
                <button
                  onClick={() => setSelectedChat(null)}
                  className="p-2 rounded-full hover:bg-gray-100 mr-2"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              )}
              <img
                src={
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    selectedChat.otherUser.name
                  )}&background=26A69A&color=fff`
                }
                alt={selectedChat.otherUser.name}
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full mr-2 sm:mr-3"
              />
              <div className="flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {selectedChat.otherUser.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedChat.jobTitle}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Video call">
                  <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-gray-100" aria-label="Phone call">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 min-h-0">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mb-4" />
                  <p className="text-base sm:text-lg text-center">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.senderId === currentUser._id ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div
                      className={`relative max-w-[80%] sm:max-w-[70%] rounded-lg px-3 sm:px-4 py-2 shadow-md ${
                        message.senderId === currentUser._id
                          ? 'bg-teal-500 text-white'
                          : 'bg-white text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <div className="flex items-center justify-end space-x-1 mt-1">
                        <span className="text-xs opacity-75">
                          {formatTime(message.createdAt)}
                        </span>
                        {message.senderId === currentUser._id && (
                          <CheckCheck
                            className={`h-3.5 w-3.5 ${message.read ? 'text-blue-400' : 'text-gray-400'}`}
                          />
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 ${
                          message.senderId === currentUser._id
                            ? 'right-2 border-t-teal-500 border-l-transparent'
                            : 'left-2 border-t-white border-r-transparent'
                        } w-0 h-0 border-t-[6px] border-l-[6px] border-r-[6px]`}
                      />
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-gray-100 border-t p-2 sm:p-3">
              <div className="flex w-full max-w-4xl mx-auto gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 sm:px-4 py-2 bg-white border rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="px-3 sm:px-4 py-2 bg-teal-500 text-white rounded-full text-sm sm:text-base hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 min-h-0">
            <div className="text-center">
              <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-base sm:text-lg text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Conversations;