import { PrismaClient, ProviderType, CareType, RequestType, ConsultRequestStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { US_LOCATIONS } from './data/us-locations';

// Create a local prisma client for CLI usage
// When called from API, the shared client is passed as parameter
const localPrisma = new PrismaClient();

// Module-level variable to track which client to use
let prisma: PrismaClient = localPrisma;

// Curated Unsplash photo collections for realistic demo data
const FAMILY_PHOTOS = [
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400', // woman 1
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400', // woman 2
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', // woman 3
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400', // woman 4
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', // woman 5
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400', // woman 6
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400', // woman 7
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', // woman 8
  'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=400', // woman 9
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400', // woman 10
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', // man 1
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', // man 2
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', // man 3
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400', // man 4
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', // man 5
  'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400', // man 6
  'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400', // man 7
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', // man 8
  'https://images.unsplash.com/photo-1548142813-c348350df52b?w=400', // woman 11
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', // woman professional
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400', // man 9
  'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?w=400', // man 10
  'https://images.unsplash.com/photo-1499952127939-9bbf5af6c51c?w=400', // woman 12
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', // woman 13
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', // woman 14
  'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=400', // man 11
  'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400', // man 12
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400', // man 13
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400', // woman 15
  'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400', // woman 16
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400', // man 14
  'https://images.unsplash.com/photo-1557862921-37829c790f19?w=400', // man 15
  'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400', // woman 17
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400', // woman 18
  'https://images.unsplash.com/photo-1502323777036-f29e3972f4e4?w=400', // man 16
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400', // man 17
];

const FACILITY_PHOTOS = [
  // Building exteriors
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
  'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=800',
  'https://images.unsplash.com/photo-1559599238-308793637427?w=800',
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
  // Interior common areas
  'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800',
  'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?w=800',
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800',
  'https://images.unsplash.com/photo-1581093458791-9f3c3250a740?w=800',
  'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800',
  // Gardens and outdoor
  'https://images.unsplash.com/photo-1562141961-8d219c6dd062?w=800',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
  // Medical/care
  'https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800',
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800',
  'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
  // Dining
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800',
  // Activities
  'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800',
  'https://images.unsplash.com/photo-1605684954998-685c79d6a018?w=800',
];

const CAREGIVER_PHOTOS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
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
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400',
  'https://images.unsplash.com/photo-1584516150909-c43483ee7932?w=400',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
];

// California cities for realistic data
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
  { city: 'Beverly Hills', state: 'CA', zip: '90210', lat: 34.0736, lng: -118.4004 },
  { city: 'Irvine', state: 'CA', zip: '92602', lat: 33.6846, lng: -117.8265 },
  { city: 'Newport Beach', state: 'CA', zip: '92660', lat: 33.6189, lng: -117.9289 },
  { city: 'Huntington Beach', state: 'CA', zip: '92648', lat: 33.6595, lng: -117.9988 },
  { city: 'Anaheim', state: 'CA', zip: '92801', lat: 33.8366, lng: -117.9143 },
  { city: 'San Francisco', state: 'CA', zip: '94102', lat: 37.7749, lng: -122.4194 },
  { city: 'Palo Alto', state: 'CA', zip: '94301', lat: 37.4419, lng: -122.1430 },
  { city: 'San Jose', state: 'CA', zip: '95110', lat: 37.3382, lng: -121.8863 },
  { city: 'Riverside', state: 'CA', zip: '92501', lat: 33.9533, lng: -117.3962 },
  { city: 'Palm Springs', state: 'CA', zip: '92262', lat: 33.8303, lng: -116.5453 },
];

/**
 * Seed Location table with US cities data
 * Uses upsert to avoid duplicates and allow re-running
 */
async function seedLocations() {
  console.log('📍 Seeding Location table with US cities...');

  let created = 0;
  let skipped = 0;

  for (const loc of US_LOCATIONS) {
    try {
      await prisma.location.upsert({
        where: {
          city_state: {
            city: loc.city,
            state: loc.state,
          },
        },
        update: {
          stateName: loc.stateName,
          county: loc.county,
          latitude: loc.latitude,
          longitude: loc.longitude,
          population: loc.population,
        },
        create: {
          city: loc.city,
          state: loc.state,
          stateName: loc.stateName,
          county: loc.county,
          latitude: loc.latitude,
          longitude: loc.longitude,
          population: loc.population,
        },
      });
      created++;
    } catch (e) {
      skipped++;
    }
  }

  console.log(`   ✅ Locations: ${created} created/updated, ${skipped} skipped\n`);
}

