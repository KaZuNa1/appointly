import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import api from "@/lib/api";
import ProviderFilters from "@/components/providers/ProviderFilters";
import ProviderGrid from "@/components/providers/ProviderGrid";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { useAuth } from "@/contexts/AuthContext";
import { getBookmarks, addBookmark, removeBookmark } from "@/lib/bookmarks";
import { toast } from "sonner";

// Type for provider from backend
interface BackendProvider {
  id: string;
  businessName: string;
  nickname: string;
  category: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  services: any[];
  hours: any[];
}

export default function ProvidersPage() {
  const [params] = useSearchParams();
  const serviceSlug = params.get("service") || "";
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [providers, setProviders] = useState<BackendProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Redirect business providers and admins away from this page
  useEffect(() => {
    if (user && user.role === "PROVIDER") {
      toast.error("Бизнес эзэмшигчид энэ хуудсыг үзэх эрхгүй");
      navigate("/provider-dashboard");
    } else if (user && user.role === "ADMIN") {
      navigate("/admin");
    }
  }, [user, navigate]);

  // Fetch providers from backend
  useEffect(() => {
    fetchProviders();
  }, []);

  // Fetch user's bookmarks
  useEffect(() => {
    if (user && user.role === "CUSTOMER") {
      fetchUserBookmarks();
    }
  }, [user]);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/providers");
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error("Failed to fetch providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookmarks = async () => {
    try {
      const bookmarks = await getBookmarks();
      const ids = new Set(bookmarks.map((b) => b.providerId));
      setBookmarkedIds(ids);
    } catch (err) {
      console.error("Failed to fetch bookmarks:", err);
    }
  };

  const handleBookmarkToggle = async (providerId: string) => {
    if (!user) {
      toast.error("Нэвтэрч орсны дараа хадгалах боломжтой");
      return;
    }

    try {
      const isCurrentlyBookmarked = bookmarkedIds.has(providerId);

      // Optimistic UI update
      const newBookmarkedIds = new Set(bookmarkedIds);
      if (isCurrentlyBookmarked) {
        newBookmarkedIds.delete(providerId);
        setBookmarkedIds(newBookmarkedIds);
        await removeBookmark(providerId);
        toast.success("Хадгалгаас хасагдлаа");
      } else {
        newBookmarkedIds.add(providerId);
        setBookmarkedIds(newBookmarkedIds);
        await addBookmark(providerId);
        toast.success("Амжилттай хадгалагдлаа!");
      }
    } catch (err: any) {
      // Revert on error
      fetchUserBookmarks();
      console.error("Failed to toggle bookmark:", err);
      toast.error(err.response?.data?.msg || "Алдаа гарлаа");
    }
  };

  // Filter providers by search query and category
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      const matchesSearch =
        p.businessName.toLowerCase().includes(search.toLowerCase()) ||
        p.nickname.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      // If serviceSlug is provided, filter by category
      const matchesService = serviceSlug
        ? p.category.toLowerCase().includes(serviceSlug.toLowerCase())
        : true;

      // Category filter
      const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;

      return matchesSearch && matchesService && matchesCategory;
    });
  }, [providers, search, serviceSlug, selectedCategory]);

  // Get category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: providers.length };
    providers.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [providers]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b py-14">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Үйлчилгээ үзүүлэгчид
          </h1>
          <p className="text-lg text-gray-600">
            {serviceSlug
              ? `"${serviceSlug}" үйлчилгээ үзүүлдэг бизнесүүд`
              : "Бүртгэлтэй бүх бизнесүүд"}
          </p>
          {!loading && (
            <p className="text-sm text-gray-500 mt-2">
              Нийт {filtered.length} бизнес олдлоо
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        {/* Search Bar */}
        <ProviderFilters search={search} onSearchChange={setSearch} />

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Уншиж байна...</p>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Category Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Ангилал
                </h2>
                <div className="space-y-1">
                  {/* All Categories */}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                      selectedCategory === "all"
                        ? "bg-indigo-50 text-indigo-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>Бүгд</span>
                    <span className="text-sm text-gray-500">
                      {categoryCounts.all || 0}
                    </span>
                  </button>

                  {/* Individual Categories */}
                  {BUSINESS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedCategory(type.id)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                        selectedCategory === type.id
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span>{type.label}</span>
                      <span className="text-sm text-gray-500">
                        {categoryCounts[type.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Providers Grid */}
            <div className="flex-1">
              <ProviderGrid
                providers={filtered}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={handleBookmarkToggle}
                showBookmarks={!!user && user.role === "CUSTOMER"}
              />
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
