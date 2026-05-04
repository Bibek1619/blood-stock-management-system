'use client';

import { DashboardNav } from '@/components/DashboardNav';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, isMounted } = useAuth();

  useEffect(() => {
    if (!isMounted || isLoading) return;
    
    console.log('🔍 Dashboard Layout: Checking authentication...');
    console.log('🔍 Is authenticated:', isAuthenticated);
    console.log('🔍 User:', user);
    
    // If user is a DONOR, redirect to /home
    if (isAuthenticated && user && user.role === 'DONOR') {
      console.log('🔄 Redirecting DONOR to /home');
      router.push('/home');
      return;
    }

    console.log('✅ Authorization granted');
  }, [router, user, isAuthenticated, isLoading, isMounted]);

  // Show loading state until component is mounted and auth check is complete
  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
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
        <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 bg-[#fafafc] min-h-screen">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}