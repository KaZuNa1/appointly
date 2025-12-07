const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Adding password reset fields to User table...');

  await prisma.$executeRaw`
    ALTER TABLE "User"
    ADD COLUMN IF NOT EXISTS "resetPasswordToken" TEXT,
    ADD COLUMN IF NOT EXISTS "resetPasswordExpiry" TIMESTAMP(3),
    ADD COLUMN IF NOT EXISTS "lastResetEmailSent" TIMESTAMP(3);
  `;

  console.log('✅ Added password reset fields to User table');
  console.log('📝 Fields added:');
  console.log('   - resetPasswordToken (Text, nullable)');
  console.log('   - resetPasswordExpiry (DateTime, nullable)');
  console.log('   - lastResetEmailSent (DateTime, nullable)');
}

main()
  .catch((e) => {
    console.error('❌ Migration error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
