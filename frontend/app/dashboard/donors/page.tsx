'use client';

import { useState } from "react";
import {
  Plus, Search, Phone, Mail, Eye, Users, Heart, X, MapPin, 
  Droplets, Calendar, Award, ChevronRight, Home,
} from "lucide-react";
import { BLOOD_GROUPS, MOCK_DONORS, getInitials, getDonorTier, type BloodGroup, type Donor } from "@/lib/data";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

let donorCounter = MOCK_DONORS.length + 1;

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
  const [donors, setDonors] = useState<Donor[]>(MOCK_DONORS);
  const [filterGroup, setFilterGroup] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetDonor, setSheetDonor] = useState<Donor | null>(null);
  const [newDonor, setNewDonor] = useState({
    name: "", phone: "", email: "", bloodGroup: "",
    location: "", lastDonationDate: "", totalDonations: 0,
  });

  const { toasts, toast } = useToast();

  const filtered = donors.filter((d) => {
    if (filterGroup !== "all" && d.bloodGroup !== filterGroup) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.phone.includes(q)
      );
    }
    return true;
  });

  const handleAdd = () => {
    if (!newDonor.name || !newDonor.bloodGroup || !newDonor.phone) {
      toast("Name, blood group, and phone are required", "error");
      return;
    }

    const donor: Donor = {
      id: `dn${donorCounter++}`,
      name: newDonor.name,
      phone: newDonor.phone,
      email: newDonor.email || undefined,
      bloodGroup: newDonor.bloodGroup as BloodGroup,
      location: newDonor.location,
      lastDonationDate: newDonor.lastDonationDate,
      totalDonations: newDonor.totalDonations,
    };

    setDonors([donor, ...donors]);
    setDialogOpen(false);
    setNewDonor({ name: "", phone: "", email: "", bloodGroup: "", location: "", lastDonationDate: "", totalDonations: 0 });
    toast("Donor registered successfully");
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="w-full max-w-[1600px] mx-auto p-6 md:p-8">
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
              <p className="text-[13px] text-slate-600 mt-0.5">{donors.length} registered donors</p>
            </div>
          </div>
          <button
            className="flex items-center gap-1.5 bg-[#7F1D1D] text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-[#991B1B] transition-colors"
            onClick={() => setDialogOpen(true)}
          >
            <Plus size={14} /> Add Donor
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
            {filtered.length > 0 ? (
              filtered.map((d) => (
                <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-3.5 py-3 text-sm text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-[34px] h-[34px] rounded-full flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center text-xs font-bold text-[#7F1D1D]">
                        {getInitials(d.name)}
                      </div>
                      <span className="font-semibold text-sm text-slate-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#7F1D1D]/10 text-[#7F1D1D] border border-[#7F1D1D]/20 text-[11px] font-bold">
                      {d.bloodGroup}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">{d.phone}</td>
                  <td className="px-3.5 py-3 text-xs text-slate-600 hidden md:table-cell">{d.location}</td>
                  <td className="px-3.5 py-3 text-xs hidden md:table-cell">{d.lastDonationDate}</td>
                  <td className="px-3.5 py-3 hidden lg:table-cell">
                    <span className="text-xs font-bold text-[#7F1D1D]">{d.totalDonations}×</span>
                  </td>
                  <td className="px-3.5 py-3">
                    <div className="flex items-center gap-0.5">
                      <button
                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center"
                        title="View"
                        onClick={() => setSheetDonor(d)}
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center hidden md:inline-flex"
                        title="Call"
                        onClick={() => toast(`Calling ${d.name}…`, "info")}
                      >
                        <Phone size={13} />
                      </button>
                      <button
                        className="bg-transparent border-none cursor-pointer p-1.5 rounded-lg text-slate-400 hover:bg-[#7F1D1D]/10 hover:text-[#7F1D1D] transition-all flex items-center hidden md:inline-flex"
                        title="Notify"
                        onClick={() => toast(`Notification sent to ${d.name}`, "info")}
                      >
                        <Mail size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                      <Heart size={22} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600 m-0">No donors found</p>
                    <p className="text-xs text-slate-400 m-0">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="px-3.5 py-2.5 border-t border-slate-100 text-xs text-slate-400">
          Showing {filtered.length} of {donors.length} donors
        </div>
      </div>

      {/* ── Add Donor Dialog ── */}
      {dialogOpen && (
        <div
          className="fixed inset-0 bg-black/35 flex items-center justify-center z-[200]"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="bg-white rounded-[14px] w-full max-w-[440px] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                  <Users size={16} className="text-[#7F1D1D]" />
                </div>
                <h2 className="text-base font-bold text-slate-900 m-0">Register Donor</h2>
              </div>
              <button
                className="bg-transparent border-none cursor-pointer text-slate-400 flex p-0.5 rounded-md hover:bg-slate-100"
                onClick={() => setDialogOpen(false)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Full Name <span className="text-[#7F1D1D]">*</span>
                </label>
                <input
                  className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                  placeholder="Enter full name"
                  value={newDonor.name}
                  onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Blood Group <span className="text-[#7F1D1D]">*</span>
                  </label>
                  <select
                    className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                    value={newDonor.bloodGroup}
                    onChange={(e) => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}
                  >
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Phone <span className="text-[#7F1D1D]">*</span>
                  </label>
                  <input
                    className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                    placeholder="98XXXXXXXX"
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Email</label>
                <input
                  className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                  type="email"
                  placeholder="donor@email.com"
                  value={newDonor.email}
                  onChange={(e) => setNewDonor({ ...newDonor, email: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input
                  className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                  placeholder="City / District"
                  value={newDonor.location}
                  onChange={(e) => setNewDonor({ ...newDonor, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Last Donation</label>
                  <input
                    className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                    type="date"
                    value={newDonor.lastDonationDate}
                    onChange={(e) => setNewDonor({ ...newDonor, lastDonationDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700">Total Donations</label>
                  <input
                    className="h-[38px] border border-slate-300 rounded-lg px-2.5 text-sm outline-none text-slate-900 focus:border-[#7F1D1D] focus:ring-1 focus:ring-[#7F1D1D]"
                    type="number"
                    min="0"
                    value={newDonor.totalDonations}
                    onChange={(e) => setNewDonor({ ...newDonor, totalDonations: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <button
                className="w-full bg-[#7F1D1D] text-white border-none rounded-lg py-2.5 text-sm font-semibold cursor-pointer mt-1 hover:bg-[#991B1B] transition-colors"
                onClick={handleAdd}
              >
                Register Donor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Donor Detail Sheet ── */}
      {sheetDonor && (
        <div
          className="fixed inset-0 bg-black/30 flex justify-end z-[300]"
          onClick={() => setSheetDonor(null)}
        >
          <div
            className="w-full max-w-[420px] bg-white h-screen overflow-y-auto flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Banner */}
            <div className="bg-gradient-to-br from-[#7F1D1D] via-[#991B1B] to-[#B91C1C] px-5 pt-5 pb-7 flex flex-col items-center relative">
              <button
                className="absolute top-3.5 right-3.5 bg-white/15 border-none rounded-lg p-1.5 cursor-pointer text-white flex items-center hover:bg-white/25 transition-colors"
                onClick={() => setSheetDonor(null)}
              >
                <X size={16} />
              </button>
              <div className="w-[72px] h-[72px] rounded-full bg-white/15 border-[3px] border-white/30 flex items-center justify-center text-[26px] font-extrabold text-white mb-3">
                {getInitials(sheetDonor.name)}
              </div>
              <h2 className="text-xl font-extrabold text-white m-0 mb-2.5 text-center">{sheetDonor.name}</h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 bg-white/18 border border-white/30 rounded-full px-2.5 py-1 text-xs font-bold text-white">
                  <Droplets size={11} /> {sheetDonor.bloodGroup}
                </span>
                {(() => {
                  const tier = getDonorTier(sheetDonor.totalDonations);
                  return (
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold bg-white ${tier.color} ${tier.border}`}>
                      <Award size={11} /> {tier.label} Donor
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Stats Strip */}
            <div className="flex items-center justify-around bg-white border border-slate-100 rounded-[14px] mx-4 -mt-[18px] py-3.5 px-2.5 shadow-lg relative z-10">
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[17px] font-extrabold text-[#7F1D1D]">{sheetDonor.totalDonations}</span>
                <span className="text-[10px] text-slate-700 uppercase tracking-wider font-bold">Total Donations</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[17px] font-extrabold text-[#7F1D1D]">{sheetDonor.totalDonations * 450} ml</span>
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Blood Donated</span>
              </div>
              <div className="w-px h-8 bg-slate-100" />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-[17px] font-extrabold text-[#7F1D1D]">{sheetDonor.totalDonations * 3}</span>
                <span className="text-[10px] text-slate-700 font-bold uppercase tracking-wider">Lives Impacted</span>
              </div>
            </div>

            {/* Body */}
            <div className="px-5 py-6 flex-1">
              <p className="text-[11px]  text-slate-800 font-extrabold uppercase tracking-wider m-0 mb-2.5 ">Contact Information</p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <Phone size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Phone</span>
                    <span className="text-sm text-slate-900 font-semibold">{sheetDonor.phone}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-300" />
                </div>
                <div className="h-px bg-slate-100 mx-3.5" />
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <Mail size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Email</span>
                    <span className="text-sm text-slate-900 font-semibold">{sheetDonor.email || "—"}</span>
                  </div>
                  {sheetDonor.email && <ChevronRight size={14} className="text-slate-300" />}
                </div>
                <div className="h-px bg-slate-100 mx-3.5" />
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <MapPin size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Location</span>
                    <span className="text-sm text-slate-900 font-semibold">{sheetDonor.location || "—"}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider m-0 mb-2.5 mt-5">Donation History</p>
              <div className="bg-slate-50 border border-slate-100 rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <Calendar size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Last Donation</span>
                    <span className="text-sm text-slate-900 font-semibold">{sheetDonor.lastDonationDate || "—"}</span>
                  </div>
                </div>
                <div className="h-px bg-slate-100 mx-3.5" />
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <Droplets size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Blood Group</span>
                    <span className="text-sm text-slate-900 font-semibold">{sheetDonor.bloodGroup}</span>
                  </div>
                </div>
                <div className="h-px bg-slate-100 mx-3.5" />
                <div className="flex items-center gap-3 px-3.5 py-3">
                  <div className="w-[30px] h-[30px] rounded-lg flex-shrink-0 bg-[#7F1D1D]/10 border border-[#7F1D1D]/20 flex items-center justify-center">
                    <Award size={13} className="text-[#7F1D1D]" />
                  </div>
                  <div className="flex flex-col flex-1 gap-0.5">
                    <span className="text-[11px] text-slate-400 font-medium">Total Donations</span>
                    <span className="text-sm text-[#7F1D1D] font-bold">{sheetDonor.totalDonations}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex  gap-2.5 mt-6">
                <button
                  className="flex items-center justify-center gap-2 bg-[#7F1D1D] text-white border-none rounded-[10px] py-3 text-sm font-semibold cursor-pointer w-full hover:bg-[#991B1B] transition-colors"
                  onClick={() => toast(`Calling ${sheetDonor.name}…`, "info")}
                >
                  <Phone size={14} /> Call 
                </button>
                <button
                  className="flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 rounded-[10px] py-3 text-sm font-semibold cursor-pointer w-full hover:bg-slate-300 transition-colors"
                  onClick={() => toast(`Notification sent to ${sheetDonor.name}`, "info")}
                >
                  <Mail size={14} /> notify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
