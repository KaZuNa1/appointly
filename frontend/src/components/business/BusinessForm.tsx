import React from "react";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { BUSINESS_TYPES } from "@/data/businessTypes";

interface Props {
  value: any;
  onChange: (field: string, value: string) => void;
}

export default function BusinessForm({ value, onChange }: Props) {
  return (
    <div className="space-y-4">
      <InputField
        label="Бүтэн нэр"
        value={value.fullName}
        onChange={(v) => onChange("fullName", v)}
      />

      <InputField
        label="Имэйл"
        type="email"
        value={value.email}
        onChange={(v) => onChange("email", v)}
      />

      <PasswordField
        label="Нууц үг"
        value={value.password}
        onChange={(v) => onChange("password", v)}
      />

      <InputField
        label="Бизнесийн нэр"
        value={value.businessName}
        onChange={(v) => onChange("businessName", v)}
      />

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

      <InputField
        label="Утасны дугаар"
        value={value.phone}
        onChange={(v) => onChange("phone", v)}
      />

      <InputField
        label="Хот"
        value={value.city}
        onChange={(v) => onChange("city", v)}
      />

      <InputField
        label="Дүүрэг"
        value={value.district}
        onChange={(v) => onChange("district", v)}
      />

      <InputField
        label="Хаяг"
        value={value.address}
        onChange={(v) => onChange("address", v)}
      />

      <InputField
        label="Тайлбар"
        value={value.description}
        onChange={(v) => onChange("description", v)}
      />
    </div>
  );
}
