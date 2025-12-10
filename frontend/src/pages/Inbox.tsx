import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Bell, Trash2, CheckCheck, Inbox as InboxIcon } from "lucide-react";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from "@/lib/notifications";
import { useUnreadNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { mn } from "date-fns/locale";

export default function Inbox() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { refetch: refetchUnreadCount } = useUnreadNotifications();

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getNotifications(page, 20);
      setNotifications(response.notifications);
      setCurrentPage(response.pagination.currentPage);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === id ? { ...notif, isRead: true } : notif
        )
      );
      // Refetch unread count to update badge
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
      // Refetch unread count
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Энэ мэдэгдлийг устгах уу?")) return;

    try {
      await deleteNotification(id);
      // Remove from local state
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      // Refetch unread count
      refetchUnreadCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, HH:mm", { locale: mn });
  };

  const getSenderName = (notification: Notification) => {
    if (notification.provider) {
      return notification.provider.nickname || notification.provider.businessName;
    }
    return "Систем";
  };

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Нэвтэрч орно уу...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Bell className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Мэдэгдэл</h1>
                  <p className="text-sm text-gray-500">
                    Таны бүх мэдэгдлүүд энд харагдана
                  </p>
                </div>
              </div>

              {notifications.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Бүгдийг уншсан</span>
                </button>
              )}
            </div>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <p className="text-gray-500">Мэдэгдэл уншиж байна...</p>
            </div>
          ) : notifications.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-gray-100 rounded-full">
                  <InboxIcon className="w-12 h-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Мэдэгдэл байхгүй байна
                  </h3>
                  <p className="text-gray-500">
                    Танд шинэ мэдэгдэл ирэхэд энд харагдана
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`bg-white rounded-lg shadow-sm p-5 transition cursor-pointer hover:shadow-md ${
                    !notification.isRead ? "border-l-4 border-indigo-600" : ""
                  }`}
                  onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            Шинэ
                          </span>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                        {notification.message}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <strong>Илгээсэн:</strong> {getSenderName(notification)}
                        </span>
                        <span>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Устгах"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() => fetchNotifications(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Өмнөх
              </button>
              <span className="text-sm text-gray-600">
                Хуудас {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => fetchNotifications(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Дараах
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
