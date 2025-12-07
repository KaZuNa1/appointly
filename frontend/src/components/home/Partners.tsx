export default function Partners() {
  const companies = [
    "Салон",
    "Эмнэлэг",
    "Барбершоп",
    "Авто Сервис",
    "Фитнесс",
    "Сургалтын Төв",
    "Массаж",
    "Үс засалт",
    "Маникюр",
    "Зүрх судасны эмнэлэг",
    "Шүдний эмч",
    "Сэтгэл зүйч",
  ];

  // Duplicate the array for infinite scroll effect
  const duplicatedCompanies = [...companies, ...companies];

  return (
    <section className="bg-white py-16 overflow-hidden border-t border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6">

        <p className="text-center text-sm font-bold text-gray-600 tracking-wider mb-12">
          ЭДГЭЭР САЛБАРУУД APPOINTLY-Г АШИГЛАДАГ
        </p>

        {/* Infinite Scroll Container */}
        <div className="relative">
          {/* Scrolling content */}
          <div className="flex gap-6 animate-scroll">
            {duplicatedCompanies.map((company, i) => (
              <div
                key={i}
                className="flex-shrink-0 h-20 px-8 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-700 text-base font-semibold shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300"
              >
                {company}
              </div>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
