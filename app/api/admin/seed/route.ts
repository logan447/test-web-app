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
        await prisma.providerIdentity.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            type: 'INDIVIDUAL',
            onboardingComplete: false,
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
