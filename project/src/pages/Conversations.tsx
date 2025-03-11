import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chat } from '../services/api';
import PageHeader from '../components/PageHeader';
import { MessageSquare } from 'lucide-react';

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
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await chat.getConversations();
        setConversations(response);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Messages" />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-dark"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center text-gray-500">No conversations yet</div>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => (
                <div
                  key={`${conversation.jobId}-${conversation.otherUser._id}`}
                  onClick={() =>
                    navigate(`/chat/${conversation.jobId}/${conversation.otherUser._id}`)
                  }
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
    </div>
  );
};

export default Conversations;