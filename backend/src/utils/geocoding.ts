/**
 * Geocoding utility using Nominatim API (OpenStreetMap)
 * Free geocoding service - no API key required
 */

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Get coordinates for a location using Nominatim API
 * @param location - City name or address to geocode
 * @param country - Country code (default: 'np' for Nepal)
 * @returns Coordinates {latitude, longitude} or null if not found
 */
export async function geocodeLocation(
  location: string,
  country: string = 'np'
): Promise<Coordinates | null> {
  if (!location || location.trim().length === 0) return null;

  try {
    const query = encodeURIComponent(location.trim());
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=${country}`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BloodBankManagementSystem/1.0', // Required by Nominatim
      },
    });

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

    console.log(`No coordinates found for location: ${location}`);
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Geocode city with fallback to default coordinates
 * @param city - City name
 * @param defaultLat - Default latitude if geocoding fails
 * @param defaultLng - Default longitude if geocoding fails
 */
export async function geocodeCityWithFallback(
  city: string | undefined,
  defaultLat?: number,
  defaultLng?: number
): Promise<Coordinates | null> {
  if (!city) {
    if (defaultLat && defaultLng) {
      return { latitude: defaultLat, longitude: defaultLng };
    }
    return null;
  }

  const coords = await geocodeLocation(city);
  
  if (coords) return coords;

  // Fallback to default if provided
  if (defaultLat && defaultLng) {
    return { latitude: defaultLat, longitude: defaultLng };
  }

  return null;
}
