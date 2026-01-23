import { PrismaClient, ProviderType, CareType } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Lite seed for Vercel - creates 30 accounts quickly
 * (12 families, 12 facilities, 6 caregivers)
 */

const FAMILY_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
];

const FACILITY_PHOTOS = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
  'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
  'https://images.unsplash.com/photo-1562141961-8d219c6dd062?w=800',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
];

const CAREGIVER_PHOTOS = [
  'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400',
  'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400',
  'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400',
  'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400',
];

const CA_LOCATIONS = [
  { city: 'San Diego', state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611 },
  { city: 'La Jolla', state: 'CA', zip: '92037', lat: 32.8328, lng: -117.2713 },
  { city: 'Del Mar', state: 'CA', zip: '92014', lat: 32.9595, lng: -117.2653 },
  { city: 'Encinitas', state: 'CA', zip: '92024', lat: 33.0370, lng: -117.2920 },
  { city: 'Los Angeles', state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
  { city: 'Irvine', state: 'CA', zip: '92602', lat: 33.6846, lng: -117.8265 },
];

export async function seedLite(prisma: PrismaClient) {
  console.log('🌱 Starting LITE seed (30 accounts for Vercel)...\n');

  // Preserve admin users
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  const adminIds = adminUsers.map(u => u.id);
  console.log(`📌 Preserving ${adminUsers.length} admin user(s)`);

  // Clear existing data
  await prisma.message.deleteMany();
  await prisma.tourAppointment.deleteMany();
  await prisma.consultRequest.deleteMany();
  await prisma.savedProvider.deleteMany();
  await prisma.familyProfile.deleteMany({ where: { userId: { notIn: adminIds } } });
  await prisma.providerIdentity.deleteMany({ where: { userId: { notIn: adminIds } } });
  await prisma.provider.deleteMany({ where: { userId: { notIn: adminIds } } });
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  console.log('✅ Cleared existing data\n');

  const demoPassword = await hash('demo123', 12);

  // 12 Family accounts
  const familyData = [
    { name: 'Sarah Johnson', email: 'sarah.johnson@demo.com', lovedOne: 'Margaret', care: ['PERSONAL_CARE'], budget: [4000, 6000], timeline: 'Within 3 months' },
    { name: 'Michael Roberts', email: 'michael.roberts@demo.com', lovedOne: 'Robert Sr.', care: ['COMPANION_CARE'], budget: [3500, 5500], timeline: 'Within 6 months' },
    { name: 'David Chen', email: 'david.chen@demo.com', lovedOne: 'Helen', care: ['MEMORY_CARE'], budget: [6000, 8000], timeline: 'Within 1 month' },
    { name: 'Lisa Thompson', email: 'lisa.thompson@demo.com', lovedOne: 'James', care: ['MEMORY_CARE', 'SKILLED_NURSING'], budget: [7000, 10000], timeline: 'Immediate' },
    { name: 'Emily Davis', email: 'emily.davis@demo.com', lovedOne: 'George', care: ['LIVE_IN_CARE'], budget: [5000, 7000], timeline: 'Within 2 weeks' },
    { name: 'James Anderson', email: 'james.anderson@demo.com', lovedOne: 'Dorothy', care: ['COMPANION_CARE'], budget: [2000, 3500], timeline: 'Within 1 month' },
    { name: 'Patricia Brown', email: 'patricia.brown@demo.com', lovedOne: 'William', care: ['PERSONAL_CARE'], budget: [4000, 5500], timeline: 'Within 2 months' },
    { name: 'Linda Taylor', email: 'linda.taylor@demo.com', lovedOne: 'Self', care: ['COMPANION_CARE'], budget: [2500, 4000], timeline: 'Within 6 months' },
    { name: 'Robert Garcia', email: 'robert.garcia@demo.com', lovedOne: 'Maria', care: ['PERSONAL_CARE'], budget: [3000, 4500], timeline: 'Within 3 months' },
    { name: 'Jennifer Martinez', email: 'jennifer.martinez@demo.com', lovedOne: 'Carlos', care: ['MEMORY_CARE'], budget: [5500, 7500], timeline: 'Within 2 months' },
    { name: 'William Lee', email: 'william.lee@demo.com', lovedOne: 'Alice', care: ['SKILLED_NURSING'], budget: [6000, 9000], timeline: 'Immediate' },
    { name: 'Elizabeth White', email: 'elizabeth.white@demo.com', lovedOne: 'Charles', care: ['PERSONAL_CARE'], budget: [8000, 12000], timeline: 'Within 3 months' },
  ];

  for (let i = 0; i < familyData.length; i++) {
    const data = familyData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];
    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: demoPassword,
        role: 'FAMILY',
        activeMode: 'FAMILY',
        familyProfile: {
          create: {
            lovedOneName: data.lovedOne,
            ageRange: '75-85',
            careTypes: data.care as CareType[],
            location: loc.city,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            budgetMin: data.budget[0],
            budgetMax: data.budget[1],
            timeline: data.timeline,
            profilePhoto: FAMILY_PHOTOS[i],
            showProfilePhoto: true,
            isPublic: true,
            description: `Looking for quality care for ${data.lovedOne === 'Self' ? 'myself' : data.lovedOne}.`,
          },
        },
      },
    });
  }
  console.log('✅ Created 12 family accounts\n');

  // 12 Facility accounts
  const facilityData = [
    { name: 'Sunshine Manor', type: 'ASSISTED_LIVING', email: 'admin@sunshinemanor.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4500, 7000], rating: 4.8 },
    { name: 'Memory Haven', type: 'MEMORY_CARE', email: 'info@memoryhaven.com', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [6500, 9000], rating: 4.7 },
    { name: 'La Jolla Estates', type: 'ASSISTED_LIVING', email: 'info@lajollaestates.com', care: ['PERSONAL_CARE'], price: [8000, 12000], rating: 4.9 },
    { name: 'CareFirst Home Services', type: 'HOME_CARE', email: 'info@carefirsthome.com', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'LIVE_IN_CARE'], price: [25, 45], rating: 4.8 },
    { name: 'San Diego Skilled Nursing', type: 'NURSING_HOME', email: 'info@sdskilled.com', care: ['SKILLED_NURSING'], price: [7000, 11000], rating: 4.6 },
    { name: 'Pacific Gardens', type: 'ASSISTED_LIVING', email: 'info@pacificgardens.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [5000, 7500], rating: 4.6 },
    { name: 'Coastal Memory Care', type: 'MEMORY_CARE', email: 'care@coastalmemory.com', care: ['MEMORY_CARE'], price: [7500, 11000], rating: 4.6 },
    { name: 'Del Mar Active Living', type: 'INDEPENDENT_LIVING', email: 'info@delmaractive.com', care: ['COMPANION_CARE'], price: [2500, 4500], rating: 4.7 },
    { name: 'Home Instead San Diego', type: 'HOME_CARE', email: 'info@homeinsteadsd.com', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [24, 42], rating: 4.7 },
    { name: 'Golden Years Residence', type: 'ASSISTED_LIVING', email: 'info@goldenyears.com', care: ['PERSONAL_CARE'], price: [3500, 5000], rating: 4.5 },
    { name: 'Bayview Hospice', type: 'HOSPICE', email: 'info@bayviewhospice.com', care: ['HOSPICE'], price: [0, 0], rating: 4.8 },
    { name: 'Encinitas Life Plan', type: 'INDEPENDENT_LIVING', email: 'info@encinitaslifeplan.com', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [5000, 15000], rating: 4.9 },
  ];

  for (let i = 0; i < facilityData.length; i++) {
    const data = facilityData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];
    const photos = FACILITY_PHOTOS.slice(i % 3, (i % 3) + 3);

    await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.name} Admin`,
        passwordHash: demoPassword,
        role: 'PROVIDER',
        activeMode: 'PROVIDER',
        provider: {
          create: {
            name: data.name,
            providerType: data.type as ProviderType,
            description: `Quality ${data.type.toLowerCase().replace('_', ' ')} services in ${loc.city}.`,
            email: data.email,
            phone: `(${600 + i}) 555-${String(1000 + i).padStart(4, '0')}`,
            address: `${100 + i * 10} Main Street`,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            latitude: loc.lat + (Math.random() - 0.5) * 0.02,
            longitude: loc.lng + (Math.random() - 0.5) * 0.02,
            careTypesOffered: data.care as CareType[],
            priceMin: data.price[0],
            priceMax: data.price[1],
            averageRating: data.rating,
            reviewCount: 10 + i * 3,
            photos: photos,
            coverPhoto: photos[0],
            claimed: true,
            verified: true,
            active: true,
          },
        },
        providerIdentity: {
          create: {
            type: 'ORGANIZATION',
            onboardingComplete: true,
          },
        },
      },
    });
  }
  console.log('✅ Created 12 facility accounts\n');

  // 6 Caregiver accounts
  const caregiverData = [
    { name: 'Maria Santos', email: 'maria.santos@demo.com', specialty: 'Dementia/Live-in', care: ['MEMORY_CARE', 'LIVE_IN_CARE'], price: [28, 38], rating: 4.9 },
    { name: 'John Peterson', email: 'john.peterson@demo.com', specialty: 'Dementia Specialist', care: ['MEMORY_CARE'], price: [30, 42], rating: 4.8 },
    { name: 'Rachel Thompson', email: 'rachel.thompson@demo.com', specialty: 'Skilled Nursing (RN)', care: ['SKILLED_NURSING'], price: [45, 65], rating: 5.0 },
    { name: 'Angela Brooks', email: 'angela.brooks@demo.com', specialty: 'General Care', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [22, 32], rating: 4.5 },
    { name: 'Carlos Mendez', email: 'carlos.mendez@demo.com', specialty: 'Bilingual Caregiver', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [25, 35], rating: 4.8 },
    { name: 'Susan Williams', email: 'susan.williams@demo.com', specialty: 'Companion Care', care: ['COMPANION_CARE'], price: [20, 28], rating: 4.4 },
  ];

  for (let i = 0; i < caregiverData.length; i++) {
    const data = caregiverData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];

    await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: demoPassword,
        role: 'PROVIDER',
        activeMode: 'PROVIDER',
        provider: {
          create: {
            name: data.name,
            providerType: 'INDEPENDENT_CAREGIVER',
            description: `Experienced ${data.specialty} with excellent references.`,
            email: data.email,
            phone: `(${700 + i}) 555-${String(2000 + i).padStart(4, '0')}`,
            address: `${loc.city} Area`,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            serviceRadius: 15,
            careTypesOffered: data.care as CareType[],
            priceMin: data.price[0],
            priceMax: data.price[1],
            averageRating: data.rating,
            reviewCount: 5 + i * 2,
            photos: [CAREGIVER_PHOTOS[i]],
            claimed: true,
            active: true,
          },
        },
        providerIdentity: {
          create: {
            type: 'INDIVIDUAL',
            onboardingComplete: true,
          },
        },
      },
    });
  }
  console.log('✅ Created 6 caregiver accounts\n');

  console.log('📊 LITE Seed Summary:');
  console.log('   - 12 family accounts');
  console.log('   - 12 facility accounts');
  console.log('   - 6 caregiver accounts');
  console.log('   - Password for all: demo123\n');
  console.log('✅ LITE seed completed!\n');
}
