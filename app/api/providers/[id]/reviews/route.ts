import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateOleraScore } from '@/lib/oleraScore';

// GET /api/providers/[id]/reviews - Fetch reviews with pagination
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'recent'; // recent, highest, lowest

    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy: any = { createdAt: 'desc' }; // Default: most recent
    if (sortBy === 'highest') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'lowest') {
      orderBy = { rating: 'asc' };
    }

    // Fetch reviews with pagination
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: {
          providerId: id,
          approved: true, // Only show approved reviews
        },
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.review.count({
        where: {
          providerId: id,
          approved: true,
        },
      }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/providers/[id]/reviews - Submit a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, title, content, relationship, lengthOfStay } = body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (!content || content.trim().length < 10) {
      return NextResponse.json(
        { error: 'Review content must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Check if provider exists
    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      );
    }

    // Check if user has already reviewed this provider
    const existingReview = await prisma.review.findUnique({
      where: {
        providerId_userId: {
          providerId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this provider' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        providerId: id,
        userId: session.user.id,
        rating,
        title: title?.trim() || null,
        content: content.trim(),
        relationship: relationship?.trim() || null,
        lengthOfStay: lengthOfStay?.trim() || null,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    // Update provider's aggregate rating and count
    const aggregateResult = await prisma.review.aggregate({
      where: {
        providerId: id,
        approved: true,
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    // Calculate the new Olera Score
    const oleraResult = calculateOleraScore({
      averageRating: aggregateResult._avg.rating,
      googleRating: null, // Not available in MVP
      reviewCount: aggregateResult._count,
      provider: {
        name: provider.name,
        providerType: provider.providerType,
        description: provider.description,
        address: provider.address,
        city: provider.city,
        state: provider.state,
        phone: provider.phone,
        email: provider.email,
        website: provider.website,
        careTypesOffered: provider.careTypesOffered,
        licensed: provider.licensed,
        backgroundChecked: provider.backgroundChecked,
        insuranceVerified: provider.insuranceVerified,
        coverPhoto: provider.coverPhoto,
        photos: provider.photos,
        priceMin: provider.priceMin,
        priceMax: provider.priceMax,
        priceDescription: provider.priceDescription,
        claimed: provider.claimed,
      },
    });

    await prisma.provider.update({
      where: { id },
      data: {
        averageRating: aggregateResult._avg.rating,
        reviewCount: aggregateResult._count,
        oleraScore: oleraResult.score,
        oleraScoreUpdatedAt: new Date(),
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
