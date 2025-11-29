import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { saveToken } from "@/lib/auth";

export default function Register() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !pass || !confirmPass) {
      alert("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (pass !== confirmPass) {
      alert("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        fullName: name,
        email: email,
        password: pass,
      });

      // Save JWT
      saveToken(res.data.token);

      // Refresh user state in AuthContext
      await refreshUser();

      alert("Амжилттай бүртгэгдлээ!");

      // Redirect user → dashboard
      navigate("/dashboard");

    } catch (err: any) {
      console.error("REGISTER ERROR:", err);

      const msg =
        err?.response?.data?.msg ||
        err?.response?.data?.message ||
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
      <h1 className="text-3xl font-bold text-center mb-2">Бүртгүүлэх</h1>
      <p className="text-gray-600 text-center mb-8">
        Аппоинтлид тавтай морил! Доорх мэдээллээ бүрдүүлнэ үү.
      </p>

      <InputField
        label="Нэр"
        placeholder="Таны нэр"
        value={name}
        onChange={setName}
      />

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

      <PasswordField
        label="Нууц үг давтах"
        value={confirmPass}
        onChange={setConfirmPass}
      />

      <Button
        className="w-full mt-4 h-12 text-base"
        onClick={handleRegister}
        disabled={loading}
      >
        {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
      </Button>

      <p className="text-center text-gray-600 mt-6">
        Аль хэдийн бүртгэлтэй юу?{" "}
        <Link to="/login" className="text-indigo-600 font-medium">
          Нэвтрэх
        </Link>
      </p>

      {/* Business option */}
      <div className="mt-10 pt-6 border-t text-center">
        <p className="text-sm text-gray-600 mb-2">Бизнес эрхлэгч үү?</p>
        <Link
          to="/business/register"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Бизнесээ бүртгүүлэх
        </Link>
      </div>
      </AuthCard>
    </div>
  );
}
