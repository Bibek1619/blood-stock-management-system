# 🗄️ Zustand State Management - Complete Guide

**Date**: April 30, 2026  
**Status**: ✅ Implemented

---

## 📚 Overview

Zustand is now the primary state management solution for the Blood Bank Management System. It provides:

- ✅ **Simple API** - Easy to learn and use
- ✅ **TypeScript Support** - Full type safety
- ✅ **Persistence** - Automatic localStorage sync
- ✅ **No Boilerplate** - Minimal setup required
- ✅ **React Integration** - Works seamlessly with hooks
- ✅ **Performance** - Only re-renders when needed

---

## 🏗️ Store Architecture

### **Store Structure**

```
frontend/lib/store/
├── index.ts                  # Central exports
├── authStore.ts              # Authentication & user state
├── notificationStore.ts      # Toast notifications
├── bloodSearchStore.ts       # Blood search filters & UI
├── dashboardStore.ts         # Dashboard preferences
└── donorStore.ts             # Donor filters & view mode
```

---

## 📦 **1. Auth Store** (`authStore.ts`)

### **Purpose**
Manages user authentication, login state, and user profile.

### **State**
```typescript
{
  user: User | null;              // Current user object
  token: string | null;           // JWT token
  isAuthenticated: boolean;       // Login status
  isLoading: boolean;             // Loading state
}
```

### **Actions**
- `setUser(user)` - Set current user
- `setToken(token)` - Set auth token
- `login(user, token)` - Login user
- `logout()` - Logout and clear state
- `updateUser(updates)` - Update user profile
- `setLoading(loading)` - Set loading state

### **Usage Example**
```typescript
import { useAuthStore } from '@/lib/store';

function MyComponent() {
  // Get state
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  // Get actions
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  
  // Use in component
  const handleLogin = async () => {
    const response = await fetch('/api/auth/login', { ... });
    const { user, token } = await response.json();
    login(user, token);
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### **Persistence**
✅ Automatically persisted to `localStorage` as `auth-storage`

---

## 🔔 **2. Notification Store** (`notificationStore.ts`)

### **Purpose**
Global toast notification system for success/error messages.

### **State**
```typescript
{
  notifications: Notification[];  // Array of active notifications
}
```

### **Actions**
- `addNotification(message, type, duration)` - Add notification
- `removeNotification(id)` - Remove specific notification
- `clearAll()` - Clear all notifications

### **Convenience Hook: `useToast()`**
```typescript
const toast = useToast();

toast.success('Donation recorded successfully!');
toast.error('Failed to save data');
toast.info('New event available');
toast.warning('Blood stock is low');
```

### **Usage Example**
```typescript
import { useToast } from '@/lib/store';

