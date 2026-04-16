# Authentication API Quick Reference

## 🚀 Quick Start

1. **Start Server**: `npm run dev`
2. **Test Server**: `node test-auth.js`
3. **Health Check**: `curl http://localhost:3001/health`

---

## 📋 API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | ❌ | Register new user |
| `/api/auth/login` | POST | ❌ | Login user |
| `/api/auth/profile` | GET | ✅ | Get user profile |
| `/api/auth/profile` | PUT | ✅ | Update profile |

---

## 🔑 Request Examples

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
```

### Update Profile (Protected)
```bash
PUT /api/auth/profile
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "9876543210"
}
```

---

## ✅ Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": { ... },
    "token": "jwt_token"
  }
}
```

---

## ❌ Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 400 | Invalid JSON | Check JSON syntax |
| 401 | Not authorized | Add Bearer token |
| 401 | Token expired | Login again |
| 405 | Method not allowed | Use POST for login/register |
| 409 | User exists | Use different email |

---

## 🔧 Troubleshooting

### "Method Not Allowed"
- ✅ Use **POST** for `/api/auth/login`
- ✅ Use **POST** for `/api/auth/register`
- ❌ Don't use GET for these endpoints

### "Invalid JSON"
- ✅ Use double quotes: `"name"`
- ✅ Proper format: `{"key": "value"}`
- ❌ No trailing commas
- ❌ No single quotes

### "Not authorized"
- ✅ Include header: `Authorization: Bearer TOKEN`
- ✅ Get token from login/register response
- ❌ Don't forget "Bearer " prefix

### "Connection refused"
- ✅ Start server: `npm run dev`
- ✅ Check port 3001 is free
- ✅ Verify DATABASE_URL in .env

---

## 🧪 Testing Tools

### cURL
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Node.js Test Script
```bash
node test-auth.js
```

### Postman
Import: `Blood_Donation_Auth_API.postman_collection.json`

---

## 📚 Documentation Files

- `AUTH_IMPLEMENTATION.md` - Complete implementation details
- `AUTH_TESTING_GUIDE.md` - Detailed testing guide
- `AUTH_QUICK_REFERENCE.md` - This file
- `test-auth.js` - Automated test script

---

## 🔐 Security Notes

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens expire in 30 days
- Email stored in lowercase
- Input validation on all endpoints
- CORS enabled for frontend

---

## 💡 Tips

1. Save token from login response
2. Use token in Authorization header for protected routes
3. Token format: `Bearer YOUR_TOKEN_HERE`
4. Check server logs for detailed errors
5. Use test script for quick validation
