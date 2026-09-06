import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Handshake,
  Search,
  Filter,
  X,
  Building2,
  Target,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  FolderGit2,
  Users,
  Package,
  DollarSign,
} from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryPartnership, IndustryCollaborationSummary } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryPartnerships() {
  const navigate = useNavigate();
  const [partnerships, setPartnerships] = useState<IndustryPartnership[]>([]);
  const [summaries, setSummaries] = useState<Record<string, IndustryCollaborationSummary>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await industryService.getMyPartnerships({
        status: statusFilter !== "all" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setPartnerships(data || []);

      // Load collaboration summaries for accepted partnerships
      const accepted = (data || []).filter((p) => p.status === "accepted");
      if (accepted.length > 0) {
        const summaryResults = await Promise.all(
          accepted.map((p) =>
            industryService
              .getCollaborationSummary(p.project_id)
              .then((res) => ({ projectId: p.project_id, data: res }))
              .catch(() => null)
          )
        );
        const map: Record<string, IndustryCollaborationSummary> = {};
        summaryResults.forEach((r) => {
          if (r && r.data) map[r.projectId] = r.data;
        });
        setSummaries(map);
      }
    } catch (err: any) {
      console.error("Failed to load partnerships:", err);
      setError(err?.message || "Failed to load partnerships.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleWithdraw(partnershipId: string, projectName?: string) {
    const name = projectName || "this project";
    if (!window.confirm(`Are you sure you want to withdraw your partnership interest for ${name}?`)) {
      return;
    }

    try {
      const updated = await industryService.withdrawPartnership(partnershipId);
      setPartnerships((prev) =>
        prev.map((p) => (p.id === partnershipId ? { ...p, status: updated.status } : p))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw partnership request.");
    }
  }

  const hasFilters = Boolean(search.trim() || statusFilter !== "all");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Corporate Collaboration Registry"
        badgeColor="#F59E0B"
        title="My Project Partnerships"
        subtitle="Track submitted partnership expressions of interest, accepted institutional collaborations, and active engagement statuses."
      >
        <Link
          to="/industry/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
        >
          <FolderGit2 size={15} /> Discover Projects
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search partnerships by project, university, challenge, or note..."
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

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Partnership Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="accepted">Accepted Collaborations</option>
                <option value="rejected">Declined</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>

          {hasFilters && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs text-gray-500">
              <span>Showing filtered partnership results</span>
              <button
                onClick={() => {
                  setSearch("");
                  setStatusFilter("all");
                }}
                className="font-semibold text-amber-700 hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Content States */}
        {loading ? (
          <LoadingState message="Loading your partnership portfolio from database..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Failed to load partnerships</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : partnerships.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Handshake size={28} />
            </div>
            {hasFilters ? (
              <>
                <h3 className="text-base font-bold text-gray-900">No matching partnerships found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search criteria or status filter to see other partnership records.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900">No Partnership Requests Yet</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  {"You haven't submitted any partnership expressions of interest yet. Discover university projects tackling civic challenges and partner with student-faculty innovation cohorts."}
                </p>
                <Link
                  to="/industry/projects"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
                >
                  <FolderGit2 size={14} /> Explore University Projects
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {partnerships.map((p) => {
              const isPending = p.status === "pending";
              const isAccepted = p.status === "accepted";
              const isRejected = p.status === "rejected";
              const isWithdrawn = p.status === "withdrawn";
              const summary = summaries[p.project_id];

              return (
                <div
                  key={p.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                            isAccepted
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : isPending
                              ? "bg-amber-50 text-amber-800 border-amber-200"
                              : isRejected
                              ? "bg-rose-50 text-rose-800 border-rose-200"
                              : "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          {p.status}
                        </span>
                        {p.challenge_category && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                            {p.challenge_category}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-gray-900 leading-snug">
                        {p.project_name || "University Project"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Building2 size={13} className="text-gray-400" />
                        <span>{p.university_name || "University Partner"}</span>
                        {p.challenge_title && (
                          <>
                            <span className="text-gray-300">·</span>
                            <span className="italic text-gray-400">"{p.challenge_title}"</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPending && (
                        <button
                          onClick={() => handleWithdraw(p.id, p.project_name)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-rose-700 hover:bg-rose-50 border border-gray-200 transition-colors cursor-pointer"
                        >
                          Withdraw
                        </button>
                      )}
                      <Link
                        to={`/industry/projects/${p.project_id}`}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                      >
                        <span>Open Workspace</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>

                  {/* Accepted Partnership Multi-Domain Collaboration Status */}
                  {isAccepted && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                          <Users size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Mentorship</p>
                          <p className="text-xs font-bold text-gray-800">
                            {summary ? `${summary.assigned_mentors_count} Mentors Assigned` : "Mentorship Enabled"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <Package size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Resources</p>
                          <p className="text-xs font-bold text-gray-800">
                            {summary ? `${summary.resources_count} Contributed` : "Resources Ready"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-xl p-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shrink-0">
                          <DollarSign size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Funding</p>
                          <p className="text-xs font-bold text-gray-800">
                            {summary ? `${summary.funding_proposals_count} Proposals` : "Funding Ready"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {p.message && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                      <span className="block font-bold text-gray-700 mb-0.5 text-[11px] uppercase tracking-wider">
                        Submitted Collaboration Note:
                      </span>
                      <p className="italic">"{p.message}"</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-3 border-t border-gray-100">
                    <span>Submitted: {new Date(p.created_at).toLocaleDateString()}</span>
                    <span>Last Updated: {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recent"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
