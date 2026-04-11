# API Testing Checklist

Use this checklist to verify all endpoints are working correctly.

## Setup

- [ ] Database is running
- [ ] Migrations completed (`npm run migrate`)
- [ ] Prisma client generated (`npm run generate`)
- [ ] Server is running (`npm run dev`)
- [ ] Health check passes: `curl http://localhost:3001/health`

---

## Users API (`/api/users`)

### Create User
- [ ] Valid user creation
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User","phone":"+1234567890"}'
```

- [ ] Invalid email validation
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"test123","name":"Test","phone":"+1234567890"}'
```

- [ ] Short password validation
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123","name":"Test","phone":"+1234567890"}'
```

### Read Users
- [ ] Get all users: `curl http://localhost:3001/api/users`
- [ ] Get user by ID: `curl http://localhost:3001/api/users/{id}`
- [ ] Filter by role: `curl http://localhost:3001/api/users?role=DONOR`

### Update User
- [ ] Update user: `curl -X PUT http://localhost:3001/api/users/{id} -H "Content-Type: application/json" -d '{"name":"Updated Name"}'`

### Delete User
- [ ] Delete user: `curl -X DELETE http://localhost:3001/api/users/{id}`

---

## Donors API (`/api/donors`)

### Create Donor
- [ ] Valid donor creation
```bash
curl -X POST http://localhost:3001/api/donors \
  -H "Content-Type: application/json" \
  -d '{"userId":"{user_id}","bloodGroup":"A_POSITIVE","location":"New York","city":"NYC","weight":70}'
```

- [ ] Invalid blood group validation
```bash
curl -X POST http://localhost:3001/api/donors \
  -H "Content-Type: application/json" \
  -d '{"userId":"{user_id}","bloodGroup":"INVALID","location":"NYC"}'
```

### Read Donors
- [ ] Get all donors: `curl http://localhost:3001/api/donors`
- [ ] Filter by blood group: `curl http://localhost:3001/api/donors?bloodGroup=A_POSITIVE`
- [ ] Filter by location: `curl http://localhost:3001/api/donors?location=New York`
- [ ] Filter by eligibility: `curl http://localhost:3001/api/donors?isEligible=true`
- [ ] Get donor by ID: `curl http://localhost:3001/api/donors/{id}`

### Update Donor
- [ ] Update donor: `curl -X PUT http://localhost:3001/api/donors/{id} -H "Content-Type: application/json" -d '{"isEligible":false}'`

### Delete Donor
- [ ] Delete donor: `curl -X DELETE http://localhost:3001/api/donors/{id}`

---

## Donations API (`/api/donations`)

### Create Donation
- [ ] Valid donation creation
```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{"userId":"{user_id}","bloodGroup":"O_POSITIVE","units":1,"location":"Blood Bank","contact":"+1234567890"}'
```

- [ ] Negative units validation
```bash
curl -X POST http://localhost:3001/api/donations \
  -H "Content-Type: application/json" \
  -d '{"userId":"{user_id}","bloodGroup":"O_POSITIVE","units":-1,"location":"Blood Bank"}'
```

### Read Donations
- [ ] Get all donations: `curl http://localhost:3001/api/donations`
- [ ] Filter by blood group: `curl http://localhost:3001/api/donations?bloodGroup=O_POSITIVE`
- [ ] Filter by type: `curl http://localhost:3001/api/donations?donationType=PERSON`
- [ ] Filter by status: `curl http://localhost:3001/api/donations?status=COMPLETED`
- [ ] Get donation by ID: `curl http://localhost:3001/api/donations/{id}`

### Update Donation
- [ ] Update donation: `curl -X PUT http://localhost:3001/api/donations/{id} -H "Content-Type: application/json" -d '{"status":"COMPLETED"}'`

### Delete Donation
- [ ] Delete donation: `curl -X DELETE http://localhost:3001/api/donations/{id}`

---

## Blood Stock API (`/api/blood-stock`)

### Create Blood Pack
- [ ] Valid blood pack creation
```bash
curl -X POST http://localhost:3001/api/blood-stock \
  -H "Content-Type: application/json" \
  -d '{"packCode":"BP-001","bloodGroup":"AB_POSITIVE","collectionDate":"2024-01-15T10:00:00Z","expiryDate":"2024-02-15T10:00:00Z"}'
```

- [ ] Duplicate pack code validation
```bash
curl -X POST http://localhost:3001/api/blood-stock \
  -H "Content-Type: application/json" \
  -d '{"packCode":"BP-001","bloodGroup":"AB_POSITIVE","collectionDate":"2024-01-15T10:00:00Z","expiryDate":"2024-02-15T10:00:00Z"}'
```

### Read Blood Stock
- [ ] Get all blood packs: `curl http://localhost:3001/api/blood-stock`
- [ ] Get stock summary: `curl http://localhost:3001/api/blood-stock/summary`
- [ ] Filter by blood group: `curl http://localhost:3001/api/blood-stock?bloodGroup=AB_POSITIVE`
- [ ] Filter by status: `curl http://localhost:3001/api/blood-stock?status=AVAILABLE`
- [ ] Get blood pack by ID: `curl http://localhost:3001/api/blood-stock/{id}`

### Update Blood Pack
- [ ] Update blood pack: `curl -X PUT http://localhost:3001/api/blood-stock/{id} -H "Content-Type: application/json" -d '{"status":"USED"}'`

### Delete Blood Pack
- [ ] Delete blood pack: `curl -X DELETE http://localhost:3001/api/blood-stock/{id}`

---

## Blood Issues API (`/api/blood-issues`)

