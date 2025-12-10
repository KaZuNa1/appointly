import { useState } from "react";
import { X, Clock, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  selectedDate: string;
  selectedTime: string;
  onSubmit: (serviceId: string, notes: string) => void;
  isSubmitting: boolean;
}

export default function ServiceSelectionModal({
  isOpen,
  onClose,
  services,
  selectedDate,
  selectedTime,
  onSubmit,
  isSubmitting,
}: ServiceSelectionModalProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  if (!isOpen) return null;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("mn-MN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });
  };

  const handleSubmit = () => {
    if (!selectedServiceId) {
      alert("Үйлчилгээ сонгоно уу");
      return;
    }
    onSubmit(selectedServiceId, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-indigo-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Үйлчилгээ сонгох</h2>
            <p className="text-indigo-100 text-sm mt-1">
              {formatDate(selectedDate)} - {selectedTime}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-indigo-700 rounded-lg transition"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Үйлчилгээ сонгох *
            </label>
            <div className="space-y-3">
              {services.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Үйлчилгээ байхгүй байна
                </p>
              ) : (
                services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => setSelectedServiceId(service.id)}
                    className={`w-full p-4 rounded-lg border-2 transition text-left ${
                      selectedServiceId === service.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{service.duration} минут</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span>{service.price.toLocaleString()}₮</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedServiceId === service.id
                            ? "border-indigo-600 bg-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {selectedServiceId === service.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Тэмдэглэл (сонголттой)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Нэмэлт мэдээлэл оруулах..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              rows={4}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              Та энд хүсэл, асуулт, эсвэл нэмэлт мэдээлэл үлдээж болно
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex items-center justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={isSubmitting}
          >
            Болих
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedServiceId}
          >
            {isSubmitting ? "Захиалж байна..." : "Цаг захиалах"}
          </Button>
        </div>
      </div>
    </div>
  );
}
