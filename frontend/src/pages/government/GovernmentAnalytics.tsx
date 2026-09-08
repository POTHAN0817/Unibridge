import React, { useState, useEffect } from "react";
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
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  MapPin,
  Layers,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Building2,
  GraduationCap,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import { GovernmentAnalyticsResponse } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#10B981",
};

const CATEGORY_PALETTE = ["#10B981", "#0B63F6", "#8B5CF6", "#F59E0B", "#EC4899", "#06B6D4", "#64748B"];

export default function GovernmentAnalytics() {
  const [data, setData] = useState<GovernmentAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await governmentService.getAnalytics();
      setData(res);
    } catch (err: any) {
      console.error("Failed to load analytics", err);
      setError("Unable to aggregate analytics from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        badge="Administrative Intelligence"
        badgeColor="#10B981"
        title="National & Regional Civic Analytics"
        subtitle="Real aggregation pipelines tracking societal problem distribution, priority density, and ecosystem resolution velocity."
      >
        <button
          onClick={() => fetchAnalytics()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Recalculate
        </button>
      </DashboardHeader>

      <PageContainer>
        {loading ? (
          <LoadingState message="Aggregating live platform metrics from MongoDB Atlas..." />
        ) : error || !data ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-xs">
            <p className="text-sm font-semibold text-rose-700">{error || "Analytics unavailable."}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Stat Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Challenges</span>
                <p className="text-3xl font-black text-slate-900 mt-1">{data.total_challenges}</p>
                <span className="text-[11px] text-slate-500 mt-1 block">Reported by citizens</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">University Projects</span>
                <p className="text-3xl font-black text-emerald-700 mt-1">{data.total_projects}</p>
                <span className="text-[11px] text-slate-500 mt-1 block">Active academic labs</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Industry Partnerships</span>
                <p className="text-3xl font-black text-purple-700 mt-1">{data.total_partnerships}</p>
                <span className="text-[11px] text-slate-500 mt-1 block">Corporate sponsorships</span>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Field Pilots</span>
                <p className="text-3xl font-black text-blue-700 mt-1">{data.total_pilots}</p>
                <span className="text-[11px] text-slate-500 mt-1 block">Civic pilot trials</span>
              </div>
            </div>

            {/* Row 1: Category Breakdown & Priority Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <BarChart3 size={16} className="text-emerald-600" />
                    Challenge Distribution by Domain
                  </h3>
                  <span className="text-xs text-slate-400 font-semibold">{data.challenges_by_category.length} categories</span>
                </div>
                {data.challenges_by_category.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No categories recorded in database.</p>
                ) : (
                  <div className="space-y-3">
                    {data.challenges_by_category.map((cat, idx) => (
                      <div key={cat.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{cat.label}</span>
                          <span className="text-slate-900">
                            {cat.count} ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${cat.percentage}%`,
                              backgroundColor: CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length],
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority Distribution */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Civic Urgency & Priority Tiers
                  </h3>
                </div>
                {data.challenges_by_priority.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No priority assessments recorded.</p>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {data.challenges_by_priority.map((pri) => {
                        const col = PRIORITY_COLORS[pri.key.toLowerCase()] || "#64748B";
                        return (
                          <div key={pri.key} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider block" style={{ color: col }}>
                              {pri.label}
                            </span>
                            <div className="flex items-baseline justify-between mt-1">
                              <span className="text-2xl font-black text-slate-900">{pri.count}</span>
                              <span className="text-xs font-semibold text-slate-500">{pri.percentage}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-700 mb-2">Government Review Progression</h4>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        {data.challenges_by_government_review.map((rev) => (
                          <div key={rev.key} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-sm font-extrabold text-slate-900 block">{rev.count}</span>
                            <span className="text-[10px] text-slate-500 font-semibold block uppercase truncate">
                              {rev.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Projects by Lifecycle Stage & Regional Intelligence */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Project Lifecycle Distribution */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers size={16} className="text-emerald-600" />
                  University Projects by Status
                </h3>
                {data.projects_by_status.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No projects in database.</p>
                ) : (
                  <div className="space-y-3">
                    {data.projects_by_status.map((st) => (
                      <div key={st.key} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">{st.label}</span>
                          <span className="text-slate-900">
                            {st.count} ({st.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                            style={{ width: `${st.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Regional Analytics */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
                  <MapPin size={16} className="text-emerald-600" />
                  Regional Geographic Distribution
                </h3>
                {data.projects_by_state.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-xs text-slate-400 italic mb-1">Insufficient geographic tags in current records.</p>
                    <span className="text-[11px] text-slate-400">Regional clustering activates as citizen reports include geo-location.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.projects_by_state.map((st) => (
                      <div key={st.key} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                        <span className="font-semibold text-slate-800">{st.label}</span>
                        <div className="flex items-center gap-3">
                          <strong className="text-slate-900">{st.count} items</strong>
                          <span className="text-[11px] text-slate-400 font-mono">{st.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
