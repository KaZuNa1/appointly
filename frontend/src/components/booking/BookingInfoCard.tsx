export default function BookingInfoCard({ booking }: any) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-10">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">
        Захиалгын мэдээлэл
      </h3>

      <ul className="space-y-3 text-gray-700">
        <li><strong>Огноо:</strong> {booking.date}</li>
        <li><strong>Цаг:</strong> {booking.time}</li>
        <li><strong>Үргэлжлэх хугацаа:</strong> {booking.duration} мин</li>
        <li><strong>Үнэ:</strong> {booking.price}</li>
        <li><strong>Захиалгын дугаар:</strong> {booking.bookingId}</li>
      </ul>
    </div>
  );
}
