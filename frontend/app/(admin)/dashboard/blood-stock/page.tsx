'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, MoreHorizontal, Search, AlertTriangle, Droplets, TrendingDown, CheckCircle2, Clock, Home, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { toast } from "sonner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useBloodPacks, useBloodStockSummary, useUpdateBloodPackStatus } from "@/lib/queries/bloodStock";
import { useQueryClient } from "@tanstack/react-query";

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const LOW_STOCK_THRESHOLD = 5;
const CRITICAL_STOCK_THRESHOLD = 3;

// Blood group mapping from DB format to display format
const bloodGroupMap: Record<string, string> = {
  'A_POSITIVE': 'A+',
  'A_NEGATIVE': 'A-',
  'B_POSITIVE': 'B+',
  'B_NEGATIVE': 'B-',
  'AB_POSITIVE': 'AB+',
  'AB_NEGATIVE': 'AB-',
  'O_POSITIVE': 'O+',
  'O_NEGATIVE': 'O-',
};

// Status configuration
const PACK_STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  AVAILABLE: { bg: 'rgba(34, 197, 94, 0.08)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.2)', dot: '#22c55e' },
  USED: { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569', border: 'rgba(100, 116, 139, 0.2)', dot: '#64748b' },
  EXPIRED: { bg: 'rgba(239, 68, 68, 0.08)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.2)', dot: '#ef4444' },
  RESERVED: { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.2)', dot: '#3b82f6' },
};

