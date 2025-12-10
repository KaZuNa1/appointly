import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, Clock, RefreshCcw } from "lucide-react";
import axios from "axios";

export default function VerifyEmailPending() {
  const location = useLocation();
  const email = location.state?.email || "";
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleResend = async () => {
    setResendLoading(true);
    setResendMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
      const res = await axios.post(`${API_URL}/auth/resend-verification`, {
        email
      });

      setResendMessage(res.data.msg || "Имэйл дахин илгээгдлээ!");
      setCanResend(false);
      setCountdown(1200); // 20 minutes in seconds
    } catch (error: any) {
      const msg = error.response?.data?.msg || "Алдаа гарлаа";
      setResendMessage(msg);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

          {/* Icon */}
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-indigo-600" />
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Имэйлээ шалгана уу
          </h1>

          <p className="text-gray-600 mb-6">
            Бид таны <strong className="text-gray-900">{email}</strong> хаяг руу баталгаажуулах имэйл илгээлээ.
          </p>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Дараагийн алхмууд:
            </h3>
            <ol className="text-sm text-blue-800 space-y-2 ml-6 list-decimal">
              <li>Имэйл хайрцгаа нээнэ үү</li>
              <li>"Appointly" -аас ирсэн имэйлийг олоорой</li>
              <li>"Имэйл баталгаажуулах" товч дээр дарна уу</li>
              <li>Та автоматаар системд нэвтэрнэ</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Анхаар:</strong> Холбоос 30 минутын дараа хүчингүй болно
            </p>
          </div>

          {/* Resend Section */}
          <div className="border-t pt-6">
            <p className="text-gray-600 mb-4 text-sm">
              Имэйл хүлээн аваагүй юу?
            </p>

            {resendMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm ${
                resendMessage.includes("Алдаа") || resendMessage.includes("Хэт олон")
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}>
                {resendMessage}
              </div>
            )}

            <Button
              onClick={handleResend}
              disabled={resendLoading || !canResend}
              variant="outline"
              className="w-full"
            >
              <RefreshCcw className={`w-4 h-4 mr-2 ${resendLoading ? "animate-spin" : ""}`} />
              {!canResend && countdown > 0
                ? `Дахин илгээх (${formatTime(countdown)})`
                : resendLoading
                ? "Илгээж байна..."
                : "Дахин илгээх"
              }
            </Button>
          </div>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t">
            <Link to="/login">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700">
                Нэвтрэх хуудас руу буцах
              </Button>
            </Link>
          </div>

        </div>

        {/* Help Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Асуудал гарсан уу? Spam фолдероо шалгаарай эсвэл{" "}
          <a href="mailto:support@appointly.mn" className="text-indigo-600 hover:underline">
            support@appointly.mn
          </a>
        </p>

      </div>
    </div>
  );
}
