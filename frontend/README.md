This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Perfect! I've created a comprehensive database schema based on my deep analysis of all your frontend pages. Here's what I've included:

Database Schema Summary
1. User & Authentication
User model with roles (DONOR, ADMIN, STAFF)
Email, phone, password management
2. Donor Management (from /dashboard/donors)
Complete donor profiles with blood group
Location tracking with latitude/longitude for map features
Donation history (totalDonations, lastDonationDate)
Eligibility status
Medical information
3. Blood Stock Management (from /dashboard/blood-stock)
BloodPack model with unique pack codes
Collection and expiry dates
Status tracking (AVAILABLE, USED, EXPIRED, RESERVED)
Storage location
Links to donors
BloodStockSummary for aggregate views
4. Blood Donation & Issuance (from /dashboard/blood-donate)
Donation records with person/organization types
BloodIssue model for tracking blood distribution
BloodIssueItem junction table linking issued packs
Recipient information and contact details
Units tracking
5. Events Management (from /dashboard/events)
Event model with title, description, location, date
Status tracking (UPCOMING, RUNNING, COMPLETED, CANCELLED)
EventParticipant for donors attending
EventVolunteer for helpers
Separate status tracking for each role
6. Certificates (from /dashboard/certificates)
Certificate model with unique numbers
Two types: DONATION and VOLUNTEER
Links to users and events
Volunteer ID generation support
7. Blood Search Features (from /dashboard/blood-search)
Geolocation fields (latitude, longitude) in Donor model
Indexed for efficient radius searches
Location and city fields for text-based filtering
Key Features:
Proper relationships with cascade deletes
Comprehensive indexes for performance
Support for both individual and organization donations
Complete audit trail with createdAt/updatedAt
Blood group enum matching your frontend (A+, A-, B+, B-, AB+, AB-, O+, O-)
Status enums matching your UI states
The schema now fully supports all features visible in your frontend pages including the dashboard analytics, donor management, blood stock tracking, donation recording, event management, certificate generation, and the interactive map