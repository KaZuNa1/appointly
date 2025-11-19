export default function ProviderInfo({ provider }: { provider: any }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-3">Тухай</h2>
      <p className="text-gray-700">{provider.description}</p>
    </div>
  );
}
