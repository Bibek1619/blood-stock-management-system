# Donor Management Strategy

## Overview
Your blood bank system collects blood through **3 channels** and needs to manage **3 types of donors** effectively.

---

## 🎯 Three Collection Channels

### 1. **Office/Walk-in Donations**
- Donors come directly to your office
- Staff collects their information on the spot
- Immediate blood collection

### 2. **Organization Donations**
- Blood collected from other organizations (Red Cross, hospitals, etc.)
- Bulk collection with multiple blood units
- Organization acts as the "donor"

### 3. **Event Donations**
- Blood drives at specific locations/dates
- Pre-registered donors + walk-in donors
- Scheduled collection

---

## 👥 Three Types of Donors

### 1. **Web Registered Donors** (Full Account)
**Who:** Donors who create accounts on your website

**Features:**
- ✅ Full user account with email/password
- ✅ Can login to see donation history
- ✅ Receive event notifications
- ✅ Can register for events online
- ✅ View certificates
- ✅ Profile management

**How they donate:**
- Register online → Get notified of events → Attend events
- Can also walk into office (staff finds their existing record)

**Database Status:**
- `User.isVerified = true` (verified web user)
- `User.role = DONOR`
- Full `Donor` profile with all details

---

### 2. **Walk-in/Event Donors** (Lightweight Account)
**Who:** People who donate at office or events without prior registration

**Current Problem:** You're unsure whether to create full accounts or just collect contact info

**✅ RECOMMENDED SOLUTION: Create Lightweight Accounts**

**Why?**
- ✅ You can notify them about future events
- ✅ Track their donation history
- ✅ They can "claim" their account later
- ✅ Prevents duplicate records
- ✅ Maintains data consistency

**How it works:**
1. **At Collection Time:**
   - Staff collects: Name, Phone, Email (optional), Blood Group, Health Info
   - System creates:
     - `User` record with `isVerified = false`
     - `Donor` profile linked to user
     - Password set to placeholder (e.g., `WALK_IN_DONOR`)

2. **Notification System:**
   - Send SMS/Email notifications for:
     - Upcoming events
     - Blood shortage alerts
     - Thank you messages
   - Include link: "Create your account to track donations"

3. **Account Claiming Process:**
   - Donor receives notification with link
   - Clicks "Claim Account" or "Set Password"
   - Verifies phone/email
   - Sets password
   - System updates: `isVerified = true`
   - Now they have full web access!

**Database Status:**
- `User.isVerified = false` (not yet claimed)
- `User.password = 'WALK_IN_DONOR'` (placeholder)
- `User.email = phone@walkin.local` (if no email provided)
- Full `Donor` profile exists

---

### 3. **Organization Donors**
**Who:** Other organizations donating blood in bulk

**Features:**
- Organization treated as a single "donor"
- Track organization details (name, address, contact)
- Bulk blood collection records

**Database Status:**
- `User.isVerified = false`
- `User.name = Organization Name`
- `User.password = 'ORGANIZATION'`
- `Donor` profile with organization address
- `Donation.donationType = ORGANIZATION`

---

## 🔄 Complete Workflow

### Scenario 1: Web Donor Donates at Office
```
1. Donor walks in
2. Staff searches by phone/email
3. System finds existing verified account
4. Staff records donation → Links to existing donor
5. Donor sees donation in their online profile
```

### Scenario 2: New Walk-in Donor
```
1. New person walks in
2. Staff collects: Name, Phone, Email, Blood Group
3. System creates:
   - User (isVerified=false, password=placeholder)
   - Donor profile
   - Donation record
   - Blood pack
4. System sends SMS: "Thank you! Track your donations: [link]"
5. Donor can claim account anytime
```

### Scenario 3: Walk-in Donor Returns
```
1. Person walks in again
2. Staff searches by phone
3. System finds existing lightweight account
4. Staff records new donation
5. Updates donation count
6. Sends notification again with claim link
```

### Scenario 4: Event Donation (Pre-registered)
```
1. Web donor registers for event online
2. Attends event
3. Staff finds their record by phone/email
4. Records donation → Links to verified account
5. Donation appears in their profile
```

### Scenario 5: Event Donation (Walk-in at Event)
```
1. Person shows up at event without registration
2. Staff collects info (same as office walk-in)
3. Creates lightweight account
4. Records donation
5. Sends claim link
```

### Scenario 6: Organization Bulk Collection
```
1. Staff receives blood from Red Cross
2. Enters organization details
3. Records multiple blood units
4. System creates:
   - Organization user/donor
   - Multiple blood packs
   - Bulk donation record
```

---

## 📧 Notification Strategy

### For Walk-in/Event Donors (isVerified=false)
**Immediate (After Donation):**
```
"Thank you for donating blood! 🩸
Your donation saved lives.

Track your donations & get notified:
[Claim Your Account] → Set password in 30 seconds

- View donation history
- Get event notifications
- Earn certificates"
```

