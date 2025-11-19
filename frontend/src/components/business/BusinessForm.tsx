import React from "react";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";

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

      <InputField
        label="Бизнесийн төрөл"
        placeholder="Жишээ: Салон, Шүдний эмнэлэг, Спорт клуб..."
        value={value.category}
        onChange={(v) => onChange("category", v)}
      />

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
