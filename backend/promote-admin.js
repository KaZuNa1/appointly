const { PrismaClient } = require("@prisma/client");
const readline = require("readline");

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function promoteToAdmin() {
  try {
    console.log("\n🔐 Admin User Promotion Tool\n");

    const email = await question("Enter user email to promote to ADMIN: ");

    if (!email || email.trim() === "") {
      console.log("❌ Email is required");
      rl.close();
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });

    if (!user) {
      console.log(`❌ User with email "${email}" not found`);
      rl.close();
      return;
    }

    console.log(`\n📋 User found:`);
    console.log(`   Name: ${user.fullName}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Current Role: ${user.role}`);

    if (user.role === "ADMIN") {
      console.log(`\n✅ User is already an ADMIN`);
      rl.close();
      return;
    }

    const confirm = await question(`\nPromote this user to ADMIN? (yes/no): `);

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Cancelled");
      rl.close();
      return;
    }

    // Update user role to ADMIN
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_PROMOTED_TO_ADMIN",
        entityId: user.id,
        details: {
          previousRole: user.role,
          newRole: "ADMIN",
          promotedBy: "SYSTEM_SCRIPT",
        },
      },
    });

    console.log(`\n✅ Successfully promoted ${updatedUser.fullName} to ADMIN!`);
    console.log(`\n🔑 They can now access the admin dashboard at: /admin`);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

promoteToAdmin();
