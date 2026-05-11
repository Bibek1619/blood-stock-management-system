import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BloodInventoryByGroupProps {
  bloodGroups: string[];
  stockByGroup: Record<string, number>;
  lowStockThreshold: number;
  criticalStockThreshold: number;
  isLoading: boolean;
  onGroupClick: (group: string) => void;
}

export function BloodInventoryByGroup({
  bloodGroups,
  stockByGroup,
  lowStockThreshold,
  criticalStockThreshold,
  isLoading,
  onGroupClick,
}: BloodInventoryByGroupProps) {
  return (
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
            {isLoading && (
              <div className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                <span className="text-gray-500">Updating...</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {bloodGroups.map((bloodGroup) => {
            const available = stockByGroup[bloodGroup] || 0;
            const isLowStock = available < lowStockThreshold;
            const isCritical = available < criticalStockThreshold;
            
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
                onClick={() => onGroupClick(bloodGroup)}
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
                  {isLoading ? '...' : available}
                </p>
                <p className="text-xs text-gray-600">units</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