export default function BloodStockPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pageLimit = 20;

  // Fetch data using TanStack Query with pagination
  const { data: packsData, isLoading: isLoadingPacks } = useBloodPacks({}, currentPage, pageLimit);
  const { data: stockSummary = [], isLoading: isLoadingSummary } = useBloodStockSummary();
  const updateStatus = useUpdateBloodPackStatus();

  // Extract blood packs and pagination info
  const bloodPacks = Array.isArray(packsData) ? packsData : (packsData?.data || []);
  const pagination = !Array.isArray(packsData) ? packsData?.pagination : undefined;

  // Calculate statistics
  const stats = useMemo(() => {
    // Use API stock summary for accurate totals across all data (not just current page)
    const totalAvailable = stockSummary.reduce((sum, stock) => sum + stock.available, 0);
    const totalUsed = stockSummary.reduce((sum, stock) => sum + stock.used, 0);
    const totalExpired = stockSummary.reduce((sum, stock) => sum + stock.expired, 0);

    // Use dynamic stock summary from API instead of calculating from filtered packs
    const stockByGroup: Record<string, number> = {};
    
    // Convert API stock summary to display format
    stockSummary.forEach((stock) => {
      const displayGroup = bloodGroupMap[stock.bloodGroup] || stock.bloodGroup;
      stockByGroup[displayGroup] = stock.available;
    });

    // Ensure all blood groups are represented (even with 0 count)
    BLOOD_GROUPS.forEach((group) => {
      if (!(group in stockByGroup)) {
        stockByGroup[group] = 0;
      }
    });

    const lowStockGroups = BLOOD_GROUPS.filter(
      (group) => (stockByGroup[group] || 0) < LOW_STOCK_THRESHOLD
    );

    const criticalStockGroups = BLOOD_GROUPS.filter(
      (group) => (stockByGroup[group] || 0) < CRITICAL_STOCK_THRESHOLD
    );

    return {
      totalAvailable,
      totalUsed,
      totalExpired,
      lowStockGroups,
      criticalStockGroups,
      stockByGroup,
    };
  }, [bloodPacks, stockSummary]);

  // Filter blood packs
  const filteredPacks = useMemo(() => {
    return bloodPacks.filter((p) => {
      const displayGroup = bloodGroupMap[p.bloodGroup] || p.bloodGroup;
      
      if (filterGroup !== "all" && displayGroup !== filterGroup) return false;
      if (filterStatus !== "all" && p.status !== filterStatus) return false;
      if (searchQuery && !p.packCode.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [bloodPacks, filterGroup, filterStatus, searchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Invalidate and refetch both queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['bloodPacks'] }),
        queryClient.invalidateQueries({ queryKey: ['bloodStock', 'summary'] }),
      ]);
      toast.success('Stock data refreshed successfully');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      setOpenMenuId(null);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoadingPacks || isLoadingSummary) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#7F1D1D]" />
          <p className="text-sm text-slate-600">Loading blood stock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-2 md:p-2 bg-background min-h-[calc(100vh-3.5rem)]" suppressHydrationWarning>
      {/* Breadcrumbs */}
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
              <BreadcrumbPage>Blood Stock</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
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
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button 
            className="bg-[#7F1D1D] hover:bg-[#991B1B]"
            onClick={() => router.push('/dashboard/blood-donate/blood-collection')}
          >
            <Plus size={14} className="mr-1.5" /> Add Pack
          </Button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Available</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplets size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#7F1D1D] leading-none">{stats.totalAvailable}</div>
            <p className="text-[11px] text-slate-400 mt-1">Packs ready to use</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Critical Stock</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(194,65,12,0.07)] flex items-center justify-center">
              <TrendingDown size={16} color="#c2410c" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[26px] font-extrabold text-[#c2410c] leading-none">{stats.criticalStockGroups.length}</div>
            <p className="text-[11px] text-slate-400 mt-1">Below {CRITICAL_STOCK_THRESHOLD} units</p>
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
            <div className="text-[26px] font-extrabold text-[#475569] leading-none">{stats.totalUsed}</div>
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
            <div className="text-[26px] font-extrabold text-[#991B1B] leading-none">{stats.totalExpired}</div>
            <p className="text-[11px] text-slate-400 mt-1">Disposed safely</p>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Banner */}
      {stats.criticalStockGroups.length > 0 && (
        <div className="bg-[rgba(127,29,29,0.04)] border border-[rgba(127,29,29,0.2)] rounded-[10px] p-2.5 px-3.5 flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} color="#7F1D1D" />
            <span className="text-[13px] font-medium text-[#7F1D1D]">
              Critical stock alert:&nbsp;<strong>{stats.criticalStockGroups.join(", ")}</strong>
            </span>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => router.push('/dashboard/blood-search')}>
            <Search size={12} className="mr-1.5" /> Find Donors
          </Button>
        </div>
      )}

      {/* Blood Inventory by Group */}
      <Card className="mb-5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-gray-900">All Blood Groups Overview</p>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Safe Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-gray-600">Low Stock</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Critical</span>
              </div>
              {isLoadingSummary && (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  <span className="text-gray-500">Updating...</span>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {BLOOD_GROUPS.map((bloodGroup) => {
              const available = stats.stockByGroup[bloodGroup] || 0;
              const isLowStock = available < LOW_STOCK_THRESHOLD;
              const isCritical = available < CRITICAL_STOCK_THRESHOLD;
              
              return (
                <div
                  key={bloodGroup}
                  className={`text-center p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer ${
                    isCritical 
                      ? 'bg-red-50 border-red-200' 
                      : isLowStock 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-green-50 border-green-200'
                  }`}
                  onClick={() => setFilterGroup(bloodGroup)}
                  title={`Click to filter by ${bloodGroup} blood group`}
                >
                  <p className={`text-lg font-bold mb-2 ${
                    isCritical 
                      ? 'text-red-700' 
                      : isLowStock 
                      ? 'text-orange-700' 
                      : 'text-green-700'
                  }`}>
                    {bloodGroup}
                  </p>
                  <p className={`text-2xl font-bold mb-1 ${
                    isCritical 
                      ? 'text-red-600' 
                      : isLowStock 
                      ? 'text-orange-600' 
                      : 'text-green-600'
                  }`}>
                    {isLoadingSummary ? '...' : available}
                  </p>
                  <p className="text-xs text-gray-600">units</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
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
            {BLOOD_GROUPS.map((g) => (
              <SelectItem key={g} value={g}>
                {g} ({stats.stockByGroup[g] || 0} units)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="USED">Used</SelectItem>
            <SelectItem value="EXPIRED">Expired</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
          </SelectContent>
        </Select>
        {(filterGroup !== "all" || filterStatus !== "all" || searchQuery) && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              setFilterGroup("all");
              setFilterStatus("all");
              setSearchQuery("");
            }}
            className="whitespace-nowrap"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pack Code</TableHead>
              <TableHead>Group</TableHead>
              <TableHead>Donor</TableHead>
              <TableHead>Collection Type</TableHead>
              <TableHead>Collected</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPacks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                  No blood packs found. Click "Add Pack" to record a donation.
                </TableCell>
              </TableRow>
            ) : (
              filteredPacks.slice(0, 50).map((p) => {
                const displayGroup = bloodGroupMap[p.bloodGroup] || p.bloodGroup;
                const ss = PACK_STATUS_CONFIG[p.status] ?? PACK_STATUS_CONFIG.AVAILABLE;
                
                // Format collection type
                const collectionTypeMap: Record<string, { label: string; color: string }> = {
                  'EVENT': { label: 'Event', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                  'WEB_DONOR': { label: 'Web Donor', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                  'ORGANIZATION_DONOR': { label: 'Organization', color: 'bg-green-100 text-green-700 border-green-200' },
                };
                const collectionType = collectionTypeMap[p.storageLocation || ''] || { label: p.storageLocation || 'N/A', color: 'bg-gray-100 text-gray-700 border-gray-200' };
                
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <span className="font-mono text-xs text-slate-600">{p.packCode}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[rgba(127,29,29,0.08)] text-[#7F1D1D] border-[rgba(127,29,29,0.2)]">
                        {displayGroup}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {p.donor?.user?.name ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs ${collectionType.color}`}>
                        {collectionType.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(p.collectionDate)}</TableCell>
                    <TableCell className="text-xs">{formatDate(p.expiryDate)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className="gap-1.5"
                        style={{ background: ss.bg, color: ss.text, borderColor: ss.border }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: ss.dot }} />
                        {p.status.charAt(0) + p.status.slice(1).toLowerCase()}
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
                          {p.status === "AVAILABLE" && (
                            <>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, "USED")}>
                                Mark Used
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, "EXPIRED")}>
                                Mark Expired
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, "RESERVED")}>
                                Mark Reserved
                              </DropdownMenuItem>
                            </>
                          )}
                          {p.status !== "AVAILABLE" && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(p.id, "AVAILABLE")}>
                              Mark Available
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
          <div className="px-3.5 py-2.5 border-t text-xs text-slate-400">
            Showing {Math.min(filteredPacks.length, 50)} of {filteredPacks.length} packs
          </div>
        )}
      </Card>
    </div>
  );
}
