import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, LayoutDashboard, Calendar, Settings, HelpCircle, Clock, Scissors, Info, Bell, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import { useUnreadNotifications } from "@/hooks/useNotifications";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, loading } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(null);
  const navigate = useNavigate();
  const { unreadCount } = useUnreadNotifications();

  useEffect(() => {
    // Load avatar from user object (Supabase Storage URL)
    const loadAvatar = () => {
      if (user?.avatarUrl) {
        setAvatar(user.avatarUrl);
      } else {
        setAvatar(null);
      }
    };

    loadAvatar();

    // Listen for avatar updates from other components
    const handleAvatarUpdate = (event: CustomEvent) => {
      if (event.detail?.userId === user?.id && event.detail?.avatarUrl) {
        setAvatar(event.detail.avatarUrl);
      }
    };

    window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

    return () => {
      window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
    };
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
          {/* ADMIN - Only show Admin Dashboard link */}
          {user?.role === "ADMIN" ? (
            <Link to="/admin" className="text-gray-700 hover:text-indigo-600 transition font-semibold">
              Админ самбар
            </Link>
          ) : (
            // NON-ADMIN users see regular navigation
            <>
              <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">
                Нүүр
              </Link>

              {user?.role === "PROVIDER" ? (
                <Link to="/provider/dashboard" className="text-gray-700 hover:text-indigo-600 transition">
                  Хяналтын самбар
                </Link>
              ) : null}

              {!user || user.role !== "PROVIDER" ? (
                <Link to="/services" className="text-gray-700 hover:text-indigo-600 transition">
                  Үйлчилгээнүүд
                </Link>
              ) : null}

              {!user || user.role !== "PROVIDER" ? (
                <Link to="/providers" className="text-gray-700 hover:text-indigo-600 transition">
                  Бизнесүүд
                </Link>
              ) : null}
            </>
          )}
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden md:flex items-center space-x-4">
          {loading ? (
            <div className="text-gray-500">Уншиж байна...</div>
          ) : user ? (
            // Logged in - Show notification bell and profile dropdown
            <>
              {/* Notification Bell Icon - Hidden for ADMIN */}
              {user.role !== "ADMIN" && (
                <Link
                  to="/inbox"
                  className="relative p-2 rounded-lg transition hover:bg-gray-100"
                >
                  <Bell className="w-5 h-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </Link>
              )}

              {/* User Profile Dropdown */}
              <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition hover:bg-gray-100"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover border-2 border-indigo-600"
                  />
                ) : (
                  <User className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {user.role === "PROVIDER" && user.providerProfile?.nickname
                    ? user.providerProfile.nickname
                    : user.fullName}
                </span>
                {user.role === "PROVIDER" && (
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded font-medium">
                    бизнес
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium">
                    админ
                  </span>
                )}
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  {user.role === "ADMIN" ? (
                    // Admin menu items
                    <>
                      <Link
                        to="/admin"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Админ самбар</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

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
                    </>
                  ) : user.role === "CUSTOMER" ? (
                    // Customer menu items
                    <>
                      <Link
                        to={`${getDashboardLink()}?tab=bookings`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Миний цаг захиалга</span>
                      </Link>

                      <Link
                        to={`${getDashboardLink()}?tab=info`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Info className="w-4 h-4" />
                        <span>Хувийн мэдээлэл</span>
                      </Link>

                      <Link
                        to={`${getDashboardLink()}?tab=settings`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Тохиргоо</span>
                      </Link>

                      <div className="border-t border-gray-100 my-1"></div>

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
                    </>
                  ) : (
                    // Provider menu items - all sidebar options
                    <>
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/provider/dashboard?tab=schedule");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Цагийн хуваарь</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/provider/dashboard?tab=services");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Scissors className="w-4 h-4" />
                        <span>Үйлчилгээ</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/provider/dashboard?tab=info");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Info className="w-4 h-4" />
                        <span>Мэдээлэл</span>
                      </button>

                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          navigate("/provider/dashboard?tab=settings");
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Тохиргоо</span>
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <Link
                        to="/help"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 transition"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span>Тусламж</span>
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
                    </>
                  )}
                </div>
              )}
              </div>
            </>
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
          {/* ADMIN - Only show Admin Dashboard */}
          {user?.role === "ADMIN" ? (
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="block text-gray-700 hover:text-indigo-600 font-semibold"
            >
              Админ самбар
            </Link>
          ) : (
            // NON-ADMIN users see regular navigation
            <>
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

              {!user || user.role !== "PROVIDER" ? (
                <Link
                  to="/providers"
                  onClick={() => setOpen(false)}
                  className="block text-gray-700 hover:text-indigo-600"
                >
                  Бизнесүүд
                </Link>
              ) : null}
            </>
          )}

          {/* MOBILE AUTH SECTION */}
          {loading ? (
            <div className="text-gray-500 py-2">Уншиж байна...</div>
          ) : user ? (
            // Logged in - Show user info and logout
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="px-4 py-2 bg-gray-50 rounded-lg flex items-center gap-3">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-indigo-600"
                  />
                ) : (
                  <User className="w-10 h-10 text-gray-400" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {user.role === "PROVIDER" && user.providerProfile?.nickname
                        ? user.providerProfile.nickname
                        : user.fullName}
                    </p>
                    {user.role === "PROVIDER" && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded font-medium">
                        бизнес
                      </span>
                    )}
                    {user.role === "ADMIN" && (
                      <span className="px-2 py-0.5 bg-red-600 text-white text-xs rounded font-medium">
                        админ
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>

              {/* Inbox - Hidden for ADMIN */}
              {user.role !== "ADMIN" && (
                <Link
                  to="/inbox"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg relative"
                >
                  <Bell className="w-4 h-4" />
                  <span>Мэдэгдэл</span>
                  {unreadCount > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              )}

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
