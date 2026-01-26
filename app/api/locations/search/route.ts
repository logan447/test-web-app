import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  searchLocationsAdvanced,
  getLocationsByState,
  getUniqueStates,
  formatLocation,
  US_LOCATIONS,
  type LocationData,
} from "@/prisma/data/us-locations";

/**
 * Location Search API - Database-backed with static fallback
 * Provides autocomplete-style search for US cities
 *
 * GET /api/locations/search?q=san&limit=10
 * GET /api/locations/search?state=CA
 * GET /api/locations/search?states=true
 *
 * Falls back to static data if database Location table is empty
 * (ensures functionality even before seed runs)
 */

// Check if database has location data (cached for performance)
let dbHasLocations: boolean | null = null;

async function checkDatabaseHasLocations(): Promise<boolean> {
  if (dbHasLocations !== null) return dbHasLocations;

  try {
    const count = await prisma.location.count();
    dbHasLocations = count > 0;
    return dbHasLocations;
  } catch {
    dbHasLocations = false;
    return false;
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const useDatabase = await checkDatabaseHasLocations();

    // Get unique states list
    if (searchParams.get("states") === "true") {
      if (useDatabase) {
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
      } else {
        // Fallback to static data
        const states = getUniqueStates();
        return NextResponse.json({ states });
      }
    }

    // Search by state only
    const stateParam = searchParams.get("state");
    if (stateParam && !searchParams.get("q")) {
      if (useDatabase) {
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
      } else {
        // Fallback to static data
        const locations = getLocationsByState(stateParam);
        return NextResponse.json({
          locations: locations.map((loc) => ({
            id: `${loc.city}-${loc.state}`.toLowerCase().replace(/\s+/g, "-"),
            city: loc.city,
            state: loc.state,
            stateName: loc.stateName,
            displayName: formatLocation(loc),
            population: loc.population,
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
        });
      }
    }

    // Search by query (autocomplete)
    const query = searchParams.get("q") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(20, Math.max(1, parseInt(limitParam))) : 10;

    if (!query || query.length < 2) {
      return NextResponse.json({ locations: [] });
    }

    if (useDatabase) {
      // Database search
      const locations = await prisma.location.findMany({
        where: {
          OR: [
            { city: { startsWith: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
            { stateName: { contains: query, mode: "insensitive" } },
          ],
        },
        orderBy: [{ population: "desc" }],
        take: limit * 2,
      });

      // Re-sort to prioritize prefix matches
      const sorted = locations
        .sort((a, b) => {
          const aStartsWith = a.city.toLowerCase().startsWith(query.toLowerCase());
          const bStartsWith = b.city.toLowerCase().startsWith(query.toLowerCase());

          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;

          return (b.population || 0) - (a.population || 0);
        })
        .slice(0, limit);

      return NextResponse.json({
        locations: sorted.map((loc) => ({
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
    } else {
      // Fallback to static data
      const results = searchLocationsAdvanced(query, limit);

      return NextResponse.json({
        locations: results.map((loc: LocationData) => ({
          id: `${loc.city}-${loc.state}`.toLowerCase().replace(/\s+/g, "-"),
          city: loc.city,
          state: loc.state,
          stateName: loc.stateName,
          displayName: formatLocation(loc),
          population: loc.population,
          latitude: loc.latitude,
          longitude: loc.longitude,
        })),
      });
    }
  } catch (error) {
    console.error("Location search error:", error);

    // On any error, try static fallback
    try {
      const query = new URL(req.url).searchParams.get("q") || "";
      if (query.length >= 2) {
        const results = searchLocationsAdvanced(query, 10);
        return NextResponse.json({
          locations: results.map((loc: LocationData) => ({
            id: `${loc.city}-${loc.state}`.toLowerCase().replace(/\s+/g, "-"),
            city: loc.city,
            state: loc.state,
            stateName: loc.stateName,
            displayName: formatLocation(loc),
            population: loc.population,
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
        });
      }
    } catch {
      // Static fallback also failed
    }

    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 }
    );
  }
}
