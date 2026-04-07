'use client';

import { DashboardNav } from '@/components/DashboardNav';
import { DataProvider } from '@/lib/data-store';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demoUser = {
    name: 'Bibek',
    email: 'bibek@gmail.com',
    role: 'admin',
  };

  return (
    <DataProvider>
      <SidebarProvider>
        <DashboardNav user={demoUser} />

        <SidebarInset>
          {/* ── Top header bar ──────────────────────────────────────── */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <span className="text-sm font-medium text-muted-foreground">
              Blood Bank Management
            </span>
          </header>

          {/* ── Page content ────────────────────────────────────────── */}
          <div className="flex flex-1 flex-col gap-4 p-6 md:p-8 bg-[#fafafc]">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </DataProvider>
  );
}