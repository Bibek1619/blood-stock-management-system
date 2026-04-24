'use client';

import { useEffect, useState } from 'react';
import {
  Heart, Users, Droplet, Calendar, AlertCircle,
  TrendingUp, ArrowRight, Home, Clock, Package, Activity,
  Award, Target, AlertTriangle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { MOCK_DONORS, MOCK_EVENTS, EVENT_STATUS_CONFIG, LOW_STOCK_THRESHOLD, CRITICAL_STOCK_THRESHOLD, type Donor, type BloodEvent, getDonorTier } from "@/lib/data";
import { useData } from "@/lib/data-store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// ── Types ──────────────────────────────────────────────────────────────────────
type ChartData = {
  name: string;
  units: number;
};

type PieData = {
  name: string;
  value: number;
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={s.tooltip}>
      <p style={s.tooltipLabel}>{label}</p>
      <p style={s.tooltipValue}>{payload[0].value} units</p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { bloodPacks, getStockByGroup } = useData();
  
  const [stats, setStats] = useState({
    totalDonors: 0, totalBloodUnits: 0, lowStockUnits: 0,
    upcomingEvents: 0, totalDonations: 0, activeDonors: 0,
    expiringSoon: 0, criticalStock: 0,
  });
  const [bloodData, setBloodData]                   = useState<ChartData[]>([]);
  const [lowStockAlerts, setLowStockAlerts]         = useState<{ bloodGroup: string; units: number; isCritical: boolean }[]>([]);
  const [expiringPacks, setExpiringPacks]           = useState<any[]>([]);
  const [recentDonors, setRecentDonors]             = useState<Donor[]>([]);
  const [recentEvents, setRecentEvents]             = useState<BloodEvent[]>([]);
  const [todayEvents, setTodayEvents]               = useState<BloodEvent[]>([]);
  const [loading, setLoading]                       = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const stockByGroup = getStockByGroup();
      const donors       = MOCK_DONORS;
      const events       = MOCK_EVENTS;

      // Convert stock data to array format
      const bloodAllData = Object.entries(stockByGroup).map(([bloodGroup, data]) => ({
        bloodGroup,
        units: data.available
      }));

      // Low stock and critical stock
      const lowStock = bloodAllData.filter((p) => p.units < LOW_STOCK_THRESHOLD).map(p => ({
        bloodGroup: p.bloodGroup,
        units: p.units,
        isCritical: p.units < CRITICAL_STOCK_THRESHOLD
      }));
      
      const criticalCount = lowStock.filter(p => p.isCritical).length;
      
      setLowStockAlerts(lowStock);
      setBloodData(bloodAllData.map((p) => ({ name: p.bloodGroup, units: p.units })));
      
      // Expiring soon packs (within 7 days)
      const now = new Date();
      const expiring = bloodPacks.filter(p => {
        if (p.status !== 'Available') return false;
        const expiry = new Date(p.expiryDate);
        const daysUntil = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysUntil <= 7 && daysUntil > 0;
      }).slice(0, 5);
      setExpiringPacks(expiring);
      
      // Today's events
      const today = new Date().toISOString().split('T')[0];
      const todayEvts = events.filter(e => e.date === today);
      setTodayEvents(todayEvts);
      
      setRecentDonors(donors.slice(0, 5));
      setRecentEvents(events.filter(e => e.status === 'Upcoming').slice(0, 3));
      setStats({
        totalDonors:     donors.length,
        activeDonors:    donors.filter((d) => d.totalDonations > 0).length,
        totalBloodUnits: bloodAllData.reduce((a, p) => a + p.units, 0),
        lowStockUnits:   lowStock.length,
        criticalStock:   criticalCount,
        upcomingEvents:  events.filter((e) => e.status === 'Upcoming').length,
        totalDonations:  donors.reduce((a, d) => a + d.totalDonations, 0),
        expiringSoon:    expiring.length,
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [bloodPacks, getStockByGroup]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-11 h-11 rounded-full border-3 border-slate-100 border-t-[#7F1D1D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-slate-50 min-h-[calc(100vh-3.5rem)]">
      {/* Breadcrumbs */}
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="flex items-center gap-1">
                <Home size={14} /> Dashboard
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* ── Page Header ── */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 m-0 tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-slate-500 mt-[3px]">Blood bank management overview and analytics</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full px-3 py-1 text-xs font-semibold text-gray-700">
          <span className="inline-block w-[7px] h-[7px] rounded-full bg-green-500 shadow-[0_0_0_2px_rgba(34,197,94,0.25)]" />
          Live
        </div>
      </div>

      {/* ── Low Stock Alert Card ── */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 via-rose-50 to-red-50 border-2 border-red-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                <AlertCircle size={20} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-red-900 m-0">⚠️ Low Stock Alert</p>
                <p className="text-sm text-red-700 mt-0.5">
                  {lowStockAlerts.length} blood group{lowStockAlerts.length !== 1 ? 's' : ''} need immediate attention
                </p>
              </div>
            </div>
            
            {/* Blood Groups in a clean row */}
            <div className="flex items-center gap-3">
              {lowStockAlerts.slice(0, 4).map((alert, i) => {
                const isCritical = alert.units < 3;
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 ${
                      isCritical 
                        ? 'bg-red-100 border-red-300 shadow-md' 
                        : 'bg-orange-50 border-orange-200'
                    }`}
                  >
                    <div className="text-center">
                      <p className={`text-xl font-black m-0 ${isCritical ? 'text-red-800' : 'text-orange-700'}`}>
                        {alert.bloodGroup}
                      </p>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {alert.units} units
                      </p>
                    </div>
                    <span className="text-2xl">{isCritical ? '🔴' : '🟠'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Blood Units</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplet size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-[#7F1D1D] leading-none">{stats.totalBloodUnits}</div>
            <p className="text-[11px] text-slate-400 mt-1">Available in stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Critical Stock</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(220,38,38,0.1)] flex items-center justify-center">
              <AlertTriangle size={16} color="#dc2626" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-red-600 leading-none">{stats.criticalStock}</div>
            <p className="text-[11px] text-slate-400 mt-1">Below 3 units</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Expiring Soon</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(245,158,11,0.1)] flex items-center justify-center">
              <Clock size={16} color="#f59e0b" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-orange-600 leading-none">{stats.expiringSoon}</div>
            <p className="text-[11px] text-slate-400 mt-1">Within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Active Donors</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Users size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-slate-900 leading-none">{stats.activeDonors}</div>
            <p className="text-[11px] text-slate-400 mt-1">of {stats.totalDonors} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Upcoming Events</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Calendar size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-slate-900 leading-none">{stats.upcomingEvents}</div>
            <p className="text-[11px] text-slate-400 mt-1">Scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Expiring Packs Alert ── */}
      {expiringPacks.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border-2 border-orange-200 rounded-xl overflow-hidden mb-6 shadow-sm">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Clock size={20} className="text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-orange-900 m-0">⏰ Expiring Soon</p>
                <p className="text-sm text-orange-700 mt-0.5">
                  {expiringPacks.length} blood pack{expiringPacks.length !== 1 ? 's' : ''} expiring within 7 days
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {expiringPacks.map((pack, i) => {
                const expiry = new Date(pack.expiryDate);
                const daysUntil = Math.ceil((expiry.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-orange-200"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{pack.packCode}</p>
                      <p className="text-xs text-orange-700 font-semibold">{pack.bloodGroup}</p>
                    </div>
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300">
                      {daysUntil}d
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Link href="/dashboard/blood-donate/blood-collection">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#7F1D1D]">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[rgba(127,29,29,0.1)] flex items-center justify-center mx-auto mb-3">
                <Package size={24} color="#7F1D1D" />
              </div>
              <p className="text-sm font-bold text-slate-900">Collect Blood</p>
              <p className="text-xs text-slate-500 mt-1">Register new donation</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/blood-donate/donate-form">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#7F1D1D]">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[rgba(127,29,29,0.1)] flex items-center justify-center mx-auto mb-3">
                <Activity size={24} color="#7F1D1D" />
              </div>
              <p className="text-sm font-bold text-slate-900">Issue Blood</p>
              <p className="text-xs text-slate-500 mt-1">Distribute to recipient</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/donors">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#7F1D1D]">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[rgba(127,29,29,0.1)] flex items-center justify-center mx-auto mb-3">
                <Users size={24} color="#7F1D1D" />
              </div>
              <p className="text-sm font-bold text-slate-900">Manage Donors</p>
              <p className="text-xs text-slate-500 mt-1">View donor database</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reports">
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 border-transparent hover:border-[#7F1D1D]">
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[rgba(127,29,29,0.1)] flex items-center justify-center mx-auto mb-3">
                <Target size={24} color="#7F1D1D" />
              </div>
              <p className="text-sm font-bold text-slate-900">View Reports</p>
              <p className="text-xs text-slate-500 mt-1">Analytics & insights</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* ── Charts Row ── */}
      <div className="mb-6">
        {/* Blood Stock Bar Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={15} color="#7F1D1D" />
                </div>
                <div>
                  <CardTitle className="text-sm">Blood Stock by Group</CardTitle>
                  <CardDescription className="text-xs">Current units available per blood type</CardDescription>
                </div>
              </div>
              <Link href="/dashboard/reports" className="flex items-center gap-1 text-xs font-semibold text-[#7F1D1D] no-underline py-1 opacity-85 hover:opacity-100">
                View Reports <ArrowRight size={12} />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bloodData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'inherit' }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(127,29,29,0.04)' }} />
                <Bar dataKey="units" fill="#7F1D1D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="flex gap-3.5">
        {/* Recent Donors */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
                <Users size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Recent Donors</CardTitle>
                <CardDescription className="text-xs">Latest registered donors</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/donors" className="flex items-center gap-1 text-xs font-semibold text-[#7F1D1D] no-underline py-1 opacity-85 hover:opacity-100">
              View All <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col">
              {recentDonors.map((donor, i) => (
                <div key={i} className={`flex items-center gap-3 py-2.5 ${i < recentDonors.length - 1 ? 'border-b border-slate-100' : ''}`}>
                  <Avatar className="w-9 h-9 bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)]">
                    <AvatarFallback className="text-sm font-bold text-[#7F1D1D] bg-transparent">
                      {donor.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 m-0">{donor.name}</p>
                    <p className="text-[11px] text-slate-400 mt-[1px]">{donor.bloodGroup} · {donor.location}</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-bold text-[#7F1D1D] bg-[rgba(127,29,29,0.08)] border-[rgba(127,29,29,0.15)]">
                    {donor.totalDonations}×
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
                <Calendar size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Recent Events</CardTitle>
                <CardDescription className="text-xs">Upcoming and recent activities</CardDescription>
              </div>
            </div>
            <Link href="/dashboard/events" className="flex items-center gap-1 text-xs font-semibold text-[#7F1D1D] no-underline py-1 opacity-85 hover:opacity-100">
              View All <ArrowRight size={12} />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {recentEvents.map((event, i) => {
                const es = EVENT_STATUS_CONFIG[event.status as keyof typeof EVENT_STATUS_CONFIG] ?? EVENT_STATUS_CONFIG.Completed;
                return (
                  <div key={i} className="flex items-center justify-between p-2.5 px-3 bg-slate-50 rounded-[9px] border border-slate-100 gap-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-slate-800 m-0">{event.title}</p>
                      <p className="text-[11px] text-slate-400 mt-[2px]">{event.location}</p>
                    </div>
                    <Badge 
                      variant="outline"
                      className="text-[11px] flex-shrink-0"
                      style={{ background: es.bg, color: es.text, borderColor: es.border }}
                    >
                      {event.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// ── Minimal Styles (only for tooltip) ─────────────────────────────────────────
const s = {
  tooltip: {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '8px 12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  tooltipLabel: { fontSize: 12, fontWeight: 600, color: '#374151', margin: 0 },
  tooltipValue: { fontSize: 14, fontWeight: 800, color: '#7F1D1D', margin: '2px 0 0' },
};