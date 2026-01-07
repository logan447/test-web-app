import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user already has provider identity
    const existingIdentity = await prisma.providerIdentity.findUnique({
      where: { userId: session.user.id },
    });

    if (existingIdentity) {
      return NextResponse.json(
        { error: "Provider identity already exists" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { type } = body;

    // Validate type
    if (!type || !['ORGANIZATION', 'INDIVIDUAL'].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be ORGANIZATION or INDIVIDUAL" },
        { status: 400 }
      );
    }

    // Create provider identity
    const providerIdentity = await prisma.providerIdentity.create({
      data: {
        userId: session.user.id,
        type,
        onboardingComplete: false,
      },
    });

    // Update user's active mode to PROVIDER
    await prisma.user.update({
      where: { id: session.user.id },
      data: { activeMode: 'PROVIDER' },
    });

    return NextResponse.json({
      success: true,
      providerIdentity,
    });

  } catch (error) {
    console.error("Error creating provider identity:", error);
    return NextResponse.json(
      { error: "Failed to create provider identity" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const providerIdentity = await prisma.providerIdentity.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      hasIdentity: !!providerIdentity,
      providerIdentity,
    });

  } catch (error) {
    console.error("Error fetching provider identity:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider identity" },
      { status: 500 }
    );
  }
}
