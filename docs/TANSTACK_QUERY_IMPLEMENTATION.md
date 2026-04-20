# TanStack Query Implementation

## Overview
The Blood Bank Management System uses TanStack Query (React Query) for efficient data fetching, caching, and state management.

## Structure

### Query Hooks Location
All query hooks are organized in `frontend/lib/queries/`:
- `donors.ts` - Donor management queries
- `donations.ts` - Donation tracking queries

### Key Features
1. **Automatic Caching** - Data is cached and reused across components
2. **Background Refetching** - Stale data is automatically refreshed
3. **Optimistic Updates** - UI updates immediately on mutations
4. **Query Invalidation** - Related queries are invalidated after mutations

## Donor Queries (`frontend/lib/queries/donors.ts`)

### Available Hooks

#### `useDonors(filters?)`
Fetches all donors with optional filters
```typescript
const { data: donors, isLoading, error } = useDonors();
```

#### `useDonor(id)`
Fetches a single donor by ID
```typescript
const { data: donor, isLoading, error } = useDonor(donorId);
```

#### `useCreateDonor()`
Creates a new donor
```typescript
const createDonor = useCreateDonor();
createDonor.mutate(donorData);
```

#### `useUpdateDonor(id)`
Updates an existing donor
```typescript
const updateDonor = useUpdateDonor(donorId);
updateDonor.mutate(updatedData);
```

#### `useDeleteDonor()`
Deletes a donor
```typescript
const deleteDonor = useDeleteDonor();
deleteDonor.mutate(donorId);
```

### Query Keys
```typescript
donorKeys = {
  all: ['donors'],
  lists: () => ['donors', 'list'],
  list: (filters) => ['donors', 'list', filters],
  details: () => ['donors', 'detail'],
  detail: (id) => ['donors', 'detail', id],
}
```

## Donation Queries (`frontend/lib/queries/donations.ts`)

### Available Hooks

#### `useDonations(filters?)`
Fetches all donations with optional filters
```typescript
const { data: donations, isLoading } = useDonations();
```

#### `useDonationsByUser(userId)`
Fetches donations for a specific user
```typescript
const { data: donations, isLoading } = useDonationsByUser(userId);
```

#### `useDonationsByDonor(donorId)`
Fetches donations for a specific donor
```typescript
const { data: donations, isLoading } = useDonationsByDonor(donorId);
```

#### `useDonation(id)`
Fetches a single donation by ID
```typescript
const { data: donation, isLoading } = useDonation(donationId);
```

#### `useCreateDonation()`
Creates a new donation
```typescript
const createDonation = useCreateDonation();
createDonation.mutate(donationData);
```

#### `useUpdateDonation(id)`
Updates an existing donation
```typescript
const updateDonation = useUpdateDonation(donationId);
updateDonation.mutate(updatedData);
```

#### `useDeleteDonation()`
Deletes a donation
```typescript
const deleteDonation = useDeleteDonation();
deleteDonation.mutate(donationId);
```

### Query Keys
```typescript
donationKeys = {
  all: ['donations'],
  lists: () => ['donations', 'list'],
  list: (filters) => ['donations', 'list', filters],
  details: () => ['donations', 'detail'],
  detail: (id) => ['donations', 'detail', id],
  byUser: (userId) => ['donations', 'user', userId],
  byDonor: (donorId) => ['donations', 'donor', donorId],
}
```

## Usage Examples

### Donor Profile Page
```typescript
export default function DonorProfilePage() {
  const params = useParams();
  const donorId = params.id as string;

  // Fetch donor data
  const { data: donor, isLoading, error } = useDonor(donorId);

  // Fetch donations for this donor
  const { data: donations } = useDonationsByUser(donor?.userId || '');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage />;

  return <DonorProfile donor={donor} donations={donations} />;
}
```

### Donors List Page
```typescript
export default function DonorsPage() {
  const [filters, setFilters] = useState({});
  
  // Fetch all donors with filters
  const { data: donors = [], isLoading, error } = useDonors(filters);

  return (
    <div>
      {isLoading ? <LoadingSpinner /> : <DonorsList donors={donors} />}
    </div>
  );
}
```

### Creating a Donation
```typescript
function DonationForm() {
  const createDonation = useCreateDonation();

  const handleSubmit = (data) => {
    createDonation.mutate(data, {
      onSuccess: () => {
        toast.success('Donation recorded successfully');
      },
      onError: (error) => {
        toast.error('Failed to record donation');
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

## Benefits

### 1. Automatic Cache Management
- Data is cached after first fetch
- Subsequent requests use cached data
- Background refetch keeps data fresh

### 2. Loading & Error States
- Built-in `isLoading`, `isError`, `error` states
- No need for manual state management

### 3. Optimistic Updates
- Mutations automatically invalidate related queries
- UI updates immediately, then syncs with server

### 4. Reduced Boilerplate
- No need for useEffect, useState for data fetching
- Consistent API across all components

### 5. Performance
- Prevents unnecessary refetches
- Deduplicates simultaneous requests
- Automatic garbage collection of unused cache

## Configuration

TanStack Query is configured in the root layout with:
- `staleTime`: How long data is considered fresh
- `cacheTime`: How long unused data stays in cache
- `refetchOnWindowFocus`: Refetch when window regains focus
- `retry`: Number of retry attempts on failure

## Best Practices

1. **Use Query Keys Consistently**
   - Always use the exported key factories
   - Ensures proper cache invalidation

2. **Enable Queries Conditionally**
   - Use `enabled` option when data depends on other data
   ```typescript
   const { data } = useDonor(id, { enabled: !!id });
   ```

3. **Handle Loading & Error States**
   - Always check `isLoading` and `error`
   - Provide user feedback

4. **Invalidate Related Queries**
   - After mutations, invalidate affected queries
   - Already handled in mutation hooks

5. **Use Optimistic Updates**
   - For better UX, update UI before server response
   - Rollback on error

## Future Enhancements

- Add more query hooks for other entities (Events, Certificates, etc.)
- Implement infinite queries for pagination
- Add prefetching for better performance
- Implement optimistic updates for mutations
