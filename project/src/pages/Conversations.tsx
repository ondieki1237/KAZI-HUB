import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import io from 'socket.io-client';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Conversation {
  _id: string;
  jobId: string;
  participants: { _id: string; name: string; avatar?: string }[];
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await chat.getConversations();
      setConversations(data.sort((a: Conversation, b: Conversation) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      ));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    const newSocket = io(socketUrl, {
      auth: {
        userId: user._id
      }
    });

    newSocket.on('new_message', (message: any) => {
      setConversations(prev => {
        const updated = prev.map(conv =>
          conv._id === message.conversationId
            ? {
                ...conv,
                lastMessage: message.content,
                unreadCount: conv.unreadCount + 1,
                updatedAt: new Date().toISOString()
              }
            : conv
        );
        // Sort conversations by most recent message
        return updated.sort((a: Conversation, b: Conversation) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      });
      
      // Play notification sound
      new Audio('/notification.mp3').play().catch(console.error);
      toast.success('New message received');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user?._id]);

  const handleConversationClick = (conversation: Conversation) => {
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants.find(p => p._id !== user?._id);
    if (!otherParticipant) return;

    // Navigate to the chat page with jobId and userId
    navigate(`/chat/${conversation.jobId}/${otherParticipant._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-bold">Messages</h1>
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No conversations yet</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {conversations.map(conversation => (
              <li
                key={conversation._id}
                onClick={() => handleConversationClick(conversation)}
                className="flex items-center justify-between p-4 bg-white shadow rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center flex-1">
                  <img
                    src={conversation.participants[0].avatar || `https://ui-avatars.com/api/?name=${conversation.participants[0].name}`}
                    alt={conversation.participants[0].name}
                    className="h-12 w-12 rounded-full mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {conversation.participants[0].name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="ml-4 flex items-center">
                    <span className="bg-teal-500 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Conversations;