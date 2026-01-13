import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/providers/search-unclaimed
 *
 * Search for unclaimed provider profiles based on name and city
 * Used during onboarding to allow organizations to claim existing pages
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, city } = body;

    // Validate required fields
    if (!name || !city) {
      return NextResponse.json(
        { error: 'Name and city are required' },
        { status: 400 }
      );
    }

    // Search for unclaimed providers with similar name in the same city
    const unclaimedProviders = await prisma.provider.findMany({
      where: {
        // Not claimed yet
        claimed: false,

        // City match (case-insensitive)
        city: {
          equals: city,
          mode: 'insensitive',
        },

        // Name similarity search (case-insensitive contains)
        name: {
          contains: name,
          mode: 'insensitive',
        },

        // Active profiles only
        active: true,
      },
      select: {
        id: true,
        name: true,
        providerType: true,
        description: true,
        city: true,
        state: true,
        address: true,
        careTypesOffered: true,
        primaryPhoto: true,
        phone: true,
        website: true,
        licensed: true,
        licenseNumber: true,
        seededFrom: true,
      },
      // Limit results to top 5 matches
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      profiles: unclaimedProviders,
      count: unclaimedProviders.length,
    });
  } catch (error) {
    console.error('Error searching unclaimed providers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
