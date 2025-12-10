import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
  entityId?: string;
  details?: any;
  user?: {
    id: string;
    fullName: string;
    email: string;
    role: string;
  };
}

export default function AdminAuditLogs() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      toast.error("Админ эрх шаардлагатай");
      navigate("/");
      return;
    }

    if (user && user.role === "ADMIN") {
      fetchLogs();
    }
  }, [user, navigate, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/audit-logs?page=${currentPage}&limit=50`);
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch audit logs:", err);
      toast.error(err.response?.data?.msg || "Үйл явдлын лог татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    if (action.includes("DELETE") || action.includes("CANCELLED")) {
      return "bg-red-100 text-red-800";
    } else if (action.includes("CREATE") || action.includes("REGISTER")) {
      return "bg-green-100 text-green-800";
    } else if (action.includes("UPDATE") || action.includes("CHANGE")) {
      return "bg-blue-100 text-blue-800";
    } else if (action.includes("LOGIN")) {
      return "bg-purple-100 text-purple-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <ChevronLeft className="w-5 h-5" />
            Буцах
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Activity className="w-8 h-8" />
            Үйл явдлын лог
          </h1>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Уншиж байна...</p>
              </div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Үйл явдал олдсонгүй</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Үйлдэл
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Хэрэглэгч
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Дэлгэрэнгүй
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Огноо
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getActionColor(
                              log.action
                            )}`}
                          >
                            {log.action.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {log.user ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {log.user.fullName}
                              </div>
                              <div className="text-sm text-gray-500">{log.user.email}</div>
                              <div className="text-xs text-gray-400">{log.user.role}</div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {log.details ? (
                            <pre className="text-xs text-gray-600 max-w-md overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-sm text-gray-500">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString("mn-MN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Хуудас {currentPage} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
