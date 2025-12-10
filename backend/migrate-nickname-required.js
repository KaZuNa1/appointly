const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Starting nickname migration...');

  try {
    // Find all BusinessProviders with null nickname
    const providersWithoutNickname = await prisma.businessProvider.findMany({
      where: {
        nickname: null
      }
    });

    console.log(`Found ${providersWithoutNickname.length} providers without nickname`);

    // Update each provider to use businessName as nickname if nickname is null
    for (const provider of providersWithoutNickname) {
      await prisma.businessProvider.update({
        where: { id: provider.id },
        data: { nickname: provider.businessName }
      });
      console.log(`✅ Updated provider ${provider.id}: nickname set to "${provider.businessName}"`);
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
