const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding Google OAuth fields to User table...');

  // First create the enum type if it doesn't exist
  await prisma.$executeRaw`
    DO $$ BEGIN
      CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `;

  // Make password nullable and add OAuth fields
  await prisma.$executeRaw`
    ALTER TABLE "User"
    ALTER COLUMN "password" DROP NOT NULL,
    ADD COLUMN IF NOT EXISTS "provider" "AuthProvider" DEFAULT 'LOCAL',
    ADD COLUMN IF NOT EXISTS "googleId" TEXT UNIQUE;
  `;

  console.log('✅ Added Google OAuth fields to User table');
  console.log('📝 Changes made:');
  console.log('   - password: Made nullable');
  console.log('   - provider: Added (AuthProvider enum, default: LOCAL)');
  console.log('   - googleId: Added (Text, unique, nullable)');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
