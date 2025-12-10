import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { PROVINCES, ALL_DISTRICTS } from "@/data/locations";

interface Props {
  providerData: any;
  onRefresh: () => void;
}

export default function InfoTab({ providerData, onRefresh }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: providerData?.fullName || "",
    businessName: providerData?.providerProfile?.businessName || "",
    nickname: providerData?.providerProfile?.nickname || "",
    category: providerData?.providerProfile?.category || "",
    phone: providerData?.providerProfile?.phone || "",
    city: providerData?.providerProfile?.city || "",
    district: providerData?.providerProfile?.district || "",
    address: providerData?.providerProfile?.address || "",
    description: providerData?.providerProfile?.description || "",
    latitude: providerData?.providerProfile?.latitude || "",
    longitude: providerData?.providerProfile?.longitude || "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Update user fullName
      await api.put("/auth/profile", {
        fullName: form.fullName,
      });

      // Update provider profile
      await api.put("/providers/profile", {
        businessName: form.businessName,
        nickname: form.nickname,
        category: form.category,
        phone: form.phone,
        city: form.city,
        district: form.district,
        address: form.address,
        description: form.description,
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
      });

      alert("Мэдээлэл амжилттай шинэчлэгдлээ!");
      setIsEditing(false);
      onRefresh(); // Refresh data
    } catch (err: any) {
      console.error("Update error:", err);
      alert(err?.response?.data?.msg || "Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form to original values
    setForm({
      fullName: providerData?.fullName || "",
      businessName: providerData?.providerProfile?.businessName || "",
      nickname: providerData?.providerProfile?.nickname || "",
      category: providerData?.providerProfile?.category || "",
      phone: providerData?.providerProfile?.phone || "",
      city: providerData?.providerProfile?.city || "",
      district: providerData?.providerProfile?.district || "",
      address: providerData?.providerProfile?.address || "",
      description: providerData?.providerProfile?.description || "",
      latitude: providerData?.providerProfile?.latitude || "",
      longitude: providerData?.providerProfile?.longitude || "",
    });
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Бизнесийн мэдээлэл</h1>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>Засах</Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="space-y-6">
          {/* Owner's Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Эзэмшигчийн нэр
            </label>
            {isEditing ? (
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{form.fullName || "—"}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Бизнес эзэмшигчийн хувийн нэр
            </p>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имэйл
            </label>
            <p className="text-gray-900 py-2">{providerData?.email || "—"}</p>
            <p className="text-xs text-gray-500 mt-1">
              Имэйл хаягийг өөрчлөх боломжгүй
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Компанийн мэдээлэл</h3>
          </div>

          {/* Company Nickname (Display Name) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Компанийн товч нэр
            </label>
            {isEditing ? (
              <input
                type="text"
                value={form.nickname}
                onChange={(e) => handleChange("nickname", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2 text-lg font-semibold">{form.nickname || "—"}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Хэрэглэгчдэд харагдах богино, дурсамжтай нэр
            </p>
          </div>

          {/* Company Official Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Компанийн албан ёсны нэр
            </label>
            {isEditing ? (
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => handleChange("businessName", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{form.businessName || "—"}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Компанийн бүртгэлтэй албан ёсны нэр
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Бизнесийн төрөл
            </label>
            <p className="text-gray-900 py-2">
              {BUSINESS_TYPES.find(t => t.name === form.category)?.label || form.category || "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Бизнесийн төрөл нь бүртгүүлсний дараа өөрчлөх боломжгүй
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Утасны дугаар
            </label>
            {isEditing ? (
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{form.phone || "—"}</p>
            )}
          </div>

          {/* City/Province */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хот/Аймаг
            </label>
            {isEditing ? (
              <select
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value=""></option>
                {PROVINCES.map((province) => (
                  <option key={province} value={province}>
                    {province}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 py-2">{form.city || "—"}</p>
            )}
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дүүрэг
            </label>
            {isEditing ? (
              <select
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value=""></option>
                {ALL_DISTRICTS.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 py-2">{form.district || "—"}</p>
            )}
          </div>

          {/* Detailed Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дэлгэрэнгүй хаяг
            </label>
            {isEditing ? (
              <textarea
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                rows={3}
                placeholder="Гудамж, байр, орц, тоот..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2 whitespace-pre-wrap">{form.address || "—"}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Тайлбар
            </label>
            {isEditing ? (
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{form.description || "—"}</p>
            )}
          </div>

          {/* Latitude & Longitude - Side by Side */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Latitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Өргөргийн координат
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.000001"
                  value={form.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                  placeholder="e.g., 47.9214"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2">{form.latitude || "—"}</p>
              )}
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                🗺️ Уртрагийн координат
              </label>
              {isEditing ? (
                <input
                  type="number"
                  step="0.000001"
                  value={form.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                  placeholder="e.g., 106.9154"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              ) : (
                <p className="text-gray-900 py-2">{form.longitude || "—"}</p>
              )}
            </div>
          </div>

          {/* Google Maps Location */}
          {form.latitude && form.longitude && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📍 Байршилын газрын зураг
              </label>
              <div className="rounded-lg overflow-hidden border border-gray-200 h-80">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://maps.google.com/maps?q=${form.latitude},${form.longitude}&output=embed`}
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Координат: {form.latitude}, {form.longitude}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={loading} className="flex-1">
                {loading ? "Хадгалж байна..." : "Хадгалах"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Болих
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
