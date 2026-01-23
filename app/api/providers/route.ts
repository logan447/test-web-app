import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    // Sort option
    const sortByParam = searchParams.get("sortBy");

    // Pagination parameters
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
    const limit = limitParam ? Math.min(50, Math.max(1, parseInt(limitParam))) : 20;
    const skip = (page - 1) * limit;

    const where: any = {
      active: true,
      isVisible: true,
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

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }; // Default: newest first

    if (sortByParam) {
      switch (sortByParam) {
        case "rating_high":
          orderBy = { averageRating: "desc" };
          break;
        case "rating_low":
          orderBy = { averageRating: "asc" };
          break;
        case "price_low":
          orderBy = { priceMin: "asc" };
          break;
        case "price_high":
          orderBy = { priceMax: "desc" };
          break;
        case "name_asc":
          orderBy = { name: "asc" };
          break;
        case "name_desc":
          orderBy = { name: "desc" };
          break;
        case "newest":
        default:
          orderBy = { createdAt: "desc" };
          break;
      }
    }

    // Get total count and providers in parallel
    const [total, providers] = await Promise.all([
      prisma.provider.count({ where }),
      prisma.provider.findMany({
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
          claimed: true,
        },
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      providers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
      },
    });
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
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in to create a provider" },
        { status: 401 }
      );
    }

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
