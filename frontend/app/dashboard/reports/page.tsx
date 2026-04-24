'use client';

import { useEffect, useState } from 'react';
import {
  Calendar, Activity, Droplet, TrendingUp, Home, Users, Award,
  AlertTriangle, TrendingDown, Package, Clock, MapPin, Target,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area, Legend,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, 
  PolarRadiusAxis, Radar,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useData } from "@/lib/data-store";
import { BLOOD_GROUPS, getDonorTier } from "@/lib/data";

// ── Types ──────────────────────────────────────────────────────────────────────
type MonthlyData = {
  month: string;
  collections: number;
  issues: number;
  events: number;
};

type BloodGroupData = {
  name: string;
  available: number;
  used: number;
  expired: number;
};

type DonorTierData = {
  name: string;
  value: number;
  color: string;
};

type EventEffectivenessData = {
  event: string;
  participants: number;
  collections: number;
  efficiency: number;
};

type ExpiryData = {
  status: string;
  count: number;
  color: string;
};

// ── Custom Tooltips ────────────────────────────────────────────────────────────
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      {payload.map((entry: any, index: number) => (
        <p key={index} style={{ ...s.tooltipValue, color: entry.color, marginTop: 4, fontSize: 13 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{payload[0].name}</p>
      <p style={{ ...s.tooltipValue, color: payload[0].payload.color }}>
        {payload[0].value} donors
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function ReportsPage() {
  const { donors, bloodPacks, events, getStockByGroup } = useData();
  
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [bloodGroupData, setBloodGroupData] = useState<BloodGroupData[]>([]);
  const [donorTierData, setDonorTierData] = useState<DonorTierData[]>([]);
  const [eventEffectiveness, setEventEffectiveness] = useState<EventEffectivenessData[]>([]);
  const [expiryData, setExpiryData] = useState<ExpiryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Monthly trend data (last 6 months)
      const demoMonthlyData: MonthlyData[] = [
        { month: 'Jan', collections: 45, issues: 38, events: 3 },
        { month: 'Feb', collections: 52, issues: 41, events: 4 },
        { month: 'Mar', collections: 48, issues: 45, events: 3 },
        { month: 'Apr', collections: 61, issues: 52, events: 5 },
        { month: 'May', collections: 58, issues: 49, events: 4 },
        { month: 'Jun', collections: 65, issues: 58, events: 6 },
      ];
      setMonthlyData(demoMonthlyData);

      // Blood group distribution
      const stockByGroup = getStockByGroup();
      const bgData: BloodGroupData[] = BLOOD_GROUPS.map(bg => ({
        name: bg,
        available: stockByGroup[bg]?.available || 0,
        used: stockByGroup[bg]?.used || 0,
        expired: stockByGroup[bg]?.expired || 0,
      }));
      setBloodGroupData(bgData);

      // Donor tier distribution
      const tierCounts = { Platinum: 0, Gold: 0, Silver: 0, Bronze: 0 };
      donors.forEach(donor => {
        const tier = getDonorTier(donor.totalDonations);
        tierCounts[tier.label as keyof typeof tierCounts]++;
      });
      
      const tierData: DonorTierData[] = [
        { name: 'Platinum (7+)', value: tierCounts.Platinum, color: '#9333ea' },
        { name: 'Gold (5-6)', value: tierCounts.Gold, color: '#f59e0b' },
        { name: 'Silver (3-4)', value: tierCounts.Silver, color: '#64748b' },
        { name: 'Bronze (1-2)', value: tierCounts.Bronze, color: '#92400e' },
      ];
      setDonorTierData(tierData);

      // Event effectiveness
      const eventEff: EventEffectivenessData[] = [
        { event: 'Spring Drive', participants: 45, collections: 42, efficiency: 93 },
        { event: 'Hospital Day', participants: 32, collections: 28, efficiency: 88 },
        { event: 'University Camp', participants: 58, collections: 51, efficiency: 88 },
        { event: 'Community Drive', participants: 38, collections: 35, efficiency: 92 },
      ];
      setEventEffectiveness(eventEff);

      // Expiry tracking
      const now = new Date();
      const expiringSoon = bloodPacks.filter(p => {
        const expiry = new Date(p.expiryDate);
        const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return p.status === 'Available' && daysUntil <= 7 && daysUntil > 0;
      }).length;
      
      const expired = bloodPacks.filter(p => p.status === 'Expired').length;
      const safe = bloodPacks.filter(p => {
        const expiry = new Date(p.expiryDate);
        const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return p.status === 'Available' && daysUntil > 7;
      }).length;

      setExpiryData([
        { status: 'Safe (>7 days)', count: safe, color: '#16a34a' },
        { status: 'Expiring Soon (≤7 days)', count: expiringSoon, color: '#f59e0b' },
        { status: 'Expired', count: expired, color: '#dc2626' },
      ]);

      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [donors, bloodPacks, events, getStockByGroup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-11 h-11 rounded-full border-3 border-slate-100 border-t-[#7F1D1D] animate-spin" />
      </div>
    );
  }

  // Calculate key metrics
  const totalCollections = monthlyData.reduce((sum, d) => sum + d.collections, 0);
  const totalIssues = monthlyData.reduce((sum, d) => sum + d.issues, 0);
  const totalEvents = monthlyData.reduce((sum, d) => sum + d.events, 0);
  const avgCollectionPerMonth = Math.round(totalCollections / monthlyData.length);
  const avgIssuePerMonth = Math.round(totalIssues / monthlyData.length);
  const supplyDemandRatio = ((totalCollections / totalIssues) * 100).toFixed(1);
  const activeDonors = donors.filter(d => d.totalDonations > 0).length;
  const donorRetentionRate = ((activeDonors / donors.length) * 100).toFixed(1);

  return (
    <div className="w-full p-6 md:p-8 bg-slate-50 min-h-[calc(100vh-3.5rem)]">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard" className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Reports & Analytics</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-[26px] font-extrabold text-slate-900 m-0 tracking-tight">Reports & Analytics</h1>
        <p className="text-[13px] text-slate-500 mt-[3px]">Comprehensive insights and performance metrics for blood bank operations</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500">Total Collections</CardTitle>
              <TrendingUp size={14} className="text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-green-600">{totalCollections}</div>
            <p className="text-xs text-slate-500 mt-1">Avg: {avgCollectionPerMonth}/month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500">Total Issues</CardTitle>
              <TrendingDown size={14} className="text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-red-600">{totalIssues}</div>
            <p className="text-xs text-slate-500 mt-1">Avg: {avgIssuePerMonth}/month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500">Supply/Demand</CardTitle>
              <Target size={14} className="text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-blue-600">{supplyDemandRatio}%</div>
            <p className="text-xs text-slate-500 mt-1">Collection vs Issue ratio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-slate-500">Donor Retention</CardTitle>
              <Users size={14} className="text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-purple-600">{donorRetentionRate}%</div>
            <p className="text-xs text-slate-500 mt-1">{activeDonors}/{donors.length} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Collections vs Issues Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center">
                <Activity size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Blood Collection vs Issue Trend</CardTitle>
                <CardDescription className="text-xs">6-month comparison showing supply and demand patterns</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                <Line 
                  type="monotone" 
                  dataKey="collections" 
                  stroke="#16a34a" 
                  strokeWidth={3}
                  name="Collections"
                  dot={{ fill: '#16a34a', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="issues" 
                  stroke="#dc2626" 
                  strokeWidth={3}
                  name="Issues"
                  dot={{ fill: '#dc2626', r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="events" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Events"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Blood Group Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center">
                <Droplet size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Blood Group Stock Analysis</CardTitle>
                <CardDescription className="text-xs">Available, used, and expired units by blood type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={bloodGroupData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="available" fill="#16a34a" radius={[4, 4, 0, 0]} name="Available" />
                <Bar dataKey="used" fill="#64748b" radius={[4, 4, 0, 0]} name="Used" />
                <Bar dataKey="expired" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expired" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donor Tier Distribution */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center">
                <Award size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Donor Engagement Tiers</CardTitle>
                <CardDescription className="text-xs">Distribution of donors by donation frequency</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donorTierData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={2} dataKey="value"
                >
                  {donorTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full">
              {donorTierData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-xs text-slate-600 flex-1">{item.name}</span>
                  <span className="text-xs font-bold text-gray-800">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Event Effectiveness */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center">
                <Calendar size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Event Effectiveness</CardTitle>
                <CardDescription className="text-xs">Participant turnout vs actual collections</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={eventEffectiveness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="event" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={100} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="participants" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Participants" />
                <Bar dataKey="collections" fill="#16a34a" radius={[0, 4, 4, 0]} name="Collections" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expiry & Wastage Tracking */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center">
                <Clock size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Expiry & Wastage Analysis</CardTitle>
                <CardDescription className="text-xs">Blood pack status by expiration timeline</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiryData.map((item, index) => {
                const total = expiryData.reduce((sum, d) => sum + d.count, 0);
                const percentage = ((item.count / total) * 100).toFixed(1);
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                        <span className="text-sm font-medium text-slate-700">{item.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.count}</span>
                        <span className="text-xs text-slate-500">({percentage}%)</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Wastage Alert */}
            {expiryData.find(d => d.status.includes('Expiring'))?.count! > 0 && (
              <div className="mt-6 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-800">Action Required</p>
                    <p className="text-xs text-orange-700 mt-1">
                      {expiryData.find(d => d.status.includes('Expiring'))?.count} units expiring within 7 days. 
                      Prioritize for immediate distribution.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Performance Summary</CardTitle>
          <CardDescription className="text-xs">Key operational metrics for the reporting period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#7F1D1D] mb-1">{totalEvents}</div>
              <p className="text-xs text-slate-500">Total Events</p>
              <p className="text-xs text-slate-400 mt-1">Avg: {(totalEvents / 6).toFixed(1)}/month</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-green-600 mb-1">{donors.length}</div>
              <p className="text-xs text-slate-500">Registered Donors</p>
              <p className="text-xs text-slate-400 mt-1">{activeDonors} active</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-blue-600 mb-1">
                {bloodPacks.filter(p => p.status === 'Available').length}
              </div>
              <p className="text-xs text-slate-500">Available Units</p>
              <p className="text-xs text-slate-400 mt-1">Across all groups</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-purple-600 mb-1">
                {((eventEffectiveness.reduce((sum, e) => sum + e.efficiency, 0) / eventEffectiveness.length)).toFixed(0)}%
              </div>
              <p className="text-xs text-slate-500">Avg Event Efficiency</p>
              <p className="text-xs text-slate-400 mt-1">Collection rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  tooltip: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '10px 14px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  tooltipLabel: { fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 },
  tooltipValue: { fontSize: 14, fontWeight: 800, margin: '2px 0 0' },
};
