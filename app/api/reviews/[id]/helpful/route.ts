import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT /api/reviews/[id]/helpful - Mark review as helpful
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if review exists
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Increment helpful count
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({
      helpfulCount: updatedReview.helpfulCount,
    });
  } catch (error) {
    console.error('Error updating helpful count:', error);
    return NextResponse.json(
      { error: 'Failed to update helpful count' },
      { status: 500 }
    );
  }
}
