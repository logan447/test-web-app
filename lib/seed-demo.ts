import { PrismaClient } from '@prisma/client';
import { seedLite } from './seed-lite';

/**
 * Demo seed - comprehensive data for end-to-end demos
 *
 * Layers enrichment data on top of seedLite (90 base accounts):
 * - Reviews with varied ratings and provider responses
 * - Engagements (family ↔ provider) with messages
 * - HiringEngagements (org ↔ caregiver) with messages
 * - ScheduledEvents (tours, consultations, interviews)
 * - Subscriptions (FREE, BASIC, PRO tiers)
 * - Notifications (varied types, mix of read/unread)
 * - SavedProvider entries
 * - SavedFamilyProfile entries
 * - Questions with provider answers
 * - Unclaimed providers
 * - TakedownRequests
 */
export async function seedDemo(prisma: PrismaClient) {
  console.log('[DEMO SEED] Starting comprehensive demo seed...\n');

  // Step 1: Run base seed (90 accounts)
  await seedLite(prisma);

  // Step 2: Gather all created records for cross-referencing
  console.log('[DEMO SEED] Gathering created records...');

  const allFamilyUsers = await prisma.user.findMany({
    where: { role: 'FAMILY' },
    include: { familyProfile: true },
    orderBy: { createdAt: 'asc' },
  });

  const allProviderUsers = await prisma.user.findMany({
    where: { role: 'PROVIDER' },
    include: { provider: true, providerIdentity: true },
    orderBy: { createdAt: 'asc' },
  });

  const allProviders = await prisma.provider.findMany({
    orderBy: { createdAt: 'asc' },
  });

  const facilityProviders = allProviders.filter(
    (p) => p.providerType !== 'INDEPENDENT_CAREGIVER'
  );
  const caregiverProviders = allProviders.filter(
    (p) => p.providerType === 'INDEPENDENT_CAREGIVER'
  );

  const orgUsers = allProviderUsers.filter(
    (u) => u.provider && u.provider.providerType !== 'INDEPENDENT_CAREGIVER'
  );
  const caregiverUsers = allProviderUsers.filter(
    (u) => u.provider && u.provider.providerType === 'INDEPENDENT_CAREGIVER'
  );

  console.log(
    `[DEMO SEED] Found ${allFamilyUsers.length} families, ${orgUsers.length} orgs, ${caregiverUsers.length} caregivers\n`
  );

  // ============================================================================
  // UNCLAIMED PROVIDERS (for claiming flow)
  // ============================================================================
  console.log('[DEMO SEED] Creating unclaimed providers...');

  // Unclaimed providers — one per facility subtype + diverse scenarios
  // These have NO user account, NO photos/units, and sparse data (community-reported)
  const unclaimedData = [
    // === One unclaimed per facility subtype ===
    {
      name: 'Bay Area Senior Living',
      type: 'ASSISTED_LIVING' as const,
      city: 'San Jose',
      state: 'CA',
      zip: '95110',
      desc: 'A welcoming community for seniors in the heart of San Jose, offering personal care and companion services in a residential neighborhood near Guadalupe River Park.',
      care: ['PERSONAL_CARE' as const, 'COMPANION_CARE' as const],
      rating: 4.3,
      reviews: 12,
      lat: 37.3382,
      lng: -121.8863,
      address: '245 Park Avenue',
      phone: '(408) 555-0120',
      capacity: 48,
      yearsInBusiness: 12,
    },
    {
      name: 'Peninsula Memory Gardens',
      type: 'MEMORY_CARE' as const,
      city: 'Palo Alto',
      state: 'CA',
      zip: '94301',
      desc: 'A secured memory care community with beautiful garden courtyards, located in a quiet residential area of Palo Alto. Known for its structured daily activities and gentle approach to dementia care.',
      care: ['MEMORY_CARE' as const, 'PERSONAL_CARE' as const],
      rating: 4.5,
      reviews: 8,
      lat: 37.4419,
      lng: -122.143,
      address: '780 Middlefield Road',
      phone: '(650) 555-0145',
      capacity: 36,
      yearsInBusiness: 8,
    },
    {
      name: 'Sacramento Care Center',
      type: 'NURSING_HOME' as const,
      city: 'Sacramento',
      state: 'CA',
      zip: '95814',
      desc: 'A skilled nursing facility in downtown Sacramento providing 24-hour nursing care, rehabilitation services, and long-term care. Located near UC Davis Medical Center for easy specialist access.',
      care: ['SKILLED_NURSING' as const],
      rating: 4.4,
      reviews: 22,
      lat: 38.5816,
      lng: -121.4944,
      address: '1200 N Street',
      phone: '(916) 555-0130',
      capacity: 90,
      yearsInBusiness: 18,
    },
    {
      name: 'Napa Valley Rehabilitation',
      type: 'REHABILITATION' as const,
      city: 'Napa',
      state: 'CA',
      zip: '94559',
      desc: 'A short-stay rehabilitation center in Napa Valley specializing in post-surgical recovery and orthopedic rehabilitation. Patients typically stay 2-6 weeks before returning home.',
      care: ['SKILLED_NURSING' as const],
      rating: 4.6,
      reviews: 14,
      lat: 38.2975,
      lng: -122.2869,
      address: '2800 Old Sonoma Road',
      phone: '(707) 555-0155',
      capacity: 40,
      yearsInBusiness: 10,
    },
    {
      name: 'Sierra Foothills Independent Living',
      type: 'INDEPENDENT_LIVING' as const,
      city: 'Roseville',
      state: 'CA',
      zip: '95661',
      desc: 'An active retirement community in the Sierra foothills offering independent apartments, a full social calendar, fitness center, and optional meal plans. Popular with active retirees who enjoy nearby hiking trails.',
      care: ['COMPANION_CARE' as const],
      rating: 4.2,
      reviews: 6,
      lat: 38.7521,
      lng: -121.2880,
      address: '4500 Sierra College Boulevard',
      phone: '(916) 555-0170',
      capacity: 120,
      yearsInBusiness: 15,
    },
    {
      name: 'Grace Hospice House',
      type: 'HOSPICE' as const,
      city: 'Santa Barbara',
      state: 'CA',
      zip: '93101',
      desc: 'An inpatient hospice residence providing comfort-focused end-of-life care in a peaceful, homelike environment. Private rooms with mountain views, family overnight accommodations, and 24-hour nursing care.',
      care: ['HOSPICE_CARE' as const],
      rating: 4.8,
      reviews: 19,
      lat: 34.4208,
      lng: -119.6982,
      address: '900 De la Vina Street',
      phone: '(805) 555-0180',
      capacity: 16,
      yearsInBusiness: 7,
    },

    // === Additional diverse scenarios ===
    // Rural, low reviews — sparse data
    {
      name: 'Valley Senior Home',
      type: 'ASSISTED_LIVING' as const,
      city: 'Fresno',
      state: 'CA',
      zip: '93701',
      desc: 'Affordable senior living in the Central Valley serving the Fresno community.',
      care: ['PERSONAL_CARE' as const],
      rating: 4.1,
      reviews: 3,
      lat: 36.7378,
      lng: -119.7871,
      address: '550 Tulare Street',
      phone: '(559) 555-0140',
      capacity: 28,
      yearsInBusiness: 5,
    },
    // Urban, many Google reviews, no Olera reviews yet
    {
      name: 'Downtown LA Senior Residence',
      type: 'ASSISTED_LIVING' as const,
      city: 'Los Angeles',
      state: 'CA',
      zip: '90012',
      desc: 'A high-rise senior living community in the heart of downtown Los Angeles, close to cultural attractions, Chinatown, and public transportation.',
      care: ['PERSONAL_CARE' as const, 'COMPANION_CARE' as const],
      rating: 4.0,
      reviews: 47,
      lat: 34.0522,
      lng: -118.2437,
      address: '350 S Grand Avenue',
      phone: '(213) 555-0190',
      capacity: 85,
      yearsInBusiness: 20,
    },
    // Home care — unclaimed agency
    {
      name: 'Central Coast Home Health',
      type: 'HOME_CARE' as const,
      city: 'Santa Monica',
      state: 'CA',
      zip: '90401',
      desc: 'Home care services along the central coast, providing companion care and personal assistance for seniors aging in place.',
      care: ['COMPANION_CARE' as const, 'PERSONAL_CARE' as const],
      rating: 4.2,
      reviews: 18,
      lat: 34.0195,
      lng: -118.4912,
      address: '1234 Wilshire Boulevard',
      phone: '(310) 555-0200',
    },
  ];

  for (let i = 0; i < unclaimedData.length; i++) {
    const data = unclaimedData[i];
    const isFacilityType = ['ASSISTED_LIVING', 'MEMORY_CARE', 'NURSING_HOME', 'INDEPENDENT_LIVING', 'REHABILITATION', 'HOSPICE'].includes(data.type);

    await prisma.provider.create({
      data: {
        name: data.name,
        providerType: data.type,
        description: data.desc,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
        address: data.address || `${200 + i * 100} Care Street`,
        phone: data.phone || `(${900 + i}) 555-${String(3000 + i).padStart(4, '0')}`,
        email: `info@${data.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com`,
        careTypesOffered: data.care,
        // Unclaimed providers have NO cover photo or photos array (community-reported data)
        averageRating: data.rating,
        reviewCount: data.reviews,
        latitude: data.lat,
        longitude: data.lng,
        claimed: false,
        verified: false,
        active: true,
        isVisible: true,
        // Add facility fields where available (community-reported)
        ...(isFacilityType && data.capacity ? { totalCapacity: data.capacity } : {}),
        ...(data.yearsInBusiness ? { yearsInBusiness: data.yearsInBusiness } : {}),
        ...(data.type === 'HOME_CARE' ? { serviceRadius: 25 } : {}),
      },
    });
  }
  console.log(`[DEMO SEED] Created ${unclaimedData.length} unclaimed providers\n`);

  // ============================================================================
  // CLAIMED BUT INCOMPLETE PROVIDERS (for testing graceful degradation)
  // ============================================================================
  // These providers have claimed their listing but haven't finished their profile.
  // They have varying levels of completeness to test card rendering.
  console.log('[DEMO SEED] Creating claimed-incomplete providers...');

  const claimedIncompleteData = [
    // Has photos, no pricing, no payment modes
    {
      name: 'Sunrise Gardens (Incomplete)',
      type: 'ASSISTED_LIVING' as const,
      city: 'San Diego',
      state: 'CA',
      zip: '92101',
      desc: 'A newly claimed listing - pricing and payment information coming soon.',
      care: ['PERSONAL_CARE' as const],
      hasPhotos: true,
      hasPricing: false,
      hasPaymentModes: false,
    },
    // No photos, has pricing, no payment modes
    {
      name: 'Valley View Memory Care (Incomplete)',
      type: 'MEMORY_CARE' as const,
      city: 'La Jolla',
      state: 'CA',
      zip: '92037',
      desc: 'Profile in progress - photos coming soon.',
      care: ['MEMORY_CARE' as const],
      hasPhotos: false,
      hasPricing: true,
      priceMin: 6500,
      hasPaymentModes: false,
    },
    // No photos, no pricing, has payment modes (insurance-based)
    {
      name: 'Coastal Nursing & Rehab (Incomplete)',
      type: 'NURSING_HOME' as const,
      city: 'Carlsbad',
      state: 'CA',
      zip: '92008',
      desc: 'Accepting Medicare and Medicaid. More details coming soon.',
      care: ['SKILLED_NURSING' as const],
      hasPhotos: false,
      hasPricing: false,
      hasPaymentModes: true,
      paymentModes: ['MEDICARE', 'MEDICAID'],
    },
  ];

  for (let i = 0; i < claimedIncompleteData.length; i++) {
    const data = claimedIncompleteData[i];
    const photos = data.hasPhotos ? ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800'] : [];

    await prisma.provider.create({
      data: {
        name: data.name,
        providerType: data.type,
        description: data.desc,
        city: data.city,
        state: data.state,
        zipCode: data.zip,
        address: `${300 + i * 100} Test Street`,
        phone: `(858) 555-${String(4000 + i).padStart(4, '0')}`,
        email: `info@incomplete${i}@example.com`,
        careTypesOffered: data.care,
        photos: photos,
        coverPhoto: photos[0] || null,
        priceMin: data.hasPricing ? data.priceMin : null,
        paymentModesAccepted: data.hasPaymentModes ? (data as any).paymentModes : [],
        claimed: true,
        claimedAt: new Date(),
        verified: false, // Not yet verified
        active: true,
        isVisible: true,
      },
    });
  }
  console.log(`[DEMO SEED] Created ${claimedIncompleteData.length} claimed-incomplete providers\n`);

  // ============================================================================
  // REVIEWS (35 reviews across 20 providers)
  // ============================================================================
  console.log('[DEMO SEED] Creating reviews...');

  // source: "olera" = submitted on Olera, "google" = imported from Google Reviews
  const reviewContent = [
    { rating: 5, title: 'Outstanding care and compassion', content: 'The staff here is incredible. My mother has been so happy since moving in. They treat every resident like family and the activities keep her engaged.', relationship: 'Daughter of resident', lengthOfStay: '1 year', source: 'olera' },
    { rating: 5, title: 'Could not ask for better', content: 'From the moment we walked in we knew this was the right place. Clean, warm, welcoming. The care team is responsive and truly cares about the residents.', relationship: 'Son of resident', lengthOfStay: '6 months', source: 'google' },
    { rating: 5, title: 'Exceptional memory care program', content: 'My father has Alzheimers and the specialized memory care program here has been life-changing. The staff is trained and patient. He seems calmer and happier.', relationship: 'Daughter of resident', lengthOfStay: '8 months', source: 'olera' },
    { rating: 4, title: 'Very good overall experience', content: 'Great facility with caring staff. The food could be more varied but otherwise we are very happy with the care my mother receives here.', relationship: 'Son of resident', lengthOfStay: '2 years', source: 'google' },
    { rating: 4, title: 'Good care, nice community', content: 'My parents enjoy the social activities and the staff is attentive. The grounds are beautiful. Only minor issue is scheduling for physical therapy can be slow.', relationship: 'Daughter of residents', lengthOfStay: '1 year', source: 'google' },
    { rating: 4, title: 'Reliable and professional', content: 'They have been taking care of my father for over a year and we are generally very satisfied. Communication could be slightly better during shift changes.', relationship: 'Son of resident', lengthOfStay: '14 months', source: 'olera' },
    { rating: 4, title: 'Would recommend to others', content: 'Clean rooms, friendly staff, and good food. My mother enjoys the garden area. We feel confident she is well cared for here.', relationship: 'Daughter of resident', lengthOfStay: '9 months', source: 'google' },
    { rating: 3, title: 'Decent but has room to improve', content: 'The care is adequate and the facility is clean. Some staff turnover has been an issue. The activities program could be more robust for more active seniors.', relationship: 'Wife of resident', lengthOfStay: '6 months', source: 'olera' },
    { rating: 3, title: 'Mixed experience', content: 'The caregivers are kind but the administrative side can be frustrating. Billing issues took weeks to resolve. The actual care quality is good though.', relationship: 'Son of resident', lengthOfStay: '4 months', source: 'google' },
    { rating: 3, title: 'Average facility, good staff', content: 'The building is older and could use some updates but the staff makes up for it with their genuine care and attention to residents.', relationship: 'Daughter of resident', lengthOfStay: '3 months', source: 'google' },
    { rating: 2, title: 'Needs improvement', content: 'We had some concerns about response times during off-hours. The daytime staff is much better. We are monitoring the situation.', relationship: 'Son of resident', lengthOfStay: '2 months', source: 'olera' },
    { rating: 5, title: 'Best decision we ever made', content: 'Moving my mom here was the best decision. She has made friends, stays active, and the medical oversight gives us peace of mind.', relationship: 'Daughter of resident', lengthOfStay: '18 months', source: 'olera' },
    { rating: 4, title: 'Professional and caring team', content: 'The nursing staff is top-notch. They caught a health issue early that we missed. Very grateful for their attentiveness.', relationship: 'Husband of resident', lengthOfStay: '10 months', source: 'google' },
    { rating: 5, title: 'Wonderful hospice support', content: 'During the most difficult time of our lives, this team provided incredible support for both my father and our family. Truly compassionate care.', relationship: 'Daughter of patient', lengthOfStay: '3 months', source: 'olera' },
    { rating: 4, title: 'Great value for the price', content: 'Compared to other options we looked at, this facility offers excellent care at a fair price. The amenities are good and the location is convenient.', relationship: 'Son of resident', lengthOfStay: '7 months', source: 'google' },
    { rating: 5, title: 'Highly recommend this caregiver', content: 'Professional, punctual, and genuinely kind. My father looks forward to their visits. They handle his Parkinsons care with expertise and patience.', relationship: 'Daughter of client', lengthOfStay: '5 months', source: 'olera' },
    { rating: 4, title: 'Skilled and reliable', content: 'Great in-home caregiver. Very skilled with medication management and mobility assistance. Would recommend for anyone needing home care.', relationship: 'Son of client', lengthOfStay: '4 months', source: 'google' },
    { rating: 5, title: 'Life-changing home care', content: 'Having a caregiver come to our home has allowed my mother to age in place safely. The agency matched us with the perfect person.', relationship: 'Daughter of client', lengthOfStay: '1 year', source: 'olera' },
    { rating: 3, title: 'Good care, scheduling issues', content: 'The caregivers themselves are wonderful but we have had scheduling changes that were inconvenient. The care quality is high when they are here.', relationship: 'Wife of client', lengthOfStay: '3 months', source: 'google' },
    { rating: 5, title: 'Above and beyond', content: 'This facility goes above and beyond. They organized a birthday party for my dad and the chef made his favorite meal. Small touches that mean everything.', relationship: 'Son of resident', lengthOfStay: '11 months', source: 'olera' },
    { rating: 4, title: 'Clean and well-maintained', content: 'The facility is always clean and well-maintained. Staff is friendly. My only wish is for more outdoor activities during nice weather.', relationship: 'Daughter of resident', lengthOfStay: '8 months', source: 'google' },
    { rating: 2, title: 'Communication could be better', content: 'The care is acceptable but communication with family members needs significant improvement. We often feel out of the loop about our loved one.', relationship: 'Son of resident', lengthOfStay: '5 months', source: 'olera' },
    { rating: 5, title: 'Exceeded all expectations', content: 'From the tour to move-in day and beyond, everything has been smooth. The transition team made it easy and my mother settled in quickly.', relationship: 'Daughter of resident', lengthOfStay: '6 months', source: 'google' },
    { rating: 4, title: 'Solid memory care program', content: 'The memory care unit is secure and the staff understands dementia. Activities are appropriate and engaging. My husband seems less agitated here.', relationship: 'Wife of resident', lengthOfStay: '9 months', source: 'olera' },
    { rating: 5, title: 'Amazing rehabilitation services', content: 'After hip surgery, the rehab team here got my mother walking again in just 3 weeks. Physical therapy is top-tier.', relationship: 'Son of patient', lengthOfStay: '1 month', source: 'google' },
    { rating: 4, title: 'Great companion caregiver', content: 'Our caregiver has become like family. They play cards, go for walks, and genuinely enjoy spending time together. Dad loves the company.', relationship: 'Daughter of client', lengthOfStay: '6 months', source: 'olera' },
    { rating: 1, title: 'Disappointing experience', content: 'We expected more based on the tour. Staffing seemed thin on weekends and our requests were sometimes forgotten. We have since moved to another facility.', relationship: 'Son of former resident', lengthOfStay: '2 months', source: 'google' },
    { rating: 5, title: 'Peaceful and dignified', content: 'The end-of-life care was handled with such grace and dignity. Our family was supported every step of the way. Cannot thank them enough.', relationship: 'Daughter of patient', lengthOfStay: '2 months', source: 'olera' },
    { rating: 4, title: 'Responsive to feedback', content: 'We raised some concerns early on and they addressed them quickly. Appreciate the open communication and willingness to improve.', relationship: 'Son of resident', lengthOfStay: '4 months', source: 'google' },
    { rating: 5, title: 'Five stars from our entire family', content: 'Every family member who has visited has been impressed. The warmth, professionalism, and attention to detail are evident throughout.', relationship: 'Granddaughter of resident', lengthOfStay: '1 year', source: 'olera' },
    { rating: 3, title: 'Adequate but pricey', content: 'The care is acceptable but for the price we expected more amenities and activities. The staff is friendly but turnover is noticeable.', relationship: 'Daughter of resident', lengthOfStay: '3 months', source: 'google' },
    { rating: 4, title: 'Good nursing care', content: 'The nursing staff is experienced and attentive. They manage my fathers complex medication schedule without issues. Facility is a bit dated but clean.', relationship: 'Son of resident', lengthOfStay: '7 months', source: 'olera' },
    { rating: 5, title: 'Like a second family', content: 'The caregivers here have become like a second family to my mother. She lights up when they arrive. Best in-home care agency we could find.', relationship: 'Daughter of client', lengthOfStay: '14 months', source: 'olera' },
    { rating: 4, title: 'Excellent therapists', content: 'The physical and occupational therapists are outstanding. My mother has regained significant mobility. The rest of the care is also very good.', relationship: 'Son of patient', lengthOfStay: '6 weeks', source: 'google' },
    { rating: 5, title: 'True compassion in action', content: 'Every interaction shows genuine compassion. From the front desk to the nursing staff to the kitchen team. This is how senior care should be.', relationship: 'Daughter of resident', lengthOfStay: '2 years', source: 'olera' },
  ];

  // Provider responses for some reviews
  const providerResponses = [
    'Thank you for your kind words! We are so glad your mother is happy here. Our team works hard to create a warm, family-like environment.',
    'We appreciate your wonderful feedback. It means a lot to our entire care team. We look forward to continuing to provide excellent care.',
    'Thank you for sharing your experience. We are proud of our memory care program and glad it is making a difference for your father.',
    'Thank you for your feedback. We hear you about the food variety and are working with our chef to expand the menu. Glad the care is meeting expectations.',
    'We appreciate your honest review and are sorry about the scheduling delays for PT. We have hired additional therapists to improve availability.',
    'Thank you for your review. We take communication during shift changes seriously and have implemented new handoff procedures to address this.',
    'Thank you for your feedback. We are sorry about the billing issues and have improved our administrative processes. Glad the care quality is good.',
    'We appreciate you sharing this feedback. We are investing in facility improvements and agree our wonderful staff is our greatest asset.',
    'Thank you for bringing this to our attention. We have added overnight staff and improved our response time protocols.',
    'We are honored by your kind words. Creating those special moments for our residents is what drives us every day.',
    'Thank you for choosing us. We are committed to continuous improvement and value your feedback about outdoor activities.',
    'We sincerely apologize for your experience and have taken steps to address staffing on weekends. We wish you and your family well.',
    'Thank you for this beautiful feedback. Supporting families during difficult times is a privilege we take very seriously.',
    'Thank you for giving us the opportunity to address your concerns. Open communication with families is one of our core values.',
    'What a wonderful review! Thank you to your entire family for the kind words. It means the world to our team.',
  ];

  // Distribute reviews across providers (top providers get more)
  const reviewProviders = facilityProviders.slice(0, 20);
  let reviewIndex = 0;

  for (let pi = 0; pi < reviewProviders.length && reviewIndex < reviewContent.length; pi++) {
    const provider = reviewProviders[pi];
    // First few providers get 3-4 reviews, rest get 1-2
    const reviewCount = pi < 6 ? 3 + (pi % 2) : 1 + (pi % 2);

    for (let ri = 0; ri < reviewCount && reviewIndex < reviewContent.length; ri++) {
      const review = reviewContent[reviewIndex];
      const familyUser = allFamilyUsers[reviewIndex % allFamilyUsers.length];
      const daysAgo = 7 + reviewIndex * 5 + Math.floor(Math.random() * 10);
      const hasResponse = reviewIndex < providerResponses.length;

      await prisma.review.create({
        data: {
          providerId: provider.id,
          userId: familyUser.id,
          rating: review.rating,
          title: review.title,
          content: review.content,
          source: review.source || 'olera',
          relationship: review.relationship,
          lengthOfStay: review.lengthOfStay,
          helpfulCount: Math.floor(Math.random() * 15),
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
        },
      });

      reviewIndex++;
    }
  }
  console.log(`[DEMO SEED] Created ${reviewIndex} reviews\n`);

  // ============================================================================
  // ENGAGEMENTS (family ↔ provider)
  // ============================================================================
  console.log('[DEMO SEED] Creating engagements...');

  const engagementScenarios = [
    // Active tours for facility providers
    { familyIdx: 0, providerIdx: 0, type: 'TOUR' as const, status: 'ACCEPTED' as const, reason: 'Schedule a tour', message: 'I would like to schedule a tour to see the facility and learn about your care programs.' },
    { familyIdx: 0, providerIdx: 1, type: 'TOUR' as const, status: 'PENDING' as const, reason: 'Schedule a tour', message: 'Hello, I am looking for memory care options for my mother. Can I visit this week?' },
    { familyIdx: 0, providerIdx: 5, type: 'TOUR' as const, status: 'COMPLETED' as const, reason: 'Schedule a tour', message: 'We visited and were very impressed with the facility.' },
    { familyIdx: 1, providerIdx: 2, type: 'TOUR' as const, status: 'ACCEPTED' as const, reason: 'Schedule a tour', message: 'I would like to tour the assisted living options for my father.' },
    { familyIdx: 1, providerIdx: 3, type: 'CONSULTATION' as const, status: 'ACTIVE' as const, reason: 'Request information', message: 'Can you tell me more about your home care services and pricing?' },
    { familyIdx: 2, providerIdx: 0, type: 'TOUR' as const, status: 'ACCEPTED' as const, reason: 'Request pricing', message: 'Interested in learning about pricing for assisted living.' },
    { familyIdx: 2, providerIdx: 6, type: 'CONSULTATION' as const, status: 'PENDING' as const, reason: 'Request information', message: 'Looking for memory care with Spanish-speaking staff.' },
    { familyIdx: 3, providerIdx: 4, type: 'TOUR' as const, status: 'DECLINED' as const, reason: 'Schedule a tour', message: 'Would like to see the nursing facility.' },
    { familyIdx: 4, providerIdx: 3, type: 'CONSULTATION' as const, status: 'ACCEPTED' as const, reason: 'Request information', message: 'Need home care for my father with Parkinsons. What services do you offer?' },
    // Consultations with home care agencies
    { familyIdx: 5, providerIdx: 8, type: 'CONSULTATION' as const, status: 'ACTIVE' as const, reason: 'Request pricing', message: 'What are your hourly rates for companion care?' },
    { familyIdx: 6, providerIdx: 9, type: 'CONSULTATION' as const, status: 'COMPLETED' as const, reason: 'Request information', message: 'We used your services and were very happy.' },
    { familyIdx: 7, providerIdx: 7, type: 'TOUR' as const, status: 'ACCEPTED' as const, reason: 'Schedule a tour', message: 'I would love to see the independent living community.' },
    // Interviews with individual caregivers
    { familyIdx: 0, providerIdx: 0, type: 'INTERVIEW' as const, status: 'ACCEPTED' as const, reason: 'Interview caregiver', message: 'I saw your profile and would like to meet to discuss care for my mother.', isCg: true },
    { familyIdx: 3, providerIdx: 1, type: 'INTERVIEW' as const, status: 'PENDING' as const, reason: 'Interview caregiver', message: 'Are you available for part-time companion care?', isCg: true },
    { familyIdx: 4, providerIdx: 2, type: 'INTERVIEW' as const, status: 'COMPLETED' as const, reason: 'Interview caregiver', message: 'We interviewed and hired this caregiver. Excellent.', isCg: true },
    { familyIdx: 8, providerIdx: 4, type: 'INTERVIEW' as const, status: 'ACCEPTED' as const, reason: 'Interview caregiver', message: 'Looking for a bilingual caregiver. Can we chat?', isCg: true },
    { familyIdx: 10, providerIdx: 5, type: 'CONSULTATION' as const, status: 'PENDING' as const, reason: 'Request information', message: 'Need skilled nursing care at home after my mothers stroke.', isCg: true },
    { familyIdx: 12, providerIdx: 7, type: 'INTERVIEW' as const, status: 'CANCELLED' as const, reason: 'Interview caregiver', message: 'We found another caregiver but appreciate your response.', isCg: true },
  ];

  const engagementMessages = [
    'Thank you for reaching out! I would be happy to help. When works best for you?',
    'We have availability this week. Would Tuesday or Thursday afternoon work?',
    'That sounds great. I will plan for Thursday at 2pm. Looking forward to meeting you.',
    'Perfect. Please bring any medical records or care plans you have. See you then!',
    'Thank you for visiting. We hope you enjoyed the tour. Please let us know if you have questions.',
    'I wanted to follow up on our meeting. Have you had a chance to discuss with your family?',
    'Yes, we are very interested. Can you send us the pricing details for a private room?',
    'Of course! I have attached our pricing guide. Happy to discuss any questions.',
  ];

  const createdEngagements: Array<{ id: string; familyProfileId: string; providerId: string }> = [];

  for (const scenario of engagementScenarios) {
    const familyUser = allFamilyUsers[scenario.familyIdx % allFamilyUsers.length];
    if (!familyUser.familyProfile) continue;

    let provider;
    if ((scenario as any).isCg) {
      provider = caregiverProviders[scenario.providerIdx % caregiverProviders.length];
    } else {
      provider = facilityProviders[scenario.providerIdx % facilityProviders.length];
    }
    if (!provider) continue;

    const daysAgo = 2 + Math.floor(Math.random() * 14);

    const engagement = await prisma.engagement.create({
      data: {
        familyProfileId: familyUser.familyProfile.id,
        providerId: provider.id,
        initiatedByUserId: familyUser.id,
        initiatedByRole: 'FAMILY',
        type: scenario.type,
        status: scenario.status,
        contactReason: scenario.reason,
        initialMessage: scenario.message,
        preferredContactMethod: ['phone', 'email', 'video'][Math.floor(Math.random() * 3)],
        viewedByFamily: true,
        viewedByProvider: scenario.status !== 'PENDING',
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });

    createdEngagements.push({
      id: engagement.id,
      familyProfileId: familyUser.familyProfile.id,
      providerId: provider.id,
    });

    // Add messages for non-pending engagements
    if (scenario.status !== 'PENDING' && scenario.status !== 'CANCELLED') {
      const msgCount = scenario.status === 'COMPLETED' ? 6 : 3 + Math.floor(Math.random() * 3);
      const providerUser = allProviderUsers.find((u) => u.provider?.id === provider.id);

      if (providerUser) {
        for (let m = 0; m < msgCount; m++) {
          const isFamily = m % 2 === 0;
          await prisma.engagementMessage.create({
            data: {
              engagementId: engagement.id,
              senderId: isFamily ? familyUser.id : providerUser.id,
              content: isFamily
                ? scenario.message
                : engagementMessages[m % engagementMessages.length],
              status: 'READ',
              readAt: new Date(Date.now() - (daysAgo - m) * 24 * 60 * 60 * 1000),
              createdAt: new Date(Date.now() - (daysAgo - m) * 24 * 60 * 60 * 1000),
            },
          });
        }
      }
    }
  }
  console.log(`[DEMO SEED] Created ${createdEngagements.length} engagements with messages\n`);

  // ============================================================================
  // SCHEDULED EVENTS (tours, consultations, interviews)
  // ============================================================================
  console.log('[DEMO SEED] Creating scheduled events...');

  let eventCount = 0;
  for (let i = 0; i < Math.min(createdEngagements.length, 12); i++) {
    const eng = createdEngagements[i];
    const providerUser = allProviderUsers.find((u) => u.provider?.id === eng.providerId);
    if (!providerUser) continue;

    const isUpcoming = i < 6;
    const eventType = i < 5 ? 'TOUR' as const : i < 8 ? 'CONSULTATION' as const : 'INTERVIEW' as const;
    const scheduledDate = isUpcoming
      ? new Date(Date.now() + (2 + i) * 24 * 60 * 60 * 1000)
      : new Date(Date.now() - (5 + i) * 24 * 60 * 60 * 1000);

    const statusOptions = isUpcoming
      ? ['ACCEPTED', 'PROPOSED']
      : ['COMPLETED', 'CANCELLED'];

    await prisma.scheduledEvent.create({
      data: {
        engagementId: eng.id,
        eventType,
        proposedBy: providerUser.id,
        scheduledDate,
        scheduledTime: `${10 + (i % 5)}:00 ${i % 2 === 0 ? 'AM' : 'PM'}`,
        durationMinutes: eventType === 'TOUR' ? 60 : 30,
        location: eventType === 'INTERVIEW' ? 'Video Call' : undefined,
        isVideoCall: eventType === 'INTERVIEW',
        status: statusOptions[i % statusOptions.length],
        notes: isUpcoming ? 'Looking forward to meeting you!' : 'Thank you for your time.',
        createdAt: new Date(Date.now() - (10 + i) * 24 * 60 * 60 * 1000),
      },
    });
    eventCount++;
  }
  console.log(`[DEMO SEED] Created ${eventCount} scheduled events\n`);

  // ============================================================================
  // HIRING ENGAGEMENTS (org ↔ caregiver)
  // ============================================================================
  console.log('[DEMO SEED] Creating hiring engagements...');

  const hiringScenarios = [
    { orgIdx: 0, cgIdx: 0, type: 'HIRING_INTERVIEW' as const, status: 'ACCEPTED' as const, position: 'Full-Time Caregiver', payMin: 22, payMax: 28 },
    { orgIdx: 0, cgIdx: 1, type: 'HIRING_INTERVIEW' as const, status: 'INTERVIEWING' as const, position: 'Memory Care Specialist', payMin: 26, payMax: 34 },
    { orgIdx: 1, cgIdx: 2, type: 'HIRING_INTERVIEW' as const, status: 'HIRED' as const, position: 'Night Shift RN', payMin: 40, payMax: 55 },
    { orgIdx: 2, cgIdx: 3, type: 'APPLICATION' as const, status: 'PENDING' as const, position: 'Part-Time CNA', payMin: 20, payMax: 26 },
    { orgIdx: 3, cgIdx: 4, type: 'HIRING_INTERVIEW' as const, status: 'ACCEPTED' as const, position: 'Bilingual Caregiver', payMin: 24, payMax: 32 },
    { orgIdx: 4, cgIdx: 5, type: 'APPLICATION' as const, status: 'PENDING' as const, position: 'Companion Care', payMin: 18, payMax: 24 },
    { orgIdx: 5, cgIdx: 6, type: 'HIRING_INTERVIEW' as const, status: 'DECLINED' as const, position: 'Weekend Caregiver', payMin: 22, payMax: 30 },
    { orgIdx: 6, cgIdx: 7, type: 'HIRING_INTERVIEW' as const, status: 'INTERVIEWING' as const, position: 'Live-In Caregiver', payMin: 28, payMax: 38 },
    { orgIdx: 7, cgIdx: 8, type: 'APPLICATION' as const, status: 'ACCEPTED' as const, position: 'Senior Caregiver', payMin: 25, payMax: 35 },
    { orgIdx: 3, cgIdx: 9, type: 'HIRING_INTERVIEW' as const, status: 'HIRED' as const, position: 'Hospice Aide', payMin: 28, payMax: 40 },
  ];

  const hiringMessages = [
    'We are impressed by your experience and would like to discuss a position. Are you available for an interview?',
    'Thank you for reaching out! I am very interested in this opportunity.',
    'Great! When would be a good time for an interview? We can do in-person or video.',
    'I am available Tuesday or Thursday afternoon. In-person works best for me.',
    'Perfect, lets plan for Thursday at 2pm. Please bring your certifications and ID.',
    'I will be there. Looking forward to learning more about the role.',
    'The interview went well. We would like to offer you the position!',
    'I am excited to accept! When do I start?',
  ];

  let hiringCount = 0;
  for (const scenario of hiringScenarios) {
    const org = facilityProviders[scenario.orgIdx % facilityProviders.length];
    const caregiver = caregiverProviders[scenario.cgIdx % caregiverProviders.length];
    if (!org || !caregiver) continue;

    const orgUser = allProviderUsers.find((u) => u.provider?.id === org.id);
    if (!orgUser) continue;

    const daysAgo = 3 + Math.floor(Math.random() * 18);

    const hiring = await prisma.hiringEngagement.create({
      data: {
        organizationId: org.id,
        caregiverId: caregiver.id,
        initiatedByProviderId: scenario.type === 'APPLICATION' ? caregiver.id : org.id,
        initiatedByRole: scenario.type === 'APPLICATION' ? 'CAREGIVER' : 'ORGANIZATION',
        type: scenario.type,
        status: scenario.status,
        positionTitle: scenario.position,
        expectedPayMin: scenario.payMin,
        expectedPayMax: scenario.payMax,
        scheduleType: ['FULL_TIME', 'PART_TIME', 'PER_DIEM'][Math.floor(Math.random() * 3)],
        initialMessage: hiringMessages[0],
        viewedByOrganization: true,
        viewedByCaregiver: scenario.status !== 'PENDING',
        createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
      },
    });

    // Add messages for non-pending
    if (scenario.status !== 'PENDING') {
      const cgUser = allProviderUsers.find((u) => u.provider?.id === caregiver.id);
      if (cgUser) {
        const msgCount = scenario.status === 'HIRED' ? 6 : 3;
        for (let m = 0; m < msgCount; m++) {
          const isOrg = m % 2 === 0;
          await prisma.hiringMessage.create({
            data: {
              hiringEngagementId: hiring.id,
              senderId: isOrg ? orgUser.id : cgUser.id,
              content: hiringMessages[m % hiringMessages.length],
              status: 'READ',
              readAt: new Date(Date.now() - (daysAgo - m) * 24 * 60 * 60 * 1000),
              createdAt: new Date(Date.now() - (daysAgo - m) * 24 * 60 * 60 * 1000),
            },
          });
        }
      }

      // Add interview events for INTERVIEWING/HIRED
      if (scenario.status === 'INTERVIEWING' || scenario.status === 'HIRED') {
        await prisma.scheduledEvent.create({
          data: {
            hiringEngagementId: hiring.id,
            eventType: 'INTERVIEW',
            proposedBy: orgUser.id,
            scheduledDate: scenario.status === 'HIRED'
              ? new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
              : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            scheduledTime: '2:00 PM',
            durationMinutes: 45,
            location: org.address || 'Video Call',
            isVideoCall: false,
            status: scenario.status === 'HIRED' ? 'COMPLETED' : 'ACCEPTED',
            notes: 'Please bring certifications and photo ID.',
          },
        });
      }
    }

    hiringCount++;
  }
  console.log(`[DEMO SEED] Created ${hiringCount} hiring engagements with messages\n`);

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================
  console.log('[DEMO SEED] Creating subscriptions...');

  let subCount = 0;
  for (let i = 0; i < orgUsers.length; i++) {
    const user = orgUsers[i];
    const tier = i < 3 ? 'PRO' as const : i < 7 ? 'BASIC' as const : 'FREE' as const;
    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.subscription.create({
      data: {
        userId: user.id,
        tier,
        status: 'ACTIVE',
        contactViewsUsed: tier === 'FREE' ? 3 : tier === 'BASIC' ? 8 : 25,
        contactViewsLimit: tier === 'FREE' ? 5 : tier === 'BASIC' ? 20 : null,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
    subCount++;
  }
  console.log(`[DEMO SEED] Created ${subCount} subscriptions\n`);

  // ============================================================================
  // SAVED PROVIDERS (families saving providers)
  // ============================================================================
  console.log('[DEMO SEED] Creating saved providers...');

  let savedCount = 0;
  const saveNotes = ['Top choice', 'Backup option', 'Need to visit', 'Great reviews', 'Good location', 'Affordable', 'Close to home', 'Recommended by friend'];

  for (let i = 0; i < 30; i++) {
    const familyUser = allFamilyUsers[i % allFamilyUsers.length];
    const provider = allProviders[i % allProviders.length];
    if (!familyUser.familyProfile) continue;

    try {
      await prisma.savedProvider.create({
        data: {
          familyProfileId: familyUser.familyProfile.id,
          providerId: provider.id,
          notes: saveNotes[i % saveNotes.length],
        },
      });
      savedCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`[DEMO SEED] Created ${savedCount} saved providers\n`);

  // ============================================================================
  // SAVED FAMILY PROFILES (providers saving families)
  // ============================================================================
  console.log('[DEMO SEED] Creating saved family profiles...');

  let savedFamilyCount = 0;
  for (let i = 0; i < 15; i++) {
    const providerUser = orgUsers[i % orgUsers.length];
    const familyUser = allFamilyUsers[i % allFamilyUsers.length];
    if (!familyUser.familyProfile) continue;

    try {
      await prisma.savedFamilyProfile.create({
        data: {
          userId: providerUser.id,
          familyProfileId: familyUser.familyProfile.id,
          notes: ['Great match', 'High priority', 'Follow up needed', 'Good budget fit'][i % 4],
        },
      });
      savedFamilyCount++;
    } catch {
      // Skip duplicates
    }
  }
  console.log(`[DEMO SEED] Created ${savedFamilyCount} saved family profiles\n`);

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  console.log('[DEMO SEED] Creating notifications...');

  const notificationBatch: Array<{
    userId: string;
    type: any;
    title: string;
    body: string;
    linkHref?: string;
    read: boolean;
  }> = [];

  // Family notifications
  for (let i = 0; i < Math.min(8, allFamilyUsers.length); i++) {
    const user = allFamilyUsers[i];
    notificationBatch.push(
      { userId: user.id, type: 'REQUEST_ACCEPTED', title: 'Request accepted!', body: `${facilityProviders[i % facilityProviders.length]?.name || 'A provider'} accepted your request`, linkHref: '/requests', read: false },
      { userId: user.id, type: 'MESSAGE', title: 'New message', body: `You have a new message from ${facilityProviders[i % facilityProviders.length]?.name || 'a provider'}`, linkHref: '/requests', read: i % 2 === 0 },
      { userId: user.id, type: 'TOUR_PROPOSED', title: 'Tour proposed', body: `A tour has been proposed for ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'][i % 5]} at ${10 + i}am`, linkHref: '/requests', read: i > 4 },
    );
    if (i < 4) {
      notificationBatch.push(
        { userId: user.id, type: 'TOUR_REMINDER', title: 'Tour tomorrow', body: `Reminder: You have a tour tomorrow at ${10 + i}am`, linkHref: '/requests', read: false },
        { userId: user.id, type: 'PROFILE_VIEW', title: 'Profile viewed', body: 'A provider viewed your care profile', read: true },
      );
    }
  }

  // Provider notifications
  for (let i = 0; i < Math.min(10, orgUsers.length); i++) {
    const user = orgUsers[i];
    notificationBatch.push(
      { userId: user.id, type: 'REQUEST_NEW', title: 'New inquiry', body: `${allFamilyUsers[i % allFamilyUsers.length]?.name || 'A family'} is interested in your services`, linkHref: '/provider/leads', read: false },
      { userId: user.id, type: 'MESSAGE', title: 'New message', body: 'You have a new message from a family', linkHref: '/provider/requests', read: i % 2 === 0 },
    );
  }

  // Caregiver notifications
  for (let i = 0; i < Math.min(6, caregiverUsers.length); i++) {
    const user = caregiverUsers[i];
    notificationBatch.push(
      { userId: user.id, type: 'REQUEST_NEW', title: 'Care request', body: 'A family is interested in hiring you', linkHref: '/provider/requests', read: false },
      { userId: user.id, type: 'MESSAGE', title: 'New message', body: 'You have a message about a care opportunity', linkHref: '/provider/requests', read: i % 2 === 0 },
    );
  }

  for (const notif of notificationBatch) {
    await prisma.notification.create({
      data: {
        userId: notif.userId,
        type: notif.type,
        title: notif.title,
        body: notif.body,
        linkHref: notif.linkHref,
        read: notif.read,
        readAt: notif.read ? new Date() : undefined,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`[DEMO SEED] Created ${notificationBatch.length} notifications\n`);

  // ============================================================================
  // QUESTIONS & ANSWERS
  // ============================================================================
  console.log('[DEMO SEED] Creating questions...');

  const questionData = [
    { q: 'What is included in the base monthly rate?', a: 'Our base rate includes a private room, three meals daily, housekeeping, laundry, medication management, and 24/7 nursing oversight. Additional services like physical therapy are available at extra cost.' },
    { q: 'Do you accept Medicare or Medicaid?', a: 'We accept Medicare for eligible skilled nursing services. We do not currently accept Medicaid but we do accept long-term care insurance and VA benefits.' },
    { q: 'What is your staff-to-resident ratio?', a: 'Our daytime ratio is 1:5 and evening is 1:6. We have an RN on-site 24/7 and an on-call physician available at all times.' },
    { q: 'Can residents bring their own furniture?', a: 'Yes! We encourage residents to personalize their rooms with their own furniture and personal items to make it feel like home.' },
    { q: 'What activities do you offer for memory care residents?', a: 'Our memory care program includes music therapy, art therapy, sensory stimulation activities, reminiscence groups, gentle exercise classes, and structured daily routines.' },
    { q: 'How do you handle medical emergencies?', a: 'We have trained nursing staff on-site 24/7 with emergency protocols in place. We are also located within 5 minutes of the nearest hospital.' },
    { q: 'Can family members visit at any time?', a: 'Family members are welcome to visit during our open visiting hours from 8am to 8pm. We can also arrange special visits outside these hours with advance notice.' },
    { q: 'Do you offer respite care or short-term stays?', a: 'Yes, we offer respite care stays starting from 3 days. This is a great way to try our community before making a long-term commitment.' },
    { q: 'What is the move-in process like?', a: null },
    { q: 'How do you accommodate dietary restrictions?', a: 'Our chef prepares meals that accommodate vegetarian, diabetic, heart-healthy, gluten-free, and other dietary needs. We work with each resident and their physician.' },
    { q: 'Do you have a waitlist?', a: null },
    { q: 'What happens if my loved ones needs change over time?', a: 'We offer a continuum of care. As needs change, we adjust the care plan accordingly. If a higher level of care is needed, we can help facilitate that transition.' },
    { q: 'Is there a trial period before committing long-term?', a: null },
    { q: 'What training do your caregivers receive?', a: 'All caregivers complete our comprehensive training program including CPR, first aid, dementia care, fall prevention, and ongoing continuing education.' },
    { q: 'Are pets allowed?', a: 'Small pets (under 25 lbs) are welcome in our assisted living units. We also have a community cat and a visiting therapy dog program.' },
  ];

  let questionCount = 0;
  for (let i = 0; i < questionData.length; i++) {
    const provider = facilityProviders[i % Math.min(8, facilityProviders.length)];
    const familyUser = allFamilyUsers[i % allFamilyUsers.length];
    const qd = questionData[i];

    await prisma.question.create({
      data: {
        providerId: provider.id,
        userId: familyUser.id,
        content: qd.q,
        answer: qd.a,
        answeredAt: qd.a ? new Date(Date.now() - (5 + i) * 24 * 60 * 60 * 1000) : undefined,
        likeCount: Math.floor(Math.random() * 8),
        createdAt: new Date(Date.now() - (10 + i * 3) * 24 * 60 * 60 * 1000),
      },
    });
    questionCount++;
  }
  console.log(`[DEMO SEED] Created ${questionCount} questions (${questionData.filter(q => q.a).length} answered)\n`);

  // ============================================================================
  // TAKEDOWN REQUESTS
  // ============================================================================
  console.log('[DEMO SEED] Creating takedown requests...');

  const unclaimedProviders = await prisma.provider.findMany({
    where: { claimed: false },
    take: 2,
  });

  for (let i = 0; i < Math.min(2, unclaimedProviders.length); i++) {
    await prisma.takedownRequest.create({
      data: {
        providerId: unclaimedProviders[i].id,
        reason: i === 0 ? 'BUSINESS_CLOSED' : 'INCORRECT_INFO',
        details: i === 0
          ? 'This facility permanently closed in 2024. Please remove this listing.'
          : 'The information on this page is outdated and incorrect. The phone number and address are wrong.',
        contactName: i === 0 ? 'John Smith' : 'Mary Wilson',
        contactEmail: i === 0 ? 'john.smith@example.com' : 'mary.wilson@example.com',
        status: i === 0 ? 'PENDING' : 'DENIED',
        reviewNotes: i === 1 ? 'Verified information is current. Contact updated provider for corrections.' : undefined,
        reviewedAt: i === 1 ? new Date() : undefined,
      },
    });
  }
  console.log('[DEMO SEED] Created 2 takedown requests\n');

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('='.repeat(60));
  console.log('[DEMO SEED] COMPREHENSIVE DEMO SEED COMPLETE');
  console.log('='.repeat(60));
  console.log('');
  console.log('  Base accounts (from seedLite):');
  console.log('    - 36 family accounts (with profile photos)');
  console.log('    - 36 facility/organization accounts (with photos)');
  console.log('    - 18 individual caregiver accounts');
  console.log('');
  console.log('  Enrichment data:');
  console.log(`    - ${unclaimedData.length} unclaimed providers (6 subtypes + 3 scenarios)`);
  console.log(`    - ${claimedIncompleteData.length} claimed-incomplete providers (for testing graceful degradation)`);
  console.log(`    - ${reviewIndex} reviews across providers (with google/olera sources)`);
  console.log(`    - ${createdEngagements.length} family↔provider engagements`);
  console.log(`    - ${eventCount} scheduled events (tours, consultations, interviews)`);
  console.log(`    - ${hiringCount} org↔caregiver hiring engagements`);
  console.log(`    - ${subCount} subscriptions (FREE/BASIC/PRO)`);
  console.log(`    - ${savedCount} saved providers`);
  console.log(`    - ${savedFamilyCount} saved family profiles`);
  console.log(`    - ${notificationBatch.length} notifications`);
  console.log(`    - ${questionCount} questions & answers`);
  console.log('    - 2 takedown requests');
  console.log('');
  console.log('  Password for all accounts: demo123');
  console.log('');
}
