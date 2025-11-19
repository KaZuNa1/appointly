import { Calendar, Shield, Bell } from "lucide-react";

export default function Benefits() {
  const items = [
    {
      icon: <Calendar className="w-10 h-10 text-indigo-600" />,
      title: "Хялбар цаг захиалга",
      desc: "Олон алхамгүйгээр хэдхэн секундэд цаг авах боломжтой."
    },
    {
      icon: <Shield className="w-10 h-10 text-indigo-600" />,
      title: "Баталгаатай үйлчилгээ",
      desc: "Appointly-д бүртгэлтэй бүх бизнесүүд итгэмжлэгдсэн."
    },
    {
      icon: <Bell className="w-10 h-10 text-indigo-600" />,
      title: "Шууд мэдэгдэл",
      desc: "Захиалга баталгаажсан даруйд танд мэдэгдэл ирнэ."
    }
  ];

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            Яагаад Appointly-г сонгох вэ?
          </h2>
          <p className="text-gray-600 text-lg">
            Цаг захиалалтаа хамгийн оновчтойгоор удирдаарай.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div
              key={i}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition"
            >
              <div className="mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
