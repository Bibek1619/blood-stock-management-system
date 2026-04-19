# 🔧 JWT Error Fix - Complete Solution

## ❌ Error You're Getting

```
jwt.sign is not a function
TypeError: jwt.sign is not a function
```

## ✅ Solution Applied

I've fixed the import syntax in `backend/src/controllers/accountClaimController.ts`:

**Before (Broken):**
```typescript
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
```

**After (Fixed):**
```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
```

Now it matches your working `authController.ts` exactly.

---

## 🚀 How to Apply the Fix

### Step 1: Restart Backend Server

The import change requires a server restart:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### Step 2: Test the Fix

Try the account claiming again:

1. Go to: `http://localhost:3000/claim-account`
2. Enter phone/email: `aaa@gmail.com`
3. Get verification code (check console)
4. Enter code: `732953`
5. Set password: `1234567`
6. Name: `bibek wagle`
7. Click "Claim Account"

**Should work now!** ✅

---

## 🧪 Quick Test

You can test if the API works:

```bash
# Test 1: Check if account exists
curl -X GET "http://localhost:3001/api/account-claim/check?phone=1234567890"

# Should return: {"status":"success","data":{"exists":false}}
```

If this works, the JWT fix is successful!

---

## 🔍 Why This Happened

Your project uses ES modules (`"type": "module"` in package.json), so:

- ✅ **Correct:** `import jwt from "jsonwebtoken"`
- ❌ **Wrong:** `import * as jwt from "jsonwebtoken"`

The `* as` syntax doesn't work with default exports in ES modules.

---

## 🎯 Verification

After restarting the server, you should see:

```bash
✅ Database connected
🚀 Server running: http://localhost:3001
🌐 API Base: http://localhost:3001/api
```

And no JWT errors in the console.

---

## 📝 Files Fixed

- ✅ `backend/src/controllers/accountClaimController.ts` - Fixed JWT import

**No other changes needed!**

---

## 🆘 If Still Not Working

1. **Make sure server restarted:**
   ```bash
   cd backend
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Check console for errors:**
   - Should see "Server running" message
   - No import errors

3. **Test simple endpoint:**
   ```bash
   curl http://localhost:3001/health
   # Should return: {"status":"ok","message":"Server is running 🚀"}
   ```

4. **Check dependencies:**
   ```bash
   cd backend
   npm list jsonwebtoken bcryptjs
   # Should show both packages installed
   ```

---

## ✅ Expected Result

After the fix + server restart:

1. ✅ Account claiming works
2. ✅ JWT tokens generated correctly
3. ✅ No more "jwt.sign is not a function" errors
4. ✅ Users can claim accounts and login

**The duplicate prevention system should work perfectly!** 🎉

---

## 💡 Pro Tip

Always restart the development server after changing imports or adding new files. The `tsx watch` might not catch all changes, especially import syntax changes.

**Happy coding!** 🚀