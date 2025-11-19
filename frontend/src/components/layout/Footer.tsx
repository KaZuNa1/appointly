import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-center">
          
          <div className="mb-6 md:mb-0">
            <Link to="/" className="text-2xl font-bold text-white">
              Appointly
            </Link>
            <p className="text-gray-400 mt-2 text-sm">
              Цаг захиалалтыг илүү ухаалаг болгоё — 2025
            </p>
          </div>

          <div className="flex space-x-8 text-sm">
            <Link to="/" className="hover:text-white transition">Нүүр</Link>
            <Link to="/terms" className="hover:text-white transition">Үйлчилгээний нөхцөл</Link>
            <Link to="/privacy" className="hover:text-white transition">Нууцлал</Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © 2025 Appointly. Бүх эрх хуулиар хамгаалагдсан.
        </div>
      </div>
    </footer>
  );
}
