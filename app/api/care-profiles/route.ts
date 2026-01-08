import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { CareType } from "@prisma/client";

const careProfileSchema = z.object({
  // About loved one (Sprint 2)
  profilePhoto: z.string().optional().nullable(),
  lovedOneName: z.string().optional().nullable(),
  ageRange: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  livingSituation: z.string().optional().nullable(),
  relationship: z.string().optional().nullable(),
  // Care needs assessment (Sprint 3)
  careLevel: z.string().optional().nullable(),
  medicalConditions: z.array(z.string()).optional(),
  mobilityStatus: z.string().optional().nullable(),
  dailyLivingAssistance: z.array(z.string()).optional(),
  additionalNeeds: z.string().optional().nullable(),
  // Personality & preferences (Sprint 4)
  personalityTraits: z.array(z.string()).optional(),
  hobbiesInterests: z.array(z.string()).optional(),
  communicationPreferences: z.array(z.string()).optional(),
  culturalBackground: z.string().optional().nullable(),
  religiousPreferences: z.string().optional().nullable(),
  languagePreferences: z.array(z.string()).optional(),
  petPreferences: z.string().optional().nullable(),
  // Care needs
  careTypes: z.array(z.nativeEnum(CareType)),
  location: z.string(),
  city: z.string(),
  state: z.string(),
  zipCode: z.string(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  timeline: z.string().optional(),
  insurance: z.string().optional(),
  description: z.string().optional(),
  isPublic: z.boolean().optional(),
});

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error fetching care profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch care profile" },
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
    const data = careProfileSchema.parse(body);

    // Check if profile already exists
    const existingProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: "Care profile already exists" },
        { status: 400 }
      );
    }

    const profile = await prisma.familyProfile.create({
      data: {
        userId: session.user.id,
        ...data,
      },
    });

    return NextResponse.json(profile, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating care profile:", error);
    return NextResponse.json(
      { error: "Failed to create care profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = careProfileSchema.partial().parse(body);

    const profile = await prisma.familyProfile.update({
      where: { userId: session.user.id },
      data,
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating care profile:", error);
    return NextResponse.json(
      { error: "Failed to update care profile" },
      { status: 500 }
    );
  }
}
