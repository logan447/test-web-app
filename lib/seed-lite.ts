import { PrismaClient, ProviderType, CareType } from '@prisma/client';
import { hash } from 'bcryptjs';

/**
 * Full seed for Vercel - creates 90 accounts
 * (36 families, 36 facilities, 18 caregivers)
 */

const FAMILY_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400',
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400',
  'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
  'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400',
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400',
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400',
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400',
  'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400',
  'https://images.unsplash.com/photo-1502323777036-f29e3972f4e4?w=400',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400',
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
];

const FACILITY_PHOTOS = [
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
  'https://images.unsplash.com/photo-1559599238-308793637427?w=800',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
  'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  'https://images.unsplash.com/photo-1581093458791-9f3c3250a740?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
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
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400',
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=400',
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=400',
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
  'https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=400',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
  'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=400',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
];

const CA_LOCATIONS = [
  { city: 'San Diego', state: 'CA', zip: '92101', lat: 32.7157, lng: -117.1611 },
  { city: 'La Jolla', state: 'CA', zip: '92037', lat: 32.8328, lng: -117.2713 },
  { city: 'Chula Vista', state: 'CA', zip: '91910', lat: 32.6401, lng: -117.0842 },
  { city: 'Del Mar', state: 'CA', zip: '92014', lat: 32.9595, lng: -117.2653 },
  { city: 'Encinitas', state: 'CA', zip: '92024', lat: 33.0370, lng: -117.2920 },
  { city: 'Carlsbad', state: 'CA', zip: '92008', lat: 33.1581, lng: -117.3506 },
  { city: 'Oceanside', state: 'CA', zip: '92054', lat: 33.1959, lng: -117.3795 },
  { city: 'Los Angeles', state: 'CA', zip: '90001', lat: 34.0522, lng: -118.2437 },
  { city: 'Santa Monica', state: 'CA', zip: '90401', lat: 34.0195, lng: -118.4912 },
  { city: 'Pasadena', state: 'CA', zip: '91101', lat: 34.1478, lng: -118.1445 },
  { city: 'Irvine', state: 'CA', zip: '92602', lat: 33.6846, lng: -117.8265 },
  { city: 'Newport Beach', state: 'CA', zip: '92660', lat: 33.6189, lng: -117.9289 },
];

