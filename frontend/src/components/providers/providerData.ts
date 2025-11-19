import type { ComponentType } from "react";
import { Scissors, Car, Leaf } from "lucide-react";

export interface Provider {
  id: string;
  name: string;
  service: string; // slug: "haircut", "spa"
  desc: string;
  rating: number;
  reviews: number;
  priceRange: string;
  icon: ComponentType<{ className?: string }>;
}

export const PROVIDERS: Provider[] = [
  {
    id: "1",
    name: "Tommy Salon",
    service: "haircut",
    desc: "Мэргэжлийн эрэгтэй/эмэгтэй үс засалт",
    rating: 4.8,
    reviews: 120,
    priceRange: "25,000₮ - 40,000₮",
    icon: Scissors,
  },
  {
    id: "2",
    name: "Spa Relax Center",
    service: "spa",
    desc: "Массаж & спа үйлчилгээ",
    rating: 4.6,
    reviews: 85,
    priceRange: "35,000₮ - 70,000₮",
    icon: Leaf,
  },
  {
    id: "3",
    name: "AutoWash Pro",
    service: "carwash",
    desc: "Гадна + дотно автомашин угаалга",
    rating: 4.2,
    reviews: 50,
    priceRange: "15,000₮",
    icon: Car,
  },
];
