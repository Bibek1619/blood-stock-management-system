"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsOverview,
  getDonorRetention,
} from "@/lib/queries/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  MapPin,
  Calendar,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

// Import sub-pages
import DonorRetentionTab from "./components/DonorRetentionTab";
import GeographicHeatMapTab from "./components/GeographicHeatMapTab";
import UsageTrendsTab from "./components/UsageTrendsTab";
import SeasonalPatternsTab from "./components/SeasonalPatternsTab";
import PredictionsTab from "./components/PredictionsTab";
import CampaignsTab from "./components/CampaignsTab";

export default function AnalyticsDashboard() {
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ["analytics-overview"],
    queryFn: getAnalyticsOverview,
  });

  const { data: retention, isLoading: retentionLoading } = useQuery({
    queryKey: ["donor-retention"],
    queryFn: getDonorRetention,
  });

  if (overviewLoading || retentionLoading) {
    return (
      <div className="space-y-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const retentionRate = retention?.retentionRate || 0;
  const retentionTrend = retentionRate >= 50 ? "up" : retentionRate >= 30 ? "stable" : "down";

  const analyticsTabs = [
    { value: "retention", label: "Retention", icon: Users },
    { value: "geographic", label: "Geographic", icon: MapPin },
    { value: "usage", label: "Usage", icon: BarChart3 },
    { value: "seasonal", label: "Seasonal", icon: Calendar },
    { value: "predictions", label: "Predictions", icon: TrendingUp },
    { value: "campaigns", label: "Campaigns", icon: Target },
  ] as const;

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-base">
              Real-time insights and comprehensive analytics for blood donation management
            </p>
          </div>
          <Badge variant="outline" className="h-8 px-3 text-sm">
            Last updated: {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Donations Card */}
        <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">
                {overview?.summary?.totalDonations || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Last {overview?.summary?.period || "30 days"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blood Issues Card */}
        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Blood Issues
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">
                {overview?.summary?.totalIssues || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Last {overview?.summary?.period || "30 days"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Donors Card */}
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Donors
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">
                {retention?.activeDonors || 0}
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={retentionTrend === "up" ? "default" : retentionTrend === "stable" ? "secondary" : "destructive"}
                  className="text-xs"
                >
                  {retentionTrend === "up" && <ArrowUpRight className="h-3 w-3 mr-1" />}
                  {retentionTrend === "stable" && <Minus className="h-3 w-3 mr-1" />}
                  {retentionTrend === "down" && <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {retention?.retentionRate?.toFixed(1)}%
                </Badge>
                <span className="text-xs text-muted-foreground">retention</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expired Units Card */}
        <Card className="border-l-4 border-l-red-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Expired Units
              </CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-red-600">
                {overview?.summary?.totalExpired || 0}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Calendar className="h-3 w-3 mr-1" />
                Last {overview?.summary?.period || "30 days"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Card className="border-t-4 border-t-red-600">
        <CardHeader>
          <CardTitle className="text-2xl">Detailed Analytics</CardTitle>
          <CardDescription>
            Explore comprehensive insights across different dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="retention" className="space-y-5">
            <TabsList className="grid w-full grid-cols-2 gap-2 rounded-2xl border border-border/60 bg-muted/40 p-2 shadow-sm sm:grid-cols-3 xl:grid-cols-6">
              {analyticsTabs.map(({ value, label, icon: Icon }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="h-11 rounded-xl border border-transparent px-3 py-2 text-xs font-medium text-muted-foreground transition-all data-[state=active]:border-red-200 data-[state=active]:bg-background data-[state=active]:text-red-700 data-[state=active]:shadow-sm"
                >
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{label}</span>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="retention" className="mt-5 space-y-4">
              <DonorRetentionTab />
            </TabsContent>

            <TabsContent value="geographic" className="mt-5 space-y-4">
              <GeographicHeatMapTab />
            </TabsContent>

            <TabsContent value="usage" className="mt-5 space-y-4">
              <UsageTrendsTab />
            </TabsContent>

            <TabsContent value="seasonal" className="mt-5 space-y-4">
              <SeasonalPatternsTab />
            </TabsContent>

            <TabsContent value="predictions" className="mt-5 space-y-4">
              <PredictionsTab />
            </TabsContent>

            <TabsContent value="campaigns" className="mt-5 space-y-4">
              <CampaignsTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