export async function seedLite(prisma: PrismaClient) {
  console.log('[SEED] 🌱 Starting FULL seed (90 accounts)...');

  try {
    // Preserve admin users
    console.log('[SEED] Step 1: Finding admin users...');
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, email: true },
    });
    const adminIds = adminUsers.map(u => u.id);
    console.log(`[SEED] Found ${adminUsers.length} admin user(s) to preserve`);

    // Clear existing data - must delete in correct order due to foreign keys
    console.log('[SEED] Step 2: Clearing existing data...');

    console.log('[SEED]   - Deleting engagementMessage...');
    await prisma.engagementMessage.deleteMany();
    console.log('[SEED]   - Deleting hiringMessage...');
    await prisma.hiringMessage.deleteMany();
    console.log('[SEED]   - Deleting scheduledEvent...');
    await prisma.scheduledEvent.deleteMany();
    console.log('[SEED]   - Deleting message...');
    await prisma.message.deleteMany();
    console.log('[SEED]   - Deleting tourAppointment...');
    await prisma.tourAppointment.deleteMany();
    console.log('[SEED]   - Deleting engagement...');
    await prisma.engagement.deleteMany();
    console.log('[SEED]   - Deleting hiringEngagement...');
    await prisma.hiringEngagement.deleteMany();
    console.log('[SEED]   - Deleting consultRequest...');
    await prisma.consultRequest.deleteMany();
    console.log('[SEED]   - Deleting savedProvider...');
    await prisma.savedProvider.deleteMany();
    console.log('[SEED]   - Deleting savedFamilyProfile...');
    await prisma.savedFamilyProfile.deleteMany();
    console.log('[SEED]   - Deleting contactView...');
    await prisma.contactView.deleteMany();
    console.log('[SEED]   - Deleting review...');
    await prisma.review.deleteMany();
    console.log('[SEED]   - Deleting subscription (non-admin)...');
    await prisma.subscription.deleteMany({ where: { userId: { notIn: adminIds } } });
    console.log('[SEED]   - Deleting familyProfile (non-admin)...');
    await prisma.familyProfile.deleteMany({ where: { userId: { notIn: adminIds } } });
    console.log('[SEED]   - Deleting providerIdentity (non-admin)...');
    await prisma.providerIdentity.deleteMany({ where: { userId: { notIn: adminIds } } });
    console.log('[SEED]   - Deleting provider (non-admin)...');
    await prisma.provider.deleteMany({ where: { userId: { notIn: adminIds } } });
    console.log('[SEED]   - Deleting users (non-admin)...');
    await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
    console.log('[SEED] ✅ Cleared existing data');

    console.log('[SEED] Step 3: Hashing password...');
    const demoPassword = await hash('demo123', 12);
    console.log('[SEED] ✅ Password hashed');

    // 36 Family accounts
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
    { name: 'Christopher Lee', email: 'christopher.lee@demo.com', lovedOne: 'Helen', care: ['PERSONAL_CARE', 'SKILLED_NURSING'], budget: [6000, 9000], timeline: 'Immediate' },
    { name: 'Karen Wilson', email: 'karen.wilson@demo.com', lovedOne: 'Robert', care: ['MEMORY_CARE'], budget: [5500, 7500], timeline: 'Within 2 months' },
    { name: 'Steven Moore', email: 'steven.moore@demo.com', lovedOne: 'Patricia', care: ['MEMORY_CARE', 'PERSONAL_CARE'], budget: [6500, 9000], timeline: 'Within 1 month' },
    { name: 'Susan Jackson', email: 'susan.jackson@demo.com', lovedOne: 'William', care: ['MEMORY_CARE'], budget: [5000, 7000], timeline: 'Within 3 months' },
    { name: 'Richard Martin', email: 'richard.martin@demo.com', lovedOne: 'Elizabeth', care: ['MEMORY_CARE'], budget: [7500, 11000], timeline: 'Immediate' },
    { name: 'Michelle Young', email: 'michelle.young@demo.com', lovedOne: 'Charles', care: ['MEMORY_CARE', 'COMPANION_CARE'], budget: [5500, 7500], timeline: 'Within 2 months' },
    { name: 'Joseph Hall', email: 'joseph.hall@demo.com', lovedOne: 'Mary', care: ['MEMORY_CARE'], budget: [6000, 8500], timeline: 'Within 1 month' },
    { name: 'Barbara Allen', email: 'barbara.allen@demo.com', lovedOne: 'Donald', care: ['MEMORY_CARE', 'SKILLED_NURSING'], budget: [8000, 12000], timeline: 'Immediate' },
    { name: 'Mark Hernandez', email: 'mark.hernandez@demo.com', lovedOne: 'Rosa', care: ['MEMORY_CARE'], budget: [5000, 6500], timeline: 'Within 3 months' },
    { name: 'Dorothy King', email: 'dorothy.king@demo.com', lovedOne: 'Harold', care: ['MEMORY_CARE', 'PERSONAL_CARE'], budget: [6500, 9000], timeline: 'Within 2 months' },
    { name: 'Paul Wright', email: 'paul.wright@demo.com', lovedOne: 'Louise', care: ['MEMORY_CARE'], budget: [7000, 10000], timeline: 'Within 1 month' },
    { name: 'Amanda Scott', email: 'amanda.scott@demo.com', lovedOne: 'Edward', care: ['COMPANION_CARE'], budget: [1500, 2500], timeline: 'Within 1 month' },
    { name: 'Charles Miller', email: 'charles.miller@demo.com', lovedOne: 'Mary', care: ['PERSONAL_CARE'], budget: [2000, 3000], timeline: 'Within 3 months' },
    { name: 'Patricia Garcia', email: 'patricia.garcia@demo.com', lovedOne: 'Joseph', care: ['RESPITE_CARE'], budget: [3000, 4000], timeline: 'Within 2 weeks' },
    { name: 'Thomas Jackson', email: 'thomas.jackson@demo.com', lovedOne: 'Margaret', care: ['LIVE_IN_CARE'], budget: [4500, 6500], timeline: 'Immediate' },
    { name: 'Nancy Harris', email: 'nancy.harris@demo.com', lovedOne: 'George', care: ['COMPANION_CARE', 'PERSONAL_CARE'], budget: [3500, 5000], timeline: 'Within 2 months' },
    { name: 'Daniel White', email: 'daniel.white@demo.com', lovedOne: 'Ruth', care: ['PERSONAL_CARE'], budget: [4500, 6500], timeline: 'Within 3 months' },
    { name: 'Betty Thompson', email: 'betty.thompson@demo.com', lovedOne: 'Frank', care: ['SKILLED_NURSING'], budget: [7000, 10000], timeline: 'Immediate' },
    { name: 'George Robinson', email: 'george.robinson@demo.com', lovedOne: 'Helen', care: ['PERSONAL_CARE'], budget: [3500, 5000], timeline: 'Within 1 month' },
    { name: 'Sandra Clark', email: 'sandra.clark@demo.com', lovedOne: 'Arthur', care: ['MEMORY_CARE'], budget: [6000, 8000], timeline: 'Within 2 months' },
    { name: 'Kenneth Lewis', email: 'kenneth.lewis@demo.com', lovedOne: 'Martha', care: ['COMPANION_CARE'], budget: [2500, 4000], timeline: 'Within 6 months' },
    { name: 'Donna Walker', email: 'donna.walker@demo.com', lovedOne: 'Raymond', care: ['PERSONAL_CARE', 'COMPANION_CARE'], budget: [4000, 6000], timeline: 'Within 3 months' },
    { name: 'Edward Hall', email: 'edward.hall@demo.com', lovedOne: 'Virginia', care: ['LIVE_IN_CARE'], budget: [5500, 7500], timeline: 'Within 2 weeks' },
    { name: 'Carol Young', email: 'carol.young@demo.com', lovedOne: 'Eugene', care: ['RESPITE_CARE'], budget: [3000, 4500], timeline: 'Within 1 month' },
    ];

    console.log('[SEED] Step 4: Creating 36 family accounts...');
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
              profilePhoto: FAMILY_PHOTOS[i % FAMILY_PHOTOS.length],
              showProfilePhoto: true,
              isPublic: true,
              description: `Looking for quality care for ${data.lovedOne === 'Self' ? 'myself' : data.lovedOne}.`,
            },
          },
        },
      });
    }
    console.log('[SEED] ✅ Created 36 family accounts');

    // 36 Facility accounts
    console.log('[SEED] Step 5: Creating 36 facility accounts...');
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
    { name: 'Bayview Hospice', type: 'HOSPICE', email: 'info@bayviewhospice.com', care: ['HOSPICE_CARE'], price: [0, 0], rating: 4.8 },
    { name: 'Encinitas Life Plan', type: 'INDEPENDENT_LIVING', email: 'info@encinitaslifeplan.com', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [5000, 15000], rating: 4.9 },
    { name: 'Parkside Living', type: 'ASSISTED_LIVING', email: 'director@parksideliving.com', care: ['PERSONAL_CARE'], price: [3800, 5500], rating: 4.2 },
    { name: 'Riverside Senior Care', type: 'ASSISTED_LIVING', email: 'info@riversideseniorcare.com', care: ['PERSONAL_CARE'], price: [2500, 3500], rating: 4.3 },
    { name: 'Hillcrest Assisted Living', type: 'ASSISTED_LIVING', email: 'hr@hillcrestassisted.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4000, 6500], rating: 4.4 },
    { name: 'Golden Gate Rehab', type: 'REHABILITATION', email: 'info@goldengaterehab.com', care: ['SKILLED_NURSING'], price: [8000, 13000], rating: 4.7 },
    { name: 'Sunrise Senior Living', type: 'ASSISTED_LIVING', email: 'contact@sunrisesl.com', care: ['PERSONAL_CARE', 'COMPANION_CARE', 'MEMORY_CARE'], price: [5500, 8500], rating: 4.7 },
    { name: 'Coastal Comfort Care', type: 'ASSISTED_LIVING', email: 'info@coastalcomfort.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [6000, 9000], rating: 4.6 },
    { name: 'Mountain View Senior', type: 'ASSISTED_LIVING', email: 'info@mountainviewsenior.com', care: ['PERSONAL_CARE'], price: [4000, 6000], rating: 4.4 },
    { name: 'Heritage House', type: 'ASSISTED_LIVING', email: 'info@heritagehouse.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [5500, 8000], rating: 4.8 },
    { name: 'Serenity Springs', type: 'ASSISTED_LIVING', email: 'info@serenitysprings.com', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4500, 7000], rating: 4.5 },
    { name: 'Alzheimers Care Center', type: 'MEMORY_CARE', email: 'info@alzcenter.com', care: ['MEMORY_CARE'], price: [7000, 10000], rating: 4.8 },
    { name: 'Peaceful Minds', type: 'MEMORY_CARE', email: 'info@peacefulminds.com', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [6000, 8500], rating: 4.9 },
    { name: 'Remember When', type: 'MEMORY_CARE', email: 'info@rememberwhen.com', care: ['MEMORY_CARE'], price: [5500, 8000], rating: 4.5 },
    { name: 'Clarity Care', type: 'MEMORY_CARE', email: 'info@claritycare.com', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [7000, 9500], rating: 4.7 },
    { name: 'Safe Harbor Memory', type: 'MEMORY_CARE', email: 'info@safeharbor.com', care: ['MEMORY_CARE'], price: [6500, 9000], rating: 4.6 },
    { name: 'Mindful Living', type: 'MEMORY_CARE', email: 'info@mindfulliving.com', care: ['MEMORY_CARE', 'COMPANION_CARE'], price: [6000, 8500], rating: 4.4 },
    { name: 'Bay View Nursing Center', type: 'NURSING_HOME', email: 'info@bayviewnursing.com', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [7500, 12000], rating: 4.5 },
    { name: 'Valley Care Nursing', type: 'NURSING_HOME', email: 'info@valleycarenursing.com', care: ['SKILLED_NURSING', 'MEMORY_CARE'], price: [6500, 10000], rating: 4.4 },
    { name: 'Specialized Care Partners', type: 'HOME_CARE', email: 'info@specializedcarepartners.com', care: ['PERSONAL_CARE', 'MEMORY_CARE', 'SKILLED_NURSING'], price: [30, 50], rating: 4.9 },
    { name: 'Comfort Keepers LA', type: 'HOME_CARE', email: 'info@comfortkeepersla.com', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [22, 38], rating: 4.6 },
    { name: 'Pacific Home Health', type: 'HOME_HEALTH', email: 'info@pacifichomehealth.com', care: ['SKILLED_NURSING'], price: [45, 75], rating: 4.7 },
    { name: 'Elite Senior Care', type: 'HOME_CARE', email: 'info@eliteseniorcare.com', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'LIVE_IN_CARE'], price: [35, 60], rating: 4.9 },
    { name: 'Loving Hearts Home Care', type: 'HOME_CARE', email: 'info@lovinghearts.com', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [20, 32], rating: 4.5 },
    { name: 'Right at Home OC', type: 'HOME_CARE', email: 'info@rightathomeoc.com', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING'], price: [26, 44], rating: 4.6 },
    { name: 'Peaceful Journey Hospice', type: 'HOSPICE', email: 'info@peacefuljourney.com', care: ['HOSPICE_CARE'], price: [0, 0], rating: 4.9 },
    ];

    // Helper: build type-specific fields for each facility/agency
    const getFacilityFields = (type: string, idx: number) => {
      const isFacilityType = ['ASSISTED_LIVING', 'MEMORY_CARE', 'NURSING_HOME', 'INDEPENDENT_LIVING', 'REHABILITATION'].includes(type);
      const isHomeCareType = ['HOME_CARE', 'HOME_HEALTH', 'HOSPICE'].includes(type);

      const base: Record<string, any> = {
        licensed: true,
        yearsInBusiness: 8 + (idx % 15),
      };

      if (isFacilityType) {
        const capacity = 40 + (idx % 8) * 15;
        base.totalCapacity = capacity;
        base.availableSpots = idx % 5 === 0 ? 0 : 2 + (idx % 6);
        base.waitlistAvailable = base.availableSpots === 0;
        base.staffToResidentRatio = `1:${Math.floor(capacity / (6 + idx % 4))}`;
        base.hasRNOnSite = type !== 'INDEPENDENT_LIVING';
        base.hasLVNOnSite = true;
        base.allStaffBackgroundChecked = true;
        base.visitingDoctorFrequency = type === 'NURSING_HOME' || type === 'REHABILITATION' ? 'Daily' : 'Weekly';

        // Neighborhood & nearby amenities
        const neighborhoods = [
          'A quiet residential area with tree-lined streets, close to parks and local shops. Families appreciate the easy freeway access for visits.',
          'Located in a peaceful neighborhood with well-maintained sidewalks and nearby medical facilities. A grocery store and pharmacy are within walking distance.',
          'Situated in a family-friendly community near a hospital and several restaurants. The area has low traffic and plenty of green space.',
          'Nestled in a welcoming neighborhood with nearby churches, a public library, and a community center. Excellent access to public transit.',
        ];
        base.neighborhoodDescription = neighborhoods[idx % neighborhoods.length];

        const amenitySets = [
          ['Hospital - 0.8 miles', 'Park - 0.3 miles', 'Grocery Store - 0.5 miles', 'Pharmacy - 0.4 miles', 'Coffee Shop - 0.2 miles'],
          ['Medical Clinic - 0.5 miles', 'Nature Trail - 0.6 miles', 'Shopping Center - 1.2 miles', 'Church - 0.3 miles', 'Restaurant Row - 0.7 miles'],
          ['Urgent Care - 1.0 miles', 'Community Park - 0.2 miles', 'Pharmacy - 0.3 miles', 'Library - 0.5 miles', 'Grocery Store - 0.8 miles'],
          ['Hospital - 1.5 miles', 'Garden Center - 0.4 miles', 'Cafe - 0.2 miles', 'Farmer\'s Market - 0.6 miles', 'Medical Office - 0.3 miles'],
        ];
        base.nearbyAmenities = amenitySets[idx % amenitySets.length];

        // Languages — some facilities are multilingual
        base.languagesSpoken = idx % 3 === 0 ? ['English', 'Spanish', 'Tagalog'] : idx % 3 === 1 ? ['English', 'Spanish'] : ['English'];

        if (type === 'MEMORY_CARE') {
          base.hasMemoryCare = true;
          base.specialtyPrograms = ['Structured Day Program', 'Music Therapy', 'Sensory Stimulation'];
        }
        if (type === 'REHABILITATION') {
          base.medicalServices = ['Physical Therapy', 'Occupational Therapy', 'Speech Therapy', 'Post-Surgical Recovery'];
        }
        if (type === 'NURSING_HOME') {
          base.medicalServices = ['Skilled Nursing', 'Wound Care', 'IV Therapy', 'Pain Management'];
          base.hasMemoryCare = idx % 2 === 0;
        }
        if (type === 'ASSISTED_LIVING') {
          base.roomFeatures = ['Private Bathroom', 'Kitchenette', 'Emergency Call System', 'Cable TV'];
          base.commonAreas = ['Dining Room', 'Activity Room', 'Garden', 'Library'];
          base.activitiesOffered = ['Exercise Classes', 'Arts & Crafts', 'Movie Nights', 'Social Hours', 'Gardening'];
          base.dietaryOptions = ['Heart-Healthy', 'Diabetic-Friendly', 'Gluten-Free', 'Vegetarian'];
        }
        if (type === 'INDEPENDENT_LIVING') {
          base.roomFeatures = ['Full Kitchen', 'Washer/Dryer', 'Patio/Balcony', 'Walk-In Closet'];
          base.commonAreas = ['Pool', 'Fitness Center', 'Clubhouse', 'Walking Trails'];
          base.activitiesOffered = ['Yoga', 'Book Club', 'Day Trips', 'Cooking Classes', 'Golf'];
        }
      }

      if (isHomeCareType) {
        base.serviceRadius = 20 + (idx % 20);

        if (type === 'HOSPICE') {
          base.hasRNOnSite = true;
          base.hasHospiceCare = true;
          base.medicalServices = ['Pain Management', 'Symptom Control', 'Family Counseling', 'Spiritual Support'];
          base.specialtyPrograms = ['Bereavement Support', 'Respite Care', 'Veteran Honors'];
        }
        if (type === 'HOME_HEALTH') {
          base.hasRNOnSite = true;
          base.medicalServices = ['Skilled Nursing', 'Physical Therapy', 'Wound Care', 'Medication Management'];
        }
        if (type === 'HOME_CARE') {
          base.allStaffBackgroundChecked = true;
          base.caregiverTraining = ['CPR/First Aid', 'Dementia Care', 'Fall Prevention'];
          base.priceDescription = `Hourly rates vary by service level. Includes caregiver matching, care plan, and ongoing supervision.`;
        }
      }

      return base;
    };

    for (let i = 0; i < facilityData.length; i++) {
      const data = facilityData[i];
      const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];
      const photos = FACILITY_PHOTOS.slice(i % 6, (i % 6) + 4);
      const typeFields = getFacilityFields(data.type, i);

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
              isVisible: true,
              ...typeFields,
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
    console.log('[SEED] ✅ Created 36 facility accounts');

    // 18 Caregiver accounts
    console.log('[SEED] Step 6: Creating 18 caregiver accounts...');
    const caregiverData = [
    { name: 'Maria Santos', email: 'maria.santos@demo.com', specialty: 'Dementia/Live-in', care: ['MEMORY_CARE', 'LIVE_IN_CARE'], price: [28, 38], rating: 4.9 },
    { name: 'John Peterson', email: 'john.peterson@demo.com', specialty: 'Dementia Specialist', care: ['MEMORY_CARE'], price: [30, 42], rating: 4.8 },
    { name: 'Rachel Thompson', email: 'rachel.thompson@demo.com', specialty: 'Skilled Nursing (RN)', care: ['SKILLED_NURSING'], price: [45, 65], rating: 5.0 },
    { name: 'Angela Brooks', email: 'angela.brooks@demo.com', specialty: 'General Care', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [22, 32], rating: 4.5 },
    { name: 'Carlos Mendez', email: 'carlos.mendez@demo.com', specialty: 'Bilingual Caregiver', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [25, 35], rating: 4.8 },
    { name: 'Susan Williams', email: 'susan.williams@demo.com', specialty: 'Companion Care', care: ['COMPANION_CARE'], price: [20, 28], rating: 4.4 },
    { name: 'David Kim', email: 'david.kim@demo.com', specialty: 'Physical Therapy Aide', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [32, 45], rating: 4.7 },
    { name: 'Patricia Nguyen', email: 'patricia.nguyen@demo.com', specialty: 'Memory Care Expert', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [28, 40], rating: 4.9 },
    { name: 'Michael Brown', email: 'michael.brown.cg@demo.com', specialty: 'Live-in Specialist', care: ['LIVE_IN_CARE', 'PERSONAL_CARE'], price: [26, 38], rating: 4.6 },
    { name: 'Jennifer Garcia', email: 'jennifer.garcia@demo.com', specialty: 'Hospice Support', care: ['HOSPICE_CARE', 'COMPANION_CARE'], price: [30, 45], rating: 4.8 },
    { name: 'Robert Johnson', email: 'robert.johnson.cg@demo.com', specialty: 'Respite Care', care: ['RESPITE_CARE', 'COMPANION_CARE'], price: [24, 35], rating: 4.5 },
    { name: 'Lisa Martinez', email: 'lisa.martinez@demo.com', specialty: 'General Caregiver', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [22, 30], rating: 4.3 },
    { name: 'James Wilson', email: 'james.wilson.cg@demo.com', specialty: 'Overnight Care', care: ['LIVE_IN_CARE'], price: [25, 35], rating: 4.6 },
    { name: 'Mary Anderson', email: 'mary.anderson@demo.com', specialty: 'Alzheimers Specialist', care: ['MEMORY_CARE'], price: [32, 48], rating: 4.9 },
    { name: 'William Taylor', email: 'william.taylor@demo.com', specialty: 'Skilled Care (LVN)', care: ['SKILLED_NURSING'], price: [38, 55], rating: 4.7 },
    { name: 'Elizabeth Moore', email: 'elizabeth.moore@demo.com', specialty: 'Companion & Personal', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [23, 33], rating: 4.4 },
    { name: 'Christopher Lee', email: 'christopher.lee.cg@demo.com', specialty: 'Weekend Specialist', care: ['RESPITE_CARE', 'PERSONAL_CARE'], price: [26, 38], rating: 4.5 },
    { name: 'Amanda White', email: 'amanda.white@demo.com', specialty: 'Memory & Live-in', care: ['MEMORY_CARE', 'LIVE_IN_CARE'], price: [30, 42], rating: 4.8 },
    ];

    for (let i = 0; i < caregiverData.length; i++) {
      const data = caregiverData[i];
      const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];

      const cgCerts = [
        ['CNA', 'CPR/First Aid'],
        ['HHA', 'CPR/First Aid', 'Dementia Care'],
        ['RN', 'BSN', 'ACLS'],
        ['CNA', 'CPR/First Aid'],
        ['HHA', 'Bilingual (Spanish)'],
        ['CPR/First Aid'],
        ['PTA', 'CPR/First Aid'],
        ['CNA', 'Memory Care Certified', 'CPR/First Aid'],
        ['HHA', 'CPR/First Aid', 'Live-In Training'],
        ['CNA', 'Hospice Care Certified', 'CPR/First Aid'],
        ['CNA', 'CPR/First Aid', 'Respite Care'],
        ['HHA', 'CPR/First Aid'],
        ['CNA', 'CPR/First Aid'],
        ['CNA', 'Alzheimers Certified', 'CPR/First Aid'],
        ['LVN', 'CPR/First Aid', 'IV Certification'],
        ['HHA', 'CPR/First Aid'],
        ['CNA', 'CPR/First Aid', 'Respite Care'],
        ['CNA', 'Memory Care Certified', 'CPR/First Aid', 'Live-In Training'],
      ];

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
              serviceRadius: 15 + (i % 15),
              careTypesOffered: data.care as CareType[],
              priceMin: data.price[0],
              priceMax: data.price[1],
              averageRating: data.rating,
              reviewCount: 5 + i * 2,
              photos: [CAREGIVER_PHOTOS[i % CAREGIVER_PHOTOS.length]],
              claimed: true,
              active: true,
              isVisible: true,
              backgroundChecked: true,
              yearsInBusiness: 3 + (i % 12),
              certifications: cgCerts[i % cgCerts.length],
              languagesSpoken: i % 3 === 0 ? ['English', 'Spanish'] : ['English'],
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
    console.log('[SEED] ✅ Created 18 caregiver accounts');

    console.log('[SEED] 📊 FULL Seed Summary:');
    console.log('[SEED]    - 36 family accounts');
    console.log('[SEED]    - 36 facility accounts');
    console.log('[SEED]    - 18 caregiver accounts');
    console.log('[SEED]    - 90 total accounts');
    console.log('[SEED]    - Password for all: demo123');
    console.log('[SEED] ✅ FULL seed completed!');
  } catch (error) {
    console.error('[SEED] ❌ SEED FAILED:', error);
    throw error; // Re-throw to surface to API route
  }
}
