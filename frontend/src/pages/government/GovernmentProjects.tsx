import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  Search,
  Filter,
  ArrowRight,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  Milestone,
  Cpu,
  Coins,
  Users,
  MapPin,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import { GovernmentProjectSummary, GovernmentProjectsPage } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

export default function GovernmentProjects() {
  const navigate = useNavigate();
  const [data, setData] = useState<GovernmentProjectsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await governmentService.getProjects({
        search: search.trim() || undefined,
        category: category !== "all" ? category : undefined,
        project_status: status !== "all" ? status : undefined,
        page,
        limit: 9,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load government projects", err);
      setError("Unable to load university projects. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, category, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProjects();
  };

  const statusBadgeColor = (st: string) => {
    switch (st.toLowerCase()) {
      case "completed":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "deployment":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "pilot":
        return "bg-blue-50 text-blue-800 border-blue-200";
      case "prototype":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "solution_proposed":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "research":
        return "bg-indigo-50 text-indigo-800 border-indigo-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        badge="Academic R&D Oversight"
        badgeColor="#10B981"
        title="University Project Pipeline"
        subtitle="Live administrative oversight of university research initiatives, prototypes, and field deployments solving citizen challenges."
      >
        <button
          onClick={() => fetchProjects()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh Pipeline
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Projects</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{data?.total ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">In Planning</span>
            <p className="text-2xl font-black text-slate-700 mt-1">{data?.status_counts?.planning ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600">Research</span>
            <p className="text-2xl font-black text-indigo-700 mt-1">{data?.status_counts?.research ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Prototypes</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{data?.status_counts?.prototype ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600">Field Pilots</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{data?.status_counts?.pilot ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Deployed</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              {(data?.status_counts?.deployment ?? 0) + (data?.status_counts?.completed ?? 0)}
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by title, description or keyword..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Stages</option>
                <option value="planning">Planning</option>
                <option value="research">Research</option>
                <option value="solution_proposed">Solution Proposed</option>
                <option value="prototype">Prototype</option>
                <option value="pilot">Pilot</option>
                <option value="deployment">Deployment</option>
                <option value="completed">Completed</option>
              </select>

              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-xs"
              >
                Filter
              </button>
            </div>
          </form>
        </div>

        {/* Content Area */}
        {loading ? (
          <LoadingState message="Loading live university projects..." />
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-xs">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
            <button
              onClick={() => fetchProjects()}
              className="mt-3 px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No Projects Found"
            description="No university projects match the selected criteria in the live repository."
            actionText="Reset Filters"
            onAction={() => {
              setSearch("");
              setStatus("all");
              setCategory("all");
              setPage(1);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((proj) => {
              const progressPct =
                proj.milestone_count > 0
                  ? Math.round((proj.completed_milestone_count / proj.milestone_count) * 100)
                  : 0;

              return (
                <div
                  key={proj.project_id}
                  onClick={() => navigate(`/government/projects/${proj.project_id}`)}
                  className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {proj.category || "General"}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeColor(proj.project_status)}`}>
                        {proj.project_status.replace("_", " ").toUpperCase()}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                      {proj.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                      {proj.description || "No project description documented."}
                    </p>

                    {/* University & Team Info */}
                    <div className="space-y-1.5 mb-4 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <GraduationCap size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate">{proj.university_name || "Academic Partner"}</span>
                      </div>
                      {proj.challenge_title && (
                        <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                          <span className="font-semibold text-slate-400 shrink-0">Challenge:</span>
                          <span className="truncate text-slate-600">{proj.challenge_title}</span>
                        </div>
                      )}
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 mb-4">
                      <div className="flex justify-between items-center text-[11px] font-semibold text-slate-600 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Milestone size={13} className="text-slate-400" />
                          Milestones ({proj.completed_milestone_count}/{proj.milestone_count})
                        </span>
                        <span className="text-slate-900">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Artifacts & Industry collaboration badges */}
                    <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500 mb-4">
                      {proj.prototype_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                          <Cpu size={11} /> {proj.prototype_count} Prototype{proj.prototype_count > 1 ? "s" : ""}
                        </span>
                      )}
                      {proj.pilot_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                          <CheckCircle2 size={11} /> {proj.pilot_count} Field Pilot{proj.pilot_count > 1 ? "s" : ""}
                        </span>
                      )}
                      {proj.industry_partnership_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                          <Building2 size={11} /> {proj.industry_partnership_count} Industry Partner{proj.industry_partnership_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Users size={12} /> {proj.team_size} Team Members
                    </span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Inspect Dossier <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-xs">
            <span className="text-xs text-slate-500">
              Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> ({data.total} total projects)
            </span>
            <div className="flex gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
