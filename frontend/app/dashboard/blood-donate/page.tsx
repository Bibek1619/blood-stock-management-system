'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart, Plus, Search, User, Building2, Droplets, TrendingUp, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { BLOOD_GROUPS } from "@/lib/data";
import { useData } from "@/lib/data-store";

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BloodDonatePage() {
  const router = useRouter();
  const { donations } = useData();
  const [filterType, setFilterType] = useState<string>("all");
  const [filterBloodGroup, setFilterBloodGroup] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Calculate stats=
  const totalUnits = donations.reduce((sum, d) => sum + d.units, 0);
  const totalDonors = donations.filter(d => d.donationType === "person").length;
  const totalOrganizations = donations.filter(d => d.donationType === "organization").length;
  const recentDonations = donations.slice(0, 5);

  // Filter donations
  const filteredDonations = donations.filter((d) => {
    if (filterType !== "all" && d.donationType !== filterType) return false;
    if (filterBloodGroup !== "all" && d.bloodGroup !== filterBloodGroup) return false;
    if (searchQuery && !d.recipientName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="w-full p-6 md:p-8 bg-background min-h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.2)] flex items-center justify-center">
            <Heart size={18} color="#7F1D1D" />
          </div>
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-900 m-0 tracking-tight">Blood Donations</h1>
            <p className="text-[13px] text-slate-500 mt-[2px]">Track and manage blood donation records</p>
          </div>
        </div>
        <Button 
          className="bg-[#7F1D1D] hover:bg-[#991B1B]"
          onClick={() => router.push('/dashboard/blood-donate/donate-form')}
        >
          <Plus size={14} className="mr-1.5" /> Record Donation
        </Button>
      </div>

      {/* ── Summary Stat Cards ── */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Units Donated</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplets size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#7F1D1D] leading-none">{totalUnits}</div>
            <p className="text-[11px] text-slate-400 mt-1">Blood units collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Individual Donors</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(59,130,246,0.08)] flex items-center justify-center">
              <User size={16} color="#3b82f6" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#3b82f6] leading-none">{totalDonors}</div>
            <p className="text-[11px] text-slate-400 mt-1">Personal donations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Organizations</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(168,85,247,0.08)] flex items-center justify-center">
              <Building2 size={16} color="#a855f7" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#a855f7] leading-none">{totalOrganizations}</div>
            <p className="text-[11px] text-slate-400 mt-1">Organization drives</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Records</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(34,197,94,0.08)] flex items-center justify-center">
              <CheckCircle2 size={16} color="#22c55e" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#22c55e] leading-none">{donations.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Donation entries</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent Donations ── */}
      <Card className="mb-5">
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
              <TrendingUp size={15} color="#7F1D1D" />
            </div>
            <div>
              <CardTitle className="text-sm">Recent Donations</CardTitle>
              <CardDescription className="text-xs">Latest 5 donation records</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDonations.map((donation) => (
              <div key={donation.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    donation.donationType === "person" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {donation.donationType === "person" ? <User size={18} /> : <Building2 size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{donation.recipientName}</p>
                    <p className="text-xs text-slate-500">{new Date(donation.donationDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                    {donation.bloodGroup}
                  </Badge>
                  <span className="text-sm font-bold text-slate-700">{donation.units} {donation.units === 1 ? 'unit' : 'units'}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Filters ── */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative flex-1">
          <Search size={13} color="#94a3b8" className="absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            className="pl-8"
            placeholder="Search by name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">Individual</SelectItem>
            <SelectItem value="organization">Organization</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterBloodGroup} onValueChange={setFilterBloodGroup}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Groups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Blood Groups</SelectItem>
            {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        {(filterType !== "all" || filterBloodGroup !== "all" || searchQuery) && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setFilterType("all");
              setFilterBloodGroup("all");
              setSearchQuery("");
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* ── All Donations Table ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All Donation Records</CardTitle>
          <CardDescription className="text-xs">
            Showing {filteredDonations.length} of {donations.length} donations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Blood Group</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Units</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDonations.length > 0 ? (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(donation.donationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={donation.donationType === "person" 
                          ? "bg-blue-50 text-blue-700 border-blue-200" 
                          : "bg-purple-50 text-purple-700 border-purple-200"
                        }
                      >
                        {donation.donationType === "person" ? <User size={12} className="mr-1" /> : <Building2 size={12} className="mr-1" />}
                        {donation.donationType === "person" ? "Individual" : "Organization"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{donation.recipientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                        {donation.bloodGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">—</TableCell>
                    <TableCell className="text-xs text-slate-500">—</TableCell>
                    <TableCell className="text-right font-semibold">{donation.units}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                    No donations match your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
