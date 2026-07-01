# Logo Upload System Implementation

## Overview
Complete implementation of a custom logo upload system that allows users to upload their organization's logo from the Settings page, which automatically displays in the dashboard sidebar navigation.

## Backend Implementation

### 1. Settings Controller (`backend/src/controllers/settingsController.ts`)
- **File Upload with Multer**: Configured to handle image uploads
- **Storage**: Files saved to `backend/uploads/logos/`
- **Settings Storage**: JSON file at `backend/data/settings.json`

#### API Endpoints:
- `GET /api/settings` - Fetch system settings
- `PUT /api/settings` - Update system settings
- `POST /api/settings/logo` - Upload organization logo
- `DELETE /api/settings/logo` - Delete current logo

#### Features:
- Image validation (only image files accepted)
- File size limit (5MB max)
- Automatic cleanup of old logo when new one uploaded
- Returns logo URL for frontend display

### 2. Settings Routes (`backend/src/routes/settingsRoutes.ts`)
```typescript
router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/logo', upload.single('logo'), uploadLogo);
router.delete('/logo', deleteLogo);
```

### 3. Main Server Updates (`backend/src/index.ts`)
- Added static file serving: `app.use('/uploads', express.static(...))`
- Registered settings routes: `app.use('/api/settings', settingsRoutes)`

### 4. Dependencies
```bash
npm install multer @types/multer
```

## Frontend Implementation

### 1. Settings Query Functions (`frontend/lib/queries/settings.ts`)
```typescript
interface SystemSettings {
  organizationName?: string;
  organizationLogo?: string | null;
  dashboardTitle?: string;
  shortName?: string;
  contactEmail?: string;
  contactPhone?: string;
}

- getSettings(): Promise<SystemSettings>
- updateSettings(settings): Promise<any>
- uploadLogo(file: File): Promise<any>
- deleteLogo(): Promise<any>
```

### 2. Settings Page (`frontend/app/(admin)/dashboard/settings/page.tsx`)

#### Features:
- **Logo Preview**: Shows uploaded logo with delete button overlay
- **File Upload**: Click to upload with file type and size validation
- **Form State Management**: React state with TanStack Query mutations
- **Real-time Updates**: Immediate preview after upload
- **Loading States**: Shows spinner during upload/delete
- **Toast Notifications**: Success/error feedback

#### State Management:
```typescript
const [formData, setFormData] = useState<SystemSettings>({});
const [logoPreview, setLogoPreview] = useState<string | null>(null);

// Mutations
- uploadMutation: Handle file upload
- deleteMutation: Handle logo deletion
- updateMutation: Save general settings
```

### 3. Dashboard Navigation (`frontend/components/DashboardNav.tsx`)

#### Updates:
- Fetches settings using `useQuery` from TanStack Query
- Displays uploaded logo if available
- Falls back to Heart icon if no logo
- Shows dynamic organization name and dashboard title
- Real-time updates when settings change

```typescript
const { data: settings } = useQuery({
  queryKey: ['settings'],
  queryFn: getSettings,
});

const logoUrl = settings?.organizationLogo 
  ? `http://localhost:3001${settings.organizationLogo}` 
  : null;
```

## User Flow

### Upload Logo:
1. Navigate to Settings page
2. Click "General" tab
3. Click "Upload Logo" button in Organization Logo section
4. Select image file (PNG, JPG, SVG, etc.)
5. System validates file (must be image, max 5MB)
6. Logo uploads and preview appears instantly
7. Logo automatically displays in sidebar navigation

### Delete Logo:
1. Hover over uploaded logo preview
2. Click red X button in top-right corner
3. Confirm deletion
4. Logo removed, sidebar reverts to Heart icon

### Update Organization Info:
1. Edit organization name, dashboard title, email, phone
2. Click "Save Changes" button
3. Changes saved to settings.json
4. Sidebar updates with new organization name/title

## File Structure

```
backend/
├── src/
│   ├── controllers/
│   │   └── settingsController.ts  ✅ NEW
│   ├── routes/
│   │   └── settingsRoutes.ts      ✅ NEW
│   └── index.ts                   ✅ UPDATED
├── uploads/                       ✅ NEW
│   └── logos/                     (uploaded logos stored here)
└── data/                          ✅ NEW
    └── settings.json              (settings stored here)

frontend/
├── lib/
│   └── queries/
│       └── settings.ts            ✅ NEW
├── app/
│   └── (admin)/
│       └── dashboard/
│           └── settings/
│               └── page.tsx       ✅ UPDATED
└── components/
    └── DashboardNav.tsx           ✅ UPDATED
```

## Settings JSON Structure

```json
{
  "organizationName": "Blood Donation Management System",
  "organizationLogo": "/uploads/logos/logo-1234567890-123456789.png",
  "dashboardTitle": "Blood Bank Management",
  "shortName": "BBMS",
  "contactEmail": "contact@bloodbank.org",
  "contactPhone": "+1 (555) 000-0000",
  "updatedAt": "2026-07-01T12:34:56.789Z"
}
```

## Security Considerations

1. **File Type Validation**: Only image files accepted
2. **File Size Limit**: Maximum 5MB per file
3. **Automatic Cleanup**: Old logos deleted when new one uploaded
4. **Path Sanitization**: Multer handles secure file naming
5. **Storage Isolation**: Uploads stored in dedicated directory

## Features Summary

✅ Upload custom organization logo  
✅ Real-time preview in settings page  
✅ Auto-display logo in sidebar navigation  
✅ Delete logo functionality  
✅ Fallback to default Heart icon  
✅ Dynamic organization name/title  
✅ File validation (type and size)  
✅ Loading states and error handling  
✅ Toast notifications for feedback  
✅ Clean and professional UI  
✅ Backend API with proper error handling  
✅ Frontend state management with TanStack Query  

## Testing

1. **Upload Logo**: ✅ Working
2. **Delete Logo**: ✅ Working
3. **View in Sidebar**: ✅ Working
4. **Update Settings**: ✅ Working
5. **File Validation**: ✅ Working
6. **Error Handling**: ✅ Working

## Next Steps (Optional Enhancements)

- [ ] Add image cropping/resizing functionality
- [ ] Support for different logo sizes (favicon, mobile, etc.)
- [ ] Database storage instead of JSON file
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Logo history/versioning
- [ ] Drag & drop upload interface
- [ ] Multiple logo variants (light/dark theme)

---

**Status**: ✅ Complete and Production Ready  
**Last Updated**: July 1, 2026  
**Tested**: Backend ✅ | Frontend ✅ | Integration ✅
