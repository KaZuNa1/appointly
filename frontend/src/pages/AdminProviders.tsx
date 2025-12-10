import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Briefcase, Search, ChevronLeft, ChevronRight, Trash2, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";

interface Provider {
  id: string;
  businessName: string;
  nickname: string;
  category: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone?: string;
  };
  services: any[];
  _count: {
    appointments: number;
    services: number;
  };
}

export default function AdminProviders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      toast.error("Админ эрх шаардлагатай");
      navigate("/");
      return;
    }

    if (user && user.role === "ADMIN") {
      fetchProviders();
    }
  }, [user, navigate, currentPage]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (search) {
        params.append("search", search);
      }

      const res = await api.get(`/admin/providers?${params.toString()}`);
      setProviders(res.data.providers);
      setTotalPages(res.data.totalPages);
    } catch (err: any) {
      console.error("Failed to fetch providers:", err);
      toast.error(err.response?.data?.msg || "Бизнесүүд татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProviders();
  };

  const handleDeleteProvider = async (providerId: string, businessName: string) => {
    if (!confirm(`Та ${businessName} бизнесийг устгахдаа итгэлтэй байна уу?`)) {
      return;
    }

    try {
      await api.delete(`/admin/providers/${providerId}`);
      toast.success("Бизнес амжилттай устгагдлаа");
      fetchProviders();
    } catch (err: any) {
      console.error("Failed to delete provider:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    }
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
            <Briefcase className="w-8 h-8" />
            Бизнесүүд
          </h1>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Бизнесийн нэр хайх..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Уншиж байна...</p>
            </div>
          </div>
        ) : providers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Бизнес олдсонгүй</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {providers.map((provider) => (
                <div
                  key={provider.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900">{provider.businessName}</h3>
                      <p className="text-sm text-indigo-600 font-medium">{provider.nickname}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                        {provider.category}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteProvider(provider.id, provider.businessName)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    {provider.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {provider.phone}
                      </div>
                    )}
                    {provider.city && provider.district && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {provider.city}, {provider.district}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {provider._count.appointments}
                        </p>
                        <p className="text-xs text-gray-600">Захиалга</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-indigo-600">
                          {provider._count.services}
                        </p>
                        <p className="text-xs text-gray-600">Үйлчилгээ</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mt-2">
                          {new Date(provider.createdAt).toLocaleDateString("mn-MN")}
                        </p>
                        <p className="text-xs text-gray-500">Бүртгүүлсэн</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-xs font-medium text-gray-700 mb-1">Эзэмшигч:</p>
                    <p className="text-sm text-gray-900">{provider.user.fullName}</p>
                    <p className="text-xs text-gray-500">{provider.user.email}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex items-center justify-between">
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
      </main>

      <Footer />
    </div>
  );
}
