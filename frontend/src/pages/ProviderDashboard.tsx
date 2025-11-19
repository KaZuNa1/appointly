import BusinessInfoCard from "@/components/provider/BusinessInfoCard";
import AppointmentsList from "@/components/provider/AppointmentsList";
import AvailabilityList from "@/components/provider/AvailabilityList";

export default function ProviderDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900">
          Бизнесийн Хяналтын Самбар
        </h1>

        {/* Business Info */}
        <BusinessInfoCard />

        {/* Two side-by-side sections */}
        <div className="grid md:grid-cols-2 gap-8">
          <AppointmentsList />
          <AvailabilityList />
        </div>

      </div>
    </div>
  );
}
