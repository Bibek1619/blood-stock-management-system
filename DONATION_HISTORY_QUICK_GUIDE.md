# 📊 Donation History - Quick Guide

## 🎯 Where to See Donation History

### Donor Profile Page

**URL:** `/dashboard/donors/[id]`

**Click on any donor** → See complete donation history

---

## 📋 What You'll See

```
┌─────────────────────────────────────────────────────────┐
│                    DONOR PROFILE                         │
│                                                          │
│  John Doe                                    A+          │
│  Total Donations: 3                                      │
│  Blood Donated: 1,350 ml                                 │
│  Lives Impacted: 9                                       │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              DONATION HISTORY                            │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #3                    [EVENT] 🎪           │
│    📅 Mar 15, 2024  🩸 1 unit                          │
│    📝 City Hospital Blood Drive                         │
│    Blood Group: A+                                      │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #2                    [WALK_IN] 🏢         │
│    📅 Feb 10, 2024  🩸 1 unit                          │
│    Blood Group: A+                                      │
├─────────────────────────────────────────────────────────┤
│ 🩸 Donation #1                    [EVENT] 🎪           │
│    📅 Jan 5, 2024   🩸 1 unit                          │
│    📝 Community Blood Drive                             │
│    Blood Group: A+                                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Collection Type Badges

### Three Types:

**1. EVENT (Blue Badge) 🎪**
- Donations at organized events
- Blood drives, community camps
- Shows event name in notes

**2. WALK_IN (Green Badge) 🏢**
- Random office visitors
- Direct donations at clinic
- No event name

**3. ORGANIZATION (Purple Badge) 🏛️**
- Bulk collections
- From Red Cross, hospitals, etc.
- Shows organization name

---

## 🔄 Example Donor Journey

### John Doe's Donation History:

```
Timeline:
─────────────────────────────────────────────────────────

Jan 5, 2024
  🎪 EVENT: Community Blood Drive
  ↓ Donated 1 unit of A+
  
Feb 10, 2024
  🏢 WALK_IN: Walked into office
  ↓ Donated 1 unit of A+
  
Mar 15, 2024
  🎪 EVENT: City Hospital Blood Drive
  ↓ Donated 1 unit of A+

─────────────────────────────────────────────────────────
Total: 3 donations, 1,350ml, 9 lives saved! 🎉
```

---

## 📍 How to Access

### From Dashboard:

```
1. Go to Dashboard
2. Click "Donors" in sidebar
3. Click on any donor name
4. Scroll to "Donation History" section
```

### Direct URL:

```
http://localhost:3000/dashboard/donors/[donor-id]
```

---

## 🎯 What Information is Shown

For each donation:
- ✅ Donation number (newest first)
- ✅ Collection type badge (EVENT/WALK_IN/ORGANIZATION)
- ✅ Date of donation
- ✅ Number of units
- ✅ Blood group
- ✅ Event name (if applicable)
- ✅ Status (Completed, Pending, etc.)

---

## 🔍 How It's Tracked in Database

### Every donation creates a record:

```sql
Donation {
  userId: "user_123"           ← Links to donor
  location: "EVENT"            ← Collection type
  donationDate: "2024-03-15"   ← When donated
  units: 1                     ← How much
  bloodGroup: "A_POSITIVE"     ← Blood type
  notes: "City Hospital..."    ← Event name
}
```

**All linked to the same user!** No matter where they donate (event, walk-in, etc.), it's all tracked in one place.

---

## ✅ Benefits

### For Donors:
- ✅ See complete donation history
- ✅ Track their impact (lives saved)
- ✅ Remember when they donated
- ✅ See which events they attended

### For Staff:
- ✅ Know donor's complete history
- ✅ See donation patterns
- ✅ Identify regular donors
- ✅ Track event vs walk-in donations

### For Organization:
- ✅ Measure event success
- ✅ Track donation sources
- ✅ Generate reports
- ✅ Analyze trends

---

## 🎉 Summary

**Donation history is fully tracked!**

✅ **Where:** Donor profile page (`/dashboard/donors/[id]`)
✅ **Shows:** All donations with collection types
✅ **Types:** EVENT, WALK_IN, ORGANIZATION
✅ **Details:** Date, units, blood group, notes
✅ **Visual:** Color-coded badges with icons

**Example:**
- First donation at event → Tracked ✅
- Second donation walk-in → Tracked ✅
- Third donation at another event → Tracked ✅

**All in one place, complete history!** 🚀
