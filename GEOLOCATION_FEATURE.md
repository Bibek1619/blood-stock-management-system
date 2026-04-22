# Geolocation Feature - Blood Search Map

## Overview
Added automatic geolocation support to the blood search page. The map now centers on the user's current location when they first open the page, making it easier to find nearby donors.

## Features

### 🎯 Automatic Location Detection
- **On Page Load**: Requests user's location permission
- **Map Centering**: Automatically centers map on user's location
- **User Marker**: Shows blue dot at user's current position
- **Zoom Level**: Zooms in closer (14) when user location available

### 📍 User Location Marker
- **Blue Dot**: Distinctive blue marker for user's position
- **Popup**: Shows "Your Location" when clicked
- **Auto-Open**: Popup opens automatically on page load
- **Always Visible**: Stays on map even when searching

### 🔘 "Use My Location" Button
- **Quick Access**: One-click to search near user
- **Sets Pin**: Automatically drops pin at user's location
- **Centers Map**: Moves map to user's position
- **Applies Radius**: Uses current radius setting

### 📊 Location Status Messages

**Success (Green Banner):**
```
✓ Location Detected
Map centered at your current location (27.7172, 85.3240)
```

**Error (Yellow Banner):**
```
⚠ Location Access
Location access denied. Please enable location permissions.
```

## User Experience

### First Visit Flow
```
1. User opens /dashboard/blood-search
    ↓
2. Browser asks: "Allow location access?"
    ↓
3a. User clicks "Allow"
    → Map centers on their location
    → Blue dot shows their position
    → "Use My Location" button appears
    → Green success message shown
    
3b. User clicks "Block"
    → Map shows default location (Kathmandu)
    → Yellow warning message shown
    → Can still use map normally
```

### Using "Use My Location" Button
```
1. User clicks "Use My Location"
    ↓
2. Pin drops at user's current location
    ↓
3. Map centers on user
    ↓
4. Radius filter applied
    ↓
5. Shows donors within radius
```

## Technical Implementation

### Geolocation API
```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    setUserLocation({ lat: latitude, lng: longitude });
  },
  (error) => {
    // Handle errors
  },
  {
    enableHighAccuracy: true,  // Use GPS if available
    timeout: 10000,            // 10 second timeout
    maximumAge: 0,             // Don't use cached position
  }
);
```

### Error Handling
```typescript
switch (error.code) {
  case error.PERMISSION_DENIED:
    // User blocked location access
    message = 'Location access denied. Please enable location permissions.';
    break;
    
  case error.POSITION_UNAVAILABLE:
    // GPS/network unavailable
    message = 'Location information unavailable.';
    break;
    
  case error.TIMEOUT:
    // Request took too long
    message = 'Location request timed out.';
    break;
}
```

### Fallback Behavior
- If geolocation fails → Use default location (Kathmandu)
- If permission denied → Show warning but allow normal usage
- If timeout → Use default location
- Map always works, even without geolocation

## Map Behavior

### Initial Map View

**With User Location:**
- Center: User's GPS coordinates
- Zoom: 14 (closer view)
- Marker: Blue dot at user position
- Popup: "Your Location" (auto-opened)

**Without User Location:**
- Center: Kathmandu (27.7172, 85.3240)
- Zoom: 13 (standard view)
- Marker: None
- Popup: None

### User Location Marker
```typescript
const userIcon = L.divIcon({
  html: `<div style="
    width:20px;
    height:20px;
    border-radius:50%;
    background:#3b82f6;
    border:3px solid #fff;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
});
```

**Styling:**
- Color: Blue (#3b82f6)
- Size: 20px diameter
- Border: 3px white
- Shadow: Subtle drop shadow
- Shape: Perfect circle

## UI Components

### "Use My Location" Button
```tsx
<button onClick={useMyLocation}>
  <Crosshair size={14} />
  Use My Location
