"use client";

import { useQuery } from "@tanstack/react-query";
import { getSeasonalPatterns } from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function SeasonalPatternsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["seasonal-patterns"],
    queryFn: () => getSeasonalPatterns({ months: 12 }),
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Seasonal Donation Patterns (Last 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalDonations" fill="#10b981" name="Donations" />
            <Bar dataKey="totalUnits" fill="#3b82f6" name="Units" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
