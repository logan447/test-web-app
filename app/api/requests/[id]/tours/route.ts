import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Fetch all tour appointments for a request
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;

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

    const isFamilyUser = request.familyProfile.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all tour appointments for this request
    const tours = await prisma.tourAppointment.findMany({
      where: { requestId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tours);
  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "Failed to fetch tours" },
      { status: 500 }
    );
  }
}

// POST - Create a new tour proposal
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: requestId } = await params;
    const body = await req.json();
    const { proposedDate, proposedTime, notes } = body;

    // Validate required fields
    if (!proposedDate || !proposedTime) {
      return NextResponse.json(
        { error: "proposedDate and proposedTime are required" },
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

    const isFamilyUser = request.familyProfile.user?.id === session.user.id;
    const isProviderUser = request.provider.user?.id === session.user.id;

    if (!isFamilyUser && !isProviderUser) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create tour appointment
    const tour = await prisma.tourAppointment.create({
      data: {
        requestId,
        proposedBy: session.user.id,
        proposedDate: new Date(proposedDate),
        proposedTime,
        notes: notes || null,
        status: "PROPOSED",
      },
    });

    return NextResponse.json(tour, { status: 201 });
  } catch (error) {
    console.error("Error creating tour:", error);
    return NextResponse.json(
      { error: "Failed to create tour" },
      { status: 500 }
    );
  }
}
