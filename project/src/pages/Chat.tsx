import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import PageHeader from '../components/PageHeader';
import { Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

const Chat: React.FC = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Please login to access chat');
      navigate('/login');
      return;
    }

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await chat.getMessages(jobId!);
        setMessages(response);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [jobId, user, navigate]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const response = await chat.sendMessage(jobId!, newMessage.trim());
      setMessages([...messages, response]);
      setNewMessage('');
      // Scroll to bottom
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

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Chat" />
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-3xl mx-auto">
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
              messages.map((message) => (
                <div
                  key={message._id}
                  className={`mb-4 ${
                    message.senderId === user?.id ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.senderId === user?.id
                        ? 'bg-teal-dark text-white'
                        : 'bg-gray-100'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
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
      </main>
    </div>
  );
};

export default Chat; 