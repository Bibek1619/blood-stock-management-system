# Donor Registration Flow Implementation

## Overview
Implemented a two-step donor registration process where users first create an account, then complete their medical profile to become verified donors.

## Flow Diagram

```
1. User clicks "Become a Donor"
   ↓
2. Fills basic info (name, email, phone, password)
   ↓
3. Account created with isVerified = false
   ↓
4. Redirected to Login page
   ↓
5. User logs in
   ↓
6. System checks isVerified status
   ↓
7. If not verified → Redirect to Donor Form
   ↓
8. User fills medical details (blood group, DOB, weight, location)
   ↓
9. Donor profile created & isVerified = true
   ↓
10. Redirect to Dashboard
```

## Backend Changes

### 1. Database Schema (`backend/prisma/schema.prisma`)
- Added `isVerified` field to User model:
  ```prisma
  model User {
    isVerified Boolean  @default(false)
    // ... other fields
  }
  ```

### 2. Auth Controller (`backend/src/controllers/authController.ts`)

**Register Endpoint:**
- Creates user with `isVerified: false`
- Does NOT return token (user must login)
- Returns success message

**Login Endpoint:**
- Returns `isVerified` status in user object
- Frontend uses this to determine redirect path

**Profile Endpoint:**
- Includes `isVerified` in response

### 3. Donor Controller (`backend/src/controllers/donorController.ts`)

**Create Donor Endpoint:**
- Creates donor profile
- Updates user's `isVerified` to `true`
- Returns success message

### 4. Migration
Created migration file: `backend/prisma/migrations/20260416000000_add_user_is_verified/migration.sql`

To apply migration:
```bash
cd backend
npx prisma migrate deploy
```

## Frontend Changes

### 1. Axios Configuration (`frontend/lib/`)

**axiosInstance.ts:**
- Configured axios with base URL
- Request interceptor: Auto-attaches JWT token
- Response interceptor: Handles errors (401, 403, 404, 500, timeouts)

**apiPaths.ts:**
- Centralized API endpoint definitions
- Organized by feature (AUTH, DONOR, DONATION, etc.)

### 2. Become Donor Page (`frontend/app/(public)/become-donor/page.tsx`)

**Changes:**
- Removed token storage after registration
- Shows alert on success
- Redirects to `/login` instead of `/donor-form`
- Button text changed to "Register"

### 3. Login Page (`frontend/app/(public)/login/page.tsx`)

**Complete Rewrite:**
- Integrated axios instance
- Added error handling with error state
- Added loading state
- Checks `user.isVerified` after login:
  - If `false` and role is `DONOR` → Redirect to `/donor-form`
  - If `true` → Redirect to `/dashboard`

### 4. Donor Form Page (`frontend/app/donor-form/page.tsx`)

**Changes:**
- Converts blood group format (A+ → A_POSITIVE) for backend
- Updates localStorage with `isVerified: true` after success
- Shows success alert
- Redirects to `/dashboard`

## API Usage Examples

### 1. Register New Donor
```typescript
import axiosInstance from "@/lib/axiosInstance";
import { API_PATHS } from "@/lib/apiPaths";

const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
  name: "John Doe",
  email: "john@example.com",
  phone: "+1234567890",
  password: "password123",
  role: "DONOR"
});

// Response: { success: true, message: "...", data: { user } }
// Note: No token returned, user must login
```

### 2. Login
```typescript
const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
  email: "john@example.com",
  password: "password123"
});

const { user, token } = response.data.data;

// Store token
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify(user));

// Check verification status
if (!user.isVerified && user.role === 'DONOR') {
  router.push('/donor-form');
} else {
  router.push('/dashboard');
}
```

### 3. Complete Donor Profile
```typescript
const response = await axiosInstance.post(API_PATHS.DONOR.CREATE, {
  userId: user.id,
  bloodGroup: "A_POSITIVE",
  dateOfBirth: "1990-01-01",
  weight: 70,
  location: "New York",
  city: "New York",
  address: "123 Main St"
});

// Response: { status: "success", message: "...", data: donor }
// User is now verified
```

### 4. Get Profile
```typescript
const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
const user = response.data.data;

console.log(user.isVerified); // true or false
```

## Blood Group Mapping

Frontend uses user-friendly format, backend uses enum format:

| Frontend | Backend       |
|----------|---------------|
| A+       | A_POSITIVE    |
| A-       | A_NEGATIVE    |
| B+       | B_POSITIVE    |
| B-       | B_NEGATIVE    |
| AB+      | AB_POSITIVE   |
| AB-      | AB_NEGATIVE   |
| O+       | O_POSITIVE    |
| O-       | O_NEGATIVE    |

## Testing the Flow

1. **Register:**
   - Go to `/become-donor`
   - Fill form and submit
   - Should see success alert
   - Should redirect to `/login`

2. **Login (Unverified):**
   - Login with credentials
   - Should redirect to `/donor-form`

3. **Complete Profile:**
   - Fill medical details
   - Submit form
   - Should see success alert
   - Should redirect to `/dashboard`

4. **Login (Verified):**
   - Logout and login again
   - Should redirect directly to `/dashboard`

## Environment Variables

**Frontend (`.env.local`):**
```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

**Backend (`.env`):**
```env
DATABASE_URL="your_database_url"
PORT=3001
JWT_SECRET="your_jwt_secret"
```

## Next Steps

1. Apply the database migration:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

2. Restart backend server:
   ```bash
   npm run dev
   ```

3. Test the complete flow from registration to dashboard

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire in 30 days
- Token automatically attached to all authenticated requests
- 401 errors should trigger logout/redirect to login
- User must complete donor profile to access dashboard features
