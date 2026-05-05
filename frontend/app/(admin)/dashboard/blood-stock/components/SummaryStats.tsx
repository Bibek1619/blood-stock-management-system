import { Droplets, TrendingDown, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryStatsProps {
  totalAvailable: number;
  criticalStockCount: number;
  totalUsed: number;
  totalExpired: number;
  criticalThreshold: number;
}

export function SummaryStats({
  totalAvailable,
  criticalStockCount,
  totalUsed,
  totalExpired,
  criticalThreshold,
}: SummaryStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500">Total Available</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
            <Droplets size={16} color="#7F1D1D" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-[26px] font-extrabold text-[#7F1D1D] leading-none">{totalAvailable}</div>
          <p className="text-[11px] text-slate-400 mt-1">Packs ready to use</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500">Critical Stock</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-[rgba(194,65,12,0.07)] flex items-center justify-center">
            <TrendingDown size={16} color="#c2410c" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-[26px] font-extrabold text-[#c2410c] leading-none">{criticalStockCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Below {criticalThreshold} units</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500">Used</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-[rgba(100,116,139,0.08)] flex items-center justify-center">
            <CheckCircle2 size={16} color="#64748b" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-[26px] font-extrabold text-[#475569] leading-none">{totalUsed}</div>
          <p className="text-[11px] text-slate-400 mt-1">Packs consumed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-semibold text-slate-500">Expired</CardTitle>
          <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.06)] flex items-center justify-center">
            <Clock size={16} color="#991B1B" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-[26px] font-extrabold text-[#991B1B] leading-none">{totalExpired}</div>
          <p className="text-[11px] text-slate-400 mt-1">Disposed safely</p>
        </CardContent>
      </Card>
    </div>
  );
}
