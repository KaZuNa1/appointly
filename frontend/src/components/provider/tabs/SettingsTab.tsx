import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  providerData: any;
  onRefresh: () => void;
}

export default function SettingsTab({ providerData, onRefresh }: Props) {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loadingPassword, setLoadingPassword] = useState(false);

  // Booking Configuration
  const [slotInterval, setSlotInterval] = useState<number>(30);
  const [bookingWindowWeeks, setBookingWindowWeeks] = useState<number>(1);
  const [cancellationHours, setCancellationHours] = useState<number>(24);
  const [loadingBookingConfig, setLoadingBookingConfig] = useState(false);

  // Sync state with providerData when it changes
  useEffect(() => {
    if (providerData?.providerProfile?.slotInterval) {
      setSlotInterval(providerData.providerProfile.slotInterval);
    }
    if (providerData?.providerProfile?.bookingWindowWeeks) {
      setBookingWindowWeeks(providerData.providerProfile.bookingWindowWeeks);
    }
    if (providerData?.providerProfile?.cancellationHours !== undefined) {
      setCancellationHours(providerData.providerProfile.cancellationHours);
    }
  }, [providerData]);

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

  // Update Booking Configuration
  const handleBookingConfigUpdate = async () => {
    try {
      setLoadingBookingConfig(true);
      const providerId = providerData?.providerProfile?.id;

      if (!providerId) {
        toast.error("Бизнес профайл олдсонгүй");
        return;
      }

      await api.put(`/providers/${providerId}`, {
        slotInterval,
        bookingWindowWeeks,
        cancellationHours,
      });
      toast.success("Захиалгын тохиргоо амжилттай шинэчлэгдлээ!");
      onRefresh();
    } catch (err: any) {
      console.error("Booking config update error:", err);
      toast.error(err?.response?.data?.msg || "Тохиргоо шинэчлэхэд алдаа гарлаа");
    } finally {
      setLoadingBookingConfig(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Тохиргоо</h1>

      <div className="space-y-6">
        {/* Booking Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Захиалгын тохиргоо</h2>
          <p className="text-sm text-gray-600 mb-6">
            Хэрэглэгчид цаг захиалах үед ашиглах тохиргоонууд
          </p>

          <div className="space-y-6">
            {/* Slot Interval */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Цагийн интервал
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[15, 30, 60].map((interval) => (
                  <button
                    key={interval}
                    type="button"
                    onClick={() => setSlotInterval(interval)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      slotInterval === interval
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    {interval} минут
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Үйлчилгээний үргэлжлэх хугацаа автоматаар дээшээ тоймлогдоно.
              </p>
            </div>

            {/* Booking Window */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Хэрэглэгчид харагдах долоо хоногийн хязгаарлалт
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((weeks) => (
                  <button
                    key={weeks}
                    type="button"
                    onClick={() => setBookingWindowWeeks(weeks)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      bookingWindowWeeks === weeks
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    {weeks} {weeks === 1 ? "долоо хоног" : "долоо хоног"}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancellation Policy */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Цуцлах бодлого (Хэдэн цагийн өмнө цуцлах боломжтой)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 6, 12, 24, 48, 72].map((hours) => (
                  <button
                    key={hours}
                    type="button"
                    onClick={() => setCancellationHours(hours)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                      cancellationHours === hours
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    {hours} {hours === 1 ? "цаг" : "цаг"}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Хэрэглэгчид цаг захиалгаасаа хэдэн цагийн өмнө цуцлах боломжтой болохыг тохируулна уу.
              </p>
            </div>

            <Button
              onClick={handleBookingConfigUpdate}
              disabled={loadingBookingConfig}
              className="w-full"
            >
              {loadingBookingConfig ? "Хадгалж байна..." : "Тохиргоо хадгалах"}
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
