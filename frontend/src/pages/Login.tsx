import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  const handleLogin = () => {
    if (!email || !pass) {
      alert("Имэйл болон нууц үгээ оруулна уу.");
      return;
    }

    // TODO: Integrate real backend:
    // const res = await api.post("/auth/login", { email, pass });

    alert("Logged in (frontend mock)!");
  };

  return (
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

      <Button
        className="w-full mt-4 h-12 text-base"
        onClick={handleLogin}
      >
        Нэвтрэх
      </Button>

      <p className="text-center text-gray-600 mt-6">
        Шинэ хэрэглэгч үү?{" "}
        <Link to="/register" className="text-indigo-600 font-medium">
          Бүртгүүлэх
        </Link>
      </p>
    </AuthCard>
  );
}
