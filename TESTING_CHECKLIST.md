# Testing Checklist - Two-Step Donor Registration

## 🚀 Pre-Testing Setup

### Backend Setup
- [ ] Backend server is running on `http://localhost:3001`
- [ ] Database is connected and migrated
- [ ] `.env` file has `JWT_SECRET` configured
- [ ] Test health endpoint: `http://localhost:3001/health`
- [ ] Should return: `{ status: "ok", database: "connected" }`

### Frontend Setup
- [ ] Frontend server is running on `http://localhost:3000`
- [ ] `.env.local` has `NEXT_PUBLIC_BACKEND_URL=http://localhost:3001`
- [ ] Browser console is open (F12) for debugging
- [ ] Network tab is open to monitor API calls

---

## 📋 Test Cases

## Test Suite 1: Donor Registration - Happy Path ✅

### Test 1.1: Step 1 - Account Creation
- [ ] Navigate to `http://localhost:3000/become-donor`
- [ ] Page loads successfully
- [ ] Progress indicator shows "Step 1 of 2"
- [ ] Step 1 circle is active (red), Step 2 is inactive (gray)
- [ ] Form has 4 fields: Name, Email, Phone, Password
- [ ] Fill in form:
  ```
  Name: Test Donor One
  Email: donor1@test.com
  Phone: +1234567890
  Password: test123
  ```
- [ ] Check terms checkbox
- [ ] Click "Continue to Medical Info" button
- [ ] Button shows "Creating Account..." during loading
- [ ] Network tab shows POST to `/api/auth/register`
- [ ] Request body includes `role: "DONOR"`
- [ ] Response includes `user` and `token`
- [ ] localStorage has `token` stored
- [ ] localStorage has `user` stored
- [ ] Redirects to `/donor-form`

### Test 1.2: Step 2 - Medical Information
- [ ] Page loads successfully
- [ ] Progress indicator shows "Step 2 of 2"
- [ ] Step 1 shows checkmark (completed), Step 2 is active (red)
- [ ] Welcome message shows: "Welcome, Test Donor One!"
- [ ] Form has 6 fields: Blood Group, DOB, Weight, City, Location, Address
- [ ] Fill in form:
  ```
  Blood Group: A+
  Date of Birth: 1990-01-01
  Weight: 70
  City: New York
  Location: Manhattan
  Address: 123 Main St
  ```
- [ ] Check confirmation checkbox
- [ ] Click "Complete Registration" button
- [ ] Button shows "Completing Registration..." during loading
- [ ] Network tab shows POST to `/api/donors`
- [ ] Request includes Authorization header with Bearer token
- [ ] Request body includes all medical fields
- [ ] Response includes donor profile data
- [ ] Redirects to `/dashboard`
- [ ] ✅ Registration complete!

---

## Test Suite 2: Staff Registration - Happy Path ✅

### Test 2.1: Staff Account Creation
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Page loads successfully
- [ ] Click "Register" tab
- [ ] Form has 4 fields: Name, Email, Phone, Password
- [ ] Blue info box shows: "For staff/admin users"
- [ ] Fill in form:
  ```
  Name: Test Staff One
  Email: staff1@test.com
  Phone: +1234567891
  Password: test123
  ```
- [ ] Check terms checkbox
- [ ] Click "Create Account" button
- [ ] Button shows "Creating Account..." during loading
- [ ] Network tab shows POST to `/api/auth/register`
- [ ] Request body includes `role: "STAFF"`
- [ ] Response includes `user` and `token`
- [ ] localStorage has `token` stored
- [ ] localStorage has `user` stored
- [ ] Redirects directly to `/dashboard` (no donor form)
- [ ] ✅ Registration complete!

---

## Test Suite 3: Login Flow ✅

### Test 3.1: Donor Login
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Stay on "Login" tab
- [ ] Fill in form:
  ```
  Email: donor1@test.com
  Password: test123
  ```
