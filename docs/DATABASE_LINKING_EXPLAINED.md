# 🔗 Database Linking - How Users are Linked to Donations

## 🎯 Your Question
> "Where do you link on DB this user do this donation?"

## ✅ Answer

The linking happens in **3 steps** when recording blood collection:

1. **Find or Create User** (by phone)
2. **Find or Create Donor Profile** (linked to User)
3. **Create Donation Record** (linked to both User and Donor)

---

## 📊 Database Relationships

```
┌──────────────┐
│     User     │ ← Main account
│  id: user_1  │
└──────┬───────┘
       │
       │ 1:1 relationship (userId)
       │
       ▼
┌──────────────┐
│    Donor     │ ← Donor profile
│  id: donor_1 │
│  userId: ←───┘
└──────┬───────┘
       │
       │ 1:many relationship
       │
       ▼
┌──────────────┐
│  Donation    │ ← Donation records
│  id: don_1   │
│  userId: ←───┼─── Links to User
│  donorId: ←──┘    Links to Donor
└──────────────┘
```

---

## 🔄 Step-by-Step Linking Process

### When Staff Records Blood Collection:

```typescript
// File: backend/src/controllers/donationController.ts
// Function: recordBloodCollection

// STEP 1: Find or Create User
// ============================

// Check if user exists by phone
let user = await tx.user.findFirst({
  where: { phone: donorPhone },  // Search by phone
});

if (!user) {
  // Create new user if not found
  user = await tx.user.create({
    data: {
      name: donorName,
      phone: donorPhone,
      email: donorEmail || `${donorPhone}@walkin.local`,
      password: 'WALK_IN_DONOR',
      role: 'DONOR',
      isVerified: false,
    },
  });
}

userId = user.id;  // ← Got the User ID!


// STEP 2: Find or Create Donor Profile
// =====================================

// Check if donor profile exists for this user
donor = await tx.donor.findUnique({
  where: { userId },  // Search by userId
});

if (!donor) {
  // Create donor profile linked to user
  donor = await tx.donor.create({
    data: {
      userId,  // ← LINK TO USER!
      bloodGroup: dbBloodGroup,
      location: location,
      totalDonations: 1,
      lastDonationDate: new Date(collectionDate),
    },
  });
}


// STEP 3: Create Donation Record
// ===============================

const donation = await tx.donation.create({
  data: {
    userId,           // ← LINK TO USER!
    donorId: donor.id, // ← LINK TO DONOR!
    bloodGroup: dbBloodGroup,
    units: parseInt(units) || 1,
    donationDate: new Date(collectionDate),
    location: collectionLocation,  // EVENT or WALK_IN
    donationType: 'PERSON',
    status: 'COMPLETED',
    notes,
    contact: donorPhone,
  },
});
```

---

## 📋 Example: Walk-in Donor Donates

### Scenario: John walks in to donate

**Input:**
```javascript
{
  donorName: "John Doe",
  donorPhone: "5551234567",
  donorEmail: "john@example.com",
  bloodGroup: "A+",
  collectionLocation: "WALK_IN",
  units: 1
}
```

### Database Operations:

**Step 1: Create User**
```sql
INSERT INTO "User" (
  id, name, phone, email, password, role, isVerified
) VALUES (
  'user_abc123',           -- Generated ID
  'John Doe',
  '5551234567',
  'john@example.com',
  'WALK_IN_DONOR',
  'DONOR',
  false
);
```

**Step 2: Create Donor Profile**
```sql
INSERT INTO "Donor" (
  id, userId, bloodGroup, location, totalDonations
) VALUES (
  'donor_xyz789',          -- Generated ID
  'user_abc123',           -- ← LINKED TO USER!
  'A_POSITIVE',
  'New York',
  1
);
```

**Step 3: Create Donation Record**
```sql
INSERT INTO "Donation" (
  id, userId, donorId, bloodGroup, units, location
) VALUES (
  'donation_def456',       -- Generated ID
  'user_abc123',           -- ← LINKED TO USER!
  'donor_xyz789',          -- ← LINKED TO DONOR!
  'A_POSITIVE',
  1,
  'WALK_IN'
);
```

