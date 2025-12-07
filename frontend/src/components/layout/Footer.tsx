import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-950 text-gray-300">

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">

          {/* Company Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-3xl font-bold text-white mb-4 inline-block">
              Appointly
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Монголын үйлчилгээ үзүүлэгчид болон хэрэглэгчдийг холбож, цаг захиалалтыг илүү хялбар, түргэн, найдвартай болгож байна.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-indigo-400" />
                <a href="mailto:support@appointly.mn" className="hover:text-white transition">
                  support@appointly.mn
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-indigo-400" />
                <a href="tel:+97670123456" className="hover:text-white transition">
                  +976 7012-3456
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>Улаанбаатар, Монгол улс</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Бүтээгдэхүүн</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/services" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Үйлчилгээнүүд
                </Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Үйлчилгээ үзүүлэгчид
                </Link>
              </li>
              <li>
                <Link to="/business/register" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Бизнес бүртгэл
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Компани</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Бидний тухай
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Блог
                </Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Ажлын байр
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Холбоо барих
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Хууль эрх зүй</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/terms" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Үйлчилгээний нөхцөл
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Нууцлалын бодлого
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Cookie-ийн бодлого
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-white hover:translate-x-1 inline-block transition">
                  Тусламж
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">

            {/* Copyright */}
            <p className="text-gray-500 text-sm text-center md:text-left">
              © {currentYear} Appointly. Бүх эрх хуулиар хамгаалагдсан.
            </p>

            {/* Social Media Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-all duration-300"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>

            {/* Language/Region (Optional) */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>🇲🇳</span>
              <span>Монгол</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
