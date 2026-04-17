# Authentication API Testing Guide

## Common Issues and Solutions

### ❌ Issue 1: Using GET instead of POST
**Error**: `Method Not Allowed` or JSON parsing error with `method: 'GET'`

**Solution**: Login and Register endpoints require POST method, not GET.

### ❌ Issue 2: Invalid JSON Format
**Error**: `Expected double-quoted property name in JSON`

**Solution**: Ensure your JSON is properly formatted:
- Use double quotes for property names
- No trailing commas
- Proper escaping of special characters

---

## Testing with cURL

### 1. Register New User ✅

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"phone\":\"1234567890\"}"
```

**Expected Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "DONOR",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User ✅

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "DONOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get User Profile ✅ (Protected)

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected Response (200)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "role": "DONOR",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 4. Update User Profile ✅ (Protected)

```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Updated\",\"phone\":\"9876543210\"}"
```

**Expected Response (200)**:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "name": "John Updated",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "DONOR",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

## Testing with Postman

### Setup
1. Open Postman
2. Import the collection: `Blood_Donation_Auth_API.postman_collection.json`
3. Set base URL: `http://localhost:3001`

### 1. Register User

- **Method**: POST
- **URL**: `{{baseUrl}}/api/auth/register`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### 2. Login User

- **Method**: POST ⚠️ (NOT GET!)
- **URL**: `{{baseUrl}}/api/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Important**: 
- Make sure to select **POST** method from the dropdown
- Select **raw** and **JSON** format for the body
- Copy the `token` from the response for protected routes

### 3. Get Profile (Protected)

- **Method**: GET
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Headers**: 
  - `Authorization: Bearer YOUR_TOKEN_HERE`

### 4. Update Profile (Protected)

- **Method**: PUT
- **URL**: `{{baseUrl}}/api/auth/profile`
- **Headers**: 
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - `Content-Type: application/json`
- **Body** (raw JSON):
```json
{
  "name": "John Updated",
  "phone": "9876543210"
}
```

---

## Testing with JavaScript/Fetch

### 1. Register
```javascript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '1234567890'
  })
});

const data = await response.json();
console.log(data);
```

### 2. Login
```javascript
const response = await fetch('http://localhost:3001/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
const token = data.data.token;
console.log('Token:', token);
```

### 3. Get Profile (Protected)
```javascript
const response = await fetch('http://localhost:3001/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data);
```

### 4. Update Profile (Protected)
```javascript
const response = await fetch('http://localhost:3001/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: 'John Updated',
    phone: '9876543210'
  })
});

const data = await response.json();
console.log(data);
```

---

## Common Error Responses

### 400 Bad Request - Missing Fields
```json
{
  "success": false,
  "message": "Please provide all required fields: name, email, password, phone"
}
```

### 400 Bad Request - Invalid JSON
```json
{
  "success": false,
  "message": "Invalid JSON format in request body. Please check your JSON syntax.",
  "hint": "Make sure all property names are in double quotes and there are no trailing commas."
}
```

### 401 Unauthorized - Invalid Credentials
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 401 Unauthorized - Missing Token
```json
{
  "success": false,
  "message": "Not authorized. Please provide a valid token."
}
```

### 401 Unauthorized - Expired Token
```json
{
  "success": false,
  "message": "Token has expired. Please login again."
}
```

### 405 Method Not Allowed - Wrong HTTP Method
```json
{
  "success": false,
  "message": "Method Not Allowed. Please use POST method for login.",
  "correctUsage": {
    "method": "POST",
    "url": "/api/auth/login",
    "body": {
      "email": "user@example.com",
      "password": "yourpassword"
    }
  }
}
```

### 409 Conflict - Duplicate Email
```json
{
  "success": false,
  "message": "User with this email already exists"
}
```

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Method Not Allowed" | Use POST for login/register, not GET |
| "Invalid JSON" | Check JSON syntax, use double quotes |
| "Not authorized" | Include `Authorization: Bearer TOKEN` header |
| "Token expired" | Login again to get a new token |
| "User already exists" | Use a different email or login instead |
| Connection refused | Make sure server is running on port 3001 |

---

## Health Check

Test if server is running:
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