---

## 🔍 How to Query Linked Data

### Get All Donations for a User

```sql
-- Using userId
SELECT * FROM "Donation"
WHERE "userId" = 'user_abc123'
ORDER BY "donationDate" DESC;
```

**Result:**
```
┌────────────────┬─────────────┬──────────────┬─────────────┬──────────┐
│ id             │ userId      │ donorId      │ bloodGroup  │ location │
├────────────────┼─────────────┼──────────────┼─────────────┼──────────┤
│ donation_def456│ user_abc123 │ donor_xyz789 │ A_POSITIVE  │ WALK_IN  │
└────────────────┴─────────────┴──────────────┴─────────────┴──────────┘
```

### Get User with Donor and Donations

```sql
-- Join all related tables
SELECT 
  u.id as user_id,
  u.name,
  u.phone,
  d.id as donor_id,
  d.bloodGroup,
  d.totalDonations,
  don.id as donation_id,
  don.donationDate,
  don.location
FROM "User" u
JOIN "Donor" d ON d."userId" = u.id
LEFT JOIN "Donation" don ON don."userId" = u.id
WHERE u.phone = '5551234567'
ORDER BY don."donationDate" DESC;
```

**Result:**
```
┌─────────────┬──────────┬─────────────┬────────────┬─────────────┬─────────────────┬──────────────┬──────────────┬──────────┐
│ user_id     │ name     │ phone       │ donor_id   │ bloodGroup  │ totalDonations  │ donation_id  │ donationDate │ location │
├─────────────┼──────────┼─────────────┼────────────┼─────────────┼─────────────────┼──────────────┼──────────────┼──────────┤
│ user_abc123 │ John Doe │ 5551234567  │ donor_xyz  │ A_POSITIVE  │ 3               │ donation_3   │ 2024-03-15   │ EVENT    │
│ user_abc123 │ John Doe │ 5551234567  │ donor_xyz  │ A_POSITIVE  │ 3               │ donation_2   │ 2024-02-10   │ WALK_IN  │
│ user_abc123 │ John Doe │ 5551234567  │ donor_xyz  │ A_POSITIVE  │ 3               │ donation_1   │ 2024-01-05   │ EVENT    │
└─────────────┴──────────┴─────────────┴────────────┴─────────────┴─────────────────┴──────────────┴──────────────┴──────────┘
```

---

## 🎯 Visual Flow: Multiple Donations

### John Doe's Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LINKING                          │
└─────────────────────────────────────────────────────────────┘

FIRST DONATION (Jan 5, 2024 - EVENT)
=====================================

1. Create User:
   ┌──────────────────┐
   │ User             │
   │ id: user_abc123  │ ← Created once
   │ phone: 555...    │
   └──────────────────┘

2. Create Donor:
   ┌──────────────────┐
   │ Donor            │
   │ id: donor_xyz789 │ ← Created once
   │ userId: user_abc │ ← LINKED!
   └──────────────────┘

3. Create Donation:
   ┌──────────────────┐
   │ Donation #1      │
   │ id: donation_1   │
   │ userId: user_abc │ ← LINKED TO USER!
   │ donorId: donor_x │ ← LINKED TO DONOR!
   │ location: EVENT  │
   └──────────────────┘


SECOND DONATION (Feb 10, 2024 - WALK_IN)
=========================================

1. Find User by phone:
   ┌──────────────────┐
   │ User             │
   │ id: user_abc123  │ ← FOUND! (same user)
   │ phone: 555...    │
   └──────────────────┘

2. Find Donor by userId:
   ┌──────────────────┐
   │ Donor            │
   │ id: donor_xyz789 │ ← FOUND! (same donor)
   │ userId: user_abc │
   │ totalDonations:2 │ ← UPDATED!
   └──────────────────┘

3. Create NEW Donation:
   ┌──────────────────┐
   │ Donation #2      │
   │ id: donation_2   │ ← NEW RECORD!
   │ userId: user_abc │ ← SAME USER!
   │ donorId: donor_x │ ← SAME DONOR!
   │ location: WALK_IN│ ← Different type!
   └──────────────────┘


