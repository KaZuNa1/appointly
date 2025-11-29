// Fixed business types and their associated services

export interface ServiceTemplate {
  id: string;
  name: string;
  defaultDuration: number; // in minutes
  defaultPrice: number; // in MNT
  description?: string;
  category?: string; // For subcategories like nails, wax, eyebrows in beauty
}

export interface BusinessType {
  id: string;
  name: string;
  label: string;
  services: ServiceTemplate[];
}

export const BUSINESS_TYPES: BusinessType[] = [
  {
    id: "barber",
    name: "barber",
    label: "Үсчин",
    services: [
      {
        id: "haircut-men",
        name: "Эрэгтэй үс",
        defaultDuration: 30,
        defaultPrice: 25000,
        description: "Эрэгтэй үс засалт"
      },
      {
        id: "haircut-women",
        name: "Эмэгтэй үс",
        defaultDuration: 45,
        defaultPrice: 35000,
        description: "Эмэгтэй үс засалт"
      },
      {
        id: "perm",
        name: "Хими",
        defaultDuration: 120,
        defaultPrice: 80000,
        description: "Үс хими хийлгэх"
      },
      {
        id: "hair-dye",
        name: "Үс будах",
        defaultDuration: 90,
        defaultPrice: 60000,
        description: "Үс будах үйлчилгээ"
      },
      {
        id: "scalp-treatment",
        name: "Хуйхны эмчилгээ",
        defaultDuration: 60,
        defaultPrice: 40000,
        description: "Хуйхны эмчилгээ, арчилгаа"
      }
    ]
  },
  {
    id: "beauty",
    name: "beauty",
    label: "Гоо сайхан",
    services: [
      // Хумс (Nails)
      {
        id: "nail-service",
        name: "Хумс хийх",
        defaultDuration: 60,
        defaultPrice: 25000,
        description: "Хумс хийлгэх үйлчилгээ",
        category: "хумс"
      },
      // Вакс (Wax)
      {
        id: "wax-eyebrow",
        name: "Суга",
        defaultDuration: 15,
        defaultPrice: 10000,
        description: "Сугаар хөмсөг засах",
        category: "вакс"
      },
      {
        id: "wax-leg",
        name: "Хөл",
        defaultDuration: 30,
        defaultPrice: 25000,
        description: "Хөл вакс хийлгэх",
        category: "вакс"
      },
      {
        id: "wax-arm",
        name: "Гар",
        defaultDuration: 20,
        defaultPrice: 20000,
        description: "Гар вакс хийлгэх",
        category: "вакс"
      },
      {
        id: "wax-full-body",
        name: "Бүтэн бие",
        defaultDuration: 90,
        defaultPrice: 80000,
        description: "Бүтэн биеийн вакс",
        category: "вакс"
      },
      // Сормуус (Eyebrows)
      {
        id: "eyebrow-service",
        name: "Сормуус хийх",
        defaultDuration: 30,
        defaultPrice: 15000,
        description: "Сормуус хийлгэх үйлчилгээ",
        category: "сормуус"
      }
    ]
  },
  {
    id: "tattoo",
    name: "tattoo",
    label: "Шивээс",
    services: [
      {
        id: "tattoo-small-regular",
        name: "Энгийн жижиг хэмжээтэй",
        defaultDuration: 60,
        defaultPrice: 50000,
        description: "Жижиг хэмжээтэй энгийн шивээс"
      },
      {
        id: "tattoo-medium-regular",
        name: "Энгийн дунд хэмжээтэй",
        defaultDuration: 120,
        defaultPrice: 100000,
        description: "Дунд хэмжээтэй энгийн шивээс"
      },
      {
        id: "tattoo-large-regular",
        name: "Энгийн том хэмжээтэй",
        defaultDuration: 180,
        defaultPrice: 200000,
        description: "Том хэмжээтэй энгийн шивээс"
      },
      {
        id: "tattoo-small-color",
        name: "Өнгөт жижиг хэмжээтэй",
        defaultDuration: 90,
        defaultPrice: 80000,
        description: "Жижиг хэмжээтэй өнгөт шивээс"
      },
      {
        id: "tattoo-medium-color",
        name: "Өнгөт дунд хэмжээтэй",
        defaultDuration: 150,
        defaultPrice: 150000,
        description: "Дунд хэмжээтэй өнгөт шивээс"
      },
      {
        id: "tattoo-large-color",
        name: "Өнгөт том хэмжээтэй",
        defaultDuration: 240,
        defaultPrice: 300000,
        description: "Том хэмжээтэй өнгөт шивээс"
      }
    ]
  },
  {
    id: "dental",
    name: "dental",
    label: "Шүдний эмнэлэг",
    services: [
      {
        id: "dental-checkup",
        name: "Үзлэг",
        defaultDuration: 30,
        defaultPrice: 20000,
        description: "Шүдний ерөнхий үзлэг"
      },
      {
        id: "dental-filling",
        name: "Ломбо",
        defaultDuration: 60,
        defaultPrice: 50000,
        description: "Шүдний ломбо"
      },
      {
        id: "dental-extraction",
        name: "Шүд авхуулах",
        defaultDuration: 45,
        defaultPrice: 60000,
        description: "Шүд авах үйлчилгээ"
      },
      {
        id: "dental-treatment",
        name: "Эмчилгээ",
        defaultDuration: 60,
        defaultPrice: 80000,
        description: "Шүдний эмчилгээ"
      }
    ]
  },
  {
    id: "carwash",
    name: "carwash",
    label: "Машин угаалга",
    services: [
      {
        id: "carwash-small-exterior",
        name: "Бага оврийн машин гадар",
        defaultDuration: 20,
        defaultPrice: 15000,
        description: "Бага оврийн машины гадна угаалга"
      },
      {
        id: "carwash-small-full",
        name: "Бага оврийн машин бүтэн",
        defaultDuration: 40,
        defaultPrice: 25000,
        description: "Бага оврийн машины бүтэн угаалга"
      },
      {
        id: "carwash-medium-exterior",
        name: "Дунд оврийн машин гадар",
        defaultDuration: 25,
        defaultPrice: 20000,
        description: "Дунд оврийн машины гадна угаалга"
      },
      {
        id: "carwash-medium-full",
        name: "Дунд оврийн машин бүтэн",
        defaultDuration: 50,
        defaultPrice: 35000,
        description: "Дунд оврийн машины бүтэн угаалга"
      },
      {
        id: "carwash-large-exterior",
        name: "Том оврийн машин гадар",
        defaultDuration: 30,
        defaultPrice: 25000,
        description: "Том оврийн машины гадна угаалга"
      },
      {
        id: "carwash-large-full",
        name: "Том оврийн машин бүтэн",
        defaultDuration: 60,
        defaultPrice: 45000,
        description: "Том оврийн машины бүтэн угаалга"
      },
      {
        id: "engine-clean",
        name: "Ченж угаалга",
        defaultDuration: 45,
        defaultPrice: 30000,
        description: "Хөдөлгүүрийн цэвэрлэгээ"
      }
    ]
  },
  {
    id: "photography",
    name: "photography",
    label: "Гэрэл зураг",
    services: [
      {
        id: "photo-headshot",
        name: "Цээж зураг",
        defaultDuration: 30,
        defaultPrice: 50000,
        description: "Цээж зураг авалт"
      },
      {
        id: "photo-portrait",
        name: "Portrait зураг",
        defaultDuration: 60,
        defaultPrice: 80000,
        description: "Portrait зураг авалт"
      },
      {
        id: "photo-family",
        name: "Гэр бүлийн зураг",
        defaultDuration: 90,
        defaultPrice: 120000,
        description: "Гэр бүлийн зураг авалт"
      },
      {
        id: "photo-wedding",
        name: "Хуримын зураг",
        defaultDuration: 480,
        defaultPrice: 500000,
        description: "Хуримын зураг авалт"
      }
    ]
  },
  {
    id: "psychology",
    name: "psychology",
    label: "Сэтгэлзүйч",
    services: [
      {
        id: "counseling",
        name: "Зөвлөгөө",
        defaultDuration: 60,
        defaultPrice: 80000,
        description: "Сэтгэл зүйн зөвлөгөө"
      }
    ]
  }
];

