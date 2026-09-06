import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Layers,
  ArrowRight,
  Users,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Edit3,
  Trash2,
  Eye,
  X,
  Search,
  Briefcase,
  GraduationCap,
  Target,
  Clock,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { UniversityProject, UniversityTeam, ProjectStatus } from "../../types";
import { universityService } from "../../services/universityService";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  planning: {
    label: "Planning",
    bg: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
  },
  research: {
    label: "Research & Analysis",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  solution_proposed: {
    label: "Solution Proposed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  prototype: {
    label: "Prototyping",
    bg: "bg-purple-50",
    text: "text-purple-700",
    border: "border-purple-200",
  },
  pilot: {
    label: "Field Pilot",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
  },
  deployment: {
    label: "Deployment",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  completed: {
    label: "Completed",
    bg: "bg-green-100",
    text: "text-green-800",
    border: "border-green-300",
  },
  archived: {
    label: "Archived",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
  },
};

const ALL_STATUS_KEYS: ProjectStatus[] = [
  "planning",
  "research",
  "solution_proposed",
  "prototype",
  "pilot",
  "deployment",
  "completed",
  "archived",
];

export default function UniversityProjects() {
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected project for edit/view/delete
  const [activeProject, setActiveProject] = useState<UniversityProject | null>(null);

  // Form state for creation
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>("planning");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<ProjectStatus>("planning");
  const [editStartDate, setEditStartDate] = useState("");
  const [editTargetDate, setEditTargetDate] = useState("");
  const [updating, setUpdating] = useState(false);

  // Toast feedback
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function triggerFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => {
      setFeedback(null);
    }, 4500);
  }

  // Load projects and teams
  async function loadData() {
    setLoading(true);
    try {
      const [projData, teamData] = await Promise.all([
        universityService.getProjectList(),
        universityService.getTeamList(),
      ]);
      setProjects(projData || []);
      setTeams(teamData || []);
    } catch (err: any) {
      triggerFeedback(
        "error",
        err?.response?.data?.detail || "Failed to load institutional projects."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered teams eligible for new projects (non-archived)
  const eligibleTeams = useMemo(() => {
    return teams.filter((t) => t.status !== "archived");
  }, [teams]);

  // Selected team object in creation modal
  const selectedTeam = useMemo(() => {
    return eligibleTeams.find((t) => t.id === selectedTeamId) || null;
  }, [eligibleTeams, selectedTeamId]);

  // Open Create Modal
  function handleOpenCreate() {
    setSelectedTeamId(eligibleTeams.length > 0 ? eligibleTeams[0].id : "");
    setProjectName("");
    setProjectDescription("");
    setProjectStatus("planning");
    setStartDate("");
    setTargetDate("");
    setShowCreateModal(true);
  }

  // Submit Create Project
  async function handleCreateSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTeam) {
      triggerFeedback("error", "Please select an eligible innovation team.");
      return;
    }
    if (!projectName.trim()) {
      triggerFeedback("error", "Project name is required.");
      return;
    }

    setSubmitting(true);
    try {
      await universityService.createProject({
        name: projectName.trim(),
        challenge_id: selectedTeam.challenge_id,
        team_id: selectedTeam.id,
        description: projectDescription.trim() || undefined,
        status: projectStatus,
        start_date: startDate || undefined,
        target_date: targetDate || undefined,
      });

      triggerFeedback("success", `Project "${projectName.trim()}" initiated successfully.`);
      setShowCreateModal(false);
      await loadData();
    } catch (err: any) {
      triggerFeedback(
        "error",
        err?.response?.data?.detail || "Failed to create project workspace."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Open Edit Modal
  function handleOpenEdit(proj: UniversityProject) {
    setActiveProject(proj);
    setEditName(proj.name);
    setEditDescription(proj.description || "");
    setEditStatus((proj.status as ProjectStatus) || "planning");
    setEditStartDate(proj.start_date || "");
    setEditTargetDate(proj.target_date || "");
    setShowEditModal(true);
  }

  // Submit Edit
  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeProject) return;
    if (!editName.trim()) {
      triggerFeedback("error", "Project name cannot be empty.");
      return;
    }

    setUpdating(true);
    try {
      await universityService.updateProject(activeProject.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
        start_date: editStartDate || undefined,
        target_date: editTargetDate || undefined,
      });

      triggerFeedback("success", "Project workspace updated successfully.");
      setShowEditModal(false);
      await loadData();
    } catch (err: any) {
      triggerFeedback(
        "error",
        err?.response?.data?.detail || "Failed to update project."
      );
    } finally {
      setUpdating(false);
    }
  }

  // Open View Modal
  function handleOpenView(proj: UniversityProject) {
    setActiveProject(proj);
    setShowViewModal(true);
  }

  // Open Delete Modal
  function handleOpenDelete(proj: UniversityProject) {
    setActiveProject(proj);
    setShowDeleteModal(true);
  }

  // Confirm Delete
  async function handleConfirmDelete() {
    if (!activeProject) return;
    setSubmitting(true);
    try {
      await universityService.deleteProject(activeProject.id);
      triggerFeedback("success", `Project "${activeProject.name}" has been deleted.`);
      setShowDeleteModal(false);
      await loadData();
    } catch (err: any) {
      triggerFeedback(
        "error",
        err?.response?.data?.detail || "Failed to delete project."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Metrics computation
  const metrics = useMemo(() => {
    const total = projects.length;
    const activePipelines = projects.filter(
      (p) => p.status !== "completed" && p.status !== "archived"
    ).length;
    const pilotsAndDeployments = projects.filter(
      (p) => p.status === "pilot" || p.status === "deployment"
    ).length;
    const completed = projects.filter((p) => p.status === "completed").length;

    // Unique faculty and students
    const facultySet = new Set<string>();
    const studentSet = new Set<string>();
    projects.forEach((p) => {
      p.faculty_members?.forEach((f) => facultySet.add(f.id));
      p.student_members?.forEach((s) => studentSet.add(s.id));
    });

    return {
      total,
      activePipelines,
      pilotsAndDeployments,
      completed,
      facultyCount: facultySet.size,
      studentCount: studentSet.size,
    };
  }, [projects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesStatus =
        statusFilter === "all" || p.status === statusFilter;
      const term = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !term ||
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.challenge_title && p.challenge_title.toLowerCase().includes(term)) ||
        (p.team_name && p.team_name.toLowerCase().includes(term));
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Institutional Solutions Pipeline"
        badgeColor="#7C3AED"
        title="University Project Workspaces"
        subtitle="Multidisciplinary research and prototyping initiatives tackling adopted civic challenges."
      >
        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs"
        >
          <PlusCircle size={15} /> Create Project
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Feedback notification toast */}
        {feedback && (
          <div
            className={`mb-6 flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Institutional Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
              Total Projects
            </span>
            <span className="text-2xl font-black text-[#071A33]">
              {metrics.total}
            </span>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block mb-1">
              Active Pipelines
            </span>
            <span className="text-2xl font-black text-purple-700">
              {metrics.activePipelines}
            </span>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider block mb-1">
              Pilots & Deploy
            </span>
            <span className="text-2xl font-black text-orange-600">
              {metrics.pilotsAndDeployments}
            </span>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
              Completed
            </span>
            <span className="text-2xl font-black text-emerald-600">
              {metrics.completed}
            </span>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Faculty Mentors
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {metrics.facultyCount}
            </span>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Student Leads
            </span>
            <span className="text-2xl font-black text-blue-600">
              {metrics.studentCount}
            </span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-8 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project, challenge, or team..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-gray-900 placeholder:text-gray-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0">
              <SlidersHorizontal size={13} /> Status:
            </span>
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === "all"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-slate-100 text-gray-600 hover:bg-slate-200"
              }`}
            >
              All ({projects.length})
            </button>
            {ALL_STATUS_KEYS.map((key) => {
              const count = projects.filter((p) => p.status === key).length;
              const cfg = STATUS_CONFIG[key];
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    statusFilter === key
                      ? "bg-purple-600 text-white shadow-xs"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                  }`}
                >
                  {cfg.label} {count > 0 ? `(${count})` : ""}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <LoadingState message="Loading university project workspaces..." />
        ) : projects.length === 0 ? (
          /* Empty state: No projects in database */
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-inner">
              <Layers size={28} />
            </div>
            <h3 className="text-lg font-extrabold text-[#071A33]">
              No active university projects yet.
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When your institution forms multidisciplinary teams to address adopted civic challenges, initiate dedicated project workspaces here to coordinate research sprints, build prototypes, and deploy field pilots.
            </p>

            {eligibleTeams.length === 0 ? (
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/university/teams"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Users size={14} /> Form an Innovation Team First
                </Link>
                <Link
                  to="/university/challenges"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Browse Challenges <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <div className="pt-3">
                <button
                  onClick={handleOpenCreate}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <PlusCircle size={15} /> Create Your First Project
                </button>
              </div>
            )}
          </div>
        ) : filteredProjects.length === 0 ? (
          /* Filtered empty state */
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <Search size={32} className="text-gray-300 mx-auto" />
            <h4 className="text-sm font-bold text-[#071A33]">No projects found</h4>
            <p className="text-xs text-gray-500">
              No project workspaces match your active search and status filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-700 underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          /* Grid of Project Workspaces */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProjects.map((proj) => {
              const statusCfg =
                STATUS_CONFIG[proj.status] || STATUS_CONFIG.planning;
              return (
                <div
                  key={proj.id}
                  className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Category and Status Badge */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                        {proj.challenge_category || "Civic Innovation"}
                      </span>
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Project Title & Description */}
                    <div>
                      <h3 className="font-extrabold text-lg text-[#071A33] group-hover:text-purple-700 transition-colors line-clamp-1">
                        {proj.name}
                      </h3>
                      {proj.description ? (
                        <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-400 italic mt-1.5">
                          No project scope notes provided.
                        </p>
                      )}
                    </div>

                    {/* Associated Challenge Reference Box */}
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 space-y-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        <Target size={12} className="text-purple-600" />
                        Target Challenge
                      </div>
                      <div className="text-xs font-bold text-gray-800 line-clamp-1">
                        {proj.challenge_title}
                      </div>
                    </div>

                    {/* Team & Members Box */}
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                          <Users size={12} className="text-indigo-600" />
                          Assigned Innovation Team
                        </div>
                        <span className="text-xs font-extrabold text-indigo-700">
                          {proj.team_name}
                        </span>
                      </div>

                      {/* Mentors list */}
                      {proj.faculty_members && proj.faculty_members.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Briefcase size={12} className="text-gray-400 shrink-0" />
                          <span className="text-gray-400 font-medium">Faculty:</span>
                          <span className="font-bold text-gray-800 line-clamp-1">
                            {proj.faculty_members.map((f) => f.name).join(", ")}
                          </span>
                        </div>
                      )}

                      {/* Students list */}
                      {proj.student_members && proj.student_members.length > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <GraduationCap size={12} className="text-gray-400 shrink-0" />
                          <span className="text-gray-400 font-medium">Researchers:</span>
                          <span className="font-bold text-gray-800 line-clamp-1">
                            {proj.student_members.map((s) => s.name).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Milestone Progress Bar */}
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-700 flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-purple-600" />
                          Milestone Completion
                        </span>
                        <span className="font-black text-purple-700">
                          {proj.milestone_progress ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, proj.milestone_progress ?? 0))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-gray-400 font-medium pt-0.5">
                        <span>Phase: <strong className="text-gray-700 uppercase">{proj.status.replace("_", " ")}</strong></span>
                        <span>{proj.completed_milestones_count ?? 0} of {proj.milestones_count ?? 0} Milestones</span>
                      </div>
                    </div>

                    {/* Timeline dates */}
                    {(proj.start_date || proj.target_date) && (
                      <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                        {proj.start_date && (
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400" />
                            <span>Started: <strong className="text-gray-700">{proj.start_date}</strong></span>
                          </div>
                        )}
                        {proj.target_date && (
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400" />
                            <span>Target: <strong className="text-gray-700">{proj.target_date}</strong></span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-5 mt-5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <Link
                      to={`/university/projects/${proj.id}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      Open Workspace <ArrowRight size={13} />
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenView(proj)}
                        className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                        title="View Summary Dossier"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(proj)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Edit Project Details"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleOpenDelete(proj)}
                        className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        title="Delete Project"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================================================================= */}
        {/* CREATE PROJECT MODAL */}
        {/* ================================================================= */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#071A33]">
                    Create Project Workspace
                  </h3>
                  <p className="text-xs text-gray-500">
                    Initiate multidisciplinary R&D by assigning an eligible innovation team.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              {eligibleTeams.length === 0 ? (
                <div className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                    <Users size={22} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">
                    No Eligible Innovation Teams Found
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                    Projects require an established innovation team with at least one faculty mentor and one student researcher linked to an adopted challenge.
                  </p>
                  <div className="pt-2">
                    <Link
                      to="/university/teams"
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      <PlusCircle size={14} /> Go to University Teams
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateSubmit} className="p-6 space-y-5">
                  {/* Select Team */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Assign Innovation Team <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      required
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      {eligibleTeams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} (Challenge: {t.challenge_title || "Civic Challenge"})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Team & Challenge auto-preview banner */}
                  {selectedTeam && (
                    <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-extrabold text-purple-900 flex items-center gap-1.5">
                          <Target size={13} className="text-purple-600" />
                          Target Challenge:
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-200 text-purple-800 uppercase">
                          {selectedTeam.challenge_category || "Civic"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-purple-950">
                        {selectedTeam.challenge_title}
                      </p>

                      <div className="pt-2 border-t border-purple-100/80 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-purple-800">
                        <div>
                          Mentors: <strong>{selectedTeam.faculty_members?.length || 0}</strong>
                        </div>
                        <div>
                          Researchers: <strong>{selectedTeam.student_members?.length || 0}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Project Name */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Project Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., AI Urban Drainage Sensor Pilot"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Scope & Objectives
                    </label>
                    <textarea
                      rows={3}
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      placeholder="Describe research methodologies, prototyping deliverables, and expected municipal pilot outcomes..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                    />
                  </div>

                  {/* Status & Dates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Initial Phase
                      </label>
                      <select
                        value={projectStatus}
                        onChange={(e) => setProjectStatus(e.target.value as ProjectStatus)}
                        className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      >
                        {ALL_STATUS_KEYS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1.5">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-xs"
                    >
                      {submitting ? "Initiating..." : "Initiate Project"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* EDIT PROJECT MODAL */}
        {/* ================================================================= */}
        {showEditModal && activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-[#071A33]">
                    Edit Project Workspace
                  </h3>
                  <p className="text-xs text-gray-500">
                    Update pipeline milestone phase, objectives, or target dates.
                  </p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Project Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Scope & Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Pipeline Phase
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as ProjectStatus)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      {ALL_STATUS_KEYS.map((s) => (
                        <option key={s} value={s}>
                          {STATUS_CONFIG[s].label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={editStartDate}
                      onChange={(e) => setEditStartDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">
                      Target Date
                    </label>
                    <input
                      type="date"
                      value={editTargetDate}
                      onChange={(e) => setEditTargetDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Readonly info */}
                <div className="p-3 bg-slate-50 border border-gray-100 rounded-xl space-y-1 text-xs text-gray-600">
                  <div>
                    Target Challenge: <strong>{activeProject.challenge_title}</strong>
                  </div>
                  <div>
                    Assigned Team: <strong>{activeProject.team_name}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 transition-all shadow-xs"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW PROJECT DETAILS MODAL */}
        {/* ================================================================= */}
        {showViewModal && activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                    <Layers size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#071A33]">
                      {activeProject.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] font-bold text-gray-400">
                        Project ID: {activeProject.id.slice(-6)}
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                          STATUS_CONFIG[activeProject.status]?.bg || "bg-slate-50"
                        } ${
                          STATUS_CONFIG[activeProject.status]?.text || "text-slate-700"
                        } ${
                          STATUS_CONFIG[activeProject.status]?.border || "border-slate-200"
                        }`}
                      >
                        {STATUS_CONFIG[activeProject.status]?.label || activeProject.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Scope & Objectives
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 border border-gray-100 rounded-2xl p-4">
                    {activeProject.description || "No specific scope notes provided for this project."}
                  </p>
                </div>

                {/* Challenge Details Card */}
                <div className="border border-purple-100 bg-purple-50/40 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Target size={14} className="text-purple-600" /> Target Challenge Dossier
                    </span>
                    <Link
                      to={`/university/challenges/${activeProject.challenge_id}`}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                    >
                      Open Challenge <ExternalLink size={12} />
                    </Link>
                  </div>
                  <h5 className="text-sm font-extrabold text-[#071A33]">
                    {activeProject.challenge_title}
                  </h5>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800">
                      Category: {activeProject.challenge_category}
                    </span>
                  </div>
                </div>

                {/* Multidisciplinary Team Card */}
                <div className="border border-gray-200 rounded-2xl p-4 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <span className="text-xs font-extrabold text-[#071A33] flex items-center gap-1.5">
                      <Users size={14} className="text-indigo-600" />
                      Assigned Team: {activeProject.team_name}
                    </span>
                    <Link
                      to="/university/teams"
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                      Team Details <ChevronRight size={13} />
                    </Link>
                  </div>

                  {/* Faculty Mentors */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Faculty Mentors ({activeProject.faculty_members?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProject.faculty_members?.map((f) => (
                        <div
                          key={f.id}
                          className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-xs"
                        >
                          <div className="font-bold text-gray-900">{f.name}</div>
                          <div className="text-[11px] text-gray-500">
                            {f.designation || "Faculty Lead"} • {f.department || "Academic Dept"}
                          </div>
                          {f.email && (
                            <div className="text-[11px] text-indigo-600 font-mono mt-1">
                              {f.email}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Student Researchers */}
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Student Researchers ({activeProject.student_members?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeProject.student_members?.map((s) => (
                        <div
                          key={s.id}
                          className="bg-slate-50 border border-gray-100 rounded-xl p-3 text-xs"
                        >
                          <div className="font-bold text-gray-900">{s.name}</div>
                          <div className="text-[11px] text-gray-500">
                            {s.degree || "Researcher"} • {s.department || "Student"}
                          </div>
                          {s.skills && s.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {s.skills.slice(0, 3).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 font-semibold"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dates & Timeline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 border border-gray-100 rounded-2xl p-4">
                  <div>
                    <span className="text-gray-400 font-medium block">Start Date:</span>
                    <strong className="text-gray-800">{activeProject.start_date || "Not set"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Target Date:</span>
                    <strong className="text-gray-800">{activeProject.target_date || "Not set"}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Created:</span>
                    <strong className="text-gray-800">
                      {new Date(activeProject.created_at).toLocaleDateString()}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 font-medium block">Last Updated:</span>
                    <strong className="text-gray-800">
                      {new Date(activeProject.updated_at).toLocaleDateString()}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* DELETE PROJECT MODAL */}
        {/* ================================================================= */}
        {showDeleteModal && activeProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-md p-6 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                <Trash2 size={22} />
              </div>
              <h3 className="text-base font-extrabold text-[#071A33]">
                Delete Project Workspace?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to delete <strong>"{activeProject.name}"</strong>? This will permanently remove the project workspace. The underlying challenge and innovation team records will remain preserved.
              </p>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 transition-all shadow-xs"
                >
                  {submitting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
