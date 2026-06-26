"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getAnalyticsOverview,
  getDonorRetention,
} from "@/lib/queries/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [activeTab, setActiveTab] = useState("retention");

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
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
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
      </div>
    );
  }

  const retentionRate = retention?.retentionRate || 0;
  const retentionTrend = retentionRate >= 50 ? "up" : retentionRate >= 30 ? "stable" : "down";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-red-600" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time insights and comprehensive analytics for blood donation management
          </p>
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

        {/* Horizontal Navigation Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Detailed Analytics</CardTitle>
            <CardDescription>
              Explore comprehensive insights across different dimensions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <nav className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveTab("retention")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "retention"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Donor Retention</span>
              </button>
              <button
                onClick={() => setActiveTab("geographic")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "geographic"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Geographic</span>
              </button>
              <button
                onClick={() => setActiveTab("usage")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "usage"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Usage Trends</span>
              </button>
              <button
                onClick={() => setActiveTab("seasonal")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "seasonal"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Calendar className="h-4 w-4" />
                <span>Seasonal Patterns</span>
              </button>
              <button
                onClick={() => setActiveTab("predictions")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "predictions"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Predictions</span>
              </button>
              <button
                onClick={() => setActiveTab("campaigns")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === "campaigns"
                    ? "bg-red-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Campaigns</span>
              </button>
            </nav>
          </CardContent>
        </Card>

        {/* Full Width Content Area */}
        <div className="space-y-6">
          {activeTab === "retention" && <DonorRetentionTab />}
          {activeTab === "geographic" && <GeographicHeatMapTab />}
          {activeTab === "usage" && <UsageTrendsTab />}
          {activeTab === "seasonal" && <SeasonalPatternsTab />}
          {activeTab === "predictions" && <PredictionsTab />}
          {activeTab === "campaigns" && <CampaignsTab />}
        </div>
      </div>
    </div>
  );
}
