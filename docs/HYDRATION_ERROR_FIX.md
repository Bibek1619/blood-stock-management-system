# Hydration Error Fix

## What is the Hydration Error?

The hydration error you're seeing is caused by a mismatch between server-rendered HTML and client-rendered HTML. The specific error mentions `bis_skin_checked="1"` which is an attribute added by browser extensions (commonly Bitdefender, Avast, or other security software).

## Root Cause

Browser extensions inject attributes into the DOM before React hydrates the page, causing React to detect a mismatch between what the server rendered and what the client sees.

## Solutions Implemented

### 1. Suppress Hydration Warning (Already in place)
The root layout already has `suppressHydrationWarning` on both `<html>` and `<body>` tags:

```tsx
<html suppressHydrationWarning>
  <body suppressHydrationWarning>
```

This tells React to ignore minor attribute differences during hydration.

### 2. Client-Side Mount Check Hook
Created `useHasMounted` hook to ensure components only render after mounting on the client:

**File:** `frontend/hooks/useHasMounted.ts`

```typescript
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);
  
  return hasMounted;
}
```

### 3. Updated Event Pages
Both event pages now use the `useHasMounted` hook to prevent hydration mismatches:

- `frontend/app/(public)/events/page.tsx`
- `frontend/app/(public)/events/[id]/page.tsx`

## Additional Recommendations

### For Users
If you're experiencing this error:

1. **Disable browser extensions temporarily** to confirm they're the cause
2. **Common culprits:**
   - Bitdefender
   - Avast
   - Kaspersky
   - Ad blockers
   - Password managers
   - Grammarly

3. **Whitelist your development domain** in the extension settings

### For Developers

#### Option 1: Use Dynamic Imports (Recommended for complex components)
```tsx
import dynamic from 'next/dynamic';

const DynamicComponent = dynamic(() => import('./Component'), {
  ssr: false,
  loading: () => <LoadingSpinner />
});
```

#### Option 2: Conditional Rendering
```tsx
const hasMounted = useHasMounted();

if (!hasMounted) {
  return <LoadingState />;
}

return <ActualComponent />;
```

#### Option 3: Suppress on Specific Elements
```tsx
<div suppressHydrationWarning>
  {/* Content that might have hydration issues */}
</div>
```

## When to Worry

**Don't worry if:**
- The error mentions `bis_skin_checked` or similar extension attributes
- The app functions correctly despite the warning
- The error only appears in development

**Do investigate if:**
- You're using `Date.now()`, `Math.random()`, or other dynamic values
- You're checking `typeof window !== 'undefined'` in render
- You're formatting dates without consistent timezone handling
- The app has actual visual bugs or broken functionality

## Testing

To verify the fix:

1. **Clear browser cache and hard reload**
   - Chrome/Edge: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Firefox: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

2. **Test in incognito/private mode** (extensions disabled by default)

3. **Check different browsers:**
   - Chrome
   - Firefox
   - Safari
   - Edge

4. **Verify in production build:**
   ```bash
   npm run build
   npm run start
   ```

## Prevention Checklist

- [ ] Use `suppressHydrationWarning` on root elements
- [ ] Avoid using `Date.now()` or `Math.random()` in render
- [ ] Use `useHasMounted` hook for client-only features
- [ ] Format dates consistently (use libraries like `date-fns`)
- [ ] Avoid conditional rendering based on `typeof window`
- [ ] Test with browser extensions disabled
- [ ] Test in production mode

## Related Files

- `frontend/app/layout.tsx` - Root layout with suppressHydrationWarning
- `frontend/hooks/useHasMounted.ts` - Client mount detection hook
- `frontend/app/(public)/events/page.tsx` - Events list page
- `frontend/app/(public)/events/[id]/page.tsx` - Event detail page

## References

- [Next.js Hydration Error Docs](https://nextjs.org/docs/messages/react-hydration-error)
- [React Hydration Docs](https://react.dev/reference/react-dom/client/hydrateRoot)
- [Common Hydration Issues](https://nextjs.org/docs/messages/react-hydration-error#common-causes)
