# Blood Donation Management System - Backend

A comprehensive REST API for managing blood donation operations, built with Express.js, TypeScript, and Prisma.

## Features

- User management with role-based access (Donor, Admin, Staff)
- Donor registration and profile management
- Blood donation tracking
- Blood stock inventory management
- Blood issuance/distribution system
- Event management (donation camps, volunteer programs)
- Certificate generation for donors and volunteers
- Geolocation support for donor search
- Comprehensive Zod validation for all API endpoints
- Type-safe request/response handling

## Tech Stack

- Node.js & Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- Zod (validation)
- CORS enabled

## Project Structure

```
backend/
├── src/
│   ├── controllers/       # Request handlers
│   │   ├── userController.ts
│   │   ├── donorController.ts
│   │   ├── donationController.ts
│   │   ├── bloodStockController.ts
│   │   ├── bloodIssueController.ts
│   │   ├── eventController.ts
│   │   └── certificateController.ts
│   ├── routes/           # API routes
│   │   ├── userRoutes.ts
│   │   ├── donorRoutes.ts
│   │   ├── donationRoutes.ts
│   │   ├── bloodStockRoutes.ts
│   │   ├── bloodIssueRoutes.ts
│   │   ├── eventRoutes.ts
│   │   ├── certificateRoutes.ts
│   │   └── index.ts
│   ├── middleware/       # Custom middleware
│   │   ├── errorHandler.ts
│   │   ├── asyncHandler.ts
│   │   └── validateRequest.ts
│   ├── validators/       # Zod validation schemas
│   │   └── schemas.ts
│   └── index.ts          # App entry point
├── prisma/
│   └── schema.prisma     # Database schema
├── lib/
│   └── prisma.ts         # Prisma client
└── generated/            # Prisma generated files

```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/blood_donation"
PORT=3001
```

3. Run database migrations:
```bash
npm run migrate
```

4. Generate Prisma client:
```bash
npm run generate
```

### Running the Server

Development mode with hot reload:
```bash
npm run dev
```

Build for production:
```bash
npm run build
npm start
```

Open Prisma Studio (database GUI):
```bash
npm run studio
```

## API Endpoints

Base URL: `http://localhost:3001/api`

### Available Routes

- `/api/users` - User management
- `/api/donors` - Donor profiles
- `/api/donations` - Donation records
- `/api/blood-stock` - Blood inventory
- `/api/blood-issues` - Blood distribution
- `/api/events` - Event management
- `/api/certificates` - Certificate generation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint documentation.

See [VALIDATION.md](./VALIDATION.md) for validation rules and examples.

## Database Schema

The system includes the following main entities:

- **User**: Authentication and user profiles
- **Donor**: Donor-specific information (blood group, location, eligibility)
- **Donation**: Blood donation records
- **BloodPack**: Individual blood pack inventory
- **BloodIssue**: Blood distribution/issuance records
- **Event**: Blood donation camps and events
- **Certificate**: Donation and volunteer certificates

## Error Handling

The API uses a centralized error handling middleware that returns consistent error responses:

```json
{
  "status": "error",
  "message": "Error description"
}
```

## Middleware

- **asyncHandler**: Wraps async route handlers for error handling
- **errorHandler**: Centralized error handling with custom AppError class
- **validateRequest**: Zod-based request validation middleware

## Validation

All API endpoints include comprehensive Zod validation:
- Email format validation
- Required field checks
- Data type validation (strings, numbers, dates)
- Enum validation for status fields
- Custom business rules (min/max values, string lengths)

See [VALIDATION.md](./VALIDATION.md) for complete validation documentation.

## Development

### Adding New Routes

1. Create a controller in `src/controllers/`
2. Create routes in `src/routes/`
3. Register routes in `src/routes/index.ts`
4. Update API documentation

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npm run migrate` to create migration
3. Run `npm run generate` to update Prisma client

## License

MIT
