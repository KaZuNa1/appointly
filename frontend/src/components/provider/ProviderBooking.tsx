import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ProviderBooking({ provider }: { provider: any }) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Цаг авах</h2>

      <div className="space-y-4 max-w-md">
        <input 
          type="date"
          className="w-full border rounded-lg p-3"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input 
          type="time"
          className="w-full border rounded-lg p-3"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <Button className="w-full">
          Цаг авах
        </Button>
      </div>
    </div>
  );
}
