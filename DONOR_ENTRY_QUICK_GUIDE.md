# 🚀 Quick Guide - Where to Enter Donor Details

## 📍 One Page for All Donors!

**URL:** `http://localhost:3000/dashboard/blood-donate/blood-collection`

---

## 🎯 Three Types, One Page

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│         Blood Collection Page                                    │
│         /dashboard/blood-donate/blood-collection                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  OFFICE       │    │  EVENT        │    │  ORGANIZATION │
│  WALK-IN      │    │  DONOR        │    │  BULK         │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                    │                     │
        ▼                    ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│ Use Main Form │    │ Use Main Form │    │ Click "Bulk   │
│               │    │               │    │ Add" Button   │
│ Collection    │    │ Collection    │    │               │
│ Type:         │    │ Type:         │    │ Enter Org     │
│ "WEB_DONOR"   │    │ "EVENT"       │    │ Details       │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 1️⃣ Office Walk-in Donors (Random)

### When to Use:
- Person walks into your office
- Random donor (not from event)
- Direct donation

### Steps:
```
1. Go to: /dashboard/blood-donate/blood-collection
2. Search donor by phone (optional)
3. Fill form:
   ✏️ Name, Phone, Email, Blood Group
4. Select Collection Type: "WALK_IN (Office)" ← Important!
5. Click "Record Donation"
```

### Result:
✅ Creates lightweight account (can claim later)
✅ Sends notification with claim link
✅ Records donation
✅ Creates blood pack

---

## 2️⃣ Event Donors

### When to Use:
- Blood drive at hospital
- Community event
- Organized blood donation camp

### Steps:
```
1. Go to: /dashboard/blood-donate/blood-collection (same page!)
2. Search donor by phone (optional)
3. Fill form:
   ✏️ Name, Phone, Email, Blood Group
4. Select Collection Type: "EVENT" ← Important!
5. Add event name in Notes: "City Hospital Blood Drive"
6. Click "Record Donation"
```

### Result:
✅ Same as walk-in
✅ Marked as EVENT donation
✅ Can track event donations separately

---

## 3️⃣ Organization Bulk Donations

### When to Use:
- Red Cross brings blood
- Hospital transfers blood
- Other organization donates multiple units

### Steps:
```
1. Go to: /dashboard/blood-donate/blood-collection
2. Click "Bulk Add" button (top right) ← Important!
3. Fill organization details:
   ✏️ Organization Name
   ✏️ Phone, Email, Address
4. Add blood items:
   ✏️ A+: 5 units
   ✏️ O-: 3 units
   ✏️ B+: 2 units
5. Click "Record Bulk Collection"
```

### Result:
✅ Creates organization account
✅ Creates multiple blood packs (one per unit)
✅ Updates blood stock
✅ All marked as ORGANIZATION_DONOR

---

## 🎨 Visual Page Layout

```
┌──────────────────────────────────────────────────────────┐
│  ← Back    🩸 Record Blood Donation    [Bulk Add] ←──────┼─ For Organizations
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🔍 Search Existing Donor                        │    │
│  │ [Search by name, phone, or email...]  [Search]  │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 👤 Donor Information                            │    │
│  │                                                  │    │
│  │ Full Name *         Phone Number *              │    │
│  │ Email (Optional)    Blood Group *               │    │
│  │ Location                                         │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐    │
│  │ 🩸 Donation Details                             │    │
│  │                                                  │    │
│  │ Units Collected *   Collection Date *           │    │
│  │ Collection Type *   Storage Location            │    │
│  │ [WEB_DONOR/EVENT]                               │ ←──┼─ Select here!
│  │ Notes (Optional)                                 │    │
│  └─────────────────────────────────────────────────┘    │
│                                                           │
│  [Record Donation]  [Cancel]                            │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Differences

| Feature | Office Walk-in | Event Donor | Organization |
|---------|---------------|-------------|--------------|
| **Form** | Main form | Main form | Bulk Add dialog |
| **Collection Type** | WALK_IN | EVENT | N/A |
| **Entry** | One at a time | One at a time | Multiple units |
| **Notes** | Optional | Event name | Auto-filled |

---

## 💡 Quick Tips

### For Office Walk-ins:
```
✅ Search by phone first (check if returning donor)
✅ Select "WALK_IN (Office)" in Collection Type
✅ Phone number is required
✅ Email is optional
```

### For Event Donors:
```
✅ Same form as walk-in
✅ Select "EVENT" in Collection Type
✅ Add event name in Notes field
✅ Helps track event success
```

### For Organizations:
```
✅ Click "Bulk Add" button
✅ Enter organization details once
✅ Add multiple blood types and quantities
✅ Creates multiple blood packs automatically
```

---

## 🎯 Common Questions

**Q: Where do I enter walk-in donor details?**
A: `/dashboard/blood-donate/blood-collection` → Main form → Collection Type: WALK_IN

**Q: Where do I enter event donor details?**
A: Same page! → Main form → Collection Type: EVENT

**Q: Where do I enter organization bulk donations?**
A: Same page! → Click "Bulk Add" button (top right)

**Q: What's the difference between walk-in and event?**
A: Same form, just select different "Collection Type"

**Q: Can I enter multiple donors at once?**
A: Only for organizations (Bulk Add). For individual donors, enter one at a time.

**Q: What if donor donated before?**
A: Search by phone first. If found, select them (auto-fills details).

---

## 🚀 Navigation

### From Dashboard:
```
Dashboard → Blood Stock → + Add Blood → Blood Collection
```

### Direct URL:
```
http://localhost:3000/dashboard/blood-donate/blood-collection
```

---

## ✅ Summary

**One page handles everything!**

🏢 **Office Walk-in:** Main form → WALK_IN
🎪 **Event Donor:** Main form → EVENT  
🏛️ **Organization:** Bulk Add button

**All donors can claim accounts later!**

Simple, unified, no confusion! 🎉
