import { useState } from "react";
import { Button } from "@/components/ui/button";
import BusinessCategorySelect from "./BusinessCategorySelect";

export default function BusinessForm() {
  const [form, setForm] = useState({
    businessName: "",
    category: "",
    description: "",
    location: "",
    phone: "",
    ownerName: "",
    email: "",
    password: "",
  });

  const update = (field: string, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const submit = () => {
    console.log("Business registered:", form);
    alert("Business registration submitted! (Backend connection pending)");
  };

  return (
    <div className="space-y-6">
      {/* Business Name */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Бизнесийн нэр
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Жишээ: Deluxe Barber Shop"
          value={form.businessName}
          onChange={(e) => update("businessName", e.target.value)}
        />
      </div>

      {/* Category */}
      <BusinessCategorySelect
        value={form.category}
        onChange={(v) => update("category", v)}
      />

      {/* Description */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Танилцуулга
        </label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-4 py-3 h-28 resize-none focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Үйлчилгээний товч танилцуулга..."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      {/* Location */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Байршил
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Баянзүрх дүүрэг, 26-р хороо..."
          value={form.location}
          onChange={(e) => update("location", e.target.value)}
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Утас
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="88112233"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
      </div>

      {/* Owner Info */}
      <h2 className="text-xl font-semibold text-gray-800 mt-8">
        Эзэмшигчийн мэдээлэл
      </h2>

      {/* Owner Name */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Эзэмшигчийн нэр
        </label>
        <input
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="Жишээ: Бат-Оргил"
          value={form.ownerName}
          onChange={(e) => update("ownerName", e.target.value)}
        />
      </div>

      {/* Email */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">И-мэйл</label>
        <input
          type="email"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="business@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>

      {/* Password */}
      <div>
        <label className="block font-medium text-gray-700 mb-1">
          Нууц үг
        </label>
        <input
          type="password"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="•••••••••"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
      </div>

      {/* Submit */}
      <Button className="w-full py-3 text-lg" onClick={submit}>
        Бүртгүүлэх
      </Button>
    </div>
  );
}
