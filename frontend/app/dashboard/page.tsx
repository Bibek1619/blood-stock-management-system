'use client';

import { useEffect, useState } from 'react';
import {
  Heart, Users, Droplet, Calendar, AlertCircle,
  TrendingUp, Activity, ArrowRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from 'next/link';
import { MOCK_BLOOD_STOCK, MOCK_DONORS, MOCK_EVENTS, PIE_COLORS, EVENT_STATUS_CONFIG, LOW_STOCK_THRESHOLD, type BloodStock, type Donor, type BloodEvent } from "@/lib/data";

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
  const [stats, setStats] = useState({
    totalDonors: 0, totalBloodUnits: 0, lowStockUnits: 0,
    upcomingEvents: 0, totalDonations: 0, activeDonors: 0,
  });
  const [bloodData, setBloodData]                   = useState<ChartData[]>([]);
  const [lowStockAlerts, setLowStockAlerts]         = useState<BloodStock[]>([]);
  const [bloodDistribution, setBloodDistribution]   = useState<PieData[]>([]);
  const [recentDonors, setRecentDonors]             = useState<Donor[]>([]);
  const [recentEvents, setRecentEvents]             = useState<BloodEvent[]>([]);
  const [loading, setLoading]                       = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const bloodAllData = MOCK_BLOOD_STOCK;
      const donors       = MOCK_DONORS;
      const events       = MOCK_EVENTS;

      const lowStock = bloodAllData.filter((p) => p.units < LOW_STOCK_THRESHOLD);
      setLowStockAlerts(lowStock);
      setBloodData(bloodAllData.map((p) => ({ name: p.bloodGroup, units: p.units })));
      setBloodDistribution(bloodAllData.map((p) => ({ name: p.bloodGroup, value: p.units })));
      setRecentDonors(donors.slice(0, 5));
      setRecentEvents(events.slice(0, 4));
      setStats({
        totalDonors:     donors.length,
        activeDonors:    donors.filter((d) => d.totalDonations > 0).length,
        totalBloodUnits: bloodAllData.reduce((a, p) => a + p.units, 0),
        lowStockUnits:   lowStock.length,
        upcomingEvents:  events.filter((e) => e.status === 'Upcoming').length,
        totalDonations:  donors.reduce((a, d) => a + d.totalDonations, 0),
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-11 h-11 rounded-full border-3 border-slate-100 border-t-[#7F1D1D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 md:p-8 bg-slate-50 min-h-[calc(100vh-3.5rem)]">

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
      <div className="grid grid-cols-4 gap-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Blood Units</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Droplet size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-[#7F1D1D] leading-none">{stats.totalBloodUnits}</div>
            <p className="text-[11px] text-slate-400 mt-1">In stock across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Low Stock Groups</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(194,65,12,0.07)] flex items-center justify-center">
              <AlertCircle size={16} color="#c2410c" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-[#c2410c] leading-none">{stats.lowStockUnits}</div>
            <p className="text-[11px] text-slate-400 mt-1">Requires immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500">Total Donors</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] flex items-center justify-center">
              <Heart size={16} color="#7F1D1D" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-[28px] font-extrabold text-slate-900 leading-none">{stats.totalDonors}</div>
            <p className="text-[11px] text-slate-400 mt-1">{stats.activeDonors} active this month</p>
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
            <p className="text-[11px] text-slate-400 mt-1">Scheduled collections</p>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row ── */}
      <div className="flex gap-3.5 mb-6">
        {/* Bar Chart */}
        <Card className="flex-[2]">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
                <TrendingUp size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Blood Stock by Group</CardTitle>
                <CardDescription className="text-xs">Current units available per blood type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
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

        {/* Pie Chart */}
        <Card className="flex-1">
          <CardHeader>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[rgba(127,29,29,0.08)] border border-[rgba(127,29,29,0.15)] flex items-center justify-center flex-shrink-0">
                <Activity size={15} color="#7F1D1D" />
              </div>
              <div>
                <CardTitle className="text-sm">Type Distribution</CardTitle>
                <CardDescription className="text-xs">Units by blood type</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={bloodDistribution}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={88}
                  paddingAngle={3} dataKey="value"
                >
                  {bloodDistribution.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} units`]}
                  contentStyle={s.tooltip}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 w-full">
              {bloodDistribution.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-[11px] text-slate-500 flex-1">{item.name}</span>
                  <span className="text-[11px] font-bold text-gray-700">{item.value}</span>
                </div>
              ))}
            </div>
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