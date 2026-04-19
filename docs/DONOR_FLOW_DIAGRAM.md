# Donor Flow Diagrams

## 🔄 Complete Donor Management Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    THREE COLLECTION CHANNELS                         │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Office Walk-in  │  │  Organization    │  │  Event Donation  │
│                  │  │  Bulk Collection │  │                  │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                     │                      │
         └─────────────────────┴──────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Blood Collection    │
                    │  Form Submitted      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Check: User Exists? │
                    │  (by phone/email)    │
                    └──────────┬───────────┘
                               │
                ┏━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┓
                ▼                              ▼
        ┌───────────────┐              ┌───────────────┐
        │  YES: Found   │              │  NO: Not Found│
        │  Existing     │              │               │
        └───────┬───────┘              └───────┬───────┘
                │                              │
                ▼                              ▼
        ┌───────────────┐              ┌───────────────┐
        │ Use Existing  │              │ Create New    │
        │ User Account  │              │ User Account  │
        │               │              │ isVerified=   │
        │               │              │ false         │
        └───────┬───────┘              └───────┬───────┘
                │                              │
                └──────────────┬───────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Create/Update       │
                    │  Donor Profile       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Record Donation     │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Create Blood Pack   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Send Notification   │
                    │  (SMS/Email)         │
                    │  + Claim Link        │
                    └──────────────────────┘
```

---

## 🎯 Account Claiming Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WALK-IN DONOR JOURNEY                             │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  Donor       │
    │  Walks In    │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  Staff       │
    │  Collects    │
    │  Info        │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────┐
    │  System Creates:     │
    │  • User (unverified) │
    │  • Donor Profile     │
    │  • Donation Record   │
    │  • Blood Pack        │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  SMS/Email Sent:     │
    │  "Thank you!         │
    │  Claim account:      │
    │  [link]"             │
    └──────┬───────────────┘
           │
           │ (Later, at home)
           │
           ▼
    ┌──────────────────────┐
    │  Donor Clicks Link   │
    │  or Visits           │
    │  /claim-account      │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Enter Phone/Email   │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  System Sends        │
    │  Verification Code   │
    │  (6 digits)          │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Enter Code +        │
    │  Set Password        │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Account Activated!  │
    │  isVerified = true   │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Auto Login          │
    │  → Dashboard         │
    │  → See Donations     │
    └──────────────────────┘
```

---

## 🚫 Duplicate Prevention Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              REGISTRATION WITH DUPLICATE CHECK                       │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────┐
    │  User Visits │
    │  /become-    │
    │  donor       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────┐
    │  Fill Form:          │
    │  • Name              │
    │  • Email             │
    │  • Phone             │
    │  • Password          │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  On Blur (Phone/     │
    │  Email Field):       │
    │  Check Existing      │
    │  Account             │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  API Call:           │
    │  /account-claim/     │
    │  check?phone=...     │
    └──────┬───────────────┘
           │
    ┏━━━━━━┻━━━━━━┓
    ▼              ▼
┌─────────┐  ┌─────────────┐
│ Account │  │ No Account  │
│ Exists  │  │ Found       │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────────┐  ┌──────────────┐
│ Is Verified?│  │ Continue     │
└────┬────────┘  │ Registration │
     │           └──────────────┘
┏━━━━┻━━━━┓
▼          ▼
┌────────┐ ┌────────────┐
│ YES    │ │ NO         │
│ (Web   │ │ (Walk-in   │
│ User)  │ │ Unclaimed) │
└───┬────┘ └─────┬──────┘
    │            │
    ▼            ▼
┌────────────┐ ┌──────────────────┐
│ Show Error:│ │ Show Error:      │
│ "Already   │ │ "You donated!    │
│ registered │ │ Claim account"   │
│ Please     │ │                  │
│ login"     │ │ [Claim Button]   │
└────────────┘ └────────┬─────────┘
                        │
                        ▼
                ┌───────────────┐
                │ Redirect to   │
                │ /claim-       │
                │ account       │
                └───────────────┘
```

---

## 🔄 Three Donor Types Comparison

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DONOR TYPE COMPARISON                             │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────────┬──────────────────┬──────────────────┬──────────────────┐
│                  │  WEB REGISTERED  │  WALK-IN         │  ORGANIZATION    │
│                  │  DONOR           │  (UNCLAIMED)     │  DONOR           │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Created By       │ Online           │ Staff at         │ Staff (bulk      │
│                  │ Registration     │ Collection       │ collection)      │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ isVerified       │ true             │ false            │ false            │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Password         │ Hashed           │ WALK_IN_DONOR    │ ORGANIZATION     │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Can Login?       │ ✅ Yes           │ ❌ No            │ ❌ No            │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Can Claim?       │ ❌ No            │ ✅ Yes           │ ✅ Yes           │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Receives         │ ✅ Yes           │ ✅ Yes           │ ✅ Yes           │
│ Notifications?   │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Has Donor        │ ✅ Yes           │ ✅ Yes           │ ✅ Yes           │
│ Profile?         │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ Donation         │ Tracked          │ Tracked          │ Tracked          │
│ History?         │                  │                  │                  │
├──────────────────┼──────────────────┼──────────────────┼──────────────────┤
│ After Claiming   │ N/A              │ → Web Registered │ → Web Registered │
│                  │                  │ (isVerified=true)│ (isVerified=true)│
└──────────────────┴──────────────────┴──────────────────┴──────────────────┘
```

