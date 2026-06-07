'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Heart,
  Home,
  Image as ImageIcon,
  Activity,
  Droplets,
  ChevronDown,
  LogOut,
  ArrowRightLeft,
} from 'lucide-react';
import { clearAuth } from '@/lib/auth';
import { useAuth } from '@/hooks/useAuth';

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { icon: Home, label: 'Home', href: '/dashboard/public' },
  { icon: Activity, label: 'Donor Request', href: '/dashboard/public/donor-request' },
  { icon: Droplets, label: 'Blood Request', href: '/dashboard/public/blood-request' },
  { icon: ImageIcon, label: 'Images', href: '/dashboard/public/images' },
];

export const PublicDashboardNav = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isMounted } = useAuth();

  const handleLogout = () => {
    clearAuth();
    router.push('/');
  };

  const handleSwitchToAdminDashboard = () => {
    router.push('/dashboard');
  };

  // Prevent hydration mismatch by not rendering user-dependent content until mounted
  const displayName = isMounted && user ? user.name : 'Public User';
  const displayEmail = isMounted && user ? user.email : 'Public Panel';
  const initials = isMounted && user ? user.name.charAt(0).toUpperCase() : 'P';
  const isAdmin = isMounted && user && user.role === 'ADMIN';

  return (
    <TooltipProvider delayDuration={0}>
      <Sidebar collapsible="icon">
        {/* ── Brand ─────────────────────────────────────────────────── */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <Link href="/dashboard/public">
                  <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-red-600 text-primary-foreground">
                    <Heart className="size-4" />
                  </div>
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-semibold">Public Portal</span>
                    <span className="text-xs text-muted-foreground">Blood Donation</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Nav ───────────────────────────────────────────────────── */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-3">
                {NAV_MAIN.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── User footer ───────────────────────────────────────────── */}
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="flex flex-col gap-0.5 leading-none text-left min-w-0">
                      <span className="font-medium text-sm truncate">{displayName}</span>
                      <span className="text-xs text-muted-foreground truncate">{displayEmail}</span>
                    </div>
                    <ChevronDown className="ml-auto size-4 shrink-0" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-56">
                  {isAdmin && (
                    <>
                      <DropdownMenuItem onClick={handleSwitchToAdminDashboard}>
                        <ArrowRightLeft className="mr-2 size-4" />
                        Switch to admin dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        {/* ── Rail (drag to resize) ─────────────────────────────────── */}
        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
};
