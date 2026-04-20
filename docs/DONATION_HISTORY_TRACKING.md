# 📊 Donation History Tracking - Complete Guide

## 🎯 How Donation History is Tracked

### Database Structure

Every donation is tracked in the `Donation` table with complete details:

```sql
Donation {
  id              String
  userId          String         ← Links to User
  donorId         String         ← Links to Donor profile
  bloodGroup      BloodGroup
  units           Int
  donationDate    DateTime
  location        String         ← Collection type (EVENT, WALK_IN, etc.)
  donationType    DonationType   ← PERSON or ORGANIZATION
  status          DonationStatus
  notes           String         ← Event name, details, etc.
  contact         String
}
```

---

## 📍 Where to View Donation History

### 1. Donor Profile Page

**URL:** `/dashboard/donors/[id]`

**Shows:**
- ✅ Complete donation history
- ✅ Collection type for each donation (EVENT, WALK_IN, ORGANIZATION)
- ✅ Date, blood group, units
- ✅ Notes (event name, etc.)
- ✅ Total donations count
- ✅ Last donation date

**Example:**
```
Donation History
┌─────────────────────────────────────────────────────────┐
│ 🩸 Donation #3                    [EVENT]               │
│    📅 Mar 15, 2024  🩸 1 unit                          │
│    📝 City Hospital Blood Drive                         │
│    Blood Group: A+                                      │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #2                    [WALK_IN]            │
│    📅 Feb 10, 2024  🩸 1 unit                          │
│    Blood Group: A+                                      │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #1                    [EVENT]               │
│    📅 Jan 5, 2024   🩸 1 unit                          │
│    📝 Community Blood Drive                             │
│    Blood Group: A+                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 How Collection Types are Tracked

### When Recording Blood Collection

**Form Field:** Collection Type dropdown

**Options:**
1. **WALK_IN** - Office walk-in donors
2. **EVENT** - Event donations
3. **ORGANIZATION** - Bulk collections (handled separately)

**Stored in:** `Donation.location` field

---

## 📊 Example Donation Records

### Example 1: Event Donation

```sql
Donation {
  id: "don_123",
  userId: "user_456",
  donorId: "donor_789",
  bloodGroup: "A_POSITIVE",
  units: 1,
  donationDate: "2024-03-15T10:00:00Z",
  location: "EVENT",                    ← Collection type
  donationType: "PERSON",
  status: "COMPLETED",
  notes: "City Hospital Blood Drive",   ← Event name
  contact: "5551234567"
}
```

**Displays as:**
```
🩸 Donation #1                    [EVENT] 🎪
   📅 Mar 15, 2024  🩸 1 unit
   📝 City Hospital Blood Drive
   Blood Group: A+
```

---

### Example 2: Walk-in Donation

```sql
Donation {
  id: "don_124",
  userId: "user_456",
  donorId: "donor_789",
  bloodGroup: "A_POSITIVE",
  units: 1,
  donationDate: "2024-02-10T14:30:00Z",
  location: "WALK_IN",                  ← Collection type
  donationType: "PERSON",
  status: "COMPLETED",
  notes: null,
  contact: "5551234567"
}
```

**Displays as:**
```
🩸 Donation #2                    [WALK_IN] 🏢
   📅 Feb 10, 2024  🩸 1 unit
   Blood Group: A+
```

---

### Example 3: Organization Donation

```sql
Donation {
  id: "don_125",
  userId: "user_org",
  donorId: "donor_org",
  bloodGroup: "O_POSITIVE",
  units: 5,
  donationDate: "2024-01-20T09:00:00Z",
  location: "ORGANIZATION",             ← Collection type
  donationType: "ORGANIZATION",
  status: "COMPLETED",
  notes: "Bulk collection from Red Cross",
  contact: "5550000000"
}
```

**Displays as:**
```
🩸 Donation #3                    [ORGANIZATION] 🏛️
   📅 Jan 20, 2024  🩸 5 units
   📝 Bulk collection from Red Cross
   Blood Group: O+
