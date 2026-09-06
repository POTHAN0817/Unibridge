import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield,
  Building2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
  GraduationCap,
  Briefcase,
  Layers,
  ArrowRight,
  Package,
  DollarSign,
  Activity,
  FolderGit2,
  Handshake,
  Award,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { governmentService } from "../../services/governmentService";
import {
  GovernmentDashboardMetrics,
  GovernmentProfile,
  PlatformActivityItem,
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
  const [activity, setActivity] = useState<PlatformActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      try {
        const [m, prof, act] = await Promise.all([
          governmentService.getDashboardMetrics().catch(() => null),
          governmentService.getProfile().catch(() => null),
          governmentService.getRecentActivity().catch(() => []),
        ]);
        setMetrics(m);
        setProfile(prof);
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

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header Banner */}
      <DashboardHeader
        badge={departmentBadge}
        badgeColor="#10B981"
        title="Government Command Center"
        subtitle="Real-time administrative oversight across citizen challenges, university research pipelines, and enterprise co-investments."
      >
        <Link
          to="/government/profile"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-200"
        >
          <Building2 size={14} /> Official Profile
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
          <Link
            to="/government/profile"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-900 block truncate">Profile</span>
              <span className="text-[10px] text-gray-400">Jurisdiction</span>
            </div>
          </Link>

          <Link
            to="/government/challenges"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <AlertTriangle size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-900 block truncate">Challenges</span>
              <span className="text-[10px] text-gray-400">Civic Issues</span>
            </div>
          </Link>

          <Link
            to="/government/projects"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <FolderGit2 size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-900 block truncate">Projects</span>
              <span className="text-[10px] text-gray-400">University Teams</span>
            </div>
          </Link>

          <Link
            to="/government/industry"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Handshake size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-900 block truncate">Collaborations</span>
              <span className="text-[10px] text-gray-400">Industry Alliances</span>
            </div>
          </Link>

          <Link
            to="/government/projects"
            className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-emerald-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-gray-900 block truncate">Monitoring</span>
              <span className="text-[10px] text-gray-400">Pilots & Deployments</span>
            </div>
          </Link>
        </div>

        {/* Real Platform Oversight StatCards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Challenges"
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
