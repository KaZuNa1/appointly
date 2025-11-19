export default function BusinessInfoCard() {
  const mockBusiness = {
    name: "SPA & Massage Center",
    category: "Спа үйлчилгээ",
    phone: "99112233",
    email: "spa@example.com",
    address: "УБ, БЗД, 13-р хороо"
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-4">Бизнесийн мэдээлэл</h2>

      <div className="space-y-2 text-gray-700">
        <p><strong>Нэр:</strong> {mockBusiness.name}</p>
        <p><strong>Төрөл:</strong> {mockBusiness.category}</p>
        <p><strong>Утас:</strong> {mockBusiness.phone}</p>
        <p><strong>Email:</strong> {mockBusiness.email}</p>
        <p><strong>Хаяг:</strong> {mockBusiness.address}</p>
      </div>
    </div>
  );
}
