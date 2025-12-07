import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import AuthCard from "@/components/auth/AuthCard";
import PasswordField from "@/components/auth/PasswordField";
import { Button } from "@/components/ui/button";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import { saveToken } from "@/lib/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      alert("Бүх талбарыг бөглөнө үү.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Нууц үг хоорондоо таарахгүй байна.");
      return;
    }

    // Password validation: minimum 8 characters, must contain number and letter
    if (newPassword.length < 8) {
      alert("Нууц үг дор хаяж 8 тэмдэгттэй байх ёстой.");
      return;
    }

    const hasNumber = /\d/.test(newPassword);
    const hasLetter = /[a-zA-Z]/.test(newPassword);

    if (!hasNumber || !hasLetter) {
      alert("Нууц үг үсэг болон тоо агуулсан байх ёстой.");
      return;
    }

    if (!token) {
      alert("Токен олдсонгүй. Холбоос буруу байна.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await axios.post("http://localhost:4000/api/auth/reset-password", {
        token,
        newPassword
      });

      setStatus("success");
      setMessage(res.data.msg || "Нууц үг амжилттай солигдлоо!");

      // Save token and auto-login
      if (res.data.token) {
        saveToken(res.data.token);
      }
      if (res.data.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // Redirect after 3 seconds
      setTimeout(() => {
        if (res.data.user?.role === "PROVIDER") {
          navigate("/provider/dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 3000);

    } catch (error: any) {
      setStatus("error");
      const msg = error.response?.data?.msg || "Алдаа гарлаа";
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Show error if no token
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <AuthCard>
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Буруу холбоос</h1>
            <p className="text-red-600 mb-6">
              Токен олдсонгүй. Холбоос буруу эсвэл устгагдсан байна.
            </p>
            <Link to="/forgot-password">
              <Button className="w-full">
                Дахин нууц үг сэргээх
              </Button>
            </Link>
          </div>
        </AuthCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AuthCard>

        {status === "idle" && (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-indigo-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Шинэ нууц үг үүсгэх</h1>
              <p className="text-gray-600">
                Шинэ нууц үгээ оруулна уу. Нууц үг дор хаяж 8 тэмдэгттэй, үсэг болон тоо агуулсан байх ёстой.
              </p>
            </div>

            {/* Form */}
            <PasswordField
              label="Шинэ нууц үг"
              value={newPassword}
              onChange={setNewPassword}
            />

            <PasswordField
              label="Нууц үг давтах"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />

            {message && status === "error" && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {message}
              </div>
            )}

            <Button
              className="w-full mt-6 h-12 text-base"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Түр хүлээнэ үү..." : "Нууц үг шинэчлэх"}
            </Button>

            <p className="text-center text-gray-600 mt-6 text-sm">
              Нууц үгээ санаж байна уу?{" "}
              <Link to="/login" className="text-indigo-600 hover:underline">
                Нэвтрэх
              </Link>
            </p>
          </>
        )}

        {status === "success" && (
          <>
            {/* Success State */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Амжилттай!</h1>
              <p className="text-gray-600 mb-6">
                {message}
              </p>

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  Та автоматаар dashboard руу шилжинэ...
                </p>
              </div>
            </div>
          </>
        )}

      </AuthCard>
    </div>
  );
}
