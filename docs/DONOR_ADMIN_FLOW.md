# Donor vs Admin Flow Implementation

## Overview
Implemented role-based routing where donors have a separate home page, while the dashboard is accessible to everyone EXCEPT donors.

## Access Control Rules

### Dashboard (`/dashboard/*`)
- **Allowed:** 
  - Non-logged-in users (guests)
  - ADMIN users
  - STAFF users
- **Blocked:** DONOR users (redirects to `/home`)

### Donor Home (`/home`)
- **Allowed:** DONOR users only
- **Blocked:** Non-donors (redirects to `/dashboard`)
- **Not logged in:** Redirects to `/login`

### Profile (`/profile`)
- **Allowed:** All authenticated users
- **Not logged in:** Redirects to `/login`

## User Flows

### Donor Flow
1. **Registration** → `/become-donor`
   - Creates account with role: DONOR
   - isVerified: false

2. **Login** → `/login`
   - If not verified → `/donor-form` (complete profile)
   - If verified → `/home` (donor home page)

3. **Complete Profile** → `/donor-form`
   - Fill medical information
   - After completion → `/home`

4. **Donor Home** → `/home`
   - View donation stats
   - See upcoming events
   - Access profile
   - Quick actions
   - **Cannot access `/dashboard`** (redirected to `/home`)

5. **Profile** → `/profile`
   - View account details
   - Edit profile (future)
   - Back to home

### Admin/Staff Flow
1. **Login** → `/login`
   - Redirects to → `/dashboard`

2. **Dashboard** → `/dashboard`
   - Full admin panel
   - Blood stock management
   - Donor management
   - Events management
   - Certificates
   - All admin features

3. **Profile** → `/dashboard/profile` or `/profile`
   - View account details
   - Back to dashboard

### Guest (Non-logged-in) Flow
1. **Access Dashboard** → `/dashboard`
   - Can view dashboard (read-only mode)
   - Sidebar shows "Guest" with "Click to login"
   - Clicking user area → redirects to `/login`

2. **Login** → `/login`
   - After login, redirected based on role

## Navigation Updates

### PublicNav Dropdown
**For Donors:**
- Home (links to `/home`)
- View Profile (links to `/profile`)
- Logout

**For Admins/Staff:**
- Dashboard (links to `/dashboard`)
- View Profile (links to `/profile`)
- Logout

**For Guests (not logged in):**
- Login button
- Become Donor button

### DashboardNav Sidebar
**For Logged-in Users:**
- Shows user avatar with initial
- User name and email
- Dropdown with Profile and Logout

**For Guests:**
- Shows "Guest" avatar
- "Click to login" text
- Clicking opens login page

## Files Created

### New Pages
1. `frontend/app/(public)/home/page.tsx` - Donor home page
2. `frontend/app/(public)/profile/page.tsx` - Universal profile page

### Modified Files
1. `frontend/app/donor-form/page.tsx` - Redirects to `/home` for donors
2. `frontend/app/(public)/login/page.tsx` - Role-based redirect logic
3. `frontend/components/PublicNav.tsx` - Role-based menu items
4. `frontend/app/dashboard/layout.tsx` - Admin/Staff only access

## Features

### Donor Home Page (`/home`)
- Welcome message with user name
- Quick stats cards:
  - Total Donations
  - Lives Saved
  - Events Attended
  - Certificates
- Upcoming events section
- Recent donations history
- Profile card with quick info
- Quick actions sidebar
- Impact card

### Profile Page (`/profile`)
- User avatar with initial
- Full name
- Email address
- Role badge
- Verification status
- User ID
- Quick actions
- Back button (context-aware)

## Role Definitions

```typescript
enum Role {
  DONOR    // Regular blood donors - access /home
  ADMIN    // Full system access - access /dashboard
  STAFF    // Staff members - access /dashboard
}
```

## Testing Checklist

### Donor Flow
- [ ] Register as donor
- [ ] Login (should go to donor-form)
- [ ] Complete donor form
- [ ] Redirected to /home
- [ ] See donor home page
- [ ] Click profile in navbar
- [ ] View profile page
- [ ] Back to home works
- [ ] Logout works
- [ ] Try accessing /dashboard (should redirect to /home)

### Admin Flow
- [ ] Login as admin
- [ ] Redirected to /dashboard
- [ ] See full dashboard
- [ ] Click profile
- [ ] View profile page
- [ ] Back to dashboard works
- [ ] Logout works

### Guest Flow (Not Logged In)
- [ ] Access /dashboard directly
- [ ] See dashboard with "Guest" user
- [ ] Click on guest user area
- [ ] Redirected to /login
- [ ] After login, see proper user info
- [ ] Dashboard still accessible

## Key Features

1. **Dashboard is Public** - Anyone can view the dashboard, including guests
2. **Donors Restricted** - Only donors are blocked from accessing dashboard
3. **Guest Mode** - Non-logged-in users see "Guest" in sidebar with login prompt
4. **Role-Based Routing** - Automatic redirects based on user role
5. **Seamless Experience** - Users land on appropriate pages after login

## URL Structure

```
Public Routes:
/                    - Landing page
/login              - Login page
/become-donor       - Registration
/events             - Public events
/about              - About page
/images             - Gallery

Donor Routes:
/home               - Donor home (DONOR only)
/profile            - Profile page (all users)
/donor-form         - Complete profile (unverified donors)

Admin Routes:
/dashboard          - Admin dashboard (ADMIN/STAFF only)
/dashboard/*        - All admin features
```

## Benefits

1. **Clear Separation**: Donors and admins have distinct experiences
2. **Role-Based Access**: Automatic routing based on user role
3. **Better UX**: Donors see relevant features, not admin tools
4. **Security**: Dashboard protected from donor access
5. **Scalability**: Easy to add more role-specific features
