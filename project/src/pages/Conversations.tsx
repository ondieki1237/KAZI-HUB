"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MessageSquare, Search, CheckCheck, ArrowLeft, Home, Phone, Video } from "lucide-react"
import { chat } from "../services/api"
import { useAuth } from "../contexts/AuthContext"
import toast from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'

interface Conversation {
  _id: string
  jobId: {
    _id: string
    title: string
  }
  recipientId: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  senderId: {
    _id: string
    name: string
    email: string
    avatar?: string
  }
  lastMessage?: {
    content: string
    createdAt: string
    senderId: string
    read: boolean
  }
  unreadCount: number
}

interface Message {
  _id: string
  content: string
  senderId: string
  recipientId: string
  jobId: string
  createdAt: string
  read: boolean
}

const Conversations: React.FC = () => {
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchConversations = useCallback(async (silent = false) => {
    if (!currentUser?._id) return

    try {
      if (!silent) setLoading(true)
      if (silent) setIsRefreshing(true)

      console.log('Fetching conversations for user:', currentUser._id)
      const response = await chat.getConversations()
      console.log('Conversations response:', response)
      
      if (Array.isArray(response)) {
        const transformedConversations = response.map(conv => ({
          ...conv,
          recipientId: conv.senderId._id === currentUser._id ? conv.recipientId : conv.senderId
        }))
        console.log('Transformed conversations:', transformedConversations)
        setConversations(transformedConversations)
      } else {
        console.error("Invalid response format:", response)
        setConversations([])
      }
    } catch (error: any) {
      console.error("Error fetching conversations:", error.response || error)
      toast.error(error.response?.data?.message || "Failed to load conversations")
      setConversations([])
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [currentUser])

  useEffect(() => {
    if (currentUser?._id) {
      fetchConversations()
      const interval = setInterval(() => fetchConversations(true), 10000)
      return () => clearInterval(interval)
    }
  }, [fetchConversations, currentUser])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.recipientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobId.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      // Yesterday
      return "Yesterday"
    } else if (diffDays < 7) {
      // This week - show day name
      return date.toLocaleDateString([], { weekday: "short" })
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: "short", day: "numeric" })
    }
  }

  const navigateToChat = (jobId: string, userId: string) => {
    // Ensure we're navigating to chat with the other participant
    const chatPartnerId = userId === currentUser?._id ? 
      conversations.find(c => c.jobId._id === jobId)?.recipientId._id : 
      userId
    
    if (chatPartnerId) {
      navigate(`/chat/${jobId}/${chatPartnerId}`)
    } else {
      toast.error("Could not find chat partner")
    }
  }

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!currentUser?._id) return

    const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    })

    socketRef.current.on('new_message', (message: Message) => {
      // Update messages if in current chat
      if (selectedChat?.jobId._id === message.jobId) {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      }

      // Update conversations list
      setConversations(prev => prev.map(conv => {
        if (conv.jobId._id === message.jobId) {
          return {
            ...conv,
            lastMessage: {
              content: message.content,
              createdAt: message.createdAt,
              senderId: message.senderId,
              read: message.read
            },
            unreadCount: message.recipientId === currentUser._id ? conv.unreadCount + 1 : conv.unreadCount
          }
        }
        return conv
      }))
    })

    return () => {
      socketRef.current?.disconnect()
    }
  }, [currentUser, selectedChat])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Fetch messages when selecting a chat
  useEffect(() => {
    if (selectedChat && currentUser?._id) {
      const fetchMessages = async () => {
        try {
          const response = await chat.getMessages(selectedChat.jobId._id, selectedChat.recipientId._id)
          setMessages(response)
          scrollToBottom()
        } catch (error) {
          console.error('Error fetching messages:', error)
          toast.error('Failed to load messages')
        }
      }
      fetchMessages()
    }
  }, [selectedChat, currentUser])

  const sendMessage = async () => {
    if (!selectedChat || !newMessage.trim() || !currentUser?._id) return

    try {
      const message = await chat.sendMessage(
        selectedChat.jobId._id,
        newMessage.trim(),
        selectedChat.recipientId._id
      )

      setMessages(prev => [...prev, message])
      setNewMessage("")
      scrollToBottom()

      // Emit message via socket
      socketRef.current?.emit('send_message', message)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
    }
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600">Please log in to view your messages</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"
        >
          Log In
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List - Hide on mobile when chat is selected */}
      <div className={`${
        isMobile && selectedChat ? 'hidden' : 'w-full md:w-1/3'
      } bg-white border-r border-gray-200`}>
        {/* Header */}
        <div className="bg-teal-600 text-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-4">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-teal-700">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-semibold">Messages</h1>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-full hover:bg-teal-700">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-full hover:bg-teal-700">
                  <Phone className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white h-[calc(100vh-120px)]">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <MessageSquare className="h-12 w-12 mb-2" />
              <p className="text-lg">No conversations found</p>
              {searchQuery && <p className="text-sm mt-1">Try a different search term</p>}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedChat(conversation)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                    selectedChat?._id === conversation._id ? "bg-teal-50" : ""
                  } ${conversation.unreadCount > 0 ? "bg-teal-50/60" : ""}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 relative">
                      <img
                        src={
                          conversation.recipientId.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            conversation.recipientId.name
                          )}&background=26A69A&color=fff`
                        }
                        alt={conversation.recipientId.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      {conversation.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.recipientId.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                        </p>
                      </div>
                      <p className="text-xs text-teal-600 font-medium truncate mt-0.5">
                        {conversation.jobId.title}
                      </p>
                      <div className="flex items-center mt-0.5">
                        {conversation.lastMessage && conversation.lastMessage.senderId === currentUser._id && (
                          <CheckCheck className={`h-4 w-4 mr-1 ${
                            conversation.lastMessage.read ? "text-teal-500" : "text-gray-400"
                          }`} />
                        )}
                        <p className="text-sm text-gray-500 truncate">
                          {conversation.lastMessage
                            ? `${conversation.lastMessage.senderId === currentUser._id ? "You: " : ""}${
                                conversation.lastMessage.content
                              }`
                            : "Start a conversation"}
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
      <div className={`${
        isMobile && !selectedChat ? 'hidden' : 'flex flex-col flex-1'
      }`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center">
              {isMobile && (
                <button 
                  onClick={() => setSelectedChat(null)}
                  className="p-2 rounded-full hover:bg-gray-100 mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <img
                src={selectedChat.recipientId.avatar || 
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.recipientId.name)}`}
                alt={selectedChat.recipientId.name}
                className="h-10 w-10 rounded-full mr-3"
              />
              <div>
                <h2 className="font-semibold">{selectedChat.recipientId.name}</h2>
                <p className="text-sm text-gray-500">{selectedChat.jobId.title}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${message.senderId === currentUser._id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      message.senderId === currentUser._id
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <div className="flex items-center justify-end space-x-1 mt-1">
                      <span className="text-xs opacity-75">
                        {formatTime(message.createdAt)}
                      </span>
                      {message.senderId === currentUser._id && (
                        <CheckCheck className={`h-4 w-4 ${message.read ? 'text-blue-400' : 'text-gray-400'}`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 px-4 py-3">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-teal-500 text-white rounded-full px-6 py-2 hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Conversations
