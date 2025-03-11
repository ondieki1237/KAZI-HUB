import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Send, User, Users, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { skills, chat } from '../services/api';

interface Skill {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  isGroup: boolean;
  skillDescription: string;
  groupName?: string | null;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

const SkillChat: React.FC = () => {
  const { skillId, userId } = useParams<{ skillId: string; userId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [skill, setSkill] = useState<Skill | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      toast.error('Please login to chat');
      navigate('/login');
    }
  }, [user, navigate]);

  // Fetch skill and chat history
  useEffect(() => {
    const fetchSkillAndMessages = async () => {
      if (!skillId || !user) return;
      
      setLoading(true);
      try {
        const skillResponse = await skills.getById(skillId);
        const messagesResponse = await chat.getMessages(skillId);
        setSkill(skillResponse);
        setMessages(messagesResponse || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load chat');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkillAndMessages();
  }, [skillId, user]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !skillId) return;

    try {
      const message = {
        content: newMessage,
        senderId: user.id,
        timestamp: new Date().toISOString()
      };

      await chat.sendMessage(skillId, message);
      setMessages([...messages, { ...message, id: Date.now().toString() }]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading chat...</p>
      </div>
    );
  }

  if (!skill) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600 text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/skill/${skillId}`)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              {skill.isGroup ? (
                <Users className="h-6 w-6 text-teal-500" />
              ) : (
                <User className="h-6 w-6 text-teal-500" />
              )}
              <h1 className="text-xl font-semibold text-gray-800">
                {skill.isGroup && skill.groupName ? skill.groupName : 'Worker'}
              </h1>
            </div>
            <span className="text-sm text-gray-600">
              Posted by: {skill.userId.name || skill.userId.email}
            </span>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900"
        >
          <Home className="h-5 w-5 mr-2" />
          Home
        </button>
      </div>

      {/* Chat Container */}
      <div className="flex-grow container mx-auto px-4 py-8 flex flex-col max-w-2xl">
        {/* Messages */}
        <div className="flex-grow bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] p-4 overflow-y-auto max-h-[70vh]">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">Start the conversation!</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.senderId === user?.id
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-75">{message.timestamp}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form
          onSubmit={handleSendMessage}
          className="mt-4 flex items-center gap-2 bg-white p-2 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)]"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border-none rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="bg-teal-500 text-white p-2 rounded hover:bg-teal-600"
            style={{ transition: 'background-color 0.2s ease' }}
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default SkillChat;