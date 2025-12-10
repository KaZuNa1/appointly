import api from "./api";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  bookingId?: string;
  providerId?: string;
  provider?: {
    id: string;
    businessName: string;
    nickname: string;
  };
  booking?: {
    id: string;
    appointmentTime: string;
    status: string;
  };
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
  };
}

// Get all notifications (paginated)
export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get<NotificationResponse>("/notifications", {
    params: { page, limit },
  });
  return response.data;
};

// Get unread count
export const getUnreadCount = async () => {
  const response = await api.get<{ unreadCount: number }>("/notifications/unread");
  return response.data.unreadCount;
};

// Mark notification as read
export const markAsRead = async (id: string) => {
  const response = await api.post(`/notifications/${id}/read`);
  return response.data;
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  const response = await api.post("/notifications/read-all");
  return response.data;
};

// Delete notification
export const deleteNotification = async (id: string) => {
  const response = await api.delete(`/notifications/${id}`);
  return response.data;
};
