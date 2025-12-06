const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting migration: Add avatarUrl to User table...');

  try {
    // Add avatarUrl column to User table
    await prisma.$executeRaw`
      ALTER TABLE "User"
      ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
    `;

    console.log('✅ Migration completed successfully!');
    console.log('✅ Added avatarUrl column to User table');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