**Event Notifications:**
```
"Blood Drive on [Date] at [Location]
We need [Blood Type] donors!

Tap to register: [Link]
Or walk in anytime.

Already donated? Claim your account: [Link]"
```

**Blood Shortage Alerts:**
```
"URGENT: We need [Blood Type] donors!
Your donation can save lives today.

Donate at: [Address]
Hours: [Time]

Track donations: [Claim Account Link]"
```

### For Web Donors (isVerified=true)
- Full dashboard access
- Email + SMS notifications
- Event registration
- Certificate downloads

---

## 🛠️ Implementation Changes Needed

### 1. Add Account Claiming Feature
**New API Endpoints:**
```typescript
POST /api/auth/claim-account
- Input: phone/email + verification code
- Creates password reset token
- Sends verification SMS/Email

POST /api/auth/verify-claim
- Input: token + new password
- Updates: isVerified=true, password=hashed
- Returns: login credentials
```

### 2. Update Blood Collection Flow
**Already Implemented ✅** (in your current code)
- Creates User + Donor for walk-ins
- Sets `isVerified=false`
- Uses placeholder password

**Enhancement Needed:**
- Send notification after collection
- Include claim account link

### 3. Notification Service
**Create:**
```typescript
// services/notificationService.ts
- sendDonationThankYou(donor, claimLink)
- sendEventNotification(donors, event)
- sendBloodShortageAlert(bloodType, donors)
```

**Integration:**
- SMS service (Twilio, AWS SNS)
- Email service (SendGrid, AWS SES)

### 4. Frontend: Account Claim Page
**New Page:** `/claim-account`
- Enter phone/email
- Receive verification code
- Set password
- Login automatically

---

## 📊 Database Schema (Current - No Changes Needed!)

Your current schema already supports this! ✅

```prisma
model User {
  isVerified Boolean @default(false)  // ← Key field!
  // false = walk-in/event donor (not claimed)
  // true = web registered donor
}

model Donor {
  userId String @unique  // ← Links to User
  // All donors have this profile
}
```

---

## 🎯 Benefits of This Approach

### For Your Organization:
✅ **Single source of truth** - No duplicate donor records
✅ **Complete history** - Track all donations regardless of channel
✅ **Better engagement** - Convert walk-ins to web users
✅ **Efficient notifications** - Reach all donors for events
✅ **Data consistency** - Same structure for all donor types

### For Donors:
✅ **No forced registration** - Can donate immediately
✅ **Optional web access** - Claim account when ready
✅ **Unified history** - All donations in one place
✅ **Easy notifications** - Get SMS/Email about events
✅ **Certificates** - Access donation certificates

### For Staff:
✅ **Simple workflow** - Same process for all walk-ins
✅ **Quick search** - Find donors by phone/email
✅ **No confusion** - Clear donor status (verified vs not)
✅ **Bulk operations** - Handle organizations easily

---

## 🚀 Next Steps

### Phase 1: Notification System (Priority)
1. Set up SMS/Email service
2. Create notification templates
3. Send post-donation messages with claim links

### Phase 2: Account Claiming
1. Build claim account API endpoints
2. Create verification flow
3. Build frontend claim page

### Phase 3: Enhanced Notifications
1. Event notifications to all donors
2. Blood shortage alerts
3. Reminder messages

### Phase 4: Analytics
1. Track claim rate (walk-in → web user conversion)
2. Donor engagement metrics
3. Notification effectiveness

---

## ❓ FAQ

**Q: What if walk-in donor forgets they have an account?**
A: They can always "claim" again - system will find existing account by phone/email.

**Q: What if they never claim their account?**
A: No problem! They still get notifications and their donations are tracked. They just can't login to web portal.

**Q: Can they donate without email?**
A: Yes! Phone is enough. System creates placeholder email (`phone@walkin.local`). They can update it when claiming.

**Q: What about privacy/GDPR?**
A: Walk-in donors consent to data collection at donation time. Include privacy notice in claim account flow.

**Q: How to handle duplicate phone numbers?**
A: System searches by phone first. If found, uses existing account. If not, creates new one.

---

## 📝 Summary

**DO THIS:**
- ✅ Create lightweight accounts for ALL walk-in/event donors
- ✅ Set `isVerified=false` for unclaimed accounts
- ✅ Send notifications with claim links
- ✅ Let them claim accounts anytime
- ✅ Use same User/Donor structure for everyone

**DON'T DO THIS:**
- ❌ Just collect info without creating accounts
- ❌ Force password creation at donation time
- ❌ Create separate "guest donor" tables
- ❌ Lose track of walk-in donors

**Result:** Unified system where every donor (web, walk-in, event, organization) is tracked consistently, can receive notifications, and can upgrade to full web access anytime! 🎉
