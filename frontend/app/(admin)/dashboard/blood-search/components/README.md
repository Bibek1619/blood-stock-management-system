# Blood Search Components

This directory contains modular components for the Blood Search page.

## Component Structure

### Main Components

#### `PageHeader.tsx`
- Displays the page title, description, and donor count
- Includes "Use My Location" button
- Shows filtered count based on search criteria

#### `LocationStatus.tsx`
- Shows location access status messages
- Displays success message when location is detected
- Shows error/warning when location access is denied

#### `LowStockSuggestions.tsx`
- Displays suggested blood groups that are low in stock
- Allows quick filtering by clicking on suggested groups
- Highlights currently selected group

#### `SearchFilters.tsx`
- Blood group dropdown filter
- Location text search input
- Radius slider for map-based filtering
- Shows current pin coordinates when active
- Clear pin button

#### `MapPanel.tsx`
- Main map display with Leaflet integration
- Shows donor markers with different styles:
  - Blue building icon for organizations
  - Green markers for precise locations
  - Red markers for approximate (city-based) locations
  - Gray markers for donors outside radius
- Map legend explaining marker types
- Full map button to open modal view
- Loading state while map initializes

#### `DonorGrid.tsx`
- Grid layout for donor cards
- Loading state with spinner
- Empty state when no donors found
- Responsive grid (1-4 columns based on screen size)

#### `DonorCard.tsx`
- Individual donor card component
- Shows donor name, blood group, location
- Displays donation count and last donation date
- Distance calculation when pin is active
- Call and Notify action buttons
- Location badge (Precise/Approx)

#### `DonorDetailSheet.tsx`
- Slide-in panel with detailed donor information
- Banner with donor avatar and blood group
- Stats strip showing donations, blood given, distance
- Contact information section
- Donation history section
- Action buttons (View Profile, Call, Notify)

#### `FullMapModal.tsx`
- Full-screen map modal
- Reuses the same map instance
- Close button to return to main view

### Hooks

#### `useMapSetup.ts`
Custom hook that handles all map-related logic:
- Initializes Leaflet map
- Manages map markers and overlays
- Handles click events on map
- Updates markers based on filters
- Adds jitter to prevent marker stacking
- Differentiates between organizations and individuals
- Shows radius circle when pin is active

## Data Flow

```
page.tsx (Main Component)
├── Fetches donors data
├── Manages global state (Zustand)
├── Filters donors based on criteria
└── Passes data to child components

Components receive:
├── Filtered data
├── Event handlers
└── Display state

useMapSetup hook:
├── Receives donors and filters
├── Manages map instance
└── Updates markers reactively
```

## Key Features

1. **Modular Design**: Each component has a single responsibility
2. **Reusable**: Components can be used independently
3. **Type-Safe**: TypeScript interfaces for all props
4. **Responsive**: Mobile-first design with responsive layouts
5. **Performance**: Memoized callbacks and optimized re-renders

## Usage Example

```tsx
import {
  PageHeader,
  SearchFilters,
  MapPanel,
  DonorGrid,
} from './components';

// In your page component
<PageHeader
  filteredCount={filtered.length}
  clickedPos={clickedPos}
  userLocation={userLocation}
  onUseMyLocation={handleUseMyLocation}
/>

<SearchFilters
  selectedGroup={selectedGroup}
  locationQuery={locationQuery}
  radius={radius}
  clickedPos={clickedPos}
  bloodGroups={BLOOD_GROUPS}
  onGroupChange={setSelectedGroup}
  onLocationChange={setLocationQuery}
  onRadiusChange={setRadius}
  onClearPin={clearPin}
/>
```

## Styling

All components use Tailwind CSS with consistent design tokens:
- Primary color: Red (red-800, red-900)
- Secondary colors: Slate for text and borders
- Accent colors: Blue for organizations, Green for precise locations
- Spacing: Consistent padding and margins
- Borders: Rounded corners with subtle shadows

## Future Improvements

- [ ] Add unit tests for each component
- [ ] Extract marker styles to a separate config
- [ ] Add animation transitions
- [ ] Implement virtual scrolling for large donor lists
- [ ] Add map clustering for better performance with many markers
