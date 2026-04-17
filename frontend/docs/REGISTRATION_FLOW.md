# Two-Step Donor Registration Flow

## Overview
The application now has a clear separation between donor registration and staff/admin registration with a two-step process for donors.

## Registration Paths

### 1. Donor Registration (Two-Step Process)

#### Step 1: `/become-donor` - Account Creation
**Fields:**
- Full Name *
- Email Address *
- Phone Number *
- Password * (minimum 6 characters)

**Process:**
1. User fills out basic account information
2. System creates User account with role='DONOR'
3. Returns JWT token and user data
4. Stores token and user in localStorage
5. **Redirects to `/donor-form`** for medical information

#### Step 2: `/donor-form` - Medical Information
**Fields:**
- Blood Group * (A+, A-, B+, B-, AB+, AB-, O+, O-)
- Date of Birth * (must be 18-65 years old)
- Weight (kg) * (minimum 50 kg)
- City *
- Location/Area (optional)
- Full Address (optional)

**Validations:**
- Age must be between 18-65 years
- Weight must be at least 50 kg
- User must be logged in (checks for token)

**Process:**
1. Checks if user is authenticated
2. Validates age and weight requirements
3. Creates Donor profile linked to User
4. **Redirects to `/dashboard`** upon completion

### 2. Staff/Admin Registration (Single-Step)

#### `/login` - Register Tab
**Fields:**
- Full Name *
- Email Address *
- Phone Number *
- Password * (minimum 6 characters)

**Process:**
1. User fills out account information
2. System creates User account with role='STAFF'
3. Returns JWT token and user data
4. **Redirects directly to `/dashboard`** (no donor profile needed)

## User Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Landing Page                              │
└─────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ /become-donor│        │   /login     │
│  (Donors)    │        │ (Staff/Admin)│
└──────────────┘        └──────────────┘
        │                       │
        │ Step 1                │ Register Tab
        │ (Basic Info)          │ (Full Info)
        ▼                       │
┌──────────────┐                │
│ /donor-form  │                │
│  (Medical)   │                │
└──────────────┘                │
        │                       │
        │ Step 2                │
        │ (Complete)            │
        ▼                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      /dashboard                              │
└─────────────────────────────────────────────────────────────┘
```

## API Endpoints Used

### Registration
- **POST** `/api/auth/register`
  - Body: `{ name, email, phone, password, role }`
  - Returns: `{ user, token }`

### Donor Profile Creation
- **POST** `/api/donors`
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ userId, bloodGroup, dateOfBirth, weight, location, city, address }`
  - Returns: `{ status, data: donor }`

### Login
- **POST** `/api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ user, token }`

## Key Features

### Progress Indicators
Both donor registration pages show a visual progress indicator:
- Step 1: Account Info (active) → Medical Info (inactive)
- Step 2: Account Info (completed) → Medical Info (active)

### Error Handling
- Form validation errors displayed inline
- API errors shown in alert boxes
- Loading states on buttons during submission

### Authentication
- JWT token stored in localStorage
- User data stored in localStorage
- Protected route: `/donor-form` requires authentication

### Eligibility Requirements Display
Both pages show eligibility requirements:
- Age between 18-65 years
- Weight at least 50 kg (110 lbs)
- Good general health condition
- No recent illness, surgery, or tattoos (within 6 months)

## Environment Variables Required

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

Make sure your `.env.local` file in the frontend directory has this variable set to your backend API URL.

## Notes

1. **Donor vs Staff**: The key difference is the `role` field sent during registration
   - Donors: `role: 'DONOR'` → requires medical info
   - Staff: `role: 'STAFF'` → no medical info needed

2. **Data Persistence**: User data and token are stored in localStorage for session management

3. **Validation**: Client-side validation matches backend requirements to provide immediate feedback

4. **Redirect Logic**:
   - Donors must complete both steps before accessing dashboard
   - Staff can access dashboard immediately after registration
