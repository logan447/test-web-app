import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * Test account configuration
 * These are the canonical test accounts for auditing and demos
 */
const TEST_ACCOUNTS = {
  domain: '@test.olera.com',
  password: 'Test1234!',
  accounts: [
    {
      key: 'family',
      email: 'family@test.olera.com',
      name: 'Test Family User',
      role: 'FAMILY' as const,
      activeMode: 'FAMILY' as const,
      createFamilyProfile: true,
      createProviderIdentity: false,
    },
    {
      key: 'provider',
      email: 'provider@test.olera.com',
      name: 'Test Provider User',
      role: 'PROVIDER' as const,
      activeMode: 'PROVIDER' as const,
      createFamilyProfile: false,
      createProviderIdentity: true,
    },
    {
      key: 'newuser',
      email: 'newuser@test.olera.com',
      name: 'Test New User',
      role: 'FAMILY' as const,
      activeMode: 'FAMILY' as const,
      createFamilyProfile: false,
      createProviderIdentity: false,
    },
    {
      key: 'admin',
      email: 'admin@test.olera.com',
      name: 'Test Admin User',
      role: 'ADMIN' as const,
      activeMode: 'FAMILY' as const,
      createFamilyProfile: false,
      createProviderIdentity: false,
    },
  ],
};

/**
 * POST /api/admin/seed
 *
 * Seed test accounts for auditing and demos.
 * Requires ADMIN role.
 *
 * This endpoint is idempotent - safe to run multiple times.
 * Uses upsert to create or update accounts.
 */
