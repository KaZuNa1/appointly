import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function BookingActions({ providerName }: any) {
  return (
    <div className="flex flex-col space-y-4">
      <Link to="/my-bookings">
        <Button className="w-full h-12 text-lg">Миний захиалгууд</Button>
      </Link>

      <Link to="/providers">
        <Button
          variant="outline"
          className="w-full h-12 text-lg"
        >
          Буцах
        </Button>
      </Link>
    </div>
  );
}
