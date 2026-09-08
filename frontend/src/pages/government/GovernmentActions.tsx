import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Shield,
  Plus,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Calendar,
  ExternalLink,
  ChevronRight,
  FileText,
  Trash2,
  Play,
  RotateCcw,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import type {
  GovernmentAction,
  GovernmentActionType,
  GovernmentActionTargetType,
  GovernmentActionPriority,
  GovernmentActionStatus,
  GovernmentActionCreateInput,
} from "../../types";

const ACTION_TYPE_LABELS: Record<GovernmentActionType, string> = {
  review_followup: "Review Follow-up",
  clarification_followup: "Clarification Follow-up",
  monitoring_required: "Monitoring Required",
  policy_attention: "Policy Attention",
  coordination_required: "Coordination Required",
  deployment_followup: "Deployment Follow-up",
  pilot_followup: "Pilot Follow-up",
  other: "Other Action",
};

const ACTION_TYPE_COLORS: Record<GovernmentActionType, string> = {
  review_followup: "bg-blue-50 text-blue-700 border-blue-200",
  clarification_followup: "bg-amber-50 text-amber-700 border-amber-200",
  monitoring_required: "bg-emerald-50 text-emerald-700 border-emerald-200",
  policy_attention: "bg-purple-50 text-purple-700 border-purple-200",
  coordination_required: "bg-indigo-50 text-indigo-700 border-indigo-200",
  deployment_followup: "bg-teal-50 text-teal-700 border-teal-200",
  pilot_followup: "bg-cyan-50 text-cyan-700 border-cyan-200",
  other: "bg-gray-50 text-gray-700 border-gray-200",
};

