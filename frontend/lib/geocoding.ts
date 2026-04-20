// Nominatim API for geocoding (OpenStreetMap)
// Free geocoding service - no API key required

/**
 * Get coordinates for a location using Nominatim API
 * @param location - City name or address to geocode
 * @returns Coordinates {lat, lng} or null if not found
 */
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
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
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
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
): Promise<{ lat: number; lng: number } | null> {
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
// Comprehensive list of major cities and districts in Nepal

export const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  // Nepal - Major Cities
  'kathmandu': { lat: 27.7172, lng: 85.3240 },
  'pokhara': { lat: 28.2096, lng: 83.9856 },
  'lalitpur': { lat: 27.6667, lng: 85.3167 },
  'patan': { lat: 27.6667, lng: 85.3167 },
  'bhaktapur': { lat: 27.6710, lng: 85.4298 },
  'biratnagar': { lat: 26.4525, lng: 87.2718 },
  'bharatpur': { lat: 27.6782, lng: 84.4351 },
  'birgunj': { lat: 27.0104, lng: 84.8767 },
  'dharan': { lat: 26.8124, lng: 87.2847 },
  'butwal': { lat: 27.7000, lng: 83.4500 },
  'hetauda': { lat: 27.4287, lng: 85.0326 },
  'janakpur': { lat: 26.7288, lng: 85.9244 },
  'nepalgunj': { lat: 28.0500, lng: 81.6167 },
  'itahari': { lat: 26.6708, lng: 87.2789 },
  'dhangadhi': { lat: 28.6942, lng: 80.5897 },
  
  // Nepal - Syangja and surrounding areas
  'syangja': { lat: 28.0950, lng: 83.8750 },
  'waling': { lat: 27.9833, lng: 83.7667 },
  'putalibazar': { lat: 28.0833, lng: 83.8667 },
  'galyang': { lat: 27.9833, lng: 83.9667 },
  'chapakot': { lat: 28.0500, lng: 83.9167 },
  
  // Nepal - Kaski District (Pokhara area)
  'kaski': { lat: 28.2096, lng: 83.9856 },
  'lekhnath': { lat: 28.2417, lng: 84.1167 },
  
  // Nepal - Gandaki Province
  'gorkha': { lat: 28.0000, lng: 84.6333 },
  'lamjung': { lat: 28.2333, lng: 84.3833 },
  'tanahu': { lat: 27.9167, lng: 84.2333 },
  'damauli': { lat: 27.9667, lng: 84.2833 },
  'baglung': { lat: 28.2667, lng: 83.5833 },
  'parbat': { lat: 28.0833, lng: 83.6833 },
  'myagdi': { lat: 28.6000, lng: 83.5667 },
  'mustang': { lat: 28.9833, lng: 83.8833 },
  'manang': { lat: 28.6667, lng: 84.0167 },
  'nawalpur': { lat: 27.6333, lng: 84.1167 },
  
  // Nepal - Province 1
  'dhankuta': { lat: 26.9833, lng: 87.3333 },
  'ilam': { lat: 26.9083, lng: 87.9250 },
  'jhapa': { lat: 26.5333, lng: 87.8333 },
  'morang': { lat: 26.6500, lng: 87.4833 },
  'sunsari': { lat: 26.6167, lng: 87.1833 },
  'panchthar': { lat: 27.1333, lng: 87.8667 },
  'taplejung': { lat: 27.3500, lng: 87.6667 },
  'sankhuwasabha': { lat: 27.3167, lng: 87.1667 },
  
  // Nepal - Bagmati Province
  'chitwan': { lat: 27.5291, lng: 84.3542 },
  'makwanpur': { lat: 27.4333, lng: 85.0333 },
  'dhading': { lat: 27.8667, lng: 84.9000 },
  'nuwakot': { lat: 27.9167, lng: 85.1667 },
  'rasuwa': { lat: 28.1667, lng: 85.3333 },
  'sindhupalchok': { lat: 27.9500, lng: 85.6833 },
  'kavrepalanchok': { lat: 27.5500, lng: 85.5667 },
  'ramechhap': { lat: 27.3333, lng: 86.0833 },
  'dolakha': { lat: 27.6667, lng: 86.1667 },
  'sindhuli': { lat: 27.2500, lng: 85.9667 },
  
  // Nepal - Lumbini Province
  'rupandehi': { lat: 27.5000, lng: 83.4500 },
  'kapilvastu': { lat: 27.5667, lng: 82.9833 },
  'nawalparasi': { lat: 27.6333, lng: 83.7500 },
  'palpa': { lat: 27.8667, lng: 83.5500 },
  'gulmi': { lat: 28.0833, lng: 83.2833 },
  'arghakhanchi': { lat: 27.9500, lng: 83.1167 },
  'pyuthan': { lat: 28.0833, lng: 82.8333 },
  'rolpa': { lat: 28.2833, lng: 82.6333 },
  'rukum': { lat: 28.5833, lng: 82.5833 },
  'dang': { lat: 28.0833, lng: 82.3000 },
  'banke': { lat: 28.1500, lng: 81.6167 },
  'bardiya': { lat: 28.3333, lng: 81.5000 },
  
  // Nepal - Karnali Province
  'surkhet': { lat: 28.6000, lng: 81.6333 },
  'dailekh': { lat: 28.8500, lng: 81.7167 },
  'jajarkot': { lat: 28.7000, lng: 82.1833 },
  'dolpa': { lat: 28.9833, lng: 82.8167 },
  'jumla': { lat: 29.2833, lng: 82.1833 },
  'kalikot': { lat: 29.1333, lng: 81.7333 },
  'mugu': { lat: 29.6667, lng: 82.1667 },
  'humla': { lat: 29.9167, lng: 81.8333 },
  
  // Nepal - Sudurpashchim Province
  'kailali': { lat: 28.7167, lng: 80.8333 },
  'kanchanpur': { lat: 28.8333, lng: 80.3333 },
  'dadeldhura': { lat: 29.3000, lng: 80.5833 },
  'baitadi': { lat: 29.5333, lng: 80.5500 },
  'darchula': { lat: 29.8500, lng: 80.5500 },
  'bajhang': { lat: 29.5333, lng: 81.1833 },
  'bajura': { lat: 29.5000, lng: 81.6667 },
  'achham': { lat: 29.2667, lng: 81.3500 },
  'doti': { lat: 29.2667, lng: 80.9833 },
  
  // Default fallback
  'default': { lat: 27.7172, lng: 85.3240 }, // Kathmandu
};

/**
 * Get coordinates for a city
 * Supports exact match and partial match (e.g., "Syangja Municipality" matches "syangja")
 */
export function getCityCoordinates(city: string | undefined): { lat: number; lng: number } | null {
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
