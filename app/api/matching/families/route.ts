import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/matching/families
 * Find families that match provider's criteria
 * Body: { city, careTypes: string[] }
 */
export async function POST(req: Request) {
  try {
    const { city, careTypes } = await req.json();

    if (!city || !careTypes || !Array.isArray(careTypes)) {
      return NextResponse.json(
        { error: 'City and careTypes are required' },
        { status: 400 }
      );
    }

    // Find families that match provider's criteria
    const matches = await prisma.familyProfile.findMany({
      where: {
        city: {
          equals: city,
          mode: 'insensitive',
        },
        careType: {
          hasSome: careTypes as any, // At least one care type matches
        },
        isPublic: true, // Only visible families
        visibleToProviders: true,
      },
      select: {
        id: true,
        city: true,
        state: true,
        careType: true,
        careNeeds: true,
        budgetMin: true,
        budgetMax: true,
        timeline: true,
        whoNeedsCare: true,
        createdAt: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 50, // Reasonable limit
    });

    return NextResponse.json({
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('Error searching families:', error);
    return NextResponse.json(
      { error: 'Failed to search families' },
      { status: 500 }
    );
  }
}
