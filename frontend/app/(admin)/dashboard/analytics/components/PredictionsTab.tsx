"use client";

import { useQuery } from "@tanstack/react-query";
import { getPredictions } from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, AlertCircle } from "lucide-react";

export default function PredictionsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["predictions"],
    queryFn: () => getPredictions({ days: 7 }),
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  // Group predictions by date
  const groupedData: { [key: string]: any } = {};
  data?.forEach((pred: any) => {
    const dateKey = new Date(pred.predictionDate).toISOString().split('T')[0];
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {
        date: dateKey,
        total: 0,
      };
    }
    groupedData[dateKey].total += pred.predictedDemand;
    groupedData[dateKey][pred.bloodGroup] = pred.predictedDemand;
  });

  const chartData = Object.values(groupedData);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Blood Demand Forecast (Next 7 Days)
          </CardTitle>
          <CardDescription>
            Predicted blood demand based on historical patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total Predicted Demand" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prediction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {data?.map((pred: any) => (
              <div key={`${pred.predictionDate}-${pred.bloodGroup}`} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-medium">{new Date(pred.predictionDate).toLocaleDateString()}</p>
                  <p className="text-sm text-muted-foreground">{pred.bloodGroup}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{pred.predictedDemand} units</p>
                  <p className="text-sm text-muted-foreground">
                    {(pred.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            About Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-900">
          <p>
            Predictions are based on the last 30 days of blood issue data and consider day-of-week patterns.
            Higher confidence scores indicate more consistent historical demand patterns.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
