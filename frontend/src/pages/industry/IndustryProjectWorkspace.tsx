import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  Target,
  Layers,
  FileText,
  Lightbulb,
  Cpu,
  MapPin,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  Handshake,
  Send,
  XCircle,
  Award,
  Plus,
  Trash2,
  DollarSign,
  Package,
  Check,
} from "lucide-react";
import { industryService } from "../../services/industryService";
import {
  IndustryDiscoveredProjectDetail,
  IndustryPartnership,
  IndustryProfile,
  IndustryExpert,
  ProjectMentorship,
  IndustryResource,
  IndustryFunding,
  IndustryCollaborationSummary,
  ResourceType,
  FundingType,
} from "../../types";
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

export default function IndustryProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<IndustryDiscoveredProjectDetail | null>(null);
  const [partnership, setPartnership] = useState<IndustryPartnership | null>(null);
  const [profile, setProfile] = useState<IndustryProfile | null>(null);
  const [experts, setExperts] = useState<IndustryExpert[]>([]);
  const [mentorships, setMentorships] = useState<ProjectMentorship[]>([]);
  const [resources, setResources] = useState<IndustryResource[]>([]);
  const [funding, setFunding] = useState<IndustryFunding[]>([]);
  const [collabSummary, setCollabSummary] = useState<IndustryCollaborationSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Partnership Interest Form State
  const [interestMessage, setInterestMessage] = useState("");
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [interestError, setInterestError] = useState<string | null>(null);

  // Mentorship Proposal Form State
  const [showProposeMentor, setShowProposeMentor] = useState(false);
  const [selectedExpertId, setSelectedExpertId] = useState("");
  const [focusAreasText, setFocusAreasText] = useState("");
  const [objectivesText, setObjectivesText] = useState("");
  const [submittingMentor, setSubmittingMentor] = useState(false);
  const [mentorError, setMentorError] = useState<string | null>(null);

  // Resource Proposal Form State
  const [showProposeResource, setShowProposeResource] = useState(false);
  const [resTitle, setResTitle] = useState("");
  const [resType, setResType] = useState<ResourceType>("technology");
  const [resDesc, setResDesc] = useState("");
  const [resQuantity, setResQuantity] = useState("");
  const [submittingResource, setSubmittingResource] = useState(false);
  const [resourceError, setResourceError] = useState<string | null>(null);

  // Funding Proposal Form State
  const [showProposeFunding, setShowProposeFunding] = useState(false);
  const [fundTitle, setFundTitle] = useState("");
  const [fundType, setFundType] = useState<FundingType>("sponsorship");
  const [fundAmount, setFundAmount] = useState("");
  const [fundCurrency, setFundCurrency] = useState("INR");
  const [fundDesc, setFundDesc] = useState("");
  const [submittingFunding, setSubmittingFunding] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);

  async function loadData() {
    if (!projectId) {
      setError("No project identifier specified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [projData, partData, profData, expData, mData, resData, fundData, sumData] = await Promise.all([
        industryService.getDiscoveredProjectDetail(projectId),
        industryService.getProjectInterest(projectId).catch(() => null),
        industryService.getProfile().catch(() => null),
        industryService.getExperts().catch(() => []),
        industryService.getProjectMentorships(projectId).catch(() => []),
        industryService.getProjectResources(projectId).catch(() => []),
        industryService.getProjectFunding(projectId).catch(() => []),
        industryService.getCollaborationSummary(projectId).catch(() => null),
      ]);

      setProject(projData);
      setPartnership(partData);
      setProfile(profData);
      setExperts(expData || []);
      setMentorships(mData || []);
      setResources(resData || []);
      setFunding(fundData || []);
      setCollabSummary(sumData);
    } catch (err: any) {
      console.error("Failed to fetch discovered project details:", err);
      setError(err?.message || "Failed to load project details.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [projectId]);

  async function handleProposeResource(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !resTitle.trim() || !resDesc.trim()) {
      setResourceError("Title and description are required.");
      return;
    }
    setSubmittingResource(true);
    setResourceError(null);
    try {
      const res = await industryService.createResource(projectId, {
        title: resTitle.trim(),
        resource_type: resType,
        description: resDesc.trim(),
        quantity_or_scope: resQuantity.trim() || undefined,
      });
      setResources((prev) => [res, ...prev]);
      setShowProposeResource(false);
      setResTitle("");
      setResDesc("");
      setResQuantity("");
      if (projectId) {
        industryService.getCollaborationSummary(projectId).then(setCollabSummary).catch(() => {});
      }
    } catch (err: any) {
      setResourceError(err?.message || "Failed to propose resource.");
    } finally {
      setSubmittingResource(false);
    }
  }

  async function handleWithdrawResource(resourceId: string) {
    if (!window.confirm("Are you sure you want to withdraw this resource contribution?")) return;
    try {
      await industryService.withdrawResource(resourceId);
      setResources((prev) =>
        prev.map((r) => (r.id === resourceId ? { ...r, status: "withdrawn" as const } : r))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw resource.");
    }
  }

  async function handleMarkResourceProvided(resourceId: string) {
    try {
      const updated = await industryService.updateResource(resourceId, { status: "provided" });
      setResources((prev) => prev.map((r) => (r.id === resourceId ? updated : r)));
    } catch (err: any) {
      alert(err?.message || "Failed to update resource status.");
    }
  }

  async function handleProposeFunding(e: React.FormEvent) {
    e.preventDefault();
    const parsedAmount = parseFloat(fundAmount);
    if (!projectId || !fundTitle.trim() || !fundDesc.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      setFundingError("Please enter valid funding details and an amount greater than zero.");
      return;
    }
    setSubmittingFunding(true);
    setFundingError(null);
    try {
      const res = await industryService.createFundingProposal(projectId, {
        title: fundTitle.trim(),
        funding_type: fundType,
        amount: parsedAmount,
        currency: fundCurrency,
        description: fundDesc.trim(),
      });
      setFunding((prev) => [res, ...prev]);
      setShowProposeFunding(false);
      setFundTitle("");
      setFundAmount("");
      setFundDesc("");
      if (projectId) {
        industryService.getCollaborationSummary(projectId).then(setCollabSummary).catch(() => {});
      }
    } catch (err: any) {
      setFundingError(err?.message || "Failed to submit funding proposal.");
    } finally {
      setSubmittingFunding(false);
    }
  }

  async function handleWithdrawFunding(fundingId: string) {
    if (!window.confirm("Are you sure you want to withdraw this funding proposal?")) return;
    try {
      await industryService.withdrawFundingProposal(fundingId);
      setFunding((prev) =>
        prev.map((f) => (f.id === fundingId ? { ...f, status: "withdrawn" as const } : f))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw funding proposal.");
    }
  }

  async function handleExpressInterest(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;

    if (!profile) {
      setInterestError("Please complete your Industry Profile before expressing partnership interest.");
      return;
    }

    setSubmittingInterest(true);
    setInterestError(null);
    try {
      const res = await industryService.expressPartnershipInterest(projectId, interestMessage);
      setPartnership(res);
      setInterestMessage("");
    } catch (err: any) {
      setInterestError(err?.message || "Failed to express partnership interest.");
    } finally {
      setSubmittingInterest(false);
    }
  }

  async function handleWithdrawPartnership() {
    if (!partnership) return;
    if (!window.confirm("Are you sure you want to withdraw your partnership expression of interest?")) return;

    try {
      const res = await industryService.withdrawPartnership(partnership.id);
      setPartnership(res);
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw partnership.");
    }
  }

  async function handleProposeMentorship(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !selectedExpertId || !objectivesText.trim()) {
      setMentorError("Please select an expert and define mentorship objectives.");
      return;
    }

    setSubmittingMentor(true);
    setMentorError(null);
    try {
      const focusAreas = focusAreasText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await industryService.proposeMentorship(projectId, {
        expert_id: selectedExpertId,
        focus_areas: focusAreas,
        objectives: objectivesText.trim(),
      });

      setMentorships((prev) => [res, ...prev]);
      setShowProposeMentor(false);
      setSelectedExpertId("");
      setFocusAreasText("");
      setObjectivesText("");
    } catch (err: any) {
      setMentorError(err?.message || "Failed to propose technical mentorship.");
    } finally {
      setSubmittingMentor(false);
    }
  }

  async function handleWithdrawMentorship(mentorshipId: string) {
    if (!window.confirm("Are you sure you want to withdraw this mentorship engagement?")) return;
    try {
      await industryService.withdrawMentorship(mentorshipId);
      setMentorships((prev) =>
        prev.map((m) => (m.id === mentorshipId ? { ...m, status: "withdrawn" } : m))
      );
    } catch (err: any) {
      alert(err?.message || "Failed to withdraw mentorship.");
    }
  }

  if (loading) {
    return <LoadingState message="Retrieving sanitized project dossier from university repository..." />;
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-3xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-2">Project Not Available</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {error || "The requested project could not be found or is not currently open for industry discovery."}
          </p>
          <Link
            to="/industry/projects"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Project Discovery
          </Link>
        </div>
      </div>
    );
  }

  const statusBadge = STATUS_CONFIG[project.project_status] || {
    label: project.project_status.replace(/_/g, " "),
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  };

  const isAccepted = partnership?.status === "accepted";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        backTo="/industry/projects"
        backLabel="Back to Projects"
        badge={`Academic Innovation Dossier · ${project.project_id}`}
        badgeColor="#F59E0B"
        title={project.project_name}
        subtitle={`Institutional Partner: ${project.university_name}`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
            {statusBadge.label}
          </span>
          {partnership && (
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                partnership.status === "accepted"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                  : partnership.status === "pending"
                  ? "bg-amber-50 text-amber-800 border-amber-300"
                  : partnership.status === "rejected"
                  ? "bg-rose-50 text-rose-800 border-rose-300"
                  : "bg-slate-100 text-slate-700 border-slate-300"
              }`}
            >
              <Handshake size={14} />
              Partnership {partnership.status.toUpperCase()}
            </span>
          )}
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Collaboration Summary Bar */}
        {partnership && (
          <div className="bg-gradient-to-r from-amber-900 via-stone-900 to-slate-900 rounded-3xl p-6 mb-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    <Handshake size={12} /> Enterprise Collaboration Workspace
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">{project.project_name}</h3>
                <p className="text-xs text-amber-100/70 max-w-xl">
                  {isAccepted
                    ? "Active industry alliance: Technical advisory, equipment support, dataset contributions, and funding coordination."
                    : "Partnership expression of interest is currently pending institutional review by the university."}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-2.5 text-center">
                  <span className="text-[10px] text-amber-200 block font-medium uppercase tracking-wider">Status</span>
                  <span className="text-sm font-black capitalize text-amber-300">{partnership.status}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-2.5 text-center">
                  <span className="text-[10px] text-amber-200 block font-medium uppercase tracking-wider">Mentors</span>
                  <span className="text-lg font-black text-emerald-400">{mentorships.length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-2.5 text-center">
                  <span className="text-[10px] text-amber-200 block font-medium uppercase tracking-wider">Resources</span>
                  <span className="text-lg font-black text-white">{resources.length}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-2.5 text-center">
                  <span className="text-[10px] text-amber-200 block font-medium uppercase tracking-wider">Funding</span>
                  <span className="text-lg font-black text-amber-300">{funding.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2-Column Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview & Scope */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-amber-600" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500">
                    Project Overview & Scope
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-gray-400">ID: {project.project_id}</span>
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-6">
                {project.description || "No public overview description provided by the university research cohort."}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Lifecycle Phase</span>
                  <p className="text-xs font-bold text-amber-700 mt-0.5">{statusBadge.label}</p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Initiated On</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : "Pending"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Target Date</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">
                    {project.target_date ? new Date(project.target_date).toLocaleDateString() : "Open Timeline"}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Last Updated</span>
                  <p className="text-xs font-bold text-gray-700 mt-0.5">
                    {project.updated_at ? new Date(project.updated_at).toLocaleDateString() : "Recent"}
                  </p>
                </div>
              </div>
            </div>

            {/* PART P: Mentorship Section (Shown ONLY when partnership is Accepted) */}
            {isAccepted && (
              <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Award size={20} className="text-emerald-600" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Technical Advisory & Mentorship
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium">
                        Accepted Industry Partnership Active · Propose Corporate Mentors
                      </p>
                    </div>
                  </div>

                  {!showProposeMentor && (
                    <button
                      onClick={() => setShowProposeMentor(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer transition-colors"
                    >
                      <Plus size={14} /> Propose Technical Mentor
                    </button>
                  )}
                </div>

                {/* Propose Mentor Form Modal / Drawer */}
                {showProposeMentor && (
                  <form onSubmit={handleProposeMentorship} className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Assign Corporate Expert to Project
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowProposeMentor(false)}
                        className="text-gray-400 hover:text-gray-600 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    {mentorError && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                        {mentorError}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Select Expert from Corporate Roster <span className="text-rose-500">*</span>
                      </label>
                      {experts.length > 0 ? (
                        <select
                          value={selectedExpertId}
                          onChange={(e) => setSelectedExpertId(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                          required
                        >
                          <option value="">-- Choose an expert --</option>
                          {experts.map((exp) => (
                            <option key={exp.id} value={exp.id}>
                              {exp.name} · {exp.designation} ({exp.availability})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between">
                          <span>No experts registered in your corporate roster yet.</span>
                          <Link to="/industry/experts" className="font-bold underline">
                            Manage Experts &rarr;
                          </Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Focus Areas (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={focusAreasText}
                        onChange={(e) => setFocusAreasText(e.target.value)}
                        placeholder="e.g. Firmware Optimization, Sensor Calibration, Architecture Review"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Mentorship Objectives & Scope <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={objectivesText}
                        onChange={(e) => setObjectivesText(e.target.value)}
                        placeholder="Detail the technical guidance, review schedule, or design goals for the student-faculty cohort..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowProposeMentor(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingMentor || experts.length === 0}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      >
                        {submittingMentor ? "Submitting..." : "Confirm Mentorship Proposal"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Mentorship Engagements List */}
                {mentorships.length > 0 ? (
                  <div className="space-y-3">
                    {mentorships.map((m) => (
                      <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{m.expert_name || "Assigned Mentor"}</h4>
                              <span className="text-[11px] text-gray-500">· {m.expert_designation}</span>
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${
                                m.status === "active"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : m.status === "completed"
                                  ? "bg-blue-100 text-blue-800"
                                  : m.status === "withdrawn"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Status: {m.status}
                            </span>
                          </div>

                          {m.status !== "withdrawn" && m.status !== "completed" && (
                            <button
                              onClick={() => handleWithdrawMentorship(m.id)}
                              className="text-xs text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                              title="Withdraw mentorship engagement"
                            >
                              <XCircle size={15} />
                            </button>
                          )}
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                          <strong className="text-gray-900">Objectives:</strong> {m.objectives}
                        </p>

                        {m.focus_areas && m.focus_areas.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {m.focus_areas.map((f, i) => (
                              <span key={i} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                    No technical mentors currently assigned. Propose an expert from your corporate roster above.
                  </p>
                )}
              </div>
            )}

            {/* PART 4: Resources & Technology Support (Shown ONLY when partnership is Accepted) */}
            {isAccepted && (
              <div className="bg-white border-2 border-indigo-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <Package size={20} className="text-indigo-600" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Resources & Technology Support
                      </h3>
                      <p className="text-xs text-indigo-800 font-medium">
                        Contribute software licenses, datasets, hardware testbeds, or specialized services
                      </p>
                    </div>
                  </div>

                  {!showProposeResource && (
                    <button
                      onClick={() => {
                        setShowProposeResource(true);
                        setResourceError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus size={14} /> Propose Resource
                    </button>
                  )}
                </div>

                {/* Propose Resource Form */}
                {showProposeResource && (
                  <form
                    onSubmit={handleProposeResource}
                    className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-100">
                      <span className="text-xs font-bold text-indigo-900">Propose Resource or Technology Contribution</span>
                    </div>

                    {resourceError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                        {resourceError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Resource Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={resTitle}
                          onChange={(e) => setResTitle(e.target.value)}
                          placeholder="e.g. AWS Cloud Compute Credits, LiDAR Sensor Kit"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Contribution Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={resType}
                          onChange={(e) => setResType(e.target.value as ResourceType)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:outline-none cursor-pointer"
                        >
                          <option value="technology">Technology</option>
                          <option value="equipment">Equipment / Hardware</option>
                          <option value="software">Software / Licenses</option>
                          <option value="dataset">Dataset / Data Access</option>
                          <option value="infrastructure">Lab / Cloud Infrastructure</option>
                          <option value="technical_service">Technical Service / Testing</option>
                          <option value="other">Other Contribution</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Quantity or Scope
                      </label>
                      <input
                        type="text"
                        value={resQuantity}
                        onChange={(e) => setResQuantity(e.target.value)}
                        placeholder="e.g. 50 Enterprise seats, 1TB satellite data, 200 GPU hours"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Detailed Description & Terms <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={resDesc}
                        onChange={(e) => setResDesc(e.target.value)}
                        placeholder="Specify terms of usage, access instructions, software environment, or delivery timelines..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-indigo-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowProposeResource(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingResource}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
                      >
                        {submittingResource ? "Submitting..." : "Confirm Contribution"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Resources List */}
                {resources.length > 0 ? (
                  <div className="space-y-3">
                    {resources.map((r) => (
                      <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{r.title}</h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {r.resource_type.replace(/_/g, " ")}
                              </span>
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${
                                r.status === "provided"
                                  ? "bg-blue-100 text-blue-800"
                                  : r.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : r.status === "rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : r.status === "withdrawn"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Status: {r.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {r.status === "approved" && (
                              <button
                                onClick={() => handleMarkResourceProvided(r.id)}
                                className="px-3 py-1 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors cursor-pointer"
                                title="Confirm this resource has been handed over / activated"
                              >
                                Mark Provided
                              </button>
                            )}
                            {r.status !== "withdrawn" && r.status !== "provided" && r.status !== "rejected" && (
                              <button
                                onClick={() => handleWithdrawResource(r.id)}
                                className="text-xs text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Withdraw resource contribution"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        {r.quantity_or_scope && (
                          <div className="text-xs text-gray-600">
                            <span className="font-bold text-gray-700">Scope/Quantity:</span> {r.quantity_or_scope}
                          </div>
                        )}

                        <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                          {r.description}
                        </p>

                        {r.provided_at && (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Provided to project on: {new Date(r.provided_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                    No resources or technology contributions proposed yet. Click "Propose Resource" above to support this project.
                  </p>
                )}
              </div>
            )}

            {/* PART 9: Funding & Sponsorship Proposals (Shown ONLY when partnership is Accepted) */}
            {isAccepted && (
              <div className="bg-white border-2 border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <DollarSign size={20} className="text-emerald-600" />
                    <div>
                      <h3 className="text-base font-bold text-gray-900">
                        Funding & Sponsorship Proposals
                      </h3>
                      <p className="text-xs text-emerald-800 font-medium">
                        Submit direct grant support, CSR innovation funds, or milestone sponsorships
                      </p>
                    </div>
                  </div>

                  {!showProposeFunding && (
                    <button
                      onClick={() => {
                        setShowProposeFunding(true);
                        setFundingError(null);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                    >
                      <Plus size={14} /> Propose Funding
                    </button>
                  )}
                </div>

                {/* Propose Funding Form */}
                {showProposeFunding && (
                  <form
                    onSubmit={handleProposeFunding}
                    className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3"
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-emerald-100">
                      <span className="text-xs font-bold text-emerald-900">Submit Funding / Sponsorship Proposal</span>
                    </div>

                    {fundingError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                        {fundingError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Funding Proposal Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={fundTitle}
                          onChange={(e) => setFundTitle(e.target.value)}
                          placeholder="e.g. CSR Clean Energy Pilot Grant, Phase 2 Prototyping Support"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Funding Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={fundType}
                          onChange={(e) => setFundType(e.target.value as FundingType)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                        >
                          <option value="sponsorship">Corporate Sponsorship</option>
                          <option value="grant">Research Grant</option>
                          <option value="project_support">Project Support</option>
                          <option value="csr">CSR Allocation</option>
                          <option value="other">Other Funding</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Amount <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          placeholder="e.g. 500000"
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                          Currency
                        </label>
                        <select
                          value={fundCurrency}
                          onChange={(e) => setFundCurrency(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none cursor-pointer"
                        >
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        Purpose & Funding Terms <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        value={fundDesc}
                        onChange={(e) => setFundDesc(e.target.value)}
                        placeholder="Detail the intended use of funds, disbursement milestones, or reporting expectations..."
                        rows={3}
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-white focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowProposeFunding(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingFunding}
                        className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
                      >
                        {submittingFunding ? "Submitting..." : "Submit Funding Proposal"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Funding Proposals List */}
                {funding.length > 0 ? (
                  <div className="space-y-3">
                    {funding.map((f) => (
                      <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-gray-900">{f.title}</h4>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {f.funding_type.replace(/_/g, " ")}
                              </span>
                            </div>
                            <div className="text-sm font-black text-gray-900 mt-1">
                              {f.currency} {f.amount.toLocaleString()}
                            </div>
                            <span
                              className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-1.5 ${
                                f.status === "disbursed"
                                  ? "bg-blue-100 text-blue-800"
                                  : f.status === "approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : f.status === "rejected"
                                  ? "bg-rose-100 text-rose-800"
                                  : f.status === "withdrawn"
                                  ? "bg-gray-200 text-gray-700"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              Status: {f.status}
                            </span>
                          </div>

                          <div>
                            {f.status === "proposed" && (
                              <button
                                onClick={() => handleWithdrawFunding(f.id)}
                                className="text-xs text-gray-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                                title="Withdraw funding proposal"
                              >
                                <XCircle size={15} />
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-gray-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-100">
                          {f.description}
                        </p>

                        <div className="text-[10px] text-gray-400 font-mono">
                          Proposed on: {new Date(f.proposed_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic text-center py-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                    No funding or sponsorship proposals submitted yet. Click "Propose Funding" above to offer financial sponsorship.
                  </p>
                )}
              </div>
            )}

            {/* Solution & Technical Approach */}
            {project.solution ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Lightbulb size={18} className="text-amber-600" />
                    <h3 className="text-base font-bold text-gray-900">
                      {project.solution.title || "Proposed Innovation Solution"}
                    </h3>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Status: {project.solution.status}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[11px]">
                      Problem Statement
                    </h4>
                    <p className="text-gray-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
                      {project.solution.problem_statement}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[11px]">
                      Proposed Technical Solution
                    </h4>
                    <p className="text-gray-700 leading-relaxed bg-amber-50/40 p-3.5 rounded-2xl border border-amber-100">
                      {project.solution.proposed_solution}
                    </p>
                  </div>

                  {project.solution.technical_approach && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[11px]">
                        Technical Approach & Architecture
                      </h4>
                      <p className="text-gray-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
                        {project.solution.technical_approach}
                      </p>
                    </div>
                  )}

                  {project.solution.expected_outcomes && (
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1 uppercase tracking-wider text-[11px]">
                        Anticipated Impact & Deliverables
                      </h4>
                      <p className="text-gray-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-gray-100">
                        {project.solution.expected_outcomes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs text-center">
                <p className="text-xs text-gray-400 italic">
                  Detailed technical solution proposal is currently being finalized by the university innovation cohort.
                </p>
              </div>
            )}

            {/* Milestones & Progress */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <h3 className="text-base font-bold text-gray-900">Milestone Progress & Roadmap</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-900">
                    {project.completed_milestones_count} / {project.milestones_count} Completed
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {project.milestone_progress}%
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                <div
                  className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${project.milestone_progress}%` }}
                />
              </div>

              {/* Milestones List */}
              {project.milestones && project.milestones.length > 0 ? (
                <div className="space-y-3">
                  {project.milestones.map((m) => {
                    const isDone = m.status === "completed";
                    const isInProgress = m.status === "in_progress";
                    return (
                      <div
                        key={m.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isDone
                            ? "bg-emerald-50/40 border-emerald-100"
                            : isInProgress
                            ? "bg-amber-50/40 border-amber-200"
                            : "bg-slate-50/50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5">
                              {isDone ? (
                                <CheckCircle2 size={16} className="text-emerald-600" />
                              ) : isInProgress ? (
                                <Clock size={16} className="text-amber-600 animate-pulse" />
                              ) : (
                                <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div>
                              <h5 className={`text-xs font-bold ${isDone ? "text-gray-900" : "text-gray-800"}`}>
                                {m.title}
                              </h5>
                              {m.description && (
                                <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{m.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isInProgress
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {m.status.replace(/_/g, " ")}
                            </span>
                            {m.due_date && (
                              <p className="text-[10px] text-gray-400 font-mono mt-1">
                                Due: {new Date(m.due_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic text-center py-4">
                  No public milestones have been scheduled for this project.
                </p>
              )}
            </div>

            {/* Prototypes & Pilots */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2">
                <Cpu size={18} className="text-purple-600" />
                <h3 className="text-base font-bold text-gray-900">Prototypes & Field Pilots</h3>
              </div>

              {/* Prototypes */}
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Technical Prototypes ({project.prototypes.length})
                </h4>
                {project.prototypes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.prototypes.map((pt) => (
                      <div key={pt.id} className="p-4 rounded-2xl bg-purple-50/30 border border-purple-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase font-mono">
                            v{pt.version}
                          </span>
                          <span className="text-[10px] font-bold text-gray-600 capitalize">{pt.status}</span>
                        </div>
                        <h5 className="text-xs font-bold text-gray-900">{pt.title}</h5>
                        {pt.description && <p className="text-[11px] text-gray-600 leading-relaxed">{pt.description}</p>}
                        {pt.artifact_url && (
                          <div className="pt-2 border-t border-purple-100 flex items-center gap-1 text-[11px] text-purple-700 font-semibold">
                            <ExternalLink size={12} />
                            <span>Artifact Reference: {pt.artifact_type || "Technical Build"}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    No hardware or software prototypes registered at this phase.
                  </p>
                )}
              </div>

              {/* Pilots */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Civic Field Pilots ({project.pilots.length})
                </h4>
                {project.pilots.length > 0 ? (
                  <div className="space-y-3">
                    {project.pilots.map((pilot) => (
                      <div key={pilot.id} className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                            <MapPin size={13} className="text-orange-600" />
                            <span>{pilot.title} · {pilot.location}</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-800 uppercase">
                            {pilot.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          <strong className="text-gray-900">Objectives:</strong> {pilot.objectives}
                        </p>
                        {pilot.results && (
                          <p className="text-xs text-gray-700 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-orange-200/50">
                            <strong className="text-emerald-700">Demonstrated Outcomes:</strong> {pilot.results}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    Field pilot deployments are planned for subsequent validation stages.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="space-y-6">
            {/* PART F: Industry Partnership Interest Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Handshake size={18} className="text-amber-600" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Industry Partnership
                </h4>
              </div>

              {partnership ? (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-2xl border ${
                      partnership.status === "accepted"
                        ? "bg-emerald-50/50 border-emerald-200"
                        : partnership.status === "pending"
                        ? "bg-amber-50/50 border-amber-200"
                        : partnership.status === "rejected"
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-900">Partnership Status</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          partnership.status === "accepted"
                            ? "bg-emerald-100 text-emerald-800"
                            : partnership.status === "pending"
                            ? "bg-amber-100 text-amber-800"
                            : partnership.status === "rejected"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {partnership.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed">
                      {partnership.status === "accepted"
                        ? "Partnership Accepted! Direct technical advisory and mentorship collaboration is now active."
                        : partnership.status === "pending"
                        ? "Your expression of partnership interest has been submitted to the university project leadership."
                        : partnership.status === "rejected"
                        ? "The university has declined this partnership interest request."
                        : "You have withdrawn your partnership request."}
                    </p>

                    {partnership.message && (
                      <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs text-gray-500">
                        <span className="block font-semibold text-gray-700 mb-0.5">Submitted Note:</span>
                        <p className="italic">"{partnership.message}"</p>
                      </div>
                    )}

                    <div className="text-[10px] text-gray-400 mt-2 font-mono">
                      Requested: {new Date(partnership.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {partnership.status === "pending" && (
                    <button
                      onClick={handleWithdrawPartnership}
                      className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-gray-600 bg-slate-50 hover:bg-rose-50 hover:text-rose-700 border border-gray-200 transition-colors cursor-pointer"
                    >
                      Withdraw Partnership Interest
                    </button>
                  )}
                </div>
              ) : (
                <form onSubmit={handleExpressInterest} className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Partnering on this project enables your enterprise to provide technical mentorship, co-develop prototypes, and scale pilot impact.
                  </p>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-gray-100 text-xs text-gray-700">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Authenticated Company</span>
                    <span className="font-bold text-gray-900">{profile?.company_name || "Your Corporate Entity"}</span>
                  </div>

                  {interestError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                      {interestError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Collaboration Message (Optional)
                    </label>
                    <textarea
                      value={interestMessage}
                      onChange={(e) => setInterestMessage(e.target.value)}
                      placeholder="Specify areas of synergy, technical review interests, or testbed alignment..."
                      rows={3}
                      className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingInterest}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send size={14} />
                    {submittingInterest ? "Submitting..." : "Express Partnership Interest"}
                  </button>
                </form>
              )}
            </div>

            {/* Linked Civic Challenge */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-amber-600" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Linked Civic Challenge
                </h4>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">
                  {project.challenge_title}
                </h3>
                {project.challenge_location && (
                  <div className="flex items-center gap-1 text-[11px] text-gray-500 mb-2">
                    <MapPin size={12} className="text-gray-400" />
                    <span>{project.challenge_location}</span>
                  </div>
                )}
              </div>

              {project.challenge_description && (
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-4 bg-slate-50 p-3 rounded-xl border border-gray-100">
                  {project.challenge_description}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  {project.challenge_category}
                </span>
                {project.challenge_subcategory && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    {project.challenge_subcategory}
                  </span>
                )}
                {project.challenge_urgency && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                    {project.challenge_urgency} Urgency
                  </span>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <Link
                  to={`/industry/challenges/${project.challenge_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                >
                  <span>Inspect Full Challenge Dossier</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* University & Innovation Team */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} className="text-amber-600" />
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Academic Institution
                </h4>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">{project.university_name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">Assigned Innovation Team: {project.team_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-center">
                  <span className="block text-lg font-extrabold text-gray-900">{project.faculty_count}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Faculty PIs</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-center">
                  <span className="block text-lg font-extrabold text-gray-900">{project.student_count}</span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Student Cohort</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-gray-200/60 text-[11px] text-gray-500 leading-relaxed flex items-start gap-2">
                <Info size={15} className="text-gray-400 shrink-0 mt-0.5" />
                <span>
                  Faculty and student privacy is protected under institutional governance. Individual roster and contact details are withheld at discovery stage.
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
