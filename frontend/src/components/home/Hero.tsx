import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-14 items-center">

        {/* LEFT */}
        <div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Үйлчилгээний цаг захиалгийг <br /> илүү хялбар болгоё
          </h1>

          <p className="text-lg text-gray-600 mb-8">
            Appointly нь хэрэглэгчдийг итгэмжлэгдсэн үйлчилгээ үзүүлэгч нартай
            холбож цаг захиалах процессыг түргэн, ойлгомжтой, найдвартай болгоно.
          </p>

          <div className="flex gap-4">
            {/* USER BOOKING */}
            <Link to="/services">
              <Button size="lg" className="px-8 py-6 text-lg">
                Цаг захиалах
              </Button>
            </Link>

            {/* BUSINESS SIGNUP */}
           {/* BUSINESS SIGNUP */}
<Link to="/business/register">
  <Button 
    variant="outline"
    size="lg"
    className="px-8 py-6 text-lg"
  >
    Бизнесээ бүртгүүлэх
  </Button>
</Link>

          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="flex justify-center">
          <img
            src="/istockphoto-1392979115-612x612.jpg"
            alt="Appointly - Үйлчилгээний цаг захиалга"
            className="w-full h-auto rounded-2xl shadow-2xl object-cover"
          />
        </div>

      </div>
    </section>
  );
}
