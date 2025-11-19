interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}

export default function InputField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  return (
    <div className="mb-5">
      <label className="block text-gray-700 font-medium mb-2">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
      />
    </div>
  );
}
