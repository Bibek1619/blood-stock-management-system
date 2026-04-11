# Zod Validation Documentation

All API endpoints now include Zod validation for request bodies. This ensures data integrity and provides clear error messages.

## Validation Rules

### User Validation

#### Create User
```typescript
{
  email: string (valid email format)
  password: string (min 6 characters)
  name: string (min 2 characters)
  phone: string (min 10 characters)
  role?: "DONOR" | "ADMIN" | "STAFF" (default: "DONOR")
}
```

#### Update User
All fields optional, same validation rules as create.

### Donor Validation

#### Create Donor
```typescript
{
  userId: string (valid CUID)
  bloodGroup: "A_POSITIVE" | "A_NEGATIVE" | "B_POSITIVE" | "B_NEGATIVE" | 
              "AB_POSITIVE" | "AB_NEGATIVE" | "O_POSITIVE" | "O_NEGATIVE"
  location: string (min 2 characters)
  city?: string
  address?: string
  dateOfBirth?: string (ISO datetime)
  weight?: number (positive)
  latitude?: number (-90 to 90)
  longitude?: number (-180 to 180)
  medicalNotes?: string
}
```

#### Update Donor
All fields optional, same validation rules as create, plus:
```typescript
{
  isEligible?: boolean
}
```

### Donation Validation

#### Create Donation
```typescript
{
  userId: string (valid CUID)
  bloodGroup: BloodGroup enum
  units?: number (positive integer, default: 1)
  location: string (min 2 characters)
  donationType?: "PERSON" | "ORGANIZATION" (default: "PERSON")
  status?: "PENDING" | "COMPLETED" | "CANCELLED" | "REJECTED" (default: "COMPLETED")
  notes?: string
  contact?: string
}
```

### Blood Pack Validation

#### Create Blood Pack
```typescript
{
  packCode: string (min 3 characters)
  bloodGroup: BloodGroup enum
  donorId?: string (valid CUID)
  collectionDate: string (ISO datetime)
  expiryDate: string (ISO datetime)
  storageLocation?: string
  status?: "AVAILABLE" | "USED" | "EXPIRED" | "RESERVED" (default: "AVAILABLE")
}
```

### Blood Issue Validation

#### Create Blood Issue
```typescript
{
  issueCode: string (min 3 characters)
  recipientName: string (min 2 characters)
  recipientType?: "PERSON" | "ORGANIZATION" | "HOSPITAL" (default: "PERSON")
  bloodGroup: BloodGroup enum
  unitsRequested: number (positive integer)
  contact: string (min 10 characters)
  issuedBy?: string (valid CUID)
  bloodPackIds: string[] (array of valid CUIDs, min 1 item)
  notes?: string
  status?: "PENDING" | "COMPLETED" | "CANCELLED" (default: "COMPLETED")
}
```

### Event Validation

#### Create Event
```typescript
{
  title: string (min 3 characters)
  description?: string
  location: string (min 2 characters)
  eventDate: string (ISO datetime)
  capacity?: number (positive integer)
  status?: "UPCOMING" | "RUNNING" | "COMPLETED" | "CANCELLED" (default: "UPCOMING")
}
```

#### Register Participant
```typescript
{
  eventId: string (valid CUID)
  userId: string (valid CUID)
}
```

#### Register Volunteer
```typescript
{
  eventId: string (valid CUID)
  userId: string (valid CUID)
  role?: string
}
```

### Certificate Validation

#### Create Certificate
```typescript
{
  certificateNumber: string (min 3 characters)
  type?: "DONATION" | "VOLUNTEER" (default: "DONATION")
  userId: string (valid CUID)
  recipientName: string (min 2 characters)
  eventTitle?: string
  volunteerId?: string
}
```

## Error Response Format

When validation fails, the API returns a 400 Bad Request with detailed error messages:

```json
{
  "status": "error",
  "message": "email: Invalid email address, password: Password must be at least 6 characters"
}
```

## Example Valid Requests

### Create User
```json
POST /api/users
{
  "email": "john@example.com",
  "password": "secure123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "DONOR"
}
```

### Create Donor
```json
POST /api/donors
{
  "userId": "clx1234567890abcdef",
  "bloodGroup": "A_POSITIVE",
  "location": "New York",
  "city": "NYC",
  "weight": 70,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Create Donation
```json
POST /api/donations
{
  "userId": "clx1234567890abcdef",
  "bloodGroup": "O_POSITIVE",
  "units": 1,
  "location": "City Blood Bank",
  "donationType": "PERSON",
  "contact": "+1234567890"
}
```

### Create Blood Pack
```json
POST /api/blood-stock
{
  "packCode": "BP-2024-001",
  "bloodGroup": "AB_POSITIVE",
  "donorId": "clx1234567890abcdef",
  "collectionDate": "2024-01-15T10:00:00Z",
  "expiryDate": "2024-02-15T10:00:00Z",
  "storageLocation": "Freezer A1"
}
```

### Create Blood Issue
```json
POST /api/blood-issues
{
  "issueCode": "BI-2024-001",
  "recipientName": "City Hospital",
  "recipientType": "HOSPITAL",
  "bloodGroup": "O_NEGATIVE",
  "unitsRequested": 2,
  "contact": "+1234567890",
  "bloodPackIds": ["clx111", "clx222"]
}
```

### Create Event
```json
POST /api/events
{
  "title": "Blood Donation Camp 2024",
  "description": "Annual community blood drive",
  "location": "Community Center",
  "eventDate": "2024-06-15T09:00:00Z",
  "capacity": 100
}
```

## Benefits of Zod Validation

1. **Type Safety**: TypeScript types are automatically inferred from schemas
2. **Runtime Validation**: Catches invalid data before it reaches the database
3. **Clear Error Messages**: Provides specific feedback about what's wrong
4. **Consistent Validation**: Same rules across all endpoints
5. **Easy Maintenance**: Centralized validation logic in one file

## Using Validation in Code

All validation schemas are exported from `src/validators/schemas.ts` and can be imported:

```typescript
import { createUserSchema, CreateUserInput } from "../validators/schemas";

// Use in routes
router.post("/", validateRequest(createUserSchema), asyncHandler(controller.create));

// Use in controllers for type safety
const createUser = async (req: Request, res: Response) => {
  const data: CreateUserInput = req.body; // Type-safe!
  // ...
};
```
