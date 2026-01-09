import { PrismaClient, ProviderType, CareType, RequestType, ConsultRequestStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed (30 accounts)...\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
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

  // Scenario 4: Org 8 (CareFirst Home Services) - Family Mode Requests
  // Org8 in family mode contacts individual caregivers for staff hiring
  const request10 = await prisma.consultRequest.create({
    data: {
      senderId: org8.id,
      familyProfileId: familyProfiles[0].id, // Using dummy family profile
      providerId: providers.find(p => p.userId === caregiver4.id)!.id,
      requestType: 'HIRING',
      message: 'Hi Angela, CareFirst Home Services is expanding and looking for experienced caregivers to join our team. Would you be interested in discussing employment opportunities?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-05T09:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request10.id,
        senderId: caregiver4.id,
        content: 'Yes, I would be very interested! What positions do you have available?',
        createdAt: new Date('2026-01-05T10:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-05T10:30:00Z'),
      },
      {
        consultRequestId: request10.id,
        senderId: org8.id,
        content: 'We have full-time and part-time positions available. Our caregivers work with clients in their homes throughout San Diego. Can we schedule a call this week?',
        createdAt: new Date('2026-01-05T11:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-05T11:15:00Z'),
      },
    ],
  });

  const request11 = await prisma.consultRequest.create({
    data: {
      senderId: org8.id,
      familyProfileId: familyProfiles[0].id,
      providerId: providers.find(p => p.userId === caregiver5.id)!.id,
      requestType: 'HIRING',
      message: 'Nancy, we are impressed with your memory care background. CareFirst has several clients who need specialized dementia care. Would you like to join our team?',
      status: 'PENDING',
      createdAt: new Date('2026-01-08T08:00:00Z'),
    },
  });

  // Scenario 5: Org 8 (CareFirst) - Provider Mode Requests
  // Families contact Org8's home care services
  const request12 = await prisma.consultRequest.create({
    data: {
      senderId: family2.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family2.id)!.id,
      providerId: providers.find(p => p.userId === org8.id)!.id,
      requestType: 'CONSULTATION',
      message: 'My father needs part-time home care assistance, about 20 hours per week. Can you provide caregivers who speak Spanish?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-04T13:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request12.id,
        senderId: org8.id,
        content: 'Absolutely! We have several bilingual caregivers available. I would love to discuss your fathers needs and create a care plan. When would be a good time to talk?',
        createdAt: new Date('2026-01-04T14:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-04T14:30:00Z'),
      },
      {
        consultRequestId: request12.id,
        senderId: family2.id,
        content: 'Tomorrow afternoon would work well. What information do you need from me?',
        createdAt: new Date('2026-01-04T15:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-04T15:15:00Z'),
      },
    ],
  });

  const request13 = await prisma.consultRequest.create({
    data: {
      senderId: family6.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family6.id)!.id,
      providerId: providers.find(p => p.userId === org8.id)!.id,
      requestType: 'CONSULTATION',
      message: 'I need companion care for my mother 3 days a week. She mainly needs help with light housekeeping and meal preparation. Do you offer this service?',
      status: 'ACCEPTED',
      createdAt: new Date('2026-01-07T14:00:00Z'),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request13.id,
        senderId: org8.id,
        content: 'Yes, companion care is one of our core services! We can match your mother with a caregiver who specializes in light housekeeping and meal prep. What days work best?',
        createdAt: new Date('2026-01-07T15:00:00Z'),
        status: 'READ',
        readAt: new Date('2026-01-07T15:30:00Z'),
      },
    ],
  });

  const request14 = await prisma.consultRequest.create({
    data: {
      senderId: family9.id,
      familyProfileId: familyProfiles.find(fp => fp.userId === family9.id)!.id,
      providerId: providers.find(p => p.userId === org8.id)!.id,
      requestType: 'CONSULTATION',
      message: 'What are your hourly rates for basic personal care assistance? My mother needs help with bathing and dressing in the mornings.',
      status: 'PENDING',
      createdAt: new Date('2026-01-08T16:00:00Z'),
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
      {
        familyProfileId: familyProfiles[0].id, // Org8 saved caregivers for potential hiring
        providerId: providers.find(p => p.userId === caregiver4.id)!.id,
        notes: 'Interviewing for full-time position',
      },
      {
        familyProfileId: familyProfiles[0].id,
        providerId: providers.find(p => p.userId === caregiver5.id)!.id,
        notes: 'Memory care specialist - potential hire',
      },
    ],
  });

  console.log('✅ Created engagement data:\n');
  console.log('   - 14 consultation/hiring requests');
  console.log('   - 18 messages across conversations');
  console.log('   - 1 scheduled tour');
  console.log('   - 10 saved providers\n');

  console.log('📊 Seed Summary:');
  console.log('   - 30 total user accounts (12 families, 12 orgs, 6 caregivers)');
  console.log('   - All profiles with varying completion levels');
  console.log('   - All 3 engagement scenarios covered');
  console.log('   - Password for all accounts: demo123\n');

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
