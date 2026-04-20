# Geocoding Implementation with Nominatim API

## Overview
Integrated OpenStreetMap's Nominatim API for automatic geocoding of donor locations. The system now automatically converts city names to GPS coordinates (latitude/longitude) for accurate map display.

## Features

### 🌍 Automatic Geocoding
- **API Integration**: Uses Nominatim API (OpenStreetMap) - free, no API key required
- **Country-Specific**: Searches limited to Nepal (`countrycodes=np`) for accurate results
- **Automatic Conversion**: City names → GPS coordinates automatically
- **Fallback System**: Local cache used if API fails or is unavailable

### 📍 Where Geocoding Happens

#### 1. Donor Registration (`/donor-form`)
- When user completes donor profile
- City field is geocoded automatically
- Coordinates stored in database

#### 2. Blood Collection (`/dashboard/blood-donate/blood-collection`)
- Individual donor collection: geocodes city
- Bulk organization collection: geocodes organization city
- Updates existing donors if they lack coordinates

#### 3. Blood Search Map (`/dashboard/blood-search`)
- Uses stored coordinates from database
- Falls back to API if coordinates missing
- Then falls back to local cache if API fails

## Technical Implementation

### Backend (`backend/src/utils/geocoding.ts`)

```typescript
// Geocode a location using Nominatim API
geocodeLocation(location: string, country: string = 'np')
  → Returns: { latitude, longitude } | null

// Geocode with fallback to default coordinates
geocodeCityWithFallback(city, defaultLat, defaultLng)
  → Returns: { latitude, longitude } | null
```

**Features:**
- User-Agent header required by Nominatim
- Error handling and logging
- Async/await for non-blocking operations
- Country code filtering for accurate results

### Frontend (`frontend/lib/geocoding.ts`)

```typescript
// Geocode using API
geocodeLocation(location: string)
  → Returns: { lat, lng } | null

// Try API first, fallback to local cache
getCoordinatesWithFallback(location: string)
  → Returns: { lat, lng } | null

// Local cache lookup (existing function)
getCityCoordinates(city: string)
  → Returns: { lat, lng } | null
```

**Fallback Chain:**
1. Try Nominatim API
2. If API fails → Use local city cache
3. If not in cache → Return null

### Controllers Updated

#### `donorController.ts`
- `createDonor()`: Geocodes city when creating donor profile
- Stores coordinates in `latitude` and `longitude` fields

#### `donationController.ts`
- `recordBloodCollection()`: Geocodes for new walk-in donors
- `recordBulkCollection()`: Geocodes organization city
- Updates existing donors if they lack coordinates

## API Details

### Nominatim API
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Rate Limit**: 1 request/second (respectful usage)
- **Cost**: Free, no API key needed
- **Terms**: Must include User-Agent header
- **Documentation**: https://nominatim.org/release-docs/latest/api/Search/

### Request Format
```
GET https://nominatim.openstreetmap.org/search
  ?q={city_name}
  &format=json
  &limit=1
  &countrycodes=np
Headers:
  User-Agent: BloodBankManagementSystem/1.0
```

### Response Format
```json
[
  {
    "lat": "27.7172",
    "lon": "85.3240",
    "display_name": "Kathmandu, Nepal",
    ...
  }
]
```

## Database Schema

### Donor Model
```prisma
model Donor {
  // ... other fields
  city        String?
  address     String?
  latitude    Float?    // Auto-populated via geocoding
  longitude   Float?    // Auto-populated via geocoding
  // ... other fields
}
```

## Benefits

### ✅ Accuracy
- Real GPS coordinates instead of hardcoded values
- Handles any city/location in Nepal
- No manual coordinate entry needed

### ✅ Scalability
- Works for any new city automatically
- No need to update city list
- Supports full addresses, not just cities

### ✅ Reliability
- Three-tier fallback system
- Works offline with local cache
- Graceful degradation if API unavailable

### ✅ User Experience
- Automatic - no extra user input
- Fast - coordinates cached in database
- Accurate map markers for all donors

## Usage Examples

### Creating a Donor
```typescript
// User enters: city = "Pokhara"
// System automatically:
1. Calls Nominatim API
2. Gets coordinates: { lat: 28.2096, lng: 83.9856 }
3. Stores in database
4. Donor appears on map at exact location
```

### Blood Search Map
```typescript
// Donor has city but no coordinates
1. Try database coordinates (if exist)
2. If missing → Call Nominatim API
3. If API fails → Use local cache
4. Display marker on map
```

## Error Handling

### API Failures
- Network errors → Use local cache
- Rate limit exceeded → Use local cache
- Invalid response → Use local cache
- No results found → Use local cache

### Logging
```typescript
console.log(`Geocoded ${city}:`, coords);
console.error('Nominatim API error:', status);
console.error('Geocoding error:', error);
```

## Performance

### Optimization
- Coordinates cached in database (no repeated API calls)
- Only geocodes when coordinates missing
- Async operations don't block UI
- Local cache for instant fallback

### API Usage
- ~1 request per new donor registration
- ~1 request per blood collection (if new donor)
- 0 requests for existing donors with coordinates
- 0 requests when using local cache

## Future Enhancements

### Possible Improvements
1. **Batch Geocoding**: Geocode multiple locations at once
2. **Reverse Geocoding**: Get city name from coordinates
3. **Address Validation**: Verify addresses before saving
4. **Distance Calculation**: Use coordinates for accurate distances
5. **Geofencing**: Alert when donors near blood bank
6. **Route Planning**: Directions to donor locations

### Alternative APIs
- Google Maps Geocoding API (requires API key, paid)
- Mapbox Geocoding API (requires API key, free tier)
- HERE Geocoding API (requires API key, free tier)

## Testing

### Manual Testing
1. Register donor with city "Kathmandu"
2. Check database: `latitude` and `longitude` populated
3. View blood search map: marker appears at correct location
4. Try different cities: Pokhara, Lalitpur, Bhaktapur
5. Test with invalid city: should fallback to cache

### API Testing
```bash
# Test Nominatim API directly
curl -H "User-Agent: BloodBankManagementSystem/1.0" \
  "https://nominatim.openstreetmap.org/search?q=Kathmandu&format=json&limit=1&countrycodes=np"
```

## Compliance

### Nominatim Usage Policy
✅ User-Agent header included
✅ Respectful rate limiting (1 req/sec)
✅ Caching results in database
✅ Not using for heavy traffic
✅ Free tier appropriate for our use case

### Data Privacy
- Only geocodes city names (public information)
- No personal data sent to API
- Coordinates stored securely in database
- GDPR compliant (no PII in API requests)

## Troubleshooting

### Common Issues

**Issue**: Coordinates not appearing
- Check: Database has `latitude` and `longitude` fields
- Check: API response in console logs
- Check: Network connectivity

**Issue**: Wrong location on map
- Check: City name spelling
- Check: API returned correct coordinates
- Check: Local cache has correct coordinates

**Issue**: API rate limit exceeded
- Solution: System automatically uses local cache
- Solution: Coordinates cached in database

## Summary

The geocoding implementation provides:
- ✅ Automatic coordinate generation
- ✅ Accurate map markers
- ✅ No manual coordinate entry
- ✅ Reliable fallback system
- ✅ Free and scalable solution
- ✅ Works for any Nepal location

All donor locations are now automatically geocoded and displayed accurately on the blood search map!
