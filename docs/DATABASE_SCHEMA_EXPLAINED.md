# 📊 Database Schema Explained - Complete Guide

## 🎯 Quick Answer to Your Questions

### Q1: How is the database schema applied?
**A:** Your schema is already perfect! No changes needed. The `User.isVerified` field tracks account states.

### Q2: After they claim, are they web users?
**A:** YES! After claiming, they become **verified web users** with full access. ✅

---

## 📋 Database Schema Overview

### Core Tables

```
┌─────────────┐
│    User     │ ← Main authentication table
└──────┬──────┘
       │
       ├─────→ Donor (1:1 relationship)
       ├─────→ Donations (1:many)
       ├─────→ Certificates (1:many)
       ├─────→ EventParticipants (1:many)
       └─────→ EventVolunteers (1:many)
```

---

## 🔑 Key Fields in User Table

```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String                    ← KEY: Tracks account type
  name       String
  phone      String
  role       Role     @default(DONOR)
  isVerified Boolean  @default(false)  ← KEY: Tracks if claimed
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  donor      Donor?                    ← 1:1 relationship
  donations  Donation[]                ← All donations
}
```

### Critical Fields:

1. **`isVerified`** - Tracks account state
   - `false` = Walk-in/Event donor (not claimed)
   - `true` = Web user or claimed account

2. **`password`** - Indicates account type
   - `'WALK_IN_DONOR'` = Unclaimed walk-in
   - `'ORGANIZATION'` = Unclaimed organization
   - `hashed string` = Verified user (web or claimed)

3. **`phone`** - Used for duplicate checking
   - Indexed for fast lookups
   - Must be unique per donor

---

## 🔄 User Account States

### State 1: Walk-in Donor (Unclaimed)

**Created when:** Staff records blood collection from walk-in

```sql
-- Example data
User {
  id: "clx123abc",
  email: "5551234567@walkin.local",  -- Placeholder if no email
  password: "WALK_IN_DONOR",          -- Placeholder password
  name: "John Doe",
  phone: "5551234567",
  role: "DONOR",
  isVerified: false,                  -- NOT CLAIMED YET
  createdAt: "2024-03-15T10:30:00Z"
}

Donor {
  id: "cly456def",
  userId: "clx123abc",                -- Links to User
  bloodGroup: "A_POSITIVE",
  location: "New York",
  totalDonations: 1,
  lastDonationDate: "2024-03-15T10:30:00Z"
}

Donation {
  id: "clz789ghi",
  userId: "clx123abc",                -- Links to User
  donorId: "cly456def",               -- Links to Donor
  bloodGroup: "A_POSITIVE",
  units: 1,
  donationType: "PERSON",
  status: "COMPLETED"
}
```

**Can they login?** ❌ NO - Password is placeholder
**Can they claim?** ✅ YES - Via /claim-account
**Receive notifications?** ✅ YES - Via phone/email

---

### State 2: Claimed Account (Now Web User!)

**Created when:** Walk-in donor claims their account

```sql
-- Same user AFTER claiming
User {
  id: "clx123abc",                    -- SAME ID
  email: "john@example.com",          -- Updated if provided
  password: "$2a$10$hashed...",        -- HASHED PASSWORD NOW!
  name: "John Doe",
  phone: "5551234567",
  role: "DONOR",
  isVerified: true,                   -- NOW VERIFIED! ✅
  updatedAt: "2024-03-16T14:20:00Z"   -- Updated timestamp
}

-- Donor record UNCHANGED
Donor {
  id: "cly456def",
  userId: "clx123abc",                -- Still linked
  bloodGroup: "A_POSITIVE",
  location: "New York",
  totalDonations: 1,                  -- History preserved
  lastDonationDate: "2024-03-15T10:30:00Z"
}

-- Donation history PRESERVED
Donation {
  id: "clz789ghi",
  userId: "clx123abc",                -- Still linked
  donorId: "cly456def",
  bloodGroup: "A_POSITIVE",
  units: 1,
  donationType: "PERSON",
  status: "COMPLETED"
}
```

**Can they login?** ✅ YES - Has real password now
**Can they claim?** ❌ NO - Already claimed
**Receive notifications?** ✅ YES
**Access dashboard?** ✅ YES - Full web user now!
**See donation history?** ✅ YES - All preserved!

---

### State 3: Direct Web Registration

**Created when:** User registers online directly

```sql
User {
  id: "clx999xyz",
  email: "jane@example.com",
  password: "$2a$10$hashed...",        -- Hashed from start
  name: "Jane Smith",
  phone: "5559876543",
  role: "DONOR",
  isVerified: true,                   -- VERIFIED FROM START ✅
  createdAt: "2024-03-15T09:00:00Z"
}

Donor {
  id: "cly888uvw",
  userId: "clx999xyz",
  bloodGroup: "B_POSITIVE",
  location: "Los Angeles",
  totalDonations: 0,                  -- No donations yet
  lastDonationDate: null
}
```

**Can they login?** ✅ YES - Immediately
**Can they claim?** ❌ NO - Already verified
**Receive notifications?** ✅ YES
**Access dashboard?** ✅ YES - Full access

