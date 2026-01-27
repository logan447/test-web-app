import { PrismaClient, ProviderType, CareType, RequestType, ConsultRequestStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed (30 accounts)...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.takedownRequest.deleteMany();
  await prisma.message.deleteMany();
  await prisma.tourAppointment.deleteMany();
  await prisma.consultRequest.deleteMany();
  await prisma.savedProvider.deleteMany();
  await prisma.familyProfile.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Existing data cleared\n');

  // Create demo password hash (password: "demo123")
  const demoPassword = await hash('demo123', 12);

  // ============================================================================
  // FAMILY ACCOUNTS (12 total)
  // ============================================================================
  console.log('👨‍👩‍👧 Creating 12 family accounts with profiles...');

  // Family 1: Active AL search, 100% complete
  const family1 = await prisma.user.create({
    data: {
      email: 'family.assisted.active@demo.com',
      name: 'Sarah Johnson',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(619) 555-0101',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Margaret Johnson',
          ageRange: '80-85',
          gender: 'Female',
          careTypes: ['PERSONAL_CARE'],
          location: 'San Diego',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          budgetMin: 4000,
          budgetMax: 6000,
          medicalConditions: ['Arthritis', 'Hypertension'],
          profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          livingSituation: 'Living alone',
          relationship: 'Daughter',
          careLevel: 'moderate',
          mobilityStatus: 'walker',
          timeline: 'Within 3 months',
          description: 'Looking for a warm, friendly assisted living community for my mother.',
        },
      },
    },
  });

  // Family 2: Browsing AL, 70% complete
  const family2 = await prisma.user.create({
    data: {
      email: 'family.assisted.browsing@demo.com',
      name: 'Michael Roberts',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(213) 555-0102',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Robert Roberts Sr.',
          ageRange: '75-80',
          gender: 'Male',
          careTypes: ['COMPANION_CARE', 'PERSONAL_CARE'],
          location: 'Los Angeles',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          budgetMin: 3500,
          budgetMax: 5000,
          medicalConditions: ['Diabetes'],
          timeline: 'Within 6 months',
        },
      },
    },
  });

  // Family 3: Memory care early stage, 100% complete
  const family3 = await prisma.user.create({
    data: {
      email: 'family.memory.early@demo.com',
      name: 'David Chen',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(619) 555-0104',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Helen Chen',
          ageRange: '80-85',
          gender: 'Female',
          careTypes: ['MEMORY_CARE'],
          location: 'San Diego',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92130',
          budgetMin: 6000,
          budgetMax: 8000,
          medicalConditions: ['Early-stage Alzheimers', 'Hypertension'],
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          livingSituation: 'Living with family',
          relationship: 'Son',
          careLevel: 'intensive',
          mobilityStatus: 'independent',
          timeline: 'Within 1 month',
          description: 'Seeking specialized memory care for my mother with early-stage Alzheimers.',
        },
      },
    },
  });

  // Family 4: Memory care advanced, 100% complete
  const family4 = await prisma.user.create({
    data: {
      email: 'family.memory.advanced@demo.com',
      name: 'Lisa Thompson',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(714) 555-0105',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'James Thompson',
          ageRange: '85-90',
          gender: 'Male',
          careTypes: ['MEMORY_CARE', 'SKILLED_NURSING'],
          location: 'Orange County',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92602',
          budgetMin: 7000,
          budgetMax: 10000,
          medicalConditions: ['Advanced Dementia', 'Heart Disease'],
          profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
          livingSituation: 'In facility',
          relationship: 'Daughter',
          careLevel: 'intensive',
          mobilityStatus: 'wheelchair',
          timeline: 'Immediate',
          description: 'Need to transfer my father to a better memory care facility urgently.',
        },
      },
    },
  });

  // Family 5: In-home care fulltime, 100% complete
  const family5 = await prisma.user.create({
    data: {
      email: 'family.homecare.fulltime@demo.com',
      name: 'Emily Davis',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(619) 555-0107',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'George Davis',
          ageRange: '75-80',
          gender: 'Male',
          careTypes: ['LIVE_IN_CARE', 'COMPANION_CARE'],
          location: 'San Diego',
          city: 'La Jolla',
          state: 'CA',
          zipCode: '92037',
          budgetMin: 5000,
          budgetMax: 7000,
          medicalConditions: ['Parkinsons Disease'],
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          livingSituation: 'Living alone',
          relationship: 'Daughter',
          careLevel: 'moderate',
          mobilityStatus: 'assisted',
          timeline: 'Within 2 weeks',
          description: 'Looking for a live-in caregiver for my father with Parkinsons.',
        },
      },
    },
  });

  // Family 6: In-home care parttime, 90% complete
  const family6 = await prisma.user.create({
    data: {
      email: 'family.homecare.parttime@demo.com',
      name: 'James Anderson',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(213) 555-0108',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Dorothy Anderson',
          ageRange: '80-85',
          gender: 'Female',
          careTypes: ['COMPANION_CARE'],
          location: 'Los Angeles',
          city: 'Pasadena',
          state: 'CA',
          zipCode: '91101',
          budgetMin: 2000,
          budgetMax: 3500,
          medicalConditions: ['Arthritis'],
          timeline: 'Within 1 month',
        },
      },
    },
  });

  // Family 7: Nursing skilled, 100% complete
  const family7 = await prisma.user.create({
    data: {
      email: 'family.nursing.medical@demo.com',
      name: 'William Lee',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(619) 555-0110',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Alice Lee',
          ageRange: '85-90',
          gender: 'Female',
          careTypes: ['SKILLED_NURSING'],
          location: 'San Diego',
          city: 'Chula Vista',
          state: 'CA',
          zipCode: '91910',
          budgetMin: 6000,
          budgetMax: 9000,
          medicalConditions: ['Post-stroke', 'Diabetes'],
          profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          livingSituation: 'In hospital',
          relationship: 'Son',
          careLevel: 'intensive',
          mobilityStatus: 'bedridden',
          timeline: 'Immediate',
          description: 'Mother needs skilled nursing care after recent stroke.',
        },
      },
    },
  });

  // Family 8: Independent living, 80% complete
  const family8 = await prisma.user.create({
    data: {
      email: 'family.independent.living@demo.com',
      name: 'Linda Taylor',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(619) 555-0113',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Self',
          ageRange: '70-75',
          gender: 'Female',
          careTypes: ['COMPANION_CARE'],
          location: 'San Diego',
          city: 'Del Mar',
          state: 'CA',
          zipCode: '92014',
          budgetMin: 2500,
          budgetMax: 4000,
          timeline: 'Within 6 months',
          description: 'Looking for an active senior living community.',
        },
      },
    },
  });

  // Family 9: Low budget, 85% complete
  const family9 = await prisma.user.create({
    data: {
      email: 'family.low.budget@demo.com',
      name: 'Charles Miller',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(951) 555-0114',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Mary Miller',
          ageRange: '75-80',
          gender: 'Female',
          careTypes: ['PERSONAL_CARE'],
          location: 'Riverside',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
          budgetMin: 2000,
          budgetMax: 3000,
          medicalConditions: ['Arthritis'],
          timeline: 'Within 3 months',
        },
      },
    },
  });

  // Family 10: High-end luxury, 100% complete
  const family10 = await prisma.user.create({
    data: {
      email: 'family.high.end@demo.com',
      name: 'Elizabeth White',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(858) 555-0115',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Charles White',
          ageRange: '80-85',
          gender: 'Male',
          careTypes: ['PERSONAL_CARE', 'COMPANION_CARE'],
          location: 'San Diego',
          city: 'La Jolla',
          state: 'CA',
          zipCode: '92037',
          budgetMin: 8000,
          budgetMax: 12000,
          medicalConditions: ['Hypertension'],
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          livingSituation: 'Living with family',
          relationship: 'Daughter',
          careLevel: 'minimal',
          mobilityStatus: 'independent',
          timeline: 'Within 3 months',
          description: 'Seeking premium assisted living with resort-style amenities.',
        },
      },
    },
  });

  // Family 11: Respite care, 75% complete
  const family11 = await prisma.user.create({
    data: {
      email: 'family.respite@demo.com',
      name: 'Patricia Garcia',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(415) 555-0109',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Joseph Garcia',
          ageRange: '80-85',
          gender: 'Male',
          careTypes: ['RESPITE_CARE'],
          location: 'San Francisco',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94102',
          budgetMin: 3000,
          budgetMax: 4000,
          timeline: 'Within 2 weeks',
        },
      },
    },
  });

  // Family 12: New user, 40% complete
  const family12 = await prisma.user.create({
    data: {
      email: 'family.new.user@demo.com',
      name: 'Jennifer Martinez',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(415) 555-0103',
      activeMode: 'FAMILY',
      familyProfile: {
        create: {
          lovedOneName: 'Maria Martinez',
          careTypes: ['PERSONAL_CARE'],
          location: 'San Francisco',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
        },
      },
    },
  });

  console.log('✅ Created 12 family accounts with profiles\n');

  // ============================================================================
  // ORGANIZATION/FACILITY PROVIDER ACCOUNTS (12 total)
  // ============================================================================
  console.log('🏥 Creating 12 organization/facility accounts with profiles...');

  // Organization 1: Complete AL facility
  const org1 = await prisma.user.create({
    data: {
      email: 'facility.assisted.complete@demo.com',
      name: 'Sunshine Manor Admin',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-1001',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Sunshine Manor',
          providerType: 'ASSISTED_LIVING',
          description: 'Premier assisted living community in the heart of San Diego with 24/7 care and luxury amenities.',
          email: 'admin@sunshinemanor.com',
          phone: '(619) 555-1001',
          website: 'https://sunshinemanor.com',
          address: '123 Sunshine Ave',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          careTypesOffered: ['PERSONAL_CARE', 'COMPANION_CARE'],
          licensed: true,
          licenseNumber: 'CA-AL-12345',
          yearsInBusiness: 15,
          capacity: 50,
          priceMin: 4500,
          priceMax: 7000,
          photos: [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            'https://images.unsplash.com/photo-1581093458791-9f3c3250a740?w=800',
          ],
          coverPhoto: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200',
          roomFeatures: ['Private bathrooms', 'WiFi', 'Cable TV', 'Emergency call system'],
          commonAreas: ['Library', 'Garden', 'Movie theater', 'Fitness center'],
          medicalServices: ['24/7 nursing', 'Medication management', 'Physical therapy'],
          activitiesOffered: ['Arts and crafts', 'Music therapy', 'Exercise classes', 'Social events'],
          dietaryOptions: ['Vegetarian', 'Diabetic-friendly', 'Heart-healthy'],
          staffToResidentRatio: '1:6',
          languagesSpoken: ['English', 'Spanish'],
          averageRating: 4.8,
          reviewCount: 24,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 2: Incomplete AL facility (40% complete for widget testing)
  const org2 = await prisma.user.create({
    data: {
      email: 'facility.assisted.incomplete@demo.com',
      name: 'Parkside Living Director',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(213) 555-1002',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Parkside Living',
          providerType: 'ASSISTED_LIVING',
          description: 'Comfortable assisted living in Los Angeles.',
          email: 'director@parksideliving.com',
          phone: '(213) 555-1002',
          address: '456 Park St',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          careTypesOffered: ['PERSONAL_CARE'],
          // Missing: photos, pricing, amenities, licensing
        },
      },
    },
  });

  // Organization 3: Premium AL facility
  const org3 = await prisma.user.create({
    data: {
      email: 'facility.assisted.premium@demo.com',
      name: 'La Jolla Estates Admin',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(858) 555-1003',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'La Jolla Estates',
          providerType: 'ASSISTED_LIVING',
          description: 'Luxury oceanview assisted living with resort-style amenities and personalized care.',
          email: 'info@lajollaestates.com',
          phone: '(858) 555-1003',
          website: 'https://lajollaestates.com',
          address: '789 Ocean Blvd',
          city: 'La Jolla',
          state: 'CA',
          zipCode: '92037',
          careTypesOffered: ['PERSONAL_CARE', 'COMPANION_CARE'],
          licensed: true,
          licenseNumber: 'CA-AL-67890',
          yearsInBusiness: 10,
          capacity: 40,
          priceMin: 8000,
          priceMax: 12000,
          photos: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
            'https://images.unsplash.com/photo-1562141961-8d219c6dd062?w=800',
            'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
          ],
          coverPhoto: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200',
          roomFeatures: ['Ocean view', 'Private balcony', 'Full bathroom', 'Smart home tech'],
          commonAreas: ['Spa', 'Pool', 'Restaurant', 'Putting green', 'Theater'],
          medicalServices: ['24/7 RN', 'Physical therapy', 'Occupational therapy'],
          activitiesOffered: ['Golf', 'Yoga', 'Wine tasting', 'Concert series'],
          dietaryOptions: ['Gourmet dining', 'Chef-prepared meals', 'Custom menus'],
          staffToResidentRatio: '1:4',
          languagesSpoken: ['English', 'Spanish', 'French'],
          averageRating: 4.9,
          reviewCount: 18,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 4: Budget AL facility
  const org4 = await prisma.user.create({
    data: {
      email: 'facility.assisted.budget@demo.com',
      name: 'Riverside Senior Care',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(951) 555-1004',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Riverside Senior Care',
          providerType: 'ASSISTED_LIVING',
          description: 'Affordable assisted living with quality care in Riverside County.',
          email: 'info@riversideseniorcare.com',
          phone: '(951) 555-1004',
          address: '321 River Rd',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
          careTypesOffered: ['PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-AL-11111',
          yearsInBusiness: 8,
          capacity: 30,
          priceMin: 2500,
          priceMax: 3500,
          photos: [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
          ],
          roomFeatures: ['Private or shared rooms', 'Cable TV'],
          commonAreas: ['Garden', 'TV lounge'],
          medicalServices: ['Daily nursing visits', 'Medication management'],
          activitiesOffered: ['Bingo', 'Card games', 'Exercise classes'],
          staffToResidentRatio: '1:8',
          languagesSpoken: ['English', 'Spanish'],
          averageRating: 4.3,
          reviewCount: 12,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 5: Specialized memory care
  const org5 = await prisma.user.create({
    data: {
      email: 'facility.memory.specialized@demo.com',
      name: 'Memory Haven Director',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-1005',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Memory Haven',
          providerType: 'MEMORY_CARE',
          description: 'Specialized memory care facility with secure environment and dementia-trained staff.',
          email: 'info@memoryhaven.com',
          phone: '(619) 555-1005',
          website: 'https://memoryhaven.com',
          address: '555 Memory Lane',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92120',
          careTypesOffered: ['MEMORY_CARE', 'PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-MC-22222',
          yearsInBusiness: 12,
          capacity: 35,
          priceMin: 6500,
          priceMax: 9000,
          photos: [
            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
            'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
          ],
          coverPhoto: 'https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200',
          roomFeatures: ['Secure environment', 'Memory boxes', 'GPS tracking'],
          commonAreas: ['Wandering paths', 'Sensory garden', 'Music room'],
          medicalServices: ['24/7 memory care nurses', 'Behavioral support'],
          activitiesOffered: ['Memory activities', 'Music therapy', 'Pet therapy'],
          dietaryOptions: ['Finger foods', 'Adaptive dining'],
          staffToResidentRatio: '1:5',
          languagesSpoken: ['English', 'Spanish'],
          averageRating: 4.7,
          reviewCount: 16,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 6: Mixed AL + Memory
  const org6 = await prisma.user.create({
    data: {
      email: 'facility.memory.mixed@demo.com',
      name: 'Orange County Senior Living',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(714) 555-1006',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Orange County Senior Living',
          providerType: 'ASSISTED_LIVING',
          description: 'Full-service senior community with assisted living and memory care.',
          email: 'info@ocseniorliving.com',
          phone: '(714) 555-1006',
          address: '888 Senior Way',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92602',
          careTypesOffered: ['PERSONAL_CARE', 'MEMORY_CARE'],
          licensed: true,
          licenseNumber: 'CA-AL-33333',
          yearsInBusiness: 20,
          capacity: 80,
          priceMin: 5000,
          priceMax: 8500,
          photos: [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            'https://images.unsplash.com/photo-1581093458791-9f3c3250a740?w=800',
          ],
          roomFeatures: ['Private rooms', 'WiFi', 'Emergency call'],
          commonAreas: ['Library', 'Courtyard', 'Chapel', 'Salon'],
          medicalServices: ['24/7 nursing', 'Memory care unit'],
          activitiesOffered: ['Exercise', 'Art classes', 'Live entertainment'],
          staffToResidentRatio: '1:6',
          languagesSpoken: ['English', 'Spanish', 'Mandarin'],
          averageRating: 4.5,
          reviewCount: 22,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 7: Skilled nursing
  const org7 = await prisma.user.create({
    data: {
      email: 'facility.nursing.skilled@demo.com',
      name: 'San Diego Skilled Nursing',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-1008',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'San Diego Skilled Nursing Center',
          providerType: 'NURSING_HOME',
          description: 'Advanced skilled nursing and rehabilitation services.',
          email: 'info@sdskilled.com',
          phone: '(619) 555-1008',
          address: '999 Healthcare Dr',
          city: 'Chula Vista',
          state: 'CA',
          zipCode: '91910',
          careTypesOffered: ['SKILLED_NURSING'],
          licensed: true,
          licenseNumber: 'CA-SNF-44444',
          yearsInBusiness: 25,
          capacity: 60,
          priceMin: 7000,
          priceMax: 11000,
          photos: [
            'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
            'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
          ],
          roomFeatures: ['Hospital beds', 'Medical equipment', 'Call systems'],
          medicalServices: ['24/7 RN', 'Physical therapy', 'Wound care', 'IV therapy'],
          staffToResidentRatio: '1:4',
          languagesSpoken: ['English', 'Spanish', 'Tagalog'],
          averageRating: 4.6,
          reviewCount: 14,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 8: Home care agency
  const org8 = await prisma.user.create({
    data: {
      email: 'agency.homecare.large@demo.com',
      name: 'CareFirst Home Services',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-1010',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'CareFirst Home Services',
          providerType: 'HOME_CARE',
          description: 'Full-service home care agency with experienced caregivers throughout San Diego.',
          email: 'info@carefirsthome.com',
          phone: '(619) 555-1010',
          website: 'https://carefirsthome.com',
          address: '100 Care Plaza',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          serviceRadius: 30,
          careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING', 'LIVE_IN_CARE'],
          licensed: true,
          licenseNumber: 'CA-HCA-55555',
          yearsInBusiness: 18,
          priceMin: 25,
          priceMax: 45,
          priceDescription: 'Per hour rates. Live-in care available.',
          photos: [
            'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
            'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=800',
          ],
          medicalServices: ['Skilled nursing', 'Physical therapy', 'Medication management'],
          languagesSpoken: ['English', 'Spanish', 'Tagalog', 'Vietnamese'],
          averageRating: 4.8,
          reviewCount: 35,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: true,
        },
      },
    },
  });

  // Organization 9: Independent living
  const org9 = await prisma.user.create({
    data: {
      email: 'facility.independent.living@demo.com',
      name: 'Del Mar Active Living',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(858) 555-1012',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Del Mar Active Living',
          providerType: 'INDEPENDENT_LIVING',
          description: 'Active adult community for independent seniors 55+.',
          email: 'info@delmaractive.com',
          phone: '(858) 555-1012',
          address: '200 Active Way',
          city: 'Del Mar',
          state: 'CA',
          zipCode: '92014',
          careTypesOffered: ['COMPANION_CARE'],
          licensed: true,
          licenseNumber: 'CA-IL-66666',
          yearsInBusiness: 10,
          capacity: 100,
          priceMin: 2500,
          priceMax: 4500,
          photos: [
            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
          ],
          roomFeatures: ['Full kitchens', 'Washer/dryer', 'Patio or balcony'],
          commonAreas: ['Pool', 'Fitness center', 'Clubhouse', 'Tennis courts'],
          activitiesOffered: ['Social clubs', 'Day trips', 'Classes', 'Events'],
          staffToResidentRatio: '1:20',
          languagesSpoken: ['English'],
          averageRating: 4.7,
          reviewCount: 28,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 10: CCRC
  const org10 = await prisma.user.create({
    data: {
      email: 'facility.ccrc@demo.com',
      name: 'Encinitas Life Plan Community',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(760) 555-1014',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Encinitas Life Plan Community',
          providerType: 'INDEPENDENT_LIVING',
          description: 'Continuing care retirement community with full continuum of care.',
          email: 'info@encinitaslifeplan.com',
          phone: '(760) 555-1014',
          address: '300 Lifelong Ln',
          city: 'Encinitas',
          state: 'CA',
          zipCode: '92024',
          careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING', 'MEMORY_CARE'],
          licensed: true,
          licenseNumber: 'CA-CCRC-77777',
          yearsInBusiness: 30,
          capacity: 200,
          priceMin: 5000,
          priceMax: 15000,
          photos: [
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
            'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
          ],
          roomFeatures: ['Full apartments', 'Modern finishes', 'Smart home tech'],
          commonAreas: ['Resort pool', 'Spa', 'Restaurant', 'Theater', 'Library'],
          medicalServices: ['Health center', 'Memory care', 'Skilled nursing'],
          activitiesOffered: ['Golf', 'Tennis', 'Arts', 'Educational programs'],
          staffToResidentRatio: '1:5',
          languagesSpoken: ['English', 'Spanish'],
          averageRating: 4.9,
          reviewCount: 42,
          claimed: true,
          verified: true,
          active: true,
        },
      },
    },
  });

  // Organization 11: Facility hiring caregivers
  const org11 = await prisma.user.create({
    data: {
      email: 'facility.hiring.caregivers@demo.com',
      name: 'Hillcrest Assisted Living',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-1015',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Hillcrest Assisted Living',
          providerType: 'ASSISTED_LIVING',
          description: 'Growing assisted living facility seeking compassionate caregivers.',
          email: 'hr@hillcrestassisted.com',
          phone: '(619) 555-1015',
          address: '400 Hill St',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92103',
          careTypesOffered: ['PERSONAL_CARE', 'COMPANION_CARE'],
          licensed: true,
          licenseNumber: 'CA-AL-88888',
          yearsInBusiness: 5,
          capacity: 45,
          priceMin: 4000,
          priceMax: 6500,
          photos: [
            'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
            'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
            'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
            'https://images.unsplash.com/photo-1581093458791-9f3c3250a740?w=800',
          ],
          roomFeatures: ['Private rooms', 'WiFi', 'Cable TV'],
          commonAreas: ['Garden', 'Activity room', 'Dining room'],
          medicalServices: ['Daily nursing', 'Medication management'],
          staffToResidentRatio: '1:7',
          languagesSpoken: ['English', 'Spanish'],
          averageRating: 4.4,
          reviewCount: 10,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: true,
        },
      },
    },
  });

  // Organization 12: Specialized home care
  const org12 = await prisma.user.create({
    data: {
      email: 'agency.homecare.specialized@demo.com',
      name: 'Specialized Care Partners',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(213) 555-1011',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Specialized Care Partners',
          providerType: 'HOME_CARE',
          description: 'Specialized in-home care for dementia, Parkinsons, and post-stroke care.',
          email: 'info@specializedcarepartners.com',
          phone: '(213) 555-1011',
          address: '500 Specialized Dr',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          serviceRadius: 25,
          careTypesOffered: ['PERSONAL_CARE', 'MEMORY_CARE', 'SKILLED_NURSING'],
          licensed: true,
          licenseNumber: 'CA-HCA-99999',
          yearsInBusiness: 12,
          priceMin: 30,
          priceMax: 50,
          priceDescription: 'Per hour rates for specialized care.',
          photos: [
            'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
            'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
            'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=800',
          ],
          medicalServices: ['Dementia care', 'Parkinsons care', 'Stroke recovery'],
          languagesSpoken: ['English', 'Spanish', 'Mandarin'],
          averageRating: 4.9,
          reviewCount: 19,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: true,
        },
      },
    },
  });

  console.log('✅ Created 12 organization/facility accounts with profiles\n');

  // ============================================================================
  // INDIVIDUAL CAREGIVER PROVIDER ACCOUNTS (6 total)
  // ============================================================================
  console.log('👨‍⚕️ Creating 6 individual caregiver accounts with profiles...');

  // Caregiver 1: Experienced fulltime (seeking families), 100% complete
  const caregiver1 = await prisma.user.create({
    data: {
      email: 'caregiver.experienced.fulltime@demo.com',
      name: 'Maria Santos',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-2001',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Maria Santos - Experienced Caregiver',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: '10+ years of experience providing compassionate in-home care. Specialized in dementia care and companionship.',
          email: 'maria.santos@email.com',
          phone: '(619) 555-2001',
          address: 'San Diego County',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          serviceRadius: 20,
          careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE', 'MEMORY_CARE', 'LIVE_IN_CARE'],
          licensed: true,
          licenseNumber: 'CA-CNA-11111',
          yearsInBusiness: 10,
          priceMin: 25,
          priceMax: 35,
          priceDescription: 'Per hour. Live-in care negotiable.',
          photos: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400'],
          certifications: ['CNA', 'CPR', 'First Aid', 'Dementia Care Specialist'],
          languagesSpoken: ['English', 'Spanish', 'Tagalog'],
          backgroundChecked: true,
          averageRating: 4.9,
          reviewCount: 15,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: false,
        },
      },
    },
  });

  // Caregiver 2: Dementia specialist (seeking families), 95% complete
  const caregiver2 = await prisma.user.create({
    data: {
      email: 'caregiver.specialized.dementia@demo.com',
      name: 'John Peterson',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(213) 555-2002',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'John Peterson - Dementia Care Specialist',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: 'Certified dementia care specialist with 8 years experience. Patient, calm approach to memory care.',
          email: 'john.peterson@email.com',
          phone: '(213) 555-2002',
          address: 'Los Angeles County',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          serviceRadius: 15,
          careTypesOffered: ['MEMORY_CARE', 'COMPANION_CARE', 'PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-CNA-22222',
          yearsInBusiness: 8,
          priceMin: 28,
          priceMax: 38,
          photos: ['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400'],
          certifications: ['CNA', 'Dementia Care Specialist', 'Alzheimers Care Training'],
          languagesSpoken: ['English'],
          backgroundChecked: true,
          averageRating: 4.8,
          reviewCount: 12,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: false,
        },
      },
    },
  });

  // Caregiver 3: Medical skilled (seeking families), 100% complete
  const caregiver3 = await prisma.user.create({
    data: {
      email: 'caregiver.medical.skilled@demo.com',
      name: 'Rachel Thompson RN',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-2004',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Rachel Thompson RN - Skilled Nursing Care',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: 'Registered Nurse providing skilled in-home nursing care. Post-surgical care, wound care, medication management.',
          email: 'rachel.thompson@email.com',
          phone: '(619) 555-2004',
          address: 'San Diego County',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          serviceRadius: 25,
          careTypesOffered: ['SKILLED_NURSING', 'PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-RN-33333',
          yearsInBusiness: 15,
          priceMin: 45,
          priceMax: 65,
          priceDescription: 'Per hour for skilled nursing services.',
          photos: ['https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400'],
          certifications: ['RN', 'IV Certification', 'Wound Care Specialist', 'CPR'],
          languagesSpoken: ['English', 'Spanish'],
          backgroundChecked: true,
          averageRating: 5.0,
          reviewCount: 8,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: false,
        },
      },
    },
  });

  // Caregiver 4: Seeking facility employment (fulltime), 90% complete
  const caregiver4 = await prisma.user.create({
    data: {
      email: 'caregiver.seeking.facility.fulltime@demo.com',
      name: 'Angela Brooks',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(619) 555-2007',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Angela Brooks - Caregiver',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: 'Experienced caregiver seeking full-time employment at assisted living facility. 5 years experience.',
          email: 'angela.brooks@email.com',
          phone: '(619) 555-2007',
          address: 'San Diego County',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92101',
          serviceRadius: 20,
          careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-CNA-44444',
          yearsInBusiness: 5,
          photos: ['https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400'],
          certifications: ['CNA', 'CPR', 'First Aid'],
          languagesSpoken: ['English'],
          backgroundChecked: true,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: false,
          availableForOrganizations: true,
        },
      },
    },
  });

  // Caregiver 5: Seeking facility employment (memory specialist), 95% complete
  const caregiver5 = await prisma.user.create({
    data: {
      email: 'caregiver.seeking.memory.specialist@demo.com',
      name: 'Nancy Foster',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(714) 555-2009',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Nancy Foster - Memory Care Specialist',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: 'Memory care specialist seeking position at memory care facility. 7 years experience with dementia patients.',
          email: 'nancy.foster@email.com',
          phone: '(714) 555-2009',
          address: 'Orange County',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92602',
          serviceRadius: 15,
          careTypesOffered: ['MEMORY_CARE', 'PERSONAL_CARE'],
          licensed: true,
          licenseNumber: 'CA-CNA-55555',
          yearsInBusiness: 7,
          photos: ['https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400'],
          certifications: ['CNA', 'Dementia Care Specialist', 'Memory Care Training'],
          languagesSpoken: ['English', 'Spanish'],
          backgroundChecked: true,
          averageRating: 4.7,
          reviewCount: 5,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: false,
          availableForOrganizations: true,
        },
      },
    },
  });

  // Caregiver 6: Part-time companion (seeking families), 85% complete
  const caregiver6 = await prisma.user.create({
    data: {
      email: 'caregiver.parttime.companion@demo.com',
      name: 'Susan Williams',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(714) 555-2003',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Susan Williams - Companion Caregiver',
          providerType: 'INDEPENDENT_CAREGIVER',
          description: 'Part-time companion caregiver. Great for light housekeeping, meal prep, and companionship.',
          email: 'susan.williams@email.com',
          phone: '(714) 555-2003',
          address: 'Orange County',
          city: 'Anaheim',
          state: 'CA',
          zipCode: '92801',
          serviceRadius: 10,
          careTypesOffered: ['COMPANION_CARE'],
          yearsInBusiness: 3,
          priceMin: 20,
          priceMax: 28,
          photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400'],
          certifications: ['CPR', 'First Aid'],
          languagesSpoken: ['English'],
          backgroundChecked: true,
          claimed: true,
          verified: true,
          active: true,
          availableForFamilies: true,
          availableForOrganizations: false,
        },
      },
    },
  });

  console.log('✅ Created 6 individual caregiver accounts with profiles\n');

  // ============================================================================
  // ENGAGEMENT DATA
  // ============================================================================
  console.log('💬 Creating engagement data (consultation requests, messages, tours)...\n');

  // Get all provider and family profile IDs
  const familyProfiles = await prisma.familyProfile.findMany({
    select: { id: true, userId: true },
  });
  const providers = await prisma.provider.findMany({
    select: { id: true, userId: true },
  });

  // Scenario 1: Family → Organization (Consultation Requests)
  // Family 1 contacts Org 1 (Sunshine Manor) - Active conversation
  const request1 = await prisma.consultRequest.create({
    data: {
      senderId: family1.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family1.id)!.id,
      providerId: providers.find(p => p.userId === org1.id)!.id,
      requestType: 'CONSULTATION',
      message: 'Hi, I am interested in learning more about Sunshine Manor for my mother. She needs assistance with daily activities and would thrive in a social environment.',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-05T10:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request1.id,
        senderId: org1.id,
        content: 'Thank you for your interest! We would love to tell you more about Sunshine Manor. When would be a good time for a tour?',
        createdAt: new Date('2026-01-05T11:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-05T11:30:00Z'),
      },
      {
        consultRequestId: request1.id,
        senderId: family1.id,
        content: 'I would love to visit this week. Are you available Thursday afternoon?',
        createdAt: new Date('2026-01-05T12:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-05T12:15:00Z'),
      },
      {
        consultRequestId: request1.id,
        senderId: org1.id,
        content: 'Thursday at 2pm works perfectly! I will send you the address and parking information.',
        createdAt: new Date('2026-01-05T12:30:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-05T12:45:00Z'),
      },
    ],
  });

  await prisma.tourAppointment.create({
    data: {
      requestId: request1.id,
      proposedBy: org1.id,
      proposedDate: new Date('2026-01-09T14:00:00Z'),
      proposedTime: '2:00 PM',
      status: 'ACCEPTED',
      notes: 'Looking forward to showing you around!',
    },
  });

  // Family 3 contacts Org 5 (Memory Haven) - Pending request
  const request2 = await prisma.consultRequest.create({
    data: {
      senderId: family3.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family3.id)!.id,
      providerId: providers.find(p => p.userId === org5.id)!.id,
      requestType: 'CONSULTATION',
      message: 'My mother has early-stage Alzheimers and I am looking for a specialized memory care facility. Can you tell me about your memory care programs?',
      status: 'PENDING',
      createdAt: new Date('2026-01-08T09:00:00Z'),
    },
  });

  // Family 4 contacts Org 6 (OC Senior Living) - Active conversation
  const request3 = await prisma.consultRequest.create({
    data: {
      senderId: family4.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family4.id)!.id,
      providerId: providers.find(p => p.userId === org6.id)!.id,
      requestType: 'CONSULTATION',
      message: 'I need to transfer my father to a memory care facility immediately. He has advanced dementia. Do you have availability?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-06T14:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request3.id,
        senderId: org6.id,
        content: 'We do have availability in our secure memory care unit. I would like to discuss your fathers needs. Can we schedule a call today?',
        createdAt: new Date('2026-01-06T15:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-06T15:30:00Z'),
      },
      {
        consultRequestId: request3.id,
        senderId: family4.id,
        content: 'Yes, please call me at (714) 555-0105 this afternoon.',
        createdAt: new Date('2026-01-06T16:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-06T16:15:00Z'),
      },
    ],
  });

  // Family 7 contacts Org 7 (Skilled Nursing) - Completed
  const request4 = await prisma.consultRequest.create({
    data: {
      senderId: family7.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family7.id)!.id,
      providerId: providers.find(p => p.userId === org7.id)!.id,
      requestType: 'CONSULTATION',
      message: 'My mother needs skilled nursing care after a stroke. Do you accept Medicare?',
      status: 'COMPLETED',
      createdAt: new Date('2026-01-03T10:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request4.id,
        senderId: org7.id,
        content: 'Yes, we accept Medicare. I would be happy to discuss your mothers care needs.',
        createdAt: new Date('2026-01-03T11:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-03T11:30:00Z'),
      },
    ],
  });

  // Scenario 2: Family → Individual Caregiver (Hiring Requests)
  // Family 5 contacts Caregiver 1 (Maria Santos) - Active hiring conversation
  const request5 = await prisma.consultRequest.create({
    data: {
      senderId: family5.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family5.id)!.id,
      providerId: providers.find(p => p.userId === caregiver1.id)!.id,
      requestType: 'HIRING',
      message: 'Hi Maria, I am looking for a live-in caregiver for my father who has Parkinsons. I see you have experience with dementia care. Are you available for live-in work?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-07T09:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request5.id,
        senderId: caregiver1.id,
        content: 'Hello! Yes, I am available for live-in positions. I have experience with Parkinsons patients as well. When would you like to schedule an interview?',
        createdAt: new Date('2026-01-07T10:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-07T10:30:00Z'),
      },
      {
        consultRequestId: request5.id,
        senderId: family5.id,
        content: 'Great! How about tomorrow at 3pm? We can meet at my fathers home.',
        createdAt: new Date('2026-01-07T11:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-07T11:15:00Z'),
      },
    ],
  });

  // Family 6 contacts Caregiver 6 (Susan Williams) - Part-time companion
  const request6 = await prisma.consultRequest.create({
    data: {
      senderId: family6.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family6.id)!.id,
      providerId: providers.find(p => p.userId === caregiver6.id)!.id,
      requestType: 'HIRING',
      message: 'I need someone to visit my mother 3 times a week for companionship and light housekeeping. Are you available?',
      status: 'PENDING',
      createdAt: new Date('2026-01-08T14:00:00Z'),
    },
  });

  // Family 7 contacts Caregiver 3 (Rachel Thompson RN) - Skilled nursing
  const request7 = await prisma.consultRequest.create({
    data: {
      senderId: family7.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family7.id)!.id,
      providerId: providers.find(p => p.userId === caregiver3.id)!.id,
      requestType: 'HIRING',
      message: 'My mother needs post-stroke care including wound care and medication management. What is your availability?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-06T10:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request7.id,
        senderId: caregiver3.id,
        content: 'I specialize in post-stroke care and wound management. I have availability starting next week. Would you like to discuss the care plan?',
        createdAt: new Date('2026-01-06T11:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-06T11:30:00Z'),
      },
    ],
  });

  // Scenario 3: Organization → Individual Caregiver (Job Applications)
  // Org 11 (Hillcrest AL) contacts Caregiver 4 (Angela Brooks) - Job offer
  const request8 = await prisma.consultRequest.create({
    data: {
      senderId: org11.id,
      familyProfileId: familyProfiles[0].id, // Using dummy family profile (required by schema)
      providerId: providers.find(p => p.userId === caregiver4.id)!.id,
      requestType: 'HIRING',
      message: 'Hi Angela, we reviewed your profile and would like to interview you for a full-time caregiver position at Hillcrest Assisted Living. Are you interested?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-07T15:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request8.id,
        senderId: caregiver4.id,
        content: 'Yes, I am very interested! I would love to learn more about the position. When can we schedule an interview?',
        createdAt: new Date('2026-01-07T16:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-07T16:30:00Z'),
      },
      {
        consultRequestId: request8.id,
        senderId: org11.id,
        content: 'How about this Friday at 10am? Please bring your certifications.',
        createdAt: new Date('2026-01-07T17:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-07T17:15:00Z'),
      },
    ],
  });

  // Org 5 (Memory Haven) contacts Caregiver 5 (Nancy Foster) - Memory care specialist job
  const request9 = await prisma.consultRequest.create({
    data: {
      senderId: org5.id,
      familyProfileId: familyProfiles[0].id, // Using dummy family profile
      providerId: providers.find(p => p.userId === caregiver5.id)!.id,
      requestType: 'HIRING',
      message: 'We are looking for a memory care specialist to join our team at Memory Haven. Your experience is exactly what we need. Can we schedule an interview?',
      status: 'PENDING',
      createdAt: new Date('2026-01-08T10:00:00Z'),
    },
  });

  // Additional engagement: SavedProvider relationships
  await prisma.savedProvider.createMany({
    data: [
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family1.id)!.id,
        providerId: providers.find(p => p.userId === org1.id)!.id,
        notes: 'Love the amenities and staff',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family1.id)!.id,
        providerId: providers.find(p => p.userId === org3.id)!.id,
        notes: 'Premium option if budget allows',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family3.id)!.id,
        providerId: providers.find(p => p.userId === org5.id)!.id,
        notes: 'Specialized memory care',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family4.id)!.id,
        providerId: providers.find(p => p.userId === org5.id)!.id,
        notes: 'Excellent dementia care program',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family4.id)!.id,
        providerId: providers.find(p => p.userId === org6.id)!.id,
        notes: 'Currently touring',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family5.id)!.id,
        providerId: providers.find(p => p.userId === caregiver1.id)!.id,
        notes: 'Interviewing for live-in position',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family7.id)!.id,
        providerId: providers.find(p => p.userId === org7.id)!.id,
        notes: 'Accepted placement',
      },
      {
        familyProfileId: familyProfiles.find(fp => fp.userId === family10.id)!.id,
        providerId: providers.find(p => p.userId === org3.id)!.id,
        notes: 'Luxury option',
      },
    ],
  });

  console.log('✅ Created engagement data:\n');
  console.log('   - 9 consultation/hiring requests');
  console.log('   - 12 messages across conversations');
  console.log('   - 1 scheduled tour');
  console.log('   - 8 saved providers\n');

  // ============================================================================
  // ADDITIONAL ENGAGEMENT STATES (DECLINED, CANCELLED)
  // ============================================================================
  console.log('🚫 Creating declined/cancelled engagement scenarios...');

  // Family 2 contacts Org 4 (Budget AL) - DECLINED
  const request10 = await prisma.consultRequest.create({
    data: {
      senderId: family2.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family2.id)!.id,
      providerId: providers.find(p => p.userId === org4.id)!.id,
      requestType: 'CONSULTATION',
      message: 'Looking for budget-friendly assisted living for my father.',
      status: 'DECLINED',
      createdAt: new Date('2026-01-04T09:00:00Z'),
    },
  });

  // Family 8 contacts Org 9 (Independent Living) - CANCELLED by family
  const request11 = await prisma.consultRequest.create({
    data: {
      senderId: family8.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family8.id)!.id,
      providerId: providers.find(p => p.userId === org9.id)!.id,
      requestType: 'CONSULTATION',
      message: 'Interested in your independent living community.',
      status: 'CANCELLED',
      createdAt: new Date('2026-01-02T11:00:00Z'),
    },
  });

  // Family 9 contacts Caregiver 6 - DECLINED by caregiver
  const request12 = await prisma.consultRequest.create({
    data: {
      senderId: family9.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family9.id)!.id,
      providerId: providers.find(p => p.userId === caregiver6.id)!.id,
      requestType: 'HIRING',
      message: 'Need part-time companion care for my mother.',
      status: 'DECLINED',
      createdAt: new Date('2026-01-05T14:00:00Z'),
    },
  });

  console.log('✅ Created 3 declined/cancelled engagement scenarios\n');

  // ============================================================================
  // REVIEWS (Family reviews of providers)
  // ============================================================================
  console.log('⭐ Creating review data...');

  const reviewsData = [
    // Reviews for Sunshine Manor (org1) — mix of Olera native + Google imported
    { providerId: providers.find(p => p.userId === org1.id)!.id, userId: family1.id, rating: 5, title: 'Exceptional care for my mother', content: 'Sunshine Manor has been wonderful for my mother. The staff is attentive, caring, and treats her like family. The facilities are clean and modern, and the activities keep her engaged and happy.', relationship: 'Daughter of resident', lengthOfStay: '6 months', source: 'olera' },
    { providerId: providers.find(p => p.userId === org1.id)!.id, userId: family2.id, rating: 4, title: 'Great community atmosphere', content: 'We chose Sunshine Manor after visiting several facilities. The community atmosphere stood out - residents genuinely seem happy here. Only minor issue is parking can be limited during busy visiting hours.', relationship: 'Son looking for care', source: 'google' },
    { providerId: providers.find(p => p.userId === org1.id)!.id, userId: family8.id, rating: 5, title: 'Peace of mind knowing mom is safe', content: 'After years of worrying about my mom living alone, Sunshine Manor gave us peace of mind. The 24/7 care, emergency response system, and regular updates from staff are invaluable.', relationship: 'Daughter of resident', lengthOfStay: '1 year', source: 'olera' },

    // Reviews for La Jolla Estates (org3)
    { providerId: providers.find(p => p.userId === org3.id)!.id, userId: family10.id, rating: 5, title: 'Worth every penny', content: 'Yes, La Jolla Estates is premium-priced, but the quality is unmatched. Ocean views, gourmet dining, spa services - my father feels like he is at a five-star resort while receiving excellent care.', relationship: 'Daughter of resident', lengthOfStay: '8 months', source: 'google' },
    { providerId: providers.find(p => p.userId === org3.id)!.id, userId: family1.id, rating: 5, title: 'Luxury and care combined', content: 'If you can afford it, La Jolla Estates is the best choice. The staff-to-resident ratio is excellent, and the amenities are top-notch. My parents have never been happier.', relationship: 'Daughter of residents', lengthOfStay: '4 months', source: 'olera' },

    // Reviews for Memory Haven (org5)
    { providerId: providers.find(p => p.userId === org5.id)!.id, userId: family3.id, rating: 5, title: 'Specialized care that makes a difference', content: 'Memory Haven truly understands dementia care. The secured environment gives us peace of mind, and the specialized activities help keep my mother engaged. The staff is trained specifically for memory care.', relationship: 'Son of resident', lengthOfStay: '3 months', source: 'olera' },
    { providerId: providers.find(p => p.userId === org5.id)!.id, userId: family4.id, rating: 4, title: 'Good memory care facility', content: 'Very professional staff with good dementia training. The wandering paths and sensory garden are great features. Would give 5 stars but wish visiting hours were more flexible.', relationship: 'Daughter of resident', lengthOfStay: '2 months', source: 'google' },

    // Reviews for San Diego Skilled Nursing (org7)
    { providerId: providers.find(p => p.userId === org7.id)!.id, userId: family7.id, rating: 5, title: 'Excellent skilled nursing care', content: 'After my mother\'s stroke, San Diego Skilled Nursing provided exceptional rehabilitation care. The physical therapists are skilled and the nursing staff is available 24/7. Highly recommend.', relationship: 'Son of patient', lengthOfStay: '2 months', source: 'google' },

    // Reviews for CareFirst Home Services (org8)
    { providerId: providers.find(p => p.userId === org8.id)!.id, userId: family5.id, rating: 5, title: 'Reliable home care agency', content: 'CareFirst has been providing in-home care for my father for 6 months. They matched us with a wonderful caregiver who understands Parkinsons. Very professional agency.', relationship: 'Daughter', source: 'olera' },
    { providerId: providers.find(p => p.userId === org8.id)!.id, userId: family6.id, rating: 4, title: 'Good caregivers, responsive agency', content: 'We use CareFirst for part-time companion care. The caregivers have been reliable and kind. Communication with the agency is good. Pricing is competitive.', relationship: 'Nephew', source: 'google' },

    // Reviews for individual caregivers
    { providerId: providers.find(p => p.userId === caregiver1.id)!.id, userId: family5.id, rating: 5, title: 'Maria is amazing!', content: 'Maria Santos has been caring for my father with Parkinsons for 3 months. She is patient, skilled, and treats him with such kindness. She has become part of our family.', relationship: 'Daughter', source: 'olera' },
    { providerId: providers.find(p => p.userId === caregiver3.id)!.id, userId: family7.id, rating: 5, title: 'Outstanding nursing skills', content: 'Rachel is an exceptional RN. Her wound care expertise helped my mother heal faster. She is professional, knowledgeable, and genuinely cares about her patients.', relationship: 'Son', source: 'olera' },
  ];

  for (const review of reviewsData) {
    await prisma.review.create({
      data: {
        ...review,
        helpfulCount: Math.floor(Math.random() * 15),
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Created 12 reviews across providers\n');

  // ============================================================================
  // UNCLAIMED PROVIDERS (for SEO/Claim testing)
  // ============================================================================
  console.log('📋 Creating unclaimed provider listings...');

  // Unclaimed provider 1 - AL facility (from public data)
  const unclaimedOrg1 = await prisma.user.create({
    data: {
      email: 'unclaimed-al-1@placeholder.olera.com',
      name: 'Unclaimed Provider',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Oceanview Senior Living',
          providerType: 'ASSISTED_LIVING',
          description: 'Assisted living community with ocean views.',
          phone: '(760) 555-9001',
          address: '100 Ocean Dr',
          city: 'Oceanside',
          state: 'CA',
          zipCode: '92054',
          careTypesOffered: ['PERSONAL_CARE', 'COMPANION_CARE'],
          priceMin: 4000,
          priceMax: 6000,
          photos: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'],
          claimed: false, // UNCLAIMED
          verified: false,
          active: true,
          averageRating: 4.2,
          reviewCount: 8,
        },
      },
    },
  });

  // Unclaimed provider 2 - Home care agency
  const unclaimedOrg2 = await prisma.user.create({
    data: {
      email: 'unclaimed-hc-1@placeholder.olera.com',
      name: 'Unclaimed Provider',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Comfort Home Care Services',
          providerType: 'HOME_CARE',
          description: 'In-home care services for seniors.',
          phone: '(619) 555-9002',
          address: '200 Care Blvd',
          city: 'San Diego',
          state: 'CA',
          zipCode: '92105',
          serviceRadius: 20,
          careTypesOffered: ['COMPANION_CARE', 'PERSONAL_CARE'],
          priceMin: 22,
          priceMax: 35,
          claimed: false, // UNCLAIMED
          verified: false,
          active: true,
        },
      },
    },
  });

  // Unclaimed provider 3 - Memory care
  const unclaimedOrg3 = await prisma.user.create({
    data: {
      email: 'unclaimed-mc-1@placeholder.olera.com',
      name: 'Unclaimed Provider',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      activeMode: 'PROVIDER',
      provider: {
        create: {
          name: 'Serenity Memory Care',
          providerType: 'MEMORY_CARE',
          description: 'Specialized memory care for Alzheimers and dementia.',
          phone: '(858) 555-9003',
          address: '300 Memory Way',
          city: 'La Mesa',
          state: 'CA',
          zipCode: '91942',
          careTypesOffered: ['MEMORY_CARE'],
          priceMin: 5500,
          priceMax: 7500,
          photos: ['https://images.unsplash.com/photo-1584515933487-779824d29309?w=800'],
          claimed: false, // UNCLAIMED
          verified: false,
          active: true,
          averageRating: 4.5,
          reviewCount: 5,
        },
      },
    },
  });

  console.log('✅ Created 3 unclaimed provider listings\n');

  // ============================================================================
  // TAKEDOWN REQUESTS
  // ============================================================================
  console.log('🗑️  Creating takedown request scenarios...');

  const unclaimedProviders = await prisma.provider.findMany({
    where: { claimed: false },
    select: { id: true },
  });

  if (unclaimedProviders.length >= 2) {
    // Pending takedown request
    await prisma.takedownRequest.create({
      data: {
        providerId: unclaimedProviders[0].id,
        reason: 'NOT_MY_BUSINESS',
        details: 'This listing does not represent our business. We are not affiliated with this provider.',
        contactName: 'John Smith',
        contactEmail: 'john.smith@example.com',
        contactPhone: '(619) 555-0000',
        status: 'PENDING',
      },
    });

    // Approved takedown request
    await prisma.takedownRequest.create({
      data: {
        providerId: unclaimedProviders[1].id,
        reason: 'BUSINESS_CLOSED',
        details: 'This business permanently closed in 2024.',
        contactName: 'Jane Doe',
        contactEmail: 'jane.doe@example.com',
        status: 'APPROVED',
        reviewedAt: new Date('2026-01-10T10:00:00Z'),
        reviewNotes: 'Verified closure through business records.',
      },
    });
  }

  console.log('✅ Created 2 takedown request scenarios\n');

  // ============================================================================
  // SUBSCRIPTION STATES (for paywall testing)
  // ============================================================================
  console.log('💳 Creating subscription data for paywall testing...');

  // PRO subscription for org1 (Sunshine Manor)
  await prisma.subscription.create({
    data: {
      userId: org1.id,
      tier: 'PRO',
      status: 'ACTIVE',
      contactViewsUsed: 15,
      contactViewsLimit: null, // Unlimited for PRO
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // PRO subscription for org3 (La Jolla Estates)
  await prisma.subscription.create({
    data: {
      userId: org3.id,
      tier: 'PRO',
      status: 'ACTIVE',
      contactViewsUsed: 8,
      contactViewsLimit: null,
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // FREE tier for org2 (Parkside Living) - hitting limits
  await prisma.subscription.create({
    data: {
      userId: org2.id,
      tier: 'FREE',
      status: 'ACTIVE',
      contactViewsUsed: 3,
      contactViewsLimit: 3, // At limit, will trigger paywall
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // FREE tier for org4 (Riverside Senior Care) - under limit
  await prisma.subscription.create({
    data: {
      userId: org4.id,
      tier: 'FREE',
      status: 'ACTIVE',
      contactViewsUsed: 1,
      contactViewsLimit: 3,
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // PRO subscription for caregiver1 (Maria Santos)
  await prisma.subscription.create({
    data: {
      userId: caregiver1.id,
      tier: 'PRO',
      status: 'ACTIVE',
      contactViewsUsed: 5,
      contactViewsLimit: null,
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // FREE tier for caregiver4 (Angela Brooks) - at limit
  await prisma.subscription.create({
    data: {
      userId: caregiver4.id,
      tier: 'FREE',
      status: 'ACTIVE',
      contactViewsUsed: 3,
      contactViewsLimit: 3,
      currentPeriodStart: new Date('2026-01-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-02-01T00:00:00Z'),
    },
  });

  // Expired PRO subscription for org11 (Hillcrest AL)
  await prisma.subscription.create({
    data: {
      userId: org11.id,
      tier: 'PRO',
      status: 'EXPIRED',
      contactViewsUsed: 20,
      contactViewsLimit: 3, // Reverted to FREE limits
      currentPeriodStart: new Date('2025-12-01T00:00:00Z'),
      currentPeriodEnd: new Date('2026-01-01T00:00:00Z'),
    },
  });

  console.log('✅ Created 7 subscription records for paywall testing\n');

  // ============================================================================
  // NOTIFICATIONS (comprehensive for notification bell testing)
  // ============================================================================
  console.log('🔔 Creating comprehensive notification data...');

  const now = new Date();
  const notificationData = [
    // === TODAY - Family notifications ===
    { userId: family1.id, type: 'MESSAGE', title: 'New message', body: 'Sunshine Manor replied to your inquiry', linkHref: '/requests', read: false, createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000) }, // 1 hour ago
    { userId: family1.id, type: 'REQUEST_ACCEPTED', title: 'Request accepted!', body: 'Sunshine Manor accepted your consultation request', linkHref: '/requests', read: false, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) }, // 2 hours ago
    { userId: family1.id, type: 'TOUR_PROPOSED', title: 'Tour proposed', body: 'Sunshine Manor proposed a tour for Thursday at 2pm', linkHref: '/requests', read: true, createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000) }, // 4 hours ago
    { userId: family3.id, type: 'REQUEST_ACCEPTED', title: 'Request accepted!', body: 'Memory Haven is ready to connect', linkHref: '/requests', read: false, createdAt: new Date(now.getTime() - 30 * 60 * 1000) }, // 30 min ago
    { userId: family5.id, type: 'MESSAGE', title: 'New message', body: 'Maria Santos sent you a message', linkHref: '/requests', read: false, createdAt: new Date(now.getTime() - 15 * 60 * 1000) }, // 15 min ago

    // === YESTERDAY - More family notifications ===
    { userId: family1.id, type: 'TOUR_ACCEPTED', title: 'Tour confirmed!', body: 'Your tour with Sunshine Manor is confirmed for Thursday at 2pm', linkHref: '/requests', read: true, createdAt: new Date(now.getTime() - 28 * 60 * 60 * 1000) }, // Yesterday
    { userId: family4.id, type: 'MESSAGE', title: 'New message', body: 'Orange County Senior Living sent you a message', linkHref: '/requests', read: true, createdAt: new Date(now.getTime() - 30 * 60 * 60 * 1000) },
    { userId: family7.id, type: 'REQUEST_COMPLETED', title: 'Engagement completed', body: 'Your engagement with San Diego Skilled Nursing has been marked complete', linkHref: '/requests', read: true, createdAt: new Date(now.getTime() - 26 * 60 * 60 * 1000) },

    // === THIS WEEK - Provider notifications ===
    { userId: org1.id, type: 'REQUEST_NEW', title: 'New inquiry', body: 'Sarah Johnson is interested in your services', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000) }, // 3 hours ago
    { userId: org1.id, type: 'MESSAGE', title: 'New message', body: 'You have a message from a family', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 5 * 60 * 60 * 1000) },
    { userId: org5.id, type: 'REQUEST_NEW', title: 'Memory care inquiry', body: 'Family seeking memory care services', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 48 * 60 * 60 * 1000) }, // 2 days ago
    { userId: org3.id, type: 'REQUEST_NEW', title: 'New inquiry', body: 'A family is interested in premium assisted living', linkHref: '/provider/requests', read: true, createdAt: new Date(now.getTime() - 72 * 60 * 60 * 1000) }, // 3 days ago
    { userId: org6.id, type: 'MESSAGE', title: 'New message', body: 'Lisa Thompson sent you a message about memory care', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000) },

    // === Caregiver notifications ===
    { userId: caregiver1.id, type: 'REQUEST_NEW', title: 'Job inquiry', body: 'Emily Davis is interested in hiring you', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000) },
    { userId: caregiver1.id, type: 'MESSAGE', title: 'New message', body: 'You have a new message about a live-in position', linkHref: '/provider/requests', read: true, createdAt: new Date(now.getTime() - 50 * 60 * 60 * 1000) },
    { userId: caregiver4.id, type: 'REQUEST_NEW', title: 'Job opportunity', body: 'Hillcrest Assisted Living wants to interview you', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000) },
    { userId: caregiver5.id, type: 'REQUEST_NEW', title: 'Memory care position', body: 'Memory Haven is interested in your profile', linkHref: '/provider/requests', read: false, createdAt: new Date(now.getTime() - 20 * 60 * 60 * 1000) },
    { userId: caregiver3.id, type: 'MESSAGE', title: 'New message', body: 'William Lee sent you a message about skilled nursing care', linkHref: '/provider/requests', read: true, createdAt: new Date(now.getTime() - 96 * 60 * 60 * 1000) }, // 4 days ago

    // === EARLIER (older than a week) ===
    { userId: family2.id, type: 'REQUEST_DECLINED', title: 'Request update', body: 'Riverside Senior Care was unable to accommodate your request', linkHref: '/requests', read: true, createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) }, // 10 days ago
    { userId: family8.id, type: 'SYSTEM', title: 'Welcome to Olera!', body: 'Start your care search by browsing providers in your area', linkHref: '/browse', read: true, createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) }, // 2 weeks ago
    { userId: org7.id, type: 'PROFILE_VIEW', title: 'Profile viewed', body: 'A family viewed your profile', linkHref: '/provider/profile', read: true, createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) },

    // === Tour reminders ===
    { userId: family1.id, type: 'TOUR_REMINDER', title: 'Tour reminder', body: 'Your tour with Sunshine Manor is tomorrow at 2pm', linkHref: '/requests', read: false, createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000) },

    // === System notifications ===
    { userId: org2.id, type: 'SYSTEM', title: 'Complete your profile', body: 'Add photos and pricing to attract more families', linkHref: '/provider/profile', read: false, createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) },
    { userId: caregiver6.id, type: 'SYSTEM', title: 'Tip: Add certifications', body: 'Profiles with certifications get 2x more inquiries', linkHref: '/provider/profile', read: true, createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000) },
  ];

  for (const notif of notificationData) {
    await prisma.notification.create({
      data: {
        userId: notif.userId,
        type: notif.type as any,
        title: notif.title,
        body: notif.body,
        linkHref: notif.linkHref,
        read: notif.read,
        createdAt: notif.createdAt,
      },
    });
  }

  console.log('✅ Created 24 notifications across all time periods\n');

  // ============================================================================
  // SEED SUMMARY
  // ============================================================================
  console.log('📊 Comprehensive Seed Summary:');
  console.log('   ┌─────────────────────────────────────────────────┐');
  console.log('   │  ACCOUNTS                                       │');
  console.log('   │  - 12 family accounts                           │');
  console.log('   │  - 12 organization/facility providers           │');
  console.log('   │  - 6 individual caregivers                      │');
  console.log('   │  - 3 unclaimed providers (SEO listings)         │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  ENGAGEMENTS                                    │');
  console.log('   │  - 12 consultation/hiring requests              │');
  console.log('   │  - 12 messages across conversations             │');
  console.log('   │  - 1 scheduled tour                             │');
  console.log('   │  - 8 saved providers                            │');
  console.log('   │  - 3 declined/cancelled scenarios               │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  REVIEWS & RATINGS                              │');
  console.log('   │  - 12 reviews with ratings                      │');
  console.log('   │  - Various relationship types                   │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  SUBSCRIPTIONS (Paywall Testing)                │');
  console.log('   │  - 3 PRO subscriptions (unlimited)              │');
  console.log('   │  - 3 FREE subscriptions (at/near limit)         │');
  console.log('   │  - 1 EXPIRED subscription                       │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  ADMIN SCENARIOS                                │');
  console.log('   │  - 2 takedown requests (pending + approved)     │');
  console.log('   ├─────────────────────────────────────────────────┤');
  console.log('   │  NOTIFICATIONS                                  │');
  console.log('   │  - 24 notifications (Today/Yesterday/Earlier)   │');
  console.log('   │  - All notification types covered               │');
  console.log('   └─────────────────────────────────────────────────┘');
  console.log('\n   Password for all accounts: demo123\n');

  console.log('✅ Comprehensive seed completed successfully!\n');
}

// Export main for use in API routes
export { main };

// Only run if this file is executed directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error seeding database:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
