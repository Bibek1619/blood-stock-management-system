# Authentication System Implementation

## Overview
This document describes the clean and production-ready authentication system for the Blood Donation Management System.

## Architecture

### File Structure
```
backend/src/
├── index.ts                          # Main server entry point
├── controllers/
│   └── authController.ts             # Authentication business logic
├── routes/
│   └── authRoutes.ts                 # Auth route definitions
└── middleware/
    ├── authMiddleware.ts             # JWT verification & authorization
    ├── errorHandler.ts               # Global error handling
    └── asyncHandler.ts               # Async error wrapper
```

## Features

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Access**: Public
- **Validations**:
  - Required fields: name, email, password, phone
  - Email format validation
  - Password minimum 6 characters
  - Duplicate email check
- **Security**: Passwords hashed with bcrypt (10 salt rounds)
- **Response**: User object + JWT token

### 2. User Login
- **Endpoint**: `POST /api/auth/login`
- **Access**: Public
- **Validations**:
  - Required fields: email, password
  - Email case-insensitive
- **Security**: Bcrypt password comparison
- **Response**: User object + JWT token

### 3. Get User Profile
- **Endpoint**: `GET /api/auth/profile`
- **Access**: Private (requires JWT)
- **Response**: Current user profile data

### 4. Update User Profile
- **Endpoint**: `PUT /api/auth/profile`
- **Access**: Private (requires JWT)
- **Validations**: At least one field required
- **Updatable Fields**: name, phone
- **Response**: Updated user object

## Security Features

### JWT Token
- **Algorithm**: HS256
- **Expiry**: 30 days
- **Payload**: User ID only
- **Secret**: Stored in environment variable

### Password Security
- Hashed using bcrypt
- Salt rounds: 10
- Never returned in API responses

### Middleware Protection
- `protect`: Verifies JWT token and attaches user to request
- `authorize`: Role-based access control
- Detailed error messages for debugging

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (invalid/missing token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 500 | Internal Server Error |

## Environment Variables

Required in `.env`:
```env
JWT_SECRET=your_secret_key_here
PORT=3001
NODE_ENV=development
DATABASE_URL=your_database_url
FRONTEND_URL=http://localhost:3000
```

## Usage Examples

### Register User
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "phone": "1234567890"
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

### Get Profile (Protected)
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Profile (Protected)
```bash
curl -X PUT http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Updated",
    "phone": "9876543210"
  }'
```

## Error Handling

### Global Error Handler
- Catches all errors in the application
- Provides consistent error responses
- Logs unexpected errors with context
- Handles Prisma database errors
- Environment-aware error messages

### Token Errors
- **Expired Token**: "Token has expired. Please login again."
- **Invalid Token**: "Invalid token. Please login again."
- **Missing Token**: "Not authorized. Please provide a valid token."

## Best Practices Implemented

1. **Type Safety**: Full TypeScript with proper types
2. **Async/Await**: Modern async handling
3. **Input Validation**: Comprehensive validation on all inputs
4. **Error Handling**: Consistent error responses
5. **Security**: JWT tokens, password hashing, CORS configuration
6. **Code Organization**: Separation of concerns (routes, controllers, middleware)
7. **Documentation**: JSDoc comments on all functions
8. **Logging**: Structured error logging
9. **Graceful Shutdown**: Proper cleanup on server termination
10. **Health Check**: `/health` endpoint for monitoring

## Testing

Use the provided Postman collection:
- `Blood_Donation_Auth_API.postman_collection.json`

Or refer to:
- `POSTMAN_TESTING_GUIDE.md`
- `POSTMAN_TEST_DATA.md`

## Future Enhancements

Potential improvements:
- [ ] Refresh token mechanism
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Rate limiting
- [ ] Account lockout after failed attempts
- [ ] Two-factor authentication
- [ ] OAuth integration
- [ ] Session management
- [ ] Audit logging
