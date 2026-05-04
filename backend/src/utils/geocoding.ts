// Nominatim API for geocoding (OpenStreetMap)
// Free geocoding service - no API key required

/**
 * Get coordinates for a location using Nominatim API
 * @param location - City name or address to geocode
 * @returns Coordinates {latitude, longitude} or null if not found
 */
export async function geocodeLocation(location: string): Promise<{ latitude: number; longitude: number } | null> {
  if (!location || location.trim().length === 0) return null;
  
  try {
    const query = encodeURIComponent(location.trim());
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=np`,
      {
        headers: {
          'User-Agent': 'BloodBankManagementSystem/1.0',
        },
      }
    );

    if (!response.ok) {
      console.error('Nominatim API error:', response.status);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Get coordinates with fallback to local cache
 * First tries Nominatim API, then falls back to local city coordinates
 */
export async function getCoordinatesWithFallback(
  location: string | undefined
): Promise<{ latitude: number; longitude: number } | null> {
  if (!location) return null;

  // Try Nominatim API first
  const apiResult = await geocodeLocation(location);
  if (apiResult) return apiResult;

  // Fallback to local cache (only major cities)
  return getCityCoordinates(location);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL CITY CACHE - Fallback for offline/API failure scenarios
// ═══════════════════════════════════════════════════════════════════════════

const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  'kathmandu': { latitude: 27.7172, longitude: 85.3240 },
  'pokhara': { latitude: 28.2096, longitude: 83.9856 },
  'lalitpur': { latitude: 27.6667, longitude: 85.3167 },
  'bhaktapur': { latitude: 27.6710, longitude: 85.4298 },
  'biratnagar': { latitude: 26.4525, longitude: 87.2718 },
  'bharatpur': { latitude: 27.6782, longitude: 84.4351 },
  'default': { latitude: 27.7172, longitude: 85.3240 },
};

/**
 * Get coordinates from local cache (fallback only)
 */
export function getCityCoordinates(city: string | undefined): { latitude: number; longitude: number } | null {
  if (!city) return null;
  
  const normalizedCity = city.toLowerCase().trim();
  
  // Try exact match
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }
  
  // Try partial match
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return coords;
    }
  }
  
  return null;
}
