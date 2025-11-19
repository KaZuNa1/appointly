import { MapPin, Star } from "lucide-react";

export default function ProviderHeader({ provider }: { provider: any }) {
  return (
    <div className="space-y-3">
      <h1 className="text-4xl font-bold">{provider.name}</h1>

      <div className="flex items-center space-x-3 text-gray-600">
        <Star className="w-5 h-5 text-yellow-500" />
        <span>{provider.rating} / 5</span>

        <span>•</span>

        <span>{provider.category}</span>
      </div>

      <div className="flex items-center text-gray-600">
        <MapPin className="w-5 h-5 mr-1" />
        {provider.location}
      </div>
    </div>
  );
}
