# Dynamic Events Page Implementation

## Overview
The `/events` page has been converted from static to dynamic, fetching real event data from the backend API using TanStack Query and providing individual event detail pages.

## Changes Made

### 1. Type Definitions
Uses types from `frontend/lib/queries/events.ts`:
- `Event` - Main event model with all fields
- `EventParticipant` - Participant registration data
- `EventVolunteer` - Volunteer registration data

### 2. Events List Page (`frontend/app/(public)/events/page.tsx`)
**Features:**
- Uses `useEvents()` hook from TanStack Query
- Automatic caching and refetching
- Loading state with spinner
- Error handling with user-friendly messages
- Dynamic status badges (Upcoming, Ongoing, Completed, Cancelled)
- Participant count display with capacity info
- Date formatting using `date-fns`
- Links to individual event detail pages
- Empty state when no events available

**TanStack Query Benefits:**
- Automatic background refetching
- Cache management
- Request deduplication
- Optimistic updates support

### 3. Event Detail Page (`frontend/app/(public)/events/[id]/page.tsx`)
**Features:**
- Uses `useEvent(id)` hook from TanStack Query
- Dynamic route using Next.js 13+ app router
- Fetches single event from `/api/events/:id`
- Comprehensive event information display:
  - Event title and status
  - Date and time (formatted)
  - Location
  - Description
  - Participant and volunteer counts
  - Capacity and spots remaining
- Registration CTAs:
  - Register as Participant button
  - Volunteer for Event button
  - Disabled when event is full or completed
- Event statistics cards
- Event information sidebar
- Back navigation to events list
- 404 handling for non-existent events

## API Integration

### Query Hooks Used

#### `useEvents(filters?)`
Fetches all events with optional filters.
```typescript
const { data: events, isLoading, error } = useEvents();
```

#### `useEvent(id)`
Fetches a single event by ID.
```typescript
const { data: event, isLoading, error } = useEvent(eventId);
```

### API Endpoints
- **GET** `/api/events` - Returns all events
- **GET** `/api/events/:id` - Returns single event with details

### Configuration
- Base URL: `process.env.NEXT_PUBLIC_BACKEND_URL` (default: `http://localhost:3001`)
- Configured in: `frontend/lib/apiPaths.ts`
- Axios instance: `frontend/lib/axiosInstance.ts`

## Status Types
- `UPCOMING` - Event scheduled for future
- `ONGOING` - Event currently happening  
- `COMPLETED` - Event finished
- `CANCELLED` - Event cancelled

## Dependencies
- `@tanstack/react-query` - Data fetching and caching
- `date-fns` - Date formatting and manipulation
- `axios` - HTTP client

## User Flow

1. **Browse Events** (`/events`)
   - View all available events in grid layout
   - See status, date, location, and participant count
   - Click "View Details" to see more

2. **View Event Details** (`/events/[id]`)
   - See comprehensive event information
   - Check availability (spots remaining)
   - Register as participant or volunteer
   - Navigate back to events list

## Hydration Fix

Both pages use `useHasMounted` hook to prevent hydration mismatches:
```typescript
const hasMounted = useHasMounted();

if (!hasMounted || isLoading) {
  return <LoadingState />;
}
```

## Query Configuration

Query keys are organized in `frontend/lib/queries/events.ts`:
```typescript
export const eventKeys = {
  all: ['events'],
  lists: () => [...eventKeys.all, 'list'],
  list: (filters?) => [...eventKeys.lists(), filters],
  details: () => [...eventKeys.all, 'detail'],
  detail: (id) => [...eventKeys.details(), id],
};
```

## Next Steps (Optional Enhancements)

1. **Authentication Integration**
   - Check if user is already registered
   - Show "Already Registered" state
   - Allow cancellation of registration

2. **Real-time Updates**
   - WebSocket integration for live participant counts
   - Auto-refresh when spots fill up

3. **Filtering & Search**
   - Filter by status, date range, location
   - Search by event title
   - Sort by date, participants, etc.

4. **Map Integration**
   - Show event location on map
   - Get directions functionality

5. **Calendar Integration**
   - Add to calendar button
   - iCal export

6. **Social Sharing**
   - Share event on social media
   - Copy event link

## Testing Checklist

- [x] Events list loads correctly with TanStack Query
- [x] Individual event details load
- [x] Status badges display correctly
- [x] Date formatting is accurate
- [x] Participant counts are correct
- [x] Capacity limits are enforced
- [x] Registration buttons work
- [x] Back navigation works
- [x] 404 page shows for invalid event IDs
- [x] Loading states display properly
- [x] Error states display properly
- [x] Hydration issues resolved
- [ ] Responsive design on mobile (verify)
- [ ] Query caching works correctly
- [ ] Background refetching works
