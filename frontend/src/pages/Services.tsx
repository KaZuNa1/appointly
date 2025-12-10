import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Scissors, Sparkles, Pen, Stethoscope, Car, Camera, Heart } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BUSINESS_TYPES, ServiceTemplate } from "@/data/businessTypes";

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  barber: Scissors,
  beauty: Sparkles,
  tattoo: Pen,
  dental: Stethoscope,
  carwash: Car,
  photography: Camera,
  psychology: Heart,
};

const Services: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>(BUSINESS_TYPES[0]?.id || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/admin");
    }
  }, [user, navigate]);

  const handleServiceClick = (service: ServiceTemplate) => {
    // Navigate to service results page
    navigate(`/service-results?serviceId=${service.id}&serviceName=${encodeURIComponent(service.name)}`);
  };

  const currentCategory = BUSINESS_TYPES.find(type => type.id === selectedCategory);

  // Get subcategories for the current category
  const subcategories = currentCategory
    ? Array.from(new Set(currentCategory.services.map(s => s.category).filter((c): c is string => Boolean(c))))
    : [];

  // Filter services by subcategory
  const filteredServices = currentCategory
    ? selectedSubcategory === "all"
      ? currentCategory.services
      : currentCategory.services.filter(s => s.category === selectedSubcategory)
    : [];

  // Reset subcategory when category changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory("all");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Үйлчилгээ сонгох
          </h1>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Category Tabs */}
            <div className="mb-10">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                  {BUSINESS_TYPES.map((type) => {
                    const Icon = CATEGORY_ICONS[type.id] || Sparkles;
                    const isActive = selectedCategory === type.id;

                    return (
                      <button
                        key={type.id}
                        onClick={() => handleCategoryChange(type.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl transition ${
                          isActive
                            ? "bg-indigo-600 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${isActive ? "text-white" : "text-indigo-600"}`} />
                        <span className="text-sm font-medium text-center">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Services Grid */}
            {currentCategory && (
              <div>
                <div className="mb-6">
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentCategory.label}
                  </h2>
                  <p className="text-gray-600 mt-2">
                    {filteredServices.length} үйлчилгээ боломжтой
                  </p>
                </div>

                {/* Subcategory Filter (only show if subcategories exist) */}
                {subcategories.length > 0 && (
                  <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedSubcategory("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                          selectedSubcategory === "all"
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-600"
                        }`}
                      >
                        Бүгд
                      </button>
                      {subcategories.map((subcat) => (
                        <button
                          key={subcat}
                          onClick={() => setSelectedSubcategory(subcat)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition capitalize ${
                            selectedSubcategory === subcat
                              ? "bg-indigo-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:border-indigo-600"
                          }`}
                        >
                          {subcat}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  {filteredServices.map((service) => {
                    const CategoryIcon = CATEGORY_ICONS[currentCategory.id] || Sparkles;

                    return (
                      <button
                        key={service.id}
                        onClick={() => handleServiceClick(service)}
                        className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-xl hover:border-indigo-500 hover:-translate-y-1 transition-all duration-200 text-left"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition">
                            <CategoryIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="text-gray-600 text-sm line-clamp-3 min-h-[60px]">
                            {service.description}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Services;
