import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import InputField from "@/components/auth/InputField";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import axios from "axios";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      alert("Имэйл оруулна уу.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const res = await axios.post(`${API_URL}/auth/forgot-password`, {
        email
      });

      setSuccess(true);
      setMessage(res.data.msg || "Нууц үг сэргээх имэйл илгээгдлээ!");
    } catch (error: any) {
      const msg = error.response?.data?.msg || "Алдаа гарлаа";
      setMessage(msg);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AuthCard>

        {/* Back button */}
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Буцах
        </Link>

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Нууц үгээ мартсан уу?</h1>
              <p className="text-gray-600">
                Бүртгэлтэй имэйл хаягаа оруулна уу. Бид танд нууц үг сэргээх холбоос илгээх болно.
              </p>
            </div>

            {/* Form */}
            <InputField
              label="Имэйл хаяг"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={setEmail}
            />

            {message && !success && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {message}
              </div>
            )}

            <Button
              className="w-full mt-6 h-12 text-base"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Сэргээх холбоос илгээх"}
            </Button>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Имэйл илгээгдлээ!</h1>
              <p className="text-gray-600 mb-6">
                <strong>{email}</strong> хаяг руу нууц үг сэргээх холбоос илгээгдлээ.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-blue-900 mb-2">Дараагийн алхмууд:</h3>
                <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                  <li>Имэйл хайрцгаа нээнэ үү</li>
                  <li>"Нууц үг сэргээх" холбоос дээр дарна уу</li>
                  <li>Шинэ нууц үгээ оруулна уу</li>
                  <li>Шинэ нууц үгээрээ нэвтэрнэ үү</li>
                </ol>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800">
                  <strong>Анхаар:</strong> Холбоос 30 минутын дараа хүчингүй болно
                </p>
              </div>

              <Link to="/login">
                <Button className="w-full">
                  Нэвтрэх хуудас руу буцах
                </Button>
              </Link>
            </div>
          </>
        )}

        {/* Footer */}
        {!success && (
          <p className="text-center text-gray-600 mt-6 text-sm">
            Имэйл олдохгүй байна уу? Spam фолдероо шалгаарай эсвэл{" "}
            <a href="mailto:support@appointly.mn" className="text-indigo-600 hover:underline">
              дэмжлэг авах
            </a>
          </p>
        )}

      </AuthCard>
    </div>
  );
}
