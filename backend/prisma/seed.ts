import { PrismaClient, Role } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// REAL business categories from your app
const BUSINESS_TYPES = [
  {
    id: 'barber',
    label: 'Үсчин',
    services: [
      { name: 'Эрэгтэй үс', duration: 30, priceRange: [20000, 30000] },
      { name: 'Эмэгтэй үс', duration: 45, priceRange: [30000, 45000] },
      { name: 'Хими', duration: 120, priceRange: [70000, 100000] },
      { name: 'Үс будах', duration: 90, priceRange: [50000, 80000] },
      { name: 'Хуйхны эмчилгээ', duration: 60, priceRange: [35000, 50000] }
    ]
  },
  {
    id: 'beauty',
    label: 'Гоо сайхан',
    services: [
      { name: 'Хумс хийх', duration: 60, priceRange: [20000, 35000] },
      { name: 'Суга', duration: 15, priceRange: [8000, 15000] },
      { name: 'Хөл вакс', duration: 30, priceRange: [20000, 30000] },
      { name: 'Гар вакс', duration: 20, priceRange: [15000, 25000] },
      { name: 'Бүтэн бие вакс', duration: 90, priceRange: [70000, 90000] },
      { name: 'Сормуус хийх', duration: 30, priceRange: [12000, 20000] }
    ]
  },
  {
    id: 'tattoo',
    label: 'Шивээс',
    services: [
      { name: 'Энгийн жижиг хэмжээтэй', duration: 60, priceRange: [40000, 60000] },
      { name: 'Энгийн дунд хэмжээтэй', duration: 120, priceRange: [90000, 120000] },
      { name: 'Энгийн том хэмжээтэй', duration: 180, priceRange: [180000, 250000] },
      { name: 'Өнгөт жижиг хэмжээтэй', duration: 90, priceRange: [70000, 90000] },
      { name: 'Өнгөт дунд хэмжээтэй', duration: 150, priceRange: [140000, 180000] },
      { name: 'Өнгөт том хэмжээтэй', duration: 240, priceRange: [280000, 350000] }
    ]
  },
  {
    id: 'dental',
    label: 'Шүдний эмнэлэг',
    services: [
      { name: 'Үзлэг', duration: 30, priceRange: [15000, 25000] },
      { name: 'Ломбо', duration: 60, priceRange: [45000, 60000] },
      { name: 'Шүд авхуулах', duration: 45, priceRange: [50000, 70000] },
      { name: 'Эмчилгээ', duration: 60, priceRange: [70000, 100000] }
    ]
  },
  {
    id: 'carwash',
    label: 'Машин угаалга',
    services: [
      { name: 'Бага оврийн машин гадар', duration: 20, priceRange: [12000, 18000] },
      { name: 'Бага оврийн машин бүтэн', duration: 40, priceRange: [20000, 30000] },
      { name: 'Дунд оврийн машин гадар', duration: 25, priceRange: [18000, 25000] },
      { name: 'Дунд оврийн машин бүтэн', duration: 50, priceRange: [30000, 40000] },
      { name: 'Том оврийн машин гадар', duration: 30, priceRange: [22000, 30000] },
      { name: 'Том оврийн машин бүтэн', duration: 60, priceRange: [40000, 50000] },
      { name: 'Ченж угаалга', duration: 45, priceRange: [25000, 35000] }
    ]
  },
  {
    id: 'photography',
    label: 'Гэрэл зураг',
    services: [
      { name: 'Цээж зураг', duration: 30, priceRange: [40000, 60000] },
      { name: 'Portrait зураг', duration: 60, priceRange: [70000, 100000] },
      { name: 'Гэр бүлийн зураг', duration: 90, priceRange: [100000, 150000] },
      { name: 'Хуримын зураг', duration: 480, priceRange: [450000, 600000] }
    ]
  },
  {
    id: 'psychology',
    label: 'Сэтгэлзүйч',
    services: [
      { name: 'Зөвлөгөө', duration: 60, priceRange: [70000, 100000] }
    ]
  }
];

const UB_DISTRICTS = [
  'Баянзүрх дүүрэг', 'Сүхбаатар дүүрэг', 'Хан-Уул дүүрэг',
  'Чингэлтэй дүүрэг', 'Баянгол дүүрэг', 'Сонгинохайрхан дүүрэг'
];

const OTHER_LOCATIONS = [
  { city: 'Дархан', district: 'Хөдөө орон нутаг' },
  { city: 'Эрдэнэт', district: 'Хөдөө орон нутаг' }
];

