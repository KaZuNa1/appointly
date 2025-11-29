import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BusinessForm from "@/components/business/BusinessForm";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    businessName: "",
    category: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    description: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      // validate
      if (!form.fullName || !form.email || !form.password || !form.businessName || !form.category) {
        alert("Бүх шаардлагатай талбарыг бөглөнө үү.");
        return;
      }

      const res = await api.post("/auth/business/register", form);

      if (res.data.token) {
        saveToken(res.data.token); // save JWT to localStorage
      }

      // Refresh user state in AuthContext
      await refreshUser();

      alert("Бизнес амжилттай бүртгэгдлээ!");
      navigate("/provider/dashboard"); // Go to provider dashboard
    } catch (err: any) {
      console.error("REG ERROR:", err);
      alert(err?.response?.data?.msg || "Алдаа гарлаа.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center px-6 py-12">
        <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-3xl">

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Бизнесээ бүртгүүлэх
        </h1>

        <p className="text-gray-600 mb-8">
          Appointly дээр бизнесээ бүртгүүлж үйлчилгээ үзүүлэгч болоорой.
        </p>

        <BusinessForm value={form} onChange={handleChange} />

        <button
          onClick={handleSubmit}
          className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition"
        >
          Бүртгүүлэх
        </button>

        <p className="text-sm text-gray-600 mt-6 text-center">
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Нэвтрэх
          </Link>
        </p>

        </div>
      </div>
    </div>
  );
}
