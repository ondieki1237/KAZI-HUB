import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Added to check user authentication
import { chat } from '../services/api';
import PageHeader from '../components/PageHeader';
import Footer from '../components/Footer'; // Added for footer consistency
import { MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast'; // Added for error handling

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
}

const Conversations: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Added to ensure user is logged in
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to view your conversations');
      navigate('/login');
      return;
    }

    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await chat.getConversations(); // Same API call as Chat page
        setConversations(response || []); // Ensure empty array if null
      } catch (error: any) {
        console.error('Error fetching conversations:', error);
        toast.error(error.response?.data?.message || 'Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, navigate]);

  const handleConversationClick = (conversation: Conversation) => {
    navigate(`/chat/${conversation.jobId}/${conversation.otherUser._id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader title="Messages" />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg shadow-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-gray-500">No conversations yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Start chatting by applying to jobs or posting jobs
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={`${conversation.jobId}-${conversation.otherUser._id}`}
                  onClick={() => handleConversationClick(conversation)}
                  className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">{conversation.jobTitle}</h3>
                    <span className="text-sm text-gray-500">
                      {new Date(conversation.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col text-gray-600 mt-2">
                    <div className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span className="font-medium">{conversation.otherUser.name}</span>
                    </div>
                    <span className="text-sm text-gray-500 ml-6">
                      {conversation.otherUser.email}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-2 truncate">{conversation.lastMessage}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Conversations;