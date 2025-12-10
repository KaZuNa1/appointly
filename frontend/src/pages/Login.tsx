import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import GoogleLoginButton from "@/components/auth/GoogleLoginButton";
import { useAuth } from "@/contexts/AuthContext";

import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !pass) {
      alert("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password: pass,
      });

      const { token, user } = res.data;

      // Save JWT token
      saveToken(token);

      // Refresh user state in AuthContext
      await refreshUser();

      alert("Амжилттай нэвтэрлээ!");

      // Role-based redirect
      if (user.role === "PROVIDER") {
        navigate("/provider/dashboard");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

    } catch (err: any) {
      console.error("LOGIN ERROR:", err);

      const errorData = err?.response?.data;

      // Check if user needs email verification
      if (errorData?.requiresVerification) {
        alert(errorData.msg || "Имэйл хаяг баталгаажаагүй байна.");
        navigate("/verify-email-pending", { state: { email: errorData.email } });
        return;
      }

      const msg =
        errorData?.msg ||
        errorData?.message ||
        "Сервер алдаа гарлаа.";

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AuthCard>
      <h1 className="text-3xl font-bold text-center mb-2">Нэвтрэх</h1>
      <p className="text-gray-600 text-center mb-8">
        Аппоинтли хэрэглэгчийн нэвтрэлт
      </p>

      <InputField
        label="Имэйл"
        type="email"
        placeholder="example@gmail.com"
        value={email}
        onChange={setEmail}
      />

      <PasswordField
        label="Нууц үг"
        value={pass}
        onChange={setPass}
      />

      <div className="text-right mt-2">
        <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline">
          Нууц үгээ мартсан уу?
        </Link>
      </div>

      <Button
        className="w-full mt-4 h-12 text-base"
        onClick={handleLogin}
        disabled={loading}
      >
        {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="text-sm text-gray-500">эсвэл</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Google Login */}
      <GoogleLoginButton />

      <p className="text-center text-gray-600 mt-6">
        Шинэ хэрэглэгч үү?{" "}
        <Link to="/register" className="text-indigo-600 font-medium">
          Бүртгүүлэх
        </Link>
      </p>
      </AuthCard>
    </div>
  );
}
