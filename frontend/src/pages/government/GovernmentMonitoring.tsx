import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  CheckCircle2,
  Clock,
  Layers,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Cpu,
  GraduationCap,
  AlertTriangle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import {
  GovernmentDeploymentItem,
  GovernmentDeploymentsPage,
  GovernmentLifecycleMonitoringSummary,
  GovernmentPilotItem,
  GovernmentPilotsPage,
  PlatformActivityItem,
} from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

export default function GovernmentMonitoring() {
  const [activeTab, setActiveTab] = useState<"lifecycle" | "pilots" | "deployments" | "activity">("lifecycle");
  const [summary, setSummary] = useState<GovernmentLifecycleMonitoringSummary | null>(null);
  const [pilotsData, setPilotsData] = useState<GovernmentPilotsPage | null>(null);
  const [deploymentsData, setDeploymentsData] = useState<GovernmentDeploymentsPage | null>(null);
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [sumRes, pilRes, depRes, actRes] = await Promise.all([
        governmentService.getMonitoringSummary(),
        governmentService.getPilots({ page: 1, limit: 12 }),
        governmentService.getDeployments({ page: 1, limit: 12 }),
        governmentService.getRecentActivity(),
      ]);
      setSummary(sumRes);
      setPilotsData(pilRes);
      setDeploymentsData(depRes);
      setActivity(actRes);
    } catch (err) {
      console.error("Failed to load government monitoring console", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        badge="Systemic Execution Oversight"
        badgeColor="#10B981"
        title="Pilot & Deployment Oversight Console"
        subtitle="Tracking the transition of academic prototypes into live municipal pilot studies and final societal deployments."
      >
        <button
          onClick={() => loadAll()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("lifecycle")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "lifecycle"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers size={15} />
            Lifecycle Pipeline ({summary?.total_projects ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("pilots")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "pilots"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <CheckCircle2 size={15} />
            Field Pilots ({pilotsData?.total ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("deployments")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "deployments"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <ShieldCheck size={15} />
            Deployment Readiness ({deploymentsData?.total ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === "activity"
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Activity size={15} />
            Live Execution Feed ({activity.length})
          </button>
        </div>

        {loading ? (
          <LoadingState message="Loading monitoring records..." />
        ) : (
          <div>
            {/* VIEW A: LIFECYCLE PIPELINE */}
            {activeTab === "lifecycle" && summary && (
              <div className="space-y-8">
                {/* Visual Pipeline Funnel */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                    Stage-Gate Progression Funnel
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">1. Research</span>
                      <strong className="text-2xl font-black text-slate-900 mt-1 block">{summary.research}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Active Labs</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">2. Solution</span>
                      <strong className="text-2xl font-black text-slate-900 mt-1 block">{summary.solution_proposed}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Architectures</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">3. Prototype</span>
                      <strong className="text-2xl font-black text-amber-600 mt-1 block">{summary.prototype}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Engineering Units</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">4. Pilot</span>
                      <strong className="text-2xl font-black text-blue-600 mt-1 block">{summary.pilot}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Field Trials</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">5. Ready</span>
                      <strong className="text-2xl font-black text-purple-600 mt-1 block">{summary.deployment_ready}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Validated Rollout</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">6. Completed</span>
                      <strong className="text-2xl font-black text-emerald-600 mt-1 block">{summary.completed}</strong>
                      <span className="text-[10px] text-slate-500 mt-1 block">Societal Impact</span>
                    </div>
                  </div>
                </div>

                {/* Quick Link to Projects */}
                <div className="bg-emerald-50 border border-emerald-200/80 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-900">Need specific university project metrics?</h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Explore detailed milestones, academic faculty teams, and student contributions in the project directory.
                    </p>
                  </div>
                  <Link
                    to="/government/projects"
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs shrink-0"
                  >
                    View Project Pipeline →
                  </Link>
                </div>
              </div>
            )}

            {/* VIEW B: PILOT MONITORING */}
            {activeTab === "pilots" && (
              <div>
                {!pilotsData || pilotsData.items.length === 0 ? (
                  <EmptyState
                    title="No Engineering Pilots Registered"
                    description="Universities have not yet submitted active field pilot records in the database."
                    actionText="Browse Projects"
                    onAction={() => setActiveTab("lifecycle")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pilotsData.items.map((pilot) => (
                      <div
                        key={pilot.pilot_id}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 uppercase">
                              {pilot.status}
                            </span>
                            {pilot.category && (
                              <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                {pilot.category}
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900 mb-1">{pilot.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">{pilot.objectives}</p>
                          <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-slate-400" />
                              <span>{pilot.location}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <GraduationCap size={13} className="text-slate-400" />
                              <span className="truncate">{pilot.university_name || "Executing Lab"}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-mono">
                            {pilot.start_date || "Dates pending"}
                          </span>
                          <Link
                            to={`/government/projects/${pilot.project_id}`}
                            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            Project Dossier <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW C: DEPLOYMENT MONITORING */}
            {activeTab === "deployments" && (
              <div>
                {!deploymentsData || deploymentsData.items.length === 0 ? (
                  <EmptyState
                    title="No Deployment Readiness Records"
                    description="No project deployment readiness audits have been filed yet."
                    actionText="Browse Lifecycle"
                    onAction={() => setActiveTab("lifecycle")}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {deploymentsData.items.map((dep) => (
                      <div
                        key={dep.project_id}
                        className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 uppercase">
                              {dep.readiness_status.replace("_", " ")}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{dep.lifecycle_stage}</span>
                          </div>
                          <h4 className="font-extrabold text-base text-slate-900 mb-1">{dep.project_name}</h4>
                          <p className="text-xs text-slate-500 mb-3">{dep.university_name || "Academic Institution"}</p>

                          {dep.technical_readiness && (
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 mb-2">
                              <strong className="text-slate-800 block text-[11px] mb-0.5">Readiness Note:</strong>
                              <p className="line-clamp-2">{dep.technical_readiness}</p>
                            </div>
                          )}

                          {dep.blockers && (
                            <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-xs text-rose-800">
                              <strong className="block text-[11px] font-bold mb-0.5">Reported Blocker:</strong>
                              <p className="line-clamp-2">{dep.blockers}</p>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 mt-4 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-mono">
                            Milestones: {dep.completed_milestones_count}/{dep.milestones_count}
                          </span>
                          <Link
                            to={`/government/projects/${dep.project_id}`}
                            className="font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                          >
                            Dossier <ArrowRight size={13} />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW D: LIVE ACTIVITY FEED */}
            {activeTab === "activity" && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
                  Platform Project Execution Feed
                </h3>
                {activity.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No activity logged in the platform.</p>
                ) : (
                  <div className="space-y-4">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-3.5 pb-4 border-b border-slate-100 last:border-b-0">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Activity size={14} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-900">{item.action.replace("_", " ").toUpperCase()}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.created_at ? item.created_at.slice(0, 10) : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
