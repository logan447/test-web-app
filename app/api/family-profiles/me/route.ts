import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: "Family profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching family profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch family profile" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      careTypes,
      location,
      city,
      state,
      zipCode,
      budgetMin,
      budgetMax,
      timeline,
      insurance,
      description,
      isPublic,
    } = body;

    // Check if family profile already exists
    const existingProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Family profile already exists" },
        { status: 400 }
      );
    }

    const profile = await prisma.familyProfile.create({
      data: {
        userId: session.user.id,
        careTypes,
        location,
        city,
        state,
        zipCode,
        budgetMin,
        budgetMax,
        timeline,
        insurance,
        description,
        isPublic: isPublic ?? false,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    console.error("Error creating family profile:", error);
    return NextResponse.json(
      { error: "Failed to create family profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      careTypes,
      location,
      city,
      state,
      zipCode,
      budgetMin,
      budgetMax,
      timeline,
      insurance,
      description,
      isPublic,
    } = body;

    const profile = await prisma.familyProfile.update({
      where: { userId: session.user.id },
      data: {
        careTypes,
        location,
        city,
        state,
        zipCode,
        budgetMin,
        budgetMax,
        timeline,
        insurance,
        description,
        isPublic,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error updating family profile:", error);
    return NextResponse.json(
      { error: "Failed to update family profile" },
      { status: 500 }
    );
  }
}
