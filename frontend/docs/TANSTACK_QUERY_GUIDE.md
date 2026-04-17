# TanStack Query Setup Guide

## Overview
TanStack Query (formerly React Query) is now set up in the frontend for efficient data fetching, caching, and state management.

## Installation
```bash
npm install @tanstack/react-query
```

## Setup

### 1. Query Provider (`lib/query-provider.tsx`)
Wraps the entire app to provide query client context.

```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

### 2. Root Layout (`app/layout.tsx`)
Added QueryProvider to wrap all pages.

## Usage Examples

### Example 1: Login with Mutation

```typescript
'use client';

import { useLogin } from '@/lib/queries/auth';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await loginMutation.mutateAsync({
        email: 'user@example.com',
        password: 'password123',
      });

      const { user } = result.data;
      
      // Redirect based on role
      if (user.role === 'DONOR') {
        router.push('/home');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? 'Logging in...' : 'Login'}
      </button>
      
      {loginMutation.isError && (
        <p className="text-red-600">
          {loginMutation.error.message}
        </p>
      )}
    </form>
  );
}
```

### Example 2: Fetch Donors List

```typescript
'use client';

import { useDonors } from '@/lib/queries/donors';

export default function DonorsPage() {
  const { data: donors, isLoading, isError, error } = useDonors();

  if (isLoading) {
    return <div>Loading donors...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Donors</h1>
      <ul>
        {donors?.map((donor) => (
          <li key={donor.id}>
            {donor.user?.name} - {donor.bloodGroup}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Example 3: Create Donor with Mutation

```typescript
'use client';

import { useCreateDonor } from '@/lib/queries/donors';
import { useRouter } from 'next/navigation';

export default function DonorFormPage() {
  const router = useRouter();
  const createDonor = useCreateDonor();

  const handleSubmit = async (formData: any) => {
    try {
      await createDonor.mutateAsync({
        userId: formData.userId,
        bloodGroup: formData.bloodGroup,
        dateOfBirth: formData.dateOfBirth,
        weight: formData.weight,
        location: formData.location,
        city: formData.city,
        address: formData.address,
      });

      // Success! Redirect
      router.push('/home');
    } catch (error) {
      console.error('Failed to create donor:', error);
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(/* form data */);
    }}>
      {/* Form fields */}
      <button 
        type="submit" 
        disabled={createDonor.isPending}
      >
        {createDonor.isPending ? 'Creating...' : 'Create Donor'}
      </button>
    </form>
  );
}
```

### Example 4: Fetch Single Donor

```typescript
'use client';

import { useDonor } from '@/lib/queries/donors';

export default function DonorDetailPage({ params }: { params: { id: string } }) {
  const { data: donor, isLoading } = useDonor(params.id);

  if (isLoading) return <div>Loading...</div>;
  if (!donor) return <div>Donor not found</div>;

  return (
    <div>
      <h1>{donor.user?.name}</h1>
      <p>Blood Group: {donor.bloodGroup}</p>
      <p>Location: {donor.location}</p>
      <p>Total Donations: {donor.totalDonations}</p>
    </div>
  );
}
```

## Query Keys Pattern

Query keys are organized hierarchically for easy invalidation:

```typescript
export const donorKeys = {
  all: ['donors'] as const,
  lists: () => [...donorKeys.all, 'list'] as const,
  list: (filters?: any) => [...donorKeys.lists(), filters] as const,
  details: () => [...donorKeys.all, 'detail'] as const,
  detail: (id: string) => [...donorKeys.details(), id] as const,
};
```

### Invalidation Examples

```typescript
// Invalidate all donor queries
queryClient.invalidateQueries({ queryKey: donorKeys.all });

// Invalidate all donor lists
queryClient.invalidateQueries({ queryKey: donorKeys.lists() });

// Invalidate specific donor
queryClient.invalidateQueries({ queryKey: donorKeys.detail('123') });
```

## Available Query Hooks

### Auth Queries (`lib/queries/auth.ts`)
- `useLogin()` - Login mutation
- `useRegister()` - Register mutation
- `useLogout()` - Logout mutation

### Donor Queries (`lib/queries/donors.ts`)
- `useDonors(filters?)` - Fetch all donors
- `useDonor(id)` - Fetch single donor
- `useCreateDonor()` - Create donor mutation
- `useUpdateDonor(id)` - Update donor mutation
- `useDeleteDonor()` - Delete donor mutation

## Creating New Query Hooks

### Template for New Resource

```typescript
// lib/queries/events.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axiosInstance';

// Query Keys
export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (filters?: any) => [...eventKeys.lists(), filters] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
};

// Fetch all events
export function useEvents(filters?: any) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: async () => {
      const response = await axiosInstance.get('/api/events', {
        params: filters,
      });
      return response.data.data;
    },
  });
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/api/events', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}
```

## Benefits

1. **Automatic Caching** - Data is cached and reused across components
2. **Background Refetching** - Keeps data fresh automatically
3. **Optimistic Updates** - UI updates before server confirms
4. **Error Handling** - Built-in error states
5. **Loading States** - Easy loading indicators
6. **Deduplication** - Multiple requests for same data are deduplicated
7. **Pagination** - Built-in pagination support
8. **Infinite Scroll** - Easy infinite queries

## Best Practices

1. **Use Query Keys Consistently** - Follow the hierarchical pattern
2. **Invalidate on Mutations** - Always invalidate related queries after mutations
3. **Handle Loading States** - Show loading indicators
4. **Handle Errors** - Display error messages
5. **Use Optimistic Updates** - For better UX
6. **Set Appropriate Stale Times** - Balance freshness vs performance

## Migration from useState/useEffect

### Before (useState/useEffect)
```typescript
const [donors, setDonors] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchDonors = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/donors');
      setDonors(response.data.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  
  fetchDonors();
}, []);
```

### After (TanStack Query)
```typescript
const { data: donors, isLoading, isError, error } = useDonors();
```

Much simpler and includes caching, refetching, and more!

## DevTools (Optional)

Install React Query DevTools for debugging:

```bash
npm install @tanstack/react-query-devtools
```

Add to your app:

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryProvider>
  {children}
  <ReactQueryDevtools initialIsOpen={false} />
</QueryProvider>
```

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Query Keys Guide](https://tanstack.com/query/latest/docs/react/guides/query-keys)
- [Mutations Guide](https://tanstack.com/query/latest/docs/react/guides/mutations)
