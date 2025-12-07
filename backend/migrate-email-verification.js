const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding email verification fields to User table...');

  await prisma.$executeRaw`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "emailVerified" BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS "verificationToken" TEXT,
    ADD COLUMN IF NOT EXISTS "tokenExpiry" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "lastVerificationEmailSent" TIMESTAMP(3);
  `;

  console.log('✅ Added email verification fields to User table');
  console.log('📝 Fields added:');
  console.log('   - emailVerified (Boolean, default: false)');
  console.log('   - verificationToken (Text, nullable)');
  console.log('   - tokenExpiry (DateTime, nullable)');
  console.log('   - lastVerificationEmailSent (DateTime, nullable)');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
