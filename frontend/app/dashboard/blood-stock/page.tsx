'use client';

import { useState } from "react";
import { Plus, MoreHorizontal, Search, AlertTriangle, Droplets, X, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast as sonnerToast } from "sonner";
import {
  BLOOD_GROUPS,
  MOCK_DONORS,
  MOCK_BLOOD_PACKS,
  PACK_STATUS_CONFIG,
  getStockByGroup,
  getLowStockGroups,
  getDonorById,
  type BloodGroup,
  type PackStatus,
  type BloodPack,
  type Donor,
  type StockByGroup,
} from "@/lib/data";

const LOW_STOCK_THRESHOLD = 2;

let packCounter = MOCK_BLOOD_PACKS.length + 1;
const generatePackCode = () => {
  const n = String(packCounter).padStart(5, "0");
  return `BP-${new Date().getFullYear()}${n}`;
};

export default function BloodStockPage() {
  const [bloodPacks, setBloodPacks]     = useState<BloodPack[]>(MOCK_BLOOD_PACKS);
  const [filterGroup, setFilterGroup]   = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery]   = useState<string>("");
  const [dialogOpen, setDialogOpen]     = useState<boolean>(false);
  const [openMenuId, setOpenMenuId]     = useState<string | null>(null);
  const [newPack, setNewPack] = useState<{
    bloodGroup: string;
    collectionDate: string;
    expiryDate: string;
    donorId: string;
    status: string;
  }>({
    bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available",
  });


  const stock    = getStockByGroup(bloodPacks);
  const lowStock = getLowStockGroups(bloodPacks);

  const totalAvailable = bloodPacks.filter((p) => p.status === "Available").length;
  const totalUsed      = bloodPacks.filter((p) => p.status === "Used").length;
  const totalExpired   = bloodPacks.filter((p) => p.status === "Expired").length;

  const filtered = bloodPacks.filter((p) => {
    if (filterGroup  !== "all" && p.bloodGroup !== filterGroup)  return false;
    if (filterStatus !== "all" && p.status     !== filterStatus) return false;
    if (searchQuery && !p.packCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newPack.bloodGroup || !newPack.collectionDate || !newPack.expiryDate) {
      sonnerToast.error("Please fill all required fields");
      return;
    }
    const pack: BloodPack = {
      id:             `bp${Date.now()}`,
      packCode:       generatePackCode(),
      bloodGroup:     newPack.bloodGroup as BloodGroup,
      donorId:        newPack.donorId,
      collectionDate: newPack.collectionDate,
      expiryDate:     newPack.expiryDate,
      status:         "Available" as PackStatus,
    };
    packCounter++;
    setBloodPacks((prev) => [pack, ...prev]);
    setDialogOpen(false);
    setNewPack({ bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available" });
    sonnerToast.success("Blood pack added successfully");
  };

  const updateStatus = (id: string, status: PackStatus) => {
    setBloodPacks((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    setOpenMenuId(null);
    sonnerToast.success(`Marked as ${status}`);
  };

  return (
    <div className="w-full p-2 md:p-2 bg-background min-h-[calc(100vh-3.5rem)]">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
            <Droplets size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">Blood Stock</h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">Manage and track blood inventory</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#7F1D1D] hover:bg-[#991B1B]">
              <Plus size={14} className="mr-1.5" /> Add Pack
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
                  <Droplets size={16} color="#7F1D1D" />
                </div>
                <DialogTitle>Add Blood Pack</DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex flex-col gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="bloodGroup">
                  Blood Group <span className="text-[#7F1D1D]">*</span>
                </Label>
                <Select value={newPack.bloodGroup} onValueChange={(value) => setNewPack({ ...newPack, bloodGroup: value })}>
                  <SelectTrigger id="bloodGroup">
                    <SelectValue placeholder="Select group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="donor">Donor</Label>
                <Select value={newPack.donorId} onValueChange={(value) => setNewPack({ ...newPack, donorId: value })}>
                  <SelectTrigger id="donor">
                    <SelectValue placeholder="Select donor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_DONORS.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="collectionDate">
                    Collection Date <span className="text-[#7F1D1D]">*</span>
                  </Label>
                  <Input
                    id="collectionDate"
                    type="date"
                    value={newPack.collectionDate}
                    onChange={(e) => setNewPack({ ...newPack, collectionDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expiryDate">
                    Expiry Date <span className="text-[#7F1D1D]">*</span>
                  </Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newPack.expiryDate}
                    onChange={(e) => setNewPack({ ...newPack, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full bg-[#7F1D1D] hover:bg-[#991B1B] mt-2"
                onClick={handleAdd}
              >
                Add Blood Pack
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Available</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplets size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#7F1D1D] leading-none">{totalAvailable}</div>
            <p className="text-[11px] text-slate-400 mt-1">Packs ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Low Stock Groups</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(194,65,12,0.07)] flex items-center justify-center">
              <TrendingDown size={16} color="#c2410c" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#c2410c] leading-none">{lowStock.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Used</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(100,116,139,0.08)] flex items-center justify-center">
              <CheckCircle2 size={16} color="#64748b" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#475569] leading-none">{totalUsed}</div>
            <p className="text-[11px] text-slate-400 mt-1">Packs consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Expired</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.06)] flex items-center justify-center">
              <Clock size={16} color="#991B1B" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#991B1B] leading-none">{totalExpired}</div>
            <p className="text-[11px] text-slate-400 mt-1">Disposed safely</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Low Stock Alert Banner ── */}
      {lowStock.length > 0 && (
        <div className="bg-[rgba(127,29,29,0.04)] border border-[rgba(127,29,29,0.2)] rounded-[10px] p-2.5 px-3.5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} color="#7F1D1D" />
            <span className="text-[13px] font-medium text-[#7F1D1D]">
              Low stock alert:&nbsp;<strong>{lowStock.join(", ")}</strong>
            </span>
          </div>
          <Button variant="outline" size="sm" className="h-8">
            <Search size={12} className="mr-1.5" /> Find Donors
          </Button>
        </div>
      )}

      {/* ── Blood Inventory by Group ── */}
      <p className="text-[13px] font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
        Blood Inventory by Group
      </p>
      <div className="grid grid-cols-8 gap-2.5 mb-5">
        {BLOOD_GROUPS.map((g) => {
          const isLow  = lowStock.includes(g);
          const count  = stock[g]?.available ?? 0;
          return (
            <div
              key={g}
              className={`rounded-xl p-3.5 px-2.5 pb-3 transition-shadow hover:shadow-sm ${
                isLow 
                  ? 'bg-[rgba(127,29,29,0.03)] border border-[rgba(127,29,29,0.35)]' 
                  : 'bg-white border border-slate-200'
              }`}
            >
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider m-0">Group</p>
              <p className="text-[17px] font-extrabold text-slate-900 leading-none my-1">{g}</p>
              <p className="text-[28px] font-extrabold text-[#7F1D1D] leading-tight m-0">{count}</p>
              <p className="text-[9px] text-slate-400 uppercase tracking-wider m-0">units</p>
              {isLow && (
                <div className="inline-flex items-center gap-1 mt-1.5 bg-[rgba(127,29,29,0.1)] border border-[rgba(127,29,29,0.2)] rounded-full px-1.5 py-0.5 text-[9px] font-bold text-[#7F1D1D] uppercase tracking-wide">
                  <AlertTriangle size={8} color="#7F1D1D" /> Low
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative flex-1">
          <Search size={13} color="#94a3b8" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Search pack code…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterGroup} onValueChange={setFilterGroup}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Used">Used</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pack Code</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Collected</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.slice(0, 20).map((p) => {
              const donor = getDonorById(p.donorId);
              const ss    = PACK_STATUS_CONFIG[p.status] ?? PACK_STATUS_CONFIG.Available;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <span className="font-mono text-xs text-slate-600">{p.packCode}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                      {p.bloodGroup}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {donor?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs">{p.collectionDate}</TableCell>
                  <TableCell className="text-xs">{p.expiryDate}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="gap-1.5"
                      style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu open={openMenuId === p.id} onOpenChange={(open) => setOpenMenuId(open ? p.id : null)}>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {p.status === "Available" && (
                          <>
                            <DropdownMenuItem onClick={() => updateStatus(p.id, "Used")}>
                              Mark Used
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateStatus(p.id, "Expired")}>
                              Mark Expired
                            </DropdownMenuItem>
                          </>
                        )}
                        {p.status !== "Available" && (
                          <DropdownMenuItem onClick={() => updateStatus(p.id, "Available")}>
                            Mark Available
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <div className="px-3.5 py-2.5 border-t text-xs text-slate-400">
          Showing {Math.min(filtered.length, 20)} of {filtered.length} packs
        </div>
      </Card>

      {/* ── Add Pack Dialog ── */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/35 flex items-center justify-center z-[200]" onClick={() => setDialogOpen(false)}>
          <div className="bg-white rounded-[14px] w-full max-w-[440px] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.15)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-[34px] h-[34px] rounded-[9px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
                  <Droplets size={16} color="#7F1D1D" />
                </div>
                <h2 className="text-base font-bold text-slate-900 m-0">Add Blood Pack</h2>
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
                <label className="text-xs font-semibold text-gray-700">
                  Blood Group <span className="text-[#7F1D1D]">*</span>
                </label>
                <select
                  className="h-[38px] border border-gray-300 rounded-lg px-2.5 text-[13px] outline-none bg-white text-slate-900"
                  value={newPack.bloodGroup}
                  onChange={(e) => setNewPack({ ...newPack, bloodGroup: e.target.value })}
                >
                  <option value="">Select group</option>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-700">Donor</label>
                <select
                  className="h-[38px] border border-gray-300 rounded-lg px-2.5 text-[13px] outline-none bg-white text-slate-900"
                  value={newPack.donorId}
                  onChange={(e) => setNewPack({ ...newPack, donorId: e.target.value })}
                >
                  <option value="">Select donor (optional)</option>
                  {MOCK_DONORS.map((d) => (
                    <option key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Collection Date <span className="text-[#7F1D1D]">*</span></label>
                  <input
                    type="date"
                    className="h-[38px] border border-gray-300 rounded-lg px-2.5 text-[13px] outline-none text-slate-900"
                    value={newPack.collectionDate}
                    onChange={(e) => setNewPack({ ...newPack, collectionDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-700">Expiry Date <span className="text-[#7F1D1D]">*</span></label>
                  <input
                    type="date"
                    className="h-[38px] border border-gray-300 rounded-lg px-2.5 text-[13px] outline-none text-slate-900"
                    value={newPack.expiryDate}
                    onChange={(e) => setNewPack({ ...newPack, expiryDate: e.target.value })}
                  />
                </div>
              </div>
              <button 
                className="w-full bg-[#7F1D1D] text-white border-none rounded-lg py-2.5 text-sm font-semibold cursor-pointer mt-1 hover:bg-[#991B1B] transition-colors"
                onClick={handleAdd}
              >
                Add Blood Pack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
