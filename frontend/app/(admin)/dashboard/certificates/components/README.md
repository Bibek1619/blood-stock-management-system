# Certificates Components

This directory contains modular components for the Certificates & ID Cards page.

## Component Structure

### 1. PageHeader.tsx
**Purpose**: Displays the page title and main action button

**Features**:
- Page title and description
- "Generate Certificate" button
- Clean, simple header layout

**Props**:
```typescript
interface PageHeaderProps {
  onGenerateClick: () => void;
}
```

**Usage**:
```tsx
<PageHeader onGenerateClick={() => setDialogOpen(true)} />
```

---

### 2. GenerateCertificateDialog.tsx
**Purpose**: Modal dialog for creating new certificates

**Features**:
- Certificate type selection (Donation/Volunteer)
- Recipient selection from donors list
- Event selection (for volunteer certificates)
- Date picker
- Form validation
- Loading states
- Auto-reset on close

**Props**:
```typescript
interface GenerateCertificateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donors: any[];
  events: any[];
  donorsLoading: boolean;
  isCreating: boolean;
  onCreateCertificate: (data: CertificateFormData) => void;
}

interface CertificateFormData {
  type: "DONATION" | "VOLUNTEER";
  recipientId: string;
  recipientName: string;
  eventTitle: string;
  volunteerId: string;
  date: string;
}
```

**Validation Rules**:
- Recipient name is required
- Recipient must be selected
- Event title required for volunteer certificates
- Date defaults to today

**Usage**:
```tsx
<GenerateCertificateDialog
  open={dialogOpen}
  onOpenChange={setDialogOpen}
  donors={donors}
  events={events}
  donorsLoading={donorsLoading}
  isCreating={isCreating}
  onCreateCertificate={handleCreateCertificate}
/>
```

---

### 3. CertificatesTable.tsx
**Purpose**: Displays all generated certificates in a table

**Features**:
- Responsive table layout
- Certificate type badges (Donation/Volunteer)
- Date formatting
- Action buttons:
  - Preview Certificate (all types)
  - Preview ID Card (volunteer only)
- Loading state
- Error state
- Empty state with helpful message
- Hidden columns on mobile (Event, Volunteer ID)

**Props**:
```typescript
interface Certificate {
  id: string;
  recipientName: string;
  type: "DONATION" | "VOLUNTEER";
  eventTitle?: string;
  issueDate: string;
  volunteerId?: string;
}

interface CertificatesTableProps {
  certificates: Certificate[];
  isLoading: boolean;
  error: any;
  onPreviewCertificate: (cert: Certificate) => void;
  onPreviewIDCard: (cert: Certificate) => void;
}
```

**Table Columns**:
1. Recipient (always visible)
2. Type (badge, always visible)
3. Event (hidden on mobile)
4. Date (formatted, always visible)
5. Volunteer ID (hidden on mobile)
6. Actions (always visible)

**Badge Colors**:
- 🔴 Donation: Red background
- 🔵 Volunteer: Blue background

**Usage**:
```tsx
<CertificatesTable
  certificates={certificates}
  isLoading={certificatesLoading}
  error={certificatesError}
  onPreviewCertificate={handlePreviewCertificate}
  onPreviewIDCard={handlePreviewIDCard}
/>
```

---

### 4. CertificatePreviewDialog.tsx
**Purpose**: Full-screen preview and print dialog

**Features**:
- Full-screen modal (95vw width)
- Print functionality
- Switches between certificate and ID card views
- Uses external preview components:
  - `CertificatePreview` from `@/lib/certificate-preview`
  - `IDCardPreview` from `@/lib/idcard-preview`
- Print-optimized layout
- Auto-reparents content for printing

**Props**:
```typescript
interface CertificatePreviewDialogProps {
  certificate: any | null;
  previewType: "certificate" | "idcard";
  onClose: () => void;
}
```

**Print Behavior**:
- Temporarily moves content outside dialog portal
- Triggers browser print dialog
- Hides UI elements during print
- Restores layout after print

**Usage**:
```tsx
<CertificatePreviewDialog
  certificate={previewCert}
  previewType={previewType}
  onClose={() => setPreviewCert(null)}
/>
```

---

## Data Flow

```
page.tsx (Main Component)
├── Fetches certificates, donors, events
├── Manages dialog states
├── Handles certificate creation
└── Passes data to child components

PageHeader
└── Emits generate click event

GenerateCertificateDialog
├── Manages form state
├── Validates input
├── Emits create event with form data
└── Resets on close

CertificatesTable
├── Displays certificate list
├── Handles loading/error/empty states
└── Emits preview events

CertificatePreviewDialog
├── Displays certificate/ID card
├── Handles print functionality
└── Manages print layout
```

## Key Features

1. **Modular Design**: Each component has a single, clear responsibility
2. **Type-Safe**: Full TypeScript interfaces for all props
3. **Responsive**: Mobile-optimized with hidden columns
4. **User-Friendly**: Clear validation messages and loading states
5. **Print-Ready**: Optimized print layout for certificates
6. **Reusable**: Components can be used independently

## Certificate Generation Logic

The main page handles certificate number generation:

```typescript
// Donation certificate
const certNumber = `DON-${year}-${paddedNumber}`;

// Volunteer certificate
const certNumber = `VOL-${year}-${paddedNumber}`;
const volunteerId = `VOL-${year}-${paddedNumber}`;
```

## Styling

All components use:
- **shadcn/ui** components (Dialog, Table, Badge, etc.)
- **Tailwind CSS** for styling
- **Consistent color scheme**:
  - Primary: Red (`#7F1D1D`, `red-800`)
  - Secondary: Blue for volunteers
  - Neutral: Slate for text and borders

## Dependencies

External components used:
- `CertificatePreview` - Renders donation certificates
- `IDCardPreview` - Renders volunteer ID cards
- Both from `@/lib/` directory

## Future Improvements

- [ ] Add unit tests for each component
- [ ] Bulk certificate generation
- [ ] Certificate search/filter functionality
- [ ] Export certificates as PDF directly
- [ ] Email certificate to recipient
- [ ] Certificate templates customization
- [ ] Certificate revocation/void functionality
- [ ] Audit log for certificate generation