---

## 🔄 State Transition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACCOUNT LIFECYCLE                    │
└─────────────────────────────────────────────────────────────┘

WALK-IN DONOR (Unclaimed)
┌──────────────────────────┐
│ isVerified: false        │
│ password: WALK_IN_DONOR  │
│ Can Login: ❌            │
│ Can Claim: ✅            │
└────────────┬─────────────┘
             │
             │ Claims Account
             │ (verification code + password)
             │
             ▼
CLAIMED ACCOUNT (Web User!)
┌──────────────────────────┐
│ isVerified: true         │ ← CHANGED!
│ password: $2a$10$hash... │ ← CHANGED!
│ Can Login: ✅            │ ← NOW YES!
│ Can Claim: ❌            │
│ Full Dashboard: ✅       │ ← NOW YES!
└──────────────────────────┘


DIRECT WEB REGISTRATION
┌──────────────────────────┐
│ isVerified: true         │ ← From start
│ password: $2a$10$hash... │ ← From start
│ Can Login: ✅            │ ← Immediately
│ Can Claim: ❌            │
│ Full Dashboard: ✅       │ ← Immediately
└──────────────────────────┘
```

---

## 📊 Database Queries

### Check if User is Claimed

```sql
-- Find unclaimed walk-in donors
SELECT * FROM "User"
WHERE "isVerified" = false
  AND "password" = 'WALK_IN_DONOR';

-- Find claimed/web users
SELECT * FROM "User"
WHERE "isVerified" = true
  AND "password" != 'WALK_IN_DONOR'
  AND "password" != 'ORGANIZATION';
```

### Get Donor with Full History

```sql
-- Get donor with all donations
SELECT 
  u.id,
  u.name,
  u.email,
  u.phone,
  u.isVerified,
  d.bloodGroup,
  d.totalDonations,
  d.lastDonationDate,
  don.donationDate,
  don.units
FROM "User" u
JOIN "Donor" d ON d."userId" = u.id
LEFT JOIN "Donation" don ON don."userId" = u.id
WHERE u.phone = '5551234567'
ORDER BY don."donationDate" DESC;
```

### Check for Duplicate Before Creating

```sql
-- Check if phone or email exists
SELECT * FROM "User"
WHERE phone = '5551234567'
   OR email = 'john@example.com';
```

---

## 🎯 Key Points About "Web User"

### After Claiming, They ARE Web Users! ✅

**What changes:**
- ✅ `isVerified` changes from `false` to `true`
- ✅ `password` changes from `'WALK_IN_DONOR'` to hashed password
- ✅ Can now login with email/password
- ✅ Full dashboard access
- ✅ Can register for events online
- ✅ Can download certificates

**What stays the same:**
- ✅ Same User ID (no new account)
- ✅ Same Donor profile
- ✅ All donation history preserved
- ✅ Same phone number
- ✅ Same blood group

**Result:** They become **identical** to someone who registered online directly!

---

## 📋 Comparison Table

| Feature | Walk-in (Unclaimed) | Claimed Account | Direct Web Registration |
|---------|---------------------|-----------------|------------------------|
| **isVerified** | false | true ✅ | true ✅ |
| **password** | WALK_IN_DONOR | hashed ✅ | hashed ✅ |
| **Can Login** | ❌ | ✅ | ✅ |
| **Dashboard Access** | ❌ | ✅ | ✅ |
| **Donation History** | ✅ | ✅ | ✅ |
| **Receive Notifications** | ✅ | ✅ | ✅ |
| **Register for Events** | ❌ | ✅ | ✅ |
| **Download Certificates** | ❌ | ✅ | ✅ |
| **"Web User"?** | ❌ | ✅ YES! | ✅ YES! |

---

## 🔐 Security & Privacy

### Password Storage

```typescript
// Walk-in donor (unclaimed)
password: "WALK_IN_DONOR"  // Placeholder, can't login

// After claiming or web registration
password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
// Bcrypt hashed, secure
```

### Email Handling

```typescript
// If walk-in donor doesn't provide email
email: "5551234567@walkin.local"  // Placeholder

// After claiming, they can update
email: "john@example.com"  // Real email
```

---

## 🎉 Summary

### Database Schema:
✅ **Already perfect!** No changes needed
✅ Uses `isVerified` to track claimed status
✅ Uses `password` to identify account type
✅ All relationships preserved after claiming

### After Claiming:
✅ **YES, they become web users!**
✅ Same account, just upgraded
✅ Full dashboard access
✅ Can login like any web user
✅ All history preserved

### The Magic:
```
Walk-in Donor (isVerified=false)
         ↓
    Claims Account
         ↓
Web User (isVerified=true) ← SAME ACCOUNT, UPGRADED!
```

**No separate "web user" table needed. It's just a state change!** 🚀

---

## 📝 Migration Status

**Do you need to run migrations?**
❌ **NO!** Your schema already has everything:
- ✅ `User.isVerified` field exists
- ✅ `User.password` field exists
- ✅ `User.phone` field exists with index
- ✅ All relationships defined

**Just restart your backend server and it works!** 🎉
