# API Usage Examples

## Testing the API with cURL

### 1. Health Check
```bash
curl http://localhost:3001/health
```

### 2. Create a User
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "secure123",
    "name": "John Doe",
    "phone": "+1234567890",
    "role": "DONOR"
  }'
```

### 3. Get All Users
```bash
curl http://localhost:3001/api/users
```

### 4. Create a Donor Profile
```bash
curl -X POST http://localhost:3001/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx1234567890abcdef",
    "bloodGroup": "A_POSITIVE",
    "location": "New York",
    "city": "NYC",
    "address": "123 Main Street",
    "weight": 70,
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

### 5. Search Donors by Blood Group
```bash
curl "http://localhost:3001/api/donors?bloodGroup=A_POSITIVE&isEligible=true"
```

### 6. Create a Donation
```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx1234567890abcdef",
    "bloodGroup": "O_POSITIVE",
    "units": 1,
    "location": "City Blood Bank",
    "donationType": "PERSON",
    "contact": "+1234567890",
    "notes": "Regular donation"
  }'
```

### 7. Create a Blood Pack
```bash
curl -X POST http://localhost:3001/api/blood-stock \
  -H "Content-Type: application/json" \
  -d '{
    "packCode": "BP-2024-001",
    "bloodGroup": "AB_POSITIVE",
    "donorId": "clx1234567890abcdef",
    "collectionDate": "2024-01-15T10:00:00Z",
    "expiryDate": "2024-02-15T10:00:00Z",
    "storageLocation": "Freezer A1"
  }'
```

### 8. Get Blood Stock Summary
```bash
curl http://localhost:3001/api/blood-stock/summary
```

### 9. Create a Blood Issue
```bash
curl -X POST http://localhost:3001/api/blood-issues \
  -H "Content-Type: application/json" \
  -d '{
    "issueCode": "BI-2024-001",
    "recipientName": "City Hospital",
    "recipientType": "HOSPITAL",
    "bloodGroup": "O_NEGATIVE",
    "unitsRequested": 2,
    "contact": "+1234567890",
    "bloodPackIds": ["clx111", "clx222"],
    "notes": "Emergency request"
  }'
```

### 10. Create an Event
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Blood Donation Camp 2024",
    "description": "Annual community blood drive",
    "location": "Community Center",
    "eventDate": "2024-06-15T09:00:00Z",
    "capacity": 100
  }'
```

### 11. Register Event Participant
```bash
curl -X POST http://localhost:3001/api/events/participants \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "clx_event_id",
    "userId": "clx_user_id"
  }'
```

### 12. Create a Certificate
```bash
curl -X POST http://localhost:3001/api/certificates \
  -H "Content-Type: application/json" \
  -d '{
    "certificateNumber": "CERT-2024-001",
    "type": "DONATION",
    "userId": "clx1234567890abcdef",
    "recipientName": "John Doe",
    "eventTitle": "Blood Donation Camp 2024"
  }'
```

## Validation Error Examples

### Invalid Email
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "123",
    "name": "J",
    "phone": "123"
  }'
```

Response:
```json
{
  "status": "error",
  "message": "email: Invalid email address, password: Password must be at least 6 characters, name: Name must be at least 2 characters, phone: Phone number must be at least 10 characters"
}
```

### Invalid Blood Group
```bash
curl -X POST http://localhost:3001/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "clx123",
    "bloodGroup": "INVALID_TYPE",
    "location": "NYC"
  }'
```

Response:
```json
{
  "status": "error",
  "message": "bloodGroup: Invalid enum value. Expected 'A_POSITIVE' | 'A_NEGATIVE' | 'B_POSITIVE' | 'B_NEGATIVE' | 'AB_POSITIVE' | 'AB_NEGATIVE' | 'O_POSITIVE' | 'O_NEGATIVE', received 'INVALID_TYPE'"
}
```

## Testing with Postman

1. Import the following as a Postman collection
2. Set base URL as variable: `{{baseUrl}} = http://localhost:3001/api`
3. Create requests for each endpoint
4. Use environment variables for dynamic IDs

## Testing with JavaScript/Fetch

```javascript
// Create a user
const createUser = async () => {
  const response = await fetch('http://localhost:3001/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      phone: '+1234567890',
      role: 'DONOR'
    })
  });
  
  const data = await response.json();
  console.log(data);
};

// Get all donors with filters
const getDonors = async () => {
  const response = await fetch(
    'http://localhost:3001/api/donors?bloodGroup=A_POSITIVE&isEligible=true'
  );
  const data = await response.json();
  console.log(data);
};

// Create a donation
const createDonation = async (userId) => {
  const response = await fetch('http://localhost:3001/api/donations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      bloodGroup: 'O_POSITIVE',
      units: 1,
      location: 'City Blood Bank',
      donationType: 'PERSON',
      contact: '+1234567890'
    })
  });
  
  const data = await response.json();
  console.log(data);
};
```

## Common Query Parameters

### Donors
- `?bloodGroup=A_POSITIVE`
- `?location=New York`
- `?isEligible=true`
- `?bloodGroup=O_NEGATIVE&isEligible=true`

### Donations
- `?bloodGroup=A_POSITIVE`
- `?donationType=PERSON`
- `?status=COMPLETED`

### Blood Stock
- `?bloodGroup=AB_POSITIVE`
- `?status=AVAILABLE`

### Events
- `?status=UPCOMING`

### Certificates
- `?type=DONATION`
- `?userId=clx123`

## Success Response Format

```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

## Error Response Format

```json
{
  "status": "error",
  "message": "Error description"
}
```
