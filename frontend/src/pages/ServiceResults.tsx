import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, SlidersHorizontal, MapPin, Clock, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { BUSINESS_TYPES, ServiceTemplate } from "@/data/businessTypes";
import { UB_DISTRICTS } from "@/data/locations";

interface Provider {
  id: string;
  businessName: string;
  nickname: string;
  category: string;
  phone?: string;
  city?: string;
  district?: string;
  address?: string;
  description?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
  };
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
    description: string | null;
  }[];
}

type SortOption = "price-asc" | "price-desc" | "duration-asc" | "duration-desc";

const ServiceResults: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const serviceId = searchParams.get("serviceId") || "";
  const serviceName = searchParams.get("serviceName") || "";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>("price-asc");

  // Filter states
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  // Fetch providers
  useEffect(() => {
    fetchProviders();
  }, [serviceName]);

  const fetchProviders = async () => {
    if (!serviceName) return;

    try {
      setLoading(true);
      const encodedServiceName = encodeURIComponent(serviceName);
      const res = await api.get(`/providers/by-service/${encodedServiceName}`);
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique cities and districts from providers
  const availableLocations = useMemo(() => {
    const locationMap: Record<string, Set<string>> = {};

    providers.forEach(p => {
      if (p.city) {
        if (!locationMap[p.city]) {
          locationMap[p.city] = new Set();
        }
        if (p.district) {
          locationMap[p.city].add(p.district);
        }
      }
    });

    // Convert to array format
    return Object.entries(locationMap).map(([city, districts]) => ({
      city,
      districts: Array.from(districts),
      count: providers.filter(p => p.city === city).length
    }));
  }, [providers]);

  // Filter and sort providers
  const filteredAndSortedProviders = useMemo(() => {
    let result = providers.map(provider => {
      // Find the matching service for this provider
      const matchingService = provider.services.find(
        s => s.name.toLowerCase() === serviceName.toLowerCase()
      );

      return {
        ...provider,
        matchingService,
      };
    }).filter(p => p.matchingService); // Only include providers that have this service

    // Apply district filter
    if (selectedDistricts.length > 0) {
      result = result.filter(p => p.district && selectedDistricts.includes(p.district));
    }

    // Apply price range filter
    result = result.filter(p => {
      if (!p.matchingService) return false;
      return p.matchingService.price >= priceRange[0] && p.matchingService.price <= priceRange[1];
    });

    // Sort
    result.sort((a, b) => {
      if (!a.matchingService || !b.matchingService) return 0;

      switch (sortBy) {
        case "price-asc":
          return a.matchingService.price - b.matchingService.price;
        case "price-desc":
          return b.matchingService.price - a.matchingService.price;
        case "duration-asc":
          return a.matchingService.duration - b.matchingService.duration;
        case "duration-desc":
          return b.matchingService.duration - a.matchingService.duration;
        default:
          return 0;
      }
    });

    return result;
  }, [providers, serviceName, selectedDistricts, priceRange, sortBy]);

  // Get price range from available services
  const availablePriceRange = useMemo(() => {
    const prices = providers
      .flatMap(p => p.services)
      .filter(s => s.name.toLowerCase() === serviceName.toLowerCase())
      .map(s => s.price);

    if (prices.length === 0) return [0, 1000000];

    return [Math.min(...prices), Math.max(...prices)];
  }, [providers, serviceName]);

  // Initialize price range filter
  useEffect(() => {
    if (availablePriceRange[0] !== 0 || availablePriceRange[1] !== 1000000) {
      setPriceRange(availablePriceRange as [number, number]);
    }
  }, [availablePriceRange]);

  const toggleDistrict = (district: string) => {
    setSelectedDistricts(prev =>
      prev.includes(district)
        ? prev.filter(d => d !== district)
        : [...prev, district]
    );
  };

  const toggleCityExpansion = (city: string) => {
    setExpandedCity(prev => prev === city ? null : city);
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/providers/${providerId}`);
  };

  // Find the service template for breadcrumb
  const serviceTemplate = useMemo(() => {
    for (const businessType of BUSINESS_TYPES) {
      const service = businessType.services.find(s => s.id === serviceId || s.name === serviceName);
      if (service) {
        return { service, category: businessType };
      }
    }
    return null;
  }, [serviceId, serviceName]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header with Breadcrumb */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/services")}
            className="flex items-center text-gray-600 hover:text-indigo-600 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Үйлчилгээнүүд рүү буцах
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {serviceName}
              </h1>
              {serviceTemplate && (
                <p className="text-gray-600">
                  {serviceTemplate.category.label} • {filteredAndSortedProviders.length} бизнес олдлоо
                </p>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="price-asc">Үнээр: Хямд → Үнэтэй</option>
                <option value="price-desc">Үнээр: Үнэтэй → Хямд</option>
                <option value="duration-asc">Хугацаа: Богино → Урт</option>
                <option value="duration-desc">Хугацаа: Урт → Богино</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-10 w-full">
        {loading ? (
          <div className="text-center py-20">
            <p className="text-xl text-gray-500">Уншиж байна...</p>
          </div>
        ) : (
          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <aside className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Шүүлтүүр
                  </h2>
                </div>

                {/* Location Filter */}
                {availableLocations.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      Байршил
                    </h3>
                    <div className="space-y-1">
                      {availableLocations.map((location) => {
                        const isUB = location.city === "Улаанбаатар";
                        const isExpanded = expandedCity === location.city;
                        const hasDistricts = location.districts.length > 0;

                        return (
                          <div key={location.city}>
                            {/* City/Province */}
                            <button
                              onClick={() => hasDistricts && toggleCityExpansion(location.city)}
                              className="w-full flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded transition text-left"
                            >
                              <span className="text-sm text-gray-700 font-medium">
                                {location.city}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">
                                  {location.count}
                                </span>
                                {hasDistricts && (
                                  isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                  )
                                )}
                              </div>
                            </button>

                            {/* Districts (only for expanded cities) */}
                            {isExpanded && hasDistricts && (
                              <div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                                {location.districts.map((district) => (
                                  <label key={district} className="flex items-center cursor-pointer py-1">
                                    <input
                                      type="checkbox"
                                      checked={selectedDistricts.includes(district)}
                                      onChange={() => toggleDistrict(district)}
                                      className="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">{district}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                    Үнийн хязгаар
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Доод үнэ</label>
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min={availablePriceRange[0]}
                        max={priceRange[1]}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-600 mb-1 block">Дээд үнэ</label>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        min={priceRange[0]}
                        max={availablePriceRange[1]}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {priceRange[0].toLocaleString()}₮ - {priceRange[1].toLocaleString()}₮
                    </p>
                  </div>
                </div>

                {/* Clear Filters */}
                {(selectedDistricts.length > 0 ||
                  priceRange[0] !== availablePriceRange[0] ||
                  priceRange[1] !== availablePriceRange[1]) && (
                  <button
                    onClick={() => {
                      setSelectedDistricts([]);
                      setPriceRange(availablePriceRange as [number, number]);
                    }}
                    className="w-full px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    Шүүлтүүрийг цэвэрлэх
                  </button>
                )}
              </div>
            </aside>

            {/* Results Grid */}
            <div className="flex-1">
              {filteredAndSortedProviders.length > 0 ? (
                <div className="space-y-4">
                  {filteredAndSortedProviders.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => handleProviderClick(provider.id)}
                      className="bg-white rounded-xl p-6 border border-gray-200 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer"
                    >
                      <div className="flex items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {provider.user.avatarUrl ? (
                            <img
                              src={provider.user.avatarUrl}
                              alt={provider.nickname}
                              className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-indigo-100 flex items-center justify-center">
                              <span className="text-2xl font-bold text-indigo-600">
                                {provider.nickname.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {provider.nickname}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {provider.description || "Үйлчилгээний тайлбар байхгүй"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {provider.city && (
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {provider.city}
                                {provider.district && `, ${provider.district}`}
                              </span>
                            )}
                            {provider.matchingService && (
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {provider.matchingService.duration} минут
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        {provider.matchingService && (
                          <div className="flex-shrink-0 text-right">
                            <p className="text-3xl font-bold text-indigo-600 mb-1">
                              {provider.matchingService.price.toLocaleString()}₮
                            </p>
                            <p className="text-sm text-gray-500">
                              {provider.matchingService.duration} минут
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProviderClick(provider.id);
                              }}
                              className="mt-3 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
                            >
                              Цаг авах
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                  <p className="text-xl text-gray-500 mb-2">
                    Энэ үйлчилгээг үзүүлэгч олдсонгүй
                  </p>
                  <p className="text-gray-400 mb-6">
                    Шүүлтүүрээ өөрчилж үзээрэй эсвэл дараа дахин оролдоно уу
                  </p>
                  <button
                    onClick={() => navigate("/services")}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  >
                    Үйлчилгээнүүд рүү буцах
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ServiceResults;
