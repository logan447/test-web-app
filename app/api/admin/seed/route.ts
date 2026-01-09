import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Import and run the seed logic directly
    const { main } = await import('@/prisma/seed');

    // Capture console output
    const logs: string[] = [];
    const originalLog = console.log;
    console.log = (...args: any[]) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    try {
      await main();
      console.log = originalLog;

      return NextResponse.json({
        success: true,
        message: 'Database seeded successfully',
        output: logs.join('\n'),
      });
    } catch (seedError: any) {
      console.log = originalLog;
      throw seedError;
    }
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        error: 'Failed to seed database',
        details: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
