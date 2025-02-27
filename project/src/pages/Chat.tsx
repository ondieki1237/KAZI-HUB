import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { chat } from '../services/api';
import { Send, ArrowLeft, MessageSquare } from 'lucide-react';
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

  // Styles
  const styles = {
    chatContainer: {
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
      maxWidth: '400px',
      margin: 'auto',
      border: '1px solid #ccc',
      borderRadius: '10px',
      backgroundColor: '#f9f9f9',
    },
    message: {
      display: 'flex',
      marginBottom: '10px',
    },
    messageContent: {
      maxWidth: '70%',
      padding: '10px',
      borderRadius: '10px',
      position: 'relative',
    },
    messageText: {
      margin: '0',
    },
  };

  // Memoized message list with better sender/receiver differentiation
  const MessageList = useMemo(() => (
    <div style={{ height: 'calc(100vh - 300px)', overflowY: 'auto', padding: '16px', backgroundColor: '#f9f9f9' }}>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '32px', width: '32px', borderBottom: '2px solid #2563eb' }}></div>
        </div>
      ) : messages.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#6b7280' }}>
          <MessageSquare style={{ height: '48px', width: '48px', marginBottom: '8px' }} />
          <p>No messages yet</p>
          <p style={{ fontSize: '14px' }}>Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => {
          const isCurrentUser = message.senderId === user?.id;

          return (
            <div
              key={message._id}
              style={{ display: 'flex', marginBottom: '16px', justifyContent: isCurrentUser ? 'flex-end' : 'flex-start' }}
            >
              <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', alignItems: isCurrentUser ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    padding: '8px 16px',
                    borderRadius: '16px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                    backgroundColor: isCurrentUser ? '#008080' : '#ffffff',
                    color: isCurrentUser ? '#ffffff' : '#000000',
                    borderBottomRightRadius: isCurrentUser ? '0' : '16px',
                    borderBottomLeftRadius: isCurrentUser ? '16px' : '0',
                  }}
                >
                  {message.content}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginTop: '4px',
                    textAlign: isCurrentUser ? 'right' : 'left',
                    marginRight: isCurrentUser ? '8px' : '0',
                    marginLeft: isCurrentUser ? '0' : '8px',
                  }}
                >
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  ), [loading, messages, user?.id]);

  // Memoized conversation list with active chat highlighting
  const ConversationList = useMemo(() => (
    <div style={{ width: '33%', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <h2 style={{ fontWeight: '600' }}>Conversations</h2>
      </div>
      <div style={{ overflowY: 'auto', height: 'calc(100vh - 300px)' }}>
        {conversationsLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '128px' }}>
            <div style={{ animation: 'spin 1s linear infinite', borderRadius: '50%', height: '32px', width: '32px', borderBottom: '2px solid #2563eb' }}></div>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#6b7280', padding: '16px' }}>No conversations found</div>
        ) : (
          conversations.map((conv) => (
            <div
              key={`${conv.jobId}-${conv.otherUser._id}`}
              onClick={() => handleConversationClick(conv)}
              style={{
                padding: '16px',
                borderBottom: '1px solid #e5e7eb',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                backgroundColor: conv.jobId === jobId && conv.otherUser._id === userId ? '#f0f9ff' : 'transparent',
                borderLeft: conv.jobId === jobId && conv.otherUser._id === userId ? '4px solid #008080' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <h3 style={{ fontWeight: '500', color: '#1f2937', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {conv.jobTitle}
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  {new Date(conv.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', color: '#4b5563' }}>{conv.otherUser.name}</span>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>{conv.otherUser.email}</span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginTop: '4px' }}>
                {conv.lastMessage}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  ), [conversations, conversationsLoading, jobId, userId]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <main style={{ maxWidth: '1536px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', gap: '16px', maxWidth: '1536px', margin: '0 auto' }}>
          {ConversationList}
          <div style={{ width: '66%', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
            {otherUser && (
              <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontWeight: '500', color: '#1f2937' }}>{otherUser.name}</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280' }}>{otherUser.email}</p>
                  </div>
                  <button
                    onClick={() => navigate(-1)}
                    style={{ padding: '8px', borderRadius: '50%', transition: 'background-color 0.2s', cursor: 'pointer' }}
                  >
                    <ArrowLeft style={{ height: '20px', width: '20px', color: '#4b5563' }} />
                  </button>
                </div>
              </div>
            )}
            {MessageList}
            <form onSubmit={handleSendMessage} style={{ padding: '16px', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  disabled={sending}
                  style={{
                    flex: '1',
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    outline: 'none',
                    focus: { ring: '2px', ringColor: '#008080' },
                    disabled: { backgroundColor: '#f3f4f6' },
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '8px',
                    transition: 'background-color 0.2s',
                    backgroundColor: sending || !newMessage.trim() ? '#9ca3af' : '#008080',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: sending || !newMessage.trim() ? 'not-allowed' : 'pointer',
                  }}
                >
                  <Send style={{ height: '20px', width: '20px' }} />
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