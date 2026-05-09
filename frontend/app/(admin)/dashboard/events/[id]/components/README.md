# Event Detail Page Components

This folder contains the modular components for the Event Detail page (`/dashboard/events/[id]`).

## Component Structure

### 1. **EventHeader.tsx**
Displays the event header with:
- Event title, description, and status badge
- Event metadata (date, location, capacity)
- Status update buttons
- Delete event button
- Quick action button to add blood (when event is running)

**Props:**
- `event`: Event object
- `eventId`: Event ID string
- `onStatusChange`: Handler for status updates
- `onDelete`: Handler for event deletion

---

### 2. **VolunteersSection.tsx**
Manages event volunteers with:
- List of volunteers with their details
- Add volunteer dialog (with form)
- Remove volunteer functionality
- View volunteer ID card preview
- Print ID card functionality

**Props:**
- `event`: Event object
- `onAddVolunteer`: Handler for adding volunteers
- `onRemoveVolunteer`: Handler for removing volunteers

**Features:**
- Inline volunteer form with validation
- ID card preview modal
- Print functionality for ID cards

---

### 3. **ParticipantsSection.tsx**
Manages event participants with:
- List of participants
- Add participant dialog with user search
- Remove participant functionality
- User search and selection

**Props:**
- `event`: Event object
- `users`: Array of all users
- `onAddParticipant`: Handler for adding participants
- `onRemoveParticipant`: Handler for removing participants

**Features:**
- Real-time user search by name, email, or phone
- User selection from search results

---

### 4. **BloodCollectionSection.tsx**
Displays blood collection data for the event:
- Summary statistics (total units, volume, donors, blood types)
- Blood group breakdown
- Detailed donation list (first 10 donations)
- Donor details sidebar
- Quick action to add blood collection

**Props:**
- `event`: Event object
- `eventId`: Event ID string
- `eventDonations`: Array of donations for this event

**Features:**
- Summary stats with calculations
- Blood group aggregation
- Donor details sidebar with complete donation information
- Empty state with call-to-action

---

## Usage

```tsx
import {
  EventHeader,
  VolunteersSection,
  ParticipantsSection,
  BloodCollectionSection,
} from "./components";

// In your page component
<EventHeader
  event={event}
  eventId={eventId}
  onStatusChange={handleStatusChange}
  onDelete={handleDeleteEvent}
/>

<VolunteersSection
  event={event}
  onAddVolunteer={handleAddVolunteer}
  onRemoveVolunteer={handleRemoveVolunteer}
/>

<ParticipantsSection
  event={event}
  users={users}
  onAddParticipant={handleAddParticipant}
  onRemoveParticipant={handleRemoveParticipant}
/>

<BloodCollectionSection
  event={event}
  eventId={eventId}
  eventDonations={eventDonations}
/>
```

## Benefits of This Structure

1. **Separation of Concerns**: Each component handles a specific feature
2. **Reusability**: Components can be reused in other contexts
3. **Maintainability**: Easier to locate and fix bugs
4. **Testability**: Each component can be tested independently
5. **Readability**: Main page file is now ~200 lines instead of 1100+
6. **Performance**: Components can be optimized individually

## File Organization

```
events/[id]/
├── components/
│   ├── EventHeader.tsx           (~150 lines)
│   ├── VolunteersSection.tsx     (~300 lines)
│   ├── ParticipantsSection.tsx   (~150 lines)
│   ├── BloodCollectionSection.tsx (~450 lines)
│   ├── index.ts                  (exports)
│   └── README.md                 (this file)
└── page.tsx                      (~200 lines)
```

## State Management

- **Local State**: Each component manages its own UI state (modals, forms)
- **Server State**: Managed by React Query in the parent page
- **Event Handlers**: Passed down from parent to maintain single source of truth
