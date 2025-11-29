import { useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import api from "@/lib/api";
import ProviderFilters from "@/components/providers/ProviderFilters";
import ProviderGrid from "@/components/providers/ProviderGrid";

// Type for provider from backend
interface BackendProvider {
  id: string;
  businessName: string;
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
  };
  services: any[];
  hours: any[];
}

export default function ProvidersPage() {
  const [params] = useSearchParams();
  const serviceSlug = params.get("service") || "";

  const [search, setSearch] = useState("");
  const [providers, setProviders] = useState<BackendProvider[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch providers from backend
  useEffect(() => {
    fetchProviders();
  }, []);

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

  // Filter providers by search query and category
  const filtered = useMemo(() => {
    return providers.filter((p) => {
      const matchesSearch =
        p.businessName.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      // If serviceSlug is provided, filter by category
      const matchesService = serviceSlug
        ? p.category.toLowerCase().includes(serviceSlug.toLowerCase())
        : true;

      return matchesSearch && matchesService;
    });
  }, [providers, search, serviceSlug]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b py-14">
        <div className="max-w-6xl mx-auto px-6 text-center">
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

      {/* Filters and Grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ProviderFilters search={search} onSearchChange={setSearch} />

        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Уншиж байна...</p>
          </div>
        ) : (
          <ProviderGrid providers={filtered} />
        )}
      </div>

      <Footer />
    </div>
  );
}
