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
          'User-Agent': 'BloodBankManagementSystem/1.0', // Required by Nominatim
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

  // Fallback to local cache
  return getCityCoordinates(location);
}

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL CITY CACHE (Fallback when API fails or for offline use)
// ═══════════════════════════════════════════════════════════════════════════

// City to coordinates mapping for Nepal cities
export const cityCoordinates: Record<string, { latitude: number; longitude: number }> = {
  // Nepal - Major Cities
  'kathmandu': { latitude: 27.7172, longitude: 85.3240 },
  'pokhara': { latitude: 28.2096, longitude: 83.9856 },
  'lalitpur': { latitude: 27.6667, longitude: 85.3167 },
  'patan': { latitude: 27.6667, longitude: 85.3167 },
  'bhaktapur': { latitude: 27.6710, longitude: 85.4298 },
  'biratnagar': { latitude: 26.4525, longitude: 87.2718 },
  'bharatpur': { latitude: 27.6782, longitude: 84.4351 },
  'birgunj': { latitude: 27.0104, longitude: 84.8767 },
  'dharan': { latitude: 26.8124, longitude: 87.2847 },
  'butwal': { latitude: 27.7000, longitude: 83.4500 },
  'hetauda': { latitude: 27.4287, longitude: 85.0326 },
  'janakpur': { latitude: 26.7288, longitude: 85.9244 },
  'nepalgunj': { latitude: 28.0500, longitude: 81.6167 },
  'itahari': { latitude: 26.6708, longitude: 87.2789 },
  'dhangadhi': { latitude: 28.6942, longitude: 80.5897 },
  
  // Nepal - Syangja and surrounding areas
  'syangja': { latitude: 28.0950, longitude: 83.8750 },
  'waling': { latitude: 27.9833, longitude: 83.7667 },
  'putalibazar': { latitude: 28.0833, longitude: 83.8667 },
  'galyang': { latitude: 27.9833, longitude: 83.9667 },
  'chapakot': { latitude: 28.0500, longitude: 83.9167 },
  
  // Nepal - Kaski District (Pokhara area)
  'kaski': { latitude: 28.2096, longitude: 83.9856 },
  'lekhnath': { latitude: 28.2417, longitude: 84.1167 },
  
  // Default fallback
  'default': { latitude: 27.7172, longitude: 85.3240 }, // Kathmandu
};

/**
 * Get coordinates for a city from local cache
 * Supports exact match and partial match (e.g., "Syangja Municipality" matches "syangja")
 */
export function getCityCoordinates(city: string | undefined): { latitude: number; longitude: number } | null {
  if (!city) return null;
  
  const normalizedCity = city.toLowerCase().trim();
  
  // Try exact match first
  if (cityCoordinates[normalizedCity]) {
    return cityCoordinates[normalizedCity];
  }
  
  // Try partial match (e.g., "Syangja Municipality" matches "syangja")
  for (const [key, coords] of Object.entries(cityCoordinates)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      return coords;
    }
  }
  
  return null;
}