# 📍 Where to Enter Donor Details - Complete Guide

## 🎯 Quick Answer

### For Office Walk-in Donors (Random):
**Go to:** `/dashboard/blood-donate/blood-collection`
- This is the main page for recording walk-in donations
- Staff enters donor details on the spot

### For Event Donors:
**Same page:** `/dashboard/blood-donate/blood-collection`
- Use the same form
- Select "Event" in the "Collection Type" dropdown

### For Organization Bulk Donations:
**Same page:** `/dashboard/blood-donate/blood-collection`
- Click "Bulk Add" button (top right)
- Opens dialog for organization details

---

## 📋 Detailed Guide for Each Donor Type

### 1️⃣ Office Walk-in Donors (Random Donors)

**URL:** `http://localhost:3000/dashboard/blood-donate/blood-collection`

**Steps:**
1. **Search First (Optional):**
   - Use search box at top: "Search by name, phone, or email..."
   - If donor donated before, select them
   - If not found, continue to step 2

2. **Enter Donor Information:**
   ```
   ✏️ Full Name: [Enter name]
   ✏️ Phone Number: [Enter phone] *Required
   ✏️ Email: [Optional]
   ✏️ Blood Group: [Select from dropdown] *Required
   ✏️ Location: [City/District]
   ```

3. **Enter Donation Details:**
   ```
   ✏️ Units Collected: [Default: 1]
   ✏️ Collection Date: [Today's date]
   ✏️ Collection Type: Select "WEB_DONOR" *
   ✏️ Storage Location: [e.g., Refrigerator-A1]
   ✏️ Notes: [Optional]
   ```

4. **Click "Record Donation"**

**What Happens:**
- ✅ Creates User account (isVerified=false, password='WALK_IN_DONOR')
- ✅ Creates Donor profile
- ✅ Records Donation
- ✅ Creates Blood Pack with unique code
- ✅ Sends notification (SMS/Email with claim link)
- ✅ Updates blood stock

---

### 2️⃣ Event Donors

**URL:** `http://localhost:3000/dashboard/blood-donate/blood-collection` (Same page!)

**Steps:**
1. **Search First (Optional):**
   - Check if donor is pre-registered for event
   - Search by phone/email
   - If found, select them

2. **Enter Donor Information:**
   ```
   ✏️ Full Name: [Enter name]
   ✏️ Phone Number: [Enter phone] *Required
   ✏️ Email: [Optional]
   ✏️ Blood Group: [Select from dropdown] *Required
   ✏️ Location: [Event location]
   ```

3. **Enter Donation Details:**
   ```
   ✏️ Units Collected: [Default: 1]
   ✏️ Collection Date: [Event date]
   ✏️ Collection Type: Select "EVENT" * ← IMPORTANT!
   ✏️ Storage Location: [e.g., Event-Storage-1]
   ✏️ Notes: [Event name, e.g., "City Hospital Blood Drive"]
   ```

4. **Click "Record Donation"**

**What Happens:**
- ✅ Same as walk-in donor
- ✅ Marked as "EVENT" collection type
- ✅ Can track which donations came from events

---

### 3️⃣ Organization Bulk Donations

**URL:** `http://localhost:3000/dashboard/blood-donate/blood-collection`

**Steps:**
1. **Click "Bulk Add" button** (top right corner)

2. **Enter Organization Information:**
   ```
   ✏️ Organization Name: [e.g., Red Cross, City Hospital]
   ✏️ Phone Number: [Organization contact] *Required
   ✏️ Email: [Optional]
   ✏️ Collection Date: [Date received]
   ✏️ Address: [Organization address] *Required
   ```

3. **Add Blood Items:**
   ```
   For each blood type:
   ✏️ Blood Group: [Select A+, B+, etc.]
   ✏️ Quantity: [Number of units]
   
   Click "+ Add Blood Item" to add more types
   ```

4. **Click "Record Bulk Collection"**

**Example:**
```
Organization: Red Cross
Phone: 555-0000
Address: 123 Main St

Blood Items:
- A+: 5 units
- O-: 3 units
- B+: 2 units

Total: 10 units
```

**What Happens:**
- ✅ Creates Organization user account
- ✅ Creates Donor profile for organization
- ✅ Records bulk donation
- ✅ Creates multiple blood packs (one per unit)
- ✅ Updates blood stock
- ✅ All packs marked as "ORGANIZATION_DONOR"

---

## 🖼️ Visual Guide

### Blood Collection Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard > Blood Stock > Blood Collection                 │
│                                                              │
│  ← Back    🩸 Record Blood Donation        [Bulk Add] ←─────┼─ Click for Organizations
│                                                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔍 Search Existing Donor                                   │
│  ┌────────────────────────────────────┐  [Search]          │
│  │ Search by name, phone, or email... │                     │
│  └────────────────────────────────────┘                     │
│                                                              │
│  👤 Donor Information                                       │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Full Name *      │  │ Phone Number *   │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Email (Optional) │  │ Blood Group *    │               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌────────────────────────────────────────┐               │
│  │ Location                                │               │
│  └────────────────────────────────────────┘               │
│                                                              │
│  🩸 Donation Details                                        │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Units Collected *│  │ Collection Date *│               │
│  └──────────────────┘  └──────────────────┘               │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Collection Type *│  │ Storage Location │  ←─────────────┼─ Select EVENT or WEB_DONOR
│  │ [EVENT/WEB_DONOR]│  └──────────────────┘               │
│  └──────────────────┘                                       │
│  ┌────────────────────────────────────────┐               │
│  │ Notes (Optional)                        │               │
│  └────────────────────────────────────────┘               │
│                                                              │
│  [Record Donation]  [Cancel]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Workflow for Each Type

