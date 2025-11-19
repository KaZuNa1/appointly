import ProviderCard from "./ProviderCard";
import type { Provider } from "./providerData";

const ProviderGrid: React.FC<{ providers: Provider[] }> = ({ providers }) => {
  if (providers.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-500">Үйлчилгээ үзүүлэгч олдсонгүй</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {providers.map((p) => (
        <ProviderCard key={p.id} provider={p} />
      ))}
    </div>
  );
};

export default ProviderGrid;
