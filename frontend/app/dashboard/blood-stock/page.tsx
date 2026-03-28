'use client';


import { useState } from "react";
import { useData, type BloodPack } from "@/lib/data-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Search, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  Available: "bg-success/10 text-success border-success/20",
  Used: "bg-muted text-muted-foreground border-border",
  Expired: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BloodStockPage() {
  const { bloodPacks, bloodGroups, addBloodPack, updateBloodPackStatus, getDonorById, getLowStockGroups, getStockByGroup, donors } = useData();
  const navigate = useNavigate();
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPack, setNewPack] = useState({ bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available" as BloodPack["status"] });

  const lowStock = getLowStockGroups();
  const stock = getStockByGroup();

  const filtered = bloodPacks.filter((p) => {
    if (filterGroup !== "all" && p.bloodGroup !== filterGroup) return false;
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (searchQuery && !p.packCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newPack.bloodGroup || !newPack.collectionDate || !newPack.expiryDate) {
      toast.error("Please fill all required fields");
      return;
    }
    addBloodPack(newPack);
    setDialogOpen(false);
    setNewPack({ bloodGroup: "", collectionDate: "", expiryDate: "", donorId: "", status: "Available" });
    toast.success("Blood pack added successfully");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Blood Stock</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and track blood inventory</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="h-4 w-4 mr-1" />Add Pack</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Blood Pack</DialogTitle></DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <Label>Blood Group *</Label>
                <Select value={newPack.bloodGroup} onValueChange={(v) => setNewPack({ ...newPack, bloodGroup: v })}>
                  <SelectTrigger><SelectValue placeholder="Select group" /></SelectTrigger>
                  <SelectContent>{bloodGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Donor</Label>
                <Select value={newPack.donorId} onValueChange={(v) => setNewPack({ ...newPack, donorId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select donor" /></SelectTrigger>
                  <SelectContent>{donors.map((d) => <SelectItem key={d.id} value={d.id}>{d.name} ({d.bloodGroup})</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Collection Date *</Label><Input type="date" value={newPack.collectionDate} onChange={(e) => setNewPack({ ...newPack, collectionDate: e.target.value })} /></div>
                <div><Label>Expiry Date *</Label><Input type="date" value={newPack.expiryDate} onChange={(e) => setNewPack({ ...newPack, expiryDate: e.target.value })} /></div>
              </div>
              <Button onClick={handleAdd} className="w-full">Add Blood Pack</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stock Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {bloodGroups.map((g) => {
          const isLow = lowStock.includes(g);
          return (
            <Card key={g} className={`border ${isLow ? "border-destructive/40 bg-destructive/5" : "border-border"}`}>
              <CardContent className="p-3 text-center">
                <p className="text-lg font-bold text-foreground">{g}</p>
                <p className={`text-xl font-bold ${isLow ? "text-destructive" : "text-primary"}`}>{stock[g]?.available ?? 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase">Available</p>
                {isLow && <AlertTriangle className="h-3 w-3 text-destructive mx-auto mt-1" />}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {lowStock.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">Low stock on {lowStock.join(", ")}</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => navigate("/admin/blood-search")}>
              <Search className="h-3 w-3 mr-1" />Find Donors
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters & Table */}
      <Card className="border border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search pack code..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex gap-2">
              <Select value={filterGroup} onValueChange={setFilterGroup}>
                <SelectTrigger className="w-[100px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  {bloodGroups.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[110px] h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Used">Used</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs">Pack Code</TableHead>
                  <TableHead className="text-xs">Group</TableHead>
                  <TableHead className="text-xs">Donor</TableHead>
                  <TableHead className="text-xs">Collected</TableHead>
                  <TableHead className="text-xs">Expires</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.slice(0, 20).map((p) => {
                  const donor = getDonorById(p.donorId);
                  return (
                    <TableRow key={p.id} className="text-sm">
                      <TableCell className="font-mono text-xs">{p.packCode}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{p.bloodGroup}</Badge></TableCell>
                      <TableCell className="text-muted-foreground text-xs">{donor?.name ?? "—"}</TableCell>
                      <TableCell className="text-xs">{p.collectionDate}</TableCell>
                      <TableCell className="text-xs">{p.expiryDate}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border ${statusColors[p.status]}`}>
                          {p.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-3.5 w-3.5" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {p.status === "Available" && <DropdownMenuItem onClick={() => { updateBloodPackStatus(p.id, "Used"); toast.success("Marked as used"); }}>Mark Used</DropdownMenuItem>}
                            {p.status === "Available" && <DropdownMenuItem onClick={() => { updateBloodPackStatus(p.id, "Expired"); toast.success("Marked as expired"); }}>Mark Expired</DropdownMenuItem>}
                            {p.status !== "Available" && <DropdownMenuItem onClick={() => { updateBloodPackStatus(p.id, "Available"); toast.success("Marked as available"); }}>Mark Available</DropdownMenuItem>}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="p-3 border-t border-border text-xs text-muted-foreground">
            Showing {Math.min(filtered.length, 20)} of {filtered.length} packs
          </div>
        </CardContent>
      </Card>
    </div>
  );
}