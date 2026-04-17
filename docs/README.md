# Blood Bank Management System - General Documentation

This folder contains general documentation, workflow guides, and project-wide information.

## 📚 Documentation Index

### Workflow & Process Documentation
- **[BLOOD_DONATION_WORKFLOW.md](./BLOOD_DONATION_WORKFLOW.md)** - Complete blood donation workflow
- **[CORRECT_BLOOD_WORKFLOW.md](./CORRECT_BLOOD_WORKFLOW.md)** - Correct blood collection and distribution process
- **[DONOR_ADMIN_FLOW.md](./DONOR_ADMIN_FLOW.md)** - Donor and admin workflow interactions

### Project Status & Summaries
- **[FIXES_SUMMARY.md](./FIXES_SUMMARY.md)** - Summary of all fixes applied
- **[REGISTRATION_IMPLEMENTATION_SUMMARY.md](./REGISTRATION_IMPLEMENTATION_SUMMARY.md)** - Registration feature summary
- **[SUCCESS_NEXT_STEPS.md](./SUCCESS_NEXT_STEPS.md)** - Project success milestones and next steps
- **[BEFORE_AFTER_COMPARISON.md](./BEFORE_AFTER_COMPARISON.md)** - Before and after comparison

### Testing
- **[TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)** - Complete testing checklist

## 🏗️ Project Structure

```
blood-bank-management/
├── backend/           # Node.js + Express + Prisma backend
│   └── docs/         # Backend-specific documentation
├── frontend/         # Next.js frontend
│   └── docs/         # Frontend-specific documentation
└── docs/            # General documentation (this folder)
```

## 🎯 Key Features

### Blood Management
1. **Blood Collection** - Record donations from donors
2. **Blood Stock** - Track inventory by blood group
3. **Blood Distribution** - Issue blood to hospitals/patients
4. **Expiry Tracking** - Monitor blood pack expiry dates

### Donor Management
1. **Donor Registration** - Web and walk-in donors
2. **Donor Profiles** - Complete donor information
3. **Donation History** - Track donor contributions
4. **Eligibility Tracking** - Monitor donation eligibility

### Event Management
1. **Blood Donation Events** - Organize donation camps
2. **Participant Registration** - Manage event participants
3. **Volunteer Management** - Track event volunteers

### User Management
1. **Authentication** - JWT-based auth system
2. **Role-Based Access** - Donor, Admin, Staff roles
3. **Profile Management** - User profile updates

## 🔄 Complete Blood Flow

### Collection Process
```
Donor → Blood Bank → Collection → Blood Pack Created → Stock Updated
```

### Distribution Process
```
Request → Check Stock → Issue Blood → Pack Status Updated → Stock Decreased
```

## 📊 Database Schema

- **Users** - Authentication and user data
- **Donors** - Donor profiles and health info
- **Donations** - Donation records
- **BloodPacks** - Individual blood units
- **BloodStockSummary** - Inventory summary
- **BloodIssues** - Distribution records
- **Events** - Blood donation events
- **Certificates** - Donation certificates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup
1. Clone the repository
2. Setup backend (see [backend/docs](../backend/docs/))
3. Setup frontend (see [frontend/docs](../frontend/docs/))
4. Configure environment variables
5. Run database migrations
6. Start both servers

### Running the Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 🔗 Quick Links

- **Backend Docs:** [backend/docs/](../backend/docs/)
- **Frontend Docs:** [frontend/docs/](../frontend/docs/)
- **API Documentation:** [backend/docs/AUTH_API.md](../backend/docs/AUTH_API.md)
- **Testing Guide:** [TESTING_CHECKLIST.md](./TESTING_CHECKLIST.md)

## 📝 Contributing

When adding new documentation:
1. Backend-specific docs → `backend/docs/`
2. Frontend-specific docs → `frontend/docs/`
3. General/workflow docs → `docs/`

## 📞 Support

For issues or questions, refer to the specific documentation in each folder.
