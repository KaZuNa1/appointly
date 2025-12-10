import React from "react";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { BUSINESS_TYPES } from "@/data/businessTypes";
import { PROVINCES, ALL_DISTRICTS } from "@/data/locations";

interface Props {
  value: any;
  onChange: (field: string, value: string) => void;
  onBlur?: (field: string) => void;
  errors?: Record<string, string>;
  touched?: Record<string, boolean>;
}

export default function BusinessForm({ value, onChange, onBlur, errors = {}, touched = {} }: Props) {
  const showError = (field: string) => touched[field] && errors[field];

  return (
    <div className="space-y-4">
      {/* Owner Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Эзэмшигчийн нэр <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={value.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          onBlur={() => onBlur?.("fullName")}
          placeholder="Жишээ: Бат Болд"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("fullName") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("fullName") && (
          <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Бизнес эзэмшигчийн бүтэн нэр
        </p>
      </div>

      {/* Business Official Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Компанийн албан ёсны нэр <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={value.businessName}
          onChange={(e) => onChange("businessName", e.target.value)}
          onBlur={() => onBlur?.("businessName")}
          placeholder="Жишээ: Гоо сайхны төв 'Сайхан' ХХК"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("businessName") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("businessName") && (
          <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Компанийн бүтэн албан ёсны нэр (Бүртгэлтэй нэр)
        </p>
      </div>

      {/* Company Nickname */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Компанийн товч нэр <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={value.nickname}
          onChange={(e) => onChange("nickname", e.target.value)}
          onBlur={() => onBlur?.("nickname")}
          placeholder="Жишээ: Сайхан"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("nickname") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("nickname") && (
          <p className="mt-1 text-sm text-red-600">{errors.nickname}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Хэрэглэгчдэд харагдах богино, дурсамжтай нэр
        </p>
      </div>

      {/* Business Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Бизнесийн төрөл <span className="text-red-500">*</span>
        </label>
        <select
          value={value.category}
          onChange={(e) => onChange("category", e.target.value)}
          onBlur={() => onBlur?.("category")}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("category") ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value=""></option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type.id} value={type.name}>
              {type.label}
            </option>
          ))}
        </select>
        {showError("category") && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Имэйл <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          value={value.email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => onBlur?.("email")}
          placeholder="example@gmail.com"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("email") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("email") && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Нууц үг <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={value.password}
          onChange={(e) => onChange("password", e.target.value)}
          onBlur={() => onBlur?.("password")}
          placeholder="••••••••"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("password") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("password") && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        {!showError("password") && (
          <p className="mt-1 text-xs text-gray-500">
            Дор хаяж 8 тэмдэгт, үсэг болон тоо агуулсан байх ёстой
          </p>
        )}
      </div>

      {/* Password Repeat */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Нууц үг давтах <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          value={value.confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          onBlur={() => onBlur?.("confirmPassword")}
          placeholder="••••••••"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("confirmPassword") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("confirmPassword") && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Утасны дугаар <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={value.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          onBlur={() => onBlur?.("phone")}
          placeholder="99991234"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
            showError("phone") ? "border-red-500" : "border-gray-300"
          }`}
        />
        {showError("phone") && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      {/* Address Section Header */}
      <div className="pt-4 border-t">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Хаяг <span className="text-gray-400 text-sm font-normal">(заавал биш)</span>
        </h3>
      </div>

      {/* City/Province Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Хот/Аймаг <span className="text-gray-400 text-xs">(заавал биш)</span>
        </label>
        <select
          value={value.city}
          onChange={(e) => onChange("city", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value=""></option>
          {PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>

      {/* District Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дүүрэг <span className="text-gray-400 text-xs">(заавал биш)</span>
        </label>
        <select
          value={value.district}
          onChange={(e) => onChange("district", e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value=""></option>
          {ALL_DISTRICTS.map((district) => (
            <option key={district} value={district}>
              {district}
            </option>
          ))}
        </select>
      </div>

      {/* Detailed Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Дэлгэрэнгүй хаяг <span className="text-gray-400 text-xs">(заавал биш)</span>
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
