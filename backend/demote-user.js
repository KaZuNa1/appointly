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

async function demoteUser() {
  try {
    console.log("\n👤 User Role Change Tool\n");

    const email = await question("Enter user email to change role: ");

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

    console.log(`\nAvailable roles:`);
    console.log(`   1. CUSTOMER (regular user)`);
    console.log(`   2. PROVIDER (business owner)`);
    console.log(`   3. ADMIN (administrator)`);

    const roleChoice = await question(`\nSelect new role (1/2/3): `);

    let newRole;
    if (roleChoice === "1") {
      newRole = "CUSTOMER";
    } else if (roleChoice === "2") {
      newRole = "PROVIDER";
    } else if (roleChoice === "3") {
      newRole = "ADMIN";
    } else {
      console.log("❌ Invalid choice");
      rl.close();
      return;
    }

    if (user.role === newRole) {
      console.log(`\n✅ User already has ${newRole} role`);
      rl.close();
      return;
    }

    const confirm = await question(`\nChange role from ${user.role} to ${newRole}? (yes/no): `);

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Cancelled");
      rl.close();
      return;
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole },
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "USER_ROLE_CHANGED",
        entityId: user.id,
        details: {
          previousRole: user.role,
          newRole: newRole,
          changedBy: "SYSTEM_SCRIPT",
        },
      },
    });

    console.log(`\n✅ Successfully changed ${updatedUser.fullName}'s role to ${newRole}!`);

    if (newRole === "CUSTOMER") {
      console.log(`\n🔑 They can now access: /dashboard`);
    } else if (newRole === "PROVIDER") {
      console.log(`\n🔑 They can now access: /provider/dashboard`);
      console.log(`⚠️  Note: They need to create a business profile to use provider features`);
    } else if (newRole === "ADMIN") {
      console.log(`\n🔑 They can now access: /admin`);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

demoteUser();
