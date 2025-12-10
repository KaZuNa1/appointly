import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

// MAIN PAGES
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceResults from "@/pages/ServiceResults";
import Providers from "@/pages/Providers";
import ProviderProfile from "@/pages/ProviderProfile";
import BookingConfirmation from "@/pages/BookingConfirmation";

// AUTH: USER
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// AUTH: BUSINESS
import BusinessRegister from "@/pages/BusinessRegister";

// EMAIL VERIFICATION
import VerifyEmailPending from "@/pages/VerifyEmailPending";
import VerifyEmail from "@/pages/VerifyEmail";

// PASSWORD RESET
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";

// OAUTH
import AuthCallback from "@/pages/AuthCallback";

// USER DASHBOARD
import Dashboard from "@/pages/Dashboard";

// PROVIDER DASHBOARD
import ProviderDashboard from "@/pages/ProviderDashboard";

// NOTIFICATIONS
import Inbox from "@/pages/Inbox";

// ADMIN DASHBOARD
import AdminDashboard from "@/pages/AdminDashboard";
import AdminUsers from "@/pages/AdminUsers";
import AdminProviders from "@/pages/AdminProviders";
import AdminBookings from "@/pages/AdminBookings";
import AdminAuditLogs from "@/pages/AdminAuditLogs";

export function AppRoutes() {
  return (
    <Routes>

      {/* =======================
          MAIN PUBLIC PAGES
      ======================== */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/service-results" element={<ServiceResults />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/providers/:id" element={<ProviderProfile />} />

      {/* =======================
          BOOKING FLOW
      ======================== */}
      <Route path="/booking/:id" element={<BookingConfirmation />} />

      {/* =======================
          USER AUTH
      ======================== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* =======================
          BUSINESS AUTH
      ======================== */}
      <Route path="/business/register" element={<BusinessRegister />} />

      {/* =======================
          EMAIL VERIFICATION
      ======================== */}
      <Route path="/verify-email-pending" element={<VerifyEmailPending />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* =======================
          PASSWORD RESET
      ======================== */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* =======================
          OAUTH CALLBACK
      ======================== */}
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* =======================
          USER DASHBOARD (CUSTOMERS ONLY)
      ======================== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="CUSTOMER">
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =======================
          PROVIDER DASHBOARD (PROVIDERS ONLY)
      ======================== */}
      <Route
        path="/provider/dashboard"
        element={
          <ProtectedRoute role="PROVIDER">
            <ProviderDashboard />
          </ProtectedRoute>
        }
      />

      {/* =======================
          INBOX (ALL AUTHENTICATED USERS)
      ======================== */}
      <Route
        path="/inbox"
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      />

      {/* =======================
          ADMIN DASHBOARD (ADMINS ONLY)
      ======================== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/providers"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminProviders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/bookings"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminBookings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminAuditLogs />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
}
