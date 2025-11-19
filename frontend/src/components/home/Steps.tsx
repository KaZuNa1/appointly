import { Users, Calendar, CheckCircle } from "lucide-react";

export default function Steps() {
  const steps = [
    {
      num: "1",
      icon: <Users className="w-8 h-8 text-indigo-600" />,
      title: "Бүртгүүлэх",
      desc: "Хэрэглэгч эсвэл бизнесийн бүртгэлээ үүсгэнэ."
    },
    {
      num: "2",
      icon: <Calendar className="w-8 h-8 text-indigo-600" />,
      title: "Үйлчилгээ сонгох",
      desc: "Олсон бизнесүүдээс өөрт тохирох үйлчилгээгээ сонгоно."
    },
    {
      num: "3",
      icon: <CheckCircle className="w-8 h-8 text-indigo-600" />,
      title: "Цаг баталгаажуулах",
      desc: "Хүссэн цагийн слотыг сонгон захиалгаа баталгаажуулна."
    }
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-6xl mx-auto px-6">

        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-3">Яаж ажилладаг вэ?</h2>
          <p className="text-gray-600 text-lg">
            3 алхмаар үйлчилгээгээ захиалаарай
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="bg-gray-50 p-8 rounded-xl text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-6 mx-auto">
                  {step.icon}
                </div>

                <div className="absolute top-4 left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                  {step.num}
                </div>

                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
