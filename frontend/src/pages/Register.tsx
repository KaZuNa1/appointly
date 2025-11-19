import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleRegister = () => {
    if (!name || !email || !pass || !confirmPass) {
      alert("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (pass !== confirmPass) {
      alert("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    // TODO: integrate with backend later
    alert("User registered (frontend mock)!");
  };

  return (
    <AuthCard>
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-2">Бүртгүүлэх</h1>
      <p className="text-gray-600 text-center mb-8">
        Аппоинтлид тавтай морил! Доорх мэдээллээ бүрдүүлнэ үү.
      </p>

      {/* INPUTS */}
      <InputField
        label="Нэр"
        placeholder="Таны нэр"
        value={name}
        onChange={setName}
      />

      <InputField
        label="Имэйл"
        placeholder="example@gmail.com"
        type="email"
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

      {/* BUTTON */}
      <Button
        className="w-full mt-4 h-12 text-base"
        onClick={handleRegister}
      >
        Бүртгүүлэх
      </Button>

      {/* Login redirect */}
      <p className="text-center text-gray-600 mt-6">
        Аль хэдийн бүртгэлтэй юу?{" "}
        <Link to="/login" className="text-indigo-600 font-medium">
          Нэвтрэх
        </Link>
      </p>

      {/* BUSINESS REGISTER (new section) */}
      <div className="mt-10 pt-6 border-t text-center">
        <p className="text-sm text-gray-600 mb-2">
          Бизнес эрхлэгч үү?
        </p>
        <Link
          to="/business/register"
          className="text-indigo-600 font-semibold hover:underline"
        >
          Бизнесээ бүртгүүлэх
        </Link>
      </div>
    </AuthCard>
  );
}
