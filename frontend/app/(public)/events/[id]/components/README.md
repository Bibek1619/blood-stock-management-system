# Public Event Detail Page Components

This folder contains the modular components for the public-facing Event Detail page (`/events/[id]`).

## Component Structure

### 1. **EventDetailsCard.tsx**
Displays the core event information:
- Event date (formatted)
- Event time
- Location
- Description

**Props:**
- `event`: Event object from API

---

### 2. **EventStatisticsCard.tsx**
Shows event participation statistics:
- Number of participants
- Number of volunteers
- Visual cards with icons

**Props:**
- `event`: Event object from API

---

### 3. **EventRegistrationCard.tsx**
Handles user registration actions:
- Shows available spots remaining
- Register as participant button
- Volunteer signup button
- Conditional rendering based on event status

**Props:**
- `event`: Event object from API

**Features:**
- Calculates spots remaining
- Disables registration when full
- Shows appropriate message for completed/cancelled events
- Links to login page for authentication

---

### 4. **EventInfoCard.tsx**
Displays metadata about the event:
- Event ID
- Capacity
- Creation date

**Props:**
- `event`: Event object from API

---

## Shared Utilities

### **`lib/eventStatusConfig.ts`**
Centralized event status configuration used across both public and admin sections:
- `EVENT_STATUS_BADGES`: Status badge styling configuration
- `getStatusBadge()`: Helper function to get badge config by status

**Benefits:**
- Single source of truth for status styling
- Consistent UI across public and admin sections
- Type-safe with EventStatus type

---

## Usage

```tsx
import {
  EventDetailsCard,
  EventStatisticsCard,
  EventRegistrationCard,
  EventInfoCard,
} from "./components";

// In your page component
<EventDetailsCard event={event} />
<EventStatisticsCard event={event} />
<EventRegistrationCard event={event} />
<EventInfoCard event={event} />
```

## Benefits of This Structure

1. **Separation of Concerns**: Each card handles a specific aspect of the event
2. **Reusability**: Components can be reused or rearranged easily
3. **Maintainability**: Easier to update individual sections
4. **Testability**: Each component can be tested independently
5. **Readability**: Main page file is now ~100 lines instead of 200+

## File Organization

```
events/[id]/
├── components/
│   ├── EventDetailsCard.tsx        (~50 lines)
│   ├── EventStatisticsCard.tsx     (~40 lines)
│   ├── EventRegistrationCard.tsx   (~60 lines)
│   ├── EventInfoCard.tsx           (~35 lines)
│   ├── index.ts                    (exports)
│   └── README.md                   (this file)
└── page.tsx                        (~100 lines)
```

## Type Safety

All components use the `Event` type from `@/lib/queries/events` ensuring type safety and consistency with the API layer.
