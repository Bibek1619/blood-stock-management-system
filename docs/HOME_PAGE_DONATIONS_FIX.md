# Home Page Donations Fix - Zero Count Issue

## Problem Identified ✅
The total donations were showing zero because the home page was trying to call a non-existent API endpoint `/api/donors/stats/{userId}` that doesn't exist in the backend.

## Root Cause Analysis

### 🔍 **Issue Discovery**
1. **Non-existent Endpoint**: The `useDonorStats()` query was calling `/api/donors/stats/{userId}` which doesn't exist
2. **Backend API Gap**: The backend only has basic CRUD operations for donors, no statistics endpoint
3. **Query Failure**: The stats query was failing silently, returning undefined/null values

### 🛠 **Available Backend Endpoints**
**Donor Routes (`/api/donors`):**
- `GET /api/donors` - Get all donors (supports userId filter)
- `GET /api/donors/:id` - Get donor by ID
- `POST /api/donors` - Create donor
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor

**Donation Routes (`/api/donations`):**
- `GET /api/donations` - Get all donations (supports userId filter)
- `GET /api/donations/:id` - Get donation by ID
- Other CRUD operations...

## Solution Applied

### 🚀 **Frontend Statistics Calculation**
Instead of relying on a backend stats endpoint, I implemented frontend calculation using existing data:

```tsx
// Calculate stats from actual data
const donorStats = {
  totalDonations: donations?.length || 0,
  livesSaved: (donations?.length || 0) * 3, // Each donation saves ~3 lives
  eventsAttended: 0, // TODO: Calculate from event participation
  certificates: donations?.filter(d => d.status === 'COMPLETED').length || 0,
  lastDonationDate: donations?.[0]?.donationDate,
  nextEligibleDate: donations?.[0]?.donationDate 
    ? new Date(new Date(donations[0].donationDate).getTime() + (56 * 24 * 60 * 60 * 1000)).toISOString() // 56 days later
    : undefined,
};
```

### 🔧 **Key Changes Made**

#### 1. **Removed Non-existent Query**
```tsx
// BEFORE (Broken)
const { data: donorStats } = useDonorStats(user?.id || '');

// AFTER (Working)
// Calculate stats from existing donation data
```

#### 2. **Enhanced Data Fetching**
```tsx
const { data: donations, isLoading: donationsLoading, error: donationsError } = useDonationsByUser(user?.id || '');
```

#### 3. **Fixed Donor Profile Query**
```tsx
// Fixed array handling for donor lookup
const donors = response.data.data;
return Array.isArray(donors) ? donors[0] || null : null;
```

#### 4. **Added Debug Logging**
```tsx
console.log('🔍 Debug Info:', {
  userId: user?.id,
  donorProfile,
  donations,
  donationsLoading,
  donationsError,
});
```

#### 5. **Enhanced Error Handling**
```tsx
{donationsError && (
  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
    <p className="text-sm text-yellow-800">
      ⚠️ Unable to load donation data. Please refresh the page or contact support if the issue persists.
    </p>
  </div>
)}
```

### 📊 **Statistics Calculation Logic**

| Statistic | Calculation Method |
|-----------|-------------------|
| **Total Donations** | `donations?.length || 0` |
| **Lives Saved** | `totalDonations * 3` (industry standard) |
| **Events Attended** | `0` (TODO: needs event participation data) |
| **Certificates** | `donations.filter(d => d.status === 'COMPLETED').length` |
| **Last Donation** | `donations[0]?.donationDate` (sorted by date desc) |
| **Next Eligible** | `lastDonationDate + 56 days` (standard waiting period) |

### 🎯 **Why This Approach Works**

✅ **Uses Existing APIs**: Leverages working `/api/donations?userId=X` endpoint  
✅ **Real-Time Calculation**: Stats update automatically when donations change  
✅ **No Backend Changes**: Works with current backend implementation  
✅ **Accurate Data**: Calculates from actual donation records  
✅ **Better Performance**: Single query instead of multiple API calls  

## Testing & Debugging

### 🔍 **Debug Information**
The page now logs debug information to help identify issues:
- User ID being used for queries
- Donor profile data received
- Donations array and loading state
- Any errors from API calls

### 🧪 **Test Scenarios**
1. **New User (No Donations)**: Shows 0 donations, motivational message
2. **Active Donor**: Shows real donation count and impact
3. **API Error**: Shows error message, graceful degradation
4. **Loading State**: Shows spinner while fetching data

## Files Modified

**Updated Files:**
- ✅ `frontend/app/(public)/home/page.tsx` - Fixed stats calculation and error handling
- ✅ `frontend/lib/queries/donors.ts` - Fixed donor profile query and removed non-existent stats query

**Removed:**
- ❌ `useDonorStats()` query hook (non-existent endpoint)
- ❌ Backend dependency for statistics

## Expected Behavior Now

### 🎯 **For New Users (No Donations)**
- Total Donations: 0
- Lives Saved: 0
- Events Attended: 0
- Certificates: 0
- Impact Message: "Start your journey as a life saver today!"

### 🎯 **For Active Donors**
- Total Donations: Actual count from database
- Lives Saved: Donations × 3
- Events Attended: 0 (until event participation is implemented)
- Certificates: Count of completed donations
- Impact Message: "You've made X donations and potentially saved Y lives!"

## Next Steps (Optional Improvements)

1. **Backend Stats Endpoint**: Create `/api/donors/stats/{userId}` for better performance
2. **Event Participation**: Track and display actual events attended
3. **Certificate System**: Implement proper certificate generation and tracking
4. **Caching**: Add query caching for better performance
5. **Real-time Updates**: WebSocket updates for live statistics

The home page should now show accurate donation counts based on actual data from the database!