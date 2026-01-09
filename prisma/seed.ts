import { PrismaClient, ProviderType, CareType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data (optional - comment out in production)
  console.log('🗑️  Clearing existing data...');
  await prisma.message.deleteMany();
  await prisma.tourAppointment.deleteMany();
  await prisma.consultRequest.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  // Create demo password hash (password: "demo123")
  const demoPassword = await hash('demo123', 12);

  // ============================================================================
  // 1. CREATE USERS
  // ============================================================================
  console.log('👤 Creating users...');

  const familyUser1 = await prisma.user.create({
    data: {
      email: 'sarah.miller@example.com',
      name: 'Sarah Miller',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 111-2222',
      activeMode: 'FAMILY',
    },
  });

  const familyUser2 = await prisma.user.create({
    data: {
      email: 'michael.chen@example.com',
      name: 'Michael Chen',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 222-3333',
      activeMode: 'FAMILY',
    },
  });

  const familyUser3 = await prisma.user.create({
    data: {
      email: 'jennifer.brown@example.com',
      name: 'Jennifer Brown',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 333-4444',
      activeMode: 'FAMILY',
    },
  });

  const providerUser1 = await prisma.user.create({
    data: {
      email: 'admin@sunshineseniorcare.com',
      name: 'Sunshine Admin',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 123-4567',
      activeMode: 'PROVIDER',
    },
  });

  const providerUser2 = await prisma.user.create({
    data: {
      email: 'director@goldenyears.com',
      name: 'Golden Years Director',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 234-5678',
      activeMode: 'PROVIDER',
    },
  });

  console.log('✅ Created 5 users (3 families, 2 providers)');

  // ============================================================================
  // 2. CREATE PROVIDERS
  // ============================================================================
  console.log('🏥 Creating providers...');

  const providers = [
    {
      name: "Sunshine Senior Care",
      providerType: ProviderType.HOME_CARE,
      description: "Providing compassionate in-home care services for seniors. Our trained caregivers assist with daily activities, medication management, and companionship.",
      email: "contact@sunshineseniorcare.com",
      phone: "(555) 123-4567",
      website: "https://sunshineseniorcare.com",
      address: "123 Main Street",
      city: "Los Angeles",
      state: "CA",
      zipCode: "90001",
      serviceRadius: 25,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE, CareType.RESPITE_CARE],
      licensed: true,
      licenseNumber: "CA-HC-12345",
      yearsInBusiness: 15,
      capacity: 50,
      userId: providerUser1.id,
    },
    {
      name: "Golden Years Assisted Living",
      providerType: ProviderType.ASSISTED_LIVING,
      description: "A warm and welcoming assisted living community offering 24/7 care, engaging activities, and personalized support for our residents.",
      email: "info@goldenyears.com",
      phone: "(555) 234-5678",
      website: "https://goldenyearsassistedliving.com",
      address: "456 Oak Avenue",
      city: "San Francisco",
      state: "CA",
      zipCode: "94102",
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.MEMORY_CARE, CareType.SKILLED_NURSING],
      licensed: true,
      licenseNumber: "CA-AL-67890",
      yearsInBusiness: 20,
      capacity: 80,
      userId: providerUser2.id,
    },
    {
      name: "Caring Hands Home Health",
      providerType: ProviderType.HOME_HEALTH,
      description: "Medicare-certified home health agency providing skilled nursing, physical therapy, and medical services in the comfort of your home.",
      email: "help@caringhands.com",
      phone: "(555) 345-6789",
      website: "https://caringhandshomehealth.com",
      address: "789 Elm Street",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
      serviceRadius: 30,
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.HOSPICE_CARE, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-HH-11111",
      yearsInBusiness: 12,
      capacity: 100,
    },
    {
      name: "Memory Lane Care Center",
      providerType: ProviderType.MEMORY_CARE,
      description: "Specialized memory care facility for individuals with Alzheimer's and dementia. Secure environment with trained staff and therapeutic activities.",
      email: "contact@memorylanecenter.com",
      phone: "(555) 456-7890",
      address: "321 Pine Road",
      city: "Sacramento",
      state: "CA",
      zipCode: "95814",
      careTypesOffered: [CareType.MEMORY_CARE, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-MC-22222",
      yearsInBusiness: 10,
      capacity: 40,
    },
    {
      name: "Peaceful Transitions Hospice",
      providerType: ProviderType.HOSPICE,
      description: "Compassionate end-of-life care focusing on comfort, dignity, and quality of life. Supporting patients and families through difficult times.",
      email: "info@peacefultransitions.org",
      phone: "(555) 567-8901",
      website: "https://peacefultransitionshospice.org",
      address: "654 Maple Drive",
      city: "Oakland",
      state: "CA",
      zipCode: "94601",
      serviceRadius: 40,
      careTypesOffered: [CareType.HOSPICE_CARE, CareType.SKILLED_NURSING],
      licensed: true,
      licenseNumber: "CA-HP-33333",
      yearsInBusiness: 18,
    },
    {
      name: "Sarah Johnson - Independent Caregiver",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "Experienced independent caregiver with 8 years of experience. Specializing in companionship, meal preparation, light housekeeping, and medication reminders.",
      email: "sarah.johnson@email.com",
      phone: "(555) 678-9012",
      address: "Home-based service",
      city: "San Jose",
      state: "CA",
      zipCode: "95101",
      serviceRadius: 15,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE],
      licensed: false,
      yearsInBusiness: 8,
    },
    {
      name: "Riverside Nursing Home",
      providerType: ProviderType.NURSING_HOME,
      description: "Full-service skilled nursing facility providing 24-hour medical care, rehabilitation services, and long-term care in a comfortable setting.",
      email: "admissions@riversidenursing.com",
      phone: "(555) 789-0123",
      website: "https://riversidenursinghome.com",
      address: "987 River Road",
      city: "Fresno",
      state: "CA",
      zipCode: "93650",
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE, CareType.MEMORY_CARE],
      licensed: true,
      licenseNumber: "CA-NH-44444",
      yearsInBusiness: 25,
      capacity: 120,
    },
    {
      name: "New Hope Rehabilitation Center",
      providerType: ProviderType.REHABILITATION,
      description: "Short-term rehabilitation and recovery services including physical therapy, occupational therapy, and post-surgical care.",
      email: "intake@newhoperehab.com",
      phone: "(555) 890-1234",
      website: "https://newhoperehab.com",
      address: "147 Hope Lane",
      city: "Anaheim",
      state: "CA",
      zipCode: "92801",
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-RH-55555",
      yearsInBusiness: 14,
      capacity: 60,
    },
  ];

  const createdProviders: any[] = [];
  for (const provider of providers) {
    const created = await prisma.provider.create({
      data: provider,
    });
    createdProviders.push(created);
  }

  console.log('✅ Created 8 providers');

  // ============================================================================
  // 3. CREATE FAMILY PROFILES
  // ============================================================================
  console.log('👨‍👩‍👧 Creating family profiles...');

  const familyProfile1 = await prisma.familyProfile.create({
    data: {
      userId: familyUser1.id,
      relationship: 'Daughter',
      location: 'Los Angeles, CA',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      description: 'Looking for home care for my 82-year-old mother. She needs help with daily activities, meal preparation, and medication reminders. She has early-stage Alzheimer\'s.',
      careTypes: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE],
      careUrgency: 'URGENT',
      budgetMin: 3000,
      budgetMax: 5000,
    },
  });

  const familyProfile2 = await prisma.familyProfile.create({
    data: {
      userId: familyUser2.id,
      relationship: 'Son',
      location: 'San Francisco, CA',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      description: 'Seeking assisted living facility for my father who is 75 years old. He is mostly independent but needs assistance with mobility and would benefit from social activities.',
      careTypes: [CareType.PERSONAL_CARE],
      careUrgency: 'WITHIN_MONTH',
      budgetMin: 5000,
      budgetMax: 8000,
    },
  });

  const familyProfile3 = await prisma.familyProfile.create({
    data: {
      userId: familyUser3.id,
      relationship: 'Wife',
      location: 'Sacramento, CA',
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      description: 'My husband (age 78) was recently diagnosed with dementia. We need specialized memory care with 24/7 supervision and cognitive therapy programs.',
      careTypes: [CareType.MEMORY_CARE],
      careUrgency: 'IMMEDIATE',
      budgetMin: 8000,
      budgetMax: 12000,
    },
  });

  console.log('✅ Created 3 family profiles');

  // ============================================================================
  // 4. CREATE CONSULTATION REQUESTS WITH MESSAGES
  // ============================================================================
  console.log('💬 Creating consultation requests with messages...');

  // Request 1: Sarah Miller → Sunshine Senior Care (ACCEPTED with active conversation)
  const request1 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[0].id, // Sunshine Senior Care
      familyProfileId: familyProfile1.id,
      senderId: familyUser1.id,
      message: 'Hi! I\'m looking for in-home care for my mother. She\'s 82 and has early-stage Alzheimer\'s. She needs help with daily activities, meals, and medication. Can you provide details about your services and availability?',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  // Add messages to request 1
  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request1.id,
        senderId: providerUser1.id,
        content: 'Hello Sarah! Thank you for reaching out. We\'d be happy to help with your mother\'s care. Our caregivers are specially trained in Alzheimer\'s care and can assist with all the services you mentioned.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      },
      {
        consultRequestId: request1.id,
        senderId: familyUser1.id,
        content: 'That sounds perfect! What are your rates? And can you tell me more about the caregiver qualifications?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 15),
        createdAt: new Date(Date.now() - 1000 * 60 * 90),
      },
      {
        consultRequestId: request1.id,
        senderId: providerUser1.id,
        content: 'Our rates start at $35/hour for general care and $45/hour for specialized Alzheimer\'s care. All our caregivers are certified, background-checked, and have at least 5 years of experience. We can schedule a **free home assessment** to discuss your specific needs.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        consultRequestId: request1.id,
        senderId: familyUser1.id,
        content: 'That would be wonderful! When can we schedule the assessment?',
        status: 'DELIVERED',
        deliveredAt: new Date(Date.now() - 1000 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
    ],
  });

  // Add tour appointment to request 1
  await prisma.tourAppointment.create({
    data: {
      requestId: request1.id,
      proposedBy: providerUser1.id,
      proposedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2), // 2 days from now
      proposedTime: '10:00 AM',
      status: 'PROPOSED',
      notes: 'Home assessment at your location. Should take about 45 minutes.',
    },
  });

  // Request 2: Michael Chen → Golden Years (ACCEPTED with conversation)
  const request2 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[1].id, // Golden Years
      familyProfileId: familyProfile2.id,
      senderId: familyUser2.id,
      message: 'I\'m interested in learning more about your assisted living community for my father. He\'s 75 and mostly independent but needs some mobility assistance. Can we schedule a tour?',
      status: 'ACCEPTED',
      requestType: 'TOUR',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request2.id,
        senderId: providerUser2.id,
        content: 'Hello Michael! We\'d love to show you our community. Golden Years offers studio and one-bedroom apartments with 24/7 staff support, daily activities, and three meals a day. When would you like to visit?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // Yesterday
      },
      {
        consultRequestId: request2.id,
        senderId: familyUser2.id,
        content: 'That sounds great! I\'d like to visit with my father. Are afternoons this week available?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      },
    ],
  });

  // Add accepted tour
  await prisma.tourAppointment.create({
    data: {
      requestId: request2.id,
      proposedBy: providerUser2.id,
      proposedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
      proposedTime: '2:00 PM',
      status: 'ACCEPTED',
      notes: 'Tour of facility with apartment viewing',
    },
  });

  // Request 3: Jennifer Brown → Memory Lane (PENDING - no response yet)
  const request3 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[3].id, // Memory Lane
      familyProfileId: familyProfile3.id,
      senderId: familyUser3.id,
      message: 'My husband was recently diagnosed with dementia and we urgently need specialized memory care. Can you provide information about your programs, staff-to-resident ratio, and costs?',
      status: 'PENDING',
      requestType: 'CONSULTATION',
    },
  });

  // Request 4: Sarah Miller → Caring Hands (DECLINED)
  await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[2].id, // Caring Hands
      familyProfileId: familyProfile1.id,
      senderId: familyUser1.id,
      message: 'Do you offer respite care services? Looking for short-term help.',
      status: 'DECLINED',
      requestType: 'CONSULTATION',
    },
  });

  console.log('✅ Created 4 consultation requests with messages and tours');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Database seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('   👤 Users: 5 (3 families, 2 providers)');
  console.log('   🏥 Providers: 8');
  console.log('   👨‍👩‍👧 Family Profiles: 3');
  console.log('   💬 Consultation Requests: 4');
  console.log('   📨 Messages: 7');
  console.log('   📅 Tour Appointments: 2');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 Demo Login Credentials:');
  console.log('   Family User 1:');
  console.log('     Email: sarah.miller@example.com');
  console.log('     Password: demo123');
  console.log('   Family User 2:');
  console.log('     Email: michael.chen@example.com');
  console.log('     Password: demo123');
  console.log('   Provider User:');
  console.log('     Email: admin@sunshineseniorcare.com');
  console.log('     Password: demo123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
