"use client";

import { useQuery } from "@tanstack/react-query";
import { getGeographicData } from "@/lib/queries/analytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MapPin, Users, Activity } from "lucide-react";

export default function GeographicHeatMapTab() {
  const { data, isLoading } = useQuery({
    queryKey: ["geographic-data"],
    queryFn: () => getGeographicData(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  // Group data by city
  const citiesMap = new Map();
  data?.forEach((item: any) => {
    if (!citiesMap.has(item.city)) {
      citiesMap.set(item.city, {
        city: item.city,
        latitude: item.latitude,
        longitude: item.longitude,
        bloodGroups: [],
        totalDonors: 0,
        totalActive: 0,
      });
    }
    const cityData = citiesMap.get(item.city);
    cityData.bloodGroups.push({
      bloodGroup: item.bloodGroup,
      donorCount: item.donorCount,
      activeDonorCount: item.activeDonorCount,
    });
    cityData.totalDonors += item.donorCount;
    cityData.totalActive += item.activeDonorCount;
  });

  const cities = Array.from(citiesMap.values());

  if (cities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Geographic Distribution</CardTitle>
          <CardDescription>No geographic data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Add donors with city information to see geographic distribution
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Geographic Distribution</h3>
        <p className="text-sm text-muted-foreground">
          Donor distribution across different cities and blood groups
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cities.map((city: any) => (
          <Card key={city.city} className="hover:shadow-lg transition-shadow border-t-4 border-t-red-600">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" />
                    {city.city}
                  </CardTitle>
                  {city.latitude && city.longitude && (
                    <CardDescription className="text-xs">
                      {city.latitude.toFixed(4)}, {city.longitude.toFixed(4)}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="secondary" className="text-lg font-bold">
                  {city.totalDonors}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    Total Donors
                  </div>
                  <div className="text-2xl font-bold">{city.totalDonors}</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Active
                  </div>
                  <div className="text-2xl font-bold text-green-600">{city.totalActive}</div>
                </div>
              </div>

              {/* Blood Groups */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Blood Groups</div>
                <div className="space-y-2">
                  {city.bloodGroups.map((bg: any) => (
                    <div
                      key={bg.bloodGroup}
                      className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="font-mono font-bold">
                          {bg.bloodGroup.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">{bg.donorCount} donors</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {bg.activeDonorCount} active
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