- [ ] Click "Sign In" button
- [ ] Button shows "Signing In..." during loading
- [ ] Network tab shows POST to `/api/auth/login`
- [ ] Response includes `user` and `token`
- [ ] localStorage updated with new token
- [ ] Redirects to `/dashboard`
- [ ] ✅ Login successful!

### Test 3.2: Staff Login
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Fill in form:
  ```
  Email: staff1@test.com
  Password: test123
  ```
- [ ] Click "Sign In" button
- [ ] Redirects to `/dashboard`
- [ ] ✅ Login successful!

---

## Test Suite 4: Validation & Error Handling ❌

### Test 4.1: Age Validation (Too Young)
- [ ] Complete Step 1 of donor registration with new email
- [ ] On Step 2, enter DOB for someone under 18 (e.g., 2010-01-01)
- [ ] Fill other fields correctly
- [ ] Click "Complete Registration"
- [ ] ❌ Error message appears: "You must be between 18 and 65 years old"
- [ ] Form does not submit
- [ ] User stays on `/donor-form`

### Test 4.2: Age Validation (Too Old)
- [ ] On Step 2, enter DOB for someone over 65 (e.g., 1950-01-01)
- [ ] Fill other fields correctly
- [ ] Click "Complete Registration"
- [ ] ❌ Error message appears: "You must be between 18 and 65 years old"
- [ ] Form does not submit

### Test 4.3: Weight Validation
- [ ] On Step 2, enter valid DOB
- [ ] Enter weight less than 50kg (e.g., 45)
- [ ] Fill other fields correctly
- [ ] Click "Complete Registration"
- [ ] ❌ Error message appears: "You must weigh at least 50 kg"
- [ ] Form does not submit

### Test 4.4: Duplicate Email (Donor)
- [ ] Navigate to `/become-donor`
- [ ] Try to register with existing email: `donor1@test.com`
- [ ] Fill other fields correctly
- [ ] Click "Continue to Medical Info"
- [ ] ❌ Error message appears: "User already exists"
- [ ] Form does not submit
- [ ] User stays on `/become-donor`

### Test 4.5: Duplicate Email (Staff)
- [ ] Navigate to `/login` → Register tab
- [ ] Try to register with existing email: `staff1@test.com`
- [ ] Fill other fields correctly
- [ ] Click "Create Account"
- [ ] ❌ Error message appears: "User already exists"
- [ ] Form does not submit

### Test 4.6: Invalid Login Credentials
- [ ] Navigate to `/login`
- [ ] Enter wrong password:
  ```
  Email: donor1@test.com
  Password: wrongpassword
  ```
- [ ] Click "Sign In"
- [ ] ❌ Error message appears: "Invalid email or password"
- [ ] User stays on `/login`

### Test 4.7: Required Field Validation
- [ ] Navigate to `/become-donor`
- [ ] Leave Name field empty
- [ ] Try to submit form
- [ ] ❌ Browser validation shows: "Please fill out this field"
- [ ] Repeat for each required field

### Test 4.8: Email Format Validation
- [ ] Navigate to `/become-donor`
- [ ] Enter invalid email: `notanemail`
- [ ] Try to submit form
- [ ] ❌ Browser validation shows: "Please include an '@' in the email"

### Test 4.9: Password Length Validation
- [ ] Navigate to `/become-donor`
- [ ] Enter password less than 6 characters: `test`
- [ ] Try to submit form
- [ ] ❌ Browser validation shows: "Please lengthen this text to 6 characters or more"

---

## Test Suite 5: Authentication & Protected Routes 🔒

### Test 5.1: Direct Access to Donor Form (Not Logged In)
- [ ] Open browser console
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Navigate directly to `http://localhost:3000/donor-form`
- [ ] Page shows "Loading..." briefly
- [ ] ❌ Redirects to `/login`
- [ ] Cannot access donor form without authentication

### Test 5.2: Token Persistence
- [ ] Login as donor
- [ ] Check localStorage has token
- [ ] Refresh the page
- [ ] Token still exists in localStorage
- [ ] User remains logged in

