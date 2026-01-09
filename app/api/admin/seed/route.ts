import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient, ProviderType, CareType } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Check authorization - only allow admin users or use a secret token
    const session = await getServerSession(authOptions);
    const { secret } = await req.json();

    // Check for secret token or admin session
    const SEED_SECRET = process.env.SEED_SECRET || 'your-secret-seed-token-here';

    if (secret !== SEED_SECRET && (!session || session.user.role !== 'PROVIDER')) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('🌱 Starting database seed...');

    // Import and run the seed logic
    const { exec } = require('child_process');
    const { promisify } = require('util');
    const execPromise = promisify(exec);

    // Run the seed script
    const { stdout, stderr } = await execPromise('npx prisma db seed');

    console.log('Seed output:', stdout);
    if (stderr) console.error('Seed errors:', stderr);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      output: stdout,
    });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