async function main(externalPrisma?: PrismaClient) {
  // Use external prisma client if provided (for API usage), otherwise use local
  if (externalPrisma) {
    prisma = externalPrisma;
  }

  console.log('🌱 Starting MEGA database seed (90+ accounts)...\n');

  // Seed locations first (foundation data)
  await seedLocations();

  // Get admin users to preserve
  const adminUsers = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true },
  });
  const adminIds = adminUsers.map(u => u.id);
  console.log(`📌 Preserving ${adminUsers.length} admin user(s): ${adminUsers.map(u => u.email).join(', ')}`);

  // Clear existing data (preserve admin users)
  console.log('🗑️  Clearing existing demo data...');
  await prisma.message.deleteMany();
  await prisma.tourAppointment.deleteMany();
  await prisma.consultRequest.deleteMany();
  await prisma.savedProvider.deleteMany();
  await prisma.familyProfile.deleteMany({ where: { userId: { notIn: adminIds } } });
  await prisma.providerIdentity.deleteMany({ where: { userId: { notIn: adminIds } } });
  await prisma.provider.deleteMany({ where: { userId: { notIn: adminIds } } });
  // Delete non-admin users only
  await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });
  console.log('✅ Existing demo data cleared (admin users preserved)\n');

  // Create demo password hash (password: "demo123")
  const demoPassword = await hash('demo123', 12);

  // ============================================================================
  // FAMILY ACCOUNTS (36 total - 3x original)
  // ============================================================================
  console.log('👨‍👩‍👧 Creating 36 family accounts with profiles...');

  const familyData = [
    // Batch 1: Assisted Living seekers (12)
    { name: 'Sarah Johnson', email: 'sarah.johnson@demo.com', lovedOne: 'Margaret Johnson', age: '80-85', care: ['PERSONAL_CARE'], budget: [4000, 6000], timeline: 'Within 3 months', conditions: ['Arthritis', 'Hypertension'], relationship: 'Daughter', careLevel: 'moderate', mobility: 'walker', living: 'Living alone', desc: 'Looking for a warm, friendly assisted living community for my mother.' },
    { name: 'Michael Roberts', email: 'michael.roberts@demo.com', lovedOne: 'Robert Roberts Sr.', age: '75-80', care: ['COMPANION_CARE', 'PERSONAL_CARE'], budget: [3500, 5500], timeline: 'Within 6 months', conditions: ['Diabetes'], relationship: 'Son', careLevel: 'minimal', mobility: 'independent', living: 'Living alone', desc: 'Dad needs some help with daily activities and would enjoy community activities.' },
    { name: 'Jennifer Williams', email: 'jennifer.williams@demo.com', lovedOne: 'Dorothy Williams', age: '85-90', care: ['PERSONAL_CARE'], budget: [4500, 7000], timeline: 'Immediate', conditions: ['COPD', 'Osteoporosis'], relationship: 'Daughter', careLevel: 'intensive', mobility: 'walker', living: 'Living with family', desc: 'Mom needs 24/7 care that we cannot provide at home anymore.' },
    { name: 'Robert Garcia', email: 'robert.garcia@demo.com', lovedOne: 'Maria Garcia', age: '78-80', care: ['COMPANION_CARE'], budget: [3000, 4500], timeline: 'Within 3 months', conditions: ['Mild depression'], relationship: 'Husband', careLevel: 'minimal', mobility: 'independent', living: 'Living with family', desc: 'My wife would benefit from social activities and companionship.' },
    { name: 'Elizabeth Martinez', email: 'elizabeth.martinez@demo.com', lovedOne: 'Carlos Martinez', age: '82-85', care: ['PERSONAL_CARE', 'COMPANION_CARE'], budget: [5000, 7500], timeline: 'Within 1 month', conditions: ['Heart disease', 'Diabetes'], relationship: 'Wife', careLevel: 'moderate', mobility: 'assisted', living: 'Living with family', desc: 'Looking for quality care with good medical oversight for my husband.' },
    { name: 'James Anderson', email: 'james.anderson@demo.com', lovedOne: 'Dorothy Anderson', age: '80-85', care: ['COMPANION_CARE'], budget: [2000, 3500], timeline: 'Within 1 month', conditions: ['Arthritis'], relationship: 'Son', careLevel: 'minimal', mobility: 'independent', living: 'Living alone', desc: 'Mom wants to stay active but needs some help with transportation and meals.' },
    { name: 'Patricia Brown', email: 'patricia.brown@demo.com', lovedOne: 'William Brown', age: '77-80', care: ['PERSONAL_CARE'], budget: [4000, 5500], timeline: 'Within 2 months', conditions: ['Early Parkinsons'], relationship: 'Wife', careLevel: 'moderate', mobility: 'walker', living: 'Living with family', desc: 'Seeking a community with good Parkinsons support programs.' },
    { name: 'Christopher Lee', email: 'christopher.lee@demo.com', lovedOne: 'Helen Lee', age: '88-90', care: ['PERSONAL_CARE', 'SKILLED_NURSING'], budget: [6000, 9000], timeline: 'Immediate', conditions: ['Post-stroke', 'Diabetes'], relationship: 'Son', careLevel: 'intensive', mobility: 'wheelchair', living: 'In hospital', desc: 'Mother recovering from stroke needs skilled nursing and rehabilitation.' },
    { name: 'Linda Taylor', email: 'linda.taylor@demo.com', lovedOne: 'Self', age: '70-75', care: ['COMPANION_CARE'], budget: [2500, 4000], timeline: 'Within 6 months', conditions: [], relationship: 'Self', careLevel: 'minimal', mobility: 'independent', living: 'Living alone', desc: 'Looking for an active senior community with social programs.' },
    { name: 'Daniel White', email: 'daniel.white@demo.com', lovedOne: 'Ruth White', age: '83-85', care: ['PERSONAL_CARE'], budget: [4500, 6500], timeline: 'Within 3 months', conditions: ['Hypertension', 'Mild cognitive decline'], relationship: 'Son', careLevel: 'moderate', mobility: 'walker', living: 'Living alone', desc: 'Mom needs more support than I can provide while working full-time.' },
    { name: 'Nancy Harris', email: 'nancy.harris@demo.com', lovedOne: 'George Harris', age: '79-82', care: ['COMPANION_CARE', 'PERSONAL_CARE'], budget: [3500, 5000], timeline: 'Within 2 months', conditions: ['COPD'], relationship: 'Wife', careLevel: 'moderate', mobility: 'assisted', living: 'Living with family', desc: 'My husband needs oxygen support and would enjoy activities.' },
    { name: 'Thomas Clark', email: 'thomas.clark@demo.com', lovedOne: 'Margaret Clark', age: '86-90', care: ['PERSONAL_CARE'], budget: [5500, 8000], timeline: 'Within 1 month', conditions: ['Osteoporosis', 'Falls history'], relationship: 'Son', careLevel: 'intensive', mobility: 'assisted', living: 'Living with family', desc: 'Mom has had several falls and needs 24/7 supervision.' },

    // Batch 2: Memory Care seekers (12)
    { name: 'David Chen', email: 'david.chen@demo.com', lovedOne: 'Helen Chen', age: '80-85', care: ['MEMORY_CARE'], budget: [6000, 8000], timeline: 'Within 1 month', conditions: ['Early-stage Alzheimers', 'Hypertension'], relationship: 'Son', careLevel: 'intensive', mobility: 'independent', living: 'Living with family', desc: 'Seeking specialized memory care for my mother with early-stage Alzheimers.' },
    { name: 'Lisa Thompson', email: 'lisa.thompson@demo.com', lovedOne: 'James Thompson', age: '85-90', care: ['MEMORY_CARE', 'SKILLED_NURSING'], budget: [7000, 10000], timeline: 'Immediate', conditions: ['Advanced Dementia', 'Heart Disease'], relationship: 'Daughter', careLevel: 'intensive', mobility: 'wheelchair', living: 'In facility', desc: 'Need to transfer my father to a better memory care facility urgently.' },
    { name: 'Karen Wilson', email: 'karen.wilson@demo.com', lovedOne: 'Robert Wilson', age: '78-82', care: ['MEMORY_CARE'], budget: [5500, 7500], timeline: 'Within 2 months', conditions: ['Lewy Body Dementia'], relationship: 'Wife', careLevel: 'intensive', mobility: 'assisted', living: 'Living with family', desc: 'My husband was recently diagnosed and needs specialized care.' },
    { name: 'Steven Moore', email: 'steven.moore@demo.com', lovedOne: 'Patricia Moore', age: '82-85', care: ['MEMORY_CARE', 'PERSONAL_CARE'], budget: [6500, 9000], timeline: 'Within 1 month', conditions: ['Vascular Dementia', 'Diabetes'], relationship: 'Son', careLevel: 'intensive', mobility: 'walker', living: 'Living alone', desc: 'Mom can no longer live safely alone due to her dementia.' },
    { name: 'Susan Jackson', email: 'susan.jackson@demo.com', lovedOne: 'William Jackson', age: '79-82', care: ['MEMORY_CARE'], budget: [5000, 7000], timeline: 'Within 3 months', conditions: ['Early Alzheimers'], relationship: 'Wife', careLevel: 'moderate', mobility: 'independent', living: 'Living with family', desc: 'Looking for a memory care program while he can still enjoy activities.' },
    { name: 'Richard Martin', email: 'richard.martin@demo.com', lovedOne: 'Elizabeth Martin', age: '84-88', care: ['MEMORY_CARE'], budget: [7500, 11000], timeline: 'Immediate', conditions: ['Advanced Alzheimers', 'Wandering'], relationship: 'Husband', careLevel: 'intensive', mobility: 'assisted', living: 'Living with family', desc: 'My wife needs a secure memory care environment with 24/7 supervision.' },
    { name: 'Michelle Young', email: 'michelle.young@demo.com', lovedOne: 'Charles Young', age: '76-80', care: ['MEMORY_CARE', 'COMPANION_CARE'], budget: [5500, 7500], timeline: 'Within 2 months', conditions: ['MCI progressing to dementia'], relationship: 'Daughter', careLevel: 'moderate', mobility: 'independent', living: 'Living alone', desc: 'Dad is showing signs of progression and needs more support.' },
    { name: 'Joseph Hall', email: 'joseph.hall@demo.com', lovedOne: 'Mary Hall', age: '81-85', care: ['MEMORY_CARE'], budget: [6000, 8500], timeline: 'Within 1 month', conditions: ['Frontotemporal Dementia'], relationship: 'Son', careLevel: 'intensive', mobility: 'walker', living: 'Living with family', desc: 'Mom has FTD and needs specialized behavioral support.' },
    { name: 'Barbara Allen', email: 'barbara.allen@demo.com', lovedOne: 'Donald Allen', age: '83-86', care: ['MEMORY_CARE', 'SKILLED_NURSING'], budget: [8000, 12000], timeline: 'Immediate', conditions: ['Alzheimers', 'Post-hip replacement'], relationship: 'Wife', careLevel: 'intensive', mobility: 'wheelchair', living: 'In hospital', desc: 'Husband recovering from surgery but dementia complicates his care.' },
    { name: 'Mark Hernandez', email: 'mark.hernandez@demo.com', lovedOne: 'Rosa Hernandez', age: '77-80', care: ['MEMORY_CARE'], budget: [5000, 6500], timeline: 'Within 3 months', conditions: ['Early-stage dementia', 'Anxiety'], relationship: 'Son', careLevel: 'moderate', mobility: 'independent', living: 'Living alone', desc: 'Looking for a Spanish-speaking memory care community for my mother.' },
    { name: 'Dorothy King', email: 'dorothy.king@demo.com', lovedOne: 'Harold King', age: '80-84', care: ['MEMORY_CARE', 'PERSONAL_CARE'], budget: [6500, 9000], timeline: 'Within 2 months', conditions: ['Mixed Dementia', 'Diabetes'], relationship: 'Wife', careLevel: 'intensive', mobility: 'assisted', living: 'Living with family', desc: 'My husband needs both memory care and help with diabetes management.' },
    { name: 'Paul Wright', email: 'paul.wright@demo.com', lovedOne: 'Louise Wright', age: '85-90', care: ['MEMORY_CARE'], budget: [7000, 10000], timeline: 'Within 1 month', conditions: ['Severe Alzheimers', 'Sundowning'], relationship: 'Son', careLevel: 'intensive', mobility: 'wheelchair', living: 'In facility', desc: 'Mom needs a facility better equipped for late-stage Alzheimers care.' },

    // Batch 3: Home Care & Other seekers (12)
    { name: 'Emily Davis', email: 'emily.davis@demo.com', lovedOne: 'George Davis', age: '75-80', care: ['LIVE_IN_CARE', 'COMPANION_CARE'], budget: [5000, 7000], timeline: 'Within 2 weeks', conditions: ['Parkinsons Disease'], relationship: 'Daughter', careLevel: 'moderate', mobility: 'assisted', living: 'Living alone', desc: 'Looking for a live-in caregiver for my father with Parkinsons.' },
    { name: 'William Lee', email: 'william.lee@demo.com', lovedOne: 'Alice Lee', age: '85-90', care: ['SKILLED_NURSING'], budget: [6000, 9000], timeline: 'Immediate', conditions: ['Post-stroke', 'Diabetes'], relationship: 'Son', careLevel: 'intensive', mobility: 'bedridden', living: 'In hospital', desc: 'Mother needs skilled nursing care after recent stroke.' },
    { name: 'Amanda Scott', email: 'amanda.scott@demo.com', lovedOne: 'Edward Scott', age: '72-75', care: ['COMPANION_CARE'], budget: [1500, 2500], timeline: 'Within 1 month', conditions: ['Mild depression', 'Loneliness'], relationship: 'Daughter', careLevel: 'minimal', mobility: 'independent', living: 'Living alone', desc: 'Dad just lost mom and needs companionship a few days a week.' },
    { name: 'Charles Miller', email: 'charles.miller@demo.com', lovedOne: 'Mary Miller', age: '75-80', care: ['PERSONAL_CARE'], budget: [2000, 3000], timeline: 'Within 3 months', conditions: ['Arthritis'], relationship: 'Son', careLevel: 'minimal', mobility: 'walker', living: 'Living alone', desc: 'Looking for affordable in-home care options for my mother.' },
    { name: 'Elizabeth White', email: 'elizabeth.white@demo.com', lovedOne: 'Charles White', age: '80-85', care: ['PERSONAL_CARE', 'COMPANION_CARE'], budget: [8000, 12000], timeline: 'Within 3 months', conditions: ['Hypertension'], relationship: 'Daughter', careLevel: 'minimal', mobility: 'independent', living: 'Living with family', desc: 'Seeking premium assisted living with resort-style amenities.' },
    { name: 'Patricia Garcia', email: 'patricia.garcia@demo.com', lovedOne: 'Joseph Garcia', age: '80-85', care: ['RESPITE_CARE'], budget: [3000, 4000], timeline: 'Within 2 weeks', conditions: ['General aging'], relationship: 'Wife', careLevel: 'moderate', mobility: 'walker', living: 'Living with family', desc: 'I need respite care while I recover from my own surgery.' },
    { name: 'Jennifer Martinez', email: 'jennifer.martinez@demo.com', lovedOne: 'Maria Martinez', age: '70-75', care: ['PERSONAL_CARE'], budget: [2500, 4000], timeline: 'Flexible', conditions: [], relationship: 'Daughter', careLevel: 'minimal', mobility: 'independent', living: 'Living alone', desc: 'Just starting to explore care options for my mother.' },
    { name: 'Robert Kim', email: 'robert.kim@demo.com', lovedOne: 'Soon-Yi Kim', age: '82-85', care: ['HOSPICE'], budget: [4000, 6000], timeline: 'Immediate', conditions: ['Terminal cancer', 'Pain management'], relationship: 'Son', careLevel: 'intensive', mobility: 'bedridden', living: 'In hospital', desc: 'Seeking compassionate hospice care for my mother.' },
    { name: 'Sandra Adams', email: 'sandra.adams@demo.com', lovedOne: 'Frank Adams', age: '78-82', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], budget: [5500, 8000], timeline: 'Within 1 month', conditions: ['CHF', 'Wound care needs'], relationship: 'Wife', careLevel: 'intensive', mobility: 'wheelchair', living: 'In hospital', desc: 'Husband needs skilled nursing with cardiac expertise.' },
    { name: 'Kevin Turner', email: 'kevin.turner@demo.com', lovedOne: 'Martha Turner', age: '88-92', care: ['PERSONAL_CARE', 'LIVE_IN_CARE'], budget: [4500, 6500], timeline: 'Within 2 weeks', conditions: ['Frailty', 'Fall risk'], relationship: 'Son', careLevel: 'moderate', mobility: 'walker', living: 'Living alone', desc: 'Mom wants to stay home but needs 24/7 support.' },
    { name: 'Lisa Robinson', email: 'lisa.robinson@demo.com', lovedOne: 'James Robinson', age: '76-80', care: ['COMPANION_CARE', 'PERSONAL_CARE'], budget: [3000, 4500], timeline: 'Within 1 month', conditions: ['Vision impairment', 'Mild dementia'], relationship: 'Daughter', careLevel: 'moderate', mobility: 'assisted', living: 'Living alone', desc: 'Dad is legally blind and needs help navigating daily life.' },
    { name: 'Anthony Phillips', email: 'anthony.phillips@demo.com', lovedOne: 'Eleanor Phillips', age: '84-88', care: ['RESPITE_CARE', 'PERSONAL_CARE'], budget: [2500, 3500], timeline: 'Within 1 week', conditions: ['Dementia', 'Incontinence'], relationship: 'Son', careLevel: 'moderate', mobility: 'assisted', living: 'Living with family', desc: 'Need emergency respite care while primary caregiver is unavailable.' },
  ];

  const families: any[] = [];
  for (let i = 0; i < familyData.length; i++) {
    const data = familyData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];
    const family = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: demoPassword,
        role: 'FAMILY',
        phone: `(${600 + Math.floor(i / 10)}) 555-${String(100 + i).padStart(4, '0')}`,
        activeMode: 'FAMILY',
        familyProfile: {
          create: {
            lovedOneName: data.lovedOne,
            ageRange: data.age,
            gender: i % 2 === 0 ? 'Female' : 'Male',
            careTypes: data.care as CareType[],
            location: loc.city,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            budgetMin: data.budget[0],
            budgetMax: data.budget[1],
            medicalConditions: data.conditions,
            profilePhoto: FAMILY_PHOTOS[i % FAMILY_PHOTOS.length],
            showProfilePhoto: true,
            livingSituation: data.living,
            relationship: data.relationship,
            careLevel: data.careLevel,
            mobilityStatus: data.mobility,
            timeline: data.timeline,
            description: data.desc,
          },
        },
      },
    });
    families.push(family);
  }
  console.log('✅ Created 36 family accounts with profiles\n');

  // ============================================================================
  // ORGANIZATION/FACILITY PROVIDER ACCOUNTS (36 total - 3x original)
  // ============================================================================
  console.log('🏥 Creating 36 organization/facility accounts...');

  const facilityData = [
    // Assisted Living (12)
    { name: 'Sunshine Manor', type: 'ASSISTED_LIVING', email: 'admin@sunshinemanor.com', desc: 'Premier assisted living community in the heart of San Diego with 24/7 care and luxury amenities.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4500, 7000], rating: 4.8, reviews: 47, years: 15, capacity: 50 },
    { name: 'Parkside Living', type: 'ASSISTED_LIVING', email: 'director@parksideliving.com', desc: 'Comfortable assisted living in Los Angeles with beautiful gardens and caring staff.', care: ['PERSONAL_CARE'], price: [3800, 5500], rating: 4.2, reviews: 23, years: 8, capacity: 35 },
    { name: 'La Jolla Estates', type: 'ASSISTED_LIVING', email: 'info@lajollaestates.com', desc: 'Luxury oceanview assisted living with resort-style amenities and personalized care.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [8000, 12000], rating: 4.9, reviews: 38, years: 12, capacity: 40 },
    { name: 'Riverside Senior Care', type: 'ASSISTED_LIVING', email: 'info@riversideseniorcare.com', desc: 'Affordable assisted living with quality care in Riverside County.', care: ['PERSONAL_CARE'], price: [2500, 3500], rating: 4.3, reviews: 19, years: 10, capacity: 30 },
    { name: 'Hillcrest Assisted Living', type: 'ASSISTED_LIVING', email: 'hr@hillcrestassisted.com', desc: 'Growing assisted living facility seeking compassionate caregivers.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4000, 6500], rating: 4.4, reviews: 28, years: 5, capacity: 45 },
    { name: 'Pacific Gardens', type: 'ASSISTED_LIVING', email: 'info@pacificgardens.com', desc: 'Beautiful assisted living with lush gardens and active lifestyle programs.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [5000, 7500], rating: 4.6, reviews: 34, years: 18, capacity: 55 },
    { name: 'Golden Years Residence', type: 'ASSISTED_LIVING', email: 'info@goldenyears.com', desc: 'Family-owned assisted living with home-like atmosphere and personalized attention.', care: ['PERSONAL_CARE'], price: [3500, 5000], rating: 4.5, reviews: 41, years: 22, capacity: 25 },
    { name: 'Sunrise Senior Living', type: 'ASSISTED_LIVING', email: 'contact@sunrisesl.com', desc: 'Modern assisted living with innovative care programs and technology.', care: ['PERSONAL_CARE', 'COMPANION_CARE', 'MEMORY_CARE'], price: [5500, 8500], rating: 4.7, reviews: 56, years: 15, capacity: 80 },
    { name: 'Coastal Comfort Care', type: 'ASSISTED_LIVING', email: 'info@coastalcomfort.com', desc: 'Beachside assisted living with ocean views and coastal activities.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [6000, 9000], rating: 4.6, reviews: 29, years: 10, capacity: 35 },
    { name: 'Mountain View Senior', type: 'ASSISTED_LIVING', email: 'info@mountainviewsenior.com', desc: 'Peaceful assisted living with scenic mountain views and nature trails.', care: ['PERSONAL_CARE'], price: [4000, 6000], rating: 4.4, reviews: 22, years: 8, capacity: 40 },
    { name: 'Heritage House', type: 'ASSISTED_LIVING', email: 'info@heritagehouse.com', desc: 'Historic mansion converted to charming assisted living with elegant dining.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [5500, 8000], rating: 4.8, reviews: 31, years: 25, capacity: 30 },
    { name: 'Serenity Springs', type: 'ASSISTED_LIVING', email: 'info@serenitysprings.com', desc: 'Tranquil assisted living with spa amenities and wellness programs.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [4500, 7000], rating: 4.5, reviews: 37, years: 12, capacity: 45 },

    // Memory Care (8)
    { name: 'Memory Haven', type: 'MEMORY_CARE', email: 'info@memoryhaven.com', desc: 'Specialized memory care facility with secure environment and dementia-trained staff.', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [6500, 9000], rating: 4.7, reviews: 33, years: 12, capacity: 35 },
    { name: 'Alzheimers Care Center', type: 'MEMORY_CARE', email: 'info@alzcenter.com', desc: 'Dedicated Alzheimers care with innovative memory programs and research partnerships.', care: ['MEMORY_CARE'], price: [7000, 10000], rating: 4.8, reviews: 42, years: 20, capacity: 50 },
    { name: 'Coastal Memory Care', type: 'MEMORY_CARE', email: 'care@coastalmemory.com', desc: 'Specialized memory care services in a secure, nurturing environment.', care: ['MEMORY_CARE', 'SKILLED_NURSING'], price: [7500, 11000], rating: 4.6, reviews: 28, years: 15, capacity: 40 },
    { name: 'Peaceful Minds', type: 'MEMORY_CARE', email: 'info@peacefulminds.com', desc: 'Person-centered memory care with Montessori-based activities.', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [6000, 8500], rating: 4.9, reviews: 51, years: 10, capacity: 30 },
    { name: 'Remember When', type: 'MEMORY_CARE', email: 'info@rememberwhen.com', desc: 'Memory care with reminiscence therapy and family engagement programs.', care: ['MEMORY_CARE'], price: [5500, 8000], rating: 4.5, reviews: 24, years: 8, capacity: 25 },
    { name: 'Clarity Care', type: 'MEMORY_CARE', email: 'info@claritycare.com', desc: 'State-of-the-art memory care with sensory stimulation programs.', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [7000, 9500], rating: 4.7, reviews: 35, years: 12, capacity: 45 },
    { name: 'Safe Harbor Memory', type: 'MEMORY_CARE', email: 'info@safeharbor.com', desc: 'Secure memory care with therapeutic gardens and music therapy.', care: ['MEMORY_CARE'], price: [6500, 9000], rating: 4.6, reviews: 29, years: 14, capacity: 35 },
    { name: 'Mindful Living', type: 'MEMORY_CARE', email: 'info@mindfulliving.com', desc: 'Holistic memory care with meditation and wellness programming.', care: ['MEMORY_CARE', 'COMPANION_CARE'], price: [6000, 8500], rating: 4.4, reviews: 21, years: 6, capacity: 28 },

    // Nursing Homes (4)
    { name: 'San Diego Skilled Nursing', type: 'NURSING_HOME', email: 'info@sdskilled.com', desc: 'Advanced skilled nursing and rehabilitation services.', care: ['SKILLED_NURSING'], price: [7000, 11000], rating: 4.6, reviews: 38, years: 25, capacity: 60 },
    { name: 'Bay View Nursing Center', type: 'NURSING_HOME', email: 'info@bayviewnursing.com', desc: 'Comprehensive nursing care with rehabilitation and long-term options.', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [7500, 12000], rating: 4.5, reviews: 44, years: 30, capacity: 80 },
    { name: 'Golden Gate Rehab', type: 'NURSING_HOME', email: 'info@goldengaterehab.com', desc: 'Premier rehabilitation center with physical, occupational, and speech therapy.', care: ['SKILLED_NURSING'], price: [8000, 13000], rating: 4.7, reviews: 52, years: 35, capacity: 100 },
    { name: 'Valley Care Nursing', type: 'NURSING_HOME', email: 'info@valleycarenursing.com', desc: 'Compassionate nursing care with specialized units for complex medical needs.', care: ['SKILLED_NURSING', 'MEMORY_CARE'], price: [6500, 10000], rating: 4.4, reviews: 31, years: 20, capacity: 70 },

    // Home Care Agencies (8)
    { name: 'CareFirst Home Services', type: 'HOME_CARE', email: 'info@carefirsthome.com', desc: 'Full-service home care agency with experienced caregivers throughout San Diego.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING', 'LIVE_IN_CARE'], price: [25, 45], rating: 4.8, reviews: 67, years: 18, capacity: 0 },
    { name: 'Specialized Care Partners', type: 'HOME_CARE', email: 'info@specializedcarepartners.com', desc: 'Specialized in-home care for dementia, Parkinsons, and post-stroke care.', care: ['PERSONAL_CARE', 'MEMORY_CARE', 'SKILLED_NURSING'], price: [30, 50], rating: 4.9, reviews: 45, years: 12, capacity: 0 },
    { name: 'Comfort Keepers LA', type: 'HOME_CARE', email: 'info@comfortkeepersla.com', desc: 'Interactive caregiving that engages seniors and improves quality of life.', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [22, 38], rating: 4.6, reviews: 89, years: 20, capacity: 0 },
    { name: 'Home Instead San Diego', type: 'HOME_CARE', email: 'info@homeinsteadsd.com', desc: 'Personalized home care with a focus on relationship-based care.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'LIVE_IN_CARE'], price: [24, 42], rating: 4.7, reviews: 112, years: 25, capacity: 0 },
    { name: 'Pacific Home Health', type: 'HOME_CARE_MEDICAL', email: 'info@pacifichomehealth.com', desc: 'Medicare-certified home health with skilled nursing and therapy services.', care: ['SKILLED_NURSING'], price: [45, 75], rating: 4.7, reviews: 56, years: 15, capacity: 0 },
    { name: 'Elite Senior Care', type: 'HOME_CARE', email: 'info@eliteseniorcare.com', desc: 'Premium home care with highly trained caregivers and concierge services.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'LIVE_IN_CARE'], price: [35, 60], rating: 4.9, reviews: 34, years: 8, capacity: 0 },
    { name: 'Loving Hearts Home Care', type: 'HOME_CARE', email: 'info@lovinghearts.com', desc: 'Affordable home care with compassionate, reliable caregivers.', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [20, 32], rating: 4.5, reviews: 78, years: 10, capacity: 0 },
    { name: 'Right at Home OC', type: 'HOME_CARE', email: 'info@rightathomeoc.com', desc: 'Quality in-home care and assistance throughout Orange County.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING'], price: [26, 44], rating: 4.6, reviews: 63, years: 18, capacity: 0 },

    // Independent Living & Hospice (4)
    { name: 'Del Mar Active Living', type: 'INDEPENDENT_LIVING', email: 'info@delmaractive.com', desc: 'Active adult community for independent seniors 55+.', care: ['COMPANION_CARE'], price: [2500, 4500], rating: 4.7, reviews: 58, years: 10, capacity: 100 },
    { name: 'Encinitas Life Plan', type: 'INDEPENDENT_LIVING', email: 'info@encinitaslifeplan.com', desc: 'Continuing care retirement community with full continuum of care.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'SKILLED_NURSING', 'MEMORY_CARE'], price: [5000, 15000], rating: 4.9, reviews: 72, years: 30, capacity: 200 },
    { name: 'Bayview Hospice', type: 'HOSPICE', email: 'info@bayviewhospice.com', desc: 'Compassionate hospice care focused on comfort and dignity.', care: ['HOSPICE'], price: [0, 0], rating: 4.8, reviews: 89, years: 20, capacity: 0 },
    { name: 'Peaceful Journey Hospice', type: 'HOSPICE', email: 'info@peacefuljourney.com', desc: 'End-of-life care with comprehensive support for patients and families.', care: ['HOSPICE'], price: [0, 0], rating: 4.9, reviews: 67, years: 15, capacity: 0 },
  ];

  const facilities: any[] = [];
  for (let i = 0; i < facilityData.length; i++) {
    const data = facilityData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];
    const photoCount = 5 + (i % 6);
    const photoSet = FACILITY_PHOTOS.slice(i % 5, (i % 5) + photoCount);

    const isHomeCare = data.type === 'HOME_CARE' || data.type === 'HOME_CARE_MEDICAL' || data.type === 'HOSPICE';

    const facility = await prisma.user.create({
      data: {
        email: data.email,
        name: `${data.name} Admin`,
        passwordHash: demoPassword,
        role: 'PROVIDER',
        phone: `(${700 + Math.floor(i / 10)}) 555-${String(1000 + i).padStart(4, '0')}`,
        activeMode: 'PROVIDER',
        provider: {
          create: {
            name: data.name,
            providerType: data.type as ProviderType,
            description: data.desc,
            email: data.email,
            phone: `(${700 + Math.floor(i / 10)}) 555-${String(1000 + i).padStart(4, '0')}`,
            website: `https://${data.name.toLowerCase().replace(/\s+/g, '')}.com`,
            address: `${100 + i * 10} ${['Main', 'Oak', 'Maple', 'Pine', 'Cedar', 'Willow'][i % 6]} ${['Street', 'Avenue', 'Boulevard', 'Drive', 'Lane'][i % 5]}`,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            latitude: loc.lat + (Math.random() - 0.5) * 0.05,
            longitude: loc.lng + (Math.random() - 0.5) * 0.05,
            serviceRadius: isHomeCare ? 25 + (i % 20) : undefined,
            careTypesOffered: data.care as CareType[],
            licensed: true,
            licenseNumber: `CA-${data.type.substring(0, 3)}-${String(10000 + i * 111).padStart(5, '0')}`,
            yearsInBusiness: data.years,
            capacity: data.capacity > 0 ? data.capacity : undefined,
            priceMin: data.price[0],
            priceMax: data.price[1],
            priceDescription: isHomeCare ? 'Per hour rates. Live-in and overnight care available.' : undefined,
            photos: photoSet,
            coverPhoto: photoSet[0],
            roomFeatures: !isHomeCare ? ['Private rooms', 'WiFi', 'Emergency call system', 'Cable TV'] : undefined,
            commonAreas: !isHomeCare ? ['Dining room', 'Activity room', 'Garden', 'Library'] : undefined,
            medicalServices: ['Medication management', '24/7 nursing', 'Physical therapy'],
            activitiesOffered: ['Exercise classes', 'Arts and crafts', 'Music therapy', 'Social events'],
            dietaryOptions: ['Vegetarian', 'Diabetic-friendly', 'Heart-healthy'],
            staffToResidentRatio: !isHomeCare && data.capacity > 0 ? `1:${Math.floor(data.capacity / 8)}` : undefined,
            languagesSpoken: ['English', 'Spanish'],
            averageRating: data.rating,
            reviewCount: data.reviews,
            claimed: true,
            verified: true,
            active: true,
            availableForFamilies: true,
            availableForOrganizations: isHomeCare,
          },
        },
      },
    });
    facilities.push(facility);
  }
  console.log('✅ Created 36 organization/facility accounts\n');

  // ============================================================================
  // INDIVIDUAL CAREGIVER ACCOUNTS (18 total - 3x original)
  // ============================================================================
  console.log('👨‍⚕️ Creating 18 individual caregiver accounts...');

  const caregiverData = [
    { name: 'Maria Santos', email: 'maria.santos@demo.com', desc: '10+ years of experience providing compassionate in-home care. Specialized in dementia care and companionship.', care: ['COMPANION_CARE', 'PERSONAL_CARE', 'MEMORY_CARE', 'LIVE_IN_CARE'], price: [25, 35], certs: ['CNA', 'CPR', 'First Aid', 'Dementia Care Specialist'], langs: ['English', 'Spanish', 'Tagalog'], rating: 4.9, reviews: 28, years: 10, seeksFamilies: true, seeksOrgs: false },
    { name: 'John Peterson', email: 'john.peterson@demo.com', desc: 'Certified dementia care specialist with 8 years experience. Patient, calm approach to memory care.', care: ['MEMORY_CARE', 'COMPANION_CARE', 'PERSONAL_CARE'], price: [28, 38], certs: ['CNA', 'Dementia Care Specialist', 'Alzheimers Care Training'], langs: ['English'], rating: 4.8, reviews: 22, years: 8, seeksFamilies: true, seeksOrgs: false },
    { name: 'Rachel Thompson', email: 'rachel.thompson@demo.com', desc: 'Registered Nurse providing skilled in-home nursing care. Post-surgical care, wound care, medication management.', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [45, 65], certs: ['RN', 'IV Certification', 'Wound Care Specialist', 'CPR'], langs: ['English', 'Spanish'], rating: 5.0, reviews: 15, years: 15, seeksFamilies: true, seeksOrgs: false },
    { name: 'Angela Brooks', email: 'angela.brooks@demo.com', desc: 'Experienced caregiver seeking full-time employment at assisted living facility. 5 years experience.', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [20, 28], certs: ['CNA', 'CPR', 'First Aid'], langs: ['English'], rating: 4.5, reviews: 12, years: 5, seeksFamilies: false, seeksOrgs: true },
    { name: 'Nancy Foster', email: 'nancy.foster@demo.com', desc: 'Memory care specialist seeking position at memory care facility. 7 years experience with dementia patients.', care: ['MEMORY_CARE', 'PERSONAL_CARE'], price: [26, 34], certs: ['CNA', 'Dementia Care Specialist', 'Memory Care Training'], langs: ['English', 'Spanish'], rating: 4.7, reviews: 18, years: 7, seeksFamilies: false, seeksOrgs: true },
    { name: 'Susan Williams', email: 'susan.williams@demo.com', desc: 'Part-time companion caregiver. Great for light housekeeping, meal prep, and companionship.', care: ['COMPANION_CARE'], price: [20, 28], certs: ['CPR', 'First Aid'], langs: ['English'], rating: 4.4, reviews: 9, years: 3, seeksFamilies: true, seeksOrgs: false },
    { name: 'Carlos Mendez', email: 'carlos.mendez@demo.com', desc: 'Bilingual caregiver with expertise in diabetes care and mobility assistance. Very patient and kind.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [24, 32], certs: ['CNA', 'CPR', 'Diabetes Care'], langs: ['English', 'Spanish'], rating: 4.8, reviews: 24, years: 6, seeksFamilies: true, seeksOrgs: true },
    { name: 'Grace Kim', email: 'grace.kim@demo.com', desc: 'Night shift specialist with nursing home experience. Calm demeanor perfect for overnight care.', care: ['PERSONAL_CARE', 'COMPANION_CARE', 'LIVE_IN_CARE'], price: [28, 40], certs: ['CNA', 'CPR', 'First Aid'], langs: ['English', 'Korean'], rating: 4.6, reviews: 16, years: 9, seeksFamilies: true, seeksOrgs: true },
    { name: 'David Wong', email: 'david.wong@demo.com', desc: 'Male caregiver specializing in mobility assistance and companionship for male seniors.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [25, 35], certs: ['CNA', 'CPR', 'Transfer Techniques'], langs: ['English', 'Cantonese', 'Mandarin'], rating: 4.7, reviews: 19, years: 7, seeksFamilies: true, seeksOrgs: false },
    { name: 'Elena Rodriguez', email: 'elena.rodriguez@demo.com', desc: 'Hospice and palliative care specialist. Provides compassionate end-of-life care and family support.', care: ['HOSPICE', 'PERSONAL_CARE', 'COMPANION_CARE'], price: [30, 45], certs: ['CNA', 'Hospice Care Certified', 'CPR'], langs: ['English', 'Spanish'], rating: 4.9, reviews: 31, years: 12, seeksFamilies: true, seeksOrgs: false },
    { name: 'Michelle Lee', email: 'michelle.lee@demo.com', desc: 'Certified nursing assistant with pediatric and geriatric experience. Very energetic and engaging.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [23, 31], certs: ['CNA', 'CPR', 'First Aid', 'Pediatric Care'], langs: ['English', 'Vietnamese'], rating: 4.6, reviews: 14, years: 5, seeksFamilies: true, seeksOrgs: true },
    { name: 'Robert Johnson', email: 'robert.johnson.cg@demo.com', desc: 'Former EMT turned caregiver. Excellent at handling medical emergencies and wound care.', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [32, 48], certs: ['EMT', 'CNA', 'CPR', 'Wound Care'], langs: ['English'], rating: 4.8, reviews: 21, years: 10, seeksFamilies: true, seeksOrgs: false },
    { name: 'Patricia Nguyen', email: 'patricia.nguyen@demo.com', desc: 'Gentle caregiver specializing in Parkinsons care and physical therapy assistance.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], price: [26, 36], certs: ['CNA', 'CPR', 'Parkinsons Care'], langs: ['English', 'Vietnamese'], rating: 4.7, reviews: 17, years: 8, seeksFamilies: true, seeksOrgs: false },
    { name: 'James Miller', email: 'james.miller.cg@demo.com', desc: 'Experienced with behavioral challenges in dementia. Calm, patient approach.', care: ['MEMORY_CARE', 'PERSONAL_CARE', 'COMPANION_CARE'], price: [28, 40], certs: ['CNA', 'Dementia Care', 'Behavioral Management'], langs: ['English'], rating: 4.5, reviews: 13, years: 6, seeksFamilies: true, seeksOrgs: true },
    { name: 'Linda Davis', email: 'linda.davis.cg@demo.com', desc: 'Retired LVN offering quality home care. Excellent medication management and health monitoring.', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [35, 50], certs: ['LVN', 'CPR', 'Medication Management'], langs: ['English', 'Spanish'], rating: 4.9, reviews: 26, years: 20, seeksFamilies: true, seeksOrgs: false },
    { name: 'Thomas Garcia', email: 'thomas.garcia@demo.com', desc: 'Active caregiver who loves taking seniors on outings and keeping them engaged.', care: ['COMPANION_CARE', 'PERSONAL_CARE'], price: [22, 30], certs: ['CPR', 'First Aid', 'Activities Coordinator'], langs: ['English', 'Spanish'], rating: 4.6, reviews: 11, years: 4, seeksFamilies: true, seeksOrgs: false },
    { name: 'Jennifer White', email: 'jennifer.white.cg@demo.com', desc: 'Specialized in post-hospital transition care. Helps seniors recover safely at home.', care: ['SKILLED_NURSING', 'PERSONAL_CARE'], price: [30, 42], certs: ['CNA', 'CPR', 'Post-Acute Care'], langs: ['English'], rating: 4.7, reviews: 20, years: 9, seeksFamilies: true, seeksOrgs: false },
    { name: 'Amanda Chen', email: 'amanda.chen@demo.com', desc: 'Overnight and weekend specialist. Reliable and trustworthy for families needing coverage.', care: ['PERSONAL_CARE', 'COMPANION_CARE', 'LIVE_IN_CARE'], price: [24, 35], certs: ['CNA', 'CPR', 'First Aid'], langs: ['English', 'Mandarin'], rating: 4.5, reviews: 15, years: 5, seeksFamilies: true, seeksOrgs: true },
  ];

  const caregivers: any[] = [];
  for (let i = 0; i < caregiverData.length; i++) {
    const data = caregiverData[i];
    const loc = CA_LOCATIONS[i % CA_LOCATIONS.length];

    const caregiver = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: demoPassword,
        role: 'PROVIDER',
        phone: `(${800 + Math.floor(i / 10)}) 555-${String(2000 + i).padStart(4, '0')}`,
        activeMode: 'PROVIDER',
        provider: {
          create: {
            name: `${data.name} - ${data.certs[0]} Caregiver`,
            providerType: 'INDEPENDENT_CAREGIVER',
            description: data.desc,
            email: data.email,
            phone: `(${800 + Math.floor(i / 10)}) 555-${String(2000 + i).padStart(4, '0')}`,
            address: `${loc.city} Area`,
            city: loc.city,
            state: loc.state,
            zipCode: loc.zip,
            serviceRadius: 15 + (i % 15),
            careTypesOffered: data.care as CareType[],
            licensed: true,
            licenseNumber: `CA-CG-${String(20000 + i * 111).padStart(5, '0')}`,
            yearsInBusiness: data.years,
            priceMin: data.price[0],
            priceMax: data.price[1],
            priceDescription: 'Per hour. Overnight and live-in rates available.',
            photos: [CAREGIVER_PHOTOS[i % CAREGIVER_PHOTOS.length]],
            certifications: data.certs,
            languagesSpoken: data.langs,
            backgroundChecked: true,
            averageRating: data.rating,
            reviewCount: data.reviews,
            claimed: true,
            verified: true,
            active: true,
            availableForFamilies: data.seeksFamilies,
            availableForOrganizations: data.seeksOrgs,
          },
        },
      },
    });
    caregivers.push(caregiver);
  }
  console.log('✅ Created 18 individual caregiver accounts\n');

  // ============================================================================
  // UNCLAIMED PROVIDERS (for claiming flow testing)
  // ============================================================================
  console.log('🏢 Creating 4 unclaimed providers...');

  const unclaimedData = [
    { name: 'Bay Area Senior Living', type: 'ASSISTED_LIVING', city: 'San Jose', state: 'CA', zip: '95110', desc: 'A welcoming community for seniors in the heart of San Jose.', care: ['PERSONAL_CARE', 'COMPANION_CARE'], rating: 4.3, reviews: 12, lat: 37.3382, lng: -121.8863 },
    { name: 'Coastal Memory Care', type: 'MEMORY_CARE', city: 'Santa Monica', state: 'CA', zip: '90401', desc: 'Specialized memory care services in a secure, nurturing environment.', care: ['MEMORY_CARE', 'SKILLED_NURSING'], rating: 4.6, reviews: 8, lat: 34.0195, lng: -118.4912 },
    { name: 'Valley Senior Home', type: 'ASSISTED_LIVING', city: 'Fresno', state: 'CA', zip: '93701', desc: 'Affordable senior living in the heart of the Central Valley.', care: ['PERSONAL_CARE'], rating: 4.1, reviews: 15, lat: 36.7378, lng: -119.7871 },
    { name: 'Sacramento Care Center', type: 'NURSING_HOME', city: 'Sacramento', state: 'CA', zip: '95814', desc: 'Full-service nursing care and rehabilitation in the capital.', care: ['SKILLED_NURSING'], rating: 4.4, reviews: 22, lat: 38.5816, lng: -121.4944 },
  ];

  for (let i = 0; i < unclaimedData.length; i++) {
    const data = unclaimedData[i];
    await prisma.provider.create({
      data: {
        name: data.name,
        providerType: data.type as ProviderType,
        description: data.desc,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
        address: `${200 + i * 100} Care Street`,
        phone: `(${900 + i}) 555-${String(3000 + i).padStart(4, '0')}`,
        email: `info@${data.name.toLowerCase().replace(/\s+/g, '')}.example.com`,
        careTypesOffered: data.care as CareType[],
        coverPhoto: FACILITY_PHOTOS[i % FACILITY_PHOTOS.length],
        photos: FACILITY_PHOTOS.slice(i, i + 3),
        averageRating: data.rating,
        reviewCount: data.reviews,
        latitude: data.lat,
        longitude: data.lng,
        claimed: false,
        verified: false,
        active: true,
      },
    });
  }
  console.log('✅ Created 4 unclaimed providers\n');

  // ============================================================================
  // ENGAGEMENT DATA (Consultations, Messages, Tours)
  // ============================================================================
  console.log('💬 Creating extensive engagement data...\n');

  const familyProfiles = await prisma.familyProfile.findMany({
    select: { id: true, userId: true },
  });
  const providers = await prisma.provider.findMany({
    select: { id: true, userId: true, providerType: true },
  });

  // Create 30 consultation requests with varied statuses
  const requestStatuses: ConsultRequestStatus[] = ['PENDING', 'ACCEPTED', 'COMPLETED', 'DECLINED'];
  const requests: any[] = [];

  for (let i = 0; i < 30; i++) {
    const familyProfile = familyProfiles[i % familyProfiles.length];
    const provider = providers.filter(p => p.userId !== null)[i % 20];
    const status = requestStatuses[i % 4];
    const daysAgo = Math.floor(Math.random() * 14);

    const request = await prisma.consultRequest.create({
      data: {
        senderId: families[i % families.length].id,
        familyProfileId: familyProfile.id,
        providerId: provider.id,
        requestType: i % 3 === 0 ? 'HIRING' : 'CONSULTATION',
        message: `Hello, I am interested in learning more about your services for my ${i % 2 === 0 ? 'mother' : 'father'}. ${i % 3 === 0 ? 'When can we schedule a tour?' : 'What availability do you have?'}`,
        status,
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });
    requests.push(request);

    // Add messages to accepted/completed requests
    if (status === 'ACCEPTED' || status === 'COMPLETED') {
      const providerUser = await prisma.user.findFirst({
        where: { provider: { id: provider.id } },
      });

      if (providerUser) {
        await prisma.message.createMany({
          data: [
            {
              consultRequestId: request.id,
              senderId: providerUser.id,
              content: 'Thank you for your interest! I would be happy to tell you more about our services. When would be a good time for a tour?',
              createdAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000),
              status: 'READ',
              readAt: new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000 + 3600000),
            },
            {
              consultRequestId: request.id,
              senderId: families[i % families.length].id,
              content: 'That sounds great! How about this week? I am flexible with timing.',
              createdAt: new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000),
              status: 'READ',
              readAt: new Date(Date.now() - (daysAgo - 2) * 24 * 60 * 60 * 1000 + 1800000),
            },
          ],
        });

        // Add tour appointments to some requests
        if (i % 5 === 0 && status === 'ACCEPTED') {
          await prisma.tourAppointment.create({
            data: {
              requestId: request.id,
              proposedBy: providerUser.id,
              proposedDate: new Date(Date.now() + (7 - i % 7) * 24 * 60 * 60 * 1000),
              proposedTime: `${10 + (i % 5)}:00 ${i % 2 === 0 ? 'AM' : 'PM'}`,
              status: 'ACCEPTED',
              notes: 'Looking forward to meeting you!',
            },
          });
        }
      }
    }
  }

  // Create saved providers
  for (let i = 0; i < 40; i++) {
    const familyProfile = familyProfiles[i % familyProfiles.length];
    const provider = providers[i % providers.length];

    try {
      await prisma.savedProvider.create({
        data: {
          familyProfileId: familyProfile.id,
          providerId: provider.id,
          notes: ['Top choice', 'Backup option', 'Need to visit', 'Great reviews', 'Good location'][i % 5],
        },
      });
    } catch (e) {
      // Ignore duplicate key errors
    }
  }

  console.log('✅ Created engagement data:');
  console.log('   - 30 consultation/hiring requests');
  console.log('   - 40+ messages across conversations');
  console.log('   - 6 scheduled tours');
  console.log('   - 40 saved providers\n');

  console.log('📊 MEGA Seed Summary:');
  console.log('   - 36 family accounts (all with photos)');
  console.log('   - 36 organization/facility accounts (all with multiple photos)');
  console.log('   - 18 individual caregiver accounts (all with photos)');
  console.log('   - 4 unclaimed providers for claiming flow');
  console.log('   - 90+ total user accounts');
  console.log('   - Password for all accounts: demo123\n');

  console.log('✅ MEGA seed completed successfully!\n');
}

// Export main for use in API routes
export { main };

// Only run if this file is executed directly (CLI mode)
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Error seeding database:', e);
      process.exit(1);
    })
    .finally(async () => {
      // Only disconnect the local prisma client in CLI mode
      await localPrisma.$disconnect();
    });
}
