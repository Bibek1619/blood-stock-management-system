'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle, Droplets, Home, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { SummaryStats, BloodInventoryByGroup, BloodPacksTable } from "./components";

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

export default function BloodStockPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filterGroup, setFilterGroup] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
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
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (error: any) {
      toast.error('Failed to update status', {
        description: error.response?.data?.message || 'Please try again',
      });
    }
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
      <SummaryStats
        totalAvailable={stats.totalAvailable}
        criticalStockCount={stats.criticalStockGroups.length}
        totalUsed={stats.totalUsed}
        totalExpired={stats.totalExpired}
        criticalThreshold={CRITICAL_STOCK_THRESHOLD}
      />

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
      <BloodInventoryByGroup
        bloodGroups={BLOOD_GROUPS}
        stockByGroup={stats.stockByGroup}
        lowStockThreshold={LOW_STOCK_THRESHOLD}
        criticalStockThreshold={CRITICAL_STOCK_THRESHOLD}
        isLoading={isLoadingSummary}
        onGroupClick={setFilterGroup}
      />

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

      {/* Blood Packs Table */}
      <BloodPacksTable
        packs={filteredPacks}
        pagination={pagination}
        onStatusUpdate={handleUpdateStatus}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
