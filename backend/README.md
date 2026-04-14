# Blood Donation Backend API

Simple REST API for blood donation management system.

## Quick Start

```bash
# Install dependencies
npm install

# Setup database
npm run migrate
npm run generate

# Start server
npm run dev
```

Server runs at: `http://localhost:3001`

## Test Connection

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Blood Donation API is running",
  "database": "connected"
}
```

## Environment Variables

Create `.env` file:

```env
DATABASE_URL="your_postgres_connection_string"
PORT=3001
```

## API Endpoints

Base URL: `http://localhost:3001/api`

- `/users` - User management
- `/donors` - Donor profiles
- `/donations` - Donation records
- `/blood-stock` - Blood inventory
- `/blood-issues` - Blood distribution
- `/events` - Event management
- `/certificates` - Certificate generation

## Tech Stack

- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod validation

## Scripts

```bash
npm run dev       # Development with hot reload
npm run build     # Build for production
npm start         # Run production build
npm run migrate   # Run database migrations
npm run generate  # Generate Prisma client
npm run studio    # Open Prisma Studio
```
