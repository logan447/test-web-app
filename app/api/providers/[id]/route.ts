import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canEditProviderProfile } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    return NextResponse.json(provider);
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

    // Check if user has permission to edit (requires verification)
    const permissionCheck = await canEditProviderProfile(session.user.id);

    if (!permissionCheck.allowed) {
      if (permissionCheck.requiresVerification) {
        return NextResponse.json(
          {
            error: "Provider profile requires verification",
            verificationStatus: permissionCheck.verificationStatus,
            requiresVerification: true
          },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: permissionCheck.reason || "Access denied" },
        { status: 403 }
      );
    }

    // Verify the provider belongs to the logged-in user and matches permission check
    const existingProvider = await prisma.provider.findUnique({
      where: { id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider not found" },
        { status: 404 }
      );
    }

    if (existingProvider.userId !== session.user.id || existingProvider.id !== permissionCheck.providerId) {
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
