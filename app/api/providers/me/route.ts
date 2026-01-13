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

    const provider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!provider) {
      return NextResponse.json({ error: "Provider profile not found" }, { status: 404 });
    }

    return NextResponse.json({ provider });
  } catch (error) {
    console.error("Error fetching provider:", error);
    return NextResponse.json(
      { error: "Failed to fetch provider" },
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

    // Check if provider already exists
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (existingProvider) {
      return NextResponse.json(
        { error: "Provider profile already exists" },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.create({
      data: {
        userId: session.user.id,
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
        active: active ?? true,
        availableForFamilies: availableForFamilies ?? true,
        availableForOrganizations: availableForOrganizations ?? false,
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (error) {
    console.error("Error creating provider:", error);
    return NextResponse.json(
      { error: "Failed to create provider" },
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
      licensed,
      licenseNumber,
      priceMin,
      priceMax,
      priceDescription,
      paymentOptions,
      capacity,
      availableSpots,
      availableForFamilies,
      availableForOrganizations,
    } = body;

    // Check if provider exists
    const existingProvider = await prisma.provider.findUnique({
      where: { userId: session.user.id },
    });

    if (!existingProvider) {
      return NextResponse.json(
        { error: "Provider profile not found" },
        { status: 404 }
      );
    }

    // Build update data object (only update provided fields)
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (providerType !== undefined) updateData.providerType = providerType;
    if (description !== undefined) updateData.description = description;
    if (careTypesOffered !== undefined) updateData.careTypesOffered = careTypesOffered;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zipCode !== undefined) updateData.zipCode = zipCode;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (website !== undefined) updateData.website = website;
    if (yearsInBusiness !== undefined) updateData.yearsInBusiness = yearsInBusiness;
    if (licensed !== undefined) updateData.licensed = licensed;
    if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    if (priceMin !== undefined) updateData.priceMin = priceMin;
    if (priceMax !== undefined) updateData.priceMax = priceMax;
    if (priceDescription !== undefined) updateData.priceDescription = priceDescription;
    if (paymentOptions !== undefined) updateData.paymentOptions = paymentOptions;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (availableSpots !== undefined) updateData.availableSpots = availableSpots;
    if (availableForFamilies !== undefined) updateData.availableForFamilies = availableForFamilies;
    if (availableForOrganizations !== undefined) updateData.availableForOrganizations = availableForOrganizations;

    const provider = await prisma.provider.update({
      where: { userId: session.user.id },
      data: updateData,
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
