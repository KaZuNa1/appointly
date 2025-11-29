import { useParams, Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import BookingSummary from "@/components/booking/BookingSummary";
import BookingInfoCard from "@/components/booking/BookingInfoCard";
import BookingActions from "@/components/booking/BookingActions";

export default function BookingConfirmation() {
  const { id } = useParams();

  // Temporary mock while backend not connected
  const booking = {
    providerName: "Bold үсчин",
    serviceName: "Үс засуулах",
    date: "2025-01-12",
    time: "14:30",
    duration: 30,
    price: "25,000₮",
    bookingId: id
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center py-20 px-6">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-xl w-full">
        
        <BookingSummary
          providerName={booking.providerName}
          serviceName={booking.serviceName}
        />

        <BookingInfoCard booking={booking} />

        <BookingActions providerName={booking.providerName} />

      </div>
      </div>
    </div>
  );
}
