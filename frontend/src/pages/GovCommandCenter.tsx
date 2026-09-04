import { useState } from "react";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Users, Building2, GraduationCap, Briefcase, MapPin, Brain, ChevronRight, Filter, ArrowLeft } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import type { Page } from "../types";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const topMetrics = [
  { label: "Total Challenges", value: "1,245", change: "+18%", icon: AlertTriangle, color: "#0B63F6" },
  { label: "High Priority", value: "98", change: "Requires attention", icon: AlertTriangle, color: "#EF4444" },
  { label: "Active Projects", value: "75", change: "+12 this month", icon: TrendingUp, color: "#10B981" },
  { label: "Universities", value: "32", change: "Active", icon: GraduationCap, color: "#8B5CF6" },
  { label: "Industry Partners", value: "18", change: "Engaged", icon: Briefcase, color: "#F59E0B" },
  { label: "Citizens Benefited", value: "15,000+", change: "+2,500 this month", icon: Users, color: "#00C2FF" },
];

const categoryData = [
  { name: "Agriculture", value: 342, fill: "#10B981" },
  { name: "Water", value: 281, fill: "#0B63F6" },
  { name: "Healthcare", value: 198, fill: "#EF4444" },
  { name: "Education", value: 167, fill: "#8B5CF6" },
  { name: "Environment", value: 143, fill: "#F59E0B" },
  { name: "Infrastructure", value: 114, fill: "#00C2FF" },
];

const monthlyData = [
  { month: "Mar", challenges: 78, resolved: 12 },
  { month: "Apr", challenges: 92, resolved: 28 },
  { month: "May", challenges: 115, resolved: 41 },
  { month: "Jun", challenges: 138, resolved: 55 },
  { month: "Jul", challenges: 162, resolved: 78 },
  { month: "Aug", challenges: 189, resolved: 96 },
  { month: "Sep", challenges: 201, resolved: 112 },
];

const impactData = [
  { month: "Mar", citizens: 800 },
  { month: "Apr", citizens: 2200 },
  { month: "May", citizens: 4100 },
  { month: "Jun", citizens: 6800 },
  { month: "Jul", citizens: 9500 },
  { month: "Aug", citizens: 12400 },
  { month: "Sep", citizens: 15000 },
];

const pendingChallenges = [
  { id: "CF-2026-089", title: "Cold Storage Infrastructure for Farmers", district: "Virudhunagar, TN", priority: 89, category: "Agriculture", reports: 23, ai: "APPROVE" },
  { id: "CF-2026-091", title: "Drinking Water Contamination in Villages", district: "Kovilpatti, TN", priority: 92, category: "Water", reports: 31, ai: "APPROVE" },
  { id: "CF-2026-094", title: "Emergency Healthcare Access in Remote Areas", district: "Theni, TN", priority: 85, category: "Healthcare", reports: 18, ai: "REVIEW" },
  { id: "CF-2026-097", title: "Waste Management Near Residential Zones", district: "Madurai, TN", priority: 68, category: "Environment", reports: 7, ai: "REVIEW" },
];

