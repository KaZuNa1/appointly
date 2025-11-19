// frontend/src/components/services/servicesData.ts
import type { ComponentType } from "react";
import {
  Scissors,
  Sparkles,
  Leaf,
  Car,
  Stethoscope,
  Dumbbell,
  Wrench,
  Home,
  GraduationCap,
  Camera,
  Shirt,
  Dog,
} from "lucide-react";

export interface Service {
  name: string;
  desc: string;
  slug: string;
  icon: ComponentType<{ className?: string }>;
}

export const SERVICES: Service[] = [
  {
    name: "Үс засуулах",
    desc: "Мэргэжлийн үсчин үйлчилнэ",
    slug: "haircut",
    icon: Scissors,
  },
  {
    name: "Хумс арчилгаа",
    desc: "Гоо сайхны хумсны үйлчилгээ",
    slug: "nails",
    icon: Sparkles,
  },
  {
    name: "Спа & массаж",
    desc: "Амралт, стресс тайлах үйлчилгээ",
    slug: "spa",
    icon: Leaf,
  },
  {
    name: "Машин угаалга",
    desc: "Гадна дотно угаалга",
    slug: "carwash",
    icon: Car,
  },
  {
    name: "Шүдний эмнэлэг",
    desc: "Шүдний эмчилгээ, зөвлөгөө",
    slug: "dentist",
    icon: Stethoscope,
  },
  {
    name: "Фитнесс",
    desc: "Биеийн тамир, дасгал",
    slug: "fitness",
    icon: Dumbbell,
  },
  {
    name: "Засвар үйлчилгээ",
    desc: "Гэр ахуйн засвар",
    slug: "repair",
    icon: Wrench,
  },
  {
    name: "Цэвэрлэгээ",
    desc: "Гэр орон цэвэрлэх",
    slug: "cleaning",
    icon: Home,
  },
  {
    name: "Сургалт",
    desc: "Хувийн багш, сургалт",
    slug: "education",
    icon: GraduationCap,
  },
  {
    name: "Гэрэл зураг",
    desc: "Мэргэжлийн зураг авалт",
    slug: "photography",
    icon: Camera,
  },
  {
    name: "Хувцас оёлт",
    desc: "Хувцас оёх, засах",
    slug: "tailoring",
    icon: Shirt,
  },
  {
    name: "Тэжээвэр амьтан",
    desc: "Амьтны эмнэлэг, арчилгаа",
    slug: "pets",
    icon: Dog,
  },
];
