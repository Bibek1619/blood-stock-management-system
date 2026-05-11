import { Home, Users } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface DonorsHeaderProps {
  isLoading: boolean;
  totalCount: number;
}

export function DonorsHeader({ isLoading, totalCount }: DonorsHeaderProps) {
  return (
    <>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Donors</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
            <Users size={18} className="text-[#7F1D1D]" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">Donors</h1>
            <p className="text-[13px] text-slate-600 mt-0.5">
              {isLoading ? "Loading..." : `${totalCount} registered donors`}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