```

---

## 🎨 Visual Badges

### Collection Type Badges

**EVENT:**
```
[EVENT] 🎪
Blue badge - bg-blue-100 text-blue-800
```

**WALK_IN:**
```
[WALK_IN] 🏢
Green badge - bg-green-100 text-green-800
```

**ORGANIZATION:**
```
[ORGANIZATION] 🏛️
Purple badge - bg-purple-100 text-purple-800
```

---

## 🔍 API Endpoints

### Get Donations by User

```http
GET /api/donations?userId={userId}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": "don_123",
      "userId": "user_456",
      "donorId": "donor_789",
      "bloodGroup": "A_POSITIVE",
      "units": 1,
      "donationDate": "2024-03-15T10:00:00.000Z",
      "location": "EVENT",
      "donationType": "PERSON",
      "status": "COMPLETED",
      "notes": "City Hospital Blood Drive",
      "contact": "5551234567",
      "user": {
        "id": "user_456",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "5551234567"
      }
    }
  ]
}
```

### Get Donations by Donor

```http
GET /api/donations?donorId={donorId}
```

### Filter by Collection Type

```http
GET /api/donations?userId={userId}&location=EVENT
GET /api/donations?userId={userId}&location=WALK_IN
```

---

## 📱 Frontend Implementation

### Donor Profile Page

**File:** `frontend/app/dashboard/donors/[id]/page.tsx`

**Component:** `DonationHistoryList`

**Features:**
- ✅ Fetches donations by userId
- ✅ Shows collection type badges
- ✅ Displays date, units, blood group
- ✅ Shows event names from notes
- ✅ Scrollable list (max 500px height)
- ✅ Numbered donations (newest first)

**Code:**
```typescript
function DonationHistoryList({ donorId, userId }: { donorId: string; userId: string }) {
  const { data: donations } = useQuery({
    queryKey: ['donations', userId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/donations?userId=${userId}`
      );
      const data = await response.json();
      return data.data;
    },
  });

  // Renders donation history with badges
}
```

---

## 🎯 Complete Donor Journey with History

### Scenario: Donor with Multiple Donations

```
John Doe - Donor Profile
┌─────────────────────────────────────────────────────────┐
│ Total Donations: 3                                      │
│ Blood Donated: 1,350 ml                                 │
│ Lives Impacted: 9                                       │
└─────────────────────────────────────────────────────────┘

Donation History:
┌─────────────────────────────────────────────────────────┐
│ 🩸 Donation #3                    [EVENT] 🎪           │
│    📅 Mar 15, 2024  🩸 1 unit                          │
│    📝 City Hospital Blood Drive                         │
│    Blood Group: A+                                      │
│    Status: Completed                                    │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #2                    [WALK_IN] 🏢         │
│    📅 Feb 10, 2024  🩸 1 unit                          │
│    Blood Group: A+                                      │
│    Status: Completed                                    │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #1                    [EVENT] 🎪           │
│    📅 Jan 5, 2024   🩸 1 unit                          │
│    📝 Community Blood Drive                             │
│    Blood Group: A+                                      │
│    Status: Completed                                    │
└─────────────────────────────────────────────────────────┘
```

**Story:**
1. **Jan 5:** First donation at Community Blood Drive (EVENT)
2. **Feb 10:** Walked into office randomly (WALK_IN)
3. **Mar 15:** Attended City Hospital Blood Drive (EVENT)

**All tracked!** ✅

---

## 🔐 Data Relationships

### How Everything Links Together

```
User (John Doe)
  ↓
Donor Profile (A+, New York)
  ↓
Donations:
  ├─ Donation #1 (EVENT, Jan 5)
  ├─ Donation #2 (WALK_IN, Feb 10)
  └─ Donation #3 (EVENT, Mar 15)
```

**All donations linked to:**
- ✅ User account (userId)
- ✅ Donor profile (donorId)
- ✅ Blood packs created
- ✅ Blood stock updated

---

## 📊 Statistics Calculated

### From Donation History

**Total Donations:**
```sql
SELECT COUNT(*) FROM Donation WHERE userId = 'user_456'
```

**Total Blood Donated:**
```sql
SELECT SUM(units) * 450 FROM Donation WHERE userId = 'user_456'
-- Result: 3 donations × 450ml = 1,350ml
```

**Lives Impacted:**
```sql
SELECT SUM(units) * 3 FROM Donation WHERE userId = 'user_456'
-- Result: 3 donations × 3 lives = 9 lives
```

**Last Donation Date:**
```sql
SELECT MAX(donationDate) FROM Donation WHERE userId = 'user_456'
```

---

## 🎨 UI Components

### Donation History Card

**Location:** Donor Profile Page → Right Column

**Features:**
- Scrollable list (max 500px)
- Color-coded badges
- Icons for collection types
- Hover effects
- Responsive design

**Empty State:**
```
┌─────────────────────────────────────┐
│           ❤️                        │
│   No donation history yet           │
└─────────────────────────────────────┘
```

---

## 🚀 Future Enhancements

### Possible Additions:

1. **Filter by Collection Type**
   - Show only EVENT donations
   - Show only WALK_IN donations

2. **Export History**
   - Download as PDF
   - Download as CSV

3. **Donation Certificates**
   - Generate certificate for each donation
   - Link from history

4. **Donation Timeline**
   - Visual timeline view
   - Show gaps between donations

5. **Eligibility Tracker**
   - Show when eligible to donate again
   - Countdown timer

---

## ✅ Summary

### Donation History Tracking:

✅ **Complete tracking** - Every donation recorded
✅ **Collection types** - EVENT, WALK_IN, ORGANIZATION
✅ **Detailed info** - Date, units, blood group, notes
✅ **Visual display** - Color-coded badges, icons
✅ **Easy access** - Donor profile page
✅ **API support** - Filter by user, donor, type
✅ **Real-time** - Updates immediately after donation

### Where to View:

📍 **Donor Profile:** `/dashboard/donors/[id]`
📍 **API:** `GET /api/donations?userId={userId}`

**Complete donation history tracking implemented!** 🎉
