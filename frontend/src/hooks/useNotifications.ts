import { useState, useEffect } from "react";
import { getUnreadCount } from "@/lib/notifications";
import { useAuth } from "@/contexts/AuthContext";

export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) {
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch only - no polling
    fetchUnreadCount();
  }, [user]);

  return { unreadCount, loading, refetch: fetchUnreadCount };
};
