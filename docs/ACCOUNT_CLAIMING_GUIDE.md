# Account Claiming System - Complete Guide

## 🎯 Overview

This system prevents duplicate accounts and allows walk-in/event donors to claim their accounts later.

---

## 🔄 How It Works

### Scenario 1: Walk-in Donor → Claims Account Later

```
1. Person walks into office to donate blood
2. Staff collects: Name, Phone, Email, Blood Group
3. System creates:
   ✓ User account (isVerified=false, password='WALK_IN_DONOR')
   ✓ Donor profile
   ✓ Donation record
   ✓ Blood pack
4. System sends notification: "Thank you! Claim your account: [link]"
5. Later, donor visits claim page:
   - Enters phone/email
   - Receives verification code
   - Sets password
   - Account activated (isVerified=true)
6. Now they can login and access dashboard!
```

### Scenario 2: Walk-in Donor → Tries to Register Online

```
1. Person donated at office (has lightweight account)
2. Goes home and tries to register on website
3. Enters phone/email in registration form
4. System detects existing account
5. Shows message: "You already donated! Claim your account"
6. Redirects to claim account page
7. No duplicate created! ✅
```

### Scenario 3: New Person Registers Online

```
1. Person visits website
2. Fills registration form
3. System checks: No existing account found
4. Creates verified account (isVerified=true)
5. Can login immediately
```

---

## 🛠️ Implementation Details

### Backend APIs

#### 1. Check Existing Account
```http
GET /api/account-claim/check?phone=1234567890&email=test@example.com
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "exists": true,
    "isVerified": false,
    "user": {
      "id": "...",
      "name": "John Doe",
      "phone": "1234567890",
      "email": "test@example.com"
    },
    "message": "You already donated with us! Claim your account..."
  }
}
```

#### 2. Request Verification Code
```http
POST /api/account-claim/request
Content-Type: application/json

{
  "phoneOrEmail": "1234567890"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Verification code sent successfully",
  "data": {
    "sentTo": "1234567890",
    "verificationCode": "123456"  // Only in testing mode
  }
}
```

#### 3. Verify Code and Claim Account
```http
POST /api/account-claim/verify
Content-Type: application/json

{
  "phoneOrEmail": "1234567890",
  "verificationCode": "123456",
  "password": "newpassword123",
  "name": "John Doe"  // Optional: update name
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account claimed successfully!",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "test@example.com",
      "phone": "1234567890",
      "isVerified": true,
      "donor": {
        "bloodGroup": "A_POSITIVE",
        "totalDonations": 2
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### 4. Resend Verification Code
```http
POST /api/account-claim/resend
Content-Type: application/json

{
  "phoneOrEmail": "1234567890"
}
```

---

## 🧪 Testing Guide

### Test 1: Walk-in Donation + Claim Account

**Step 1: Record Blood Collection**
```bash
# Go to: http://localhost:3000/dashboard/blood-donate/blood-collection

# Fill form:
- Donor Name: Test Walker
- Phone: 5551234567
- Email: test@walker.com
- Blood Group: A+
- Collection Date: Today
- Units: 1

# Submit → Check console for notification message
```

**Step 2: Claim Account**
```bash
# Go to: http://localhost:3000/claim-account

# Step 1: Enter phone
Phone: 5551234567
Click "Send Verification Code"

# Check console/alert for code (testing mode)
# Example: "123456"

# Step 2: Enter code and password
Code: 123456
Name: Test Walker (optional)
Password: password123
Confirm: password123

Click "Claim Account"

# Should redirect to dashboard
# Check: Can see donation history!
```

### Test 2: Duplicate Prevention

**Step 1: Create walk-in donor**
```bash
# Record blood collection (as above)
Phone: 5559876543
Email: duplicate@test.com
```

**Step 2: Try to register with same phone**
```bash
# Go to: http://localhost:3000/become-donor

# Fill form:
Name: Duplicate Test
Email: different@email.com
Phone: 5559876543  # Same phone!
Password: test123

# On blur (when you click away from phone field):
# Should show error: "You already donated! Claim your account"
# Shows "Claim Your Account" button

# Click button → Redirects to claim page
```

### Test 3: Normal Registration (No Duplicate)

```bash
# Go to: http://localhost:3000/become-donor

# Fill form with NEW phone/email:
Name: New User
Email: newuser@test.com
Phone: 5551111111
Password: test123

# Submit → Success!
# Redirects to login
```

### Test 4: Organization Bulk Collection

```bash
# Go to: http://localhost:3000/dashboard/blood-donate

# Fill organization form:
Organization: Red Cross
Address: 123 Main St
Phone: 5550000000
Email: redcross@test.com
Collection Date: Today

# Add blood items:
- A+: 5 units
- O-: 3 units

# Submit → Creates organization donor
# Check: Can claim account with org phone
```

---

## 📱 Frontend Pages

### 1. Claim Account Page
**URL:** `/claim-account`

**Features:**
- Two-step process (request code → verify)
- Phone or email input
- 6-digit verification code
- Password creation
- Optional name update
- Auto-login after claiming

### 2. Registration Page (Updated)
**URL:** `/become-donor`

**New Features:**
- Checks for existing account on phone/email blur
- Shows claim prompt if account exists
- Prevents duplicate registration
- Redirects to claim page

---

## 🔐 Security Features

### Verification Code
- 6-digit random code
- 10-minute expiration
- Stored in memory (use Redis in production)
- Can be resent

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt
- Confirmed before submission

### Duplicate Prevention
- Checks both phone AND email
- Searches existing users before creating
- Guides users to claim instead of creating duplicate

---

## 🚀 Production Checklist

### 1. SMS/Email Integration
```typescript
// backend/src/services/notificationService.ts

