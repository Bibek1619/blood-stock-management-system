# Postman Test Data - Ready to Use!

## ✅ Server is Running
**Base URL:** `http://localhost:3001`

---

## 1. Register User (POST)
**URL:** `http://localhost:3001/api/auth/register`  
**Method:** POST  
**Headers:** `Content-Type: application/json`

### Test Data 1 - Donor
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "DONOR"
}
```

### Test Data 2 - Admin
```json
{
  "name": "Admin User",
  "email": "admin@bloodbank.com",
  "password": "admin123",
  "phone": "+1234567891",
  "role": "ADMIN"
}
```

### Test Data 3 - Staff
```json
{
  "name": "Sarah Johnson",
  "email": "sarah.staff@bloodbank.com",
  "password": "staff123",
  "phone": "+1234567892",
  "role": "STAFF"
}
```

### Expected Response (201):
```json
{
  "user": {
    "id": "cmnzf5mbq0001w8lh10ousb7b",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-15T02:16:16.454Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 2. Login User (POST)
**URL:** `http://localhost:3001/api/auth/login`  
**Method:** POST  
**Headers:** `Content-Type: application/json`

### Test Data
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Expected Response (200):
```json
{
  "user": {
    "id": "cmnzf5mbq0001w8lh10ousb7b",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**💡 Copy the token from the response!**

---

## 3. Get User Profile (GET) - Protected
**URL:** `http://localhost:3001/api/auth/profile`  
**Method:** GET  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Expected Response (200):
```json
{
  "user": {
    "id": "cmnzf5mbq0001w8lh10ousb7b",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "DONOR",
    "createdAt": "2026-04-15T02:16:16.454Z",
    "updatedAt": "2026-04-15T02:16:16.454Z",
    "donor": null
  }
}
```

---

## 4. Update User Profile (PUT) - Protected
**URL:** `http://localhost:3001/api/auth/profile`  
**Method:** PUT  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json
```

### Test Data
```json
{
  "name": "John Doe Updated",
  "phone": "+9876543210"
}
```

### Expected Response (200):
```json
{
  "user": {
    "id": "cmnzf5mbq0001w8lh10ousb7b",
    "name": "John Doe Updated",
    "email": "john@example.com",
    "phone": "+9876543210",
    "role": "DONOR",
    "updatedAt": "2026-04-15T02:20:00.000Z"
  }
}
```

---

## 5. Health Check (GET)
**URL:** `http://localhost:3001/health`  
**Method:** GET

### Expected Response (200):
```json
{
  "status": "ok",
  "message": "Blood Donation API is running",
  "database": "connected"
}
```

---

## Quick Test Sequence

1. **Health Check** → Verify server is running
2. **Register** → Create account (save the token)
3. **Login** → Get fresh token
4. **Get Profile** → Test protected route
5. **Update Profile** → Test update functionality

---

## Error Responses

### 400 - User Already Exists
```json
{
  "message": "User already exists"
}
```

### 401 - Invalid Credentials
```json
{
  "message": "Invalid email or password"
}
```

### 401 - No Token
```json
{
  "message": "Not authorized, no token"
}
```

### 401 - Invalid Token
```json
{
  "message": "Not authorized, token failed"
}
```

---

## Notes

- ✅ All endpoints are working
- ✅ Database schema is fixed
- ✅ JWT authentication is configured
- ✅ Password hashing with bcrypt
- ✅ Token expires in 30 days
- ✅ Role-based access (DONOR, ADMIN, STAFF)

**Server:** http://localhost:3001  
**Health:** http://localhost:3001/health  
**API Base:** http://localhost:3001/api
