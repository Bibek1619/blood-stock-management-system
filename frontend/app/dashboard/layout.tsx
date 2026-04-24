'use client';

import { DashboardNav } from '@/components/DashboardNav';
import { DataProvider } from '@/lib/data-store';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, isAuthenticated } from '@/lib/auth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    if (isAuthenticated()) {
      const user = getUser();
      
      // If user is a DONOR, redirect to /home
      if (user && user.role === 'DONOR') {
        router.push('/home');
        return;
      }
    }

    // Allow access to:
    // - Non-logged-in users
    // - ADMIN users
    // - STAFF users
    setAuthorized(true);
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <DataProvider>
      <SidebarProvider>
        <DashboardNav />

        <SidebarInset>
          {/* ── Top header bar (Sticky) ──────────────────────────────────────── */}
          <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b px-4 bg-white shadow-sm">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              Blood Bank Management
            </span>
          </header>

          {/* ── Page content ────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 bg-[#fafafc]" suppressHydrationWarning>
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}