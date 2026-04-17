# Donors Page Update

## Changes Made

### 1. Added TanStack Query Integration
- Replaced manual `useEffect` and `useState` with `useDonors` hook
- Automatic caching and refetching
- Better loading and error states

### 2. Added Tabs for Donor Filtering
**Three tabs:**
- **All Donors** - Shows all registered donors
- **Event Donors** - Shows donors with totalDonations > 0
- **Web Donors** - Shows only verified donors (isVerified = true)

### 3. Fixed Blood Group Display
**Before:** AB_POSITIVE, A_NEGATIVE
**After:** AB+, A-

Created `formatBloodGroup()` utility function:
```typescript
const formatBloodGroup = (bloodGroup: string): string => {
  const mapping: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };
  return mapping[bloodGroup] || bloodGroup;
};
```

### 4. Added isVerified to API Response
Updated `donorController.ts` to include `isVerified` field:
```typescript
user: {
  select: {
    id: true,
    name: true,
    email: true,
    phone: true,
    isVerified: true, // Added this
  },
}
```

### 5. Enhanced UI Features
- ✅ Verified badge for web donors
- ✅ Loading spinner
- ✅ Tab counts showing number of donors in each category
- ✅ Context-aware empty states
- ✅ Proper error handling

## Tab Logic

### All Donors
```typescript
return donors; // All donors
```

### Event Donors
```typescript
return donors.filter(d => d.totalDonations > 0);
```

### Web Donors
```typescript
return donors.filter(d => d.user?.isVerified === true);
```

## Blood Group Formatting

Applied in:
1. Table rows
2. Donor detail sheet banner
3. Donor detail sheet info section

## Files Modified

1. `backend/src/controllers/donorController.ts`
   - Added `isVerified` to user select

2. `frontend/app/dashboard/donors/page.tsx`
   - Added TanStack Query
   - Added tabs
   - Added blood group formatting
   - Removed "Add Donor" button
   - Enhanced UI

3. `frontend/lib/queries/donors.ts`
   - Updated Donor interface to include `isVerified`
   - Fixed response type

## Testing

### Test Web Donors Tab
1. Register a new donor through `/become-donor`
2. Login and complete donor form
3. Go to `/dashboard/donors`
4. Click "Web Donors" tab
5. ✅ Should see the registered donor with "✓ Verified" badge

### Test Blood Group Display
1. View any donor in the table
2. ✅ Should see "AB+" instead of "AB_POSITIVE"
3. Click to view donor details
4. ✅ Blood group should be formatted in banner and info section

### Test Event Donors Tab
1. Click "Event Donors" tab
2. ✅ Should show only donors with donations > 0
3. ✅ Empty state if no event donors

## Benefits

1. **Better Performance** - TanStack Query handles caching
2. **Better UX** - Clear categorization with tabs
3. **Cleaner Display** - Blood groups formatted properly (AB+ vs AB_POSITIVE)
4. **Verified Donors** - Easy to identify web-registered donors
5. **Maintainable** - Cleaner code with hooks
