import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BUSINESS_TYPES, ServiceTemplate } from "@/data/businessTypes";
import api from "@/lib/api";

interface Provider {
  id: string;
  businessName: string;
  category: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  description: string;
  user: {
    fullName: string;
    email: string;
  };
  services: {
    id: string;
    name: string;
    duration: number;
    price: number;
    description: string | null;
  }[];
}

const Services: React.FC = () => {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceTemplate | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleServiceClick = async (service: ServiceTemplate) => {
    setSelectedService(service);
    setShowModal(true);
    setLoading(true);

    try {
      const serviceName = encodeURIComponent(service.name);
      const res = await api.get(`/providers/by-service/${serviceName}`);
      setProviders(res.data.providers || []);
    } catch (err) {
      console.error("Error fetching providers:", err);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderClick = (providerId: string) => {
    navigate(`/providers/${providerId}`);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setProviders([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Header */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Үйлчилгээ сонгох
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Та авахыг хүссэн үйлчилгээгээ сонгоод, тухайн үйлчилгээ үзүүлэгчдээс сонгож цаг захиална.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1">
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-6">
            {BUSINESS_TYPES.map((businessType) => (
              <div key={businessType.id} className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  {businessType.label}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {businessType.services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-500 transition text-left"
                    >
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-gray-600 text-sm">
                          {service.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Providers Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedService?.name}
                </h2>
                <p className="text-gray-600 mt-1">
                  Үйлчилгээ үзүүлэгч сонгох
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">Уншиж байна...</p>
                </div>
              ) : providers.length > 0 ? (
                <div className="space-y-4">
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      onClick={() => handleProviderClick(provider.id)}
                      className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:border-indigo-500 hover:shadow-md transition cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {provider.businessName}
                          </h3>
                          <p className="text-gray-600 text-sm mb-3">
                            {provider.description || "Үйлчилгээний тайлбар байхгүй"}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {provider.city && (
                              <span>📍 {provider.city}{provider.district ? `, ${provider.district}` : ""}</span>
                            )}
                            {provider.phone && (
                              <span>📞 {provider.phone}</span>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 text-right">
                          {provider.services[0] && (
                            <>
                              <p className="text-2xl font-bold text-indigo-600">
                                {provider.services[0].price.toLocaleString()}₮
                              </p>
                              <p className="text-sm text-gray-500">
                                {provider.services[0].duration} минут
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-lg">
                    Энэ үйлчилгээг үзүүлэгч одоогоор байхгүй байна
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Дараа дахин оролдоно уу
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Services;
