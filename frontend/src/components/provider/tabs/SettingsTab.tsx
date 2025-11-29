import { useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";

interface Props {
  providerData: any;
  onRefresh: () => void;
}

export default function SettingsTab({ providerData, onRefresh }: Props) {
  const [emailForm, setEmailForm] = useState({
    newEmail: providerData?.email || "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  // Update Email
  const handleEmailUpdate = async () => {
    if (!emailForm.newEmail) {
      alert("Шинэ имэйл хаягаа оруулна уу");
      return;
    }

    if (emailForm.newEmail === providerData?.email) {
      alert("Шинэ имэйл хуучин имэйлтэй ижил байна");
      return;
    }

    try {
      setLoadingEmail(true);
      await api.put("/auth/email", { email: emailForm.newEmail });
      alert("Имэйл хаяг амжилттай солигдлоо!");
      onRefresh();
    } catch (err: any) {
      console.error("Email update error:", err);
      alert(err?.response?.data?.msg || "Имэйл солихад алдаа гарлаа");
    } finally {
      setLoadingEmail(false);
    }
  };

  // Update Password
  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Бүх талбарыг бөглөнө үү");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Шинэ нууц үг хоорондоо таарахгүй байна");
      return;
    }

    if (newPassword.length < 6) {
      alert("Нууц үг хамгийн багадаа 6 тэмдэгт байх ёстой");
      return;
    }

    try {
      setLoadingPassword(true);
      await api.put("/auth/password", {
        currentPassword,
        newPassword,
      });
      alert("Нууц үг амжилттай солигдлоо!");
      // Clear form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      console.error("Password update error:", err);
      alert(err?.response?.data?.msg || "Нууц үг солихад алдаа гарлаа");
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Тохиргоо</h1>

      <div className="space-y-6">
        {/* Email Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Имэйл хаяг солих</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Одоогийн имэйл
              </label>
              <p className="text-gray-900 py-2 px-4 bg-gray-50 rounded-lg">
                {providerData?.email || "—"}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шинэ имэйл хаяг
              </label>
              <input
                type="email"
                value={emailForm.newEmail}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, newEmail: e.target.value })
                }
                placeholder="example@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handleEmailUpdate}
              disabled={loadingEmail}
              className="w-full"
            >
              {loadingEmail ? "Солиж байна..." : "Имэйл солих"}
            </Button>
          </div>
        </div>

        {/* Password Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Нууц үг солих</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Одоогийн нууц үг
              </label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шинэ нууц үг
              </label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Шинэ нууц үг давтах
              </label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <Button
              onClick={handlePasswordUpdate}
              disabled={loadingPassword}
              className="w-full"
            >
              {loadingPassword ? "Солиж байна..." : "Нууц үг солих"}
            </Button>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Бүртгэлийн мэдээлэл
          </h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium">Хэрэглэгчийн ID:</span>{" "}
              {providerData?.id || "—"}
            </p>
            <p>
              <span className="font-medium">Эрх:</span> Бизнес үйлчилгээ үзүүлэгч
            </p>
            <p>
              <span className="font-medium">Бүртгүүлсэн огноо:</span>{" "}
              {providerData?.createdAt
                ? new Date(providerData.createdAt).toLocaleDateString("mn-MN")
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
