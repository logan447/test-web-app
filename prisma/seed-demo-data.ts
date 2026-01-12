import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Unsplash photo IDs for realistic images
const PHOTOS = {
  assistedLiving: [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d', // Modern assisted living facility
    'https://images.unsplash.com/photo-1581594693702-fbdc51b2763b', // Senior care building
    'https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b', // Elegant facility interior
  ],
  memoryCare: [
    'https://images.unsplash.com/photo-1581594549595-35f6edc7b762', // Peaceful care home
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf', // Memory care facility
  ],
  homecare: [
    'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4', // Home care setting
    'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289', // Caregiver with senior
  ],
  caregivers: [
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2', // Professional caregiver 1
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54', // Professional caregiver 2
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2', // Professional caregiver 3
    'https://images.unsplash.com/photo-1594824476967-48c8b964273f', // Professional caregiver 4
  ],
};

async function main() {
  console.log('Starting demo data seed...');

  // Get existing demo users
  const familyUsers = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'family.assisted.active@demo.com',
          'family.assisted.browsing@demo.com',
          'family.memory.early@demo.com',
        ],
      },
    },
  });

  const providerUsers = await prisma.user.findMany({
    where: {
      email: {
        in: [
          'facility.assisted.complete@demo.com',
          'facility.assisted.incomplete@demo.com',
          'agency.homecare.large@demo.com',
          'caregiver.experienced.fulltime@demo.com',
        ],
      },
    },
  });

  console.log(`Found ${familyUsers.length} family users and ${providerUsers.length} provider users`);

  // ============================================
  // GET EXISTING FAMILY PROFILES
  // ============================================
  console.log('Fetching existing family profiles...');

  // The main seed already created 12 family profiles
  // We'll use those for creating saved items and requests
  const existingFamilyProfiles = await prisma.familyProfile.findMany({
    include: {
      user: true,
    },
  });

  console.log(`Found ${existingFamilyProfiles.length} existing family profiles`);

  // ============================================
  // SEED PROVIDERS (15 providers)
  // ============================================
  console.log('Creating provider profiles...');

  const providers = [
    // Assisted Living Facilities (3)
    {
      userId: providerUsers[0]?.id,
      name: 'Sunshine Manor Senior Living',
      providerType: 'ASSISTED_LIVING',
      description: 'Award-winning assisted living community offering personalized care in a warm, home-like environment. Our compassionate staff provides 24/7 support while encouraging independence and dignity.',
      careTypesOffered: ['ASSISTED_LIVING', 'MEMORY_CARE', 'RESPITE_CARE'],
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94102',
      address: '123 Golden Gate Ave',
      phone: '(415) 555-0123',
      email: 'info@sunshinemanor.com',
      website: 'https://sunshinemanor.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 5000,
      priceMax: 8500,
      availableSpots: 3,
      totalCapacity: 45,
      yearsInBusiness: 15,
      coverPhoto: PHOTOS.assistedLiving[0],
      photos: [PHOTOS.assistedLiving[0]],
      averageRating: 4.8,
      reviewCount: 127,
      hasMemoryCare: true,
      hasRespiteCare: true,
    },
    {
      userId: providerUsers[1]?.id,
      name: 'Parkside Living Community',
      providerType: 'ASSISTED_LIVING',
      description: 'Modern assisted living facility with spacious apartments and resort-style amenities. We focus on wellness, social engagement, and quality of life for all residents.',
      careTypesOffered: ['ASSISTED_LIVING', 'INDEPENDENT_LIVING'],
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      address: '456 Wilshire Blvd',
      phone: '(310) 555-0234',
      email: 'contact@parkside living.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 4500,
      priceMax: 7200,
      availableSpots: 5,
      totalCapacity: 60,
      yearsInBusiness: 12,
      coverPhoto: PHOTOS.assistedLiving[1],
      photos: [PHOTOS.assistedLiving[1]],
      averageRating: 4.6,
      reviewCount: 89,
      hasMemoryCare: false,
      hasRespiteCare: true,
    },
    {
      userId: providerUsers[0]?.id,
      name: 'Golden Years Residence',
      providerType: 'ASSISTED_LIVING',
      description: 'Affordable assisted living with exceptional care. Family-owned and operated for over 20 years, we treat every resident like family.',
      careTypesOffered: ['ASSISTED_LIVING'],
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      address: '789 Harbor Drive',
      phone: '(619) 555-0345',
      email: 'info@goldenyears.com',
      licensed: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 3500,
      priceMax: 5500,
      availableSpots: 2,
      totalCapacity: 30,
      yearsInBusiness: 22,
      coverPhoto: PHOTOS.assistedLiving[2],
      photos: [PHOTOS.assistedLiving[2]],
      averageRating: 4.7,
      reviewCount: 64,
      hasMemoryCare: false,
      hasRespiteCare: false,
    },

    // Memory Care Facilities (2)
    {
      userId: providerUsers[0]?.id,
      name: 'Serenity Memory Care Center',
      providerType: 'MEMORY_CARE',
      description: 'Specialized memory care facility with secured environment and expertly trained staff. We provide compassionate care for those with Alzheimer\'s and dementia using evidence-based approaches.',
      careTypesOffered: ['MEMORY_CARE'],
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      address: '321 Memory Lane',
      phone: '(408) 555-0456',
      email: 'care@serenitymemory.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 6500,
      priceMax: 9500,
      availableSpots: 1,
      totalCapacity: 24,
      yearsInBusiness: 8,
      coverPhoto: PHOTOS.memoryCare[0],
      photos: [PHOTOS.memoryCare[0]],
      averageRating: 4.9,
      reviewCount: 56,
      hasMemoryCare: true,
    },
    {
      userId: providerUsers[1]?.id,
      name: 'Mindful Living Memory Care',
      providerType: 'MEMORY_CARE',
      description: 'State-of-the-art memory care community with personalized care plans and therapeutic activities. Our specialized programming supports cognitive health and emotional well-being.',
      careTypesOffered: ['MEMORY_CARE', 'ASSISTED_LIVING'],
      city: 'Oakland',
      state: 'CA',
      zipCode: '94601',
      address: '654 Lake Shore Ave',
      phone: '(510) 555-0567',
      email: 'info@mindfulliving.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 7000,
      priceMax: 10000,
      availableSpots: 2,
      totalCapacity: 32,
      yearsInBusiness: 10,
      coverPhoto: PHOTOS.memoryCare[1],
      photos: [PHOTOS.memoryCare[1]],
      averageRating: 4.8,
      reviewCount: 43,
      hasMemoryCare: true,
    },

    // Home Care Agencies (3)
    {
      userId: providerUsers[2]?.id,
      name: 'CareFirst Home Health Services',
      providerType: 'HOME_CARE_AGENCY',
      description: 'Leading home care agency providing skilled nursing, personal care, and companionship services. Available 24/7 with flexible scheduling to meet your family\'s needs.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE', 'HOSPICE_CARE'],
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94103',
      address: '987 Market Street',
      phone: '(415) 555-0678',
      email: 'services@carefirsthome.com',
      website: 'https://carefirsthome.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 30,
      priceMax: 45,
      yearsInBusiness: 18,
      coverPhoto: PHOTOS.homecare[0],
      photos: [PHOTOS.homecare[0]],
      averageRating: 4.7,
      reviewCount: 203,
    },
    {
      userId: providerUsers[2]?.id,
      name: 'Comfort Care Home Services',
      providerType: 'HOME_CARE_AGENCY',
      description: 'Boutique home care agency specializing in one-on-one personalized care. Our caregivers are carefully matched to each client for the best possible relationship.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE', 'COMPANION_CARE'],
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90002',
      address: '147 Sunset Blvd',
      phone: '(323) 555-0789',
      email: 'info@comfortcarehome.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 28,
      priceMax: 42,
      yearsInBusiness: 12,
      coverPhoto: PHOTOS.homecare[1],
      photos: [PHOTOS.homecare[1]],
      averageRating: 4.9,
      reviewCount: 156,
    },
    {
      userId: providerUsers[2]?.id,
      name: 'Always There Home Care',
      providerType: 'HOME_CARE_AGENCY',
      description: 'Reliable home care services with a focus on continuity of care. Same caregiver whenever possible to build trust and consistency.',
      careTypesOffered: ['HOME_CARE', 'RESPITE_CARE'],
      city: 'Sacramento',
      state: 'CA',
      zipCode: '95814',
      address: '258 Capitol Mall',
      phone: '(916) 555-0890',
      email: 'contact@alwaystherehome.com',
      licensed: true,
      backgroundChecked: true,
      verified: true,
      priceMin: 25,
      priceMax: 38,
      yearsInBusiness: 15,
      coverPhoto: PHOTOS.homecare[0],
      photos: [PHOTOS.homecare[0]],
      averageRating: 4.5,
      reviewCount: 92,
    },

    // Individual Caregivers (4)
    {
      userId: providerUsers[3]?.id,
      name: 'Maria Rodriguez, CNA',
      providerType: 'INDEPENDENT_CAREGIVER',
      description: 'Certified Nursing Assistant with 15 years experience providing compassionate in-home care. Fluent in English and Spanish. Specializing in dementia and Alzheimer\'s care.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE', 'COMPANION_CARE'],
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94104',
      phone: '(415) 555-1234',
      email: 'maria.rodriguez.care@email.com',
      licensed: true,
      backgroundChecked: true,
      verified: true,
      certifications: ['CNA', 'CPR', 'First Aid', 'Dementia Care Specialist'],
      yearsInBusiness: 15,
      coverPhoto: PHOTOS.caregivers[0],
      photos: [PHOTOS.caregivers[0]],
      averageRating: 5.0,
      reviewCount: 28,
    },
    {
      userId: providerUsers[3]?.id,
      name: 'James Chen, HHA',
      providerType: 'INDEPENDENT_CAREGIVER',
      description: 'Home Health Aide with expertise in post-surgical care and mobility assistance. Patient, reliable, and skilled in medical equipment operation.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE'],
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90003',
      phone: '(310) 555-2345',
      email: 'jchen.care@email.com',
      licensed: true,
      backgroundChecked: true,
      verified: true,
      certifications: ['HHA', 'CPR', 'First Aid'],
      yearsInBusiness: 10,
      coverPhoto: PHOTOS.caregivers[1],
      photos: [PHOTOS.caregivers[1]],
      averageRating: 4.9,
      reviewCount: 34,
    },
    {
      userId: providerUsers[3]?.id,
      name: 'Sarah Williams, RN',
      providerType: 'INDEPENDENT_CAREGIVER',
      description: 'Registered Nurse offering skilled nursing care at home. Experienced in medication management, wound care, and chronic disease management.',
      careTypesOffered: ['HOME_CARE', 'HOSPICE_CARE'],
      city: 'San Diego',
      state: 'CA',
      zipCode: '92102',
      phone: '(619) 555-3456',
      email: 'sarah.williams.rn@email.com',
      licensed: true,
      backgroundChecked: true,
      verified: true,
      certifications: ['RN', 'Hospice Care', 'IV Therapy', 'Wound Care'],
      yearsInBusiness: 12,
      coverPhoto: PHOTOS.caregivers[2],
      photos: [PHOTOS.caregivers[2]],
      averageRating: 5.0,
      reviewCount: 45,
    },
    {
      userId: providerUsers[3]?.id,
      name: 'David Patel, Caregiver',
      providerType: 'INDEPENDENT_CAREGIVER',
      description: 'Experienced caregiver specializing in companionship and daily living assistance. Strong background in dementia care with a gentle, patient approach.',
      careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE'],
      city: 'San Jose',
      state: 'CA',
      zipCode: '95111',
      phone: '(408) 555-4567',
      email: 'dpatel.caregiver@email.com',
      licensed: false,
      backgroundChecked: true,
      verified: true,
      certifications: ['CPR', 'First Aid'],
      yearsInBusiness: 7,
      coverPhoto: PHOTOS.caregivers[3],
      photos: [PHOTOS.caregivers[3]],
      averageRating: 4.8,
      reviewCount: 19,
    },

    // Hiring Organizations (2) - for caregiver job seeking
    {
      userId: providerUsers[0]?.id,
      name: 'Premier Senior Care Network',
      providerType: 'HOME_CARE_AGENCY',
      description: 'Growing home care agency seeking compassionate caregivers to join our team. We offer competitive pay, flexible schedules, and comprehensive training. Great benefits and supportive work environment.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE', 'COMPANION_CARE'],
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      address: '741 Mission Street',
      phone: '(415) 555-5678',
      email: 'hiring@premierseniorcare.com',
      website: 'https://premierseniorcare.com/careers',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      yearsInBusiness: 20,
      coverPhoto: PHOTOS.homecare[1],
      photos: [PHOTOS.homecare[1]],
    },
    {
      userId: providerUsers[1]?.id,
      name: 'Bay Area Care Professionals',
      providerType: 'HOME_CARE_AGENCY',
      description: 'Established home care agency hiring experienced CNAs and HHAs. We value our caregivers and provide ongoing education, career advancement opportunities, and competitive compensation.',
      careTypesOffered: ['HOME_CARE', 'PERSONAL_CARE'],
      city: 'Oakland',
      state: 'CA',
      zipCode: '94602',
      address: '852 Broadway',
      phone: '(510) 555-6789',
      email: 'jobs@bayareacarepro.com',
      licensed: true,
      insuranceVerified: true,
      backgroundChecked: true,
      verified: true,
      yearsInBusiness: 14,
      coverPhoto: PHOTOS.assistedLiving[1],
      photos: [PHOTOS.assistedLiving[1]],
    },
  ];

  const createdProviders = [];
  for (const provider of providers) {
    if (provider.userId) {
      const created = await prisma.provider.create({
        data: provider,
      });
      createdProviders.push(created);
    }
  }

  console.log(`Created ${createdProviders.length} providers`);

  // ============================================
  // SEED SAVED ITEMS AND REQUESTS
  // ============================================
  console.log('Creating saved items and requests...');

  // Get created family profiles
  const createdFamilyProfiles = await prisma.familyProfile.findMany({
    where: {
      userId: {
        in: familyUsers.map(u => u.id),
      },
    },
  });

  // For each test account, create saved items and requests
  // Sarah Johnson (family.assisted.active@demo.com) - saves 3 providers, sends 2 requests
  if (familyUsers[0] && createdProviders.length >= 5) {
    // Save 3 providers
    await prisma.savedProvider.createMany({
      data: [
        {
          userId: familyUsers[0].id,
          providerId: createdProviders[0].id,
          notes: 'Love the memory care program. Want to schedule a tour.',
        },
        {
          userId: familyUsers[0].id,
          providerId: createdProviders[3].id,
          notes: 'Good reviews and close to my location.',
        },
        {
          userId: familyUsers[0].id,
          providerId: createdProviders[5].id,
          notes: 'Highly rated home care agency. Need to get pricing.',
        },
      ],
    });

    // Send 2 requests
    const request1 = await prisma.request.create({
      data: {
        familyId: familyUsers[0].id,
        providerId: createdProviders[0].id,
        status: 'PENDING',
        message: 'Hello, I\'m interested in learning more about your memory care services for my mother. She has early-stage Alzheimer\'s and needs 24/7 support. Could we schedule a tour?',
      },
    });

    const request2 = await prisma.request.create({
      data: {
        familyId: familyUsers[0].id,
        providerId: createdProviders[5].id,
        status: 'ACCEPTED',
        message: 'Hi, looking for home care services for my father. He needs assistance 5 days a week, about 6-8 hours per day. What are your rates?',
      },
    });

    // Add conversation to accepted request
    await prisma.message.createMany({
      data: [
        {
          requestId: request2.id,
          senderId: familyUsers[0].id,
          content: 'Hi, looking for home care services for my father. He needs assistance 5 days a week, about 6-8 hours per day. What are your rates?',
        },
        {
          requestId: request2.id,
          senderId: createdProviders[5].userId,
          content: 'Hello! Thank you for reaching out. Our standard rate is $35/hour for personal care services. For 6-8 hours per day, 5 days a week, we can offer a package rate. Can I schedule a free in-home assessment?',
        },
        {
          requestId: request2.id,
          senderId: familyUsers[0].id,
          content: 'That sounds reasonable. Yes, I\'d like to schedule an assessment. What times are available this week?',
        },
      ],
    });
  }

  // Sunshine Manor (facility.assisted.complete@demo.com) - saves 2 families, receives 3 requests
  if (providerUsers[0] && createdFamilyProfiles.length >= 5) {
    // Save 2 families
    await prisma.savedFamily.createMany({
      data: [
        {
          userId: providerUsers[0].id,
          familyProfileId: createdFamilyProfiles[0].id,
          notes: 'Perfect fit for our memory care unit. High budget, immediate need.',
        },
        {
          userId: providerUsers[0].id,
          familyProfileId: createdFamilyProfiles[2].id,
          notes: 'Specialized memory care needed. Should reach out.',
        },
      ],
    });

    // Create received requests (from families to this provider)
    const receivedRequest1 = await prisma.request.create({
      data: {
        familyId: familyUsers[1].id,
        providerId: createdProviders[0].id,
        status: 'PENDING',
        message: 'I visited your website and I\'m impressed by your facilities. My mother needs assisted living with potential for memory care later. Are you accepting new residents?',
      },
    });

    const receivedRequest2 = await prisma.request.create({
      data: {
        familyId: familyUsers[2].id,
        providerId: createdProviders[0].id,
        status: 'ACCEPTED',
        message: 'Hello, I need memory care for my husband with Alzheimer\'s. Can you tell me about your specialized programming and available spots?',
      },
    });

    // Add conversation
    await prisma.message.createMany({
      data: [
        {
          requestId: receivedRequest2.id,
          senderId: familyUsers[2].id,
          content: 'Hello, I need memory care for my husband with Alzheimer\'s. Can you tell me about your specialized programming and available spots?',
        },
        {
          requestId: receivedRequest2.id,
          senderId: providerUsers[0].id,
          content: 'Hello! We currently have 2 spots available in our memory care unit. Our program includes cognitive stimulation activities, music therapy, and a secured outdoor garden. We\'d love to show you around. When would you like to visit?',
        },
      ],
    });
  }

  // CareFirst Agency (agency.homecare.large@demo.com) - receives requests from families
  if (providerUsers[2] && familyUsers.length >= 2) {
    const agencyRequest = await prisma.request.create({
      data: {
        familyId: familyUsers[1].id,
        providerId: createdProviders[5].id,
        status: 'PENDING',
        message: 'My father is recovering from surgery and needs temporary home care. Do you have caregivers available for 4-6 weeks starting next month?',
      },
    });
  }

  // Experienced Caregiver (caregiver.experienced.fulltime@demo.com) - browses organizations
  if (providerUsers[3] && createdProviders.length >= 14) {
    // Save hiring organizations
    await prisma.savedProvider.createMany({
      data: [
        {
          userId: providerUsers[3].id,
          providerId: createdProviders[13].id,
          notes: 'Good benefits package. Want to apply.',
        },
      ],
    });
  }

  console.log('Demo data seed completed successfully!');
  console.log('\nSummary:');
  console.log(`- ${createdFamilyProfiles.length} family profiles`);
  console.log(`- ${createdProviders.length} providers`);
  console.log('- Saved items, requests, and conversations created for test accounts');
}

main()
  .catch((e) => {
    console.error('Error seeding demo data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
