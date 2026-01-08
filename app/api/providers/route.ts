import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ProviderType, CareType } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const city = searchParams.get("city");
    const state = searchParams.get("state");
    const providerType = searchParams.get("providerType");
    const careType = searchParams.get("careType");
    const availableForOrganizations = searchParams.get("availableForOrganizations");

    // Advanced filters
    const priceMinParam = searchParams.get("priceMin");
    const priceMaxParam = searchParams.get("priceMax");
    const minRatingParam = searchParams.get("minRating");
    const availabilityParam = searchParams.get("availability");
    const amenitiesParam = searchParams.get("amenities");
    const insuranceParam = searchParams.get("insurance");
    const languagesParam = searchParams.get("languages");

    const where: any = {
      active: true,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { equals: state, mode: "insensitive" };
    }

    if (providerType) {
      where.providerType = providerType as ProviderType;
    }

    if (careType) {
      where.careTypesOffered = {
        has: careType as CareType,
      };
    }

    if (availableForOrganizations === "true") {
      where.providerType = "INDEPENDENT_CAREGIVER";
      where.availableForOrganizations = true;
    }

    // Price range filter
    if (priceMinParam) {
      where.priceMin = { gte: parseInt(priceMinParam) };
    }
    if (priceMaxParam) {
      where.priceMax = { lte: parseInt(priceMaxParam) };
    }

    // Rating filter
    if (minRatingParam) {
      where.averageRating = { gte: parseFloat(minRatingParam) };
    }

    // Availability filter
    if (availabilityParam) {
      if (availabilityParam === "immediate") {
        where.availableSpots = { gt: 0 };
      }
    }

    // Amenities filter (specialty care)
    if (amenitiesParam) {
      const amenitiesList = amenitiesParam.split(",");
      const amenityConditions: any[] = [];

      if (amenitiesList.includes("memory_care")) {
        amenityConditions.push({ hasMemoryCare: true });
      }
      if (amenitiesList.includes("respite_care")) {
        amenityConditions.push({ hasRespiteCare: true });
      }
      if (amenitiesList.includes("hospice_care")) {
        amenityConditions.push({ hasHospiceCare: true });
      }

      if (amenityConditions.length > 0) {
        where.AND = where.AND || [];
        where.AND.push({ OR: amenityConditions });
      }
    }

    // Insurance/Payment filter
    if (insuranceParam) {
      const insuranceList = insuranceParam.split(",");
      where.paymentOptions = {
        hasSome: insuranceList,
      };
    }

    // Languages filter
    if (languagesParam) {
      const languagesList = languagesParam.split(",");
      where.languagesSpoken = {
        hasSome: languagesList,
      };
    }

    const providers = await prisma.provider.findMany({
      where,
      select: {
        id: true,
        name: true,
        providerType: true,
        description: true,
        city: true,
        state: true,
        zipCode: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        careTypesOffered: true,
        licensed: true,
        insuranceVerified: true,
        backgroundChecked: true,
        certifications: true,
        averageRating: true,
        reviewCount: true,
        priceMin: true,
        priceMax: true,
        availableSpots: true,
        totalCapacity: true,
        photos: true,
        coverPhoto: true,
        latitude: true,
        longitude: true,
        verified: true,
        hasMemoryCare: true,
        hasRespiteCare: true,
        hasHospiceCare: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json(providers);
  } catch (error) {
    console.error("Error fetching providers:", error);
    return NextResponse.json(
      { error: "Failed to fetch providers" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const provider = await prisma.provider.create({
      data: {
        name: body.name,
        providerType: body.providerType,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zipCode: body.zipCode,
        description: body.description,
        website: body.website,
        careTypesOffered: body.careTypesOffered || [],
        serviceRadius: body.serviceRadius,
        licensed: body.licensed || false,
        licenseNumber: body.licenseNumber,
        yearsInBusiness: body.yearsInBusiness,
        capacity: body.capacity,
        userId: body.userId,
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
