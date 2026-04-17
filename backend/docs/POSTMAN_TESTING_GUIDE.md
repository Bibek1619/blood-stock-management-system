# Postman Testing Guide

## Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Select the file: `Blood_Donation_Auth_API.postman_collection.json`
4. Click **Import**

## Setup Environment (Optional but Recommended)

1. Click **Environments** in left sidebar
2. Click **+** to create new environment
3. Name it: `Blood Donation Local`
4. Add variable:
   - Variable: `auth_token`
   - Initial Value: (leave empty)
   - Current Value: (leave empty)
5. Click **Save**
6. Select this environment from dropdown (top right)

## Testing Flow

### Step 1: Health Check
**Endpoint:** `GET http://localhost:3001/health`

Test if server is running.

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Blood Donation API is running",
  "database": "connected"
}
```

---

### Step 2: Register a New User
**Endpoint:** `POST http://localhost:3001/api/auth/register`

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "DONOR"
}
```

**Expected Response (201):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-14T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Copy the token** from response for next steps!

---

### Step 3: Login
**Endpoint:** `POST http://localhost:3001/api/auth/login`

**Body (JSON):**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Note:** The token is automatically saved to `{{auth_token}}` variable if you're using the environment.

---

### Step 4: Get User Profile (Protected)
**Endpoint:** `GET http://localhost:3001/api/auth/profile`

**Headers:**
```
Authorization: Bearer {{auth_token}}
```

Or manually:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-14T...",
    "updatedAt": "2026-04-14T...",
    "donor": null
  }
}
```

---

### Step 5: Update User Profile (Protected)
**Endpoint:** `PUT http://localhost:3001/api/auth/profile`

**Headers:**
```
Authorization: Bearer {{auth_token}}
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe Updated",
  "phone": "+9876543210"
}
```

**Expected Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+9876543210",
    "role": "DONOR",
    "updatedAt": "2026-04-14T..."
  }
}
```

---

## Test Different Roles

### Register Admin User
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123",
  "phone": "+1234567891",
  "role": "ADMIN"
}
```

### Register Staff User
```json
{
  "name": "Staff Member",
  "email": "staff@example.com",
  "password": "staff123",
  "phone": "+1234567892",
  "role": "STAFF"
}
```

---

## Error Testing

### Test 1: Register with Existing Email
Try registering with same email twice.

**Expected Response (400):**
```json
{
  "message": "User already exists"
}
```

### Test 2: Login with Wrong Password
**Expected Response (401):**
```json
{
  "message": "Invalid email or password"
}
```

### Test 3: Access Protected Route Without Token
Remove Authorization header and try to get profile.

**Expected Response (401):**
```json
{
  "message": "Not authorized, no token"
}
```

### Test 4: Access with Invalid Token
Use wrong token in Authorization header.

**Expected Response (401):**
```json
{
  "message": "Not authorized, token failed"
}
```

---

## Quick cURL Commands (Alternative to Postman)

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "+1234567890",
    "role": "DONOR"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Profile
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "+9876543210"
  }'
```

---

## Troubleshooting

### Server Not Running
Make sure backend server is running:
```bash
cd backend
npm run dev
```

### Database Connection Error
Check if DATABASE_URL is correct in `.env` file.

### JWT_SECRET Missing
Make sure `.env` has:
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### Token Expired
Login again to get a new token (tokens expire after 30 days).

---

## Available Roles
- `DONOR` (default)
- `ADMIN`
- `STAFF`
