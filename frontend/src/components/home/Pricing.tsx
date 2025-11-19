import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const plans = [
    {
      name: "Суурь",
      price: "0₮",
      features: ["Сард 5 удаа цаг авах", "Ерөнхий дэмжлэг", "Гар утаснаас хандах"],
    },
    {
      name: "Стандарт",
      price: "39,000₮",
      popular: true,
      features: [
        "Хязгааргүй цаг захиалга",
        "Түргэн шуурхай дэмжлэг",
        "Хяналтын самбар",
        "Календар интеграци",
      ],
    },
    {
      name: "Премиум",
      price: "79,000₮",
      features: [
        "Стандарт бүх боломж",
        "Брэндинг тохиргоо",
        "API ашиглах боломж",
        "Хувийн менежер",
      ],
    },
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3">Үнийн багц</h2>
          <p className="text-lg text-gray-600">
            Танай бизнест тохирох шийдлийг сонгоорой
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`bg-white p-8 rounded-xl shadow-sm relative ${
                plan.popular ? "border-2 border-indigo-600" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-sm px-4 py-1 rounded-full">
                  Хамгийн их сонголт
                </span>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

              <div className="text-5xl font-bold mb-6">
                {plan.price}
                <span className="text-lg text-gray-600">/сар</span>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((f, idx) => (
                  <li key={idx} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-indigo-600 mr-2" />
                    <span className="text-gray-600">{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                Сонгох
              </Button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
