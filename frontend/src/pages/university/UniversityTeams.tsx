import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import {
  Users,
  Plus,
  ArrowRight,
  GraduationCap,
  Brain,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Layers,
  Calendar,
  ChevronRight,
  Mail,
  FolderGit2,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import {
  UniversityTeam,
  TeamCreateInput,
  TeamUpdateInput,
  UniversityInterest,
  FacultyMember,
  StudentMember,
  UniversityProfile,
  UniversityProject,
} from "../../types";

interface TeamFormData {
  name: string;
  challenge_id: string;
  faculty_member_ids: string[];
  student_member_ids: string[];
  description: string;
  status: string;
}

const INITIAL_FORM: TeamFormData = {
  name: "",
  challenge_id: "",
  faculty_member_ids: [],
  student_member_ids: [],
  description: "",
  status: "active",
};

export default function UniversityTeams() {
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [interests, setInterests] = useState<UniversityInterest[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [studentList, setStudentList] = useState<StudentMember[]>([]);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [projects, setProjects] = useState<UniversityProject[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedChallengeId, setSelectedChallengeId] = useState("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<UniversityTeam | null>(null);
  const [viewingTeam, setViewingTeam] = useState<UniversityTeam | null>(null);
  const [deletingTeam, setDeletingTeam] = useState<UniversityTeam | null>(null);

  // Form state
  const [formData, setFormData] = useState<TeamFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load all required institutional data
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [teamsData, interestsData, facultyData, studentsData, profileData, projectsData] = await Promise.all([
        universityService.getTeamList(),
        universityService.getUniversityInterests(),
        universityService.getFacultyList(),
        universityService.getStudentList(),
        universityService.getMyProfile(),
        universityService.getProjectList().catch(() => []),
      ]);
      setTeams(teamsData);
      setInterests(interestsData);
      setFacultyList(facultyData);
      setStudentList(studentsData);
      setProfile(profileData);
      setProjects(projectsData || []);
    } catch (err: any) {
      console.error("Failed to load university teams and rosters:", err);
      setError(err?.response?.data?.detail || "Failed to load innovation teams. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const teamProjectMap = useMemo(() => {
    const map = new Map<string, UniversityProject>();
    projects.forEach((p) => {
      if (p.team_id) {
        map.set(p.team_id, p);
      }
    });
    return map;
  }, [projects]);

  // Dismiss feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Unique challenges derived from teams for filtering
  const challengeFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach((t) => {
      if (t.challenge_id) {
        map.set(t.challenge_id, t.challenge_title || "Civic Challenge");
      }
    });
    return Array.from(map.entries());
  }, [teams]);

  // Filtered teams list
  const filteredTeams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return teams.filter((t) => {
      // Status filter
      if (selectedStatus !== "all") {
        if ((t.status || "").toLowerCase() !== selectedStatus.toLowerCase()) {
          return false;
        }
      }

      // Challenge filter
      if (selectedChallengeId !== "all") {
        if (t.challenge_id !== selectedChallengeId) {
          return false;
        }
      }

      // Search query
      if (q) {
        const inName = t.name.toLowerCase().includes(q);
        const inDesc = (t.description || "").toLowerCase().includes(q);
        const inChallenge = (t.challenge_title || "").toLowerCase().includes(q);
        const inFaculty = (t.faculty_members || []).some(
          (f) => f.name.toLowerCase().includes(q) || (f.department || "").toLowerCase().includes(q)
        );
        const inStudents = (t.student_members || []).some(
          (s) => s.name.toLowerCase().includes(q) || (s.department || "").toLowerCase().includes(q)
        );
        return inName || inDesc || inChallenge || inFaculty || inStudents;
      }

      return true;
    });
  }, [teams, searchQuery, selectedStatus, selectedChallengeId]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setFormData({
      name: "",
      challenge_id: interests.length > 0 ? interests[0].challenge_id : "",
      faculty_member_ids: [],
      student_member_ids: [],
      description: "",
      status: "active",
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (t: UniversityTeam) => {
    setEditingTeam(t);
    setFormData({
      name: t.name,
      challenge_id: t.challenge_id,
      faculty_member_ids: [...t.faculty_member_ids],
      student_member_ids: [...t.student_member_ids],
      description: t.description || "",
      status: t.status || "active",
    });
    setFormError(null);
  };

  // Toggle selection for faculty
  const toggleFacultySelection = (fid: string) => {
    setFormData((prev) => {
      const exists = prev.faculty_member_ids.includes(fid);
      return {
        ...prev,
        faculty_member_ids: exists
          ? prev.faculty_member_ids.filter((id) => id !== fid)
          : [...prev.faculty_member_ids, fid],
      };
    });
  };

  // Toggle selection for student
  const toggleStudentSelection = (sid: string) => {
    setFormData((prev) => {
      const exists = prev.student_member_ids.includes(sid);
      return {
        ...prev,
        student_member_ids: exists
          ? prev.student_member_ids.filter((id) => id !== sid)
          : [...prev.student_member_ids, sid],
      };
    });
  };

  // Submit Create Team
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setFormError("Team name is required.");
      return;
    }
    if (!formData.challenge_id) {
      setFormError("You must select an adopted civic challenge.");
      return;
    }
    if (formData.faculty_member_ids.length === 0) {
      setFormError("Please select at least one faculty mentor.");
      return;
    }
    if (formData.student_member_ids.length === 0) {
      setFormError("Please select at least one student researcher.");
      return;
    }

    const payload: TeamCreateInput = {
      name: cleanName,
      challenge_id: formData.challenge_id,
      faculty_member_ids: formData.faculty_member_ids,
      student_member_ids: formData.student_member_ids,
      description: formData.description.trim() || undefined,
      status: formData.status,
    };

    setSubmitting(true);
    try {
      const created = await universityService.createTeam(payload);
      setTeams((prev) => [created, ...prev]);
      setFeedback({
        type: "success",
        message: `Innovation team "${created.name}" formed successfully.`,
      });
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || "Failed to form team. Please check requirements.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Team
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setFormError(null);

    const cleanName = formData.name.trim();
    if (!cleanName) {
      setFormError("Team name is required.");
      return;
    }
    if (formData.faculty_member_ids.length === 0) {
      setFormError("Please select at least one faculty mentor.");
      return;
    }
    if (formData.student_member_ids.length === 0) {
      setFormError("Please select at least one student researcher.");
      return;
    }

    const payload: TeamUpdateInput = {
      name: cleanName,
      challenge_id: formData.challenge_id || undefined,
      faculty_member_ids: formData.faculty_member_ids,
      student_member_ids: formData.student_member_ids,
      description: formData.description.trim() || undefined,
      status: formData.status,
    };

    setSubmitting(true);
    try {
      const updated = await universityService.updateTeam(editingTeam.id, payload);
      setTeams((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
      );
      setFeedback({
        type: "success",
        message: `Team "${updated.name}" updated successfully.`,
      });
      setEditingTeam(null);
    } catch (err: any) {
      setFormError(err?.response?.data?.detail || "Failed to update team details.");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Team
  const handleConfirmDelete = async () => {
    if (!deletingTeam) return;
    setSubmitting(true);
    try {
      await universityService.deleteTeam(deletingTeam.id);
      setTeams((prev) => prev.filter((t) => t.id !== deletingTeam.id));
      setFeedback({
        type: "success",
        message: `Team "${deletingTeam.name}" has been removed.`,
      });
      setDeletingTeam(null);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err?.response?.data?.detail || "Failed to delete team.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedChallengeId("all");
  };

  const hasActiveFilters =
    searchQuery !== "" || selectedStatus !== "all" || selectedChallengeId !== "all";

  // Compute real metrics
  const activeTeamsCount = teams.filter((t) => t.status === "active").length;
  const deployedFacultyIds = new Set<string>();
  const engagedStudentIds = new Set<string>();
  teams.forEach((t) => {
    (t.faculty_member_ids || []).forEach((id) => deployedFacultyIds.add(id));
    (t.student_member_ids || []).forEach((id) => engagedStudentIds.add(id));
  });

  const getStatusBadge = (statusStr: string) => {
    const s = (statusStr || "active").toLowerCase();
    switch (s) {
      case "active":
        return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Active Project" };
      case "forming":
        return { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", label: "Forming Cohort" };
      case "completed":
        return { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300", label: "Completed" };
      case "archived":
        return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Archived" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300", label: statusStr };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardHeader
        badge="Academic Collaboration"
        badgeColor="#8B5CF6"
        title="Faculty & Student Innovation Teams"
        subtitle="Form multidisciplinary teams connecting faculty mentors and student researchers to adopted civic challenges."
      >
        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Form Innovation Team
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Feedback Toast */}
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
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Real Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Total Teams</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071A33]">{teams.length}</span>
              <span className="text-[11px] text-purple-600 font-semibold">Formed Cohorts</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Active Projects</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{activeTeamsCount}</span>
              <span className="text-[11px] text-gray-400">Underway</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Faculty Deployed</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071A33]">{deployedFacultyIds.size}</span>
              <span className="text-[11px] text-gray-400">Unique Mentors</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Students Engaged</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-600">{engagedStudentIds.size}</span>
              <span className="text-[11px] text-gray-400">Innovators</span>
            </div>
          </div>
        </div>

        {/* Toolbar: Search, Filters & Counters */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams by name, challenge, mentor, or student..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Projects</option>
              <option value="forming">Forming Cohorts</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>

            {/* Challenge Filter */}
            {challengeFilterOptions.length > 0 && (
              <select
                value={selectedChallengeId}
                onChange={(e) => setSelectedChallengeId(e.target.value)}
                className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">All Challenges</option>
                {challengeFilterOptions.map(([cid, title]) => (
                  <option key={cid} value={cid}>
                    {title}
                  </option>
                ))}
              </select>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shrink-0">
              {filteredTeams.length} of {teams.length} Teams
            </span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState message="Loading university innovation teams..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-[#071A33]">Unable to load innovation teams</h4>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#071A33]">No innovation teams formed yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
              Connect real faculty mentors from your institutional roster with student researchers to form focused project cohorts working on adopted civic challenges.
            </p>

            {interests.length === 0 ? (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-bold">
                  <AlertCircle size={15} /> First adopt a challenge
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Before forming an innovation team, your university must express genuine interest in at least one AI-matched challenge.
                </p>
                <Link
                  to="/university/challenges"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:underline pt-1"
                >
                  Browse Matched Challenges <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Plus size={15} /> Form Your First Innovation Team
                </button>
              </div>
            )}
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <p className="text-xs text-gray-500">
              No teams match your filter criteria: <span className="font-semibold text-gray-700">"{searchQuery || selectedStatus}"</span>
            </p>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 underline cursor-pointer"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => {
              const statusBadge = getStatusBadge(team.status);

              return (
                <div
                  key={team.id}
                  className="bg-white border border-gray-200/90 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Title & Status Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-[#071A33] leading-tight line-clamp-1">
                          {team.name}
                        </h3>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Formed: {team.created_at ? new Date(team.created_at).toLocaleDateString() : "Recently"}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Challenge Connection Banner */}
                    <div className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">
                          Adopted Civic Challenge
                        </span>
                        {team.challenge_category && (
                          <span className="text-[10px] bg-white text-gray-700 px-2 py-0.5 rounded border border-purple-100 font-semibold">
                            {team.challenge_category}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-[#071A33] line-clamp-1">
                        {team.challenge_title || "Civic Challenge"}
                      </h4>
                      <Link
                        to={`/university/challenges/${team.challenge_id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 pt-0.5"
                      >
                        View Problem Dossier <ArrowRight size={11} />
                      </Link>
                    </div>

                    {/* Linked Project Banner */}
                    {(() => {
                      const linkedProject = teamProjectMap.get(team.id);
                      if (linkedProject) {
                        return (
                          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                                <FolderGit2 size={12} /> Active Project Workspace
                              </span>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 uppercase">
                                {linkedProject.status.replace("_", " ")}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-[#071A33] line-clamp-1">
                              {linkedProject.name}
                            </h4>
                            <Link
                              to={`/university/projects/${linkedProject.id}`}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 pt-0.5"
                            >
                              Open Project Workspace <ArrowRight size={11} />
                            </Link>
                          </div>
                        );
                      }
                      return (
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-dashed border-gray-200 flex items-center justify-between text-[11px]">
                          <span className="text-gray-500">No project workspace active</span>
                          <Link
                            to="/university/projects"
                            className="font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                          >
                            Launch Project <ArrowRight size={11} />
                          </Link>
                        </div>
                      );
                    })()}

                    {/* Description */}
                    {team.description && (
                      <p className="text-xs text-gray-600 line-clamp-2 italic">
                        "{team.description}"
                      </p>
                    )}

                    {/* Faculty Mentors Section */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Faculty Mentors ({team.faculty_members.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {team.faculty_members.map((f) => (
                          <span
                            key={f.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-gray-800 px-2.5 py-1 rounded-xl font-medium border border-gray-200/60"
                            title={`${f.designation || "Faculty Mentor"} • ${f.department || ""}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Student Researchers Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Student Innovators ({team.student_members.length})
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {team.student_members.map((s) => (
                          <span
                            key={s.id}
                            className="inline-flex items-center gap-1 text-[11px] bg-blue-50 text-blue-800 px-2.5 py-1 rounded-xl font-medium border border-blue-100"
                            title={`${s.degree || "Student"} • ${s.department || ""}`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => setViewingTeam(team)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> View Roster
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(team)}
                        className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Team"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingTeam(team)}
                        className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Team"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create Innovation Team */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">Form Innovation Team</h3>
                  <p className="text-xs text-gray-500">Connect real faculty mentors and student researchers to an adopted challenge</p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Team / Cohort Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Clean Water IoT Innovation Cohort"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                {/* Adopted Challenge Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Adopted Civic Challenge <span className="text-rose-500">*</span>
                  </label>
                  {interests.length === 0 ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                      No adopted challenges found. Your institution must express interest in a challenge first.
                    </div>
                  ) : (
                    <select
                      required
                      value={formData.challenge_id}
                      onChange={(e) => setFormData({ ...formData, challenge_id: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="" disabled>Select an adopted challenge...</option>
                      {interests.map((it) => (
                        <option key={it.challenge_id} value={it.challenge_id}>
                          {it.challenge_title || "Civic Challenge"} {it.challenge_category ? `(${it.challenge_category})` : ""}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Initial Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="active">Active Project</option>
                      <option value="forming">Forming Cohort</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief goals or research methodology"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                {/* Faculty Mentors Multi-Select */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Faculty Mentors <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-purple-600">
                      {formData.faculty_member_ids.length} selected
                    </span>
                  </div>

                  {facultyList.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
                      No faculty registered yet. Please configure faculty in{" "}
                      <Link to="/university/faculty" className="text-purple-600 font-bold underline">
                        Faculty Management
                      </Link>.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50">
                      {facultyList.map((f) => {
                        const isChecked = formData.faculty_member_ids.includes(f.id);
                        return (
                          <label
                            key={f.id}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-purple-50 border border-purple-200 font-bold text-purple-900"
                                : "bg-white border border-gray-100 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleFacultySelection(f.id)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span>{f.name}</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-normal">
                              {f.designation || f.department || "Mentor"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Student Researchers Multi-Select */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">
                      Student Researchers <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-semibold text-purple-600">
                      {formData.student_member_ids.length} selected
                    </span>
                  </div>

                  {studentList.length === 0 ? (
                    <div className="p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-500 text-center">
                      No students enrolled yet. Please register students in{" "}
                      <Link to="/university/students" className="text-purple-600 font-bold underline">
                        Student Management
                      </Link>.
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50">
                      {studentList.map((s) => {
                        const isChecked = formData.student_member_ids.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                              isChecked
                                ? "bg-blue-50 border border-blue-200 font-bold text-blue-900"
                                : "bg-white border border-gray-100 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleStudentSelection(s.id)}
                                className="rounded text-purple-600 focus:ring-purple-500"
                              />
                              <span>{s.name}</span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-normal">
                              {s.degree || s.department || "Student"}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || interests.length === 0}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Forming Team..." : "Form Innovation Team"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Innovation Team */}
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">Edit Team & Roster</h3>
                  <p className="text-xs text-gray-500">Update team identity, status, or member composition</p>
                </div>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="active">Active Project</option>
                      <option value="forming">Forming Cohort</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                {/* Faculty Mentors Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">Faculty Mentors</label>
                    <span className="text-[11px] font-semibold text-purple-600">
                      {formData.faculty_member_ids.length} selected
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50">
                    {facultyList.map((f) => {
                      const isChecked = formData.faculty_member_ids.includes(f.id);
                      return (
                        <label
                          key={f.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-purple-50 border border-purple-200 font-bold text-purple-900"
                              : "bg-white border border-gray-100 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleFacultySelection(f.id)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{f.name}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-normal">
                            {f.designation || f.department || "Mentor"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Student Researchers Selection */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-700">Student Researchers</label>
                    <span className="text-[11px] font-semibold text-purple-600">
                      {formData.student_member_ids.length} selected
                    </span>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-2xl p-2.5 space-y-1.5 bg-slate-50/50">
                    {studentList.map((s) => {
                      const isChecked = formData.student_member_ids.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                            isChecked
                              ? "bg-blue-50 border border-blue-200 font-bold text-blue-900"
                              : "bg-white border border-gray-100 hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleStudentSelection(s.id)}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{s.name}</span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-normal">
                            {s.degree || s.department || "Student"}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: View Full Team Details & Roster */}
        {viewingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-1.5 inline-block ${
                      getStatusBadge(viewingTeam.status).bg
                    } ${getStatusBadge(viewingTeam.status).text} ${getStatusBadge(viewingTeam.status).border}`}
                  >
                    {getStatusBadge(viewingTeam.status).label}
                  </span>
                  <h3 className="text-lg font-bold text-[#071A33]">{viewingTeam.name}</h3>
                </div>
                <button
                  onClick={() => setViewingTeam(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Challenge Overview */}
              <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1.5">
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                  Assigned Civic Challenge
                </span>
                <h4 className="text-sm font-bold text-[#071A33]">{viewingTeam.challenge_title || "Civic Challenge"}</h4>
                <Link
                  to={`/university/challenges/${viewingTeam.challenge_id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 hover:underline pt-1"
                >
                  Open Problem Statement & Field Dossier <ArrowRight size={13} />
                </Link>
              </div>

              {/* Linked Project in Modal */}
              {(() => {
                const linkedProj = teamProjectMap.get(viewingTeam.id);
                if (linkedProj) {
                  return (
                    <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1">
                          <FolderGit2 size={13} /> Linked Project Workspace
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 uppercase">
                          {linkedProj.status.replace("_", " ")}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#071A33]">{linkedProj.name}</h4>
                      {linkedProj.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{linkedProj.description}</p>
                      )}
                      <div className="pt-1">
                        <Link
                          to={`/university/projects/${linkedProj.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs"
                        >
                          Enter Project Workspace <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  );
                }
                return (
                  <div className="p-3 bg-slate-50 rounded-2xl border border-dashed border-gray-200 flex items-center justify-between">
                    <span className="text-xs text-gray-500">No project workspace created for this team yet</span>
                    <Link
                      to="/university/projects"
                      className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                    >
                      Create Project <ArrowRight size={12} />
                    </Link>
                  </div>
                );
              })()}

              {viewingTeam.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description</span>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-gray-100">
                    {viewingTeam.description}
                  </p>
                </div>
              )}

              {/* Faculty Mentors Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#071A33] block">
                  Faculty Mentors ({viewingTeam.faculty_members.length})
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {viewingTeam.faculty_members.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-[#071A33]">{f.name}</h5>
                        <p className="text-[11px] text-purple-600 font-semibold">{f.designation || "Faculty Mentor"}</p>
                        <p className="text-[11px] text-gray-400">{f.department || "Academic Department"}</p>
                      </div>
                      {f.email && (
                        <a
                          href={`mailto:${f.email}`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                          title={f.email}
                        >
                          <Mail size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Researchers Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#071A33] block">
                  Student Researchers ({viewingTeam.student_members.length})
                </span>
                <div className="grid grid-cols-1 gap-2">
                  {viewingTeam.student_members.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-white border border-gray-200 rounded-2xl flex items-center justify-between shadow-2xs"
                    >
                      <div className="space-y-1">
                        <h5 className="text-xs font-bold text-[#071A33]">{s.name}</h5>
                        <p className="text-[11px] text-blue-600 font-semibold">{s.degree || "Student Innovator"}</p>
                        {s.skills && s.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {s.skills.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="text-[10px] bg-slate-100 text-gray-600 px-2 py-0.5 rounded">
                                {sk}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {s.email && (
                        <a
                          href={`mailto:${s.email}`}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                          title={s.email}
                        >
                          <Mail size={14} />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setViewingTeam(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={20} />
              </div>
              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-[#071A33]">Delete Innovation Team?</h4>
                <p className="text-xs text-gray-500">
                  Are you sure you want to remove <span className="font-semibold text-gray-800">{deletingTeam.name}</span>? This team and its roster associations will be deleted.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingTeam(null)}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Deleting..." : "Delete Team"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
