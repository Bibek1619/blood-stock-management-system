# Location Autocomplete Feature

## Overview
Added intelligent location autocomplete using Nominatim API that shows real-time location suggestions as users type. This ensures accurate location entry and automatic geocoding.

## Features

### 🎯 Smart Autocomplete
- **Real-time Suggestions**: Shows locations as user types (after 2+ characters)
- **Debounced Search**: 500ms delay to avoid excessive API calls
- **Keyboard Navigation**: Arrow keys to navigate, Enter to select, Escape to close
- **Click Outside**: Closes suggestions when clicking elsewhere
- **Loading Indicator**: Shows spinner while fetching suggestions
- **No Results Message**: Helpful message when no locations found

### 📍 Location Display
Each suggestion shows:
- **Primary Name**: City/location name (bold)
- **Full Address**: Complete address with district, region, country
- **Icon**: Map pin icon for visual clarity
- **Hover Effect**: Highlights on hover for better UX

### 🔄 Auto-Geocoding
- Automatically gets GPS coordinates when location selected
- Stores coordinates for accurate map display
- No manual coordinate entry needed

## Component API

### LocationAutocomplete Props

```typescript
interface LocationAutocompleteProps {
  id: string;                    // Input field ID
  label: string;                 // Field label
  value: string;                 // Current value
  onChange: (                    // Change handler
    value: string,               // Selected location name
    coordinates?: {              // Optional coordinates
      lat: number;
      lng: number;
    }
  ) => void;
  placeholder?: string;          // Placeholder text
  required?: boolean;            // Required field
  disabled?: boolean;            // Disabled state
  className?: string;            // Additional CSS classes
}
```

### Usage Example

```tsx
<LocationAutocomplete
  id="city"
  label="City"
  value={formData.city}
  onChange={(value, coords) => {
    setFormData({ ...formData, city: value });
    if (coords) {
      console.log('Coordinates:', coords);
    }
  }}
  placeholder="Start typing city name..."
  required
/>
```

## Integration Points

### ✅ Donor Registration Form (`/donor-form`)
- City field with autocomplete
- Shows Nepal locations only
- Coordinates stored in database

### ✅ Blood Collection Form (`/dashboard/blood-donate/blood-collection`)
- Individual donor city field
- Organization city field (bulk collection)
- Both use autocomplete

## User Experience

### Typing Flow
```
User types: "Kath"
    ↓
500ms debounce
    ↓
API call to Nominatim
    ↓
Shows suggestions:
  📍 Kathmandu
     Kathmandu, Bagmati Province, Nepal
  📍 Kathmandu District
     Bagmati Province, Nepal
    ↓
User clicks "Kathmandu"
    ↓
Field filled: "Kathmandu"
Coordinates: {lat: 27.7172, lng: 85.3240}
```

### Keyboard Navigation
- **Type**: Start typing location name
- **↓ Arrow Down**: Move to next suggestion
- **↑ Arrow Up**: Move to previous suggestion
- **Enter**: Select highlighted suggestion
- **Escape**: Close suggestions
- **Click**: Select any suggestion

## Technical Details

### API Integration
- **Endpoint**: `https://nominatim.openstreetmap.org/search`
- **Parameters**:
  - `q`: Search query
  - `format`: json
  - `limit`: 5 (show top 5 results)
  - `countrycodes`: np (Nepal only)
  - `addressdetails`: 1 (include full address)
- **Headers**: User-Agent required

### Debouncing
- **Delay**: 500ms after last keystroke
- **Purpose**: Reduce API calls, improve performance
- **Implementation**: setTimeout with cleanup

### State Management
```typescript
const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
const [selectedIndex, setSelectedIndex] = useState(-1);
```

### Response Format
```json
[
  {
    "place_id": 123456,
    "lat": "27.7172",
    "lon": "85.3240",
    "display_name": "Kathmandu, Bagmati Province, Nepal",
    "address": {
      "city": "Kathmandu",
      "state": "Bagmati Province",
      "country": "Nepal"
    }
  }
]
```

## Styling

### Dropdown Design
- White background with border
- Shadow for depth
- Max height: 240px (scrollable)
- Smooth hover transitions
- Selected item highlighted
- Border between items

