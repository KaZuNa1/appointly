import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export default function PasswordField({
  label,
  value,
  onChange,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="mb-5">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>

      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-12 px-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />

        <button
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShow(!show)}
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}
