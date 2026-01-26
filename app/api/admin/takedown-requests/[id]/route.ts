import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/takedown-requests/[id] - Approve or reject a takedown request
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, reviewNotes } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Find the takedown request
    const takedownRequest = await prisma.takedownRequest.findUnique({
      where: { id },
      include: {
        provider: {
          select: { id: true, name: true },
        },
      },
    });

    if (!takedownRequest) {
      return NextResponse.json(
        { error: 'Takedown request not found' },
        { status: 404 }
      );
    }

    if (takedownRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'This request has already been reviewed' },
        { status: 400 }
      );
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'DENIED';

    // Update the takedown request
    const updatedRequest = await prisma.takedownRequest.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedAt: new Date(),
        reviewedBy: session.user.id,
        reviewNotes: reviewNotes?.trim() || null,
      },
    });

    // If approved, update the provider listing
    if (action === 'approve') {
      await prisma.provider.update({
        where: { id: takedownRequest.providerId },
        data: {
          // Mark as taken down - could also soft delete or hide
          // For now, we'll just unclaim and add a note
          claimed: false,
          // You might want to add a 'status' field to Provider for ACTIVE/TAKEN_DOWN/HIDDEN
        },
      });

      // TODO: Send email notification to requester about approval
    } else {
      // TODO: Send email notification to requester about rejection with notes
    }

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      message: `Takedown request ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
    });
  } catch (error) {
    console.error('Error updating takedown request:', error);
    return NextResponse.json(
      { error: 'Failed to update takedown request' },
      { status: 500 }
    );
  }
}

// GET /api/admin/takedown-requests/[id] - Get a specific takedown request
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Check admin access
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const takedownRequest = await prisma.takedownRequest.findUnique({
      where: { id },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            providerType: true,
            description: true,
            address: true,
            city: true,
            state: true,
            zipCode: true,
            phone: true,
            email: true,
            website: true,
            claimed: true,
            coverPhoto: true,
          },
        },
      },
    });

    if (!takedownRequest) {
      return NextResponse.json(
        { error: 'Takedown request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ request: takedownRequest });
  } catch (error) {
    console.error('Error fetching takedown request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch takedown request' },
      { status: 500 }
    );
  }
}
