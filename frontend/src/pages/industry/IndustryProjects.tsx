import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  ArrowRight,
  MapPin,
  Users,
  Search,
  Filter,
  X,
  Calendar,
  Building2,
  Layers,
  Sparkles,
  Target,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  FolderGit2,
} from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryDiscoveredProjectSummary, IndustryDiscoveredProjectsPage } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  planning: { label: "Planning", bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
  research: { label: "Research", bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
  solution_proposed: { label: "Solution Proposed", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  prototype: { label: "Prototyping", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  pilot: { label: "Field Pilot", bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  deployment: { label: "Deployment", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  completed: { label: "Completed", bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
};

const CATEGORIES = [
  "All Categories",
  "Water & Sanitation",
  "Healthcare",
  "Education",
  "Agriculture",
  "Clean Energy",
  "Waste Management",
  "Urban Infrastructure",
  "Disaster Resilience",
  "Environment",
];

export default function IndustryProjects() {
  const navigate = useNavigate();

  const [data, setData] = useState<IndustryDiscoveredProjectsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [universityFilter, setUniversityFilter] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;

  async function loadProjects() {
    setLoading(true);
    setError(null);
    try {
      const res = await industryService.discoverProjects({
        search: search.trim() || undefined,
        category: category !== "all" ? category : undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        university: universityFilter.trim() || undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load discovered projects:", err);
      setError(err?.message || "Failed to load projects for industry discovery.");
    } finally {
      setLoading(false);
    }
  }

  // Reload when filters change
  useEffect(() => {
    loadProjects();
  }, [category, statusFilter, page]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProjects();
    }, 350);
    return () => clearTimeout(timer);
  }, [search, universityFilter]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(search.trim() || (category && category !== "all") || (statusFilter && statusFilter !== "all") || universityFilter.trim());
  }, [search, category, statusFilter, universityFilter]);

  function clearAllFilters() {
    setSearch("");
    setCategory("all");
    setStatusFilter("all");
    setUniversityFilter("");
    setPage(1);
  }

  const projects = data?.items || [];
  const total = data?.total || 0;
  const totalPages = data?.total_pages || 1;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Academic Innovations Pipeline"
        badgeColor="#F59E0B"
        title="University Projects Discovery"
        subtitle="Explore active university research initiatives, student-faculty innovation cohorts, and field prototypes tackling civic challenges."
      />

      <PageContainer>
        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative md:col-span-2">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects by name, description, challenge, or university..."
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat === "All Categories" ? "all" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Lifecycle Phases</option>
                <option value="planning">Planning</option>
                <option value="research">Research</option>
                <option value="solution_proposed">Solution Proposed</option>
                <option value="prototype">Prototyping</option>
                <option value="pilot">Field Pilot</option>
                <option value="deployment">Deployment</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Secondary filter bar: University filter + active filter tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                Filter by University:
              </span>
              <input
                type="text"
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                placeholder="Type university name or location..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-semibold">
                {total} {total === 1 ? "Project Available" : "Projects Available"}
              </span>

              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && <LoadingState message="Discovering active university innovation projects..." />}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-rose-50 border border-rose-200 rounded-3xl p-8 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <AlertCircle size={32} className="text-rose-600 mx-auto" />
            <h4 className="text-sm font-bold text-rose-900">Unable to Load Projects</h4>
            <p className="text-xs text-rose-700 leading-relaxed">{error}</p>
            <button
              onClick={loadProjects}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs cursor-pointer"
            >
              Retry Discovery
            </button>
          </div>
        )}

        {/* Empty State: No projects on platform */}
        {!loading && !error && projects.length === 0 && !hasActiveFilters && (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <FolderGit2 size={24} />
            </div>
            <h3 className="text-base font-extrabold text-[#071A33]">No University Projects Initiated Yet</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When partner universities adopt citizen challenges and initiate multidisciplinary R&D workspaces, they will be dynamically listed here for corporate discovery and technology collaboration.
            </p>
          </div>
        )}

        {/* Filtered Empty State: No match */}
        {!loading && !error && projects.length === 0 && hasActiveFilters && (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <Search size={32} className="text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#071A33]">No Matching Projects Found</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              No university projects match your active search keywords or filter settings.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-xs cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        )}

        {/* Projects Cards Grid */}
        {!loading && !error && projects.length > 0 && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => {
                const statusCfg = STATUS_CONFIG[proj.project_status] || STATUS_CONFIG.planning;

                return (
                  <div
                    key={proj.project_id}
                    onClick={() => navigate(`/industry/projects/${proj.project_id}`)}
                    className="bg-white border border-gray-200/90 hover:border-amber-400 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Category and Status Badge */}
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">
                          {proj.challenge_category || "Civic Innovation"}
                        </span>
                        <span
                          className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Project Name & Description */}
                      <div>
                        <h3 className="font-extrabold text-lg text-[#071A33] group-hover:text-amber-600 transition-colors line-clamp-1">
                          {proj.project_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {proj.description || "No project scope notes provided."}
                        </p>
                      </div>

                      {/* Associated Civic Challenge Box */}
                      <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <Target size={12} className="text-amber-600" /> Target Challenge
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1">
                          {proj.challenge_title}
                        </h4>
                        {proj.challenge_location && (
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 pt-0.5">
                            <MapPin size={11} /> {proj.challenge_location}
                          </div>
                        )}
                      </div>

                      {/* University & Team Box */}
                      <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-bold text-gray-800 line-clamp-1">
                            <Building2 size={13} className="text-purple-600 shrink-0" />
                            <span>{proj.university_name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-indigo-700 shrink-0">
                            {proj.team_name}
                          </span>
                        </div>

                        {/* Team Size metrics */}
                        <div className="flex items-center gap-4 text-[11px] text-gray-500 pt-1 border-t border-gray-200/50">
                          <div className="flex items-center gap-1">
                            <Users size={12} className="text-gray-400" />
                            <span>
                              <strong>{proj.faculty_count}</strong> Faculty Mentors
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span>
                              <strong>{proj.student_count}</strong> Student Innovators
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline dates */}
                      {(proj.project_start_date || proj.target_date) && (
                        <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                          {proj.project_start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar size={12} className="text-gray-400" />
                              <span>Started: <strong className="text-gray-700">{proj.project_start_date}</strong></span>
                            </div>
                          )}
                          {proj.target_date && (
                            <div className="flex items-center gap-1">
                              <span>Target: <strong className="text-gray-700">{proj.target_date}</strong></span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">Read-only Discovery</span>
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 group-hover:text-amber-800 transition-colors">
                        Inspect Project Dossier <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-xs">
                <span className="text-gray-500 font-medium">
                  Page {page} of {totalPages} ({total} Total Projects)
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span className="px-3 py-1 font-bold text-gray-800">{page}</span>

                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 disabled:opacity-40 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
