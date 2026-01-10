import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { provider: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Calculate mode the same way auth.ts does
    let mode: 'FAMILY' | 'PROVIDER' = 'FAMILY';

    if (user.provider && user.role === 'PROVIDER') {
      const provider = user.provider;

      let completedSections = 0;
      const totalSections = 6;

      // 1. Basic Info
      if (provider.name && provider.description && provider.address) {
        completedSections++;
      }

      // 2. Services
      if (provider.careTypesOffered && provider.careTypesOffered.length > 0) {
        completedSections++;
      }

      // 3. Photos
      if (provider.photos && provider.photos.length > 0) {
        completedSections++;
      }

      // 4. Licensing
      if (provider.licenseNumber) {
        completedSections++;
      }

      // 5. Pricing
      if (provider.priceMin || provider.priceMax || provider.privateRoomMin || provider.semiPrivateRoomMin) {
        completedSections++;
      }

      // 6. Staff
      if ((provider.staffCredentials && provider.staffCredentials.length > 0) ||
          provider.staffToResidentRatio ||
          provider.daytimeStaffRatio) {
        completedSections++;
      }

      const completionPercentage = Math.round((completedSections / totalSections) * 100);

      if (completionPercentage >= 15) {
        mode = 'PROVIDER';
      }
    }

    return NextResponse.json({ mode });

  } catch (error) {
    console.error("Error checking user mode:", error);
    return NextResponse.json(
      { error: "Failed to check user mode" },
      { status: 500 }
    );
  }
}
