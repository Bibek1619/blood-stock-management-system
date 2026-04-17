# Blood Donation Workflow

## Overview
There are **two ways** donors can donate blood in the system:

### 1. Event-Based Donation (Through Events)
### 2. Walk-In Donation (Direct to Office)

---

## Donation Methods

### Method 1: Event-Based Donation 🎪

**Flow:**
1. **Admin Creates Event** (`/dashboard/events`)
   - Admin creates a blood donation camp/event
   - Sets date, location, capacity

2. **Donor Registers for Event** (Public page `/events`)
   - Web donors see upcoming events
   - Click "Register" to participate
   - System records: EventParticipant (status: REGISTERED)

3. **Donor Attends Event**
   - Donor goes to event location on event date
   - Admin marks attendance in system

4. **Admin Records Donation** (`/dashboard/blood-donate`)
   - Admin selects the event
   - Selects donor from event participants
   - Records donation details:
     - Blood group (auto-filled from donor profile)
     - Units donated (usually 1 unit = 450ml)
     - Donation date
     - Location (event location)
   - System creates:
     - ✅ Donation record
     - ✅ BloodPack (with unique pack code)
     - ✅ Updates donor's totalDonations count
     - ✅ Updates donor's lastDonationDate
     - ✅ Updates BloodStockSummary (available count)

---

### Method 2: Walk-In Donation 🏥

**Flow:**
1. **Donor Walks Into Office**
   - Donor comes directly to blood bank
   - No prior event registration

2. **Admin Records Donation** (`/dashboard/blood-donate`)
   - Admin goes to Blood Donate page
   - Selects "Direct Donation" (not from event)
   - Two scenarios:

   **Scenario A: Registered Web Donor**
   - Admin searches for donor by name/phone/email
   - Selects donor from list
   - Blood group auto-filled from profile
   - Records donation
   - System updates everything automatically

   **Scenario B: Walk-In Donor (Not Registered)**
   - Admin enters donor details manually:
     - Name
     - Phone
     - Blood group
     - Location
   - System creates:
     - ✅ Donation record
     - ✅ BloodPack
     - ✅ Updates BloodStockSummary
   - Note: This donor won't have a full profile (not in Donor table)

---

## Admin Workflow: Recording a Donation

### Page: `/dashboard/blood-donate`

**Step 1: Choose Donation Type**
```
[ ] Event Donation
[ ] Walk-In Donation
```

**Step 2A: If Event Donation**
- Select Event from dropdown
- Select Donor from event participants
- Donor details auto-filled
- Enter units donated
- Submit

**Step 2B: If Walk-In Donation**
- Search for existing donor (optional)
  - If found: Auto-fill details
  - If not found: Enter manually
- Enter donor details:
  - Name
  - Phone
  - Blood Group
  - Location
- Enter units donated
- Submit

**Step 3: System Automatically**
1. Creates Donation record
2. Creates BloodPack with:
   - Unique pack code (e.g., BP-2024-001)
   - Blood group
   - Collection date (today)
   - Expiry date (35 days from collection)
   - Status: AVAILABLE
   - Links to donor (if registered)
3. Updates Donor profile (if registered):
   - totalDonations += 1
   - lastDonationDate = today
4. Updates BloodStockSummary:
   - Increments available count for blood group
   - Updates total count

---

## Database Updates Flow

### When Admin Records Donation:

```
1. Donation Table
   ├─ Create new record
   ├─ userId (if registered donor)
   ├─ bloodGroup
   ├─ units
   ├─ donationDate
   ├─ location
   └─ donationType (PERSON/ORGANIZATION)

2. BloodPack Table
   ├─ Create new pack
   ├─ packCode (auto-generated: BP-YYYY-NNN)
   ├─ bloodGroup
   ├─ donorId (if registered)
   ├─ collectionDate
   ├─ expiryDate (collectionDate + 35 days)
   └─ status: AVAILABLE

3. Donor Table (if registered donor)
   ├─ totalDonations += 1
   └─ lastDonationDate = today

4. BloodStockSummary Table
   ├─ Find record for bloodGroup
   ├─ available += units
   ├─ total += units
   └─ lastUpdated = now
```

---

## Blood Stock Dashboard Updates

