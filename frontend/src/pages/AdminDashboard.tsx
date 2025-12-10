import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Users,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingUp,
  Activity,
  Search,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface Stats {
  totalUsers: number;
  totalProviders: number;
  totalBookings: number;
  totalServices: number;
  totalRevenue: number;
  newUsersThisWeek: number;
  newBookingsThisWeek: number;
  bookingsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  details?: any;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== "ADMIN") {
      toast.error("Админ эрх шаардлагатай");
      navigate("/");
      return;
    }

    if (user && user.role === "ADMIN") {
      fetchData();
    }
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/recent-activity?limit=10"),
      ]);

      setStats(statsRes.data);
      setRecentActivity(activityRes.data);
    } catch (err: any) {
      console.error("Failed to fetch admin data:", err);
      toast.error(err.response?.data?.msg || "Өгөгдөл татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Уншиж байна...</p>
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Нийт хэрэглэгч",
      value: stats.totalUsers,
      icon: Users,
      color: "bg-blue-500",
      change: `+${stats.newUsersThisWeek} энэ долоо хоногт`,
    },
    {
      title: "Нийт бизнес",
      value: stats.totalProviders,
      icon: Briefcase,
      color: "bg-purple-500",
    },
    {
      title: "Нийт захиалга",
      value: stats.totalBookings,
      icon: Calendar,
      color: "bg-green-500",
      change: `+${stats.newBookingsThisWeek} энэ долоо хоногт`,
    },
    {
      title: "Нийт орлого",
      value: `${stats.totalRevenue.toLocaleString()}₮`,
      icon: DollarSign,
      color: "bg-yellow-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Админ самбар</h1>
          <p className="text-gray-600 mt-2">Платформын үйл ажиллагааг хянах</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              {stat.change && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Booking Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Захиалгын төлөв</h3>
            <div className="space-y-3">
              {stats.bookingsByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 capitalize">
                    {item.status === "PENDING"
                      ? "Хүлээгдэж буй"
                      : item.status === "CONFIRMED"
                      ? "Баталгаажсан"
                      : item.status === "CANCELLED"
                      ? "Цуцлагдсан"
                      : "Дууссан"}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Үйлдлүүд</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/admin/users")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Хэрэглэгчид</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => navigate("/admin/providers")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Бизнесүүд</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => navigate("/admin/bookings")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Захиалгууд</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() => navigate("/admin/audit-logs")}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-900">Үйл явдлын лог</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Сүүлийн үйл явдлууд
          </h3>
          <div className="space-y-3">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">Үйл явдал байхгүй</p>
            ) : (
              recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-indigo-600 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {log.action.replace(/_/g, " ")}
                    </p>
                    {log.user && (
                      <p className="text-xs text-gray-600 mt-1">
                        {log.user.fullName} ({log.user.email})
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(log.timestamp).toLocaleString("mn-MN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
