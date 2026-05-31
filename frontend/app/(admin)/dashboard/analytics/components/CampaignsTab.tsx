"use client";

import { useQuery } from "@tanstack/react-query";
import { getCampaigns } from "@/lib/queries/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Target, TrendingUp, DollarSign } from "lucide-react";

export default function CampaignsTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => getCampaigns(),
  });

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Campaign Effectiveness Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.map((campaign: any) => (
              <Card key={campaign.id} className="border-2">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{campaign.campaignName}</CardTitle>
                      <Badge variant="outline" className="mt-2">{campaign.campaignType}</Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(campaign.startDate).toLocaleDateString()}
                        {campaign.endDate && ` - ${new Date(campaign.endDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Donor Target
                      </p>
                      <p className="text-lg font-bold">
                        {campaign.actualDonors} / {campaign.targetDonors}
                      </p>
                      <p className="text-sm text-green-600">
                        {campaign.metrics.donorEffectiveness.toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        Unit Target
                      </p>
                      <p className="text-lg font-bold">
                        {campaign.actualUnits} / {campaign.targetUnits}
                      </p>
                      <p className="text-sm text-green-600">
                        {campaign.metrics.unitEffectiveness.toFixed(1)}%
                      </p>
                    </div>
                    {campaign.metrics.costPerDonor && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Cost/Donor
                        </p>
                        <p className="text-lg font-bold">
                          ${campaign.metrics.costPerDonor.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {campaign.metrics.costPerUnit && (
                      <div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          Cost/Unit
                        </p>
                        <p className="text-lg font-bold">
                          ${campaign.metrics.costPerUnit.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
