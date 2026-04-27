# Events Page - TanStack Query Implementation

## Problem Fixed
The events page was failing to fetch data due to incorrect API URL and manual fetch implementation.

## Solution Applied

### 1. Replaced Manual Fetch with TanStack Query

**Before:**
```typescript
const [events, setEvents] = useState<Event[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchEvents = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`);
    // ... manual state management
  };
  fetchEvents();
}, []);
```

**After:**
```typescript
import { useEvents } from "@/lib/queries/events";

const { data: events = [], isLoading, error } = useEvents();
```

### 2. Updated Both Event Pages

#### Events List (`/events`)
- Uses `useEvents()` hook
- Automatic caching and background refetching
- Better error handling
- No manual state management needed

#### Event Detail (`/events/[id]`)
- Uses `useEvent(id)` hook
- Automatic cache invalidation
- Optimistic updates support
- Cleaner code

### 3. Benefits of TanStack Query

✅ **Automatic Caching** - Reduces unnecessary API calls
✅ **Background Refetching** - Keeps data fresh
✅ **Request Deduplication** - Multiple components can use same query
✅ **Error Handling** - Built-in error states
✅ **Loading States** - Automatic loading indicators
✅ **Optimistic Updates** - Better UX for mutations
✅ **DevTools** - React Query DevTools for debugging

## API Configuration

### Correct Environment Variable
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

### API Paths
Defined in `frontend/lib/apiPaths.ts`:
```typescript
EVENT: {
  GET_ALL: "/api/events",
  GET_BY_ID: (id: string) => `/api/events/${id}`,
}
```

### Axios Instance
Configured in `frontend/lib/axiosInstance.ts`:
- Automatic token injection
- Error interceptors
- Timeout handling
- Base URL from environment

## Query Hooks Available

All hooks are in `frontend/lib/queries/events.ts`:

### Read Operations
- `useEvents(filters?)` - Fetch all events
- `useEvent(id)` - Fetch single event

### Write Operations
- `useCreateEvent()` - Create new event
- `useUpdateEvent(id)` - Update event
- `useDeleteEvent()` - Delete event
- `useAddParticipant(eventId)` - Add participant
- `useRemoveParticipant(eventId)` - Remove participant
- `useAddVolunteer(eventId)` - Add volunteer
- `useRemoveVolunteer(eventId)` - Remove volunteer

## Testing

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Events Page:**
   - Navigate to `http://localhost:3000/events`
   - Should load events from backend
   - Click on event to see details

4. **Check Network Tab:**
   - Should see request to `http://localhost:3001/api/events`
   - Response should have `{ status: "success", data: [...] }`

## Troubleshooting

### Events Not Loading?

1. **Check Backend is Running:**
   ```bash
   curl http://localhost:3001/api/events
   ```

2. **Check Environment Variable:**
   - File: `frontend/.env.local`
   - Should have: `NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"`

3. **Check Browser Console:**
   - Look for network errors
   - Check if API URL is correct

4. **Check Backend Logs:**
   - Should see GET request to `/api/events`
   - Check for any errors

### CORS Issues?

Backend should have CORS enabled in `backend/src/index.ts`:
```typescript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

## Files Modified

- ✅ `frontend/app/(public)/events/page.tsx` - Events list with TanStack Query
- ✅ `frontend/app/(public)/events/[id]/page.tsx` - Event detail with TanStack Query
- ✅ `frontend/hooks/useHasMounted.ts` - Hydration fix hook
- ✅ `docs/EVENTS_DYNAMIC_IMPLEMENTATION.md` - Updated documentation

## Files Already Existing (Used)

- `frontend/lib/queries/events.ts` - Query hooks
- `frontend/lib/axiosInstance.ts` - HTTP client
- `frontend/lib/apiPaths.ts` - API endpoints
- `frontend/lib/query-provider.tsx` - QueryClient provider

## Next Steps

1. Test event creation (admin dashboard)
2. Test participant registration
3. Test volunteer registration
4. Add event filtering
5. Add event search
6. Add pagination if needed