---

## 📱 User Interface Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    FRONTEND PAGE FLOW                                │
└─────────────────────────────────────────────────────────────────────┘

                        ┌──────────────┐
                        │  Homepage    │
                        └──────┬───────┘
                               │
                ┏━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━┓
                ▼                              ▼
        ┌───────────────┐              ┌───────────────┐
        │  /become-     │              │  /login       │
        │  donor        │              │               │
        └───────┬───────┘              └───────┬───────┘
                │                              │
                ▼                              │
        ┌───────────────┐                      │
        │  Check        │                      │
        │  Existing     │                      │
        │  Account      │                      │
        └───────┬───────┘                      │
                │                              │
        ┏━━━━━━━┻━━━━━━━┓                     │
        ▼                ▼                     │
┌───────────┐    ┌───────────────┐            │
│ Exists    │    │ New User      │            │
│ (Unclaimed)│   │               │            │
└─────┬─────┘    └───────┬───────┘            │
      │                  │                    │
      ▼                  ▼                    │
┌───────────────┐  ┌───────────────┐         │
│ /claim-       │  │ Register      │         │
│ account       │  │ Success       │         │
└───────┬───────┘  └───────┬───────┘         │
        │                  │                 │
        │                  ▼                 │
        │          ┌───────────────┐         │
        │          │ /login        │         │
        │          └───────┬───────┘         │
        │                  │                 │
        └──────────────────┴─────────────────┘
                           │
                           ▼
                   ┌───────────────┐
                   │  Dashboard    │
                   │               │
                   │  • Donations  │
                   │  • Events     │
                   │  • Profile    │
                   │  • Certs      │
                   └───────────────┘
```

---

## 🔐 Security & Verification Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│              VERIFICATION CODE LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │  User Requests       │
    │  Account Claim       │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Generate Random     │
    │  6-Digit Code        │
    │  (100000-999999)     │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Store in Memory     │
    │  (or Redis)          │
    │  TTL: 10 minutes     │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Send via SMS/Email  │
    │  (Testing: console)  │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  User Enters Code    │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │  Verify:             │
    │  • Code matches?     │
    │  • Not expired?      │
    └──────┬───────────────┘
           │
    ┏━━━━━━┻━━━━━━┓
    ▼              ▼
┌─────────┐  ┌─────────────┐
│ Valid   │  │ Invalid     │
└────┬────┘  └──────┬──────┘
     │              │
     ▼              ▼
┌─────────────┐  ┌──────────────┐
│ Update User:│  │ Show Error   │
│ • Hash pwd  │  │ • Try again  │
│ • isVerified│  │ • Resend?    │
│   = true    │  └──────────────┘
│ • Generate  │
│   JWT       │
└─────┬───────┘
      │
      ▼
┌─────────────┐
│ Delete Code │
│ Auto Login  │
└─────────────┘
```

---

## 📊 Database State Transitions

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER ACCOUNT STATES                               │
└─────────────────────────────────────────────────────────────────────┘

    ┌──────────────────────┐
    │  NEW WALK-IN DONOR   │
    │  isVerified: false   │
    │  password:           │
    │  'WALK_IN_DONOR'     │
    └──────┬───────────────┘
           │
           │ Claims Account
           │ (verification + password)
           │
           ▼
    ┌──────────────────────┐
    │  CLAIMED DONOR       │
    │  isVerified: true    │
    │  password: hashed    │
    └──────┬───────────────┘
           │
           │ Can now login
           │
           ▼
    ┌──────────────────────┐
    │  ACTIVE USER         │
    │  • Full dashboard    │
    │  • Donation history  │
    │  • Event registration│
    │  • Certificates      │
    └──────────────────────┘


    ┌──────────────────────┐
    │  NEW WEB USER        │
    │  (Direct Register)   │
    │  isVerified: true    │
    │  password: hashed    │
    └──────┬───────────────┘
           │
           │ Immediate access
           │
           ▼
    ┌──────────────────────┐
    │  ACTIVE USER         │
    │  (Same as above)     │
    └──────────────────────┘
```

---

## 🎯 Summary

### Key Points:
1. **Three collection channels** → One unified system
2. **Walk-in donors** → Lightweight accounts (can claim later)
3. **Duplicate prevention** → Check phone/email before creating
4. **Account claiming** → Two-step verification process
5. **All donors tracked** → Complete history regardless of claim status

### Result:
✅ No duplicate accounts
✅ Seamless walk-in process
✅ Optional account claiming
✅ Complete donation tracking
✅ Professional user experience
