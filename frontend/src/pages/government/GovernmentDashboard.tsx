import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  FolderGit2,
  Handshake,
  Award,
  Package,
  DollarSign,
  Activity,
  Layers,
  FileCheck,
  ChevronRight,
  ArrowRight,
  Sparkles,
  BarChart3,
  HelpCircle,
  Zap,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { governmentService } from "../../services/governmentService";
import type {
  GovernmentDashboardMetrics,
  GovernmentProfile,
  PlatformActivityItem,
  GovernmentDashboardPriorities,
  GovernmentLifecycleMonitoringSummary,
} from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<GovernmentDashboardMetrics | null>(null);
  const [profile, setProfile] = useState<GovernmentProfile | null>(null);
  const [priorities, setPriorities] = useState<GovernmentDashboardPriorities | null>(null);
  const [lifecycle, setLifecycle] = useState<GovernmentLifecycleMonitoringSummary | null>(null);
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [m, prof, prio, life, act] = await Promise.all([
          governmentService.getDashboardMetrics().catch(() => null),
          governmentService.getProfile().catch(() => null),
          governmentService.getDashboardPriorities().catch(() => null),
          governmentService.getMonitoringSummary().catch(() => null),
          governmentService.getRecentActivity().catch(() => []),
        ]);
        setMetrics(m);
        setProfile(prof);
        setPriorities(prio);
        setLifecycle(life);
        setActivity(act || []);
      } catch (err) {
        console.error("Failed to load government dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const departmentBadge =
    profile?.department_name ||
    user?.department ||
    (user?.profile as Record<string, any>)?.department_name ||
    "GOVERNMENT ADMINISTRATIVE COMMAND";

  if (loading) {
    return <LoadingState message="Connecting to state innovation ledger and aggregation engine..." />;
  }

  const pendingReviewsCount = priorities?.pending_reviews?.length ?? 0;
  const clarificationsCount = priorities?.clarification_challenges?.length ?? 0;
  const criticalChallengesCount = priorities?.high_priority_challenges?.length ?? 0;
  const openActionsCount = priorities?.open_actions?.length ?? 0;
  const activePilotsCount = priorities?.active_pilots?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <DashboardHeader
        badge={departmentBadge}
        badgeColor="#10B981"
        title="Government Command Center"
        subtitle="Real-time administrative oversight across citizen challenges, university research pipelines, and enterprise co-investments."
      >
        <div className="flex items-center gap-2">
          <Link
            to="/government/actions?create=true"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <Shield size={14} /> Record Action
          </Link>
          <Link
            to="/government/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200 cursor-pointer"
          >
            <Building2 size={14} /> Official Profile
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* PRIORITY & TRIAGE ALERT STRIP */}
        <div className="mb-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 rounded-3xl p-6 text-white shadow-md border border-emerald-900/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-4 border-b border-emerald-800/40">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold tracking-tight">Administrative Attention & Triage</h2>
                <p className="text-xs text-emerald-300/80">
                  Live operational queues requiring executive review, decisions, or follow-ups.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/government/challenges?government_review_status=pending"
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                Review Queue
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link
              to="/government/challenges?government_review_status=pending"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-yellow-400 mb-1">
                <Clock size={16} />
                <span className="text-xs font-mono font-bold bg-yellow-400/20 px-1.5 py-0.5 rounded">
                  {pendingReviewsCount}
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-yellow-300 transition-colors">
                Pending Reviews
              </div>
              <div className="text-[11px] text-gray-400">Awaiting official status</div>
            </Link>

            <Link
              to="/government/challenges?government_review_status=needs_clarification"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-blue-400 mb-1">
                <HelpCircle size={16} />
                <span className="text-xs font-mono font-bold bg-blue-400/20 px-1.5 py-0.5 rounded">
                  {clarificationsCount}
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                Clarifications
              </div>
              <div className="text-[11px] text-gray-400">Citizen responses needed</div>
            </Link>

            <Link
              to="/government/challenges?priority=critical"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-red-400 mb-1">
                <AlertTriangle size={16} />
                <span className="text-xs font-mono font-bold bg-red-400/20 px-1.5 py-0.5 rounded">
                  {criticalChallengesCount}
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-red-300 transition-colors">
                Critical Civic Issues
              </div>
              <div className="text-[11px] text-gray-400">High severity alerts</div>
            </Link>

            <Link
              to="/government/actions?status=open"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-emerald-400 mb-1">
                <Shield size={16} />
                <span className="text-xs font-mono font-bold bg-emerald-400/20 px-1.5 py-0.5 rounded">
                  {openActionsCount}
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                Open Actions
              </div>
              <div className="text-[11px] text-gray-400">Active assigned tasks</div>
            </Link>

            <Link
              to="/government/monitoring"
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-3.5 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between text-purple-400 mb-1">
                <CheckCircle2 size={16} />
                <span className="text-xs font-mono font-bold bg-purple-400/20 px-1.5 py-0.5 rounded">
                  {activePilotsCount}
                </span>
              </div>
              <div className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                Active Pilots
              </div>
              <div className="text-[11px] text-gray-400">Field deployments live</div>
            </Link>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-8">
          <Link
            to="/government/challenges"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <AlertTriangle size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Challenges</span>
            <span className="text-[10px] text-gray-400">Civic Triage</span>
          </Link>

          <Link
            to="/government/projects"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <FolderGit2 size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Projects</span>
            <span className="text-[10px] text-gray-400">University R&D</span>
          </Link>

          <Link
            to="/government/collaborations"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <Handshake size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Collaborations</span>
            <span className="text-[10px] text-gray-400">Industry Alliances</span>
          </Link>

          <Link
            to="/government/monitoring"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <Layers size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Monitoring</span>
            <span className="text-[10px] text-gray-400">Pilots & Deployments</span>
          </Link>

          <Link
            to="/government/analytics"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <BarChart3 size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Analytics</span>
            <span className="text-[10px] text-gray-400">State Insights</span>
          </Link>

          <Link
            to="/government/actions"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <Shield size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Actions</span>
            <span className="text-[10px] text-gray-400">Policy & Directives</span>
          </Link>

          <Link
            to="/government/profile"
            className="flex flex-col items-start p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mb-2 group-hover:scale-105 transition-transform">
              <Building2 size={16} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Profile</span>
            <span className="text-[10px] text-gray-400">Jurisdiction</span>
          </Link>
        </div>

        {/* Real Platform Oversight StatCards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Citizen Challenges"
            value={metrics ? `${metrics.total_challenges}` : "0"}
            icon={AlertTriangle}
            color="#0B63F6"
            subtext={`${metrics?.submitted_challenges ?? 0} submitted · ${metrics?.ai_processed_challenges ?? 0} AI processed`}
          />
          <StatCard
            label="University Projects"
            value={metrics ? `${metrics.total_university_projects}` : "0"}
            icon={FolderGit2}
            color="#8B5CF6"
            subtext={`${metrics?.active_university_projects ?? 0} active research workspaces`}
          />
          <StatCard
            label="Active Partnerships"
            value={metrics ? `${metrics.accepted_industry_partnerships}` : "0"}
            icon={Handshake}
            color="#10B981"
            subtext={`${metrics?.total_industry_partnerships ?? 0} total institutional alliances`}
          />
          <StatCard
            label="Active Mentorships"
            value={metrics ? `${metrics.active_mentorships}` : "0"}
            icon={Award}
            color="#6366F1"
            subtext="Specialists advising project cohorts"
          />
          <StatCard
            label="Pilot Projects"
            value={metrics ? `${metrics.pilot_projects}` : "0"}
            icon={CheckCircle2}
            color="#F59E0B"
            subtext="Real-world community trials"
          />
          <StatCard
            label="Deployments"
            value={metrics ? `${metrics.deployed_projects}` : "0"}
            icon={TrendingUp}
            color="#059669"
            subtext="Scaled solutions in field"
          />
          <StatCard
            label="Resource Contributions"
            value={metrics ? `${metrics.resource_contributions}` : "0"}
            icon={Package}
            color="#0EA5E9"
            subtext="Hardware, software & testbeds"
          />
          <StatCard
            label="Funding Proposals"
            value={metrics ? `${metrics.funding_proposals}` : "0"}
            icon={DollarSign}
            color="#EC4899"
            subtext="Grants & CSR capital proposals"
          />
        </div>

        {/* Lifecycle Progression Funnel */}
        {lifecycle && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33] flex items-center gap-2">
                  <Layers size={18} className="text-emerald-600" />
                  <span>State Innovation Lifecycle Progression</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  End-to-end advancement across all project lifecycle stages tracked in database.
                </p>
              </div>
              <Link
                to="/government/monitoring"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
              >
                Detailed Console <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  1. Research
                </span>
                <span className="text-2xl font-bold text-slate-900 font-mono">
                  {lifecycle.planning + lifecycle.research}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Planning & R&D</span>
              </div>

              <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider block mb-1">
                  2. Prototype
                </span>
                <span className="text-2xl font-bold text-purple-950 font-mono">
                  {lifecycle.solution_proposed + lifecycle.prototype}
                </span>
                <span className="text-[11px] text-purple-600/80 block mt-0.5">Active Prototypes</span>
              </div>

              <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
                  3. Field Pilots
                </span>
                <span className="text-2xl font-bold text-amber-950 font-mono">
                  {lifecycle.pilot}
                </span>
                <span className="text-[11px] text-amber-600/80 block mt-0.5">Community Testing</span>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 text-center">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
                  4. Deployments
                </span>
                <span className="text-2xl font-bold text-emerald-950 font-mono">
                  {lifecycle.deployment_ready + lifecycle.deployed}
                </span>
                <span className="text-[11px] text-emerald-600/80 block mt-0.5">Live Production</span>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-center col-span-2 sm:col-span-1">
                <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider block mb-1">
                  5. Total Tracked
                </span>
                <span className="text-2xl font-bold text-blue-950 font-mono">
                  {lifecycle.total_projects}
                </span>
                <span className="text-[11px] text-blue-600/80 block mt-0.5">Projects Portfolio</span>
              </div>
            </div>
          </div>
        )}

        {/* Recent Real Platform Activity */}
        <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-extrabold text-[#071A33] flex items-center gap-2">
                <Activity size={18} className="text-emerald-600" />
                <span>Recent Platform Activity Audit</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Authentic audit trail of project milestone completions, field pilots, industry partnerships, and resource pledges.
              </p>
            </div>
          </div>

          {activity.length === 0 ? (
            <div className="py-12 text-center max-w-md mx-auto space-y-3">
              <Activity size={32} className="text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-[#071A33]">No recent platform activity available.</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Platform activity records populate automatically as citizens report challenges, universities advance project milestones, and industry partners contribute resources.
              </p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
              {activity.map((act) => (
                <div key={act.id} className="relative">
                  <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-2xs" />
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-[#071A33] capitalize">
                        {act.action.replace("_", " ")}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {new Date(act.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}
