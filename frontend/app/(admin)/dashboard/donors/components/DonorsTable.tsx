import { Eye, Heart, Loader2, Mail, Phone } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { getInitials } from "@/lib/data";
import { Donor, DonorTab } from "./types";

interface DonorsTableProps {
  activeTab: DonorTab;
  donors: Donor[];
  isLoading: boolean;
  onCall: (name: string) => void;
  onEmail: (name: string) => void;
  onPageChange: (page: number) => void;
  onViewProfile: (donorId: string) => void;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
  };
  tabDonorsCount: number;
}

const formatBloodGroup = (bloodGroup: string): string => {
  const mapping: Record<string, string> = {
    A_POSITIVE: "A+",
    A_NEGATIVE: "A-",
    B_POSITIVE: "B+",
    B_NEGATIVE: "B-",
    AB_POSITIVE: "AB+",
    AB_NEGATIVE: "AB-",
    O_POSITIVE: "O+",
    O_NEGATIVE: "O-",
  };

  return mapping[bloodGroup] || bloodGroup;
};

export function DonorsTable({
  activeTab,
  donors,
  isLoading,
  onCall,
  onEmail,
  onPageChange,
  onViewProfile,
  pagination,
  tabDonorsCount,
}: DonorsTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Name", "Group", "Phone", "Location", "Last Donation", "Donations", ""].map((heading, index) => (
              <th
                key={heading}
                className={`px-3.5 py-2.5 text-left text-[11px] font-semibold text-slate-600 uppercase tracking-wider border-b border-slate-100 bg-slate-50 ${
                  index >= 2 && index <= 4 ? "hidden md:table-cell" : ""
                } ${index === 5 ? "hidden lg:table-cell" : ""}`}
              >
                {heading}
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
          ) : donors.length > 0 ? (
            donors.map((donor) => {
              const name = donor.user?.name || "Unknown";
              const phone = donor.user?.phone || "N/A";
              const email = donor.user?.email;
              const bloodGroup = formatBloodGroup(donor.bloodGroup);

              return (
                <tr key={donor.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3.5 py-3 text-sm text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8.5 h-8.5 rounded-full shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center text-xs font-bold text-[#7F1D1D]">
                        {getInitials(name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-900">{name}</span>
                        {donor.donorType === "ORGANIZATION" ? (
                          donor.user?.isVerified ? (
                            <span className="text-[10px] text-blue-600 font-medium">🏢 Organization</span>
                          ) : (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-orange-600 font-medium">⚠ Unregistered</span>
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                                Org
                              </span>
                            </div>
                          )
                        ) : !donor.user?.isVerified ? (
                          <span className="text-[10px] text-orange-600 font-medium">⚠ Unregistered</span>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    {donor.donorType === "ORGANIZATION" ? (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 text-[11px] font-bold">
                        -
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#7F1D1D]/10 text-[#7F1D1D] border border-[#7F1D1D]/20 text-[11px] font-bold">
                        {bloodGroup}
                      </span>
                    )}
                  </td>
                  <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">{phone}</td>
                  <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">
                    {donor.location || donor.city || "N/A"}
                  </td>
                  <td className="px-3.5 py-3 text-xs hidden md:table-cell">
                    {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-3.5 py-3 hidden lg:table-cell">
                    <span className="text-xs font-bold text-[#7F1D1D]">{donor.totalDonations}×</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center text-xs font-medium gap-1"
                        title="View Profile"
                        onClick={() => onViewProfile(donor.id)}
                      >
                        <Eye size={13} />
                        <span className="hidden sm:inline">View Profile</span>
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all inline-flex items-center max-md:hidden"
                        title="Call"
                        onClick={() => onCall(name)}
                      >
                        <Phone size={13} />
                      </button>
                      {email && (
                        <button
                          className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all inline-flex items-center max-md:hidden"
                          title="Email"
                          onClick={() => onEmail(name)}
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

      {pagination ? (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={onPageChange}
        />
      ) : (
        <div className="px-3.5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
          Showing {donors.length} of {tabDonorsCount} donors
          {activeTab === "organization" && " (bulk collection organizations)"}
          {activeTab === "unregistered" && " (haven't claimed their account)"}
        </div>
      )}
    </div>
  );
}
