# Event-Blood Collection Integration

## Problem Solved ✅
Added integration between events and blood collection to allow:
1. "Add Blood" button on event detail pages (only for RUNNING events)
2. Event selection in blood collection form (only RUNNING events)
3. Auto-selection of event when navigating from event page
4. Database linking between donations and events

## Solution Applied

### 🎯 **Event Detail Page Enhancement**
**File:** `frontend/app/dashboard/events/[id]/page.tsx`

#### **Added "Add Blood" Button**
```tsx
{event.status === 'RUNNING' && (
  <button
    onClick={() => router.push(`/dashboard/blood-donate/blood-collection?eventId=${eventId}`)}
    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold transition-colors"
  >
    <Droplets size={14} /> Add Blood
  </button>
)}
```

**Key Features:**
- ✅ Only shows when event status is "RUNNING"
- ✅ Navigates to blood collection page with eventId parameter
- ✅ Green color to distinguish from other actions
- ✅ Positioned next to Delete Event button

### 🩸 **Blood Collection Page Enhancement**
**File:** `frontend/app/dashboard/blood-donate/blood-collection/page.tsx`

#### **Added Event Selection**
```tsx
// Auto-select event from URL parameter
const searchParams = useSearchParams();
const eventIdFromUrl = searchParams.get('eventId');

// Add event selection to form data
selectedEventId: eventIdFromUrl || '', // Auto-select event from URL

// Query for running events only
const { data: events = [] } = useEvents({ status: 'RUNNING' });
```

#### **Dynamic Event Selection Field**
```tsx
{/* Event Selection - Only show when collection type is EVENT */}
{formData.collectionLocation === 'EVENT' && (
  <div className="space-y-2">
    <Label htmlFor="selectedEvent">
      Select Event <span className="text-red-600">*</span>
    </Label>
    <Select
      value={formData.selectedEventId}
      onValueChange={(value) =>
        setFormData({ ...formData, selectedEventId: value })
      }
      required={formData.collectionLocation === 'EVENT'}
    >
      <SelectTrigger id="selectedEvent">
        <SelectValue placeholder="Choose running event..." />
      </SelectTrigger>
      <SelectContent>
        {events.length > 0 ? (
          events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.title} - {new Date(event.eventDate).toLocaleDateString()}
            </SelectItem>
          ))
        ) : (
          <SelectItem value="" disabled>
            No running events available
          </SelectItem>
        )}
      </SelectContent>
    </Select>
    <p className="text-xs text-slate-500">
      Only events with "RUNNING" status are shown
    </p>
  </div>
)}
```

#### **Auto-Selection Logic**
```tsx
// Auto-select event and set collection type when coming from event page
useEffect(() => {
  if (eventIdFromUrl) {
    setFormData(prev => ({
      ...prev,
      collectionLocation: 'EVENT',
      selectedEventId: eventIdFromUrl
    }));
  }
}, [eventIdFromUrl]);
```

#### **Form Submission Enhancement**
```tsx
const result = await recordCollection.mutateAsync({
  // ... other fields
  eventId: formData.collectionLocation === 'EVENT' ? formData.selectedEventId : undefined,
  // ... rest of fields
});
```

### 🗄️ **Database Schema Updates**
**File:** `backend/prisma/schema.prisma`

#### **Added Event-Donation Relationship**
```prisma
model Donation {
  id              String         @id @default(cuid())
  userId          String
  donorId         String?
  eventId         String?        // Link to event if collected during event
  
  // ... other fields
  
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  event           Event?         @relation(fields: [eventId], references: [id], onDelete: SetNull)

  @@index([eventId])  // Added index for performance
  // ... other indexes
}

model Event {
  id              String      @id @default(cuid())
  // ... other fields
  
  participants    EventParticipant[]
  volunteers      EventVolunteer[]
  donations       Donation[]  // Donations collected during this event
  
  // ... indexes
}
```

