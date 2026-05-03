'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Phone, Mail, Eye, Users, Heart, MapPin, 
  Droplets, Calendar, Award, Home, Loader2,
} from "lucide-react";
import { BLOOD_GROUPS, getInitials, getDonorTier } from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { useDonors } from "@/lib/queries/donors";

// Utility function to format blood group
const formatBloodGroup = (bloodGroup: string): string => {
  const mapping: Record<string, string> = {
    'A_POSITIVE': 'A+',
    'A_NEGATIVE': 'A-',
    'B_POSITIVE': 'B+',
    'B_NEGATIVE': 'B-',
    'AB_POSITIVE': 'AB+',
    'AB_NEGATIVE': 'AB-',
    'O_POSITIVE': 'O+',
    'O_NEGATIVE': 'O-',
  };
  return mapping[bloodGroup] || bloodGroup;
};

// Extended Donor type with user info
interface Donor {
  id: string;
  userId: string;
  bloodGroup: string;
  location: string;
  city?: string;
  address?: string;
  dateOfBirth?: string;
  weight?: number;
  lastDonationDate?: string;
  totalDonations: number;
  isEligible: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    isVerified: boolean;
  };
}

// ─── TOAST (simple) ───────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);
  const add = (msg: string, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DonorsPage() {
  const router = useRouter();
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "organization" | "unregistered">("all");

  const { toasts, toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const pageLimit = 20;

  // Fetch donors using TanStack Query with pagination
  const { data, isLoading, error } = useDonors({}, currentPage, pageLimit);
  
  // Extract donors and pagination info
  const donors = Array.isArray(data) ? data : (data?.data || []);
  const pagination = !Array.isArray(data) ? data?.pagination : undefined;

  // Show error toast if fetch fails
  if (error) {
    toast('Failed to load donors', 'error');
  }

  // Filter donors based on active tab
  const getFilteredDonorsByTab = () => {
    switch (activeTab) {
      case "organization":
        // Organization donors: those with email ending in @org.local or phone-based emails
        return donors.filter(d => 
          d.user?.email?.includes('@org.local') || 
          d.user?.email?.match(/^\d+@/)
        );
      case "unregistered":
        // Unregistered donors: walk-in/event donors who haven't claimed their account yet
        return donors.filter(d => d.user?.isVerified === false);
      default:
        // All donors: everyone (both verified and unverified)
        return donors;
    }
  };

  const tabFilteredDonors = getFilteredDonorsByTab();

  const filtered = tabFilteredDonors.filter((d) => {
    if (filterGroup !== "all" && d.bloodGroup !== filterGroup) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const name = d.user?.name || '';
      const location = d.location || '';
      const phone = d.user?.phone || '';
      return (
        name.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q) ||
        phone.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto  p-6 md:p-8">
        {/* ── Toast Stack ── */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[9999]">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium shadow-lg ${
                t.type === "error"
                  ? "bg-red-50 border-red-300 text-[#7F1D1D]"
                  : "bg-green-50 border-green-300 text-green-800"
              }`}
            >
              {t.msg}
            </div>
          ))}
        </div>

        {/* ── Breadcrumbs ── */}
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

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
              <Users size={18} className="text-[#7F1D1D]" />
            </div>
            <div>
              <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">Donors</h1>
              <p className="text-[13px] text-slate-600 mt-0.5">
                {isLoading ? "Loading..." : `${donors.length} registered donors`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200">
          <button
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "all"
                ? "border-[#7F1D1D] text-[#7F1D1D]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Donors
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {donors.length}
            </span>
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "organization"
                ? "border-[#7F1D1D] text-[#7F1D1D]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("organization")}
          >
            Organizations
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {donors.filter(d => d.user?.email?.includes('@org.local') || d.user?.email?.match(/^\d+@/)).length}
            </span>
          </button>
          <button
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "unregistered"
                ? "border-[#7F1D1D] text-[#7F1D1D]"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
            onClick={() => setActiveTab("unregistered")}
          >
            Unregistered Donors
            <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-700">
              {donors.filter(d => d.user?.isVerified === false).length}
            </span>
          </button>
        </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2.5 mb-3.5">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-2.5 h-[38px] border border-slate-200 rounded-lg text-sm outline-none bg-white focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
            placeholder="Search by name, location, phone…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select
          className="h-[38px] border border-slate-200 rounded-lg px-2.5 text-sm bg-white outline-none cursor-pointer focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
          value={filterGroup}
          onChange={(e) => setFilterGroup(e.target.value)}
        >
          <option value="all">All Groups</option>
          {BLOOD_GROUPS.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Name", "Group", "Phone", "Location", "Last Donation", "Donations", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-3.5 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 bg-slate-50 ${
                    i >= 2 && i <= 4 ? "hidden md:table-cell" : ""
                  } ${i === 5 ? "hidden lg:table-cell" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-[#7F1D1D] animate-spin" />
                    <p className="text-sm font-semibold text-slate-600 m-0">Loading donors...</p>
                  </div>
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((d) => {
                const name = d.user?.name || 'Unknown';
                const phone = d.user?.phone || 'N/A';
                const email = d.user?.email;
                const bloodGroup = formatBloodGroup(d.bloodGroup);
                
                return (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-3.5 py-3 text-sm text-slate-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center text-xs font-bold text-[#7F1D1D]">
                          {getInitials(name)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-sm text-slate-900">{name}</span>
                          {d.user?.email?.includes('@org.local') || d.user?.email?.match(/^\d+@/) ? (
                            <span className="text-[10px] text-blue-600 font-medium">🏢 Organization</span>
                          ) : !d.user?.isVerified ? (
                            <span className="text-[10px] text-orange-600 font-medium">⚠ Unregistered</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#7F1D1D]/10 text-[#7F1D1D] border border-[#7F1D1D]/20 text-[11px] font-bold">
                        {bloodGroup}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">{phone}</td>
                    <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">{d.location || d.city || 'N/A'}</td>
                    <td className="px-3.5 py-3 text-xs hidden md:table-cell">
                      {d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-3.5 py-3 hidden lg:table-cell">
                      <span className="text-xs font-bold text-[#7F1D1D]">{d.totalDonations}×</span>
                    </td>
                    <td className="px-3.5 py-3">
                      <div className="flex items-center gap-0.5">
                        <button
                          className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center text-xs font-medium gap-1"
                          title="View Profile"
                          onClick={() => router.push(`/dashboard/donors/${d.id}`)}
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">View Profile</span>
                        </button>
                        <button
                          className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center hidden md:inline-flex"
                          title="Call"
                          onClick={() => toast(`Calling ${name}…`, "info")}
                        >
                          <Phone size={13} />
                        </button>
                        {email && (
                          <button
                            className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center hidden md:inline-flex"
                            title="Email"
                            onClick={() => toast(`Email sent to ${name}`, "info")}
                          >
                            <Mail size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Heart size={22} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 m-0">No donors found</p>
                    <p className="text-xs text-slate-400 m-0">
                      {activeTab === "organization" && "No organization donors yet"}
                      {activeTab === "unregistered" && "No unregistered donors yet"}
                      {activeTab === "all" && "Try adjusting your filters"}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {pagination && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
        {!pagination && (
          <div className="px-3.5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
            Showing {filtered.length} of {tabFilteredDonors.length} donors
            {activeTab === "organization" && " (bulk collection organizations)"}
            {activeTab === "unregistered" && " (haven't claimed their account)"}
          </div>
        )}
      </div>
    </div>
    </div>
  );
}
