import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { logout } from "@/lib/auth";
import Navbar from "@/components/layout/Navbar";

// Tab components
import InfoTab from "@/components/provider/tabs/InfoTab";
import ScheduleTab from "@/components/provider/tabs/ScheduleTab";
import ServicesTab from "@/components/provider/tabs/ServicesTab";
import SettingsTab from "@/components/provider/tabs/SettingsTab";

type TabType = "info" | "schedule" | "services" | "settings";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null>(null);

  // Fetch provider data and avatar
  useEffect(() => {
    fetchProviderData();
    loadAvatar();
  }, [user]);

  const fetchProviderData = async () => {
    try {
      setLoading(true);
      const res = await api.get("/auth/me");
      setProviderData(res.data.user);
    } catch (err) {
      console.error("Failed to fetch provider data:", err);
      alert("Мэдээлэл татахад алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const loadAvatar = () => {
    // Load avatar from localStorage - provider-specific key
    if (user?.id) {
      const avatarKey = `userAvatar_${user.id}`;
      const savedAvatar = localStorage.getItem(avatarKey);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else {
        setAvatar(null);
      }
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const avatarData = event.target?.result as string;
        setAvatar(avatarData);
        // Save to localStorage with user-specific key
        const avatarKey = `userAvatar_${user.id}`;
        localStorage.setItem(avatarKey, avatarData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (confirm("Гарахдаа итгэлтэй байна уу?")) {
      logout();
    }
  };

  const tabs = [
    { id: "info" as TabType, label: "Мэдээлэл", icon: "📋" },
    { id: "schedule" as TabType, label: "Цагийн хуваарь", icon: "📅" },
    { id: "services" as TabType, label: "Үйлчилгээ", icon: "✂️" },
    { id: "settings" as TabType, label: "Тохиргоо", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">Уншиж байна...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Left Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          {/* Logo/Brand */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-indigo-600">Appointly</h1>
            <p className="text-sm text-gray-600 mt-1">Бизнес самбар</p>
          </div>

          {/* Provider Avatar Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col items-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Provider Avatar"
                  className="w-20 h-20 rounded-full object-cover border-3 border-indigo-600 mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center border-3 border-indigo-600 mb-3">
                  <span className="text-3xl">👨‍💼</span>
                </div>
              )}
              <p className="text-sm font-medium text-gray-900 text-center">{providerData?.fullName}</p>
              <label className="mt-3 px-3 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors">
                📷 Зургаа солих
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 p-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              <span>🚪</span>
              <span>Гарах</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-8">
            {activeTab === "info" && (
              <InfoTab providerData={providerData} onRefresh={fetchProviderData} />
            )}
            {activeTab === "schedule" && <ScheduleTab />}
            {activeTab === "services" && (
              <ServicesTab businessCategory={providerData?.providerProfile?.category || ""} />
            )}
            {activeTab === "settings" && (
              <SettingsTab providerData={providerData} onRefresh={fetchProviderData} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
