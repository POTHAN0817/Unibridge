import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  Building2,
  GraduationCap,
  Briefcase,
  MapPin,
  Brain,
  ChevronRight,
  Filter,
  ArrowRight,
  Shield,
  Layers,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useAuth } from "../../auth/AuthContext";
import { challengeService } from "../../services/challengeService";
import { governmentService } from "../../services/governmentService";
import { Challenge } from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { categoryBreakdown, monthlyTrends } from "../../data/mock/impactMetrics";

export default function GovCommandCenter() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "validation" | "analytics">("overview");

  useEffect(() => {
    async function load() {
      const ch = await challengeService.getAllChallenges();
      setChallenges(ch);
    }
    load();
  }, []);

  const pendingValidation = challenges.filter((c) => c.status === "Submitted" || c.status === "AI Analyzed");

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <DashboardHeader
        badge="DEPARTMENT OF SCIENCE & TECHNOLOGY · GOVT OF INDIA"
        badgeColor="#10B981"
        title="National Innovation Command Center"
        subtitle={`Live monitoring & policy oversight · Signed in as ${user?.name || "Officer Rajan"} (${user?.department || "Societal Solutions Division"})`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-xs font-bold text-emerald-800">LIVE FEED</span>
          </div>
          <Link
            to="/government/validation"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs"
          >
            Validation Queue ({pendingValidation.length})
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Top 6 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <StatCard
            label="Total Challenges"
            value="1,245"
            change="+18%"
            icon={AlertTriangle}
            color="#0B63F6"
          />
          <StatCard
            label="Pending Triage"
            value={pendingValidation.length.toString()}
            icon={Clock}
            color="#EF4444"
            subtext="Needs Officer Sign-off"
          />
          <StatCard
            label="Active Projects"
            value="75"
            change="+12"
            icon={TrendingUp}
            color="#10B981"
          />
          <StatCard
            label="Universities"
            value="32"
            icon={GraduationCap}
            color="#8B5CF6"
          />
          <StatCard
            label="Industry Partners"
            value="18"
            icon={Briefcase}
            color="#F59E0B"
          />
          <StatCard
            label="Citizens Benefited"
            value="15,000+"
            change="+2,500"
            icon={Users}
            color="#00C2FF"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "overview", label: "Executive Overview & Regional Trends" },
            { id: "validation", label: `Priority Validation Queue (${pendingValidation.length})` },
            { id: "analytics", label: "Category Distribution & Impact Metrics" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === t.id
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Resolution Trend Area Chart (2 cols) */}
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-base font-bold text-[#071A33]">
                      National Submission & Resolution Trajectory
                    </h3>
                    <p className="text-xs text-gray-400">Monthly reported vs verified deployed solutions (2026)</p>
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyTrends}>
                      <defs>
                        <linearGradient id="colorChal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0B63F6" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0B63F6" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip />
                      <Area type="monotone" dataKey="challenges" stroke="#0B63F6" fillOpacity={1} fill="url(#colorChal)" name="Challenges Reported" />
                      <Area type="monotone" dataKey="resolved" stroke="#10B981" fillOpacity={1} fill="url(#colorRes)" name="Solutions Deployed" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart: Domain Distribution */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#071A33] mb-1">
                    Problem Domain Breakdown
                  </h3>
                  <p className="text-xs text-gray-400 mb-4">Total 1,245 citizen reports categorized</p>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={categoryBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={35} outerRadius={60}>
                          {categoryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-100">
                  {categoryBreakdown.map((cat, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.fill }} />
                      <span className="text-gray-600 text-[11px] truncate">{cat.name}: <strong>{cat.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Priority Queue Link Table */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">
                    Critical Priority Challenges Requiring Fast-Track Approval
                  </h3>
                  <p className="text-xs text-gray-500">
                    High severity score (&gt;80) flagged by CivicAI NLP engine
                  </p>
                </div>
                <Link
                  to="/government/validation"
                  className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  Open Full Validation Queue <ArrowRight size={13} />
                </Link>
              </div>

              <div className="space-y-3">
                {challenges.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/government/challenges/${c.id}`)}
                    className="p-4 rounded-2xl bg-slate-50 border border-gray-100 hover:border-emerald-300 hover:shadow-xs transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <PriorityBadge priority={c.priority} />
                        <span className="text-xs font-bold text-gray-900">{c.title}</span>
                      </div>
                      <p className="text-xs text-gray-500">{c.location} · {c.affectedPeople} affected · {c.similarReports} reports merged</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-red-500">{c.priorityScore}/100</div>
                        <span className="text-[10px] text-gray-400">CivicAI Score</span>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100">
                        Validate
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "validation" && (
          <div className="space-y-4">
            {pendingValidation.map((c) => (
              <div
                key={c.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {c.category}
                    </span>
                    <span className="text-xs text-gray-400">ID: {c.id}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#071A33]">{c.title}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>
                  <p className="text-xs text-gray-400 mt-2">{c.location} · {c.affectedPeople}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to={`/government/challenges/${c.id}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                  >
                    Review & Validate
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-2">District Heatmap Summary</h3>
              <p className="text-xs text-gray-500 mb-6">Top challenge concentrations across Tamil Nadu</p>
              <div className="space-y-3 text-xs">
                {[
                  { name: "Virudhunagar", challenges: 48, priority: "HIGH" },
                  { name: "Madurai", challenges: 63, priority: "HIGH" },
                  { name: "Kovilpatti", challenges: 35, priority: "HIGH" },
                  { name: "Dindigul", challenges: 29, priority: "MEDIUM" },
                  { name: "Tirunelveli", challenges: 41, priority: "HIGH" },
                ].map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                    <strong className="text-gray-800">{d.name}</strong>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">{d.challenges} Challenges</span>
                      <PriorityBadge priority={d.priority} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-2">National Innovation Pipeline</h3>
              <p className="text-xs text-gray-500 mb-6">Pipeline conversion rates from citizen voice to deployment</p>
              <div className="space-y-4">
                {[
                  { stage: "AI Triage & Deduplication", pct: 98, count: "1,245 Challenges" },
                  { stage: "Official Govt Validation", pct: 76, count: "946 Approved" },
                  { stage: "University Lab Assignment", pct: 54, count: "512 Active Labs" },
                  { stage: "Working Pilot Deployment", pct: 28, count: "75 Live Pilots" },
                  { stage: "Measurable Impact & Scaling", pct: 14, count: "34 Full Deployed" },
                ].map((stg, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-gray-700">{stg.stage}</span>
                      <span className="text-gray-500">{stg.count} ({stg.pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stg.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
