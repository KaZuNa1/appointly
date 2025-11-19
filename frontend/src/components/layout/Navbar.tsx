import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

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

          <Link to="/services" className="text-gray-700 hover:text-indigo-600 transition">
            Үйлчилгээнүүд
          </Link>

          <Link to="/providers" className="text-gray-700 hover:text-indigo-600 transition">
            Бизнесүүд
          </Link>
        </div>

        {/* DESKTOP AUTH BUTTONS */}
        <div className="hidden md:flex items-center space-x-4">
          <Link to="/login">
            <Button variant="ghost">Нэвтрэх</Button>
          </Link>
          <Link to="/register">
            <Button>Бүртгүүлэх</Button>
          </Link>
        </div>

        {/* MOBILE BURGER BUTTON */}
        <button
          className="md:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* MOBILE DROPDOWN MENU */}
      {open && (
        <div className="md:hidden px-6 pb-6 space-y-4 animate-slide-down">

          <Link to="/" className="block text-gray-700 hover:text-indigo-600">
            Нүүр
          </Link>

          <Link to="/services" className="block text-gray-700 hover:text-indigo-600">
            Үйлчилгээнүүд
          </Link>

          <Link to="/providers" className="block text-gray-700 hover:text-indigo-600">
            Бизнесүүд
          </Link>

          {/* MOBILE AUTH BUTTONS */}
          <div className="flex space-x-4 pt-4">
            <Link to="/login" className="flex-1">
              <Button variant="outline" className="w-full">Нэвтрэх</Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button className="w-full">Бүртгүүлэх</Button>
            </Link>
          </div>

        </div>
      )}
    </nav>
  );
}