const districts = [
  { name: "Virudhunagar", challenges: 48, priority: "HIGH", lat: "9.6°N", lon: "77.9°E" },
  { name: "Madurai", challenges: 63, priority: "HIGH", lat: "9.9°N", lon: "78.1°E" },
  { name: "Kovilpatti", challenges: 35, priority: "HIGH", lat: "9.2°N", lon: "77.9°E" },
  { name: "Dindigul", challenges: 29, priority: "MEDIUM", lat: "10.4°N", lon: "77.9°E" },
  { name: "Tirunelveli", challenges: 41, priority: "HIGH", lat: "8.7°N", lon: "77.7°E" },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="px-3 py-2 rounded-lg text-xs bg-white shadow-lg border border-gray-200" style={{ color: "#071A33" }}>
        <div className="font-bold mb-1">{label}</div>
        {payload.map((p: any, i: number) => (
          <div key={i} style={{ color: p.color }}>{p.name}: {p.value.toLocaleString()}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GovCommandCenter({ onNavigate, onBack }: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "challenges" | "map" | "analytics">("overview");
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);

  return (
    <div className="min-h-screen pt-16 bg-white" style={{ background: "#FFFFFF" }}>
      {/* Command header */}
      <div className="px-6 py-6 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-all mb-4 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold tracking-widest text-blue-600 mb-1">MINISTRY OF SCIENCE & TECHNOLOGY</div>
              <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
                National Innovation Command Center
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">Live monitoring · Sep 3, 2026 · 10:42 AM IST</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 pulse-glow"></div>
              <span className="text-emerald-600 text-xs font-bold tracking-widest">LIVE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {topMetrics.map((m, i) => (
            <div key={i} className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <m.icon size={14} style={{ color: m.color }} />
                <span className="text-xs text-gray-500 font-medium">{m.label}</span>
              </div>
              <div className="text-2xl font-extrabold mb-0.5" style={{ fontFamily: "var(--font-display)", color: m.color }}>{m.value}</div>
              <div className="text-xs text-gray-400">{m.change}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl bg-gray-100 border border-gray-200" style={{ width: "fit-content" }}>
          {[["overview", "Overview"], ["challenges", "Challenges"], ["map", "Districts"], ["analytics", "Analytics"]].map(([val, label]) => (
            <button key={val} onClick={() => setActiveTab(val as typeof activeTab)} className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${activeTab === val ? "text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`} style={activeTab === val ? { background: "#0B63F6" } : {}}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Monthly chart */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6">MONTHLY CHALLENGE FLOW</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={monthlyData} barGap={4}>
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="challenges" name="Reported" fill="#0B63F6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="resolved" name="Resolved" fill="#10B981" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pending validation */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-bold text-gray-400 tracking-widest">AWAITING VALIDATION</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold priority-high">4 pending</span>
                </div>
                <div className="space-y-3">
                  {pendingChallenges.map((c) => (
                    <div key={c.id} onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)} className="p-4 rounded-xl cursor-pointer transition-all hover:bg-slate-50" style={{ background: "#F8FAFC", border: `1px solid ${selectedChallenge === c.id ? "#0B63F6" : "#E2E8F0"}` }}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-2 mb-1.5">
                            <span className="text-xs font-mono text-gray-400">{c.id}</span>
                            <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ background: "rgba(11,99,246,0.1)", color: "#0B63F6" }}>{c.category}</span>
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mb-1">{c.title}</div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1"><MapPin size={10} />{c.district}</span>
                            <span>{c.reports} reports</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-xl font-extrabold text-red-500 font-mono">{c.priority}</div>
                          <div className="text-xs text-gray-400">priority</div>
                        </div>
                      </div>

                      {selectedChallenge === c.id && (
                        <div className="mt-4 pt-4 flex gap-2" style={{ borderTop: "1px solid #E2E8F0" }}>
                          <button className="flex-1 py-2 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 cursor-pointer" style={{ background: "#10B981" }}>✓ Approve Challenge</button>
                          <button className="flex-1 py-2 rounded-lg text-xs font-bold text-amber-600 hover:bg-amber-50 transition-all cursor-pointer" style={{ border: "1px solid rgba(245,158,11,0.3)" }}>Request Info</button>
                          <button className="flex-1 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Category pie */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">BY CATEGORY</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: "8px", color: "#071A33", fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categoryData.map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <div className="w-2 h-2 rounded-full" style={{ background: c.fill }}></div>
                      {c.name}
                    </div>
                  ))}
                </div>
              </div>

              {/* Citizen impact */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">CUMULATIVE IMPACT</h3>
                <ResponsiveContainer width="100%" height={140}>
                  <AreaChart data={impactData}>
                    <defs>
                      <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="citizens" name="Citizens" stroke="#10B981" fill="url(#impactGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Quick actions */}
              <div className="glass-card rounded-2xl p-5">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-4">QUICK ACTIONS</h3>
                <div className="space-y-2">
                  {[
                    { label: "View University Matches", page: "university-dashboard" as Page },
                    { label: "Impact Report", page: "impact" as Page },
                  ].map((a, i) => (
                    <button key={i} onClick={() => onNavigate(a.page)} className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm text-gray-700 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer" style={{ border: "1px solid #E2E8F0" }}>
                      {a.label} <ChevronRight size={14} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Districts tab */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map placeholder */}
            <div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden relative bg-slate-50 border border-gray-200" style={{ minHeight: 480 }}>
              <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 70%, rgba(11,99,246,0.08) 0%, transparent 60%)" }}></div>
              <div className="absolute top-4 left-4 text-xs font-bold text-gray-400 tracking-widest">INDIA · NATIONAL CHALLENGE MAP</div>
              {/* Simulated district markers */}
              {[
                { x: "45%", y: "72%", size: 18, color: "#EF4444", label: "Madurai" },
                { x: "43%", y: "76%", size: 14, color: "#EF4444", label: "Virudhunagar" },
                { x: "41%", y: "82%", size: 12, color: "#F59E0B", label: "Tirunelveli" },
                { x: "44%", y: "69%", size: 10, color: "#F59E0B", label: "Dindigul" },
                { x: "42%", y: "79%", size: 11, color: "#EF4444", label: "Kovilpatti" },
                { x: "38%", y: "55%", size: 8, color: "#0B63F6", label: "Coimbatore" },
                { x: "55%", y: "40%", size: 9, color: "#10B981", label: "Chennai" },
              ].map((m, i) => (
                <div key={i} className="absolute flex flex-col items-center gap-1" style={{ left: m.x, top: m.y, transform: "translate(-50%,-50%)" }}>
                  <div className="rounded-full pulse-glow" style={{ width: m.size, height: m.size, background: m.color, boxShadow: `0 0 ${m.size}px ${m.color}60` }}></div>
                  <span className="text-xs text-gray-700 font-semibold whitespace-nowrap bg-white/90 shadow px-1.5 py-0.5 rounded hidden md:block border border-gray-200">{m.label}</span>
                </div>
              ))}
              {/* India outline SVG simplified */}
              <svg className="w-full h-full opacity-20" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid meet">
                <path d="M150,80 L200,60 L260,75 L290,100 L310,140 L295,180 L310,220 L290,260 L270,300 L240,350 L210,390 L190,420 L175,400 L155,370 L140,330 L120,290 L110,250 L125,210 L110,170 L125,130 Z" fill="none" stroke="#0B63F6" strokeWidth="1.5" />
              </svg>
            </div>

            {/* District list */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-5">LIVE NATIONAL IMPACT</h3>
              <div className="space-y-3 mb-6">
                {[
                  { icon: "🔥", label: "High Priority Challenges", value: "98" },
                  { icon: "🎓", label: "Universities Active", value: "32" },
                  { icon: "🏭", label: "Industry Partners", value: "18" },
                  { icon: "👥", label: "Citizens Benefited", value: "15,000" },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #E2E8F0" }}>
                    <span className="text-sm text-gray-600 flex items-center gap-2">{s.icon} {s.label}</span>
                    <span className="font-bold text-gray-900 font-mono">{s.value}</span>
                  </div>
                ))}
              </div>
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-3">HIGH-IMPACT DISTRICTS</h3>
              <div className="space-y-2">
                {districts.map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.challenges} challenges</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${d.priority === "HIGH" ? "priority-high" : "priority-medium"}`}>{d.priority}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analytics tab */}
        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6">CHALLENGE CATEGORY DISTRIBUTION</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryData} layout="vertical">
                  <XAxis type="number" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Challenges" radius={[0, 4, 4, 0]}>
                    {categoryData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6">CITIZEN IMPACT GROWTH</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={impactData}>
                  <defs>
                    <linearGradient id="impactGrad2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="citizens" name="Citizens Benefited" stroke="#00C2FF" fill="url(#impactGrad2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6">CHALLENGE RESOLUTION FUNNEL</h3>
              <div className="space-y-4">
                {[
                  { stage: "Reported", count: 1245, pct: 100, color: "#0B63F6" },
                  { stage: "AI Analyzed", count: 1230, pct: 98.8, color: "#00C2FF" },
                  { stage: "Govt Validated", count: 892, pct: 71.6, color: "#8B5CF6" },
                  { stage: "University Assigned", count: 410, pct: 32.9, color: "#F59E0B" },
                  { stage: "Solution Active", count: 75, pct: 6.0, color: "#10B981" },
                  { stage: "Impact Measured", count: 34, pct: 2.7, color: "#10B981" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="text-gray-600">{s.stage}</span>
                      <span className="text-gray-900 font-mono font-bold">{s.count.toLocaleString()}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                      <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-6">UNIVERSITY PERFORMANCE</h3>
              <div className="space-y-4">
                {[
                  { name: "Kalasalingam Academy", score: 94, projects: 8 },
                  { name: "Anna University", score: 88, projects: 12 },
                  { name: "IIT Madras", score: 96, projects: 5 },
                  { name: "PSG College of Technology", score: 82, projects: 7 },
                  { name: "NIT Trichy", score: 90, projects: 6 },
                ].map((u, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: "#0B63F6" }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-800 font-medium truncate">{u.name}</div>
                      <div className="h-1.5 rounded-full mt-1.5 overflow-hidden bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${u.score}%`, background: "linear-gradient(90deg, #0B63F6, #00C2FF)" }}></div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-blue-600 font-mono">{u.score}%</div>
                      <div className="text-xs text-gray-400">{u.projects} projects</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Challenges tab */}
        {activeTab === "challenges" && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-6">
              <Filter size={16} className="text-gray-400" />
              <span className="text-gray-500 text-sm">Showing all 1,245 challenges</span>
            </div>
            {pendingChallenges.concat(pendingChallenges.map((c) => ({ ...c, id: c.id + "x" }))).map((c, i) => (
              <div key={i} onClick={() => setSelectedChallenge(selectedChallenge === c.id ? null : c.id)} className="glass-card rounded-xl p-5 cursor-pointer hover:bg-slate-50 transition-all" style={{ border: `1px solid ${selectedChallenge === c.id ? "#0B63F6" : "#E2E8F0"}` }}>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-2 mb-1.5">
                      <span className="text-xs font-mono text-gray-400">{c.id}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "rgba(11,99,246,0.1)", color: "#0B63F6" }}>{c.category}</span>
                    </div>
                    <div className="text-gray-900 font-semibold">{c.title}</div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span><MapPin size={10} className="inline mr-1" />{c.district}</span>
                      <span>{c.reports} citizen reports</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-2xl font-extrabold font-mono" style={{ color: c.priority >= 85 ? "#EF4444" : "#F59E0B" }}>{c.priority}</div>
                    <div className="text-xs text-gray-400">AI Score</div>
                    <div className="mt-1 text-xs font-bold" style={{ color: c.ai === "APPROVE" ? "#10B981" : "#F59E0B" }}>AI: {c.ai}</div>
                  </div>
                </div>
                {selectedChallenge === c.id && (
                  <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid #E2E8F0" }}>
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-white cursor-pointer" style={{ background: "#10B981" }}>✓ Approve</button>
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-amber-600 hover:bg-amber-50 cursor-pointer" style={{ border: "1px solid rgba(245,158,11,0.3)" }}>Request Info</button>
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 cursor-pointer" style={{ border: "1px solid #E2E8F0" }}>Mark Duplicate</button>
                    <button className="flex-1 py-2.5 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 cursor-pointer" style={{ border: "1px solid rgba(239,68,68,0.3)" }}>Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
