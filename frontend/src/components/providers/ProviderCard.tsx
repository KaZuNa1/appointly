import { Link } from "react-router-dom";
import { Building2, MapPin, Phone } from "lucide-react";

// Backend provider type
interface BackendProvider {
  id: string;
  businessName: string;
  category: string;
  phone?: string;
  description?: string;
  address?: string;
  city?: string;
  district?: string;
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  services: any[];
  hours: any[];
}

const ProviderCard: React.FC<{ provider: BackendProvider }> = ({ provider }) => {
  // Build location string
  const location = [provider.district, provider.city].filter(Boolean).join(", ");

  return (
    <Link
      to={`/providers/${provider.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition block"
    >
      {/* Icon */}
      <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
        <Building2 className="w-7 h-7 text-indigo-600" />
      </div>

      {/* Business Name */}
      <h3 className="text-xl font-semibold text-gray-900 mb-1">
        {provider.businessName}
      </h3>

      {/* Category */}
      <div className="inline-block px-2 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded mb-3">
        {provider.category}
      </div>

      {/* Description */}
      {provider.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {provider.description}
        </p>
      )}

      {/* Location */}
      {location && (
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      )}

      {/* Phone */}
      {provider.phone && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Phone className="w-4 h-4" />
          <span>{provider.phone}</span>
        </div>
      )}

      {/* Services count */}
      {provider.services && provider.services.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            {provider.services.length} үйлчилгээ үзүүлдэг
          </p>
        </div>
      )}
    </Link>
  );
};

export default ProviderCard;