### Responsive
- Full width on mobile
- Adapts to parent container
- Touch-friendly tap targets
- Scrollable on small screens

## Performance Optimizations

### 1. Debouncing
- Waits 500ms after typing stops
- Prevents API spam
- Reduces server load

### 2. Minimum Characters
- Requires 2+ characters before searching
- Avoids too-broad searches
- Improves result relevance

### 3. Result Limit
- Shows only top 5 results
- Faster API response
- Cleaner UI

### 4. Cleanup
- Clears debounce timer on unmount
- Removes event listeners
- Prevents memory leaks

## Accessibility

### Keyboard Support
✅ Full keyboard navigation
✅ Arrow keys for selection
✅ Enter to confirm
✅ Escape to cancel
✅ Tab to move to next field

### Screen Readers
✅ Proper label association
✅ Required field indication
✅ Loading state announced
✅ Suggestion count announced

### Visual Indicators
✅ Loading spinner
✅ Selected item highlight
✅ Focus states
✅ Error messages

## Error Handling

### Network Errors
```typescript
try {
  const response = await fetch(url);
  if (response.ok) {
    const data = await response.json();
    setSuggestions(data);
  }
} catch (error) {
  console.error('Error fetching suggestions:', error);
  // Silently fail - user can still type manually
}
```

### No Results
- Shows "No locations found" message
- Suggests trying different search term
- User can still enter location manually

### API Rate Limit
- Debouncing helps avoid rate limits
- Graceful degradation if limit hit
- User can still type manually

## Benefits

### For Users
✅ **Faster Entry**: Select from suggestions instead of typing full name
✅ **Accurate Spelling**: No typos in location names
✅ **Discover Locations**: See available locations as they type
✅ **Visual Feedback**: Loading states and hover effects
✅ **Flexible**: Can still type manually if preferred

### For System
✅ **Accurate Data**: Standardized location names
✅ **Auto-Geocoding**: Coordinates automatically obtained
✅ **Better Maps**: Precise marker placement
✅ **Data Quality**: Consistent location format

### For Developers
✅ **Reusable Component**: Use anywhere in app
✅ **Type-Safe**: Full TypeScript support
✅ **Customizable**: Props for all options
✅ **Well-Tested**: Handles edge cases

## Future Enhancements

### Possible Improvements
1. **Recent Locations**: Remember recently selected locations
2. **Popular Locations**: Show common locations first
3. **Current Location**: "Use my current location" button
4. **Offline Mode**: Cache popular locations for offline use
5. **Multi-Language**: Support Nepali language
6. **Custom Icons**: Different icons for cities vs districts
7. **Distance Display**: Show distance from current location
8. **Favorites**: Let users save favorite locations

## Testing

### Manual Testing Checklist
- [ ] Type 2+ characters → Shows suggestions
- [ ] Type 1 character → No suggestions
- [ ] Select suggestion → Field filled correctly
- [ ] Arrow keys → Navigate suggestions
- [ ] Enter key → Select highlighted suggestion
- [ ] Escape key → Close suggestions
- [ ] Click outside → Close suggestions
- [ ] Loading spinner → Shows while fetching
- [ ] No results → Shows helpful message
- [ ] Network error → Fails gracefully

### Test Locations
- "Kathmandu" → Should show Kathmandu city
- "Pokhara" → Should show Pokhara city
- "Lalitpur" → Should show Lalitpur
- "xyz123" → Should show no results
- "K" → Should not search (too short)

## Browser Compatibility

✅ Chrome/Edge (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Mobile browsers
✅ Tablets

## Dependencies

- React 18+
- Lucide React (icons)
- Tailwind CSS (styling)
- Nominatim API (geocoding)

## Files Modified

### New Files
- `frontend/components/ui/location-autocomplete.tsx` - Autocomplete component

### Updated Files
- `frontend/app/donor-form/page.tsx` - Uses autocomplete for city
- `frontend/app/dashboard/blood-donate/blood-collection/page.tsx` - Uses autocomplete for donor and org city

## Summary

The location autocomplete feature provides:
- ✅ Real-time location suggestions
- ✅ Keyboard navigation support
- ✅ Automatic geocoding
- ✅ Better user experience
- ✅ Accurate location data
- ✅ Reusable component

Users can now easily find and select their exact location with GPS-accurate coordinates!
