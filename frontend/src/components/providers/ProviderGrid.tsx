import ProviderCard from "./ProviderCard";

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

interface ProviderGridProps {
  providers: BackendProvider[];
  bookmarkedIds?: Set<string>;
  onBookmarkToggle?: (providerId: string) => void;
  showBookmarks?: boolean;
}

const ProviderGrid: React.FC<ProviderGridProps> = ({
  providers,
  bookmarkedIds = new Set(),
  onBookmarkToggle,
  showBookmarks = false
}) => {
  if (providers.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">Үйлчилгээ үзүүлэгч олдсонгүй</p>
        <p className="text-sm text-gray-400 mt-2">
          Өөр хайлтаар дахин оролдоно уу эсвэл бүх бизнесүүдийг харна уу
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((p) => (
        <ProviderCard
          key={p.id}
          provider={p}
          isBookmarked={bookmarkedIds.has(p.id)}
          onBookmarkToggle={onBookmarkToggle}
          showBookmark={showBookmarks}
        />
      ))}
    </div>
  );
};

export default ProviderGrid;