</button>
```

**Appearance:**
- Background: Light blue (bg-blue-50)
- Border: Blue (border-blue-200)
- Icon: Crosshair
- Text: "Use My Location"
- Hover: Darker blue background

**Behavior:**
- Only shown if location available
- Drops pin at user location
- Centers map on user
- Shows toast notification

### Location Status Banners

**Success Banner (Green):**
- Shows when location detected
- Displays coordinates
- Dismissible
- Auto-hides after interaction

**Error Banner (Yellow):**
- Shows when location fails
- Explains the error
- Suggests enabling permissions
- Stays visible until dismissed

## Privacy & Permissions

### Browser Permission
- **First Time**: Browser asks for permission
- **Allowed**: Location used, stored in browser
- **Blocked**: Falls back to default location
- **Not Supported**: Falls back to default location

### Data Storage
- Location NOT stored on server
- Only used client-side
- Not sent to backend
- Not saved in database
- Requested fresh each page load

### User Control
- Can deny permission anytime
- Can revoke permission in browser settings
- Can use map without location
- No functionality lost if denied

## Browser Compatibility

### Supported Browsers
✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers (iOS/Android)

### Geolocation API Support
- Desktop: WiFi/IP-based location
- Mobile: GPS + WiFi + Cell tower
- Accuracy: 10-100 meters typically

### HTTPS Requirement
⚠️ Geolocation API requires HTTPS
- Works on localhost (development)
- Requires SSL certificate (production)
- Won't work on HTTP sites

## Benefits

### For Users
✅ **Instant Context**: Map shows their area immediately
✅ **Find Nearby**: Easy to find donors near them
✅ **One Click**: "Use My Location" for quick search
✅ **Visual Feedback**: Blue dot shows their position
✅ **No Typing**: No need to enter location manually

### For Blood Bank
✅ **Better UX**: More intuitive interface
✅ **Faster Searches**: Users find donors quicker
✅ **Higher Engagement**: More likely to use map feature
✅ **Mobile Friendly**: Great for mobile users
✅ **Emergency Ready**: Quick donor search in emergencies

## Use Cases

### Emergency Blood Need
```
1. Staff opens blood search
2. Map centers on hospital location
3. Click "Use My Location"
4. See all donors within 5km
5. Call nearest matching donor
```

### Mobile Blood Drive
```
1. Organizer at event location
2. Opens blood search on mobile
3. Map shows event location
4. Find donors in surrounding area
5. Send notifications to nearby donors
```

### Donor Outreach
```
1. Staff planning outreach
2. Opens blood search
3. Sees donor distribution
4. Identifies underserved areas
5. Plans targeted campaigns
```

## Error Messages

### Permission Denied
```
⚠ Location Access
Location access denied. Please enable location permissions.
```

**User Action:**
- Enable location in browser settings
- Refresh page
- Or use map without location

### Position Unavailable
```
⚠ Location Access
Location information unavailable.
```

**Possible Causes:**
- GPS disabled
- No network connection
- Indoor location (weak signal)

### Timeout
```
⚠ Location Access
Location request timed out.
```

**User Action:**
- Refresh page to retry
- Check GPS/network
- Or use map without location

## Future Enhancements

### Possible Improvements
1. **Save Location**: Remember user's preferred location
2. **Multiple Locations**: Save home, work, etc.
3. **Location History**: Recent search locations
4. **Geofencing**: Alert when donors nearby
5. **Route Planning**: Directions to donor
6. **Distance Sorting**: Sort donors by distance
7. **Travel Time**: Show estimated travel time
8. **Location Sharing**: Share location with team

### Advanced Features
- **Background Location**: Track location changes
- **Location Updates**: Real-time position updates
- **Accuracy Circle**: Show location accuracy
- **Compass**: Show direction to donors
- **Offline Maps**: Cache map tiles

## Testing

### Manual Testing Checklist
- [ ] Open page → Location permission requested
- [ ] Allow permission → Map centers on user location
- [ ] Deny permission → Map shows default location
- [ ] Blue dot appears at user location
- [ ] "Use My Location" button visible
- [ ] Click button → Pin drops at user location
- [ ] Success message shows coordinates
- [ ] Error message shows if permission denied
- [ ] Map works without location
- [ ] Mobile: GPS location more accurate

### Test Scenarios

**Scenario 1: First Visit (Allow)**
1. Open blood search page
2. Browser asks for location
3. Click "Allow"
4. ✓ Map centers on user
5. ✓ Blue dot appears
6. ✓ Success message shown

**Scenario 2: First Visit (Deny)**
1. Open blood search page
2. Browser asks for location
3. Click "Block"
4. ✓ Map shows Kathmandu
5. ✓ Warning message shown
6. ✓ Map still works

**Scenario 3: Use My Location**
1. Location already allowed
2. Click "Use My Location"
3. ✓ Pin drops at user location
4. ✓ Map centers on user
5. ✓ Donors filtered by radius

## Summary

The geolocation feature provides:
- ✅ Automatic location detection
- ✅ User-friendly interface
- ✅ One-click nearby search
- ✅ Visual location marker
- ✅ Graceful error handling
- ✅ Privacy-conscious design
- ✅ Mobile-optimized experience

Users can now instantly see donors near their current location! 📍🗺️
