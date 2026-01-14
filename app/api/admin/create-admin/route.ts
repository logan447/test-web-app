import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function createAdminAccount() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Upsert admin@olera.com
    const admin = await prisma.user.upsert({
      where: { email: 'admin@olera.com' },
      update: {
        role: 'ADMIN',
        name: 'Admin User',
      },
      create: {
        email: 'admin@olera.com',
        passwordHash: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
      },
    });

    // Also upgrade user3@test.com if exists
    let user3Updated = false;
    try {
      await prisma.user.update({
        where: { email: 'user3@test.com' },
        data: { role: 'ADMIN' },
      });
      user3Updated = true;
    } catch (error) {
      // user3@test.com doesn't exist, skip
    }

    return {
      success: true,
      message: 'Admin accounts created/updated',
      accounts: [
        { email: 'admin@olera.com', password: 'admin123', created: true },
        ...(user3Updated ? [{ email: 'user3@test.com', password: 'password123', upgraded: true }] : []),
      ],
    };
  } catch (error: any) {
    console.error('Error creating admin:', error);
    return {
      success: false,
      error: 'Failed to create admin accounts',
      details: error.message,
    };
  }
}

/**
 * GET /api/admin/create-admin
 * POST /api/admin/create-admin
 *
 * Creates admin@olera.com account
 * For initial setup only - no auth required
 */
export async function GET() {
  const result = await createAdminAccount();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST() {
  const result = await createAdminAccount();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}
