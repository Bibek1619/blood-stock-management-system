# 🚀 Zustand Quick Reference Card

**One-page cheat sheet for Zustand in Blood Bank System**

---

## 📦 **Import Stores**

```typescript
import { 
  useAuthStore,
  useToast,
  useBloodSearchStore,
  useDashboardStore,
  useDonorStore 
} from '@/lib/store';
```

---

## 🔐 **Auth Store**

```typescript
// Get state
const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

// Actions
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);
const updateUser = useAuthStore((state) => state.updateUser);

// Usage
login({ id: '1', name: 'John', email: 'john@example.com', ... }, 'token123');
logout();
updateUser({ name: 'John Doe' });
```

---

## 🔔 **Notifications (Toast)**

```typescript
import { useToast } from '@/lib/store';

const { success, error, info, warning } = useToast();

// Usage
success('Donation saved successfully!');
error('Failed to save donation');
info('New event available');
warning('Blood stock is low');
```

**Don't forget to add to layout:**
```typescript
import GlobalNotifications from '@/components/GlobalNotifications';

<GlobalNotifications />
```

---

## 🔍 **Blood Search Store**

```typescript
// Filters
const selectedBloodGroup = useBloodSearchStore((state) => state.selectedBloodGroup);
const locationQuery = useBloodSearchStore((state) => state.locationQuery);
const radius = useBloodSearchStore((state) => state.radius);
const clickedPosition = useBloodSearchStore((state) => state.clickedPosition);

// Actions
const setSelectedBloodGroup = useBloodSearchStore((state) => state.setSelectedBloodGroup);
const setLocationQuery = useBloodSearchStore((state) => state.setLocationQuery);
const setRadius = useBloodSearchStore((state) => state.setRadius);
const setClickedPosition = useBloodSearchStore((state) => state.setClickedPosition);
const clearFilters = useBloodSearchStore((state) => state.clearFilters);
const clearPin = useBloodSearchStore((state) => state.clearPin);

// Usage
setSelectedBloodGroup('A+');
setRadius(10);
clearFilters();
```

---

## 📊 **Dashboard Store**

```typescript
// UI State
const sidebarCollapsed = useDashboardStore((state) => state.sidebarCollapsed);
const theme = useDashboardStore((state) => state.theme);
const chartType = useDashboardStore((state) => state.chartType);

// Actions
const toggleSidebar = useDashboardStore((state) => state.toggleSidebar);
const setTheme = useDashboardStore((state) => state.setTheme);
const setChartType = useDashboardStore((state) => state.setChartType);

// Usage
toggleSidebar();
setTheme('dark');
setChartType('pie');
```

---

## 👥 **Donor Store**

```typescript
// Filters
const filters = useDonorStore((state) => state.filters);
const viewMode = useDonorStore((state) => state.viewMode);

// Actions
const setFilter = useDonorStore((state) => state.setFilter);
const setFilters = useDonorStore((state) => state.setFilters);
const resetFilters = useDonorStore((state) => state.resetFilters);
const setViewMode = useDonorStore((state) => state.setViewMode);

// Usage
setFilter('bloodGroup', 'A+');
setFilter('searchQuery', 'John');
setFilters({ bloodGroup: 'A+', location: 'New York' });
setViewMode('grid');
resetFilters();
```

---

## 🎯 **Common Patterns**

### **Pattern 1: Get State + Action**
```typescript
const value = useStore((state) => state.value);
const setValue = useStore((state) => state.setValue);
```

### **Pattern 2: Multiple Values**
```typescript
const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);
const logout = useAuthStore((state) => state.logout);
```

### **Pattern 3: Derived State**
```typescript
const isAdmin = useAuthStore((state) => state.user?.role === 'ADMIN');
const fullName = useAuthStore((state) => `${state.user?.name || 'Guest'}`);
```

### **Pattern 4: Use Outside Components**
```typescript
import { useAuthStore } from '@/lib/store';

const token = useAuthStore.getState().token;
const login = useAuthStore.getState().login;
```

---

## 🔄 **Migration Examples**

### **useState → Zustand**
```typescript
// Before
const [count, setCount] = useState(0);

// After
const count = useCountStore((state) => state.count);
const setCount = useCountStore((state) => state.setCount);
```

### **localStorage → Zustand**
```typescript
// Before
const user = JSON.parse(localStorage.getItem('user') || 'null');
localStorage.setItem('user', JSON.stringify(user));

// After
const user = useAuthStore((state) => state.user);
const setUser = useAuthStore((state) => state.setUser);
// Automatically persisted!
```

### **Custom Toast → Zustand**
```typescript
// Before
const [toasts, setToasts] = useState([]);
const addToast = (msg) => { /* custom logic */ };

// After
const { success, error } = useToast();
success('Message');
```

---

## ⚡ **Performance Tips**

### **Tip 1: Selective Subscriptions**
```typescript
// ❌ BAD - Re-renders on any change
const store = useAuthStore();

// ✅ GOOD - Only re-renders when user changes
const user = useAuthStore((state) => state.user);
```

### **Tip 2: Shallow Comparison**
```typescript
import { shallow } from 'zustand/shallow';

const { user, token } = useAuthStore(
  (state) => ({ user: state.user, token: state.token }),
  shallow
);
```

### **Tip 3: Memoize Selectors**
```typescript
import { useMemo } from 'react';

const filteredData = useMemo(() => {
  return data.filter(item => item.type === selectedType);
}, [data, selectedType]);
```

---

## 🐛 **Debugging**

### **Check Current State**
```typescript
console.log(useAuthStore.getState());
console.log(useBloodSearchStore.getState());
```

### **Subscribe to Changes**
```typescript
useAuthStore.subscribe((state) => {
  console.log('Auth state changed:', state);
});
```

### **Reset Store (Testing)**
```typescript
useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
```

---

## ✅ **Quick Checklist**

- [ ] Zustand installed (`npm install zustand`)
- [ ] Stores imported from `@/lib/store`
- [ ] `<GlobalNotifications />` added to layout
- [ ] Replace `useState` with Zustand stores
- [ ] Replace `localStorage` with persisted stores
- [ ] Replace custom toast with `useToast()`
- [ ] Test persistence (refresh page)
- [ ] Test across multiple tabs

---

## 📚 **Full Documentation**

- **Setup Guide**: `docs/ZUSTAND_SETUP_COMPLETE.md`
- **Complete Guide**: `docs/ZUSTAND_STATE_MANAGEMENT.md`
- **Zustand Docs**: https://docs.pmnd.rs/zustand

---

**Print this page and keep it handy! 📄**
