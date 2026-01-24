import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyTourAccepted } from "@/lib/notificationService";

// PATCH - Accept or decline a tour proposal
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; tourId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId, tourId } = await params;
    const body = await req.json();
    const { status } = body;

    // Validate status
    if (!["ACCEPTED", "DECLINED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be ACCEPTED, DECLINED, or CANCELLED" },
        { status: 400 }
      );
    }

    // Verify user is participant in this request
    const request = await prisma.consultRequest.findUnique({
      where: { id: requestId },
      include: {
        familyProfile: {
          include: { user: true },
        },
        provider: {
          include: { user: true },
        },
      },
    });

    if (!request) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    const isFamilyUser = request.familyProfile?.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the tour appointment
    const tour = await prisma.tourAppointment.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return NextResponse.json(
        { error: "Tour not found" },
        { status: 404 }
      );
    }

    // Verify tour belongs to this request
    if (tour.requestId !== requestId) {
      return NextResponse.json(
        { error: "Tour does not belong to this request" },
        { status: 400 }
      );
    }

    // Authorization check:
    // - For CANCELLED: only the proposer can cancel
    // - For ACCEPTED/DECLINED: only the recipient (not the proposer) can accept/decline
    if (status === "CANCELLED") {
      if (tour.proposedBy !== session.user.id) {
        return NextResponse.json(
          { error: "Only the proposer can cancel a tour" },
          { status: 403 }
        );
      }
    } else {
      // ACCEPTED or DECLINED - must not be the proposer
      if (tour.proposedBy === session.user.id) {
        return NextResponse.json(
          { error: "You cannot accept or decline your own tour proposal" },
          { status: 403 }
        );
      }
    }

    // Update tour status
    const updatedTour = await prisma.tourAppointment.update({
      where: { id: tourId },
      data: { status },
    });

    // Send email notification for accepted tours (non-blocking)
    if (status === "ACCEPTED") {
      notifyTourAccepted({
        requestId,
        acceptedByUserId: session.user.id,
        confirmedDate: tour.proposedDate.toISOString(),
        confirmedTime: tour.proposedTime,
      }).catch(console.error);
    }

    return NextResponse.json(updatedTour);
  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "Failed to update tour" },
      { status: 500 }
    );
  }
}
