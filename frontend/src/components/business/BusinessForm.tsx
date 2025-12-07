import React from "react";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { PROVINCES, UB_DISTRICTS } from "@/data/locations";

interface Props {
  value: any;
  onChange: (field: string, value: string) => void;
}

export default function BusinessForm({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      {/* Business Full Name */}
      <InputField
        label="Бизнесийн бүтэн нэр"
        value={value.businessName}
        onChange={(v) => onChange("businessName", v)}
        placeholder="Жишээ: Гоо сайхны төв 'Сайхан'"
      />

      {/* Nickname */}
      <InputField
        label="Хэрэглэгчдэд харагдах нэр (товч)"
        value={value.nickname}
        onChange={(v) => onChange("nickname", v)}
        placeholder="Жишээ: Сайхан"
      />

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Бизнесийн төрөл
        </label>
        <select
          value={value.category}
          onChange={(e) => onChange("category", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Бизнесийн төрөл сонгох</option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.id} value={type.name}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Email */}
      <InputField
        label="Имэйл"
        type="email"
        value={value.email}
        onChange={(v) => onChange("email", v)}
        placeholder="example@gmail.com"
      />

      {/* Password */}
      <PasswordField
        label="Нууц үг"
        value={value.password}
        onChange={(v) => onChange("password", v)}
      />

      {/* Password Repeat */}
      <PasswordField
        label="Нууц үг давтах"
        value={value.confirmPassword}
        onChange={(v) => onChange("confirmPassword", v)}
      />

      {/* Phone Number */}
      <InputField
        label="Утасны дугаар"
        value={value.phone}
        onChange={(v) => onChange("phone", v)}
        placeholder="99991234"
      />

      {/* Address Section Header */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Хаяг</h3>
      </div>

      {/* City/Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Хот/Аймаг
        </label>
        <select
          value={value.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">Хот/Аймаг сонгох</option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown - Only show if Ulaanbaatar is selected */}
      {value.city === "Улаанбаатар" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Дүүрэг
          </label>
          <select
            value={value.district}
            onChange={(e) => onChange("district", e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Дүүрэг сонгох</option>
            {UB_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Detailed Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дэлгэрэнгүй хаяг
        </label>
        <textarea
          value={value.address}
          onChange={(e) => onChange("address", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={3}
          placeholder="Гудамж, байр, орц, тоот..."
        />
      </div>
    </div>
  );
}
