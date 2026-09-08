import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  Coins,
  Cpu,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import { GovernmentCollaborationSummary, GovernmentCollaborationsPage } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

export default function GovernmentCollaborations() {
  const navigate = useNavigate();
  const [data, setData] = useState<GovernmentCollaborationsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await governmentService.getCollaborations({
        search: search.trim() || undefined,
        status: status !== "all" ? status : undefined,
        page,
        limit: 9,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load collaborations", err);
      setError("Unable to load industry collaborations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollaborations();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchCollaborations();
  };

  const statusBadge = (st: string) => {
    switch (st.toLowerCase()) {
      case "accepted":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "rejected":
        return "bg-rose-50 text-rose-800 border-rose-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        badge="Public-Private Ecosystem"
        badgeColor="#10B981"
        title="Industry Collaboration Oversight"
        subtitle="Monitoring corporate partnerships, technical mentorships, equipment contributions, and sponsorship funding across academic labs."
      >
        <button
          onClick={() => fetchCollaborations()}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Total Partnerships</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{data?.summary_counts?.total ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">Active / Accepted</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{data?.summary_counts?.accepted ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-600">Pending Review</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{data?.summary_counts?.pending ?? 0}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Withdrawn / Closed</span>
            <p className="text-2xl font-black text-slate-600 mt-1">
              {(data?.summary_counts?.rejected ?? 0) + (data?.summary_counts?.withdrawn ?? 0)}
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-xs">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by company name, industry sector, or project..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-medium focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="accepted">Accepted</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
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

        {/* Content */}
        {loading ? (
          <LoadingState message="Loading industry collaboration partnerships..." />
        ) : error ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-rose-100 shadow-xs">
            <p className="text-sm font-semibold text-rose-700">{error}</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <EmptyState
            title="No Collaborations Recorded"
            description="No industry partnerships currently match your filter criteria."
            actionText="Clear Filters"
            onAction={() => {
              setSearch("");
              setStatus("all");
              setPage(1);
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((collab) => (
              <div
                key={collab.partnership_id}
                onClick={() => navigate(`/government/collaborations/${collab.partnership_id}`)}
                className="bg-white border border-slate-200/90 hover:border-emerald-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {collab.industry_sector || "Technology"}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadge(collab.partnership_status)}`}>
                      {collab.partnership_status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 mb-1">
                    {collab.company_name}
                  </h3>

                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-medium">
                      <GraduationCap size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{collab.university_name || "Academic Partner"}</span>
                    </div>
                    {collab.project_name && (
                      <div className="flex items-center gap-2 text-slate-600 text-[11px]">
                        <Briefcase size={14} className="text-slate-400 shrink-0" />
                        <span className="truncate">{collab.project_name}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center mb-4">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Mentors</span>
                      <strong className="text-xs text-slate-800">{collab.mentor_count}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Resources</span>
                      <strong className="text-xs text-slate-800">{collab.resource_contribution_count}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Funding</span>
                      <strong className="text-xs text-slate-800">{collab.funding_proposal_count}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] font-mono">
                    {collab.created_at ? collab.created_at.slice(0, 10) : ""}
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Inspect Details <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="mt-8 flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-xs">
            <span className="text-xs text-slate-500">
              Page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong>
            </span>
            <div className="flex gap-2">
              <button
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={data.page >= data.total_pages}
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40"
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
