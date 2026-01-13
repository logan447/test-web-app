import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function grantAdminAccess(email?: string) {
  try {
    // If email provided, update that user
    if (email) {
      const user = await prisma.user.update({
        where: { email },
        data: { role: 'ADMIN' },
        select: { id: true, email: true, name: true, role: true },
      });
      console.log('✅ Admin access granted to:', user);
      return;
    }

    // Otherwise, show all users and prompt
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('\n📋 Recent Users:');
    console.log('─────────────────────────────────────────────────────');
    users.forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} (${user.name}) - Role: ${user.role}`);
    });
    console.log('─────────────────────────────────────────────────────\n');

    console.log('To grant admin access, run:');
    console.log('npx tsx scripts/grant-admin.ts <email>');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line args
const email = process.argv[2];
grantAdminAccess(email);
