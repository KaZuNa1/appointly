export default function Partners() {
  const companies = [
    "Салон",
    "Эмнэлэг",
    "Барбершоп",
    "Авто Сервис",
    "Фитнесс",
    "Сургалтын Төв",
  ];

  return (
    <section className="bg-white py-14">
      <div className="max-w-6xl mx-auto px-6">

        <p className="text-center text-sm font-semibold text-gray-500 mb-10">
          ЭДГЭЭР САЛБАРУУД АPPOINTLY-Г АШИГЛАДАГ
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {companies.map((company, i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-sm font-medium"
            >
              {company}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
