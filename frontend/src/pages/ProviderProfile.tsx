// /src/pages/ProviderProfile.tsx

import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import DaySelector from "@/components/provider/DaySelector";
import TimeSlots from "@/components/provider/TimeSlots";
import BookButton from "@/components/provider/BookButton";

import { useState } from "react";

// 🔥 Static Schedule (MVP)
const STATIC_SCHEDULE: Record<string, string[]> = {
  monday: ["10:00", "11:00", "12:00", "13:00"],
  tuesday: ["10:00", "11:00", "12:00", "13:00"],
  wednesday: ["10:00", "11:00", "12:00"],
  thursday: ["10:00", "11:00", "12:00", "13:00"],
  friday: ["10:00", "11:00", "12:00"],
  saturday: [],
  sunday: [],
};

// For mongolian labels
const DAY_LABELS: Record<string, string> = {
  monday: "Даваа",
  tuesday: "Мягмар",
  wednesday: "Лхагва",
  thursday: "Пүрэв",
  friday: "Баасан",
  saturday: "Бямба",
  sunday: "Ням",
};

export default function ProviderProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [selectedDay, setSelectedDay] = useState<string>("monday");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleBook = () => {
    if (!selectedTime) {
      alert("Цаг сонгоно уу!");
      return;
    }

    // Redirect mock
    navigate(`/booking/${id}?day=${selectedDay}&time=${selectedTime}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-16">

        {/* Provider Header */}
        <div className="mb-14">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Үйлчилгээ үзүүлэгч #{id}
          </h1>
          <p className="text-gray-600 text-lg">
            Энэ бол демо үйлчилгээ үзүүлэгчийн мэдээлэл. Доороос боломжит цагуудаас сонгоно уу.
          </p>
        </div>

        {/* Day Selector */}
        <DaySelector
          days={DAY_LABELS}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
        />

        {/* Time Slots */}
        <TimeSlots
          times={STATIC_SCHEDULE[selectedDay]}
          selectedTime={selectedTime}
          onSelectTime={setSelectedTime}
        />

        {/* Book Button */}
        <div className="mt-10">
          <BookButton onClick={handleBook} disabled={!selectedTime} />
        </div>

      </main>

      <Footer />
    </div>
  );
}
