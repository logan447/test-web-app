import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * POST /api/setup
 *
 * Bootstrap endpoint to create the initial admin account.
 * Only works if no admin users exist in the database.
 * This is a one-time setup endpoint for initial deployment.
 */
export async function POST() {
  try {
    // Check if any admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'ADMIN_EXISTS',
            message: 'An admin account already exists. Use the login page.',
          },
        },
        { status: 400 }
      );
    }

    // Create the admin account
    const passwordHash = await hash('test1234!', 12);

    const admin = await prisma.user.create({
      data: {
        email: 'admin@test.olera.com',
        name: 'Test Admin User',
        passwordHash,
        role: 'ADMIN',
        activeMode: 'FAMILY',
      },
    });

    console.log(`[SETUP] Admin account created: ${admin.email}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Admin account created successfully',
        email: admin.email,
        password: 'test1234!',
        instructions: [
          'You can now log in at /login',
          'Use the admin account to access /admin/seed',
          'Run the Full Demo Seed to create 90+ demo accounts',
        ],
      },
    });

  } catch (error) {
    console.error('[SETUP] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create admin account',
          details: error instanceof Error ? error.message : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/setup
 *
 * Check if setup is needed (no admin exists).
 */
export async function GET() {
  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    return NextResponse.json({
      success: true,
      data: {
        needsSetup: !existingAdmin,
        message: existingAdmin
          ? 'Admin account exists. Setup complete.'
          : 'No admin account found. POST to /api/setup to create one.',
      },
    });

  } catch (error) {
    console.error('[SETUP] Error checking status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check setup status',
        },
      },
      { status: 500 }
    );
  }
}