const PRIORITY_BADGES: Record<GovernmentActionPriority, { label: string; cls: string }> = {
  critical: { label: "Critical", cls: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "High", cls: "bg-amber-100 text-amber-800 border-amber-200" },
  medium: { label: "Medium", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  low: { label: "Low", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const STATUS_CONFIG: Record<
  GovernmentActionStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  open: { label: "Open", icon: Clock, cls: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  in_progress: { label: "In Progress", icon: Play, cls: "bg-blue-50 text-blue-800 border-blue-200" },
  completed: { label: "Completed", icon: CheckCircle2, cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", icon: XCircle, cls: "bg-gray-50 text-gray-700 border-gray-200" },
};

export default function GovernmentActions() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query State
  const initialTargetType = (searchParams.get("target_type") as GovernmentActionTargetType) || "";
  const initialTargetId = searchParams.get("target_id") || "";
  const initialOpenModal = searchParams.get("create") === "true";

  const [actions, setActions] = useState<GovernmentAction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>(initialTargetType || "all");
  const [page, setPage] = useState(1);
  const limit = 12;

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(initialOpenModal);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [formData, setFormData] = useState<GovernmentActionCreateInput>({
    action_type: "review_followup",
    target_type: (initialTargetType as GovernmentActionTargetType) || "project",
    target_id: initialTargetId,
    title: "",
    description: "",
    priority: "medium",
    due_date: "",
  });

  // Action status transition state
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchActions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await governmentService.getActions({
        status: statusFilter !== "all" ? statusFilter : undefined,
        priority: priorityFilter !== "all" ? priorityFilter : undefined,
        action_type: typeFilter !== "all" ? typeFilter : undefined,
        target_type: targetTypeFilter !== "all" ? targetTypeFilter : undefined,
        page,
        limit,
      });
      setActions(res.items);
      setTotal(res.total);
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || "Failed to load administrative actions");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, typeFilter, targetTypeFilter, page, limit]);

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setModalError("Action title is required.");
      return;
    }
    if (!formData.target_id.trim()) {
      setModalError("Target record ID is required.");
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);
      await governmentService.createAction({
        ...formData,
        due_date: formData.due_date || undefined,
      });
      setIsModalOpen(false);
      // Reset URL query if pre-filled
      if (initialOpenModal || initialTargetId) {
        setSearchParams({});
      }
      setFormData({
        action_type: "review_followup",
        target_type: "project",
        target_id: "",
        title: "",
        description: "",
        priority: "medium",
        due_date: "",
      });
      await fetchActions();
    } catch (err: unknown) {
      const e = err as Error;
      setModalError(e.message || "Failed to create action");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (actionId: string, newStatus: GovernmentActionStatus) => {
    try {
      setProcessingId(actionId);
      await governmentService.updateAction(actionId, { status: newStatus });
      await fetchActions();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error updating action: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (actionId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this administrative action?")) {
      return;
    }
    try {
      setProcessingId(actionId);
      await governmentService.deleteAction(actionId);
      await fetchActions();
    } catch (err: unknown) {
      const e = err as Error;
      alert(`Error deleting action: ${e.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getTargetLink = (targetType: string, targetId: string) => {
    switch (targetType) {
      case "challenge":
        return `/government/challenges/${targetId}`;
      case "project":
        return `/government/projects/${targetId}`;
      case "partnership":
        return `/government/collaborations/${targetId}`;
      default:
        return "#";
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm tracking-wide uppercase">
            <Shield className="w-4 h-4" />
            Administrative Oversight & Decisions
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mt-1">Government Actions</h1>
          <p className="text-gray-500 text-sm mt-1 max-w-2xl">
            Track, assign, and record administrative interventions, policy notes, and resource allocations across challenges, projects, and partnerships.
          </p>
        </div>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-sm transition-colors text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Action
          </button>
        </div>
      </div>

      {/* Target Focus Banner if filtered by a specific ID from another page */}
      {initialTargetId && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-sm font-semibold text-emerald-900">
                Filtered by Target: {initialTargetType.toUpperCase()} ({initialTargetId})
              </p>
              <p className="text-xs text-emerald-700">
                Showing recorded administrative actions linked specifically to this entity.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* Status Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(["all", "open", "in_progress", "completed", "cancelled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === s
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Action Types</option>
            <option value="review_followup">Review Follow-up</option>
            <option value="clarification_followup">Clarification Follow-up</option>
            <option value="monitoring_required">Monitoring Required</option>
            <option value="policy_attention">Policy Attention</option>
            <option value="coordination_required">Coordination Required</option>
            <option value="deployment_followup">Deployment Follow-up</option>
            <option value="pilot_followup">Pilot Follow-up</option>
            <option value="other">Other Action</option>
          </select>

          <select
            value={targetTypeFilter}
            onChange={(e) => {
              setTargetTypeFilter(e.target.value);
              setPage(1);
            }}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-1.5 bg-white text-gray-700 font-medium focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="all">All Targets</option>
            <option value="challenge">Citizen Challenges</option>
            <option value="project">University Projects</option>
            <option value="partnership">Industry Collaborations</option>
            <option value="pilot">Field Pilots</option>
            <option value="deployment">Deployments</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-white rounded-xl border border-gray-200">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-sm text-gray-500 font-medium">Loading administrative records...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
          <p className="text-red-800 font-medium">{error}</p>
          <button
            onClick={() => fetchActions()}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : actions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900">No actions found</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            No administrative actions match your current filter criteria. Record a new action or adjust your filters.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record First Action
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((act) => {
              const statusCfg = STATUS_CONFIG[act.status] || STATUS_CONFIG.open;
              const StatusIcon = statusCfg.icon;
              const prioCfg = PRIORITY_BADGES[act.priority] || PRIORITY_BADGES.medium;
              const isWorking = processingId === act.id;

              return (
                <div
                  key={act.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:border-gray-300 transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Type & Priority & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                            ACTION_TYPE_COLORS[act.action_type] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {ACTION_TYPE_LABELS[act.action_type] || act.action_type}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${prioCfg.cls}`}>
                          {prioCfg.label}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusCfg.cls}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-semibold text-gray-900 text-base mb-1.5">{act.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">{act.description}</p>
                  </div>

                  {/* Target Link & Metadata */}
                  <div className="pt-3 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-700 capitalize">{act.target_type}:</span>
                        <Link
                          to={getTargetLink(act.target_type, act.target_id)}
                          className="text-emerald-700 hover:text-emerald-900 font-medium inline-flex items-center gap-0.5 hover:underline"
                        >
                          {act.target_id.slice(-8)}
                          <ExternalLink className="w-3 h-3 ml-0.5" />
                        </Link>
                      </div>
                      {act.due_date && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          Due: {new Date(act.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-gray-400">
                        Logged: {new Date(act.created_at).toLocaleDateString()}
                      </span>

                      {/* State Transitions */}
                      <div className="flex items-center gap-1.5">
                        {act.status === "open" && (
                          <button
                            disabled={isWorking}
                            onClick={() => handleStatusChange(act.id, "in_progress")}
                            className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Start Work
                          </button>
                        )}
                        {act.status !== "completed" && (
                          <button
                            disabled={isWorking}
                            onClick={() => handleStatusChange(act.id, "completed")}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Mark Completed
                          </button>
                        )}
                        {act.status !== "cancelled" && act.status !== "completed" && (
                          <button
                            disabled={isWorking}
                            onClick={() => handleStatusChange(act.id, "cancelled")}
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded border border-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          disabled={isWorking}
                          onClick={() => handleDelete(act.id)}
                          title="Delete Action"
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-xl">
              <span className="text-xs text-gray-700 font-medium">
                Showing page <span className="font-bold">{page}</span> of{" "}
                <span className="font-bold">{totalPages}</span> ({total} total actions)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CREATE ACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-900">Record Administrative Action</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Type</label>
                <select
                  value={formData.action_type}
                  onChange={(e) =>
                    setFormData({ ...formData, action_type: e.target.value as GovernmentActionType })
                  }
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="review_followup">Review Follow-up</option>
                  <option value="clarification_followup">Clarification Follow-up</option>
                  <option value="monitoring_required">Monitoring Required</option>
                  <option value="policy_attention">Policy Attention</option>
                  <option value="coordination_required">Coordination Required</option>
                  <option value="deployment_followup">Deployment Follow-up</option>
                  <option value="pilot_followup">Pilot Follow-up</option>
                  <option value="other">Other Action</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Entity</label>
                  <select
                    value={formData.target_type}
                    onChange={(e) =>
                      setFormData({ ...formData, target_type: e.target.value as GovernmentActionTargetType })
                    }
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="project">University Project</option>
                    <option value="challenge">Citizen Challenge</option>
                    <option value="partnership">Industry Collaboration</option>
                    <option value="pilot">Field Pilot</option>
                    <option value="deployment">Deployment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Target Record ID</label>
                  <input
                    type="text"
                    required
                    placeholder="24-char ObjectId"
                    value={formData.target_id}
                    onChange={(e) => setFormData({ ...formData, target_id: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 font-mono focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Recommend fast-track deployment authorization"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description & Notes</label>
                <textarea
                  rows={3}
                  required
                  placeholder="State the administrative rationale, guidance, or budget allocation details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value as GovernmentActionPriority })
                    }
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save Action"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
