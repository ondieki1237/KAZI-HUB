import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import PageHeader from '../components/PageHeader';
import { Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  senderId: string;
  recipientId: string;
  content: string;
  createdAt: string;
}

interface ChatUser {
  _id: string;
  name: string;
  email: string;
}

interface Conversation {
  jobId: string;
  jobTitle: string;
  otherUser: ChatUser;
  lastMessage: string;
  updatedAt: string;
}

const Chat: React.FC = () => {
  const { jobId, userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<ChatUser | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);

  // Fetch messages for the current chat
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await chat.getMessages(jobId!, userId!);
      setMessages(response);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [jobId, userId]);

  // Fetch user details for the other user
  const fetchUserDetails = useCallback(async () => {
    try {
      const response = await chat.getUserDetails(userId!);
      setOtherUser(response);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  }, [userId]);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      setConversationsLoading(true);
      const response = await chat.getConversations();
      setConversations(response);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    if (!user) {
      toast.error('Please login to access chat');
      navigate('/login');
      return;
    }

    fetchMessages();
    if (userId) {
      fetchUserDetails();
    }
    fetchConversations();

    // Polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [user, navigate, fetchMessages, fetchUserDetails, fetchConversations, userId]);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await chat.sendMessage(jobId!, userId!, newMessage.trim());
      setMessages((prev) => [...prev, response]);
      setNewMessage('');
      // Scroll to the bottom of the chat
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  // Handle clicking on a conversation
  const handleConversationClick = (conversation: Conversation) => {
    navigate(`/chat/${conversation.jobId}/${conversation.otherUser._id}`);
  };

  // Memoized message list with better sender/receiver differentiation
  const MessageList = useMemo(() => (
    <div className="chat-messages h-[calc(100vh-300px)] overflow-y-auto p-4">
      {loading ? (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No messages yet. Start the conversation!
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.senderId === user?.id;
          return (
            <div
              key={message._id}
              className={`mb-4 flex ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] ${
                  isCurrentUser ? 'order-2' : 'order-1'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isCurrentUser
                      ? 'bg-teal-dark text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{message.content}</p>
                </div>
                <div
                  className={`text-xs text-gray-500 mt-1 ${
                    isCurrentUser ? 'text-right' : 'text-left'
                  }`}
                >
                  {new Date(message.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  ), [loading, messages, user]);

  // Memoized conversation list with active chat highlighting
  const ConversationList = useMemo(() => (
    <div className="w-1/3 bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Conversations</h2>
      </div>
      <div className="overflow-y-auto h-[calc(100vh-300px)]">
        {conversationsLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 p-4">No conversations found</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={`${conv.jobId}-${conv.otherUser._id}`}
              onClick={() => handleConversationClick(conv)}
              className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${
                conv.jobId === jobId && conv.otherUser._id === userId
                  ? 'bg-teal-50 border-l-4 border-teal-dark'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-medium text-gray-800 truncate">
                  {conv.jobTitle}
                </h3>
                <span className="text-xs text-gray-500">
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600">{conv.otherUser.name}</span>
                <span className="text-xs text-gray-500">{conv.otherUser.email}</span>
              </div>
              <p className="text-sm text-gray-500 truncate mt-1">
                {conv.lastMessage}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  ), [conversations, conversationsLoading, jobId, userId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Chat" />
      <main className="container mx-auto px-4 py-8">
        <div className="flex gap-4 max-w-6xl mx-auto">
          {ConversationList}
          <div className="w-2/3 bg-white rounded-lg shadow-md overflow-hidden">
            {otherUser && (
              <div className="p-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{otherUser.name}</h3>
                    <p className="text-sm text-gray-500">{otherUser.email}</p>
                  </div>
                </div>
              </div>
            )}
            {MessageList}
            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-dark disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className={`px-6 py-2 rounded-lg transition-colors ${
                    sending || !newMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-teal-dark hover:bg-teal-medium'
                  } text-white`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Chat;