// TODO: Replace console.log with actual providers

// Option 1: Twilio (SMS)
import twilio from 'twilio';
const client = twilio(accountSid, authToken);
await client.messages.create({
  body: message,
  to: phone,
  from: twilioPhone
});

// Option 2: SendGrid (Email)
import sgMail from '@sendgrid/mail';
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
await sgMail.send({
  to: email,
  from: 'noreply@yourbloodbank.com',
  subject: subject,
  text: message
});
```

### 2. Redis for Verification Codes
```typescript
// Replace in-memory Map with Redis
import Redis from 'ioredis';
const redis = new Redis(process.env.REDIS_URL);

// Store code
await redis.setex(
  `verify:${phoneOrEmail}`,
  600, // 10 minutes
  JSON.stringify({ code, userId })
);

// Get code
const data = await redis.get(`verify:${phoneOrEmail}`);
```

### 3. Environment Variables
```bash
# .env
JWT_SECRET=your-secret-key-here
FRONTEND_URL=https://yourbloodbank.com

# SMS Provider (choose one)
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE=...

# Email Provider (choose one)
SENDGRID_API_KEY=...
AWS_SES_REGION=...
AWS_SES_ACCESS_KEY=...

# Redis
REDIS_URL=redis://localhost:6379
```

### 4. Remove Testing Features
```typescript
// Remove from production:
// 1. Verification code in API response
// 2. Alert with code in frontend
// 3. Console.log statements
```

---

## 📊 Database Schema

### User Table
```prisma
model User {
  id         String   @id @default(cuid())
  email      String   @unique
  password   String   // 'WALK_IN_DONOR' for unclaimed
  name       String
  phone      String
  role       Role     @default(DONOR)
  isVerified Boolean  @default(false)  // ← Key field!
  
  donor      Donor?
}
```

### Account States

| State | isVerified | password | Description |
|-------|-----------|----------|-------------|
| Walk-in (unclaimed) | false | WALK_IN_DONOR | Created at donation, not claimed |
| Organization | false | ORGANIZATION | Bulk donor, not claimable |
| Web Registered | true | hashed | Registered online |
| Claimed | true | hashed | Walk-in donor claimed account |

---

## 🎨 User Experience

### For Walk-in Donors

**Immediate:**
- Quick donation process
- No forced registration
- Receive thank you SMS/Email

**Later (Optional):**
- Click claim link in notification
- Enter verification code
- Set password
- Access full dashboard

### For Staff

**Blood Collection:**
- Same simple process
- Collect basic info
- System handles account creation
- Notification sent automatically

**No Confusion:**
- Search finds existing donors
- No duplicate records
- Clear donor status

---

## 🐛 Troubleshooting

### Issue: Verification code not received
**Solution:** Check console logs (testing mode shows code)

### Issue: "Account already activated" error
**Solution:** User should use login page instead

### Issue: Duplicate account created
**Solution:** Check registration form - should detect existing account on blur

### Issue: Can't claim account
**Solution:** 
1. Check phone/email matches donation record
2. Verify account exists: `GET /api/account-claim/check`
3. Check verification code hasn't expired (10 min)

---

## 📈 Analytics to Track

1. **Claim Rate:** Walk-in donors who claim accounts
2. **Time to Claim:** How long after donation
3. **Duplicate Prevention:** Attempts blocked
4. **Notification Delivery:** Success rate
5. **User Engagement:** Claimed vs unclaimed donor activity

---

## 🎉 Success Metrics

✅ **No duplicate accounts** - Phone/email uniqueness enforced
✅ **Seamless walk-in process** - No forced registration
✅ **High claim rate** - Easy claiming process
✅ **Better engagement** - Claimed donors get notifications
✅ **Complete history** - All donations tracked

---

## 📞 Support

### For Donors
- "I can't find my account" → Use claim account page
- "I forgot my password" → Use password reset (implement separately)
- "I donated but can't login" → Use claim account

### For Staff
- "Donor says they already registered" → Search by phone/email
- "How to handle walk-ins?" → Use blood collection form as normal
- "Duplicate records?" → System prevents this automatically

---

## 🔄 Future Enhancements

1. **Password Reset:** For claimed accounts
2. **Email Verification:** Optional email confirmation
3. **Social Login:** Google/Facebook OAuth
4. **Biometric:** Fingerprint for returning donors
5. **QR Code:** Quick donor lookup at events
6. **Batch Notifications:** Send event invites to all donors
7. **Preference Center:** Donors choose notification frequency

---

## ✅ Summary

This system provides:
- ✅ **Zero duplicates** - Checks phone/email before creating accounts
- ✅ **Easy claiming** - Two-step verification process
- ✅ **Better UX** - No forced registration at donation time
- ✅ **Complete tracking** - All donations linked to accounts
- ✅ **Engagement** - Notifications bring donors back

**Result:** Professional blood bank management with modern user experience! 🎉
