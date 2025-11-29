import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const [providerData, setProviderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch provider data
  useEffect(() => {
    fetchProviderData();
  }, []);

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
