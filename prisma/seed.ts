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

  // Additional Family Users
  const familyUser4 = await prisma.user.create({
    data: {
      email: 'david.wilson@example.com',
      name: 'David Wilson',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 444-5555',
      activeMode: 'FAMILY',
    },
  });

  const familyUser5 = await prisma.user.create({
    data: {
      email: 'emily.davis@example.com',
      name: 'Emily Davis',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 555-6666',
      activeMode: 'FAMILY',
    },
  });

  const familyUser6 = await prisma.user.create({
    data: {
      email: 'robert.martinez@example.com',
      name: 'Robert Martinez',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 666-7777',
      activeMode: 'FAMILY',
    },
  });

  const familyUser7 = await prisma.user.create({
    data: {
      email: 'linda.garcia@example.com',
      name: 'Linda Garcia',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 777-8888',
      activeMode: 'FAMILY',
    },
  });

  const familyUser8 = await prisma.user.create({
    data: {
      email: 'james.rodriguez@example.com',
      name: 'James Rodriguez',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 888-9999',
      activeMode: 'FAMILY',
    },
  });

  const familyUser9 = await prisma.user.create({
    data: {
      email: 'patricia.lee@example.com',
      name: 'Patricia Lee',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 999-0000',
      activeMode: 'FAMILY',
    },
  });

  const familyUser10 = await prisma.user.create({
    data: {
      email: 'william.taylor@example.com',
      name: 'William Taylor',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 101-0101',
      activeMode: 'FAMILY',
    },
  });

  const familyUser11 = await prisma.user.create({
    data: {
      email: 'maria.anderson@example.com',
      name: 'Maria Anderson',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 202-0202',
      activeMode: 'FAMILY',
    },
  });

  const familyUser12 = await prisma.user.create({
    data: {
      email: 'thomas.thomas@example.com',
      name: 'Thomas Thomas',
      passwordHash: demoPassword,
      role: 'FAMILY',
      phone: '(555) 303-0303',
      activeMode: 'FAMILY',
    },
  });

  // Additional Provider Users
  const providerUser3 = await prisma.user.create({
    data: {
      email: 'admin@memorylane.com',
      name: 'Memory Lane Admin',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 456-7890',
      activeMode: 'PROVIDER',
    },
  });

  const providerUser4 = await prisma.user.create({
    data: {
      email: 'contact@caringhands.com',
      name: 'Caring Hands Coordinator',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 345-6789',
      activeMode: 'PROVIDER',
    },
  });

  const providerUser5 = await prisma.user.create({
    data: {
      email: 'info@peacefultransitions.org',
      name: 'Peaceful Transitions',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 567-8901',
      activeMode: 'PROVIDER',
    },
  });

  const providerUser6 = await prisma.user.create({
    data: {
      email: 'admin@compassionatecare.com',
      name: 'Compassionate Care Admin',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 111-2222',
      activeMode: 'PROVIDER',
    },
  });

  const providerUser7 = await prisma.user.create({
    data: {
      email: 'director@harborview.com',
      name: 'Harbor View Director',
      passwordHash: demoPassword,
      role: 'PROVIDER',
      phone: '(555) 333-4444',
      activeMode: 'PROVIDER',
    },
  });

  console.log('✅ Created 19 users (12 families, 7 providers)');

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
    // Additional Home Care Providers
    {
      name: "Compassionate Care Services",
      providerType: ProviderType.HOME_CARE,
      description: "Family-owned home care agency providing personalized care plans. Our caregivers become like family, offering companionship and professional assistance with daily living.",
      email: "info@compassionatecare.com",
      phone: "(555) 111-2222",
      website: "https://compassionatecare.com",
      address: "2345 Care Boulevard",
      city: "San Jose",
      state: "CA",
      zipCode: "95110",
      serviceRadius: 20,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE, CareType.RESPITE_CARE],
      licensed: true,
      licenseNumber: "CA-HC-66666",
      yearsInBusiness: 8,
      capacity: 40,
      userId: providerUser6.id,
    },
    {
      name: "Always There Home Care",
      providerType: ProviderType.HOME_CARE,
      description: "24/7 home care services with a focus on quality of life. We provide live-in care, hourly care, and specialized dementia support.",
      email: "contact@alwaystherehc.com",
      phone: "(555) 222-3333",
      website: "https://alwaystherehomecare.com",
      address: "567 Main Plaza",
      city: "Long Beach",
      state: "CA",
      zipCode: "90802",
      serviceRadius: 30,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE, CareType.MEMORY_CARE],
      licensed: true,
      licenseNumber: "CA-HC-77777",
      yearsInBusiness: 11,
      capacity: 65,
    },
    {
      name: "Golden Heart Home Care",
      providerType: ProviderType.HOME_CARE,
      description: "Trusted home care provider serving families for over 20 years. Bilingual staff available. Specialized in post-hospital care and chronic condition management.",
      email: "help@goldenheart.com",
      phone: "(555) 444-5555",
      address: "890 Golden Avenue",
      city: "Riverside",
      state: "CA",
      zipCode: "92501",
      serviceRadius: 35,
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.SKILLED_NURSING, CareType.RESPITE_CARE],
      licensed: true,
      licenseNumber: "CA-HC-88888",
      yearsInBusiness: 22,
      capacity: 80,
    },
    // Additional Assisted Living Facilities
    {
      name: "Harbor View Assisted Living",
      providerType: ProviderType.ASSISTED_LIVING,
      description: "Luxury assisted living with ocean views. Private suites, gourmet dining, fitness center, and spa services. Resort-style living with professional care.",
      email: "admissions@harborview.com",
      phone: "(555) 333-4444",
      website: "https://harborviewassisted.com",
      address: "1200 Harbor Drive",
      city: "Santa Barbara",
      state: "CA",
      zipCode: "93101",
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.MEMORY_CARE],
      licensed: true,
      licenseNumber: "CA-AL-99999",
      yearsInBusiness: 12,
      capacity: 95,
      userId: providerUser7.id,
    },
    {
      name: "Serenity Gardens Assisted Living",
      providerType: ProviderType.ASSISTED_LIVING,
      description: "Intimate assisted living community with beautiful gardens and outdoor spaces. Focus on wellness, social engagement, and personalized care plans.",
      email: "info@serenitygardens.com",
      phone: "(555) 666-7777",
      website: "https://serenitygardensca.com",
      address: "450 Garden Lane",
      city: "Pasadena",
      state: "CA",
      zipCode: "91101",
      careTypesOffered: [CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-AL-10001",
      yearsInBusiness: 9,
      capacity: 55,
    },
    {
      name: "Evergreen Senior Living",
      providerType: ProviderType.ASSISTED_LIVING,
      description: "Affordable assisted living with exceptional care. Studio and shared apartments available. Transportation services, activities program, and three nutritious meals daily.",
      email: "director@evergreensrliving.com",
      phone: "(555) 777-8888",
      address: "3300 Evergreen Road",
      city: "Modesto",
      state: "CA",
      zipCode: "95350",
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.COMPANION_CARE],
      licensed: true,
      licenseNumber: "CA-AL-10002",
      yearsInBusiness: 16,
      capacity: 70,
    },
    // Additional Memory Care Facilities
    {
      name: "Willow Brook Memory Care",
      providerType: ProviderType.MEMORY_CARE,
      description: "State-of-the-art memory care with secure outdoor areas and sensory therapy rooms. Staff specially trained in dementia care using person-centered approach.",
      email: "info@willowbrookmc.com",
      phone: "(555) 888-9999",
      website: "https://willowbrookmemorycare.com",
      address: "2100 Willow Street",
      city: "Irvine",
      state: "CA",
      zipCode: "92602",
      careTypesOffered: [CareType.MEMORY_CARE, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-MC-10003",
      yearsInBusiness: 7,
      capacity: 45,
    },
    {
      name: "Sunrise Memory Support Center",
      providerType: ProviderType.MEMORY_CARE,
      description: "Comprehensive memory care program with music therapy, art therapy, and cognitive stimulation. Beautiful, safe environment designed specifically for dementia residents.",
      email: "admissions@sunrisememory.com",
      phone: "(555) 999-0000",
      address: "678 Sunrise Boulevard",
      city: "Ventura",
      state: "CA",
      zipCode: "93001",
      careTypesOffered: [CareType.MEMORY_CARE],
      licensed: true,
      licenseNumber: "CA-MC-10004",
      yearsInBusiness: 13,
      capacity: 52,
    },
    // Additional Nursing Homes
    {
      name: "Lakeside Skilled Nursing",
      providerType: ProviderType.NURSING_HOME,
      description: "Full-service skilled nursing facility with registered nurses on duty 24/7. Physical therapy gym, wound care specialists, and post-surgical recovery programs.",
      email: "intake@lakesidenursing.com",
      phone: "(555) 101-0101",
      website: "https://lakesideskillednursing.com",
      address: "5678 Lake Avenue",
      city: "Stockton",
      state: "CA",
      zipCode: "95202",
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE, CareType.MEMORY_CARE],
      licensed: true,
      licenseNumber: "CA-NH-10005",
      yearsInBusiness: 30,
      capacity: 140,
    },
    {
      name: "Valley View Nursing Center",
      providerType: ProviderType.NURSING_HOME,
      description: "Medicare and Medicaid certified nursing home offering skilled nursing, rehabilitation, and long-term care. Dietician-approved meals and activities program.",
      email: "admin@valleyviewnursing.com",
      phone: "(555) 202-0202",
      address: "4321 Valley Road",
      city: "Bakersfield",
      state: "CA",
      zipCode: "93301",
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-NH-10006",
      yearsInBusiness: 28,
      capacity: 110,
    },
    // Additional Home Health Agencies
    {
      name: "Premier Home Health Services",
      providerType: ProviderType.HOME_HEALTH,
      description: "Medicare-certified home health providing skilled nursing, physical therapy, occupational therapy, and speech therapy. Serving patients in the comfort of home.",
      email: "referrals@premierhomehealth.com",
      phone: "(555) 303-0303",
      website: "https://premierhhs.com",
      address: "1111 Health Plaza",
      city: "Santa Rosa",
      state: "CA",
      zipCode: "95401",
      serviceRadius: 40,
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-HH-10007",
      yearsInBusiness: 19,
      capacity: 150,
    },
    // Additional Hospice Providers
    {
      name: "Comfort Care Hospice",
      providerType: ProviderType.HOSPICE,
      description: "Compassionate hospice care focused on pain management, symptom control, and emotional support. Available 24/7 for patients and families during end-of-life journey.",
      email: "care@comfortcarehospice.org",
      phone: "(555) 404-0404",
      website: "https://comfortcarehospice.org",
      address: "2222 Comfort Way",
      city: "San Mateo",
      state: "CA",
      zipCode: "94401",
      serviceRadius: 50,
      careTypesOffered: [CareType.HOSPICE_CARE, CareType.SKILLED_NURSING],
      licensed: true,
      licenseNumber: "CA-HP-10008",
      yearsInBusiness: 16,
    },
    // Additional Rehabilitation Centers
    {
      name: "Recovery Plus Rehabilitation",
      providerType: ProviderType.REHABILITATION,
      description: "Specialized rehabilitation center for stroke recovery, orthopedic surgery recovery, and cardiac rehabilitation. State-of-the-art therapy equipment.",
      email: "admissions@recoveryplus.com",
      phone: "(555) 505-0505",
      website: "https://recoveryplusrehab.com",
      address: "3333 Recovery Road",
      city: "Thousand Oaks",
      state: "CA",
      zipCode: "91360",
      careTypesOffered: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE],
      licensed: true,
      licenseNumber: "CA-RH-10009",
      yearsInBusiness: 11,
      capacity: 50,
    },
    // Independent Caregivers
    {
      name: "Maria Santos - Certified Caregiver",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "Certified caregiver with 12 years experience specializing in Alzheimer's and dementia care. Bilingual (English/Spanish). References available. CPR certified.",
      email: "maria.santos.care@email.com",
      phone: "(555) 606-0606",
      address: "Home-based service",
      city: "San Diego",
      state: "CA",
      zipCode: "92101",
      serviceRadius: 20,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE, CareType.MEMORY_CARE],
      licensed: false,
      yearsInBusiness: 12,
    },
    {
      name: "David Thompson - Senior Companion",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "Experienced male caregiver available for companionship, transportation, light housekeeping, and meal preparation. Great with veterans. Non-smoker, reliable vehicle.",
      email: "david.thompson.care@email.com",
      phone: "(555) 707-0707",
      address: "Home-based service",
      city: "Sacramento",
      state: "CA",
      zipCode: "95814",
      serviceRadius: 25,
      careTypesOffered: [CareType.COMPANION_CARE],
      licensed: false,
      yearsInBusiness: 6,
    },
    {
      name: "Elena Rodriguez - Home Care Specialist",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "CNA certified with experience in post-operative care, wound care, and diabetes management. Available for overnight shifts. Excellent references from families.",
      email: "elena.rodriguez.care@email.com",
      phone: "(555) 808-0808",
      address: "Home-based service",
      city: "Fresno",
      state: "CA",
      zipCode: "93650",
      serviceRadius: 15,
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.SKILLED_NURSING],
      licensed: false,
      yearsInBusiness: 9,
    },
    {
      name: "Robert Kim - Caregiver & Companion",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "Compassionate caregiver with background in physical therapy assistance. Help with mobility, exercises, and daily activities. Patient and encouraging approach.",
      email: "robert.kim.care@email.com",
      phone: "(555) 909-0909",
      address: "Home-based service",
      city: "Oakland",
      state: "CA",
      zipCode: "94601",
      serviceRadius: 10,
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE],
      licensed: false,
      yearsInBusiness: 5,
    },
    {
      name: "Angela Martinez - Senior Care Expert",
      providerType: ProviderType.INDEPENDENT_CAREGIVER,
      description: "20+ years nursing experience now providing private care. Specialized in Parkinson's, stroke recovery, and end-of-life care. Calm, professional, compassionate.",
      email: "angela.martinez.care@email.com",
      phone: "(555) 111-3333",
      address: "Home-based service",
      city: "Santa Clara",
      state: "CA",
      zipCode: "95050",
      serviceRadius: 18,
      careTypesOffered: [CareType.PERSONAL_CARE, CareType.SKILLED_NURSING, CareType.HOSPICE_CARE],
      licensed: false,
      yearsInBusiness: 20,
    },
    // Additional Independent Living
    {
      name: "Sunset Ridge Independent Living",
      providerType: ProviderType.INDEPENDENT_LIVING,
      description: "Active adult community for seniors 55+. Apartments and cottages, resort-style amenities, social activities, fitness center, and optional dining services.",
      email: "leasing@sunsetridge.com",
      phone: "(555) 222-4444",
      website: "https://sunsetridgeliving.com",
      address: "7777 Ridge Avenue",
      city: "Carlsbad",
      state: "CA",
      zipCode: "92008",
      careTypesOffered: [CareType.COMPANION_CARE],
      licensed: true,
      licenseNumber: "CA-IL-10010",
      yearsInBusiness: 8,
      capacity: 120,
    },
    {
      name: "Pacific Gardens Senior Community",
      providerType: ProviderType.INDEPENDENT_LIVING,
      description: "Maintenance-free living for independent seniors. Beautiful grounds, clubhouse, pool, organized trips, and events. Pet-friendly community.",
      email: "info@pacificgardens.com",
      phone: "(555) 333-5555",
      address: "8888 Pacific Way",
      city: "Monterey",
      state: "CA",
      zipCode: "93940",
      careTypesOffered: [CareType.COMPANION_CARE],
      licensed: true,
      licenseNumber: "CA-IL-10011",
      yearsInBusiness: 14,
      capacity: 85,
    },
    // Adult Day Care (using HOME_CARE type)
    {
      name: "Bright Days Adult Day Center",
      providerType: ProviderType.HOME_CARE,
      description: "Daytime care and activities for seniors. Social engagement, nutritious meals, health monitoring, and transportation services. Give caregivers a break while loved ones stay active.",
      email: "contact@brightdaysadc.com",
      phone: "(555) 444-6666",
      website: "https://brightdaysadultdaycare.com",
      address: "9999 Sunshine Street",
      city: "Chula Vista",
      state: "CA",
      zipCode: "91910",
      careTypesOffered: [CareType.COMPANION_CARE, CareType.PERSONAL_CARE, CareType.RESPITE_CARE],
      licensed: true,
      licenseNumber: "CA-ADC-10012",
      yearsInBusiness: 10,
      capacity: 35,
    },
  ];

  const createdProviders: any[] = [];
  for (const provider of providers) {
    const created = await prisma.provider.create({
      data: provider,
    });
    createdProviders.push(created);
  }

  console.log('✅ Created 30 providers');

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

  const familyProfile4 = await prisma.familyProfile.create({
    data: {
      userId: familyUser4.id,
      relationship: 'Son',
      location: 'San Diego, CA',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      description: 'Looking for respite care for my mother while I travel for work. She is 85, has mild arthritis, and needs companionship and help with meals 2-3 days per week.',
      careTypes: [CareType.COMPANION_CARE, CareType.RESPITE_CARE],
      careUrgency: 'FLEXIBLE',
      budgetMin: 2000,
      budgetMax: 3500,
    },
  });

  const familyProfile5 = await prisma.familyProfile.create({
    data: {
      userId: familyUser5.id,
      relationship: 'Daughter',
      location: 'Santa Barbara, CA',
      city: 'Santa Barbara',
      state: 'CA',
      zipCode: '93101',
      description: 'Seeking luxury assisted living for my 80-year-old father who is a retired executive. He wants upscale amenities, gourmet meals, and an active social calendar.',
      careTypes: [CareType.PERSONAL_CARE],
      careUrgency: 'WITHIN_MONTH',
      budgetMin: 7000,
      budgetMax: 12000,
    },
  });

  const familyProfile6 = await prisma.familyProfile.create({
    data: {
      userId: familyUser6.id,
      relationship: 'Son',
      location: 'Fresno, CA',
      city: 'Fresno',
      state: 'CA',
      zipCode: '93650',
      description: 'My father (73) recently had a stroke and needs skilled nursing care and physical therapy. Looking for a facility with rehabilitation services.',
      careTypes: [CareType.SKILLED_NURSING],
      careUrgency: 'URGENT',
      budgetMin: 6000,
      budgetMax: 9000,
    },
  });

  const familyProfile7 = await prisma.familyProfile.create({
    data: {
      userId: familyUser7.id,
      relationship: 'Daughter',
      location: 'Oakland, CA',
      city: 'Oakland',
      state: 'CA',
      zipCode: '94601',
      description: 'Need hospice care for my mother who has terminal cancer. Looking for compassionate end-of-life care that focuses on comfort and dignity.',
      careTypes: [CareType.HOSPICE_CARE],
      careUrgency: 'IMMEDIATE',
      budgetMin: 5000,
      budgetMax: 8000,
    },
  });

  const familyProfile8 = await prisma.familyProfile.create({
    data: {
      userId: familyUser8.id,
      relationship: 'Grandson',
      location: 'Irvine, CA',
      city: 'Irvine',
      state: 'CA',
      zipCode: '92602',
      description: 'My grandmother (89) has moderate Alzheimer\'s and can no longer live alone. She needs memory care with experienced staff in a secure environment.',
      careTypes: [CareType.MEMORY_CARE],
      careUrgency: 'URGENT',
      budgetMin: 6500,
      budgetMax: 10000,
    },
  });

  const familyProfile9 = await prisma.familyProfile.create({
    data: {
      userId: familyUser9.id,
      relationship: 'Daughter-in-law',
      location: 'San Jose, CA',
      city: 'San Jose',
      state: 'CA',
      zipCode: '95110',
      description: 'Looking for an independent caregiver for overnight shifts. My father-in-law (76) needs help with bathroom visits, medication reminders, and reassurance during the night.',
      careTypes: [CareType.PERSONAL_CARE],
      careUrgency: 'WITHIN_MONTH',
      budgetMin: 3000,
      budgetMax: 5000,
    },
  });

  const familyProfile10 = await prisma.familyProfile.create({
    data: {
      userId: familyUser10.id,
      relationship: 'Husband',
      location: 'Pasadena, CA',
      city: 'Pasadena',
      state: 'CA',
      zipCode: '91101',
      description: 'My wife (72) has Parkinson\'s disease and needs daily assistance with mobility, dressing, and meals. Prefer female caregiver who is patient and experienced with Parkinson\'s.',
      careTypes: [CareType.PERSONAL_CARE, CareType.COMPANION_CARE],
      careUrgency: 'URGENT',
      budgetMin: 4000,
      budgetMax: 6500,
    },
  });

  const familyProfile11 = await prisma.familyProfile.create({
    data: {
      userId: familyUser11.id,
      relationship: 'Niece',
      location: 'Long Beach, CA',
      city: 'Long Beach',
      state: 'CA',
      zipCode: '90802',
      description: 'My aunt (81) is mostly independent but would benefit from adult day care services 3 days a week for socialization and activities while I work.',
      careTypes: [CareType.COMPANION_CARE, CareType.RESPITE_CARE],
      careUrgency: 'FLEXIBLE',
      budgetMin: 1500,
      budgetMax: 2500,
    },
  });

  const familyProfile12 = await prisma.familyProfile.create({
    data: {
      userId: familyUser12.id,
      relationship: 'Son',
      location: 'Riverside, CA',
      city: 'Riverside',
      state: 'CA',
      zipCode: '92501',
      description: 'Father (88) is recovering from hip surgery and needs short-term rehabilitation and skilled nursing care. Looking for a facility with physical therapy on-site.',
      careTypes: [CareType.SKILLED_NURSING, CareType.PERSONAL_CARE],
      careUrgency: 'IMMEDIATE',
      budgetMin: 5500,
      budgetMax: 8500,
    },
  });

  console.log('✅ Created 12 family profiles');

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
      requestType: 'CONSULTATION',
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

  // Request 5: Emily Davis → Harbor View (ACCEPTED with conversation)
  const request5 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[11].id, // Harbor View Assisted Living
      familyProfileId: familyProfile5.id,
      senderId: familyUser5.id,
      message: 'My father is interested in your luxury assisted living community. Can you provide pricing information and schedule a tour? He\'s looking for ocean views and upscale amenities.',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request5.id,
        senderId: providerUser7.id,
        content: 'Hello Emily! We\'d be delighted to welcome your father. Our one-bedroom suites with ocean views start at $9,500/month. This includes all meals, housekeeping, activities, and personal care assistance.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18),
      },
      {
        consultRequestId: request5.id,
        senderId: familyUser5.id,
        content: 'That sounds perfect! Can we schedule a tour for this Friday?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
      },
    ],
  });

  // Request 6: Robert Martinez → Riverside Nursing Home (PENDING)
  await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[6].id, // Riverside Nursing Home
      familyProfileId: familyProfile6.id,
      senderId: familyUser6.id,
      message: 'My father had a stroke and needs skilled nursing with PT/OT services. What is your staff-to-patient ratio? Do you have private rooms available?',
      status: 'PENDING',
      requestType: 'CONSULTATION',
    },
  });

  // Request 7: Linda Garcia → Peaceful Transitions Hospice (ACCEPTED with conversation)
  const request7 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[4].id, // Peaceful Transitions Hospice
      familyProfileId: familyProfile7.id,
      senderId: familyUser7.id,
      message: 'My mother is in the final stages of cancer. We need hospice care that can help manage her pain and provide emotional support for our family.',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request7.id,
        senderId: providerUser5.id,
        content: 'Linda, I\'m so sorry about your mother. We\'re here to help. Our hospice team includes nurses, social workers, chaplains, and volunteers available 24/7. We focus on comfort, pain management, and supporting the whole family.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
      },
      {
        consultRequestId: request7.id,
        senderId: familyUser7.id,
        content: 'Thank you. That means a lot. Can someone come to assess her needs this week?',
        status: 'DELIVERED',
        deliveredAt: new Date(Date.now() - 1000 * 60 * 30),
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
    ],
  });

  // Request 8: James Rodriguez → Willow Brook Memory Care (ACCEPTED)
  const request8 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[13].id, // Willow Brook Memory Care
      familyProfileId: familyProfile8.id,
      senderId: familyUser8.id,
      message: 'My grandmother has Alzheimer\'s and we can no longer keep her safe at home. Tell me about your memory care program and security features.',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.create({
    data: {
      consultRequestId: request8.id,
      senderId: providerUser3.id,
      content: 'Hi James. Our memory care unit is completely secure with monitored exits and outdoor courtyards. We use a person-centered approach with music therapy, art programs, and sensory activities. Our staff-to-resident ratio is 1:6 during the day. Would you like to schedule a tour?',
      status: 'READ',
      readAt: new Date(Date.now() - 1000 * 60 * 60),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    },
  });

  // Request 9: Patricia Lee → Compassionate Care Services (ACCEPTED with active conversation)
  const request9 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[8].id, // Compassionate Care Services
      familyProfileId: familyProfile9.id,
      senderId: familyUser9.id,
      message: 'Need overnight caregiver for my father-in-law. He needs bathroom assistance and medication reminders. Prefer someone patient and experienced.',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request9.id,
        senderId: providerUser6.id,
        content: 'Hello! We have excellent overnight caregivers available. Our rate is $200 per night (10pm-7am). All caregivers are certified, background-checked, and trained in personal care.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      },
      {
        consultRequestId: request9.id,
        senderId: familyUser9.id,
        content: 'That works for our budget. Can we do a trial night first to make sure it\'s a good fit?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 22),
      },
      {
        consultRequestId: request9.id,
        senderId: providerUser6.id,
        content: 'Absolutely! We always recommend a trial night. Let me match you with Maria - she has 15 years experience and is wonderful with seniors. When would you like to start?',
        status: 'DELIVERED',
        deliveredAt: new Date(Date.now() - 1000 * 60 * 45),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ],
  });

  // Request 10: William Taylor → Maria Santos (ACCEPTED with hire interest)
  const request10 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[16].id, // Maria Santos - Independent Caregiver
      familyProfileId: familyProfile10.id,
      senderId: familyUser10.id,
      message: 'I saw your profile. My wife has Parkinson\'s and needs daily care. Are you available for morning shifts (8am-2pm) Monday through Friday?',
      status: 'ACCEPTED',
      requestType: 'HIRING',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request10.id,
        senderId: familyUser10.id, // Note: Independent caregiver doesn't have user account, so message comes from family
        content: 'Hello! Yes, I have availability for those hours. I have extensive experience with Parkinson\'s patients including mobility assistance, medication management, and meal preparation. My rate is $30/hour. I\'d love to meet you both for a consultation.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 16),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      },
      {
        consultRequestId: request10.id,
        senderId: familyUser10.id,
        content: 'That sounds good. Can you come by tomorrow at 10am for us to meet you?',
        status: 'SENT',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14),
      },
    ],
  });

  // Request 11: Maria Anderson → Bright Days Adult Day Center (PENDING)
  await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[27].id, // Bright Days Adult Day Center
      familyProfileId: familyProfile11.id,
      senderId: familyUser11.id,
      message: 'Interested in your adult day care program 3 days a week. What activities do you offer? Do you provide transportation?',
      status: 'PENDING',
      requestType: 'CONSULTATION',
    },
  });

  // Request 12: Thomas Thomas → New Hope Rehabilitation (ACCEPTED with tour scheduled)
  const request12 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[7].id, // New Hope Rehabilitation Center
      familyProfileId: familyProfile12.id,
      senderId: familyUser12.id,
      message: 'My father is recovering from hip replacement surgery. He needs intensive PT and skilled nursing for 4-6 weeks. What is your daily rate?',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.createMany({
    data: [
      {
        consultRequestId: request12.id,
        senderId: familyUser12.id, // No specific provider user for this one
        content: 'Hello Thomas! Our short-term rehabilitation program is perfect for post-surgical recovery. We offer 3 hours of therapy daily (PT, OT) and 24-hour skilled nursing. Our rate is $450/day and we accept Medicare.',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 10),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36),
      },
      {
        consultRequestId: request12.id,
        senderId: familyUser12.id,
        content: 'Great! Can we tour the facility and meet with the rehab team?',
        status: 'READ',
        readAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32),
      },
    ],
  });

  await prisma.tourAppointment.create({
    data: {
      requestId: request12.id,
      proposedBy: familyUser12.id,
      proposedDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1), // Tomorrow
      proposedTime: '11:00 AM',
      status: 'PROPOSED',
      notes: 'Tour of rehab facility and consultation with PT director',
    },
  });

  // Request 13: David Wilson → Always There Home Care (ACCEPTED)
  const request13 = await prisma.consultRequest.create({
    data: {
      providerId: createdProviders[9].id, // Always There Home Care
      familyProfileId: familyProfile4.id,
      senderId: familyUser4.id,
      message: 'I need occasional respite care when I travel for work. Do you offer flexible scheduling?',
      status: 'ACCEPTED',
      requestType: 'CONSULTATION',
    },
  });

  await prisma.message.create({
    data: {
      consultRequestId: request13.id,
      senderId: familyUser4.id, // No specific provider user
      content: 'Yes! We offer flexible respite care from a few hours to several days. Our caregivers can come to your home or your mother can stay with one of our care families. Rates start at $35/hour or $350/day for 24-hour care.',
      status: 'DELIVERED',
      deliveredAt: new Date(Date.now() - 1000 * 60 * 20),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    },
  });

  console.log('✅ Created 13 consultation requests with messages and tours');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('\n🎉 Database seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log('   👤 Users: 19 (12 families, 7 providers)');
  console.log('   🏥 Providers: 30');
  console.log('      - Home Care: 5 (includes adult day care)');
  console.log('      - Assisted Living: 4');
  console.log('      - Memory Care: 3');
  console.log('      - Nursing Homes: 3');
  console.log('      - Home Health: 2');
  console.log('      - Hospice: 2');
  console.log('      - Rehabilitation: 2');
  console.log('      - Independent Caregivers: 6');
  console.log('      - Independent Living: 2');
  console.log('   👨‍👩‍👧 Family Profiles: 12');
  console.log('   💬 Consultation Requests: 13');
  console.log('   📨 Messages: 25+');
  console.log('   📅 Tour Appointments: 3');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🔐 Demo Login Credentials (All passwords: demo123):');
  console.log('\n👨‍👩‍👧 Family Users:');
  console.log('   1. sarah.miller@example.com (Active conversations)');
  console.log('   2. michael.chen@example.com (Accepted tour)');
  console.log('   3. jennifer.brown@example.com (Pending request)');
  console.log('   4. david.wilson@example.com');
  console.log('   5. emily.davis@example.com');
  console.log('   6. robert.martinez@example.com');
  console.log('   7. linda.garcia@example.com');
  console.log('   8. james.rodriguez@example.com');
  console.log('   9. patricia.lee@example.com');
  console.log('   10. william.taylor@example.com');
  console.log('   11. maria.anderson@example.com');
  console.log('   12. thomas.thomas@example.com');
  console.log('\n🏥 Provider Users:');
  console.log('   1. admin@sunshineseniorcare.com (Sunshine Senior Care)');
  console.log('   2. director@goldenyears.com (Golden Years Assisted Living)');
  console.log('   3. admin@memorylane.com (Memory Lane Care Center)');
  console.log('   4. contact@caringhands.com (Caring Hands Home Health)');
  console.log('   5. info@peacefultransitions.org (Peaceful Transitions Hospice)');
  console.log('   6. admin@compassionatecare.com (Compassionate Care Services)');
  console.log('   7. director@harborview.com (Harbor View Assisted Living)');
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