### Create Blood Issue
- [ ] Valid blood issue creation
```bash
curl -X POST http://localhost:3001/api/blood-issues \
  -H "Content-Type: application/json" \
  -d '{"issueCode":"BI-001","recipientName":"City Hospital","recipientType":"HOSPITAL","bloodGroup":"O_NEGATIVE","unitsRequested":2,"contact":"+1234567890","bloodPackIds":["{pack_id_1}","{pack_id_2}"]}'
```

- [ ] Empty blood pack array validation
```bash
curl -X POST http://localhost:3001/api/blood-issues \
  -H "Content-Type: application/json" \
  -d '{"issueCode":"BI-002","recipientName":"Hospital","bloodGroup":"O_NEGATIVE","unitsRequested":2,"contact":"+1234567890","bloodPackIds":[]}'
```

### Read Blood Issues
- [ ] Get all blood issues: `curl http://localhost:3001/api/blood-issues`
- [ ] Filter by blood group: `curl http://localhost:3001/api/blood-issues?bloodGroup=O_NEGATIVE`
- [ ] Filter by recipient type: `curl http://localhost:3001/api/blood-issues?recipientType=HOSPITAL`
- [ ] Get blood issue by ID: `curl http://localhost:3001/api/blood-issues/{id}`

### Update Blood Issue
- [ ] Update blood issue: `curl -X PUT http://localhost:3001/api/blood-issues/{id} -H "Content-Type: application/json" -d '{"status":"COMPLETED"}'`

### Delete Blood Issue
- [ ] Delete blood issue: `curl -X DELETE http://localhost:3001/api/blood-issues/{id}`

---

## Events API (`/api/events`)

### Create Event
- [ ] Valid event creation
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Blood Donation Camp","description":"Annual drive","location":"Community Center","eventDate":"2024-06-15T09:00:00Z","capacity":100}'
```

- [ ] Short title validation
```bash
curl -X POST http://localhost:3001/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"AB","location":"Center","eventDate":"2024-06-15T09:00:00Z"}'
```

### Read Events
- [ ] Get all events: `curl http://localhost:3001/api/events`
- [ ] Filter by status: `curl http://localhost:3001/api/events?status=UPCOMING`
- [ ] Get event by ID: `curl http://localhost:3001/api/events/{id}`

### Update Event
- [ ] Update event: `curl -X PUT http://localhost:3001/api/events/{id} -H "Content-Type: application/json" -d '{"status":"RUNNING"}'`

### Delete Event
- [ ] Delete event: `curl -X DELETE http://localhost:3001/api/events/{id}`

### Register Participant
- [ ] Register participant
```bash
curl -X POST http://localhost:3001/api/events/participants \
  -H "Content-Type: application/json" \
  -d '{"eventId":"{event_id}","userId":"{user_id}"}'
```

### Register Volunteer
- [ ] Register volunteer
```bash
curl -X POST http://localhost:3001/api/events/volunteers \
  -H "Content-Type: application/json" \
  -d '{"eventId":"{event_id}","userId":"{user_id}","role":"Registration Desk"}'
```

---

## Certificates API (`/api/certificates`)

### Create Certificate
- [ ] Valid certificate creation
```bash
curl -X POST http://localhost:3001/api/certificates \
  -H "Content-Type: application/json" \
  -d '{"certificateNumber":"CERT-001","type":"DONATION","userId":"{user_id}","recipientName":"John Doe"}'
```

- [ ] Duplicate certificate number validation
```bash
curl -X POST http://localhost:3001/api/certificates \
  -H "Content-Type: application/json" \
  -d '{"certificateNumber":"CERT-001","type":"DONATION","userId":"{user_id}","recipientName":"John Doe"}'
```

### Read Certificates
- [ ] Get all certificates: `curl http://localhost:3001/api/certificates`
- [ ] Filter by type: `curl http://localhost:3001/api/certificates?type=DONATION`
- [ ] Filter by user: `curl http://localhost:3001/api/certificates?userId={user_id}`
- [ ] Get certificate by ID: `curl http://localhost:3001/api/certificates/{id}`
- [ ] Get by certificate number: `curl http://localhost:3001/api/certificates/number/CERT-001`

### Delete Certificate
- [ ] Delete certificate: `curl -X DELETE http://localhost:3001/api/certificates/{id}`

---

## Integration Tests

### Complete Workflow
- [ ] Create user
- [ ] Create donor profile for user
- [ ] Create donation record
- [ ] Create blood pack from donation
- [ ] Create event
- [ ] Register user as participant
- [ ] Create certificate for donor
- [ ] Create blood issue
- [ ] Verify blood pack status changed to USED
- [ ] Get blood stock summary

### Error Handling
- [ ] 404 for non-existent resource
- [ ] 400 for validation errors
- [ ] 500 for server errors (if any)

### Data Integrity
- [ ] Cascade delete (delete user → donor deleted)
- [ ] Foreign key constraints
- [ ] Unique constraints (email, pack code, certificate number)

---

## Performance Tests

- [ ] Get all users with 100+ records
- [ ] Get all donors with filters
- [ ] Get blood stock summary with multiple blood groups
- [ ] Complex queries with includes

---

## Notes

Replace placeholders:
- `{user_id}` - Actual user ID from database
- `{donor_id}` - Actual donor ID
- `{event_id}` - Actual event ID
- `{pack_id_1}`, `{pack_id_2}` - Actual blood pack IDs

## Test Results

Date: ___________
Tester: ___________

Total Tests: ___________
Passed: ___________
Failed: ___________

Issues Found:
1. ___________
2. ___________
3. ___________