export async function POST(req: Request) {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Admin access required' },
        },
        { status: 403 }
      );
    }

    // Parse options from request body
    const body = await req.json().catch(() => ({}));
    const { reset = false } = body;

    // Hash the test password
    const passwordHash = await hash(TEST_ACCOUNTS.password, 12);

    const results: Array<{
      email: string;
      action: 'created' | 'updated' | 'reset';
      hasProfile: boolean;
      hasIdentity: boolean;
    }> = [];

    for (const account of TEST_ACCOUNTS.accounts) {
      // If reset is true, delete existing account first
      if (reset) {
        const existingUser = await prisma.user.findUnique({
          where: { email: account.email },
        });

        if (existingUser) {
          // Delete related records first
          await prisma.familyProfile.deleteMany({ where: { userId: existingUser.id } });
          await prisma.providerIdentity.deleteMany({ where: { userId: existingUser.id } });
          await prisma.user.delete({ where: { id: existingUser.id } });
        }
      }

      // Upsert the user
      const user = await prisma.user.upsert({
        where: { email: account.email },
        update: {
          name: account.name,
          passwordHash,
          role: account.role,
          activeMode: account.activeMode,
        },
        create: {
          email: account.email,
          name: account.name,
          passwordHash,
          role: account.role,
          activeMode: account.activeMode,
        },
      });

      let hasProfile = false;
      let hasIdentity = false;

      // Create FamilyProfile if needed
      if (account.createFamilyProfile) {
        await prisma.familyProfile.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            lovedOneName: 'Test Loved One',
            ageRange: '75-80',
            gender: 'Female',
            careTypes: ['PERSONAL_CARE', 'COMPANION_CARE'],
            location: 'San Diego',
            city: 'San Diego',
            state: 'CA',
            zipCode: '92101',
            budgetMin: 3000,
            budgetMax: 5000,
            timeline: 'Within 3 months',
            description: 'Test family profile for Sprint auditing.',
          },
        });
        hasProfile = true;
      } else if (reset || account.key === 'newuser') {
        // Ensure newuser has no profile
        await prisma.familyProfile.deleteMany({ where: { userId: user.id } });
      }

      // Create ProviderIdentity if needed
      if (account.createProviderIdentity) {
        // First create or get the Provider listing
        const providerEmail = 'provider-listing@test.olera.com';
        let provider = await prisma.provider.findFirst({
          where: { email: providerEmail },
        });

        if (!provider) {
          provider = await prisma.provider.create({
            data: {
              userId: user.id,
              name: 'Sunrise Senior Care',
              providerType: 'ASSISTED_LIVING',
              description: 'A caring assisted living community dedicated to providing personalized care for seniors. Our experienced staff provides 24/7 support, engaging activities, and a warm, home-like environment.',
              email: providerEmail,
              phone: '(555) 123-4567',
              website: 'https://sunriseseniorcare.test',
              address: '123 Care Boulevard',
              city: 'San Diego',
              state: 'CA',
              zipCode: '92101',
              serviceRadius: 25,
              careTypesOffered: ['PERSONAL_CARE', 'MEMORY_CARE', 'RESPITE_CARE'],
              licensed: true,
              licenseNumber: 'CA-ASL-12345',
              yearsInBusiness: 15,
              capacity: 50,
            },
          });
        }

        await prisma.providerIdentity.upsert({
          where: { userId: user.id },
          update: {
            providerId: provider.id,
            onboardingComplete: true,
          },
          create: {
            userId: user.id,
            type: 'ORGANIZATION',
            providerId: provider.id,
            onboardingComplete: true,
          },
        });
        hasIdentity = true;
      } else if (reset || account.key === 'newuser') {
        // Ensure newuser has no identity
        await prisma.providerIdentity.deleteMany({ where: { userId: user.id } });
      }

      results.push({
        email: account.email,
        action: reset ? 'reset' : 'updated',
        hasProfile,
        hasIdentity,
      });
    }

    // Create a test consult request between family and provider
    const familyUser = await prisma.user.findUnique({
      where: { email: 'family@test.olera.com' },
      include: { familyProfile: true },
    });

    const providerUser = await prisma.user.findUnique({
      where: { email: 'provider@test.olera.com' },
      include: { providerIdentity: true },
    });

    if (familyUser?.familyProfile && providerUser?.providerIdentity?.providerId) {
      const provider = await prisma.provider.findUnique({
        where: { id: providerUser.providerIdentity.providerId },
      });

      if (provider) {
        // Check if a test request already exists
        const existingRequest = await prisma.consultRequest.findFirst({
          where: {
            senderId: familyUser.id,
            providerId: provider.id,
          },
        });

        if (!existingRequest) {
          await prisma.consultRequest.create({
            data: {
              senderId: familyUser.id,
              familyProfileId: familyUser.familyProfile.id,
              providerId: provider.id,
              message: 'Hello, I am interested in learning more about your assisted living services for my mother. She needs memory care support and we are looking for a caring environment close to San Diego. Could we schedule a tour?',
              status: 'PENDING',
              requestType: 'CONSULTATION',
              contactReason: 'Schedule a tour',
              preferredContactMethod: 'Phone',
            },
          });
        }
      }
    }

    console.log(`[SEED] Test accounts seeded by ${session.user.email}`);

    return NextResponse.json({
      success: true,
      data: {
        message: `Successfully ${reset ? 'reset' : 'seeded'} ${results.length} test accounts`,
        password: TEST_ACCOUNTS.password,
        accounts: results,
        instructions: [
          'Test accounts are ready for use',
          `Password for all accounts: ${TEST_ACCOUNTS.password}`,
          'See /admin/seed for account details',
        ],
      },
    });

  } catch (error) {
    console.error('[SEED] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to seed test accounts',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/seed
 *
 * Check status of test accounts.
 * Requires ADMIN role.
 */
export async function GET() {
  try {
    // Verify admin authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'FORBIDDEN', message: 'Admin access required' },
        },
        { status: 403 }
      );
    }

    // Check each test account
    const accountStatuses = await Promise.all(
      TEST_ACCOUNTS.accounts.map(async (account) => {
        const user = await prisma.user.findUnique({
          where: { email: account.email },
          include: {
            familyProfile: true,
            providerIdentity: true,
          },
        });

        return {
          email: account.email,
          name: account.name,
          expectedRole: account.role,
          expectedMode: account.activeMode,
          exists: !!user,
          actualRole: user?.role || null,
          actualMode: user?.activeMode || null,
          hasFamilyProfile: !!user?.familyProfile,
          hasProviderIdentity: !!user?.providerIdentity,
          isCorrectlyConfigured: user
            ? user.role === account.role &&
              user.activeMode === account.activeMode &&
              (account.createFamilyProfile ? !!user.familyProfile : true) &&
              (account.createProviderIdentity ? !!user.providerIdentity : true)
            : false,
        };
      })
    );

    const allConfigured = accountStatuses.every((a) => a.isCorrectlyConfigured);

    return NextResponse.json({
      success: true,
      data: {
        status: allConfigured ? 'ready' : 'needs_seeding',
        password: TEST_ACCOUNTS.password,
        accounts: accountStatuses,
        summary: {
          total: accountStatuses.length,
          existing: accountStatuses.filter((a) => a.exists).length,
          correctlyConfigured: accountStatuses.filter((a) => a.isCorrectlyConfigured).length,
        },
      },
    });

  } catch (error) {
    console.error('[SEED] Error checking status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check seed status',
        },
      },
      { status: 500 }
    );
  }
}
