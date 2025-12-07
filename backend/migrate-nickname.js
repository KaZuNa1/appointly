const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Add nickname column to BusinessProvider table
    await prisma.$executeRaw`
      ALTER TABLE "BusinessProvider"
      ADD COLUMN IF NOT EXISTS "nickname" TEXT;
    `;

    console.log('✅ Added nickname column to BusinessProvider table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
