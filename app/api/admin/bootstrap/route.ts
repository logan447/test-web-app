import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

/**
 * POST /api/admin/bootstrap
 *
 * One-time bootstrap endpoint to create the initial admin account.
 * This endpoint ONLY works when no admin accounts exist in the database.
 *
 * Security:
 * - Only functions when admin count is 0
 * - Cannot be used to create additional admins
 * - Returns a temporary password that should be changed
 *
 * Usage:
 * 1. Deploy the application
 * 2. POST to /api/admin/bootstrap with { email, name }
 * 3. Receive temporary password
 * 4. Login and change password
 */
export async function POST(req: Request) {
  try {
    // Check if any admin already exists
    const existingAdminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    if (existingAdminCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BOOTSTRAP_DISABLED',
            message: 'Bootstrap is disabled. An admin account already exists. Use the admin panel to create additional accounts.',
          },
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and name are required',
          },
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email format',
          },
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_EXISTS',
            message: 'A user with this email already exists',
          },
        },
        { status: 409 }
      );
    }

    // Generate a temporary password
    const tempPassword = generateTempPassword();
    const passwordHash = await hash(tempPassword, 12);

    // Create the admin account
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: 'ADMIN',
        activeMode: 'FAMILY',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`[BOOTSTRAP] Admin account created: ${email}`);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Admin account created successfully',
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        },
        temporaryPassword: tempPassword,
        instructions: [
          '1. Save this temporary password securely',
          '2. Go to the login page and sign in',
          '3. Change your password immediately in Settings',
          '4. This bootstrap endpoint is now disabled',
        ],
      },
    });

  } catch (error) {
    console.error('[BOOTSTRAP] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create admin account',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bootstrap
 *
 * Check if bootstrap is available (no admins exist)
 */
export async function GET() {
  try {
    const existingAdminCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    });

    return NextResponse.json({
      success: true,
      data: {
        bootstrapAvailable: existingAdminCount === 0,
        adminCount: existingAdminCount,
        message: existingAdminCount === 0
          ? 'No admin exists. Bootstrap is available.'
          : 'Admin account(s) exist. Bootstrap is disabled.',
      },
    });

  } catch (error) {
    console.error('[BOOTSTRAP] Error checking status:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to check bootstrap status',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure temporary password
 */
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const special = '!@#$%';
  let password = '';

  // 12 alphanumeric characters
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Add 2 special characters
  for (let i = 0; i < 2; i++) {
    password += special.charAt(Math.floor(Math.random() * special.length));
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}
