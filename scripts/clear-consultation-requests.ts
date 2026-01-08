import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Deleting all consultation requests...');

  // Delete all messages first (due to foreign key constraints)
  const deletedMessages = await prisma.message.deleteMany({});
  console.log(`Deleted ${deletedMessages.count} consultation request messages`);

  // Delete all consultation requests
  const deletedRequests = await prisma.consultRequest.deleteMany({});
  console.log(`Deleted ${deletedRequests.count} consultation requests`);

  console.log('✓ All consultation requests cleared!');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
