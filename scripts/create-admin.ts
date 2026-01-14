import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating admin account...');

  // Create admin@olera.com as dedicated admin account
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@olera.com' },
    update: {
      role: 'ADMIN',
      name: 'Admin User',
    },
    create: {
      email: 'admin@olera.com',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  console.log('✅ Admin account created/updated:', admin.email);

  // Also upgrade user3@test.com to admin if it exists
  try {
    const user3 = await prisma.user.update({
      where: { email: 'user3@test.com' },
      data: { role: 'ADMIN' },
    });
    console.log('✅ Upgraded user3@test.com to admin');
  } catch (error) {
    console.log('ℹ️  user3@test.com not found, skipping');
  }

  console.log('\n📋 Admin Accounts:');
  console.log('   admin@olera.com / admin123');
  console.log('   user3@test.com / password123 (if exists)');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
