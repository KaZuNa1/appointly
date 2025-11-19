import type { Provider } from "./providerData";
import { Link } from "react-router-dom";

const ProviderCard: React.FC<{ provider: Provider }> = ({ provider }) => {
  const Icon = provider.icon;

  return (
    <Link
      to={`/provider/${provider.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition block"
    >
      {/* Icon */}
      <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-indigo-600" />
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-1">
        {provider.name}
      </h3>

      <p className="text-sm text-gray-600 mb-3">{provider.desc}</p>

      {/* Rating */}
      <div className="text-sm text-gray-700 font-medium mb-1">
        ⭐ {provider.rating} ({provider.reviews} үнэлгээ)
      </div>

      {/* Price */}
      <div className="text-sm text-gray-500">{provider.priceRange}</div>
    </Link>
  );
};

export default ProviderCard;
