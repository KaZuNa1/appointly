import { useState, useEffect } from "react";
import { Plus, Tag, Trash2 } from "lucide-react";
import api from "@/lib/api";
import AddServiceModal from "./AddServiceModal";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  description?: string;
}

interface ServicesTabProps {
  businessCategory: string;
}

export default function ServicesTab({ businessCategory }: ServicesTabProps) {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/services");
      setServices(res.data.services || []);
    } catch (err) {
      console.error("Failed to fetch services:", err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceAdded = () => {
    fetchServices(); // Refresh the list
    setShowAddModal(false);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Энэ үйлчилгээг устгах уу?")) return;

    try {
      await api.delete(`/services/${serviceId}`);
      alert("Үйлчилгээ амжилттай устгагдлаа!");
      fetchServices();
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err?.response?.data?.msg || "Алдаа гарлаа.");
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="w-6 h-6" />
            Үйлчилгээнүүд
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Таны бизнесийн үзүүлдэг үйлчилгээнүүд
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          <Plus className="w-5 h-5" />
          Үйлчилгээ нэмэх
        </button>
      </div>

      {/* Services List */}
      {services.length > 0 ? (
        <div className="space-y-3">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>⏱️ {service.duration} минут</span>
                    <span className="text-lg font-bold text-indigo-600">
                      {service.price.toLocaleString()}₮
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Устгах"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 font-medium mb-2">
            Үйлчилгээ нэмэгдээгүй байна
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Үйлчилгээ нэмж эхлээрэй
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus className="w-5 h-5" />
            Үйлчилгээ нэмэх
          </button>
        </div>
      )}

      {/* Add Service Modal */}
      {showAddModal && (
        <AddServiceModal
          businessCategory={businessCategory}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleServiceAdded}
        />
      )}
    </div>
  );
}
