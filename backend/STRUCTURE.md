# Backend Structure Overview

Complete file structure and organization of the Blood Donation Management System backend.

## Directory Tree

```
backend/
├── src/
│   ├── controllers/              # Business logic handlers
│   │   ├── userController.ts           # User CRUD operations
│   │   ├── donorController.ts          # Donor management
│   │   ├── donationController.ts       # Donation tracking
│   │   ├── bloodStockController.ts     # Blood inventory
│   │   ├── bloodIssueController.ts     # Blood distribution
│   │   ├── eventController.ts          # Event management
│   │   └── certificateController.ts    # Certificate generation
│   │
│   ├── routes/                   # API route definitions
│   │   ├── userRoutes.ts              # /api/users
│   │   ├── donorRoutes.ts             # /api/donors
│   │   ├── donationRoutes.ts          # /api/donations
│   │   ├── bloodStockRoutes.ts        # /api/blood-stock
│   │   ├── bloodIssueRoutes.ts        # /api/blood-issues
│   │   ├── eventRoutes.ts             # /api/events
│   │   ├── certificateRoutes.ts       # /api/certificates
│   │   └── index.ts                   # Route aggregator
│   │
│   ├── middleware/               # Request processing
│   │   ├── errorHandler.ts           # Centralized error handling
│   │   ├── asyncHandler.ts           # Async wrapper
│   │   └── validateRequest.ts        # Zod validation middleware
│   │
│   ├── validators/               # Zod schemas
│   │   └── schemas.ts                # All validation schemas
│   │
│   └── index.ts                  # Application entry point
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
│
├── lib/
│   └── prisma.ts                 # Prisma client instance
│
├── generated/                    # Prisma generated files
│   └── prisma/                   # Auto-generated client
│
├── node_modules/                 # Dependencies
│
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Project dependencies
├── tsconfig.json                 # TypeScript config
├── prisma.config.ts              # Prisma configuration
│
└── Documentation/
    ├── README.md                 # Main documentation
    ├── API_DOCUMENTATION.md      # API endpoints reference
    ├── VALIDATION.md             # Zod validation rules
    ├── EXAMPLES.md               # Usage examples
    ├── QUICKSTART.md             # Quick start guide
    └── STRUCTURE.md              # This file
```

## File Responsibilities

### Controllers (`src/controllers/`)

Each controller handles business logic for a specific domain:

- **userController.ts**: User authentication and profile management
- **donorController.ts**: Donor registration, eligibility, blood group filtering
- **donationController.ts**: Donation records, history tracking
- **bloodStockController.ts**: Blood pack inventory, stock summaries
- **bloodIssueController.ts**: Blood distribution, pack allocation
- **eventController.ts**: Event CRUD, participant/volunteer registration
- **certificateController.ts**: Certificate generation and retrieval

### Routes (`src/routes/`)

Each route file defines HTTP endpoints and applies middleware:

```typescript
// Pattern: routes/{domain}Routes.ts
router.get("/", asyncHandler(controller.getAll));
router.get("/:id", asyncHandler(controller.getById));
router.post("/", validateRequest(schema), asyncHandler(controller.create));
router.put("/:id", validateRequest(schema), asyncHandler(controller.update));
router.delete("/:id", asyncHandler(controller.delete));
```

### Middleware (`src/middleware/`)

- **errorHandler.ts**: Catches all errors, formats responses
- **asyncHandler.ts**: Wraps async functions, passes errors to errorHandler
- **validateRequest.ts**: Validates request body against Zod schema

### Validators (`src/validators/`)

- **schemas.ts**: All Zod validation schemas and TypeScript types

## Data Flow

```
Request
  ↓
Express App (index.ts)
  ↓
Route (routes/*.ts)
  ↓
Validation Middleware (validateRequest)
  ↓
Async Handler (asyncHandler)
  ↓
Controller (controllers/*.ts)
  ↓
Prisma Client (lib/prisma.ts)
  ↓
Database (PostgreSQL)
  ↓
Response
```

## Error Handling Flow

```
Error occurs
  ↓
asyncHandler catches it
  ↓
Passes to errorHandler middleware
  ↓
errorHandler formats response
  ↓
Returns JSON error to client
```

## Validation Flow

```
Request with body
  ↓
validateRequest middleware
  ↓
Zod schema validation
  ↓
Valid? → Continue to controller
  ↓
Invalid? → Throw AppError (400)
  ↓
errorHandler formats validation errors
  ↓
Returns detailed error message
```

## Key Design Patterns

