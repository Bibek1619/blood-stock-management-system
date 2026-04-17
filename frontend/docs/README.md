# Frontend Documentation

This folder contains all frontend-related documentation for the Blood Bank Management System.

## 📚 Documentation Index

### Authentication & User Flow
- **[AUTHENTICATION_FLOW.md](./AUTHENTICATION_FLOW.md)** - Complete authentication flow documentation
- **[REGISTRATION_FLOW.md](./REGISTRATION_FLOW.md)** - User registration flow
- **[DONOR_REGISTRATION_FLOW.md](./DONOR_REGISTRATION_FLOW.md)** - Donor-specific registration process

### Features & Pages
- **[DASHBOARD_ACCESS_UPDATE.md](./DASHBOARD_ACCESS_UPDATE.md)** - Dashboard access control implementation
- **[DONORS_PAGE_UPDATE.md](./DONORS_PAGE_UPDATE.md)** - Donors page features and updates
- **[BLOOD_STOCK_DYNAMIC_UPDATE.md](./BLOOD_STOCK_DYNAMIC_UPDATE.md)** - Blood stock page with real data

### Development Guides
- **[TANSTACK_QUERY_GUIDE.md](./TANSTACK_QUERY_GUIDE.md)** - Guide for using TanStack Query
- **[AGENTS.md](./AGENTS.md)** - AI agents and automation
- **[CLAUDE.md](./CLAUDE.md)** - Claude AI integration notes

### General
- **[TODO.md](./TODO.md)** - Todo list and pending tasks
- **[README.md](./README.md)** - Original frontend README (this file)

## 🚀 Quick Start

1. Install dependencies: `npm install`
2. Configure environment: Copy `.env.local.example` to `.env.local`
3. Start development server: `npm run dev`
4. Open browser: `http://localhost:3000`

## 📱 Key Pages

### Public Pages
- `/` - Landing page
- `/login` - Login page
- `/events` - Public events listing
- `/become-donor` - Donor registration
- `/home` - Donor home page (after login)

### Dashboard Pages (Admin/Staff)
- `/dashboard` - Main dashboard
- `/dashboard/donors` - Donor management
- `/dashboard/blood-stock` - Blood inventory
- `/dashboard/blood-donate/blood-collection` - Record blood donations
- `/dashboard/blood-donate` - Blood issuance/distribution
- `/dashboard/events` - Event management
- `/dashboard/certificates` - Certificate management

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **State Management:** TanStack Query
- **Forms:** React Hook Form
- **Maps:** Leaflet
- **Notifications:** Sonner

## 🔗 Related Documentation

- [Backend Documentation](../../backend/docs/)
- [General Workflow Documentation](../../docs/)
