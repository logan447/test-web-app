import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const provider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!provider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    // For INDEPENDENT_CAREGIVER, gate contact info until engagement is ACCEPTED
    // Organizations: everything always visible
    let contactRevealed = true;

    if (provider.providerType === "INDEPENDENT_CAREGIVER" && session?.user?.id) {
      // Check if this is the provider owner
      const isOwner = provider.userId === session.user.id;

      if (!isOwner) {
        // Find family profile for current user to check for accepted engagement
        const viewerFamily = await prisma.familyProfile.findFirst({
          where: { userId: session.user.id },
          select: { id: true },
        });

        if (viewerFamily) {
          // Check for ACCEPTED or COMPLETED engagement
          const acceptedEngagement = await prisma.consultRequest.findFirst({
            where: {
              familyProfileId: viewerFamily.id,
              providerId: id,
              status: { in: ["ACCEPTED", "COMPLETED"] },
            },
          });
          contactRevealed = !!acceptedEngagement;
        } else {
          // No family profile = can't have engagement
          contactRevealed = false;
        }
      }
    }

    // Build response
    const response: any = {
      ...provider,
      contactRevealed,
    };

    // For individual caregivers without accepted engagement, hide contact info
    if (provider.providerType === "INDEPENDENT_CAREGIVER" && !contactRevealed) {
      response.phone = null;
      response.email = null;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Verify the provider belongs to the logged-in user
    const existingProvider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    if (existingProvider.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized to update this provider" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      name,
      providerType,
      description,
      careTypesOffered,
      address,
      city,
      state,
      zipCode,
      phone,
      email,
      website,
      yearsInBusiness,
      licenseNumber,
      active,
      availableForFamilies,
      availableForOrganizations,
    } = body;

    const provider = await prisma.provider.update({
      where: { id },
      data: {
        name,
        providerType,
        description,
        careTypesOffered,
        address,
        city,
        state,
        zipCode,
        phone,
        email,
        website,
        yearsInBusiness,
        licenseNumber,
        active,
        availableForFamilies,
        availableForOrganizations,
      },
    });

    return NextResponse.json(provider);
  } catch (error) {
    console.error("Error updating provider:", error);
    return NextResponse.json(
      { error: "Failed to update provider" },
      { status: 500 }
    );
  }
}