### 1. Separation of Concerns
- Routes: Define endpoints
- Controllers: Business logic
- Middleware: Cross-cutting concerns
- Validators: Data validation

### 2. Error Handling
- Custom AppError class for operational errors
- Centralized error handler
- Async wrapper for clean code

### 3. Validation
- Schema-first approach with Zod
- Type inference for TypeScript
- Reusable validation schemas

### 4. Database Access
- Single Prisma client instance
- Type-safe queries
- Relation loading with `include`

## API Endpoint Structure

```
/api
├── /users
│   ├── GET    /              # List all users
│   ├── GET    /:id           # Get user by ID
│   ├── POST   /              # Create user
│   ├── PUT    /:id           # Update user
│   └── DELETE /:id           # Delete user
│
├── /donors
│   ├── GET    /              # List donors (with filters)
│   ├── GET    /:id           # Get donor by ID
│   ├── POST   /              # Create donor
│   ├── PUT    /:id           # Update donor
│   └── DELETE /:id           # Delete donor
│
├── /donations
│   ├── GET    /              # List donations
│   ├── GET    /:id           # Get donation by ID
│   ├── POST   /              # Create donation
│   ├── PUT    /:id           # Update donation
│   └── DELETE /:id           # Delete donation
│
├── /blood-stock
│   ├── GET    /              # List blood packs
│   ├── GET    /summary       # Get stock summary
│   ├── GET    /:id           # Get blood pack by ID
│   ├── POST   /              # Create blood pack
│   ├── PUT    /:id           # Update blood pack
│   └── DELETE /:id           # Delete blood pack
│
├── /blood-issues
│   ├── GET    /              # List blood issues
│   ├── GET    /:id           # Get blood issue by ID
│   ├── POST   /              # Create blood issue
│   ├── PUT    /:id           # Update blood issue
│   └── DELETE /:id           # Delete blood issue
│
├── /events
│   ├── GET    /              # List events
│   ├── GET    /:id           # Get event by ID
│   ├── POST   /              # Create event
│   ├── PUT    /:id           # Update event
│   ├── DELETE /:id           # Delete event
│   ├── POST   /participants  # Register participant
│   └── POST   /volunteers    # Register volunteer
│
└── /certificates
    ├── GET    /                      # List certificates
    ├── GET    /:id                   # Get certificate by ID
    ├── GET    /number/:certNumber    # Get by certificate number
    ├── POST   /                      # Create certificate
    └── DELETE /:id                   # Delete certificate
```

## Database Models

### Core Entities
- User (authentication, profiles)
- Donor (donor-specific data)
- Donation (donation records)
- BloodPack (inventory items)
- BloodIssue (distribution records)
- Event (blood donation events)
- Certificate (donor/volunteer certificates)

### Junction Tables
- EventParticipant (event ↔ donor)
- EventVolunteer (event ↔ volunteer)
- BloodIssueItem (blood issue ↔ blood pack)

## Environment Variables

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/db"
PORT=3001
```

## NPM Scripts

```json
{
  "dev": "tsx watch src/index.ts",      // Development with hot reload
  "build": "tsc",                        // Build TypeScript
  "start": "node dist/index.js",         // Run production
  "migrate": "prisma migrate dev",       // Run migrations
  "generate": "prisma generate",         // Generate Prisma client
  "studio": "prisma studio"              // Open Prisma Studio
}
```

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Validation**: Zod
- **CORS**: cors middleware

## Best Practices Implemented

✅ Type safety with TypeScript
✅ Input validation with Zod
✅ Centralized error handling
✅ Async/await pattern
✅ RESTful API design
✅ Separation of concerns
✅ Environment-based configuration
✅ Database migrations
✅ Comprehensive documentation

## Adding New Features

### 1. Add a new endpoint:

1. Create controller in `src/controllers/`
2. Create validation schema in `src/validators/schemas.ts`
3. Create routes in `src/routes/`
4. Register routes in `src/routes/index.ts`
5. Update documentation

### 2. Modify database:

1. Update `prisma/schema.prisma`
2. Run `npm run migrate`
3. Run `npm run generate`
4. Update controllers as needed

### 3. Add middleware:

1. Create in `src/middleware/`
2. Apply in routes or `src/index.ts`
3. Document usage

## Security Considerations

⚠️ **Current Implementation**:
- No authentication/authorization
- Passwords stored in plain text
- No rate limiting
- No input sanitization beyond validation

🔒 **Production Requirements**:
- Add JWT authentication
- Hash passwords (bcrypt)
- Implement role-based access control
- Add rate limiting
- Enable HTTPS
- Add request logging
- Implement CSRF protection
