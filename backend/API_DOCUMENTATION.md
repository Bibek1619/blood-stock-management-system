# Blood Donation Management System - API Documentation

Base URL: `http://localhost:3001/api`

All endpoints include Zod validation. See [VALIDATION.md](./VALIDATION.md) for detailed validation rules.

## Table of Contents
- [Users](#users)
- [Donors](#donors)
- [Donations](#donations)
- [Blood Stock](#blood-stock)
- [Blood Issues](#blood-issues)
- [Events](#events)
- [Certificates](#certificates)

---

## Users

### Get All Users
```
GET /api/users
Query Parameters: ?role=DONOR|ADMIN|STAFF
```

### Get User by ID
```
GET /api/users/:id
```

### Create User
```
POST /api/users
Body: {
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "DONOR"
}
```

### Update User
```
PUT /api/users/:id
Body: { ...fields to update }
```

### Delete User
```
DELETE /api/users/:id
```

---

## Donors

### Get All Donors
```
GET /api/donors
Query Parameters: ?bloodGroup=A_POSITIVE&location=City&isEligible=true
```

### Get Donor by ID
```
GET /api/donors/:id
```

### Create Donor
```
POST /api/donors
Body: {
  "userId": "user_id",
  "bloodGroup": "A_POSITIVE",
  "location": "New York",
  "city": "NYC",
  "address": "123 Main St",
  "dateOfBirth": "1990-01-01",
  "weight": 70,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Update Donor
```
PUT /api/donors/:id
Body: { ...fields to update }
```

### Delete Donor
```
DELETE /api/donors/:id
```

---

## Donations

### Get All Donations
```
GET /api/donations
Query Parameters: ?bloodGroup=A_POSITIVE&donationType=PERSON&status=COMPLETED
```

### Get Donation by ID
```
GET /api/donations/:id
```

### Create Donation
```
POST /api/donations
Body: {
  "userId": "user_id",
  "bloodGroup": "A_POSITIVE",
  "units": 1,
  "location": "Blood Bank NYC",
  "donationType": "PERSON",
  "status": "COMPLETED",
  "notes": "Regular donation",
  "contact": "+1234567890"
}
```

### Update Donation
```
PUT /api/donations/:id
Body: { ...fields to update }
```

### Delete Donation
```
DELETE /api/donations/:id
```

---

## Blood Stock

### Get Blood Stock
```
GET /api/blood-stock
Query Parameters: ?bloodGroup=A_POSITIVE&status=AVAILABLE
```

### Get Blood Stock Summary
```
GET /api/blood-stock/summary
Returns aggregated counts by blood group and status
```

### Get Blood Pack by ID
```
GET /api/blood-stock/:id
```

### Create Blood Pack
```
POST /api/blood-stock
Body: {
  "packCode": "BP-2024-001",
  "bloodGroup": "A_POSITIVE",
  "donorId": "donor_id",
  "collectionDate": "2024-01-01",
  "expiryDate": "2024-02-01",
  "storageLocation": "Freezer A1"
}
```

### Update Blood Pack
```
PUT /api/blood-stock/:id
Body: { ...fields to update }
```

### Delete Blood Pack
```
DELETE /api/blood-stock/:id
```

---

## Blood Issues

### Get All Blood Issues
```
GET /api/blood-issues
Query Parameters: ?bloodGroup=A_POSITIVE&recipientType=HOSPITAL&status=COMPLETED
```

### Get Blood Issue by ID
```
GET /api/blood-issues/:id
```

### Create Blood Issue
```
POST /api/blood-issues
Body: {
  "issueCode": "BI-2024-001",
  "recipientName": "City Hospital",
  "recipientType": "HOSPITAL",
  "bloodGroup": "A_POSITIVE",
  "unitsRequested": 2,
  "contact": "+1234567890",
  "issuedBy": "user_id",
  "bloodPackIds": ["pack_id_1", "pack_id_2"],
  "notes": "Emergency request"
}
```

### Update Blood Issue
```
PUT /api/blood-issues/:id
Body: { ...fields to update }
```

### Delete Blood Issue
```
DELETE /api/blood-issues/:id
```

---

## Events

### Get All Events
```
GET /api/events
Query Parameters: ?status=UPCOMING
```

### Get Event by ID
```
GET /api/events/:id
```

### Create Event
```
POST /api/events
Body: {
  "title": "Blood Donation Camp",
  "description": "Annual blood donation drive",
  "location": "Community Center",
  "eventDate": "2024-06-15T10:00:00Z",
  "capacity": 100
}
```

### Update Event
```
PUT /api/events/:id
Body: { ...fields to update }
```

### Delete Event
```
DELETE /api/events/:id
```

### Register Participant
```
POST /api/events/participants
Body: {
  "eventId": "event_id",
  "userId": "user_id"
}
```

### Register Volunteer
```
POST /api/events/volunteers
Body: {
  "eventId": "event_id",
  "userId": "user_id",
  "role": "Registration Desk"
}
```

---

## Certificates

### Get All Certificates
```
GET /api/certificates
Query Parameters: ?type=DONATION&userId=user_id
```

### Get Certificate by ID
```
GET /api/certificates/:id
```

### Get Certificate by Number
```
GET /api/certificates/number/:certificateNumber
```

### Create Certificate
```
POST /api/certificates
Body: {
  "certificateNumber": "CERT-2024-001",
  "type": "DONATION",
  "userId": "user_id",
  "recipientName": "John Doe",
  "eventTitle": "Blood Donation Camp 2024",
  "volunteerId": "volunteer_id"
}
```

### Delete Certificate
```
DELETE /api/certificates/:id
```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Blood Group Enum Values
- A_POSITIVE
- A_NEGATIVE
- B_POSITIVE
- B_NEGATIVE
- AB_POSITIVE
- AB_NEGATIVE
- O_POSITIVE
- O_NEGATIVE

## Status Enum Values

### Pack Status
- AVAILABLE
- USED
- EXPIRED
- RESERVED

### Donation Status
- PENDING
- COMPLETED
- CANCELLED
- REJECTED

### Issue Status
- PENDING
- COMPLETED
- CANCELLED

### Event Status
- UPCOMING
- RUNNING
- COMPLETED
- CANCELLED
