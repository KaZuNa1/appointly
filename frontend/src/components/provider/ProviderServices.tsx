export default function ProviderServices({ services }: { services: any[] }) {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Үйлчилгээ & Үнийн хүснэгт</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {services.map((s, i) => (
          <div key={i} className="p-5 border rounded-xl bg-white shadow-sm">
            <div className="text-lg font-semibold">{s.name}</div>
            <div className="text-gray-600">{s.duration}</div>
            <div className="text-indigo-600 font-bold mt-2">{s.price}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
