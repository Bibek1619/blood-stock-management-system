# Blood Stock Components

This directory contains modular components for the Blood Stock page.

## Component Structure

### 1. SummaryStats.tsx
**Purpose**: Displays key metrics at the top of the page

**Features**:
- Total Available packs count
- Critical Stock groups count (below threshold)
- Total Used packs count
- Total Expired packs count
- Color-coded cards with icons
- Responsive grid layout (4 columns)

**Props**:
```typescript
interface SummaryStatsProps {
  totalAvailable: number;
  criticalStockCount: number;
  totalUsed: number;
  totalExpired: number;
  criticalThreshold: number;
}
```

**Usage**:
```tsx
<SummaryStats
  totalAvailable={stats.totalAvailable}
  criticalStockCount={stats.criticalStockGroups.length}
  totalUsed={stats.totalUsed}
  totalExpired={stats.totalExpired}
  criticalThreshold={CRITICAL_STOCK_THRESHOLD}
/>
```

---

### 2. BloodInventoryByGroup.tsx
**Purpose**: Visual overview of all blood groups with stock levels

**Features**:
- Grid display of all 8 blood groups (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Color-coded status indicators:
  - 🟢 Green: Safe stock (≥ low threshold)
  - 🟠 Orange: Low stock (< low threshold)
  - 🔴 Red: Critical stock (< critical threshold)
- Click to filter by blood group
- Loading state with spinner
- Legend showing color meanings
- Responsive grid (4 columns on mobile, 8 on desktop)

**Props**:
```typescript
interface BloodInventoryByGroupProps {
  bloodGroups: string[];
  stockByGroup: Record<string, number>;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  isLoading: boolean;
  onGroupClick: (group: string) => void;
}
```

**Usage**:
```tsx
<BloodInventoryByGroup
  bloodGroups={BLOOD_GROUPS}
  stockByGroup={stats.stockByGroup}
  lowStockThreshold={LOW_STOCK_THRESHOLD}
  criticalStockThreshold={CRITICAL_STOCK_THRESHOLD}
  isLoading={isLoadingSummary}
  onGroupClick={setFilterGroup}
/>
```

---

### 3. BloodPacksTable.tsx
**Purpose**: Detailed table view of all blood packs with actions

**Features**:
- Sortable table with 8 columns:
  - Pack Code (monospace font)
  - Blood Group (badge)
  - Donor Name
  - Collection Type (Event/Web Donor/Organization)
  - Collection Date
  - Expiry Date
  - Status (Available/Used/Expired/Reserved)
  - Actions (dropdown menu)
- Status badges with color coding:
  - 🟢 Available
  - ⚫ Used
  - 🔴 Expired
  - 🔵 Reserved
- Dropdown actions for status updates:
  - Mark as Used
  - Mark as Expired
  - Mark as Reserved
  - Mark as Available (for non-available packs)
- Pagination support
- Empty state message
- Limits display to 50 packs per page

**Props**:
```typescript
interface BloodPacksTableProps {
  packs: BloodPack[];
  pagination?: PaginationInfo;
  onStatusUpdate: (id: string, status: string) => Promise<void>;
  onPageChange?: (page: number) => void;
}
```

**Usage**:
```tsx
<BloodPacksTable
  packs={filteredPacks}
  pagination={pagination}
  onStatusUpdate={handleUpdateStatus}
  onPageChange={setCurrentPage}
/>
```

---

## Data Flow

```
page.tsx (Main Component)
├── Fetches blood packs data (paginated)
├── Fetches stock summary data
├── Calculates statistics
├── Filters packs based on criteria
└── Passes data to child components

SummaryStats
├── Receives aggregated totals
└── Displays metric cards

BloodInventoryByGroup
├── Receives stock by group
├── Applies color coding logic
└── Emits group click events

BloodPacksTable
├── Receives filtered packs
├── Handles status updates
└── Manages pagination
```

## Key Features

1. **Modular Design**: Each component has a single, clear responsibility
2. **Reusable**: Components can be used independently or in other contexts
3. **Type-Safe**: Full TypeScript interfaces for all props
4. **Responsive**: Mobile-first design with responsive grids
5. **Interactive**: Click handlers for filtering and actions
6. **Real-time Updates**: Uses TanStack Query for data fetching and caching

## Styling

All components use:
- **shadcn/ui** components (Card, Table, Badge, etc.)
- **Tailwind CSS** for styling
- **Consistent color scheme**:
  - Primary: `#7F1D1D` (dark red)
  - Success: Green shades
  - Warning: Orange shades
  - Danger: Red shades
  - Info: Blue shades

## Constants

```typescript
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LOW_STOCK_THRESHOLD = 5;
const CRITICAL_STOCK_THRESHOLD = 3;
```

## Blood Group Mapping

The components handle conversion between database format and display format:

```typescript
const bloodGroupMap = {
  'A_POSITIVE': 'A+',
  'A_NEGATIVE': 'A-',
  'B_POSITIVE': 'B+',
  'B_NEGATIVE': 'B-',
  'AB_POSITIVE': 'AB+',
  'AB_NEGATIVE': 'AB-',
  'O_POSITIVE': 'O+',
  'O_NEGATIVE': 'O-',
};
```

## Status Configuration

Status badges use consistent styling:

```typescript
const PACK_STATUS_CONFIG = {
  AVAILABLE: { bg: 'rgba(34, 197, 94, 0.08)', text: '#16a34a', ... },
  USED: { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569', ... },
  EXPIRED: { bg: 'rgba(239, 68, 68, 0.08)', text: '#dc2626', ... },
  RESERVED: { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563eb', ... },
};
```

## Future Improvements

- [ ] Add unit tests for each component
- [ ] Export functionality for reports
- [ ] Bulk status update actions
- [ ] Advanced filtering (date ranges, donor search)
- [ ] Chart visualizations for trends
- [ ] Print-friendly view
- [ ] CSV/Excel export