#### **Migration Created**
```sql
-- Migration: 20260427051901_add_event_id_to_donations
ALTER TABLE "Donation" ADD COLUMN "eventId" TEXT;
CREATE INDEX "Donation_eventId_idx" ON "Donation"("eventId");
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_eventId_fkey" 
  FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
```

### 🔧 **Backend API Enhancement**
**File:** `backend/src/controllers/donationController.ts`

#### **Updated Blood Collection Endpoint**
```typescript
export const recordBloodCollection = async (req: Request, res: Response) => {
  const {
    // ... existing fields
    eventId, // Add eventId from frontend
    // ... other fields
  } = req.body;

  // ... validation and processing

  // Create donation record
  const donation = await tx.donation.create({
    data: {
      userId,
      donorId: donor?.id,
      eventId: eventId || undefined, // Link to event if provided
      // ... other fields
    },
  });
};
```

## User Experience Flow

### 🎯 **Scenario 1: Adding Blood from Event Page**
1. **Admin views event detail page** → Event shows "RUNNING" status
2. **Clicks "Add Blood" button** → Navigates to blood collection page
3. **Form auto-populates** → Collection type = "EVENT", Event = selected event
4. **Admin fills donor details** → Submits form
5. **Donation recorded** → Linked to the specific event in database

### 🎯 **Scenario 2: Manual Event Selection**
1. **Admin goes to blood collection page directly**
2. **Selects "EVENT" as collection type** → Event dropdown appears
3. **Dropdown shows only RUNNING events** → Admin selects appropriate event
4. **Fills donor details and submits** → Donation linked to selected event

### 🎯 **Scenario 3: Walk-in Donation**
1. **Admin selects "Walk-in (Office)"** → No event selection needed
2. **Fills donor details and submits** → Donation recorded without event link

## Benefits Delivered

✅ **Event-Donation Tracking**: Clear link between events and blood collected  
✅ **Improved Workflow**: Direct navigation from event to blood collection  
✅ **Data Integrity**: Only RUNNING events can collect blood  
✅ **Auto-Selection**: Seamless UX when coming from event page  
✅ **Flexible Collection**: Supports both event and walk-in donations  
✅ **Database Relationships**: Proper foreign key constraints and indexes  

## Technical Implementation Details

### **Frontend Changes**
- Added `useSearchParams` to read URL parameters
- Enhanced form state with `selectedEventId`
- Added conditional event selection field
- Implemented auto-selection logic
- Updated form submission to include eventId

### **Backend Changes**
- Added eventId parameter to blood collection API
- Updated donation creation to include event relationship
- Maintained backward compatibility for non-event donations

### **Database Changes**
- Added optional `eventId` foreign key to Donation table
- Added `donations` relation to Event model
- Created database migration
- Added performance index on eventId

## Files Modified

**Frontend:**
- ✅ `frontend/app/dashboard/events/[id]/page.tsx` - Added "Add Blood" button
- ✅ `frontend/app/dashboard/blood-donate/blood-collection/page.tsx` - Added event selection

**Backend:**
- ✅ `backend/prisma/schema.prisma` - Added event-donation relationship
- ✅ `backend/src/controllers/donationController.ts` - Updated blood collection API
- ✅ `backend/prisma/migrations/20260427051901_add_event_id_to_donations/` - Database migration

## Testing Status

- [x] "Add Blood" button appears only for RUNNING events
- [x] Button navigates to blood collection with correct eventId
- [x] Event selection dropdown shows only RUNNING events
- [x] Auto-selection works when coming from event page
- [x] Form submission includes eventId when event is selected
- [x] Database migration applied successfully
- [x] Prisma client regenerated with new schema
- [x] No TypeScript errors

## Future Enhancements

1. **Event Statistics**: Show donation counts on event detail pages
2. **Event Reports**: Generate reports of blood collected per event
3. **Event Notifications**: Notify event organizers when blood is collected
4. **Bulk Event Collection**: Support for multiple donations in one event session
5. **Event Dashboard**: Dedicated view for event-based blood collection management

The integration now provides a seamless workflow for collecting blood during events while maintaining flexibility for walk-in donations!