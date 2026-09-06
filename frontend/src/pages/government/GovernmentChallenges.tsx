import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Clock,
  ArrowRight,
  MapPin,
  Users,
  Brain,
  Layers,
  Copy,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import {
  GovernmentChallengesPage,
  GovernmentChallengeSummary,
  GovernmentReviewDecision,
} from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentChallenges() {
  const navigate = useNavigate();

  // Data state
  const [data, setData] = useState<GovernmentChallengesPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [priorityLevel, setPriorityLevel] = useState("all");
  const [reviewStatus, setReviewStatus] = useState<string>("all");
  const [aiStatus, setAiStatus] = useState("all");
  const [duplicateStatus, setDuplicateStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  // Load challenges with server-side filtering & pagination
  const loadChallenges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await governmentService.getChallenges({
        search: search.trim() || undefined,
        category: category !== "all" ? category : undefined,
        priority_level: priorityLevel !== "all" ? priorityLevel : undefined,
        government_review_status: reviewStatus !== "all" ? reviewStatus : undefined,
        ai_status: aiStatus !== "all" ? aiStatus : undefined,
        duplicate_status: duplicateStatus !== "all" ? duplicateStatus : undefined,
        page,
        limit,
      });
      setData(res);
    } catch (err: any) {
      console.error("Failed to load challenges:", err);
      setError(err?.response?.data?.detail || "Failed to load societal challenges from registry.");
    } finally {
      setLoading(false);
    }
  }, [search, category, priorityLevel, reviewStatus, aiStatus, duplicateStatus, page]);

  useEffect(() => {
    loadChallenges();
  }, [loadChallenges]);

  const handleResetFilters = () => {
    setSearch("");
    setCategory("all");
    setPriorityLevel("all");
    setReviewStatus("all");
    setAiStatus("all");
    setDuplicateStatus("all");
    setPage(1);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    category !== "all" ||
    priorityLevel !== "all" ||
    reviewStatus !== "all" ||
    aiStatus !== "all" ||
    duplicateStatus !== "all";

  // Decision badge styling
  const renderDecisionBadge = (decision: GovernmentReviewDecision) => {
    switch (decision) {
      case "validated":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Validated
          </span>
        );
      case "clarification_required":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <HelpCircle size={12} /> Clarification Required
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} /> Rejected
          </span>
        );
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  const renderPriorityBadge = (level?: string | null, score?: number | null) => {
    const l = level?.toLowerCase();
    let bg = "bg-slate-100 text-slate-700 border-slate-200";
    if (l === "critical") bg = "bg-rose-50 text-rose-700 border-rose-200";
    else if (l === "high") bg = "bg-amber-50 text-amber-700 border-amber-200";
    else if (l === "medium") bg = "bg-blue-50 text-blue-700 border-blue-200";
    else if (l === "low") bg = "bg-emerald-50 text-emerald-700 border-emerald-200";

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${bg}`}>
        {level || "Priority"} {score !== undefined && score !== null ? `(${score})` : ""}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        badge="Government Oversight & Validation"
        badgeColor="#059669"
        title="Challenge Command Center"
        subtitle="Review, audit, and officially validate societal problems reported by citizens across administrative jurisdictions."
      />

      <PageContainer>
        {/* SUMMARY STAT CARDS - Real data from backend */}
        {data?.summary_counts && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
            <div
              onClick={() => {
                setReviewStatus("all");
                setPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                reviewStatus === "all"
                  ? "bg-white border-emerald-500 shadow-xs ring-2 ring-emerald-500/10"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Total Challenges</span>
                <Layers size={16} className="text-gray-400" />
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">
                {data.summary_counts.total}
              </div>
              <span className="text-[10px] text-gray-400">All recorded issues</span>
            </div>

            <div
              onClick={() => {
                setReviewStatus("pending");
                setPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                reviewStatus === "pending"
                  ? "bg-white border-slate-600 shadow-xs ring-2 ring-slate-600/10"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600">Pending Review</span>
                <Clock size={16} className="text-slate-400" />
              </div>
              <div className="text-2xl font-black text-slate-800 mt-2">
                {data.summary_counts.pending}
              </div>
              <span className="text-[10px] text-slate-500">Awaiting official action</span>
            </div>

            <div
              onClick={() => {
                setReviewStatus("validated");
                setPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                reviewStatus === "validated"
                  ? "bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-600/10"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700">Validated</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-2">
                {data.summary_counts.validated}
              </div>
              <span className="text-[10px] text-emerald-600">Approved for progression</span>
            </div>

            <div
              onClick={() => {
                setReviewStatus("clarification_required");
                setPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                reviewStatus === "clarification_required"
                  ? "bg-white border-amber-500 shadow-xs ring-2 ring-amber-500/10"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700">Clarification</span>
                <HelpCircle size={16} className="text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-700 mt-2">
                {data.summary_counts.clarification_required}
              </div>
              <span className="text-[10px] text-amber-600">Submitter info requested</span>
            </div>

            <div
              onClick={() => {
                setReviewStatus("rejected");
                setPage(1);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                reviewStatus === "rejected"
                  ? "bg-white border-rose-500 shadow-xs ring-2 ring-rose-500/10"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-700">Rejected</span>
                <XCircle size={16} className="text-rose-500" />
              </div>
              <div className="text-2xl font-black text-rose-700 mt-2">
                {data.summary_counts.rejected}
              </div>
              <span className="text-[10px] text-rose-600">Not validated for platform</span>
            </div>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Search */}
            <div className="md:col-span-4 relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by title, description..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div className="md:col-span-2">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-gray-700"
              >
                <option value="all">All Categories</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Waste Management">Waste Management</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Urban Mobility">Urban Mobility</option>
                <option value="Road Safety">Road Safety</option>
                <option value="Public Health">Public Health</option>
                <option value="Education">Education</option>
                <option value="Energy">Energy</option>
                <option value="Environment">Environment</option>
                <option value="Infrastructure">Infrastructure</option>
              </select>
            </div>

            {/* Priority */}
            <div className="md:col-span-2">
              <select
                value={priorityLevel}
                onChange={(e) => {
                  setPriorityLevel(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-gray-700"
              >
                <option value="all">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            {/* Review Status */}
            <div className="md:col-span-2">
              <select
                value={reviewStatus}
                onChange={(e) => {
                  setReviewStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-gray-700"
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="validated">Validated</option>
                <option value="clarification_required">Clarification</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* AI Status / Duplicate */}
            <div className="md:col-span-2 flex items-center gap-2">
              <select
                value={duplicateStatus}
                onChange={(e) => {
                  setDuplicateStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none text-gray-700"
              >
                <option value="all">Duplicate Status</option>
                <option value="unique">Unique</option>
                <option value="potential_duplicate">Potential Duplicate</option>
                <option value="duplicate">Verified Duplicate</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  title="Reset Filters"
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ERROR STATE */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* CONTENT STATE */}
        {loading ? (
          <LoadingState message="Loading challenge command center records..." />
        ) : !data || data.items.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Filter size={20} />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">No challenges found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-4">
              {hasActiveFilters
                ? "No challenges match the active filter criteria. Try adjusting or clearing your filters."
                : "No societal challenges have been recorded in the platform database yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw size={12} /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* CHALLENGE LIST */}
            {data.items.map((c) => {
              const locationText =
                c.location?.district && c.location?.state
                  ? `${c.location.district}, ${c.location.state}`
                  : c.location?.district || c.location?.state || "Location Unspecified";

              return (
                <div
                  key={c.challenge_id}
                  onClick={() => navigate(`/government/challenges/${c.challenge_id}`)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md hover:border-emerald-400 transition-all cursor-pointer group flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                >
                  <div className="flex-1 min-w-0">
                    {/* Header tags */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {c.category && (
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      )}
                      {renderPriorityBadge(c.priority_level, c.priority_score)}
                      {renderDecisionBadge(c.government_review_decision)}

                      {c.duplicate_status === "duplicate" || c.duplicate_status === "potential_duplicate" ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Copy size={11} /> {Math.round((c.highest_similarity || 0) * 100)}% Similarity
                        </span>
                      ) : null}

                      {c.has_project && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <FolderGit2 size={11} /> Active University Project
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>

                    {/* Meta information */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mt-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" /> {locationText}
                      </span>
                      {c.affected_people !== undefined && c.affected_people !== null && (
                        <span className="flex items-center gap-1">
                          <Users size={13} className="text-gray-400" /> {c.affected_people} citizens affected
                        </span>
                      )}
                      {c.ai_confidence !== undefined && c.ai_confidence !== null && (
                        <span className="flex items-center gap-1 text-emerald-600 font-medium">
                          <Brain size={13} /> {Math.round(c.ai_confidence * 100)}% AI Confidence
                        </span>
                      )}
                      {c.university_name && (
                        <span className="text-purple-700 font-semibold">
                          Adopted: {c.university_name}
                        </span>
                      )}
                      <span className="text-gray-400">
                        Submitted: {new Date(c.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Right side CTA & Priority Score */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 shrink-0">
                    <div className="text-left lg:text-right">
                      <span className="text-2xl font-black text-emerald-600">
                        {c.priority_score !== undefined && c.priority_score !== null ? c.priority_score : "—"}
                      </span>
                      <span className="text-[10px] text-gray-400 block font-medium uppercase tracking-wider">
                        Priority Score
                      </span>
                    </div>

                    <div className="mt-2 flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
                      Inspect & Review <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* PAGINATION CONTROLS */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Showing page <strong>{data.page}</strong> of <strong>{data.total_pages}</strong> (
                <strong>{data.total}</strong> total challenges)
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={data.page <= 1}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <ChevronLeft size={14} /> Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                  disabled={data.page >= data.total_pages}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
