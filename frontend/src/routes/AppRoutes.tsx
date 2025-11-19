import { Routes, Route } from "react-router-dom";

// MAIN PAGES
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import Providers from "@/pages/Providers";
import ProviderProfile from "@/pages/ProviderProfile";
import BookingConfirmation from "@/pages/BookingConfirmation";

// AUTH: USER
import Login from "@/pages/Login";
import Register from "@/pages/Register";

// AUTH: BUSINESS
import BusinessRegister from "@/pages/BusinessRegister";

// USER DASHBOARD
import Dashboard from "@/pages/Dashboard";

// PROVIDER DASHBOARD
import ProviderDashboard from "@/pages/ProviderDashboard";

export function AppRoutes() {
  return (
    <Routes>

      {/* =======================
          MAIN PUBLIC PAGES
      ======================== */}
      <Route path="/" element={<Home />} />
      <Route path="/services" element={<Services />} />
      <Route path="/providers" element={<Providers />} />
      <Route path="/provider/:id" element={<ProviderProfile />} />

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
          USER DASHBOARD
      ======================== */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* =======================
          PROVIDER DASHBOARD
      ======================== */}
      <Route path="/provider/dashboard" element={<ProviderDashboard />} />

    </Routes>
  );
}
