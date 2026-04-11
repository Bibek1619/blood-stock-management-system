# Quick Start Guide

Get your Blood Donation Management API up and running in 5 minutes!

## Prerequisites

- Node.js v18+ installed
- PostgreSQL database running
- Terminal/Command prompt

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Configure Environment

Create a `.env` file in the backend directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/blood_donation"
PORT=3001
```

Replace `username`, `password`, and database name with your PostgreSQL credentials.

## Step 3: Setup Database

Run migrations to create all tables:

```bash
npm run migrate
```

Generate Prisma client:

```bash
npm run generate
```

## Step 4: Start the Server

```bash
npm run dev
```

You should see:
```
🚀 Server running on http://localhost:3001
```

## Step 5: Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Blood Donation API is running"
}
```

## Step 6: Create Your First User

```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bloodbank.com",
    "password": "admin123",
    "name": "Admin User",
    "phone": "+1234567890",
    "role": "ADMIN"
  }'
```

## Step 7: Explore the API

### View all available endpoints:

- Users: `http://localhost:3001/api/users`
- Donors: `http://localhost:3001/api/donors`
- Donations: `http://localhost:3001/api/donations`
- Blood Stock: `http://localhost:3001/api/blood-stock`
- Blood Issues: `http://localhost:3001/api/blood-issues`
- Events: `http://localhost:3001/api/events`
- Certificates: `http://localhost:3001/api/certificates`

### Get blood stock summary:

```bash
curl http://localhost:3001/api/blood-stock/summary
```

## Useful Commands

### Development
```bash
npm run dev          # Start with hot reload
npm run build        # Build for production
npm start            # Run production build
```

### Database
```bash
npm run migrate      # Run migrations
npm run generate     # Generate Prisma client
npm run studio       # Open Prisma Studio (GUI)
```

## Next Steps

1. Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for all endpoints
2. Check [VALIDATION.md](./VALIDATION.md) for validation rules
3. See [EXAMPLES.md](./EXAMPLES.md) for more usage examples
4. Open Prisma Studio to view your data: `npm run studio`

## Troubleshooting

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env file
- Ensure database exists: `createdb blood_donation`

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 3001

### Migration Errors
- Drop and recreate database if needed
- Run `npm run migrate` again

### Module Not Found
- Run `npm install` again
- Run `npm run generate` to regenerate Prisma client

## Development Tools

### Prisma Studio
Visual database browser:
```bash
npm run studio
```
Opens at `http://localhost:5555`

### API Testing Tools
- cURL (command line)
- Postman (GUI)
- Thunder Client (VS Code extension)
- REST Client (VS Code extension)

## Project Structure Overview

```
backend/
├── src/
│   ├── controllers/    # Business logic
│   ├── routes/         # API endpoints
│   ├── middleware/     # Request processing
│   ├── validators/     # Zod schemas
│   └── index.ts        # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── lib/
│   └── prisma.ts       # DB client
└── .env                # Configuration
```

## Support

For issues or questions:
1. Check the documentation files
2. Review error messages carefully
3. Verify your .env configuration
4. Check database connection

Happy coding! 🚀
