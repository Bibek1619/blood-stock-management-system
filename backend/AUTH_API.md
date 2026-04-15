# Authentication API Documentation

## Overview
Authentication system using JWT tokens with bcrypt password hashing.

## Environment Variables
Add to your `.env` file:
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

## Endpoints

### 1. Register User
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "role": "DONOR"  // Optional: DONOR (default), ADMIN, STAFF
}
```

**Response (201):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-14T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login User
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
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

---

### 3. Get User Profile (Protected)
**GET** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-14T10:00:00.000Z",
    "updatedAt": "2026-04-14T10:00:00.000Z",
    "donor": {
      "id": "clyyy...",
      "bloodGroup": "O_POSITIVE",
      "location": "New York",
      "city": "NYC",
      "lastDonationDate": "2026-03-01T00:00:00.000Z",
      "totalDonations": 5,
      "isEligible": true
    }
  }
}
```

---

### 4. Update User Profile (Protected)
**PUT** `/api/auth/profile`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "phone": "+9876543210"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "clxxx...",
    "name": "John Updated",
    "email": "john@example.com",
    "phone": "+9876543210",
    "role": "DONOR",
    "updatedAt": "2026-04-14T11:00:00.000Z"
  }
}
```

---

## Using Protected Routes

To access protected routes, include the JWT token in the Authorization header:

```javascript
fetch('http://localhost:3001/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

## Middleware Usage

### Protect Routes
```typescript
import { protect } from '../middleware/authMiddleware';

router.get('/protected-route', protect, yourController);
```

### Role-Based Authorization
```typescript
import { protect, authorize } from '../middleware/authMiddleware';

// Only ADMIN can access
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

// ADMIN or STAFF can access
router.get('/reports', protect, authorize('ADMIN', 'STAFF'), getReports);
```

## Error Responses

**400 Bad Request:**
```json
{
  "message": "User already exists"
}
```

**401 Unauthorized:**
```json
{
  "message": "Not authorized, no token"
}
```

**403 Forbidden:**
```json
{
  "message": "Role DONOR is not authorized to access this resource"
}
```

**500 Server Error:**
```json
{
  "message": "Server error"
}
```

## Token Expiration
Tokens expire after 30 days. Users will need to login again after expiration.