// Mapping for old category values to new ones (for backwards compatibility)
const CATEGORY_MAPPING: Record<string, string> = {
  "Үс засалт / Барбер": "barber",
  "Үсчин": "barber",
  "Спа & Массаж": "spa",
  "Автомашин угаалга": "carwash",
  "Машин угаалга": "carwash",
  "Гоо сайхан": "beauty",
  "Фитнесс & Дасгал": "fitness",
  "Шүдний эмнэлэг": "dental",
  "Малын эмнэлэг": "veterinary",
  "Гэрэл зураг": "photography",
  "Шивээс": "tattoo",
  "Сэтгэлзүйч": "psychology"
};

// Helper function to normalize category name
export const normalizeCategoryName = (category: string): string => {
  // Check if it's already a valid ID
  const isValidId = BUSINESS_TYPES.some(type => type.id === category || type.name === category);
  if (isValidId) return category;

  // Check mapping for old values
  return CATEGORY_MAPPING[category] || category;
};

// Helper function to get business type by id
export const getBusinessTypeById = (id: string): BusinessType | undefined => {
  const normalizedId = normalizeCategoryName(id);
  return BUSINESS_TYPES.find(type => type.id === normalizedId || type.name === normalizedId);
};

// Helper function to get services by business type
export const getServicesByBusinessType = (typeId: string): ServiceTemplate[] => {
  const normalizedId = normalizeCategoryName(typeId);
  const businessType = getBusinessTypeById(normalizedId);
  return businessType?.services || [];
};

// Helper function to get services grouped by category (for beauty salon)
export const getServicesGroupedByCategory = (typeId: string): Record<string, ServiceTemplate[]> => {
  const services = getServicesByBusinessType(typeId);
  const grouped: Record<string, ServiceTemplate[]> = {};

  services.forEach(service => {
    const category = service.category || 'main';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(service);
  });

  return grouped;
};
