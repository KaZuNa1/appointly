import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getServicesByBusinessType, getServicesGroupedByCategory, ServiceTemplate } from "@/data/businessTypes";
import api from "@/lib/api";

interface AddServiceModalProps {
  businessCategory: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddServiceModal({
  businessCategory,
  onClose,
  onSuccess,
}: AddServiceModalProps) {
  const [availableServices, setAvailableServices] = useState<ServiceTemplate[]>([]);
  const [groupedServices, setGroupedServices] = useState<Record<string, ServiceTemplate[]>>({});
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(null);
  const [customForm, setCustomForm] = useState({
    name: "",
    duration: "",
    price: "",
    description: "",
  });
  const [step, setStep] = useState<"select" | "customize">("select");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load available services for this business type
    const services = getServicesByBusinessType(businessCategory);
    setAvailableServices(services);

    // Group services by category (for beauty salon)
    const grouped = getServicesGroupedByCategory(businessCategory);
    setGroupedServices(grouped);
  }, [businessCategory]);

  const handleSelectService = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setCustomForm({
      name: template.name,
      duration: "",
      price: "",
      description: "",
    });
    setStep("customize");
  };

  const handleBackToSelect = () => {
    setStep("select");
    setSelectedTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate
      if (!customForm.name || !customForm.duration || !customForm.price ||
          Number(customForm.duration) <= 0 || Number(customForm.price) <= 0) {
        alert("Бүх талбарыг бөглөнө үү.");
        return;
      }

      setLoading(true);
      await api.post("/services", customForm);
      alert("Үйлчилгээ амжилттай нэмэгдлээ!");
      onSuccess();
    } catch (err: any) {
      console.error("Add service error:", err);
      alert(err?.response?.data?.msg || "Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {step === "select" ? "Үйлчилгээ сонгох" : "Үйлчилгээ тохируулах"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "select" ? (
            // Step 1: Select Service Template
            <div>
              <p className="text-gray-600 mb-6">
                Таны бизнесийн төрөлд тохирсон үйлчилгээг сонгоно уу
              </p>

              {availableServices.length > 0 ? (
                businessCategory === "beauty" && Object.keys(groupedServices).length > 1 ? (
                  // Beauty salon: Show grouped by subcategories
                  <div className="space-y-6">
                    {Object.entries(groupedServices).map(([category, services]) => (
                      <div key={category}>
                        {category !== 'main' && (
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                            {category}
                          </h3>
                        )}
                        <div className="space-y-2">
                          {services.map((service) => (
                            <button
                              key={service.id}
                              onClick={() => handleSelectService(service)}
                              className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
                            >
                              <h4 className="font-semibold text-gray-900">
                                {service.name}
                              </h4>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Other business types: Show simple list
                  <div className="space-y-2">
                    {availableServices.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleSelectService(service)}
                        className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition"
                      >
                        <h3 className="font-semibold text-gray-900">
                          {service.name}
                        </h3>
                      </button>
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">
                    Энэ бизнесийн төрөлд үйлчилгээ тодорхойлогдоогүй байна
                  </p>
                </div>
              )}
            </div>
          ) : (
            // Step 2: Customize Service
            <div>
              <p className="text-gray-600 mb-6">
                Үнэ, хугацаа, тайлбарыг өөрчилж болно
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Үйлчилгээний нэр
                  </label>
                  <div className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 font-medium">
                    {customForm.name}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Үйлчилгээний нэр нь тогтмол байна
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Үргэлжлэх хугацаа (минут)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={customForm.duration}
                      onChange={(e) =>
                        setCustomForm({
                          ...customForm,
                          duration: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Үнэ (₮)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={customForm.price}
                      onChange={(e) =>
                        setCustomForm({
                          ...customForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тайлбар (сонголттой)
                  </label>
                  <textarea
                    value={customForm.description}
                    onChange={(e) =>
                      setCustomForm({ ...customForm, description: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={handleBackToSelect}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={loading}
                >
                  Буцах
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {loading ? "Хадгалж байна..." : "Үйлчилгээ нэмэх"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
