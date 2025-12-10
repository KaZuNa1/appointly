import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import BusinessForm from "@/components/business/BusinessForm";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

type ValidationErrors = Record<string, string>;

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    nickname: "",
    category: "",
    phone: "",
    address: "",
    city: "",
    district: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setServerError(""); // Clear server error when user types

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, form[field as keyof typeof form]);
  };

  const validateField = (field: string, value: string) => {
    const newErrors: ValidationErrors = { ...errors };

    switch (field) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Нэрээ оруулна уу";
        } else {
          delete newErrors.fullName;
        }
        break;

      case "email":
        if (!value.trim()) {
          newErrors.email = "Имэйл хаягаа оруулна уу";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          newErrors.email = "Зөв имэйл хаяг оруулна уу";
        } else {
          delete newErrors.email;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Нууц үг оруулна уу";
        } else if (value.length < 8) {
          newErrors.password = "Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой";
        } else if (!/\d/.test(value)) {
          newErrors.password = "Нууц үг тоо агуулсан байх ёстой";
        } else if (!/[a-zA-Z]/.test(value)) {
          newErrors.password = "Нууц үг үсэг агуулсан байх ёстой";
        } else {
          delete newErrors.password;
        }
        break;

      case "confirmPassword":
        if (!value) {
          newErrors.confirmPassword = "Нууц үгээ дахин оруулна уу";
        } else if (value !== form.password) {
          newErrors.confirmPassword = "Нууц үг таарахгүй байна";
        } else {
          delete newErrors.confirmPassword;
        }
        break;

      case "businessName":
        if (!value.trim()) {
          newErrors.businessName = "Бизнесийн нэрээ оруулна уу";
        } else {
          delete newErrors.businessName;
        }
        break;

      case "category":
        if (!value) {
          newErrors.category = "Бизнесийн төрлөө сонгоно уу";
        } else {
          delete newErrors.category;
        }
        break;

      case "nickname":
        if (!value.trim()) {
          newErrors.nickname = "Хэрэглэгчдэд харагдах нэрээ оруулна уу";
        } else {
          delete newErrors.nickname;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "Утасны дугаараа оруулна уу";
        } else {
          delete newErrors.phone;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = () => {
    const fields = ["fullName", "email", "password", "confirmPassword", "businessName", "nickname", "category", "phone"];
    let isValid = true;

    fields.forEach((field) => {
      const fieldValid = validateField(field, form[field as keyof typeof form]);
      if (!fieldValid) isValid = false;
      setTouched((prev) => ({ ...prev, [field]: true }));
    });

    return isValid;
  };

  const handleSubmit = async () => {
    // Validate all fields
    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);
    setServerError("");

    try {
      const res = await api.post("/auth/business/register", form);

      // Check if email verification is required
      if (res.data.requiresVerification) {
        navigate("/verify-email-pending", { state: { email: res.data.email } });
        return;
      }

      // OLD FLOW (if verification is disabled in future)
      if (res.data.token) {
        saveToken(res.data.token);
      }

      await refreshUser();
      navigate("/provider/dashboard");
    } catch (err: any) {
      // Only log real server errors (500s), not validation errors (400s)
      if (err?.response?.status >= 500) {
        console.error("Server error:", err);
      }

      const errorMsg = err?.response?.data?.msg || "Алдаа гарлаа. Дахин оролдоно уу.";
      setServerError(errorMsg);
    } finally {
      setIsSubmitting(false);
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

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{serverError}</p>
            </div>
          )}

          <BusinessForm
            value={form}
            onChange={handleChange}
            onBlur={handleBlur}
            errors={errors}
            touched={touched}
          />

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-5 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Бүртгэж байна..." : "Бүртгүүлэх"}
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
