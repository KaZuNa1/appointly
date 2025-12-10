import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import Hero from "@/components/home/Hero";
import Partners from "@/components/home/Partners";
import Benefits from "@/components/home/Benefits";
import Steps from "@/components/home/Steps";
import Pricing from "@/components/home/Pricing";

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (user?.role === "ADMIN") {
      navigate("/admin");
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col">

      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Hero />
        <Partners />
        <Benefits />
        <Steps />
        <Pricing />
      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
