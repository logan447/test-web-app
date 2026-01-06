import { PrismaClient, ProviderType, CareType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create sample providers
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

  for (const provider of providers) {
    await prisma.provider.create({
      data: provider,
    });
  }

  console.log('✅ Seeded 8 sample providers');
  console.log('✅ Database seeding complete!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
