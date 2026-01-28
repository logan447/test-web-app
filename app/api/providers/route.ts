import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProviderType, CareType } from "@prisma/client";

// ============================================================================
// Quality Score Calculation for "Recommended" Sort
// ============================================================================
// Optimizes for: visual trust first, then quality signals, then completeness
// Max score: 100 points
//
// Scoring breakdown:
// - Photo presence (30 pts): Visual trust is critical for 65+ users
// - Rating quality (25 pts): Weighted by review count to prevent gaming
// - Profile completeness (25 pts): Pricing, contact, description, amenities
// - Claimed/verified status (20 pts): More likely to be accurate and current
//
// Note: For production scale, consider caching this score on the Provider model
// and updating it via a background job when provider data changes.
// ============================================================================

interface ProviderForScoring {
  id: string;
  name: string;
  coverPhoto: string | null;
  photos: string[];
  averageRating: number | null;
  reviewCount: number;
  claimed: boolean;
  verified: boolean;
  description: string | null;
  priceMin: number | null;
  priceMax: number | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  careTypesOffered: string[];
  totalCapacity: number | null;
  availableSpots: number | null;
  [key: string]: unknown; // Allow other fields
}

function calculateQualityScore(provider: ProviderForScoring): number {
  let score = 0;

  // 1. PHOTO PRESENCE (30 points) - Visual trust is critical
  // Having any photo is the most important signal for first impressions
  const hasPhotos = provider.coverPhoto || (provider.photos && provider.photos.length > 0);
  if (hasPhotos) {
    score += 30;
  }

  // 2. RATING QUALITY (25 points) - Weighted by review count
  // This prevents a single 5-star review from outranking a provider with
  // many solid reviews. Uses a dampened weight that caps at ~20 reviews.
  // Formula: rating * min(1, sqrt(reviewCount) / 4.5) * 5
  // Examples:
  //   - 5.0 stars, 1 review  → 5 * (1/4.5) * 5 = 5.6 pts
  //   - 4.5 stars, 4 reviews → 4.5 * (2/4.5) * 5 = 10 pts
  //   - 4.5 stars, 20 reviews → 4.5 * 1 * 5 = 22.5 pts
  //   - 4.0 stars, 50 reviews → 4.0 * 1 * 5 = 20 pts
  if (provider.averageRating && provider.averageRating > 0) {
    const reviewWeight = Math.min(1, Math.sqrt(provider.reviewCount || 0) / 4.5);
    const ratingScore = provider.averageRating * reviewWeight * 5;
    score += Math.min(25, ratingScore); // Cap at 25
  }

  // 3. PROFILE COMPLETENESS (25 points) - More complete = more trustworthy
  // Each field contributes to confidence that this is a real, active provider
  let completenessScore = 0;
  if (provider.description && provider.description.length > 50) completenessScore += 4;
  if (provider.priceMin || provider.priceMax) completenessScore += 5;
  if (provider.phone) completenessScore += 3;
  if (provider.email) completenessScore += 2;
  if (provider.address) completenessScore += 3;
  if (provider.careTypesOffered && provider.careTypesOffered.length > 0) completenessScore += 3;
  if (provider.totalCapacity) completenessScore += 2;
  if (provider.availableSpots !== null && provider.availableSpots !== undefined) completenessScore += 3;
  score += Math.min(25, completenessScore); // Cap at 25

  // 4. CLAIMED & VERIFIED STATUS (20 points) - More likely up-to-date
  // Claimed providers have an owner who can update info
  // Verified providers have been checked by Olera
  if (provider.claimed) score += 10;
  if (provider.verified) score += 10;

  return score;
}

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
    // Default is "recommended" which uses quality scoring
    const sortBy = sortByParam || "recommended";
    const useQualitySort = sortBy === "recommended";

    let orderBy: any = { createdAt: "desc" }; // Fallback

    if (!useQualitySort) {
      switch (sortBy) {
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

    // Select fields needed for both display and scoring
    const selectFields = {
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
      priceDescription: true,
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
      // Sprint 5: Caregiver work preferences
      workPreferences: true,
      preferredEmployers: true,
      availabilityStart: true,
      // Sprint 5: Cached Olera Score
      oleraScore: true,
      oleraScoreUpdatedAt: true,
    };

    let providers: any[];
    let total: number;

    if (useQualitySort) {
      // For quality-based sorting, we need to:
      // 1. Fetch all matching providers (for accurate scoring and pagination)
      // 2. Calculate quality scores
      // 3. Sort by score (desc), then reviewCount (desc), then name (asc) for stability
      // 4. Apply pagination
      //
      // Note: For large datasets (10k+ providers), consider:
      // - Caching qualityScore on the Provider model
      // - Using a background job to update scores periodically
      // - Adding database indexes on the cached score field

      const allProviders = await prisma.provider.findMany({
        where,
        select: selectFields,
      });

      total = allProviders.length;

      // Calculate scores and sort
      const scoredProviders = allProviders.map((p) => ({
        ...p,
        _qualityScore: calculateQualityScore(p as ProviderForScoring),
      }));

      // Sort by: quality score (desc) → review count (desc) → name (asc)
      // This ensures stable, deterministic ordering
      scoredProviders.sort((a, b) => {
        // Primary: quality score (higher is better)
        if (b._qualityScore !== a._qualityScore) {
          return b._qualityScore - a._qualityScore;
        }
        // Secondary: review count (more reviews = more trusted)
        if ((b.reviewCount || 0) !== (a.reviewCount || 0)) {
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        }
        // Tertiary: name alphabetically for absolute stability
        return (a.name || "").localeCompare(b.name || "");
      });

      // Apply pagination
      providers = scoredProviders.slice(skip, skip + limit).map(({ _qualityScore, ...rest }) => rest);
    } else {
      // For other sorts, use Prisma's efficient orderBy with pagination
      [total, providers] = await Promise.all([
        prisma.provider.count({ where }),
        prisma.provider.findMany({
          where,
          select: selectFields,
          orderBy,
          skip,
          take: limit,
        }),
      ]);
    }

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
