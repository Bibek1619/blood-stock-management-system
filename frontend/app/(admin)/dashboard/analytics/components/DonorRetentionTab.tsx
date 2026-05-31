"use client";

import { useQuery } from "@tanstack/react-query";
import { getDonorRetention, getDonorActivity } from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = {
  ACTIVE: "#10b981",
  INACTIVE: "#f59e0b",
  LAPSED: "#ef4444",
};

export default function DonorRetentionTab() {
  const { data: retention, isLoading: retentionLoading } = useQuery({
    queryKey: ["donor-retention"],
    queryFn: getDonorRetention,
  });

  const { data: activity, isLoading: activityLoading } = useQuery({
    queryKey: ["donor-activity"],
    queryFn: () => getDonorActivity(),
  });

  if (retentionLoading || activityLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  const pieData = retention?.activityBreakdown?.map((item: any) => ({
    name: item.status,
    value: item.count,
    percentage: item.percentage,
  })) || [];

  const barData = retention?.activityBreakdown?.map((item: any) => ({
    status: item.status,
    count: item.count,
  })) || [];

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retention?.totalDonors || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {retention?.activeDonors || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Donated within 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retention?.retentionRate?.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Active / Total donors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Interval</CardTitle>
            <Minus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {retention?.averageDaysBetweenDonations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Days between donations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Donor Activity Distribution</CardTitle>
            <CardDescription>
              Breakdown of donors by activity status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage?.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donor Count by Status</CardTitle>
            <CardDescription>
              Number of donors in each activity category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Status Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Status Definitions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500" />
            <span className="font-medium">ACTIVE:</span>
            <span className="text-muted-foreground">Donated within the last 90 days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-500" />
            <span className="font-medium">INACTIVE:</span>
            <span className="text-muted-foreground">Last donation 90-365 days ago</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span className="font-medium">LAPSED:</span>
            <span className="text-muted-foreground">Haven't donated in over a year</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