function DonationForm() {
  const { success, error } = useToast();
  
  const handleSubmit = async (data) => {
    try {
      await saveDonation(data);
      success('Donation recorded successfully!');
    } catch (err) {
      error('Failed to save donation');
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### **Global Component**
Add `<GlobalNotifications />` to your root layout:

```typescript
// app/layout.tsx
import GlobalNotifications from '@/components/GlobalNotifications';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <GlobalNotifications />
      </body>
    </html>
  );
}
```

---

## 🔍 **3. Blood Search Store** (`bloodSearchStore.ts`)

### **Purpose**
Manages blood search filters, map state, and user location.

### **State**
```typescript
{
  selectedBloodGroup: string;           // Selected blood group filter
  locationQuery: string;                // Location search query
  radius: number;                       // Search radius in km
  clickedPosition: {lat, lng} | null;   // Pin position on map
  fullMapOpen: boolean;                 // Full map modal state
  selectedDonor: any | null;            // Selected donor for detail view
  userLocation: {lat, lng} | null;      // User's current location
  locationError: string | null;         // Location error message
  locationLoading: boolean;             // Location loading state
}
```

### **Actions**
- `setSelectedBloodGroup(group)` - Set blood group filter
- `setLocationQuery(query)` - Set location search
- `setRadius(radius)` - Set search radius
- `setClickedPosition(position)` - Set map pin
- `setFullMapOpen(open)` - Toggle full map
- `setSelectedDonor(donor)` - Select donor
- `setUserLocation(location)` - Set user location
- `clearFilters()` - Reset all filters
- `clearPin()` - Remove map pin

### **Usage Example**
```typescript
import { useBloodSearchStore } from '@/lib/store';

function BloodSearchPage() {
  const selectedBloodGroup = useBloodSearchStore((state) => state.selectedBloodGroup);
  const setSelectedBloodGroup = useBloodSearchStore((state) => state.setSelectedBloodGroup);
  const clearFilters = useBloodSearchStore((state) => state.clearFilters);
  
  return (
    <div>
      <select 
        value={selectedBloodGroup} 
        onChange={(e) => setSelectedBloodGroup(e.target.value)}
      >
        <option value="all">All Groups</option>
        <option value="A+">A+</option>
        <option value="B+">B+</option>
      </select>
      
      <button onClick={clearFilters}>Clear Filters</button>
    </div>
  );
}
```

### **Persistence**
✅ Persists: `selectedBloodGroup`, `radius`, `locationQuery`  
❌ Does NOT persist: `clickedPosition`, `selectedDonor`, `userLocation` (session-only)

---

## 📊 **4. Dashboard Store** (`dashboardStore.ts`)

### **Purpose**
Manages dashboard UI preferences and filters.

### **State**
```typescript
{
  sidebarCollapsed: boolean;            // Sidebar collapsed state
  activeTab: string;                    // Active tab/section
  dateRange: {from, to};                // Date range filter
  selectedEvent: string | null;         // Selected event filter
  theme: 'light' | 'dark';              // Theme preference
  chartType: 'bar' | 'line' | 'pie';    // Chart type preference
}
```

### **Actions**
- `toggleSidebar()` - Toggle sidebar
- `setSidebarCollapsed(collapsed)` - Set sidebar state
- `setActiveTab(tab)` - Set active tab
- `setDateRange(range)` - Set date filter
- `setSelectedEvent(eventId)` - Set event filter
- `setTheme(theme)` - Set theme
- `setChartType(type)` - Set chart type
- `resetFilters()` - Reset filters

### **Usage Example**
```typescript
import { useDashboardStore } from '@/lib/store';

function Dashboard() {
  const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed);
  const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
  const chartType = useDashboardStore((state) => state.chartType);
  
  return (
    <div className={sidebarCollapsed ? 'collapsed' : 'expanded'}>
      <button onClick={toggleSidebar}>Toggle Sidebar</button>
      {chartType === 'bar' ? <BarChart /> : <LineChart />}
    </div>
  );
}
```

### **Persistence**
✅ All state persisted to `localStorage` as `dashboard-storage`

---

## 👥 **5. Donor Store** (`donorStore.ts`)

### **Purpose**
Manages donor list filters and view preferences.

### **State**
```typescript
{
  filters: {
    bloodGroup: string;                 // Blood group filter
    location: string;                   // Location filter
    eligibility: 'all' | 'eligible' | 'not-eligible';
    donorType: 'all' | 'PERSON' | 'ORGANIZATION';
    searchQuery: string;                // Search query
    sortBy: 'name' | 'lastDonation' | 'totalDonations';
    sortOrder: 'asc' | 'desc';
  };
  selectedDonorId: string | null;       // Selected donor ID
  viewMode: 'grid' | 'list' | 'map';    // View mode
}
```

### **Actions**
- `setFilter(key, value)` - Set single filter
- `setFilters(filters)` - Set multiple filters
- `resetFilters()` - Reset all filters
- `setSelectedDonorId(id)` - Select donor
- `setViewMode(mode)` - Set view mode

### **Usage Example**
```typescript
import { useDonorStore } from '@/lib/store';

function DonorList() {
  const filters = useDonorStore((state) => state.filters);
  const setFilter = useDonorStore((state) => state.setFilter);
  const viewMode = useDonorStore((state) => state.viewMode);
  
  return (
    <div>
      <input
        value={filters.searchQuery}
        onChange={(e) => setFilter('searchQuery', e.target.value)}
        placeholder="Search donors..."
      />
      
      <select 
        value={filters.bloodGroup}
        onChange={(e) => setFilter('bloodGroup', e.target.value)}
      >
        <option value="all">All Blood Groups</option>
      </select>
      
      {viewMode === 'grid' ? <GridView /> : <ListView />}
    </div>
  );
}
```

---

## 🎯 **Best Practices**

### **1. Selective Subscriptions**
Only subscribe to the state you need:

```typescript
// ❌ BAD - Re-renders on any state change
const store = useAuthStore();

// ✅ GOOD - Only re-renders when user changes
const user = useAuthStore((state) => state.user);
```

### **2. Multiple Selectors**
Use multiple selectors for better performance:

```typescript
// ✅ GOOD
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const logout = useAuthStore((state) => state.logout);
```

### **3. Derived State**
Compute derived state in selectors:

```typescript
const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
const userName = useAuthStore((state) => state.user?.name || 'Guest');
```

### **4. Actions Outside Components**
You can use stores outside React components:

```typescript
import { useAuthStore } from '@/lib/store';

// In API utility
export async function fetchWithAuth(url: string) {
  const token = useAuthStore.getState().token;
  
  return fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
```

### **5. Async Actions**
Handle async operations in actions:

```typescript
// In store definition
const useMyStore = create((set) => ({
  data: null,
  loading: false,
  
  fetchData: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/data');
      const data = await response.json();
      set({ data, loading: false });
    } catch (error) {
      set({ loading: false });
    }
  }
}));
```

---

## 🔄 **Migration Guide**

### **From useState to Zustand**

**Before:**
```typescript
function MyComponent() {
  const [count, setCount] = useState(0);
  
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**After:**
```typescript
// Create store
const useCountStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 }))
}));

