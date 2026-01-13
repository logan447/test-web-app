import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/matching/search
 *
 * Sprint 0: Simple boolean matching algorithm
 * Matches providers to families based on:
 * 1. Location (city match)
 * 2. Care type (at least one overlap)
 * 3. Visibility (provider must be visible)
 *
 * Later sprints will add: distance, match percentage, scoring, ranking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, state, careTypes, userType = 'family' } = body;

    // Validate required fields
    if (!city || !careTypes || careTypes.length === 0) {
      return NextResponse.json(
        { error: 'City and care types are required' },
        { status: 400 }
      );
    }

    // Sprint 0: Simple boolean matching
    // Find providers where:
    // - City matches exactly
    // - At least one care type overlaps
    // - Visibility is ON (availableForFamilies = true)
    const matches = await prisma.provider.findMany({
      where: {
        // Location match
        city: {
          equals: city,
          mode: 'insensitive', // Case-insensitive matching
        },

        // Care type match (at least one overlap)
        careTypesOffered: {
          hasSome: careTypes,
        },

        // Visibility check
        availableForFamilies: true,

        // Active providers only
        active: true,
      },
      select: {
        id: true,
        name: true,
        providerType: true,
        description: true,
        city: true,
        state: true,
        zipCode: true,
        address: true,
        careTypesOffered: true,
        primaryPhoto: true,
        photos: true,
        phone: true,
        website: true,
        priceMin: true,
        priceMax: true,
        averageRating: true,
        reviewCount: true,
        licensed: true,
        claimed: true,
        verified: true,
      },
      // Sprint 0: No ranking/scoring - just sort by recently updated
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      matches,
      count: matches.length,
      searchCriteria: {
        city,
        state,
        careTypes,
      },
      // Sprint 0: No match percentage or scoring
      // Future sprints will add: matchPercentage, score, distance
    });
  } catch (error) {
    console.error('Error in matching search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matching/search
 * Query params: city, state, careTypes (comma-separated)
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get('city');
    const careTypesParam = searchParams.get('careTypes');

    if (!city || !careTypesParam) {
      return NextResponse.json(
        { error: 'City and careTypes are required' },
        { status: 400 }
      );
    }

    const careTypes = careTypesParam.split(',').map(t => t.trim());

    const matches = await prisma.provider.findMany({
      where: {
        city: {
          equals: city,
          mode: 'insensitive',
        },
        careTypesOffered: {
          hasSome: careTypes,
        },
        availableForFamilies: true,
        active: true,
      },
      select: {
        id: true,
        name: true,
        providerType: true,
        description: true,
        city: true,
        state: true,
        careTypesOffered: true,
        primaryPhoto: true,
        priceMin: true,
        priceMax: true,
        averageRating: true,
        reviewCount: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({
      matches,
      count: matches.length,
    });
  } catch (error) {
    console.error('Error in matching search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
