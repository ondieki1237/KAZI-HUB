"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Search, CheckCheck, ArrowLeft, Home } from "lucide-react"
import Link from "next/link"
import { chat } from "../services/api"
import { useAuth } from "../contexts/AuthContext"

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
  lastMessage?: {
    content: string
    createdAt: string
    senderId: string
    read: boolean
  }
  unreadCount: number
}

export default function Conversations() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchConversations = useCallback(async (silent = false) => {
    if (!currentUser) return

    try {
      if (!silent) setLoading(true)
      if (silent) setIsRefreshing(true)

      const response = await chat.getConversations()
      setConversations(response)
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [currentUser])

  useEffect(() => {
    fetchConversations()
    const interval = setInterval(() => fetchConversations(true), 10000)
    return () => clearInterval(interval)
  }, [fetchConversations])

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.recipientId.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobId.title.toLowerCase().includes(searchQuery.toLowerCase()),
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
    router.push(`/chat/${jobId}/${userId}`)
  }

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-lg text-gray-600">Please log in to view your messages</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600"
        >
          Log In
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100">
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link href="/" className="p-2 rounded-full hover:bg-gray-100">
                <Home className="h-5 w-5" />
              </Link>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b">
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
      <div className="flex-1 overflow-y-auto">
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
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation._id}
                onClick={() => navigateToChat(conversation.jobId._id, conversation.recipientId._id)}
                className={`px-4 py-4 sm:px-6 hover:bg-gray-50 cursor-pointer ${
                  conversation.unreadCount > 0 ? "bg-teal-50" : "bg-white"
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={
                        conversation.recipientId.avatar ||
                        `https://ui-avatars.com/api/?name=${conversation.recipientId.name}`
                      }
                      alt={conversation.recipientId.name}
                      className="h-12 w-12 rounded-full"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm font-medium truncate ${
                          conversation.unreadCount > 0 ? "text-gray-900" : "text-gray-700"
                        }`}
                      >
                        {conversation.recipientId.name}
                      </p>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{conversation.jobId.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-sm truncate ${
                          conversation.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {conversation.lastMessage ? (
                          conversation.lastMessage.senderId === currentUser._id ? (
                            <span className="flex items-center">
                              <span className="mr-1">You:</span>
                              {conversation.lastMessage.content}
                              {conversation.lastMessage.read ? (
                                <CheckCheck className="h-3 w-3 ml-1 text-teal-500 flex-shrink-0" />
                              ) : (
                                <CheckCheck className="h-3 w-3 ml-1 text-gray-400 flex-shrink-0" />
                              )}
                            </span>
                          ) : (
                            conversation.lastMessage.content
                          )
                        ) : (
                          "Start a conversation"
                        )}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-teal-500 rounded-full">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="absolute bottom-4 right-4 bg-teal-600 text-white px-3 py-1 rounded-full text-sm shadow-lg flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-2 border-white mr-2"></div>
          Updating...
        </div>
      )}
    </div>
  )
}
