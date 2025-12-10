import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Токен олдсонгүй. Холбоос буруу байна.");
        return;
      }

      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
        const res = await axios.post(`${API_URL}/auth/verify-email`, {
          token
        });

        setStatus("success");
        setMessage(res.data.msg || "Имэйл амжилттай баталгаажлаа!");

        // Save token using the proper helper
        if (res.data.token) {
          saveToken(res.data.token);
        }

        // Refresh user in AuthContext
        await refreshUser();

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          if (res.data.user?.role === "PROVIDER") {
            navigate("/provider/dashboard");
          } else if (res.data.user?.role === "ADMIN") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        }, 2000);

      } catch (error: any) {
        setStatus("error");
        const msg = error.response?.data?.msg || "Баталгаажуулахад алдаа гарлаа";
        setMessage(msg);
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full">

        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

          {/* Loading State */}
          {status === "loading" && (
            <>
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Баталгаажуулж байна...
              </h1>
              <p className="text-gray-600">
                Таны имэйл хаягийг баталгаажуулж байна. Түр хүлээнэ үү.
              </p>
            </>
          )}

          {/* Success State */}
          {status === "success" && (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Амжилттай баталгаажлаа!
              </h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  Та автоматаар dashboard руу шилжинэ...
                </p>
              </div>
            </>
          )}

          {/* Error State */}
          {status === "error" && (
            <>
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Баталгаажуулалт амжилтгүй
              </h1>
              <p className="text-red-600 mb-6">
                {message}
              </p>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
                <h3 className="font-semibold text-amber-900 mb-2">
                  Шалтгаан:
                </h3>
                <ul className="text-sm text-amber-800 space-y-1 ml-4 list-disc">
                  <li>Холбоос хугацаа дууссан (5 минут)</li>
                  <li>Холбоос аль хэдийн ашигласан</li>
                  <li>Холбоос буруу эсвэл устгагдсан</li>
                </ul>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => navigate("/verify-email-pending", {
                    state: { email: "" }
                  })}
                  className="w-full"
                >
                  Дахин илгээх
                </Button>

                <Button
                  onClick={() => navigate("/login")}
                  variant="outline"
                  className="w-full"
                >
                  Нэвтрэх хуудас руу буцах
                </Button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
