"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsageTrends } from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function UsageTrendsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["usage-trends"],
    queryFn: () => getUsageTrends({ days: 30 }),
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blood Usage Trends (Last 30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalUnits" stroke="#3b82f6" name="Total Units" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
