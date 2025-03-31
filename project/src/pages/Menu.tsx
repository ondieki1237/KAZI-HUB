import { chat } from "../services/api";
import { useCallback } from "react";

const Menu = () => {
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await chat.getConversations();
      const unreadCount = response.reduce((acc: number, conv: any) => 
        acc + (conv.unreadCount || 0), 0);
      setUnreadMessageCount(unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);
  // ... rest of component
} 