const MONGOLIAN_NAMES = [
  'Болд', 'Дорж', 'Батаа', 'Түвшин', 'Ганбаатар', 'Мөнх', 'Энхбат',
  'Жаргал', 'Өнөр', 'Цэнд', 'Баяр', 'Алтан', 'Нарантуяа'
];

const BUSINESS_PREFIXES = ['Алтан', 'Өргөө', 'Мандал', 'Төгс', 'Элит', 'Премиум', 'Монгол', 'Их'];

function generateBusinessName(categoryLabel: string): string {
  const prefix = faker.helpers.arrayElement(BUSINESS_PREFIXES);
  const suffix = faker.helpers.arrayElement(['төв', 'салон', 'клиник', 'студио', 'гэр']);
  return `${prefix} ${categoryLabel} ${suffix}`;
}

function generateNickname(businessName: string): string {
  return businessName.split(' ').slice(0, 2).join(' ');
}

async function main() {
  console.log('🌱 Starting seed with REAL business categories...');
  console.log('🗑️  Clearing existing data...');

  await prisma.appointment.deleteMany();
  await prisma.workingHours.deleteMany();
  await prisma.service.deleteMany();
  await prisma.businessProvider.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data\n');

  const hashedPassword = await bcrypt.hash('Password123', 10);
  const businessesPerCategory = Math.floor(80 / BUSINESS_TYPES.length);
  const remainder = 80 % BUSINESS_TYPES.length;
  let totalBusinessesCreated = 0;

  for (let catIndex = 0; catIndex < BUSINESS_TYPES.length; catIndex++) {
    const businessType = BUSINESS_TYPES[catIndex];
    const numBusinesses = businessesPerCategory + (catIndex < remainder ? 1 : 0);

    for (let i = 0; i < numBusinesses; i++) {
      const businessName = generateBusinessName(businessType.label);
      const nickname = generateNickname(businessName);
      const ownerName = faker.helpers.arrayElement(MONGOLIAN_NAMES);
      const isUB = Math.random() > 0.2;
      let city, district;

      if (isUB) {
        city = 'Улаанбаатар';
        district = faker.helpers.arrayElement(UB_DISTRICTS);
      } else {
        const location = faker.helpers.arrayElement(OTHER_LOCATIONS);
        city = location.city;
        district = location.district;
      }

      // Generate avatar URL using UI Avatars service
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(ownerName)}&background=random&size=200&bold=true`;

      const user = await prisma.user.create({
        data: {
          email: `business${totalBusinessesCreated + 1}@test.com`,
          password: hashedPassword,
          fullName: ownerName,
          role: Role.PROVIDER,
          emailVerified: true,
          phone: `${faker.number.int({ min: 80000000, max: 99999999 })}`,
          avatarUrl,
        }
      });

      const provider = await prisma.businessProvider.create({
        data: {
          userId: user.id,
          businessName: `${businessName} (ТЕСТ)`,
          nickname: `${nickname} 🧪`,
          category: businessType.id,
          phone: `${faker.number.int({ min: 80000000, max: 99999999 })}`,
          description: `Манай ${businessType.label} нь мэргэжлийн өндөр түвшинд үйлчилгээ үзүүлдэг. (Тест өгөгдөл)`,
          city,
          district,
          address: `${faker.number.int({ min: 1, max: 50 })}-р байр`
        }
      });

      const minServices = Math.min(1, businessType.services.length);
      const maxServices = Math.min(5, businessType.services.length);
      const numServices = minServices === maxServices
        ? minServices
        : faker.number.int({ min: minServices, max: maxServices });
      const selectedServices = faker.helpers.arrayElements(businessType.services, numServices);

      for (const serviceTemplate of selectedServices) {
        const price = faker.number.int({
          min: serviceTemplate.priceRange[0],
          max: serviceTemplate.priceRange[1]
        });

        await prisma.service.create({
          data: {
            providerId: provider.id,
            name: serviceTemplate.name,
            duration: serviceTemplate.duration,
            price,
            description: `Чанартай ${serviceTemplate.name.toLowerCase()} үйлчилгээ`
          }
        });
      }

      totalBusinessesCreated++;
      if (totalBusinessesCreated % 10 === 0) {
        console.log(`✅ Created ${totalBusinessesCreated}/80 businesses...`);
      }
    }

    console.log(`   📁 ${businessType.label}: ${numBusinesses} businesses`);
  }

  console.log('\n🎉 Seed completed!');
  console.log(`📊 Total: ${totalBusinessesCreated} businesses`);
  console.log('⚠️  NO working hours - cannot be booked');
  console.log('🧪 All marked with (ТЕСТ) and 🧪 emoji');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