### Test 5.3: Logout (Manual)
- [ ] Login as any user
- [ ] Open browser console
- [ ] Clear localStorage: `localStorage.clear()`
- [ ] Try to access `/donor-form`
- [ ] ❌ Redirects to `/login`

---

## Test Suite 6: UI/UX Elements 🎨

### Test 6.1: Progress Indicators
- [ ] On `/become-donor`:
  - [ ] Step 1 circle is filled (red background)
  - [ ] Step 2 circle is empty (gray background)
  - [ ] Text "Account Info" is red
  - [ ] Text "Medical Info" is gray
- [ ] On `/donor-form`:
  - [ ] Step 1 shows green checkmark
  - [ ] Step 2 circle is filled (red background)
  - [ ] Text "Account Info" is green
  - [ ] Text "Medical Info" is red

### Test 6.2: Loading States
- [ ] On any form submission:
  - [ ] Button text changes (e.g., "Creating Account...")
  - [ ] Button is disabled during loading
  - [ ] Form fields are disabled during loading
  - [ ] Cannot submit form multiple times

### Test 6.3: Error Display
- [ ] Trigger any error (e.g., duplicate email)
- [ ] Error appears in red alert box
- [ ] Alert has AlertCircle icon
- [ ] Error message is clear and readable
- [ ] Error persists until form is resubmitted

### Test 6.4: Password Visibility Toggle
- [ ] On `/login` page:
  - [ ] Password field shows dots by default
  - [ ] Click eye icon
  - [ ] Password becomes visible
  - [ ] Icon changes to eye-off
  - [ ] Click again
  - [ ] Password hidden again

### Test 6.5: Eligibility Requirements Display
- [ ] On `/donor-form`:
  - [ ] Eligibility box is visible
  - [ ] Shows 4 requirements with checkmarks
  - [ ] Box has red left border
  - [ ] Text is readable

### Test 6.6: Info Boxes
- [ ] On `/become-donor`:
  - [ ] Blue info box explains next step
- [ ] On `/login` register tab:
  - [ ] Blue info box explains this is for staff
  - [ ] Mentions "Become a Donor" link

### Test 6.7: Links
- [ ] On `/become-donor`:
  - [ ] "Login here" link goes to `/login`
- [ ] On `/login`:
  - [ ] "Become a blood donor" link goes to `/become-donor`

---

## Test Suite 7: Edge Cases 🔍

### Test 7.1: Browser Back Button
- [ ] Complete Step 1 of donor registration
- [ ] On Step 2, click browser back button
- [ ] Goes back to `/become-donor`
- [ ] Form is empty (not pre-filled)
- [ ] Can register again with same email?
  - [ ] ❌ Should show "User already exists"

### Test 7.2: Refresh During Registration
- [ ] Start Step 1 of donor registration
- [ ] Fill in half the form
- [ ] Refresh the page (F5)
- [ ] Form is cleared
- [ ] No data loss (expected behavior)

### Test 7.3: Multiple Tabs
- [ ] Login in Tab 1
- [ ] Open Tab 2
- [ ] Check if logged in in Tab 2
- [ ] localStorage is shared between tabs
- [ ] Both tabs have access to token

### Test 7.4: Network Failure Simulation
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to submit any form
- [ ] ❌ Should show error (network error)
- [ ] Set back to "Online"
- [ ] Form should work again

### Test 7.5: Special Characters in Input
- [ ] Try registering with:
  ```
  Name: Test O'Brien-Smith
  Email: test+tag@example.com
  Phone: +1 (234) 567-8900
  ```
- [ ] Should accept special characters
- [ ] Registration should succeed

### Test 7.6: Very Long Input
- [ ] Try entering very long name (100+ characters)
- [ ] Check if input is accepted
- [ ] Check if it displays correctly
- [ ] Check if backend accepts it

---

## Test Suite 8: Mobile Responsiveness 📱

### Test 8.1: Mobile View (375px width)
- [ ] Open DevTools → Toggle device toolbar
- [ ] Set to iPhone SE (375px)
- [ ] Navigate to `/become-donor`
- [ ] Form is readable
- [ ] Buttons are tappable
- [ ] No horizontal scroll
- [ ] Progress indicator fits