THIRD DONATION (Mar 15, 2024 - EVENT)
======================================

1. Find User: ✅ FOUND (same)
2. Find Donor: ✅ FOUND (same)
3. Create NEW Donation:
   ┌──────────────────┐
   │ Donation #3      │
   │ id: donation_3   │ ← NEW RECORD!
   │ userId: user_abc │ ← SAME USER!
   │ donorId: donor_x │ ← SAME DONOR!
   │ location: EVENT  │
   └──────────────────┘
```

---

## 🔑 Key Foreign Keys

### In Prisma Schema:

```prisma
model Donation {
  id       String @id @default(cuid())
  userId   String                      // ← Foreign Key to User
  donorId  String?                     // ← Foreign Key to Donor
  
  // Relations
  user     User   @relation(fields: [userId], references: [id])
  
  @@index([userId])   // ← Indexed for fast queries
  @@index([donorId])  // ← Indexed for fast queries
}

model Donor {
  id       String @id @default(cuid())
  userId   String @unique              // ← Foreign Key to User (1:1)
  
  // Relations
  user     User   @relation(fields: [userId], references: [id])
}
```

---

## 📊 Database Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                  COMPLETE LINKING DIAGRAM                    │
└─────────────────────────────────────────────────────────────┘

         User Table
┌──────────────────────────┐
│ id: user_abc123          │
│ name: John Doe           │
│ phone: 5551234567        │
│ email: john@example.com  │
│ isVerified: false        │
└────────────┬─────────────┘
             │
             │ userId (1:1)
             │
             ▼
        Donor Table
┌──────────────────────────┐
│ id: donor_xyz789         │
│ userId: user_abc123 ←────┘ LINK!
│ bloodGroup: A_POSITIVE   │
│ totalDonations: 3        │
└────────────┬─────────────┘
             │
             │ userId + donorId (1:many)
             │
             ▼
      Donation Table
┌──────────────────────────┐
│ id: donation_1           │
│ userId: user_abc123 ←────┘ LINK TO USER!
│ donorId: donor_xyz789 ←──┘ LINK TO DONOR!
│ location: EVENT          │
│ donationDate: 2024-01-05 │
├──────────────────────────┤
│ id: donation_2           │
│ userId: user_abc123 ←────┘ SAME USER!
│ donorId: donor_xyz789 ←──┘ SAME DONOR!
│ location: WALK_IN        │
│ donationDate: 2024-02-10 │
├──────────────────────────┤
│ id: donation_3           │
│ userId: user_abc123 ←────┘ SAME USER!
│ donorId: donor_xyz789 ←──┘ SAME DONOR!
│ location: EVENT          │
│ donationDate: 2024-03-15 │
└──────────────────────────┘
```

---

## 🎯 Summary

### How Linking Works:

1. **User Created/Found** → Get `userId`
2. **Donor Created/Found** → Linked via `userId`
3. **Donation Created** → Linked via `userId` AND `donorId`

### Key Points:

✅ **One User** → Can have **One Donor Profile**
✅ **One User** → Can have **Many Donations**
✅ **Each Donation** → Linked to **Both User and Donor**
✅ **Phone Number** → Used to find existing user
✅ **No Duplicates** → Same phone = same user = all donations linked

### The Magic:

```
Phone Number → Find User → Get userId → Link Donation
                    ↓
              Find Donor → Get donorId → Link Donation
```

**All donations for the same phone number are automatically linked to the same user!** 🎉

---

## 🔍 Code Location

**File:** `backend/src/controllers/donationController.ts`
**Function:** `recordBloodCollection`
**Lines:** ~120-280

**Key linking code:**
```typescript
// Line ~235: Create donation with links
const donation = await tx.donation.create({
  data: {
    userId,           // ← LINK TO USER
    donorId: donor.id, // ← LINK TO DONOR
    // ... other fields
  },
});
```

**That's where the magic happens!** 🚀
