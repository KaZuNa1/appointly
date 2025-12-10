import { Link } from "react-router-dom";
import { Building2, MapPin, Phone, Heart } from "lucide-react";

// Backend provider type
interface BackendProvider {
  id: string;
  businessName: string;
  nickname: string;
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
    avatarUrl?: string;
  };
  services: any[];
  hours: any[];
}

interface ProviderCardProps {
  provider: BackendProvider;
  isBookmarked?: boolean;
  onBookmarkToggle?: (providerId: string) => void;
  showBookmark?: boolean;
}

const ProviderCard: React.FC<ProviderCardProps> = ({
  provider,
  isBookmarked = false,
  onBookmarkToggle,
  showBookmark = false
}) => {
  // Build location string
  const location = [provider.district, provider.city].filter(Boolean).join(", ");

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to provider profile
    e.stopPropagation();
    if (onBookmarkToggle) {
      onBookmarkToggle(provider.id);
    }
  };

  return (
    <Link
      to={`/providers/${provider.id}`}
      className="bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-100 p-6 transition block relative"
    >
      {/* Bookmark Button - Top Right */}
      {showBookmark && onBookmarkToggle && (
        <button
          onClick={handleBookmarkClick}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${
            isBookmarked
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-400 hover:text-red-600 hover:bg-gray-100"
          }`}
          title={isBookmarked ? "Хадгалгаас хасах" : "Хадгалах"}
        >
          <Heart className={`w-5 h-5 ${isBookmarked ? "fill-current" : ""}`} />
        </button>
      )}

      {/* Avatar or Icon */}
      {provider.user.avatarUrl ? (
        <img
          src={provider.user.avatarUrl}
          alt={provider.nickname}
          className="w-14 h-14 rounded-xl object-cover border-2 border-indigo-600 mb-4"
        />
      ) : (
        <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
          <Building2 className="w-7 h-7 text-indigo-600" />
        </div>
      )}

      {/* Company Nickname - Main Heading */}
      <h3 className="text-2xl font-bold text-gray-900 mb-1">
        {provider.nickname}
      </h3>

      {/* Company Official Name - Smaller text below */}
      <p className="text-xs text-gray-500 mb-2">
        {provider.businessName}
      </p>

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
