import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    // Load avatar from localStorage - user-specific to avoid conflicts
    if (user?.id) {
      const avatarKey = `userAvatar_${user.id}`;
      const savedAvatar = localStorage.getItem(avatarKey);
      if (savedAvatar) {
        setAvatar(savedAvatar);
      } else {
        setAvatar(null); // Clear avatar if not found for this user
      }
    }
  }, [user]);

  const handleLogout = () => {
    if (confirm("Гарахдаа итгэлтэй байна уу?")) {
      logout();
    }
  };

  const getDashboardLink = () => {
    if (user?.role === "PROVIDER") {
      return "/provider/dashboard";
    }
    return "/dashboard";
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="text-2xl font-bold text-indigo-600">
          Appointly
        </Link>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">
            Нүүр
          </Link>

          {!user || user.role !== "PROVIDER" ? (
            <Link to="/services" className="text-gray-700 hover:text-indigo-600 transition">
              Үйлчилгээнүүд
            </Link>
          ) : null}

          <Link to="/providers" className="text-gray-700 hover:text-indigo-600 transition">
            Бизнесүүд
          </Link>
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="text-gray-500">Уншиж байна...</div>
          ) : user ? (
            // Logged in - Show profile dropdown
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  user.role === "PROVIDER"
                    ? "bg-purple-100 hover:bg-purple-200"
                    : "hover:bg-gray-100"
                }`}
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600"
                  />
                ) : user.role === "PROVIDER" ? (
                  <Building2 className="w-5 h-5 text-purple-700" />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className={`font-medium ${user.role === "PROVIDER" ? "text-purple-900" : ""}`}>
                  {user.fullName}
                </span>
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>

                  <Link
                    to={getDashboardLink()}
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Хяналтын самбар</span>
                  </Link>

                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Гарах</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Logged out - Show login/register buttons
            <>
              <Link to="/login">
                <Button variant="ghost">Нэвтрэх</Button>
              </Link>
              <Link to="/register">
                <Button>Бүртгүүлэх</Button>
              </Link>
            </>
          )}
        </div>

        {/* MOBILE BURGER BUTTON */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 animate-slide-down">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="block text-gray-700 hover:text-indigo-600"
          >
            Нүүр
          </Link>

          {!user || user.role !== "PROVIDER" ? (
            <Link
              to="/services"
              onClick={() => setOpen(false)}
              className="block text-gray-700 hover:text-indigo-600"
            >
              Үйлчилгээнүүд
            </Link>
          ) : null}

          <Link
            to="/providers"
            onClick={() => setOpen(false)}
            className="block text-gray-700 hover:text-indigo-600"
          >
            Бизнесүүд
          </Link>

          {/* MOBILE AUTH SECTION */}
          {loading ? (
            <div className="text-gray-500 py-2">Уншиж байна...</div>
          ) : user ? (
            // Logged in - Show user info and logout
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className={`px-4 py-2 rounded-lg flex items-center gap-3 ${
                user.role === "PROVIDER" ? "bg-purple-100" : "bg-gray-50"
              }`}>
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                  />
                ) : user.role === "PROVIDER" ? (
                  <Building2 className="w-10 h-10 text-purple-700" />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${user.role === "PROVIDER" ? "text-purple-900" : "text-gray-900"}`}>
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              <Link
                to={getDashboardLink()}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Хяналтын самбар</span>
              </Link>

              <button
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Гарах</span>
              </button>
            </div>
          ) : (
            // Logged out - Show login/register buttons
            <div className="flex space-x-4 pt-4">
              <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full">
                  Нэвтрэх
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
                <Button className="w-full">Бүртгүүлэх</Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
