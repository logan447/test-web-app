import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Location Search API - Database-backed
 * Provides autocomplete-style search for US cities
 *
 * GET /api/locations/search?q=san&limit=10
 * GET /api/locations/search?state=CA
 * GET /api/locations/search?states=true
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Get unique states list
    if (searchParams.get("states") === "true") {
      const states = await prisma.location.findMany({
        select: {
          state: true,
          stateName: true,
        },
        distinct: ["state"],
        orderBy: {
          stateName: "asc",
        },
      });

      return NextResponse.json({
        states: states.map((s) => ({
          code: s.state,
          name: s.stateName,
        })),
      });
    }

    // Search by state only
    const stateParam = searchParams.get("state");
    if (stateParam && !searchParams.get("q")) {
      const locations = await prisma.location.findMany({
        where: {
          state: {
            equals: stateParam.toUpperCase(),
          },
        },
        orderBy: {
          population: "desc",
        },
      });

      return NextResponse.json({
        locations: locations.map((loc) => ({
          id: loc.id,
          city: loc.city,
          state: loc.state,
          stateName: loc.stateName,
          displayName: `${loc.city}, ${loc.state}`,
          population: loc.population,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
      });
    }

    // Search by query (autocomplete)
    const query = searchParams.get("q") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(20, Math.max(1, parseInt(limitParam))) : 10;

    if (!query || query.length < 2) {
      return NextResponse.json({ locations: [] });
    }

    // Search cities by name, prioritizing:
    // 1. Exact prefix matches (cities starting with query)
    // 2. Contains matches
    // 3. Higher population first within each group
    const locations = await prisma.location.findMany({
      where: {
        OR: [
          // City starts with query (case insensitive)
          {
            city: {
              startsWith: query,
              mode: "insensitive",
            },
          },
          // City contains query
          {
            city: {
              contains: query,
              mode: "insensitive",
            },
          },
          // State name contains query (for "Texas" -> cities in Texas)
          {
            stateName: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      orderBy: [
        { population: "desc" },
      ],
      take: limit * 2, // Get more than needed, then filter/sort
    });

    // Re-sort to prioritize prefix matches
    const sorted = locations.sort((a, b) => {
      const aStartsWith = a.city.toLowerCase().startsWith(query.toLowerCase());
      const bStartsWith = b.city.toLowerCase().startsWith(query.toLowerCase());

      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;

      // Both start with or both don't - sort by population
      return (b.population || 0) - (a.population || 0);
    }).slice(0, limit);

    // Format results for frontend consumption
    const results = sorted.map((loc) => ({
      id: loc.id,
      city: loc.city,
      state: loc.state,
      stateName: loc.stateName,
      displayName: `${loc.city}, ${loc.state}`,
      population: loc.population,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    return NextResponse.json({ locations: results });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 }
    );
  }
}
