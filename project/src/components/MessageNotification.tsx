import React from 'react';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  _id: string;
  jobId: string;
  jobTitle: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  content: string;
  createdAt: string;
  read: boolean;
}

interface MessageNotificationProps {
  unreadMessages: Message[];
  onClose: (messageId: string) => void;
}

const MessageNotification: React.FC<MessageNotificationProps> = ({ 
  unreadMessages, 
  onClose 
}) => {
  return (
    <div className="relative">
      <div className="relative inline-block">
        <Bell className="h-6 w-6" />
        {unreadMessages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {unreadMessages.length}
          </span>
        )}
      </div>
      
      {unreadMessages.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2 border-b border-gray-200">
            <h3 className="text-sm font-semibold">New Messages</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {unreadMessages.map((message) => (
              <Link
                key={message._id}
                to={`/chat/${message.jobId}/${message.senderId._id}`}
                className="block p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                onClick={() => onClose(message._id)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">{message.senderId.name}</p>
                    <p className="text-xs text-gray-500">{message.jobTitle}</p>
                    <p className="text-sm mt-1 text-gray-600 truncate">
                      {message.content}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageNotification; 