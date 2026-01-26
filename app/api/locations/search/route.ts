import { NextResponse } from "next/server";
import {
  searchLocationsAdvanced,
  getLocationsByState,
  getUniqueStates,
  formatLocation,
  type LocationData,
} from "@/prisma/data/us-locations";

/**
 * Location Search API
 * Provides autocomplete-style search for US cities
 *
 * GET /api/locations/search?q=san&limit=10
 * GET /api/locations/search?state=CA
 * GET /api/locations/search?states=true
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    // Get states list
    if (searchParams.get("states") === "true") {
      const states = getUniqueStates();
      return NextResponse.json({ states });
    }

    // Search by state only
    const stateParam = searchParams.get("state");
    if (stateParam && !searchParams.get("q")) {
      const locations = getLocationsByState(stateParam);
      return NextResponse.json({
        locations: locations.map((loc) => ({
          ...loc,
          displayName: formatLocation(loc),
        })),
      });
    }

    // Search by query
    const query = searchParams.get("q") || "";
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? Math.min(20, Math.max(1, parseInt(limitParam))) : 10;

    if (!query || query.length < 2) {
      return NextResponse.json({ locations: [] });
    }

    const results = searchLocationsAdvanced(query, limit);

    // Format results for frontend consumption
    const locations = results.map((loc: LocationData) => ({
      id: `${loc.city}-${loc.state}`.toLowerCase().replace(/\s+/g, "-"),
      city: loc.city,
      state: loc.state,
      stateName: loc.stateName,
      displayName: formatLocation(loc),
      population: loc.population,
      latitude: loc.latitude,
      longitude: loc.longitude,
    }));

    return NextResponse.json({ locations });
  } catch (error) {
    console.error("Location search error:", error);
    return NextResponse.json(
      { error: "Failed to search locations" },
      { status: 500 }
    );
  }
}