### Office Walk-in Workflow

```
1. Donor walks into office
   ↓
2. Staff opens: /dashboard/blood-donate/blood-collection
   ↓
3. Staff searches by phone (check if returning donor)
   ↓
4. If found: Select donor (auto-fills details)
   If not found: Enter new donor details
   ↓
5. Select Collection Type: "WEB_DONOR"
   ↓
6. Click "Record Donation"
   ↓
7. System creates:
   - User account (isVerified=false)
   - Donor profile
   - Donation record
   - Blood pack
   ↓
8. Notification sent to donor with claim link
   ↓
9. Donor can claim account later from home
```

---

### Event Donor Workflow

```
1. Event happening (e.g., Blood Drive at City Hospital)
   ↓
2. Staff at event opens: /dashboard/blood-donate/blood-collection
   ↓
3. For each donor:
   a. Search if pre-registered
   b. If found: Select donor
   c. If not: Enter details
   ↓
4. Select Collection Type: "EVENT" ← Important!
   ↓
5. Add event name in Notes: "City Hospital Blood Drive"
   ↓
6. Click "Record Donation"
   ↓
7. System creates same as walk-in
   ↓
8. Notification sent with claim link
   ↓
9. Can track all event donations separately
```

---

### Organization Bulk Workflow

```
1. Organization delivers blood (e.g., Red Cross brings 10 units)
   ↓
2. Staff opens: /dashboard/blood-donate/blood-collection
   ↓
3. Click "Bulk Add" button (top right)
   ↓
4. Enter organization details:
   - Name: Red Cross
   - Phone: 555-0000
   - Address: 123 Main St
   ↓
5. Add blood items:
   - A+: 5 units
   - O-: 3 units
   - B+: 2 units
   ↓
6. Click "Record Bulk Collection"
   ↓
7. System creates:
   - Organization user account
   - Organization donor profile
   - Bulk donation record
   - 10 separate blood packs (one per unit)
   - All marked as "ORGANIZATION_DONOR"
   ↓
8. Blood stock updated (+10 units)
```

---

## 📊 Collection Type Comparison

| Field | Office Walk-in | Event Donor | Organization |
|-------|---------------|-------------|--------------|
| **Page** | /blood-collection | /blood-collection | /blood-collection |
| **Button** | Main form | Main form | "Bulk Add" |
| **Collection Type** | WEB_DONOR | EVENT | N/A (auto) |
| **Storage Location** | WALK_IN_DONOR | EVENT_STORAGE | ORGANIZATION_DONOR |
| **Notes** | Optional | Event name | Organization name |
| **Creates** | 1 user + 1 pack | 1 user + 1 pack | 1 org + multiple packs |

---

## 🎯 Key Differences

### Walk-in vs Event Donors
**Same process, different Collection Type:**
- Walk-in: Select "WEB_DONOR"
- Event: Select "EVENT"

**Why it matters:**
- Track which donations came from events
- Measure event success
- Report on event vs walk-in donations

### Individual vs Bulk
**Individual (Walk-in/Event):**
- One donor at a time
- Main form
- Creates 1 blood pack per submission

**Bulk (Organization):**
- Multiple units at once
- "Bulk Add" dialog
- Creates multiple blood packs
- One organization = one donor record

---

## 💡 Pro Tips

### For Staff

**1. Always Search First:**
```
Before entering new donor:
1. Search by phone number
2. If found → Select (saves time, prevents duplicates)
3. If not found → Enter new details
```

**2. Collection Type Matters:**
```
Office walk-in → WEB_DONOR
Event donation → EVENT
Organization → Use Bulk Add
```

**3. Notes Field:**
```
Walk-in: "First time donor" or "Regular donor"
Event: "City Hospital Blood Drive - March 2024"
Organization: Auto-filled with org name
```

### For Donors

**After Donating:**
1. Check phone for SMS/Email notification
2. Click claim link or visit: `/claim-account`
3. Enter phone/email
4. Get verification code
5. Set password
6. Access donation history!

---

## 🔍 How to Find the Page

### From Dashboard:
```
Dashboard → Blood Stock → [+ Add Blood] → Blood Collection
```

### Direct URL:
```
http://localhost:3000/dashboard/blood-donate/blood-collection
```

### Navigation Path:
```
1. Login to dashboard
2. Click "Blood Stock" in sidebar
3. Click "+ Add Blood" button
4. Select "Blood Collection"
```

---

## ✅ Quick Reference

| Donor Type | Where to Go | What to Select | Key Field |
|------------|-------------|----------------|-----------|
| **Office Walk-in** | /blood-collection | Collection Type: WEB_DONOR | Phone required |
| **Event Donor** | /blood-collection | Collection Type: EVENT | Add event name in notes |
| **Organization** | /blood-collection → Bulk Add | N/A | Multiple blood items |

---

## 🎉 Summary

**One page handles all three donor types!**

✅ **Office Walk-in:** Main form → Collection Type: WEB_DONOR
✅ **Event Donor:** Main form → Collection Type: EVENT
✅ **Organization:** Click "Bulk Add" → Enter org details

**All create accounts that can be claimed later!**

No confusion, one simple workflow! 🚀
