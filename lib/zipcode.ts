/**
 * ZIP Code Lookup Utility
 *
 * Provides ZIP code to city/state resolution using the Zippopotam.us API.
 * Includes caching, validation, and graceful fallback.
 *
 * API: https://api.zippopotam.us/us/{zip}
 * Free, no API key required, reliable for US ZIP codes.
 */

export interface ZipCodeResult {
  zipCode: string;
  city: string;
  state: string;
  stateName: string;
  latitude: number;
  longitude: number;
}

// Simple in-memory cache for ZIP lookups (persists for session)
const zipCache = new Map<string, ZipCodeResult | null>();

/**
 * Validates if a string looks like a US ZIP code
 * Supports 5-digit (12345) and ZIP+4 (12345-6789) formats
 */
export function isValidZipFormat(input: string): boolean {
  const trimmed = input.trim();
  // 5-digit ZIP or ZIP+4
  return /^\d{5}(-\d{4})?$/.test(trimmed);
}

/**
 * Checks if input might be a partial ZIP code (user still typing)
 * Returns true for 1-5 digit strings
 */
export function isPartialZip(input: string): boolean {
  const trimmed = input.trim();
  return /^\d{1,5}$/.test(trimmed);
}

/**
 * Normalizes ZIP code to 5-digit format
 */
export function normalizeZip(input: string): string {
  return input.trim().substring(0, 5);
}

/**
 * Looks up a ZIP code and returns city/state information
 * Uses Zippopotam.us API with caching
 *
 * @param zipCode - 5-digit US ZIP code
 * @returns ZipCodeResult or null if not found/invalid
 */
export async function lookupZipCode(zipCode: string): Promise<ZipCodeResult | null> {
  const normalized = normalizeZip(zipCode);

  // Validate format
  if (!/^\d{5}$/.test(normalized)) {
    return null;
  }

  // Check cache first
  if (zipCache.has(normalized)) {
    return zipCache.get(normalized) || null;
  }

  try {
    const response = await fetch(`https://api.zippopotam.us/us/${normalized}`, {
      // Short timeout to avoid blocking UI
      signal: AbortSignal.timeout(3000),
    });

    if (!response.ok) {
      // ZIP not found (404) or other error
      zipCache.set(normalized, null);
      return null;
    }

    const data = await response.json();

    // Zippopotam.us response format:
    // {
    //   "post code": "90210",
    //   "country": "United States",
    //   "places": [{
    //     "place name": "Beverly Hills",
    //     "longitude": "-118.4065",
    //     "state": "California",
    //     "state abbreviation": "CA",
    //     "latitude": "34.0901"
    //   }]
    // }

    if (!data.places || data.places.length === 0) {
      zipCache.set(normalized, null);
      return null;
    }

    const place = data.places[0];
    const result: ZipCodeResult = {
      zipCode: normalized,
      city: place["place name"],
      state: place["state abbreviation"],
      stateName: place.state,
      latitude: parseFloat(place.latitude),
      longitude: parseFloat(place.longitude),
    };

    zipCache.set(normalized, result);
    return result;

  } catch (error) {
    // Network error, timeout, etc.
    console.error("ZIP code lookup failed:", error);
    // Don't cache errors - allow retry
    return null;
  }
}

/**
 * Batch lookup for multiple ZIP codes (for future use)
 * Processes in parallel with rate limiting
 */
export async function lookupZipCodes(zipCodes: string[]): Promise<Map<string, ZipCodeResult | null>> {
  const results = new Map<string, ZipCodeResult | null>();

  // Process in batches of 5 to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < zipCodes.length; i += batchSize) {
    const batch = zipCodes.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(lookupZipCode));

    batch.forEach((zip, index) => {
      results.set(normalizeZip(zip), batchResults[index]);
    });

    // Small delay between batches
    if (i + batchSize < zipCodes.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Clears the ZIP code cache (useful for testing)
 */
export function clearZipCache(): void {
  zipCache.clear();
}
