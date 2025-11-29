import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import { SERVICES } from "@/components/services/servicesData";
import ServiceSearch from "@/components/services/ServiceSearch";
import ServiceGrid from "@/components/services/ServiceGrid";

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return SERVICES;

    const q = searchQuery.toLowerCase();
    return SERVICES.filter(
      (service) =>
        service.name.toLowerCase().includes(q) ||
        service.desc.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleServiceClick = (slug: string) => {
    // later this will go to providers list filtered by service
    navigate(`/providers?service=${slug}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Shared navbar */}
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Үйлчилгээ сонгох
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Та авахыг хүссэн үйлчилгээгээ сонгоод, дараагийн алхам дээр тухайн
            төрлийн үйлчилгээ үзүүлэгчдээс сонгож цаг захиална.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            <ServiceSearch value={searchQuery} onChange={setSearchQuery} />
            <ServiceGrid
              services={filteredServices}
              onServiceClick={handleServiceClick}
            />
          </div>
        </section>
      </main>

      {/* Shared footer */}
      <Footer />
    </div>
  );
};

export default Services;
