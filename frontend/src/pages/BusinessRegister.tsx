import { Link } from "react-router-dom";
import BusinessForm from "@/components/business/BusinessForm";

export default function BusinessRegister() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-3xl">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Бизнесээ бүртгүүлэх
        </h1>
        <p className="text-gray-600 mb-8">
          Appointly дээр бизнесээ бүртгүүлж үйлчилгээ үзүүлэгч болоорой
        </p>

        {/* FORM */}
        <BusinessForm />

        {/* Login Link */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          Аль хэдийн бүртгэлтэй юу?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold">
            Нэвтрэх
          </Link>
        </p>
      </div>
    </div>
  );
}
