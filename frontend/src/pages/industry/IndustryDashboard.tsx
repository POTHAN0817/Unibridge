import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  Cpu,
  Users,
  Handshake,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  FolderPlus,
  ShieldCheck,
  Building2,
  Award,
  FolderGit2,
  Package,
  DollarSign,
  Layers,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { industryService } from "../../services/industryService";
import {
  IndustryProfile,
  IndustryPartnership,
  IndustryDiscoveredProjectSummary,
  IndustryDashboardMetrics,
} from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState<IndustryDashboardMetrics | null>(null);
  const [profile, setProfile] = useState<IndustryProfile | null>(null);
  const [recentPartnerships, setRecentPartnerships] = useState<IndustryPartnership[]>([]);
  const [discoveredProjects, setDiscoveredProjects] = useState<IndustryDiscoveredProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [m, prof, parts, projs] = await Promise.all([
          industryService.getDashboardMetrics().catch(() => ({
            discovered_projects: 0,
            pending_partnerships: 0,
            active_partnerships: 0,
            active_mentorships: 0,
            supported_projects: 0,
          })),
          industryService.getProfile().catch(() => null),
          industryService.getMyPartnerships().catch(() => []),
          industryService.discoverProjects({ limit: 4 }).catch(() => ({ items: [] })),
        ]);
        setMetrics(m);
        setProfile(prof);
        setRecentPartnerships(parts || []);
        setDiscoveredProjects(projs?.items || []);
      } catch (err) {
        console.error("Failed to load industry dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const companyName =
    profile?.company_name ||
    user?.organization ||
    (user?.profile as Record<string, any>)?.company_name ||
    "CORPORATE INNOVATION PARTNER";

  if (loading) {
    return <LoadingState message="Loading corporate dashboard and collaboration metrics..." />;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      <DashboardHeader
        badge={companyName}
        badgeColor="#F59E0B"
        title="Industry Innovation & Collaboration Hub"
        subtitle="Discover academic engineering solutions, partner with student-faculty cohorts, and assign corporate technical mentors."
      >
        <div className="flex items-center gap-2">
          <Link
            to="/industry/profile"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
          >
            Corporate Profile
          </Link>
          <Link
            to="/industry/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
          >
            <FolderGit2 size={15} /> Discover Projects
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Quick Navigation Cards Bar */}
        {/* Quick Navigation Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          <Link
            to="/industry/profile"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Building2 size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Profile</span>
            <span className="text-[10px] text-gray-400">Capabilities</span>
          </Link>

          <Link
            to="/industry/projects"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <FolderGit2 size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Discovery</span>
            <span className="text-[10px] text-gray-400">Projects</span>
          </Link>

          <Link
            to="/industry/partnerships"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Handshake size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Partnerships</span>
            <span className="text-[10px] text-gray-400">Expressions</span>
          </Link>

          <Link
            to="/industry/experts"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Users size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Experts</span>
            <span className="text-[10px] text-gray-400">Roster</span>
          </Link>

          <Link
            to="/industry/mentorship"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Award size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Mentorship</span>
            <span className="text-[10px] text-gray-400">Advisory</span>
          </Link>

          <Link
            to="/industry/technology"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Package size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Resources</span>
            <span className="text-[10px] text-gray-400">Tech Pledges</span>
          </Link>

          <Link
            to="/industry/funding"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <DollarSign size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Funding</span>
            <span className="text-[10px] text-gray-400">Grants & CSR</span>
          </Link>

          <Link
            to="/industry/partnerships"
            className="flex flex-col items-center text-center p-3 rounded-2xl border border-gray-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
              <Layers size={18} />
            </div>
            <span className="text-xs font-bold text-gray-900 block truncate">Supported</span>
            <span className="text-[10px] text-gray-400">Active Work</span>
          </Link>
        </div>

        {/* Real Metric Cards - 8 Real Statistics from MongoDB */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Discovered Projects"
            value={metrics ? `${metrics.discovered_projects}` : "0"}
            icon={FolderGit2}
            color="#F59E0B"
            subtext="Real university projects in pipeline"
          />
          <StatCard
            label="Pending Partnerships"
            value={metrics ? `${metrics.pending_partnerships}` : "0"}
            icon={Handshake}
            color="#0B63F6"
            subtext="Awaiting university review"
          />
          <StatCard
            label="Active Partnerships"
            value={metrics ? `${metrics.active_partnerships}` : "0"}
            icon={CheckCircle2}
            color="#10B981"
            subtext="Mutual institutional collaborations"
          />
          <StatCard
            label="Active Collaborations"
            value={metrics ? `${metrics.active_collaborations ?? metrics.active_partnerships}` : "0"}
            icon={Layers}
            color="#6366F1"
            subtext="Collaborative active project nodes"
          />
          <StatCard
            label="Active Mentorships"
            value={metrics ? `${metrics.active_mentorships}` : "0"}
            icon={Award}
            color="#8B5CF6"
            subtext="Assigned corporate specialists"
          />
          <StatCard
            label="Supported Projects"
            value={metrics ? `${metrics.supported_projects}` : "0"}
            icon={Building2}
            color="#059669"
            subtext="Projects with accepted partnerships"
          />
          <StatCard
            label="Resources Contributed"
            value={metrics ? `${metrics.resources_contributed ?? 0}` : "0"}
            icon={Package}
            color="#0EA5E9"
            subtext="Tech & infrastructure contributions"
          />
          <StatCard
            label="Funding Proposals"
            value={metrics ? `${metrics.funding_proposals ?? 0}` : "0"}
            icon={DollarSign}
            color="#EC4899"
            subtext="Grants and sponsorships pledged"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 columns: Active / Recent Partnerships & Discovered Pipeline */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Partnerships Summary */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#071A33]">
                    My Collaborative Partnerships
                  </h2>
                  <p className="text-xs text-gray-500">
                    Status of your partnership expressions across university research teams
                  </p>
                </div>
                <Link
                  to="/industry/partnerships"
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  View All <ArrowRight size={13} />
                </Link>
              </div>

              {recentPartnerships.length > 0 ? (
                <div className="space-y-3">
                  {recentPartnerships.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/industry/projects/${p.project_id}`)}
                      className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer group flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              p.status === "accepted"
                                ? "bg-emerald-50 text-emerald-800"
                                : p.status === "pending"
                                ? "bg-amber-50 text-amber-800"
                                : p.status === "rejected"
                                ? "bg-rose-50 text-rose-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {p.status}
                          </span>
                          <span className="text-xs text-gray-400 font-medium">· {p.university_name}</span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-600 transition-colors">
                          {p.project_name}
                        </h4>
                        {p.message && (
                          <p className="text-xs text-gray-500 italic mt-1 line-clamp-1">"{p.message}"</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                          Workspace <ArrowRight size={13} />
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(p.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-2">
                  <p className="text-xs text-gray-500">No partnerships initiated yet.</p>
                  <Link
                    to="/industry/projects"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:underline"
                  >
                    Discover projects to partner with &rarr;
                  </Link>
                </div>
              )}
            </div>

            {/* University Projects Pipeline Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-[#071A33]">
                    Discovered Academic Projects
                  </h2>
                  <p className="text-xs text-gray-500">
                    Active university projects open for corporate synergy
                  </p>
                </div>
                <Link
                  to="/industry/projects"
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  Browse All <ArrowRight size={13} />
                </Link>
              </div>

              {discoveredProjects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {discoveredProjects.map((proj) => (
                    <div
                      key={proj.project_id}
                      onClick={() => navigate(`/industry/projects/${proj.project_id}`)}
                      className="bg-white border border-gray-200 rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800">
                            {proj.challenge_category}
                          </span>
                          <span className="text-[10px] font-semibold text-gray-500 capitalize">
                            {proj.project_status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {proj.project_name}
                        </h4>
                        <p className="text-xs text-gray-500 line-clamp-2">
                          {proj.description || "University research initiative."}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 mt-3">
                        <span className="truncate max-w-[150px]">{proj.university_name}</span>
                        <span className="text-amber-600 font-bold flex items-center gap-0.5">
                          Inspect <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center space-y-2">
                  <p className="text-xs text-gray-500">No discovered projects available in pipeline.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Corporate Profile Status & Quick Links */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#071A33]">Corporate Profile</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {profile ? "Active" : "Incomplete"}
                </span>
              </div>

              {profile ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-gray-400 text-[11px] block">Company Name</span>
                    <strong className="text-gray-900 font-bold">{profile.company_name}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 text-[11px] block">Sector</span>
                    <span className="text-gray-800 font-medium">{profile.industry_sector}</span>
                  </div>
                  {profile.expertise.length > 0 && (
                    <div>
                      <span className="text-gray-400 text-[11px] block mb-1">Key Expertise</span>
                      <div className="flex flex-wrap gap-1">
                        {profile.expertise.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link
                      to="/industry/profile"
                      className="block w-full text-center py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      Manage Profile & Capabilities
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-gray-500">
                  <p>Complete your corporate profile to express partnership interest in university projects.</p>
                  <Link
                    to="/industry/profile"
                    className="block w-full text-center py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
                  >
                    Setup Profile
                  </Link>
                </div>
              )}
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-950">
                Collaboration Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/industry/projects"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-200/60 text-xs font-bold text-amber-950 transition-colors"
                >
                  <span>Discover University Projects</span>
                  <ArrowRight size={14} className="text-amber-600" />
                </Link>
                <Link
                  to="/industry/partnerships"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-200/60 text-xs font-bold text-amber-950 transition-colors"
                >
                  <span>Review Submitted Partnerships</span>
                  <ArrowRight size={14} className="text-amber-600" />
                </Link>
                <Link
                  to="/industry/experts"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-200/60 text-xs font-bold text-amber-950 transition-colors"
                >
                  <span>Register Technical Experts</span>
                  <ArrowRight size={14} className="text-amber-600" />
                </Link>
                <Link
                  to="/industry/mentorship"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-white hover:bg-amber-50/50 border border-amber-200/60 text-xs font-bold text-amber-950 transition-colors"
                >
                  <span>View Project Mentorships</span>
                  <ArrowRight size={14} className="text-amber-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
