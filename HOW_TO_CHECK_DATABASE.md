# 🔍 How to Check if Database is Connected

## ⚡ Quick Check Commands

### Method 1: Prisma DB Pull (Easiest)
```bash
cd backend
npx prisma db pull
```

**Results:**
- ✅ **Connected**: "Introspected X models and wrote them into prisma/schema.prisma"
- ❌ **Not Connected**: "Can't reach database server at localhost:5432"

---

### Method 2: Direct PostgreSQL Connection
```bash
psql -U postgres -d bloodbank
```

**Results:**
- ✅ **Connected**: Opens prompt `bloodbank=#`
- ❌ **Not Connected**: "connection refused" or "command not found"

---

### Method 3: Check PostgreSQL Service

**Windows PowerShell:**
```powershell
Get-Service -Name "*postgres*"
```

**Results:**
- ✅ **Running**: Shows service with Status = "Running"
- ❌ **Not Running**: No results or Status = "Stopped"

---

### Method 4: Check Port 5432

**Windows:**
```bash
netstat -ano | findstr :5432
```

**Results:**
- ✅ **Listening**: Shows "LISTENING" on port 5432
- ❌ **Not Listening**: No output

---

### Method 5: Prisma Studio (Visual)
```bash
cd backend
npx prisma generate
npx prisma studio
```

**Results:**
- ✅ **Connected**: Opens http://localhost:5555 with database tables
- ❌ **Not Connected**: Error about connection

---

## 📊 Your Current Status

I just tested your database and here's what I found:

```
❌ Database: NOT CONNECTED
❌ PostgreSQL: NOT INSTALLED/NOT RUNNING
❌ Port 5432: NOT LISTENING
```

**Error Message:**
```
Can't reach database server at `localhost:5432`
```

**This means:** PostgreSQL is not running on your computer.

---

## 🚀 Fix It Now (Choose One)

### Option 1: Docker (Fastest - 2 Minutes) ⭐ RECOMMENDED

```bash
# 1. Install Docker Desktop
# Download: https://www.docker.com/products/docker-desktop

# 2. Run PostgreSQL
docker run --name bloodbank-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bloodbank -p 5432:5432 -d postgres:16

# 3. Verify it's running
docker ps

# 4. Generate Prisma client
cd backend
npx prisma generate

# 5. Run migrations
npx prisma migrate dev

# 6. Test connection
npx prisma db pull
```

✅ **Should now show**: "Introspected X models..."

---

### Option 2: Install PostgreSQL Locally

```bash
# 1. Download PostgreSQL
# https://www.postgresql.org/download/windows/

# 2. Install (remember your password!)

# 3. Create database
psql -U postgres
CREATE DATABASE bloodbank;
\q

# 4. Update backend/.env
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/bloodbank"

# 5. Generate Prisma client
cd backend
npx prisma generate

# 6. Run migrations
npx prisma migrate dev

# 7. Test connection
npx prisma db pull
```

---

### Option 3: Cloud Database (Free)

**Supabase:**
```bash
# 1. Go to https://supabase.com
# 2. Create free account
# 3. Create new project
# 4. Copy connection string from Settings → Database

# 5. Update backend/.env with Supabase URL

# 6. Generate Prisma client
cd backend
npx prisma generate

# 7. Run migrations
npx prisma migrate deploy

# 8. Test connection
npx prisma db pull
```

---

## ✅ After Setup - Verify Everything Works

Run these commands in order:

```bash
# 1. Test Prisma connection
cd backend
npx prisma db pull
# Should show: "Introspected X models..."

# 2. Open Prisma Studio
npx prisma studio
# Should open browser at localhost:5555

# 3. Start backend
npm run dev
# Should show: "🚀 Server running on http://localhost:3001"

# 4. Test health endpoint
curl http://localhost:3001/health
# Should return: {"status":"ok","message":"Blood Donation API is running"}

# 5. Test registration
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"password123"}'
# Should return user data
```

All should work without errors! ✅

---

## 🎯 Summary

**To check database connection:**
```bash
cd backend
npx prisma db pull
```

**Your status:** ❌ Not Connected

**Next step:** Choose Option 1 (Docker) - it's the easiest!

**After fixing:**
- ✅ Backend will start without errors
- ✅ Registration will work
- ✅ Login will work
- ✅ All features will work

---

## 📝 Quick Reference

| Command | Purpose |
|---------|---------|
| `npx prisma db pull` | Test connection |
| `npx prisma studio` | Visual database browser |
| `npx prisma generate` | Generate Prisma client |
| `npx prisma migrate dev` | Run migrations |
| `psql -U postgres -d bloodbank` | Direct connection |
| `docker ps` | Check Docker containers |

---

**Recommended: Use Docker - it's the fastest way!** 🐳

**Docker command:**
```bash
docker run --name bloodbank-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=bloodbank -p 5432:5432 -d postgres:16
```
