import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { PROVIDERS } from "@/components/providers/providerData";
import ProviderFilters from "@/components/providers/ProviderFilters";
import ProviderGrid from "@/components/providers/ProviderGrid";

export default function ProvidersPage() {
  const [params] = useSearchParams();
  const serviceSlug = params.get("service") || "";

  const [search, setSearch] = useState("");

  // Filter providers by:
  // 1) service slug
  // 2) search query
  const filtered = useMemo(() => {
    return PROVIDERS.filter((p) => {
      const matchesService = p.service === serviceSlug;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase());
      return matchesService && matchesSearch;
    });
  }, [serviceSlug, search]);

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
            {serviceSlug ? `“${serviceSlug}” үйлчилгээ үзүүлдэг бизнесүүд` : ""}
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <ProviderFilters search={search} onSearchChange={setSearch} />
        <ProviderGrid providers={filtered} />
      </div>

      <Footer />
    </div>
  );
}