### `/dashboard/blood-stock`

**Displays:**
- Total available units per blood group
- Recent donations
- Expiring blood packs (within 7 days)
- Low stock alerts

**Updates Automatically When:**
- ✅ New donation recorded → Available count increases
- ✅ Blood issued to patient → Available count decreases
- ✅ Blood expires → Expired count increases, Available decreases

---

## Donor Profile Updates

### `/dashboard/donors/[id]`

**Shows:**
- Total Donations count
- Last Donation Date
- Donation History
- Lives Impacted (totalDonations × 3)

**Updates Automatically When:**
- ✅ Admin records donation for this donor
- ✅ Donor donates at event
- ✅ System increments totalDonations
- ✅ System updates lastDonationDate

---

## Example Scenarios

### Scenario 1: Event Donation
```
1. Admin creates "Blood Camp 2024" event
2. Donor "John Doe" registers online
3. John attends event on event date
4. Admin records donation:
   - Event: Blood Camp 2024
   - Donor: John Doe (from participants)
   - Units: 1
5. System creates:
   - Donation record (linked to event)
   - BloodPack: BP-2024-001
   - Updates John's profile: totalDonations = 1
   - Updates Blood Stock: A+ available += 1
```

### Scenario 2: Walk-In (Registered Donor)
```
1. Donor "Jane Smith" walks into office
2. Admin searches "Jane Smith"
3. System finds her profile (A+)
4. Admin records donation:
   - Type: Walk-In
   - Donor: Jane Smith (selected)
   - Units: 1
5. System creates:
   - Donation record
   - BloodPack: BP-2024-002
   - Updates Jane's profile: totalDonations = 1
   - Updates Blood Stock: A+ available += 1
```

### Scenario 3: Walk-In (New Donor)
```
1. Unknown person walks into office
2. Admin enters details manually:
   - Name: "Ram Kumar"
   - Phone: "9841234567"
   - Blood Group: O+
3. Admin records donation:
   - Type: Walk-In
   - Units: 1
4. System creates:
   - Donation record (no userId)
   - BloodPack: BP-2024-003
   - Updates Blood Stock: O+ available += 1
5. Note: Ram Kumar not in Donor table (just Donation record)
```

---

## Key Points

### For Event Donations:
- ✅ Donor must register for event first
- ✅ Admin selects from event participants
- ✅ Tracks which event the donation came from
- ✅ Can mark attendance and donation separately

### For Walk-In Donations:
- ✅ Can be registered or unregistered donor
- ✅ Admin can search existing donors
- ✅ Can enter new donor details on the fly
- ✅ Faster process for emergency donations

### Blood Stock Management:
- ✅ Automatically updates when donation recorded
- ✅ Tracks available, used, expired counts
- ✅ Each blood pack has unique code
- ✅ Blood expires 35 days after collection

### Donor Profile:
- ✅ Only registered donors have profiles
- ✅ Profile shows complete donation history
- ✅ Tracks total donations and last donation date
- ✅ Shows eligibility status

---

## Admin Pages Summary

| Page | Purpose | Actions |
|------|---------|---------|
| `/dashboard/blood-donate` | Record donations | Add new donation (event or walk-in) |
| `/dashboard/blood-stock` | View inventory | See available blood, expiring packs |
| `/dashboard/donors` | Manage donors | View all donors, filter by type |
| `/dashboard/donors/[id]` | Donor profile | View complete donor details |
| `/dashboard/events` | Manage events | Create events, view participants |

---

## Recommended Implementation

### Blood Donate Page Should Have:

1. **Tab 1: Record Donation**
   - Donation type selector (Event/Walk-In)
   - Donor search/select
   - Blood group (auto-fill or manual)
   - Units input
   - Submit button

2. **Tab 2: Recent Donations**
   - List of recent donations
   - Filter by date, blood group
   - View details

3. **Tab 3: Pending Event Donations**
   - List of registered event participants
   - Quick record donation for each

### Auto-calculations:
- Pack code generation
- Expiry date calculation
- Stock updates
- Donor profile updates
- Certificate generation (optional)

This workflow ensures proper tracking of all donations while maintaining flexibility for both event-based and walk-in scenarios!
