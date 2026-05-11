import { CalendarDays, Home, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface EventsHeaderProps {
  onCreateClick: () => void;
}

export function EventsHeader({ onCreateClick }: EventsHeaderProps) {
  return (
    <>
      <div className="mx-auto mb-4 max-w-7xl">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Events</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-auto mb-6 max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
              <CalendarDays size={18} className="text-red-800" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Events</h1>
              <p className="mt-0.5 text-sm text-slate-600">Manage blood donation campaigns and drives</p>
            </div>
          </div>
          <Button onClick={onCreateClick} className="gap-2 bg-red-800 text-white hover:bg-red-900">
            <Plus size={16} /> Create Event
          </Button>
        </div>
      </div>
    </>
  );
}