### Test 8.2: Tablet View (768px width)
- [ ] Set to iPad (768px)
- [ ] Navigate to `/donor-form`
- [ ] Two-column layout works
- [ ] Form is well-spaced
- [ ] All elements visible

### Test 8.3: Desktop View (1920px width)
- [ ] Set to Desktop (1920px)
- [ ] Form is centered
- [ ] Max-width is applied
- [ ] Not stretched too wide

---

## Test Suite 9: Accessibility ♿

### Test 9.1: Keyboard Navigation
- [ ] Navigate to any form
- [ ] Use Tab key to move between fields
- [ ] All fields are reachable
- [ ] Tab order is logical
- [ ] Can submit form with Enter key

### Test 9.2: Screen Reader Labels
- [ ] Check all input fields have labels
- [ ] Labels are associated with inputs
- [ ] Error messages are announced
- [ ] Button states are clear

### Test 9.3: Color Contrast
- [ ] Text is readable on backgrounds
- [ ] Error messages have sufficient contrast
- [ ] Buttons have clear text

---

## Test Suite 10: Data Verification 🗄️

### Test 10.1: Database Check - User Created
- [ ] Complete donor registration
- [ ] Check database:
  ```sql
  SELECT * FROM "User" WHERE email = 'donor1@test.com';
  ```
- [ ] User exists
- [ ] Role is 'DONOR'
- [ ] Password is hashed (not plain text)
- [ ] Phone is stored correctly

### Test 10.2: Database Check - Donor Profile Created
- [ ] Check database:
  ```sql
  SELECT * FROM "Donor" WHERE "userId" = '<user-id>';
  ```
- [ ] Donor profile exists
- [ ] Blood group is correct
- [ ] Weight is stored as float
- [ ] Date of birth is correct
- [ ] Location fields are populated

### Test 10.3: Database Check - Staff User
- [ ] Complete staff registration
- [ ] Check database:
  ```sql
  SELECT * FROM "User" WHERE email = 'staff1@test.com';
  ```
- [ ] User exists
- [ ] Role is 'STAFF'
- [ ] No donor profile exists for this user

---

## 📊 Test Results Summary

### Pass/Fail Tracking

| Test Suite | Total Tests | Passed | Failed | Notes |
|------------|-------------|--------|--------|-------|
| 1. Donor Happy Path | 2 | | | |
| 2. Staff Happy Path | 1 | | | |
| 3. Login Flow | 2 | | | |
| 4. Validation | 9 | | | |
| 5. Authentication | 3 | | | |
| 6. UI/UX | 7 | | | |
| 7. Edge Cases | 6 | | | |
| 8. Mobile | 3 | | | |
| 9. Accessibility | 3 | | | |
| 10. Data Verification | 3 | | | |
| **TOTAL** | **39** | | | |

---

## 🐛 Bug Report Template

If you find any issues, document them using this template:

```markdown
### Bug #X: [Short Description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:


**Actual Behavior**:


**Screenshots**:


**Environment**:
- Browser: 
- OS: 
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

**Console Errors**:
```
[Paste console errors here]
```

**Network Response**:
```json
[Paste API response here]
```
```

---

## ✅ Sign-Off

Once all tests pass:

- [ ] All 39 test cases executed
- [ ] All critical bugs fixed
- [ ] Documentation reviewed
- [ ] Code reviewed
- [ ] Ready for deployment

**Tested By**: _______________  
**Date**: _______________  
**Signature**: _______________

---

## 🚀 Post-Testing

After successful testing:

1. [ ] Commit all changes
2. [ ] Push to repository
3. [ ] Create pull request
4. [ ] Request code review
5. [ ] Merge to main branch
6. [ ] Deploy to staging
7. [ ] Run smoke tests on staging
8. [ ] Deploy to production
9. [ ] Monitor error logs
10. [ ] Celebrate! 🎉