// Use in component
function MyComponent() {
  const count = useCountStore((state) => state.count);
  const increment = useCountStore((state) => state.increment);
  
  return <button onClick={increment}>{count}</button>;
}
```

### **From Context to Zustand**

**Before:**
```typescript
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

function MyComponent() {
  const { user } = useContext(AuthContext);
  return <div>{user?.name}</div>;
}
```

**After:**
```typescript
// Just use the store directly - no provider needed!
function MyComponent() {
  const user = useAuthStore((state) => state.user);
  return <div>{user?.name}</div>;
}
```

---

## 🧪 **Testing**

### **Testing Components with Zustand**

```typescript
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store';

describe('AuthStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
  });
  
  it('should login user', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.login({ id: '1', name: 'Test' }, 'token123');
    });
    
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user?.name).toBe('Test');
  });
});
```

---

## 📈 **Performance Tips**

### **1. Use Shallow Comparison**
```typescript
import { shallow } from 'zustand/shallow';

const { user, token } = useAuthStore(
  (state) => ({ user: state.user, token: state.token }),
  shallow
);
```

### **2. Split Large Stores**
Instead of one huge store, create multiple focused stores.

### **3. Memoize Selectors**
```typescript
import { useMemo } from 'react';

const filteredDonors = useMemo(() => {
  return donors.filter(d => d.bloodGroup === selectedGroup);
}, [donors, selectedGroup]);
```

---

## 🚀 **Next Steps**

### **Immediate Actions**
1. ✅ Add `<GlobalNotifications />` to root layout
2. ✅ Replace `useState` with Zustand in blood-search page
3. ✅ Migrate auth logic to use `useAuthStore`
4. ✅ Update login/logout to use Zustand

### **Future Enhancements**
- Add middleware for logging (development)
- Add middleware for analytics
- Create devtools integration
- Add state persistence encryption

---

## 📚 **Resources**

- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **GitHub**: https://github.com/pmndrs/zustand
- **Examples**: https://github.com/pmndrs/zustand/tree/main/examples

---

## ✅ **Summary**

**What We Have Now**:
- ✅ 5 Zustand stores for different domains
- ✅ TypeScript support throughout
- ✅ Persistence for important state
- ✅ Global notification system
- ✅ Clean, maintainable architecture

**Benefits**:
- 🚀 Better performance (selective re-renders)
- 🧹 Cleaner code (no prop drilling)
- 💾 Automatic persistence
- 🔧 Easy to test
- 📦 Small bundle size (~1KB)

**Ready to use!** Start migrating your components to use Zustand stores. 🎉
