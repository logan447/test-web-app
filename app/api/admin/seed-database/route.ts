import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, ProviderType, CareType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * POST /api/admin/seed-database
 *
 * Seeds the database with test data for Sprint 0 testing.
 * Creates families and providers in various cities for matching tests.
 *
 * Security: Only allow in development or for admin users
 */
export async function POST(req: Request) {
  try {
    // Security note: In production, consider adding authentication
    // or setting ALLOW_SEED=true environment variable
    console.log('🌱 Starting database seed...');

    // Create demo password hash (password: "demo123")
    const demoPassword = await hash('demo123', 12);

    // Clear existing test data (only demo accounts)
    console.log('🗑️  Clearing existing demo data...');
    const demoEmails = ['family.test@demo.com', 'provider.test@demo.com'];
    await prisma.user.deleteMany({
      where: { email: { in: demoEmails } },
    });

    // Create test family in San Diego
    const family1 = await prisma.user.create({
      data: {
        email: 'family.test@demo.com',
        name: 'Test Family',
        passwordHash: demoPassword,
        role: 'FAMILY',
        phone: '(619) 555-9999',
        activeMode: 'FAMILY',
        familyProfile: {
          create: {
            lovedOneName: 'Test Patient',
            ageRange: '80-85',
            gender: 'Female',
            careType: [CareType.MEMORY_CARE, CareType.PERSONAL_CARE],
            careNeeds: ['Daily assistance', 'Medication management'],
            location: 'San Diego, CA',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92101',
            budgetMin: 4000,
            budgetMax: 6000,
            timeline: 'Within 3 months',
            description: 'Looking for memory care facility for my mother.',
            isPublic: true,
            visibleToProviders: true,
          },
        },
      },
    });

    // Create test provider in San Diego
    const provider1 = await prisma.user.create({
      data: {
        email: 'provider.test@demo.com',
        name: 'Test Provider',
        passwordHash: demoPassword,
        role: 'PROVIDER',
        phone: '(619) 555-8888',
        activeMode: 'PROVIDER',
        provider: {
          create: {
            name: 'Sunny Hills Memory Care',
            providerType: ProviderType.MEMORY_CARE,
            description: 'Specialized memory care facility in San Diego',
            careTypesOffered: [CareType.MEMORY_CARE, CareType.PERSONAL_CARE],
            address: '123 Memory Lane, San Diego, CA 92101',
            street: '123 Memory Lane',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92101',
            phone: '(619) 555-8888',
            email: 'provider.test@demo.com',
            website: 'https://example.com',
            licensed: true,
            licenseNumber: 'CA-MC-12345',
            licenseState: 'CA',
            priceMin: 4000,
            priceMax: 7000,
            availableForFamilies: true,
            availableForOrganizations: false,
            capacity: 50,
            availableSpots: 5,
            primaryPhoto: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
            photos: ['https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800'],
          },
        },
      },
    });

    console.log('✅ Seed data created successfully');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      accounts: [
        {
          email: 'family.test@demo.com',
          password: 'demo123',
          type: 'Family',
          profile: 'Needs Memory Care in San Diego',
        },
        {
          email: 'provider.test@demo.com',
          password: 'demo123',
          type: 'Provider',
          profile: 'Offers Memory Care in San Diego',
        },
      ],
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: String(error) },
      { status: 500 }
    );
  }
}
