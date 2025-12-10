import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { saveToken } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const errorParam = searchParams.get("error");

      if (errorParam) {
        setError("Google нэвтрэлт амжилтгүй боллоо. Дахин оролдоно уу.");
        return;
      }

      if (!token) {
        setError("Токен олдсонгүй. Холбоос буруу байна.");
        return;
      }

      try {
        // Save token to localStorage
        saveToken(token);

        // Refresh user context
        await refreshUser();

        // Get user data from localStorage to determine redirect
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);

          // Redirect based on role
          if (user.role === "PROVIDER") {
            navigate("/provider/dashboard");
          } else {
            navigate("/dashboard");
          }
        } else {
          // Fallback redirect
          navigate("/dashboard");
        }
      } catch (err) {
        console.error("Auth callback error:", err);
        setError("Алдаа гарлаа. Дахин нэвтэрнэ үү.");
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshUser]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Нэвтрэлт амжилтгүй
          </h1>
          <p className="text-red-600 mb-6">
            {error}
          </p>
          <Button
            onClick={() => navigate("/login")}
            className="w-full"
          >
            Нэвтрэх хуудас руу буцах
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Нэвтэрч байна...
        </h1>
        <p className="text-gray-600">
          Google нэвтрэлт боловсруулж байна. Түр хүлээнэ үү.
        </p>
      </div>
    </div>
  );
}
