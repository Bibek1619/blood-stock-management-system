'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Heart,
  Users,
  Droplet,
  Calendar,
  Award,
  Search,
  Home,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react';

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_MAIN = [
  { icon: Home,     label: 'Dashboard',     href: '/dashboard'            },
  {
    icon: Droplet,
    label: 'Blood Management',
    submenu: [
      { label: 'Blood Stock',  href: '/dashboard/blood-stock'  },
      { label: 'Blood Donate', href: '/dashboard/blood-donate' },
    ],
  },
  { icon: Users,    label: 'Donors',        href: '/dashboard/donors'       },
  { icon: Search,   label: 'Blood Search',  href: '/dashboard/blood-search' },
  { icon: Calendar, label: 'Events',        href: '/dashboard/events'       },
  { icon: Award,    label: 'Certificates',  href: '/dashboard/certificates' },
];

interface DashboardNavProps {
  user?: { name: string; email: string; role: string };
}

export const DashboardNav = ({ user }: DashboardNavProps) => {
  const router   = useRouter();
  const pathname = usePathname();

  const displayName  = user?.name  ?? 'Bibek';
  const displayEmail = user?.email ?? 'bibek@gmail.com';
  const initials     = displayName.charAt(0).toUpperCase();

  return (
    <TooltipProvider delayDuration={0}>
    <Sidebar collapsible="icon">

      {/* ── Brand ─────────────────────────────────────────────────── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Heart className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Blood Donation</span>
                  <span className="text-xs text-muted-foreground">Management System</span>
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
            <SidebarMenu>
              {NAV_MAIN.map((item) =>
                item.submenu ? (
                  <Collapsible
                    key={item.label}
                    asChild
                    defaultOpen={item.submenu.some((s) => pathname === s.href)}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.label}>
                          <item.icon />
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.submenu.map((sub) => (
                            <SidebarMenuSubItem key={sub.href}>
                              <SidebarMenuSubButton asChild isActive={pathname === sub.href}>
                                <Link href={sub.href}>{sub.label}</Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href}
                      tooltip={item.label}
                    >
                      <Link href={item.href!}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
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
                <DropdownMenuItem>
                  <User className="mr-2 size-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push('/')}
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