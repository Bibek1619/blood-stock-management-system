# 🔧 Troubleshooting 404 Errors on Analytics Routes

## Problem
Getting 404 errors when accessing analytics endpoints:
```
GET /analytics/donor-retention 404
GET /analytics/donor-activity 404
```

## Root Cause
The backend server was running BEFORE the analytics routes were added. Node.js doesn't hot-reload route changes automatically, so the server needs to be restarted.

---

## ✅ Solution: Restart Backend Server

### Step 1: Stop the Backend
In the terminal running the backend, press:
```
Ctrl + C
```

Wait for the server to fully stop.

### Step 2: Restart the Backend
```bash
cd d:\blood\backend
npm run dev
```

### Step 3: Verify Server Started
You should see:
```
✅ Database connected
🚀 Server running: http://localhost:3001
🌐 API Base: http://localhost:3001/api
```

### Step 4: Test Analytics Routes
Open a new terminal and run:
```bash
cd d:\blood\backend
node test-analytics-routes.js
```

Or test manually in browser:
```
http://localhost:3001/api/analytics/overview
```

You should see JSON data (even if empty), NOT a 404 error.

---

## 🧪 Manual Testing

### Test 1: Health Check
```bash
curl http://localhost:3001/health
```
Expected: `{"status":"ok","message":"Server is running 🚀"}`

### Test 2: Analytics Overview
```bash
curl http://localhost:3001/api/analytics/overview
```
Expected: JSON with analytics data (or empty arrays if no data yet)

### Test 3: Donor Retention
```bash
curl http://localhost:3001/api/analytics/donor-retention
```
Expected: JSON with retention metrics

---

## 🔍 If Still Getting 404

### Check 1: Verify Routes File Exists
```bash
dir src\routes\analyticsRoutes.ts
```
Should show the file exists.

### Check 2: Verify Controller Exists
```bash
dir src\controllers\analyticsController.ts
```
Should show the file exists.

### Check 3: Check for TypeScript Errors
```bash
npx tsc --noEmit
```
Should show no errors.

### Check 4: Check Server Logs
Look at the terminal running the backend. You should see:
```
GET /api/analytics/overview 200
```
NOT:
```
GET /api/analytics/overview 404
```

### Check 5: Verify Port
Make sure backend is running on port 3001:
```bash
netstat -ano | findstr :3001
```
Should show a process listening on port 3001.

---

## 🚨 Common Issues

### Issue 1: Backend Not Restarted
**Symptom**: 404 on all analytics routes
**Solution**: Stop and restart backend server

### Issue 2: Wrong Port
**Symptom**: Connection refused
**Solution**: Check backend is on port 3001, frontend expects 3001

### Issue 3: TypeScript Compilation Error
**Symptom**: Server won't start
**Solution**: Run `npx tsc --noEmit` to see errors

### Issue 4: Missing Dependencies
**Symptom**: Module not found errors
**Solution**: Run `npm install` in backend directory

### Issue 5: Database Connection Error
**Symptom**: Server starts but crashes on first request
**Solution**: Check `.env` file has correct DATABASE_URL

---

## 📋 Complete Restart Checklist

- [ ] Stop backend server (Ctrl+C)
- [ ] Wait 2-3 seconds for full shutdown
- [ ] Run `npm run dev` in backend directory
- [ ] Wait for "Server running" message
- [ ] Test health endpoint: `http://localhost:3001/health`
- [ ] Test analytics endpoint: `http://localhost:3001/api/analytics/overview`
- [ ] Refresh frontend dashboard
- [ ] Check browser console for errors

---

## 🎯 Expected Behavior After Fix

### Backend Terminal Should Show:
```
GET /api/analytics/overview 200 50ms
GET /api/analytics/donor-retention 200 30ms
GET /api/analytics/donor-activity 200 25ms
```

### Frontend Should Show:
- Analytics dashboard loads without errors
- Charts display (even if empty)
- No 404 errors in browser console

### Browser Network Tab Should Show:
```
GET http://localhost:3001/api/analytics/overview
Status: 200 OK
```

---

## 💡 Pro Tips

1. **Use nodemon for auto-restart**: Install `nodemon` to auto-restart on file changes
   ```bash
   npm install -D nodemon
   # Update package.json script: "dev": "nodemon --exec tsx src/index.ts"
   ```

2. **Check logs**: Always check backend terminal for actual errors

3. **Clear cache**: Sometimes browser caches 404 responses. Hard refresh (Ctrl+Shift+R)

4. **Test API first**: Always test API endpoints directly before testing frontend

5. **Use Postman**: Install Postman or Thunder Client for easier API testing

---

## 🆘 Still Not Working?

If you've tried everything above and still getting 404:

1. **Check the exact error message** in backend terminal
2. **Share the backend startup logs** - what does it print when starting?
3. **Verify the route registration** in `src/index.ts`
4. **Check for typos** in route paths
5. **Try a different endpoint** - does `/api/donors` work?

---

## ✅ Success Indicators

You'll know it's working when:
- ✅ Backend shows 200 status codes for analytics routes
- ✅ Frontend dashboard loads without errors
- ✅ Browser console shows no 404 errors
- ✅ Charts display (even if showing "No data")
- ✅ API returns JSON (not HTML 404 page)

---

**Remember**: The most common cause is simply forgetting to restart the backend server after adding new routes! 🔄
