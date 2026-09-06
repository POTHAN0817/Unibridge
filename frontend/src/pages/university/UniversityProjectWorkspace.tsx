import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  ArrowLeft,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Target,
  ExternalLink,
  Calendar,
  MapPin,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Code2,
  X,
  Send,
  Flag,
  Radio,
  BookOpen,
  HelpCircle,
  FileCheck,
  Handshake,
  Package,
  DollarSign,
} from "lucide-react";
import {
  UniversityProject,
  ProjectStatus,
  ProjectMilestone,
  ProjectResearch,
  ProjectSolution,
  ProjectPrototype,
  ProjectPilot,
  DeploymentReadiness,
  ProjectActivity,
  MilestoneStatus,
  SolutionStatus,
  PrototypeStatus,
  PilotStatus,
  ReadinessStatus,
  UniversityPartnershipRequest,
  ProjectMentorship,
  IndustryResource,
  IndustryFunding,
} from "../../types";
import { universityService } from "../../services/universityService";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

const LIFECYCLE_STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "planning", label: "Planning" },
  { key: "research", label: "Research" },
  { key: "solution_proposed", label: "Solution Proposal" },
  { key: "prototype", label: "Prototype" },
  { key: "pilot", label: "Field Pilot" },
  { key: "deployment", label: "Deployment Readiness" },
  { key: "completed", label: "Completed" },
];

const WORKSPACE_TABS = [
  "Overview",
  "Milestones",
  "Research",
  "Solution",
  "Prototypes",
  "Pilots",
  "Deployment Readiness",
  "Industry Partnerships",
  "Industry Mentors",
  "Industry Resources",
  "Industry Funding",
  "Activity",
] as const;

type WorkspaceTab = (typeof WORKSPACE_TABS)[number];

const MILESTONE_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  in_progress: { label: "In Progress", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  blocked: { label: "Blocked", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const SOLUTION_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft Proposal", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  under_review: { label: "Under Faculty Review", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  approved: { label: "Approved Solution", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  revision_required: { label: "Revision Required", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const PROTOTYPE_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planned", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  in_development: { label: "In Development", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  ready: { label: "Build Ready", cls: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  tested: { label: "Bench Tested", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Iteration Shelved", cls: "bg-rose-50 text-rose-700 border-rose-200" },
};

const PILOT_STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  planned: { label: "Planned", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  preparation: { label: "Site Preparation", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  active: { label: "Active in Field", cls: "bg-orange-50 text-orange-700 border-orange-200" },
  completed: { label: "Trial Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "Temporarily Paused", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500 border-slate-200" },
};

const READINESS_BADGE: Record<string, { label: string; cls: string }> = {
  not_ready: { label: "Not Ready", cls: "bg-slate-100 text-slate-700 border-slate-200" },
  assessment: { label: "Under Readiness Assessment", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  ready_for_deployment: { label: "Ready For Deployment", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  deployment_in_progress: { label: "Deployment In Progress", cls: "bg-sky-50 text-sky-700 border-sky-200" },
  deployed: { label: "Fully Deployed", cls: "bg-green-100 text-green-800 border-green-300" },
};

export default function UniversityProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  // Root state
  const [project, setProject] = useState<UniversityProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("Overview");

  // Tab Data States
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [researchList, setResearchList] = useState<ProjectResearch[]>([]);
  const [solution, setSolution] = useState<ProjectSolution | null>(null);
  const [prototypes, setPrototypes] = useState<ProjectPrototype[]>([]);
  const [pilots, setPilots] = useState<ProjectPilot[]>([]);
  const [readiness, setReadiness] = useState<DeploymentReadiness | null>(null);
  const [activityLog, setActivityLog] = useState<ProjectActivity[]>([]);
  const [partnerships, setPartnerships] = useState<UniversityPartnershipRequest[]>([]);
  const [mentors, setMentors] = useState<ProjectMentorship[]>([]);

  // Feedback Toast
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function triggerFeedback(type: "success" | "error", message: string) {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  }

  // Modals state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneStatus, setMilestoneStatus] = useState<MilestoneStatus>("pending");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");

  const [showResearchModal, setShowResearchModal] = useState(false);
  const [editingResearch, setEditingResearch] = useState<ProjectResearch | null>(null);
  const [researchTitle, setResearchTitle] = useState("");
  const [researchDesc, setResearchDesc] = useState("");
  const [researchFindings, setResearchFindings] = useState("");
  const [researchMethodology, setResearchMethodology] = useState("");
  const [researchRefs, setResearchRefs] = useState("");

  const [showSolutionModal, setShowSolutionModal] = useState(false);
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionProblem, setSolutionProblem] = useState("");
  const [solutionProposed, setSolutionProposed] = useState("");
  const [solutionTech, setSolutionTech] = useState("");
  const [solutionOutcomes, setSolutionOutcomes] = useState("");
  const [solutionResources, setSolutionResources] = useState("");
  const [solutionRisks, setSolutionRisks] = useState("");
  const [solutionConstraints, setSolutionConstraints] = useState("");
  const [solutionStatus, setSolutionStatus] = useState<SolutionStatus>("draft");

  const [showPrototypeModal, setShowPrototypeModal] = useState(false);
  const [editingPrototype, setEditingPrototype] = useState<ProjectPrototype | null>(null);
  const [prototypeVersion, setPrototypeVersion] = useState("v1.0");
  const [prototypeTitle, setPrototypeTitle] = useState("");
  const [prototypeDesc, setPrototypeDesc] = useState("");
  const [prototypeStatus, setPrototypeStatus] = useState<PrototypeStatus>("planned");
  const [prototypeArtifactUrl, setPrototypeArtifactUrl] = useState("");
  const [prototypeArtifactPublicId, setPrototypeArtifactPublicId] = useState("");
  const [prototypeArtifactType, setPrototypeArtifactType] = useState("");
  const [uploadingArtifact, setUploadingArtifact] = useState(false);

  const [showPilotModal, setShowPilotModal] = useState(false);
  const [editingPilot, setEditingPilot] = useState<ProjectPilot | null>(null);
  const [pilotTitle, setPilotTitle] = useState("");
  const [pilotLocation, setPilotLocation] = useState("");
  const [pilotObjectives, setPilotObjectives] = useState("");
  const [pilotStartDate, setPilotStartDate] = useState("");
  const [pilotEndDate, setPilotEndDate] = useState("");
  const [pilotStatus, setPilotStatus] = useState<PilotStatus>("planned");
  const [pilotObservations, setPilotObservations] = useState("");
  const [pilotResults, setPilotResults] = useState("");
  const [pilotIssues, setPilotIssues] = useState("");

  const [showReadinessModal, setShowReadinessModal] = useState(false);
  const [readinessStatus, setReadinessStatus] = useState<ReadinessStatus>("not_ready");
  const [techReadiness, setTechReadiness] = useState("");
  const [infraReqs, setInfraReqs] = useState("");
  const [estCost, setEstCost] = useState("");
  const [maintenanceReqs, setMaintenanceReqs] = useState("");
  const [deployReqs, setDeployReqs] = useState("");
  const [blockers, setBlockers] = useState("");
  const [notes, setNotes] = useState("");

  const [resources, setResources] = useState<IndustryResource[]>([]);
  const [funding, setFunding] = useState<IndustryFunding[]>([]);

  const [actionLoading, setActionLoading] = useState(false);

  // Load all project workspace data
  async function loadWorkspace() {
    if (!projectId) return;
    setLoading(true);
    try {
      const proj = await universityService.getProjectById(projectId);
      setProject(proj);

      const [mList, rList, sol, pList, piList, read, act, parts, mntrs, resList, fundList] = await Promise.all([
        universityService.getMilestones(projectId).catch(() => []),
        universityService.getResearchList(projectId).catch(() => []),
        universityService.getSolution(projectId).catch(() => null),
        universityService.getPrototypeList(projectId).catch(() => []),
        universityService.getPilotList(projectId).catch(() => []),
        universityService.getDeploymentReadiness(projectId).catch(() => null),
        universityService.getProjectActivity(projectId).catch(() => []),
        universityService.getProjectPartnerships(projectId).catch(() => []),
        universityService.getProjectMentorships(projectId).catch(() => []),
        universityService.getProjectIndustryResources(projectId).catch(() => []),
        universityService.getProjectIndustryFunding(projectId).catch(() => []),
      ]);

      setMilestones(mList);
      setResearchList(rList);
      setSolution(sol);
      setPrototypes(pList);
      setPilots(piList);
      setReadiness(read);
      setActivityLog(act);
      setPartnerships(parts || []);
      setMentors(mntrs || []);
      setResources(resList || []);
      setFunding(fundList || []);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Could not load project workspace.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAcceptPartnership(partnershipId: string) {
    if (!projectId) return;
    try {
      await universityService.acceptPartnership(partnershipId);
      triggerFeedback("success", "Industry partnership accepted! The partner can now assign technical mentors.");
      const [parts, act] = await Promise.all([
        universityService.getProjectPartnerships(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPartnerships(parts);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to accept partnership.");
    }
  }

  async function handleRejectPartnership(partnershipId: string) {
    if (!projectId) return;
    if (!window.confirm("Are you sure you want to decline this industry partnership request?")) return;
    try {
      await universityService.rejectPartnership(partnershipId);
      triggerFeedback("success", "Industry partnership request declined.");
      const [parts, act] = await Promise.all([
        universityService.getProjectPartnerships(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPartnerships(parts);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to decline partnership.");
    }
  }

  async function handleApproveResource(resourceId: string) {
    if (!projectId) return;
    try {
      await universityService.approveIndustryResource(resourceId);
      triggerFeedback("success", "Resource contribution approved!");
      const [resList, act] = await Promise.all([
        universityService.getProjectIndustryResources(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setResources(resList || []);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to approve resource contribution.");
    }
  }

  async function handleRejectResource(resourceId: string) {
    if (!projectId) return;
    if (!window.confirm("Are you sure you want to decline this resource contribution?")) return;
    try {
      await universityService.rejectIndustryResource(resourceId);
      triggerFeedback("success", "Resource contribution rejected.");
      const [resList, act] = await Promise.all([
        universityService.getProjectIndustryResources(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setResources(resList || []);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to reject resource contribution.");
    }
  }

  async function handleApproveFunding(fundingId: string) {
    if (!projectId) return;
    try {
      await universityService.approveIndustryFunding(fundingId);
      triggerFeedback("success", "Funding proposal approved!");
      const [fundList, act] = await Promise.all([
        universityService.getProjectIndustryFunding(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setFunding(fundList || []);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to approve funding proposal.");
    }
  }

  async function handleRejectFunding(fundingId: string) {
    if (!projectId) return;
    if (!window.confirm("Are you sure you want to decline this funding proposal?")) return;
    try {
      await universityService.rejectIndustryFunding(fundingId);
      triggerFeedback("success", "Funding proposal rejected.");
      const [fundList, act] = await Promise.all([
        universityService.getProjectIndustryFunding(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setFunding(fundList || []);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to reject funding proposal.");
    }
  }

  useEffect(() => {
    loadWorkspace();
  }, [projectId]);

  // Stage index calculation
  const currentStageIndex = useMemo(() => {
    if (!project) return 0;
    const idx = LIFECYCLE_STAGES.findIndex((s) => s.key === project.status);
    return idx >= 0 ? idx : 0;
  }, [project]);

  // Advance / Change Lifecycle Phase
  async function handlePhaseChange(newStatus: ProjectStatus) {
    if (!project || !projectId) return;
    try {
      const updated = await universityService.updateProject(projectId, { status: newStatus });
      setProject(updated);
      triggerFeedback("success", `Project workspace advanced to phase: ${newStatus.replace("_", " ")}`);
      // Reload activity
      universityService.getProjectActivity(projectId).then(setActivityLog);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to update project phase.");
    }
  }

  // =========================================================================
  // Milestone Handlers
  // =========================================================================
  function handleOpenCreateMilestone() {
    setEditingMilestone(null);
    setMilestoneTitle("");
    setMilestoneDesc("");
    setMilestoneStatus("pending");
    setMilestoneDueDate("");
    setShowMilestoneModal(true);
  }

  function handleOpenEditMilestone(m: ProjectMilestone) {
    setEditingMilestone(m);
    setMilestoneTitle(m.title);
    setMilestoneDesc(m.description || "");
    setMilestoneStatus(m.status);
    setMilestoneDueDate(m.due_date || "");
    setShowMilestoneModal(true);
  }

  async function handleSaveMilestone(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !milestoneTitle.trim()) return;
    setActionLoading(true);
    try {
      if (editingMilestone) {
        await universityService.updateMilestone(projectId, editingMilestone.id, {
          title: milestoneTitle.trim(),
          description: milestoneDesc.trim() || undefined,
          status: milestoneStatus,
          due_date: milestoneDueDate || undefined,
        });
        triggerFeedback("success", "Milestone updated.");
      } else {
        await universityService.createMilestone(projectId, {
          title: milestoneTitle.trim(),
          description: milestoneDesc.trim() || undefined,
          status: milestoneStatus,
          due_date: milestoneDueDate || undefined,
        });
        triggerFeedback("success", "Milestone created.");
      }
      setShowMilestoneModal(false);
      // Refresh milestones, project progress, activity
      const [mList, proj, act] = await Promise.all([
        universityService.getMilestones(projectId),
        universityService.getProjectById(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setMilestones(mList);
      setProject(proj);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to save milestone.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteMilestone(milestoneId: string) {
    if (!projectId) return;
    try {
      await universityService.deleteMilestone(projectId, milestoneId);
      triggerFeedback("success", "Milestone removed.");
      const [mList, proj, act] = await Promise.all([
        universityService.getMilestones(projectId),
        universityService.getProjectById(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setMilestones(mList);
      setProject(proj);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to delete milestone.");
    }
  }

  async function handleToggleMilestoneStatus(m: ProjectMilestone) {
    if (!projectId) return;
    const nextStatus = m.status === "completed" ? "in_progress" : "completed";
    try {
      await universityService.updateMilestone(projectId, m.id, { status: nextStatus });
      const [mList, proj, act] = await Promise.all([
        universityService.getMilestones(projectId),
        universityService.getProjectById(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setMilestones(mList);
      setProject(proj);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to update milestone status.");
    }
  }

  // =========================================================================
  // Research Handlers
  // =========================================================================
  function handleOpenCreateResearch() {
    setEditingResearch(null);
    setResearchTitle("");
    setResearchDesc("");
    setResearchFindings("");
    setResearchMethodology("");
    setResearchRefs("");
    setShowResearchModal(true);
  }

  function handleOpenEditResearch(r: ProjectResearch) {
    setEditingResearch(r);
    setResearchTitle(r.title);
    setResearchDesc(r.description || "");
    setResearchFindings(r.findings || "");
    setResearchMethodology(r.methodology || "");
    setResearchRefs(r.references ? r.references.join("\n") : "");
    setShowResearchModal(true);
  }

  async function handleSaveResearch(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !researchTitle.trim()) return;
    setActionLoading(true);
    try {
      const refArray = researchRefs
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      if (editingResearch) {
        await universityService.updateResearch(projectId, editingResearch.id, {
          title: researchTitle.trim(),
          description: researchDesc.trim() || undefined,
          findings: researchFindings.trim() || undefined,
          methodology: researchMethodology.trim() || undefined,
          references: refArray,
        });
        triggerFeedback("success", "Research entry updated.");
      } else {
        await universityService.createResearch(projectId, {
          title: researchTitle.trim(),
          description: researchDesc.trim() || undefined,
          findings: researchFindings.trim() || undefined,
          methodology: researchMethodology.trim() || undefined,
          references: refArray,
        });
        triggerFeedback("success", "Research entry created.");
      }
      setShowResearchModal(false);
      const [rList, act] = await Promise.all([
        universityService.getResearchList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setResearchList(rList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to save research.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteResearch(researchId: string) {
    if (!projectId) return;
    try {
      await universityService.deleteResearch(projectId, researchId);
      triggerFeedback("success", "Research entry deleted.");
      const [rList, act] = await Promise.all([
        universityService.getResearchList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setResearchList(rList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to delete research.");
    }
  }

  // =========================================================================
  // Solution Proposal Handlers
  // =========================================================================
  function handleOpenEditSolution() {
    if (solution) {
      setSolutionTitle(solution.title);
      setSolutionProblem(solution.problem_statement);
      setSolutionProposed(solution.proposed_solution);
      setSolutionTech(solution.technical_approach || "");
      setSolutionOutcomes(solution.expected_outcomes || "");
      setSolutionResources(solution.required_resources || "");
      setSolutionRisks(solution.risks || "");
      setSolutionConstraints(solution.constraints || "");
      setSolutionStatus(solution.status);
    } else {
      setSolutionTitle(project ? `${project.name} Architecture Proposal` : "Solution Architecture Proposal");
      setSolutionProblem("");
      setSolutionProposed("");
      setSolutionTech("");
      setSolutionOutcomes("");
      setSolutionResources("");
      setSolutionRisks("");
      setSolutionConstraints("");
      setSolutionStatus("draft");
    }
    setShowSolutionModal(true);
  }

  async function handleSaveSolution(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !solutionTitle.trim() || !solutionProblem.trim() || !solutionProposed.trim()) return;
    setActionLoading(true);
    try {
      const updated = await universityService.saveSolution(projectId, {
        title: solutionTitle.trim(),
        problem_statement: solutionProblem.trim(),
        proposed_solution: solutionProposed.trim(),
        technical_approach: solutionTech.trim() || undefined,
        expected_outcomes: solutionOutcomes.trim() || undefined,
        required_resources: solutionResources.trim() || undefined,
        risks: solutionRisks.trim() || undefined,
        constraints: solutionConstraints.trim() || undefined,
        status: solutionStatus,
      });
      setSolution(updated);
      setShowSolutionModal(false);
      triggerFeedback("success", "Solution proposal saved.");
      universityService.getProjectActivity(projectId).then(setActivityLog);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to save solution proposal.");
    } finally {
      setActionLoading(false);
    }
  }

  // =========================================================================
  // Prototype Handlers
  // =========================================================================
  function handleOpenCreatePrototype() {
    setEditingPrototype(null);
    setPrototypeVersion(`v${prototypes.length + 1}.0`);
    setPrototypeTitle("");
    setPrototypeDesc("");
    setPrototypeStatus("planned");
    setPrototypeArtifactUrl("");
    setPrototypeArtifactPublicId("");
    setPrototypeArtifactType("");
    setShowPrototypeModal(true);
  }

  function handleOpenEditPrototype(p: ProjectPrototype) {
    setEditingPrototype(p);
    setPrototypeVersion(p.version);
    setPrototypeTitle(p.title);
    setPrototypeDesc(p.description || "");
    setPrototypeStatus(p.status);
    setPrototypeArtifactUrl(p.artifact_url || "");
    setPrototypeArtifactPublicId(p.artifact_public_id || "");
    setPrototypeArtifactType(p.artifact_type || "");
    setShowPrototypeModal(true);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!projectId || !e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingArtifact(true);
    try {
      const res = await universityService.uploadPrototypeArtifact(projectId, file);
      setPrototypeArtifactUrl(res.artifact_url);
      setPrototypeArtifactPublicId(res.artifact_public_id);
      setPrototypeArtifactType(res.artifact_type);
      triggerFeedback("success", "Artifact uploaded to cloud storage.");
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "File upload failed.");
    } finally {
      setUploadingArtifact(false);
    }
  }

  async function handleSavePrototype(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !prototypeTitle.trim()) return;
    setActionLoading(true);
    try {
      if (editingPrototype) {
        await universityService.updatePrototype(projectId, editingPrototype.id, {
          version: prototypeVersion.trim(),
          title: prototypeTitle.trim(),
          description: prototypeDesc.trim() || undefined,
          status: prototypeStatus,
          artifact_url: prototypeArtifactUrl.trim() || undefined,
          artifact_public_id: prototypeArtifactPublicId.trim() || undefined,
          artifact_type: prototypeArtifactType.trim() || undefined,
        });
        triggerFeedback("success", "Prototype iteration updated.");
      } else {
        await universityService.createPrototype(projectId, {
          version: prototypeVersion.trim(),
          title: prototypeTitle.trim(),
          description: prototypeDesc.trim() || undefined,
          status: prototypeStatus,
          artifact_url: prototypeArtifactUrl.trim() || undefined,
          artifact_public_id: prototypeArtifactPublicId.trim() || undefined,
          artifact_type: prototypeArtifactType.trim() || undefined,
        });
        triggerFeedback("success", "Prototype iteration added.");
      }
      setShowPrototypeModal(false);
      const [pList, act] = await Promise.all([
        universityService.getPrototypeList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPrototypes(pList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to save prototype.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePrototype(prototypeId: string) {
    if (!projectId) return;
    try {
      await universityService.deletePrototype(projectId, prototypeId);
      triggerFeedback("success", "Prototype iteration deleted.");
      const [pList, act] = await Promise.all([
        universityService.getPrototypeList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPrototypes(pList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to delete prototype.");
    }
  }

  // =========================================================================
  // Pilot Handlers
  // =========================================================================
  function handleOpenCreatePilot() {
    setEditingPilot(null);
    setPilotTitle("");
    setPilotLocation("");
    setPilotObjectives("");
    setPilotStartDate("");
    setPilotEndDate("");
    setPilotStatus("planned");
    setPilotObservations("");
    setPilotResults("");
    setPilotIssues("");
    setShowPilotModal(true);
  }

  function handleOpenEditPilot(pi: ProjectPilot) {
    setEditingPilot(pi);
    setPilotTitle(pi.title);
    setPilotLocation(pi.location);
    setPilotObjectives(pi.objectives);
    setPilotStartDate(pi.start_date || "");
    setPilotEndDate(pi.end_date || "");
    setPilotStatus(pi.status);
    setPilotObservations(pi.observations || "");
    setPilotResults(pi.results || "");
    setPilotIssues(pi.issues || "");
    setShowPilotModal(true);
  }

  async function handleSavePilot(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId || !pilotTitle.trim() || !pilotLocation.trim() || !pilotObjectives.trim()) return;
    setActionLoading(true);
    try {
      if (editingPilot) {
        await universityService.updatePilot(projectId, editingPilot.id, {
          title: pilotTitle.trim(),
          location: pilotLocation.trim(),
          objectives: pilotObjectives.trim(),
          start_date: pilotStartDate || undefined,
          end_date: pilotEndDate || undefined,
          status: pilotStatus,
          observations: pilotObservations.trim() || undefined,
          results: pilotResults.trim() || undefined,
          issues: pilotIssues.trim() || undefined,
        });
        triggerFeedback("success", "Pilot deployment record updated.");
      } else {
        await universityService.createPilot(projectId, {
          title: pilotTitle.trim(),
          location: pilotLocation.trim(),
          objectives: pilotObjectives.trim(),
          start_date: pilotStartDate || undefined,
          end_date: pilotEndDate || undefined,
          status: pilotStatus,
          observations: pilotObservations.trim() || undefined,
          results: pilotResults.trim() || undefined,
          issues: pilotIssues.trim() || undefined,
        });
        triggerFeedback("success", "Field pilot registered.");
      }
      setShowPilotModal(false);
      const [piList, act] = await Promise.all([
        universityService.getPilotList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPilots(piList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to save pilot record.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeletePilot(pilotId: string) {
    if (!projectId) return;
    try {
      await universityService.deletePilot(projectId, pilotId);
      triggerFeedback("success", "Pilot record removed.");
      const [piList, act] = await Promise.all([
        universityService.getPilotList(projectId),
        universityService.getProjectActivity(projectId),
      ]);
      setPilots(piList);
      setActivityLog(act);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to delete pilot record.");
    }
  }

  // =========================================================================
  // Deployment Readiness Handlers
  // =========================================================================
  function handleOpenEditReadiness() {
    if (readiness) {
      setReadinessStatus(readiness.readiness_status);
      setTechReadiness(readiness.technical_readiness || "");
      setInfraReqs(readiness.infrastructure_requirements || "");
      setEstCost(readiness.estimated_cost || "");
      setMaintenanceReqs(readiness.maintenance_requirements || "");
      setDeployReqs(readiness.deployment_requirements || "");
      setBlockers(readiness.blockers || "");
      setNotes(readiness.notes || "");
    }
    setShowReadinessModal(true);
  }

  async function handleSaveReadiness(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setActionLoading(true);
    try {
      const updated = await universityService.updateDeploymentReadiness(projectId, {
        readiness_status: readinessStatus,
        technical_readiness: techReadiness.trim() || undefined,
        infrastructure_requirements: infraReqs.trim() || undefined,
        estimated_cost: estCost.trim() || undefined,
        maintenance_requirements: maintenanceReqs.trim() || undefined,
        deployment_requirements: deployReqs.trim() || undefined,
        blockers: blockers.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setReadiness(updated);
      setShowReadinessModal(false);
      triggerFeedback("success", "Deployment readiness updated.");
      universityService.getProjectActivity(projectId).then(setActivityLog);
    } catch (err: any) {
      triggerFeedback("error", err?.response?.data?.detail || "Failed to update readiness.");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingState message="Opening project workspace..." />;

  if (!project) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-200">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-base font-extrabold text-[#071A33] mb-1">
          Project Workspace Not Found
        </h3>
        <p className="text-xs text-gray-500 max-w-sm mb-6">
          This project may have been deleted, or your authenticated university account does not have access permissions.
        </p>
        <Link
          to="/university/projects"
          className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
        >
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      {/* Header Banner */}
      <DashboardHeader
        backTo="/university/projects"
        backLabel="Back to Projects"
        badge={`Project Workspace · ID: ${project.id.slice(-6)}`}
        badgeColor="#7C3AED"
        title={project.name}
        subtitle={`Multidisciplinary Research Pipeline · ${project.challenge_title || "Civic Innovation"}`}
      >
        <div className="flex items-center gap-3">
          {/* Status lifecycle selector */}
          <div className="flex items-center gap-1.5 bg-white/80 backdrop-blur-xs border border-purple-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phase:</span>
            <select
              value={project.status}
              onChange={(e) => handlePhaseChange(e.target.value as ProjectStatus)}
              className="text-xs font-extrabold text-purple-700 bg-transparent border-0 focus:outline-hidden cursor-pointer"
            >
              {LIFECYCLE_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </DashboardHeader>

      {/* Progress Timeline Ribbon */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 overflow-x-auto shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center min-w-max">
          {LIFECYCLE_STAGES.map((s, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            return (
              <div key={s.key} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 text-xs font-extrabold transition-all ${
                      isDone
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : isCurrent
                        ? "border-purple-600 bg-purple-600 text-white shadow-xs scale-105"
                        : "border-gray-200 bg-slate-50 text-gray-400"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={15} /> : idx + 1}
                  </div>
                  <span
                    className={`text-[11px] font-bold whitespace-nowrap ${
                      isDone
                        ? "text-emerald-700"
                        : isCurrent
                        ? "text-purple-700"
                        : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < LIFECYCLE_STAGES.length - 1 && (
                  <div
                    className="w-12 sm:w-16 h-0.5 mx-2.5 transition-colors rounded-full"
                    style={{ background: isDone ? "#10B981" : "#E2E8F0" }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Workspace Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 px-6 sticky top-0 z-20 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1">
          {WORKSPACE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === tab
                  ? "border-purple-600 text-purple-700 bg-purple-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {tab}
              {tab === "Milestones" && milestones.length > 0 && ` (${milestones.length})`}
              {tab === "Research" && researchList.length > 0 && ` (${researchList.length})`}
              {tab === "Prototypes" && prototypes.length > 0 && ` (${prototypes.length})`}
              {tab === "Pilots" && pilots.length > 0 && ` (${pilots.length})`}
              {tab === "Industry Partnerships" && partnerships.length > 0 && ` (${partnerships.length})`}
              {tab === "Industry Mentors" && mentors.length > 0 && ` (${mentors.length})`}
              {tab === "Industry Resources" && resources.length > 0 && ` (${resources.length})`}
              {tab === "Industry Funding" && funding.length > 0 && ` (${funding.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Body */}
      <PageContainer>
        {/* Feedback Alert Toast */}
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
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ================================================================= */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Project Scope Card */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wider">
                    {project.challenge_category || "Civic Innovation"}
                  </span>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    <span>Created: <strong>{new Date(project.created_at).toLocaleDateString()}</strong></span>
                  </div>
                </div>

                <h2 className="text-xl font-black text-[#071A33] mb-2">{project.name}</h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {project.description || "No detailed scope or research methodology notes provided yet."}
                </p>

                {/* Milestone Progress Bar */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Flag size={14} className="text-purple-600" /> Milestone Completion
                    </span>
                    <span className="font-black text-purple-700">
                      {project.milestone_progress || 0}% ({project.completed_milestones_count || 0} of {project.milestones_count || 0} complete)
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
                      style={{ width: `${project.milestone_progress || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Linked Challenge Dossier Card */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-purple-900">
                    <Target size={16} className="text-purple-600" /> Linked Civic Challenge
                  </div>
                  <Link
                    to={`/university/challenges/${project.challenge_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-800"
                  >
                    Open Challenge Dossier <ExternalLink size={12} />
                  </Link>
                </div>
                <h3 className="text-base font-extrabold text-[#071A33]">{project.challenge_title}</h3>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>Category: <strong className="text-gray-700">{project.challenge_category}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600">Adopted by University</strong></span>
                </div>
              </div>

              {/* Multidisciplinary Team Roster */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#071A33]">
                    <Users size={16} className="text-indigo-600" /> Assigned Innovation Team: {project.team_name}
                  </div>
                  <Link
                    to="/university/teams"
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    Manage Roster <ChevronRight size={13} />
                  </Link>
                </div>

                {/* Faculty Mentors */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                    Faculty Mentors ({project.faculty_members?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.faculty_members?.map((f) => (
                      <div key={f.id} className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 text-xs">
                        <div className="font-extrabold text-gray-900">{f.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {f.designation || "Faculty Lead"} • {f.department || "Academic Department"}
                        </div>
                        {f.email && <div className="text-[11px] text-indigo-600 font-mono mt-1">{f.email}</div>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Researchers */}
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2.5">
                    Student Researchers ({project.student_members?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.student_members?.map((s) => (
                      <div key={s.id} className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 text-xs">
                        <div className="font-extrabold text-gray-900">{s.name}</div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          {s.degree || "Student Researcher"} • {s.department || "Engineering"}
                        </div>
                        {s.skills && s.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {s.skills.slice(0, 3).map((sk, i) => (
                              <span
                                key={i}
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
            </div>

            {/* Sidebar Overview Cards */}
            <div className="space-y-6">
              {/* Quick Pipeline Status */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Pipeline Health & Readiness
                </h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    <span className="font-semibold text-gray-600">Solution Proposal</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        solution ? SOLUTION_STATUS_BADGE[solution.status]?.cls : "bg-slate-100 text-gray-500 border-slate-200"
                      }`}
                    >
                      {solution ? SOLUTION_STATUS_BADGE[solution.status]?.label : "Not Drafted"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    <span className="font-semibold text-gray-600">Prototypes Built</span>
                    <span className="font-extrabold text-purple-700">
                      {prototypes.length} {prototypes.length === 1 ? "iteration" : "iterations"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    <span className="font-semibold text-gray-600">Field Pilots</span>
                    <span className="font-extrabold text-orange-600">
                      {pilots.length} {pilots.length === 1 ? "deployment" : "deployments"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs p-3 bg-slate-50 rounded-2xl border border-gray-100">
                    <span className="font-semibold text-gray-600">Deployment Status</span>
                    <span
                      className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        readiness ? READINESS_BADGE[readiness.readiness_status]?.cls : "bg-slate-100 text-gray-500 border-slate-200"
                      }`}
                    >
                      {readiness ? READINESS_BADGE[readiness.readiness_status]?.label : "Not Evaluated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline Dates Card */}
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-3 text-xs">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Timeline Constraints
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Initiation Date:</span>
                  <strong className="text-gray-800">{project.start_date || "Not specified"}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Target Deployment:</span>
                  <strong className="text-gray-800">{project.target_date || "Not specified"}</strong>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Last Synced:</span>
                  <strong className="text-gray-800">{new Date(project.updated_at).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: MILESTONES */}
        {/* ================================================================= */}
        {activeTab === "Milestones" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Project Milestones</h3>
                <p className="text-xs text-gray-500">
                  Track sprint objectives and field trials. Overall progress is calculated from completed milestones.
                </p>
              </div>
              <button
                onClick={handleOpenCreateMilestone}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <Plus size={14} /> Add Milestone
              </button>
            </div>

            {milestones.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <Flag size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No milestones recorded</h4>
                <p className="text-xs text-gray-500">
                  Establish trackable targets like solution design signoff, breadboard testing, or citizen trial readiness.
                </p>
                <button
                  onClick={handleOpenCreateMilestone}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                >
                  Create first milestone
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {milestones.map((m) => {
                  const isDone = m.status === "completed";
                  const badge = MILESTONE_STATUS_BADGE[m.status] || MILESTONE_STATUS_BADGE.pending;
                  return (
                    <div
                      key={m.id}
                      className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 shadow-xs hover:border-purple-200 transition-all"
                    >
                      <div className="flex items-start gap-3.5">
                        <button
                          onClick={() => handleToggleMilestoneStatus(m)}
                          className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isDone
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-300 hover:border-purple-500 bg-white"
                          }`}
                        >
                          {isDone && <CheckCircle2 size={14} />}
                        </button>
                        <div className="space-y-1">
                          <h4
                            className={`text-sm font-extrabold ${
                              isDone ? "text-gray-400 line-through" : "text-[#071A33]"
                            }`}
                          >
                            {m.title}
                          </h4>
                          {m.description && (
                            <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                          )}
                          <div className="flex items-center gap-3 pt-1 text-[11px] text-gray-400">
                            {m.due_date && (
                              <span className="flex items-center gap-1 text-gray-600">
                                <Calendar size={12} /> Due: {m.due_date}
                              </span>
                            )}
                            {m.completed_at && (
                              <span className="text-emerald-700 font-semibold">
                                Completed on {new Date(m.completed_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${badge.cls}`}>
                          {badge.label}
                        </span>
                        <button
                          onClick={() => handleOpenEditMilestone(m)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteMilestone(m.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: RESEARCH */}
        {/* ================================================================= */}
        {activeTab === "Research" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Scientific & Field Research</h3>
                <p className="text-xs text-gray-500">
                  Document baseline problem studies, sensor calibration reports, and technical methodologies.
                </p>
              </div>
              <button
                onClick={handleOpenCreateResearch}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <Plus size={14} /> Add Research Entry
              </button>
            </div>

            {researchList.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <BookOpen size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No research entries published</h4>
                <p className="text-xs text-gray-500">
                  Faculty and student investigators can post literature reviews, empirical datasets, and investigative methodologies here.
                </p>
                <button
                  onClick={handleOpenCreateResearch}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                >
                  Publish first research entry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {researchList.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-base text-[#071A33]">{r.title}</h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditResearch(r)}
                            className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteResearch(r.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {r.description && <p className="text-xs text-gray-600">{r.description}</p>}

                      {r.methodology && (
                        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Methodology
                          </span>
                          <p className="text-gray-700 leading-relaxed">{r.methodology}</p>
                        </div>
                      )}

                      {r.findings && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-3 space-y-1 text-xs">
                          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
                            Key Findings & Empirical Data
                          </span>
                          <p className="text-purple-950 leading-relaxed font-medium">{r.findings}</p>
                        </div>
                      )}

                      {r.references && r.references.length > 0 && (
                        <div className="text-xs text-gray-500 pt-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Citations & Papers
                          </span>
                          <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-indigo-700 font-mono">
                            {r.references.map((ref, idx) => (
                              <li key={idx} className="line-clamp-1">{ref}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                      <span>Indexed: {new Date(r.created_at).toLocaleDateString()}</span>
                      {r.created_by && <span>Author ID: {r.created_by.slice(-6)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: SOLUTION PROPOSAL */}
        {/* ================================================================= */}
        {activeTab === "Solution" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Solution Architecture Proposal</h3>
                <p className="text-xs text-gray-500">
                  Detailed technical specification bridging civic problem definitions with engineering deliverables.
                </p>
              </div>
              <button
                onClick={handleOpenEditSolution}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <Edit3 size={14} /> {solution ? "Edit Proposal" : "Draft Proposal"}
              </button>
            </div>

            {!solution ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <FileCheck size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No solution proposal drafted</h4>
                <p className="text-xs text-gray-500">
                  Formulate a formal technical approach, required hardware/software resources, risks, and expected societal outcomes.
                </p>
                <button
                  onClick={handleOpenEditSolution}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                >
                  Draft solution architecture
                </button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-5">
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Formal Architectural Proposal
                    </span>
                    <h2 className="text-lg font-black text-[#071A33]">{solution.title}</h2>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-3 py-1 rounded-full border self-start sm:self-center ${
                      SOLUTION_STATUS_BADGE[solution.status]?.cls || "bg-slate-100 text-gray-700"
                    }`}
                  >
                    {SOLUTION_STATUS_BADGE[solution.status]?.label || solution.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 bg-slate-50 border border-gray-100 rounded-2xl p-5">
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider block">
                      Problem Statement
                    </span>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {solution.problem_statement}
                    </p>
                  </div>

                  <div className="space-y-2 bg-purple-50/50 border border-purple-100 rounded-2xl p-5">
                    <span className="text-[11px] font-extrabold text-purple-800 uppercase tracking-wider block">
                      Proposed Solution Architecture
                    </span>
                    <p className="text-xs text-purple-950 leading-relaxed font-medium whitespace-pre-line">
                      {solution.proposed_solution}
                    </p>
                  </div>
                </div>

                {solution.technical_approach && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
                      Technical Approach & Engineering Methodology
                    </span>
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-5 text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                      {solution.technical_approach}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  {solution.expected_outcomes && (
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Expected Outcomes
                      </span>
                      <p className="text-gray-700">{solution.expected_outcomes}</p>
                    </div>
                  )}

                  {solution.required_resources && (
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Required Resources
                      </span>
                      <p className="text-gray-700">{solution.required_resources}</p>
                    </div>
                  )}

                  {(solution.risks || solution.constraints) && (
                    <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-xs">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Risks & Constraints
                      </span>
                      <p className="text-gray-700">{solution.risks || solution.constraints}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Drafted: {new Date(solution.created_at).toLocaleDateString()}</span>
                  <span>Last Modified: {new Date(solution.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: PROTOTYPES */}
        {/* ================================================================= */}
        {activeTab === "Prototypes" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Prototype Iterations & Artifacts</h3>
                <p className="text-xs text-gray-500">
                  Version-controlled hardware schematics, software builds, and lab test reports stored in Cloudinary.
                </p>
              </div>
              <button
                onClick={handleOpenCreatePrototype}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <Plus size={14} /> Add Prototype Iteration
              </button>
            </div>

            {prototypes.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <Code2 size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No prototype iterations registered</h4>
                <p className="text-xs text-gray-500">
                  Upload initial CAD files, circuit diagrams, firmware repositories, or testbench benchmark sheets.
                </p>
                <button
                  onClick={handleOpenCreatePrototype}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                >
                  Add v1.0 build
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {prototypes.map((p) => {
                  const badge = PROTOTYPE_STATUS_BADGE[p.status] || PROTOTYPE_STATUS_BADGE.planned;
                  return (
                    <div
                      key={p.id}
                      className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-mono">
                            {p.version}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                              {badge.label}
                            </span>
                            <button
                              onClick={() => handleOpenEditPrototype(p)}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeletePrototype(p.id)}
                              className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-extrabold text-base text-[#071A33]">{p.title}</h4>
                        {p.description && <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>}

                        {p.artifact_url && (
                          <div className="p-3 bg-slate-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs">
                            <span className="text-gray-500 font-medium truncate max-w-[200px]">
                              Artifact ({p.artifact_type || "asset"})
                            </span>
                            <a
                              href={p.artifact_url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold text-purple-700 hover:text-purple-900 inline-flex items-center gap-1"
                            >
                              View Cloud Asset <ExternalLink size={12} />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                        <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                        {p.created_by && <span>Engineer ID: {p.created_by.slice(-6)}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: PILOTS */}
        {/* ================================================================= */}
        {activeTab === "Pilots" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Municipal & Field Pilots</h3>
                <p className="text-xs text-gray-500">
                  Conduct real-world trials with neighborhood sensors, municipal water filtration tests, and traffic testbeds.
                </p>
              </div>
              <button
                onClick={handleOpenCreatePilot}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <Plus size={14} /> Register Field Pilot
              </button>
            </div>

            {pilots.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <MapPin size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No field pilots deployed</h4>
                <p className="text-xs text-gray-500">
                  Register a physical location testbed to log empirical field readings, environmental observations, and trial bottlenecks.
                </p>
                <button
                  onClick={handleOpenCreatePilot}
                  className="mt-2 text-xs font-bold text-purple-600 hover:text-purple-800 underline"
                >
                  Register first pilot deployment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {pilots.map((pi) => {
                  const badge = PILOT_STATUS_BADGE[pi.status] || PILOT_STATUS_BADGE.planned;
                  return (
                    <div
                      key={pi.id}
                      className="bg-white border border-gray-200/90 rounded-3xl p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-extrabold text-[#071A33]">{pi.title}</h4>
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1 text-gray-700 font-semibold">
                              <MapPin size={13} className="text-rose-500" /> {pi.location}
                            </span>
                            {(pi.start_date || pi.end_date) && (
                              <span>• Window: {pi.start_date || "TBD"} to {pi.end_date || "TBD"}</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end sm:self-center">
                          <button
                            onClick={() => handleOpenEditPilot(pi)}
                            className="p-2 text-gray-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePilot(pi.id)}
                            className="p-2 text-gray-400 hover:text-rose-600 rounded-xl hover:bg-slate-100"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-700">
                        <span className="font-bold text-gray-400 uppercase tracking-wider block text-[10px]">
                          Trial Objectives
                        </span>
                        <p className="leading-relaxed">{pi.objectives}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                        {pi.observations && (
                          <div className="p-3 bg-slate-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                              Field Observations
                            </span>
                            <p className="text-gray-700">{pi.observations}</p>
                          </div>
                        )}
                        {pi.results && (
                          <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl text-xs space-y-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                              Trial Results
                            </span>
                            <p className="text-emerald-950 font-medium">{pi.results}</p>
                          </div>
                        )}
                        {pi.issues && (
                          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-xs space-y-1">
                            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                              Issues & Bottlenecks
                            </span>
                            <p className="text-amber-950">{pi.issues}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 7: DEPLOYMENT READINESS */}
        {/* ================================================================= */}
        {activeTab === "Deployment Readiness" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Municipal Deployment Assessment</h3>
                <p className="text-xs text-gray-500">
                  Assess operational, infrastructural, and economic prerequisites for handing off the solution to municipal or community operators.
                </p>
              </div>
              <button
                onClick={handleOpenEditReadiness}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs"
              >
                <ShieldCheck size={14} /> Update Assessment
              </button>
            </div>

            <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Readiness Determination
                </span>
                <span
                  className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                    readiness ? READINESS_BADGE[readiness.readiness_status]?.cls : "bg-slate-100 text-gray-700"
                  }`}
                >
                  {readiness ? READINESS_BADGE[readiness.readiness_status]?.label : "Not Evaluated"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider block text-[11px]">
                    Technical Readiness Level
                  </span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {readiness?.technical_readiness || "No technical readiness narrative specified yet."}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider block text-[11px]">
                    Infrastructure Requirements
                  </span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {readiness?.infrastructure_requirements || "No infrastructure prerequisites recorded."}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider block text-[11px]">
                    Estimated Deployment & Unit Cost
                  </span>
                  <p className="text-gray-700 leading-relaxed">
                    {readiness?.estimated_cost || "Cost estimation pending final bill of materials."}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider block text-[11px]">
                    Maintenance & Operating Procedures
                  </span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {readiness?.maintenance_requirements || "Preventative maintenance guidelines not yet formulated."}
                  </p>
                </div>

                <div className="p-5 bg-slate-50 border border-gray-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-gray-500 uppercase tracking-wider block text-[11px]">
                    Critical Deployment Dependencies
                  </span>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {readiness?.deployment_requirements || "No regulatory or municipal agreements listed."}
                  </p>
                </div>

                <div className="p-5 bg-amber-50/50 border border-amber-100 rounded-2xl space-y-2 text-xs">
                  <span className="font-extrabold text-amber-800 uppercase tracking-wider block text-[11px]">
                    Active Blockers
                  </span>
                  <p className="text-amber-950 leading-relaxed whitespace-pre-line font-medium">
                    {readiness?.blockers || "No blockers currently flagging the rollout."}
                  </p>
                </div>
              </div>

              {readiness?.notes && (
                <div className="pt-2 text-xs text-gray-600">
                  <span className="font-bold text-gray-400 uppercase tracking-wider block text-[10px] mb-1">
                    Operational Notes
                  </span>
                  <p className="bg-slate-50 border border-gray-100 rounded-2xl p-4 leading-relaxed">
                    {readiness.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: INDUSTRY PARTNERSHIPS */}
        {/* ================================================================= */}
        {activeTab === "Industry Partnerships" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Industry Partnerships</h3>
                <p className="text-xs text-gray-500">
                  Review expressions of interest from verified corporate innovators and industry leaders.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Total Requests:</span>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  {partnerships.length}
                </span>
              </div>
            </div>

            {partnerships.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Handshake size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#071A33]">No Partnership Requests Yet</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  When corporate partners discover this project and submit a formal partnership request, their profile and message will appear here for your review.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {partnerships.map((req) => {
                  const isPending = req.status === "pending";
                  const isAccepted = req.status === "accepted";
                  const isRejected = req.status === "rejected";
                  const isWithdrawn = req.status === "withdrawn";

                  return (
                    <div
                      key={req.id}
                      className={`bg-white border rounded-3xl p-6 sm:p-7 shadow-xs transition-all ${
                        isAccepted
                          ? "border-emerald-200 ring-2 ring-emerald-500/10"
                          : isPending
                          ? "border-amber-200"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-base font-extrabold text-[#071A33]">{req.company_name}</h4>
                            <span
                              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                                isAccepted
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : isPending
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : isRejected
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : "bg-gray-100 text-gray-600 border border-gray-200"
                              }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            {req.industry_sector && (
                              <span className="font-semibold text-gray-700">{req.industry_sector}</span>
                            )}
                            {req.headquarters_location && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <MapPin size={12} />
                                  {req.headquarters_location}
                                </span>
                              </>
                            )}
                            {req.website && (
                              <>
                                <span>•</span>
                                <a
                                  href={req.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline inline-flex items-center gap-0.5"
                                >
                                  Website <ExternalLink size={10} />
                                </a>
                              </>
                            )}
                            <span>•</span>
                            <span className="text-gray-400">
                              Requested {new Date(req.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {isPending && (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleAcceptPartnership(req.id)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={14} />
                              Accept Partnership
                            </button>
                            <button
                              onClick={() => handleRejectPartnership(req.id)}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 cursor-pointer"
                            >
                              Decline
                            </button>
                          </div>
                        )}

                        {isAccepted && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0">
                            <CheckCircle2 size={14} className="text-emerald-600" />
                            Active Partner · Mentorship Enabled
                          </div>
                        )}
                      </div>

                      {/* Partnership Message */}
                      {req.message && (
                        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 mb-4">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                            Partnership Proposal Message
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed italic whitespace-pre-line">
                            "{req.message}"
                          </p>
                        </div>
                      )}

                      {/* Company Capability Profile */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 text-xs border-t border-gray-100">
                        {req.expertise && req.expertise.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Expertise
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {req.expertise.map((exp, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-medium">
                                  {exp}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {req.technologies && req.technologies.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Technologies
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {req.technologies.map((t, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {req.capabilities && req.capabilities.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Capabilities
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {req.capabilities.map((c, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium">
                                  {c}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {req.collaboration_interests && req.collaboration_interests.length > 0 && (
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Collaboration Interests
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {req.collaboration_interests.map((ci, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-medium">
                                  {ci}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: INDUSTRY MENTORS */}
        {/* ================================================================= */}
        {activeTab === "Industry Mentors" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-extrabold text-[#071A33]">Corporate Technical Mentors</h3>
                <p className="text-xs text-gray-500">
                  Domain specialists and corporate engineers assigned by accepted industry partners.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400">Assigned Mentors:</span>
                <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200">
                  {mentors.length}
                </span>
              </div>
            </div>

            {mentors.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <Users size={24} />
                </div>
                <h4 className="text-sm font-bold text-[#071A33]">No Industry Mentors Assigned</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {partnerships.some((p) => p.status === "accepted")
                    ? "Your accepted industry partner has not yet assigned a technical specialist to this project. Proactive mentorship engagements will appear here once proposed."
                    : "Corporate technical mentorship requires an accepted industry partnership. Accept incoming requests in the Industry Partnerships tab to collaborate with industry specialists."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentors.map((m) => (
                  <div
                    key={m.id}
                    className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-[#071A33]">{m.expert_name}</h4>
                          <p className="text-xs text-purple-700 font-semibold">{m.expert_designation}</p>
                          <p className="text-xs text-gray-500 font-medium">{m.company_name || "Industry Partner"}</p>
                        </div>
                        <span
                          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            m.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : m.status === "proposed"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : m.status === "completed"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-gray-100 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>

                      {m.objectives && (
                        <div className="bg-slate-50 border border-gray-100 rounded-2xl p-3.5 mb-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400 block mb-1">
                            Mentorship Objectives
                          </span>
                          <p className="text-xs text-gray-700 leading-relaxed">{m.objectives}</p>
                        </div>
                      )}

                      {m.focus_areas && m.focus_areas.length > 0 && (
                        <div className="mb-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Focus Areas
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.focus_areas.map((fa, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-medium">
                                {fa}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {m.skills && m.skills.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Specialist Skills
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {m.skills.map((sk, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Assigned {new Date(m.created_at).toLocaleDateString()}</span>
                      {m.expert_email && <span className="text-gray-500 font-medium">{m.expert_email}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: INDUSTRY RESOURCES */}
        {/* ================================================================= */}
        {activeTab === "Industry Resources" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[#071A33]">Industry Resources & Technical Support</h3>
              <p className="text-xs text-gray-500">
                Technology access, specialized equipment, datasets, software licenses, and infrastructure pledged by accepted industry partners.
              </p>
            </div>

            {resources.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <Package size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No industry resources contributed yet</h4>
                <p className="text-xs text-gray-500">
                  Accepted industry partners can propose technology, datasets, equipment, and technical services directly to support your project workflow.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resources.map((res) => {
                  const statusColors: Record<string, string> = {
                    proposed: "bg-amber-50 text-amber-700 border-amber-200",
                    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    rejected: "bg-rose-50 text-rose-700 border-rose-200",
                    provided: "bg-blue-50 text-blue-700 border-blue-200",
                    withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
                  };

                  return (
                    <div
                      key={res.id}
                      className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                              {res.resource_type.replace("_", " ")}
                            </span>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                statusColors[res.status] || "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                            >
                              {res.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {new Date(res.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#071A33] mb-1">{res.title}</h4>

                        {res.company_name && (
                          <p className="text-xs font-semibold text-purple-700 mb-2">
                            Partner: {res.company_name} {res.industry_sector && `· ${res.industry_sector}`}
                          </p>
                        )}

                        <p className="text-xs text-gray-600 mb-3 whitespace-pre-wrap">{res.description}</p>

                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-3">
                          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                            Scope / Quantity
                          </p>
                          <p className="text-xs font-semibold text-gray-800">{res.quantity_or_scope}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          Updated: {new Date(res.updated_at).toLocaleDateString()}
                        </span>
                        {res.status === "proposed" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectResource(res.id)}
                              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleApproveResource(res.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                        {res.status === "approved" && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Approved by University
                          </span>
                        )}
                        {res.status === "provided" && (
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                            Provided to Project
                          </span>
                        )}
                        {res.status === "rejected" && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                            Proposal Declined
                          </span>
                        )}
                        {res.status === "withdrawn" && (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                            Withdrawn by Partner
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB: INDUSTRY FUNDING */}
        {/* ================================================================= */}
        {activeTab === "Industry Funding" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[#071A33]">Industry Funding & Sponsorship Proposals</h3>
              <p className="text-xs text-gray-500">
                Grant funding, sponsorship packages, and CSR backing proposed by verified corporate partners.
              </p>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
              <p className="text-xs text-indigo-900 leading-relaxed">
                <strong>Proposal Governance:</strong> UniBridge records research grants and corporate sponsorship commitments. Formal funding agreements and disbursement clearances follow standard university research administration protocols.
              </p>
            </div>

            {funding.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <DollarSign size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No funding proposals submitted yet</h4>
                <p className="text-xs text-gray-500">
                  When accepted corporate partners commit financial backing or research grants, their proposals will appear here for your review and approval.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {funding.map((fund) => {
                  const statusColors: Record<string, string> = {
                    proposed: "bg-amber-50 text-amber-700 border-amber-200",
                    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                    rejected: "bg-rose-50 text-rose-700 border-rose-200",
                    withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
                    disbursed: "bg-purple-50 text-purple-700 border-purple-200",
                  };

                  return (
                    <div
                      key={fund.id}
                      className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                              {fund.funding_type.replace("_", " ")}
                            </span>
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                                statusColors[fund.status] || "bg-gray-50 text-gray-600 border-gray-200"
                              }`}
                            >
                              {fund.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            {new Date(fund.proposed_at).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="my-2">
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Proposed Amount</p>
                          <p className="text-2xl font-black text-purple-700 tracking-tight">
                            {fund.currency} {fund.amount.toLocaleString()}
                          </p>
                        </div>

                        <h4 className="text-sm font-bold text-[#071A33] mb-1">{fund.title}</h4>

                        {fund.company_name && (
                          <p className="text-xs font-semibold text-purple-700 mb-2">
                            Partner: {fund.company_name} {fund.industry_sector && `· ${fund.industry_sector}`}
                          </p>
                        )}

                        <p className="text-xs text-gray-600 mb-3 whitespace-pre-wrap">{fund.description}</p>
                      </div>

                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[11px] text-gray-400">
                          Updated: {new Date(fund.updated_at).toLocaleDateString()}
                        </span>
                        {fund.status === "proposed" && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRejectFunding(fund.id)}
                              className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleApproveFunding(fund.id)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        )}
                        {fund.status === "approved" && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                            Approved by University
                          </span>
                        )}
                        {fund.status === "disbursed" && (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                            Funding Disbursed
                          </span>
                        )}
                        {fund.status === "rejected" && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                            Proposal Declined
                          </span>
                        )}
                        {fund.status === "withdrawn" && (
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                            Withdrawn by Partner
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 8: ACTIVITY */}
        {/* ================================================================= */}
        {activeTab === "Activity" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-extrabold text-[#071A33]">Project Activity Audit</h3>
              <p className="text-xs text-gray-500">
                Live audit trail recording milestones, prototype uploads, research additions, and phase transitions.
              </p>
            </div>

            {activityLog.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-md mx-auto space-y-3">
                <Activity size={32} className="text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-[#071A33]">No recorded project events</h4>
                <p className="text-xs text-gray-500">
                  Real audit entries will populate automatically as your team modifies milestones, prototypes, and field pilots.
                </p>
              </div>
            ) : (
              <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                  {activityLog.map((act) => (
                    <div key={act.id} className="relative">
                      <div className="absolute -left-[27px] top-0.5 w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-2xs" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#071A33] capitalize">
                            {act.action.replace("_", " ")}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {new Date(act.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{act.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: CREATE / EDIT MILESTONE */}
        {/* ================================================================= */}
        {showMilestoneModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  {editingMilestone ? "Edit Milestone" : "Add Project Milestone"}
                </h3>
                <button
                  onClick={() => setShowMilestoneModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveMilestone} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={milestoneTitle}
                    onChange={(e) => setMilestoneTitle(e.target.value)}
                    placeholder="e.g., Finalize LoRaWAN transceiver schematic"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={milestoneDesc}
                    onChange={(e) => setMilestoneDesc(e.target.value)}
                    placeholder="Deliverables and verification criteria..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={milestoneStatus}
                      onChange={(e) => setMilestoneStatus(e.target.value as MilestoneStatus)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={milestoneDueDate}
                      onChange={(e) => setMilestoneDueDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowMilestoneModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Milestone"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: CREATE / EDIT RESEARCH */}
        {/* ================================================================= */}
        {showResearchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  {editingResearch ? "Edit Research Entry" : "Add Research Findings"}
                </h3>
                <button
                  onClick={() => setShowResearchModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveResearch} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Research Topic / Paper Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={researchTitle}
                    onChange={(e) => setResearchTitle(e.target.value)}
                    placeholder="e.g., Optical Particle Size Analysis for Urban Runoff"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Abstract / Overview</label>
                  <textarea
                    rows={2}
                    value={researchDesc}
                    onChange={(e) => setResearchDesc(e.target.value)}
                    placeholder="Executive abstract of research..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Methodology</label>
                  <textarea
                    rows={3}
                    value={researchMethodology}
                    onChange={(e) => setResearchMethodology(e.target.value)}
                    placeholder="Sensors deployed, sampling frequencies, lab apparatus used..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Key Findings & Observations
                  </label>
                  <textarea
                    rows={3}
                    value={researchFindings}
                    onChange={(e) => setResearchFindings(e.target.value)}
                    placeholder="Empirical measurements, statistical correlations, critical anomalies..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    References & DOI Citations (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={researchRefs}
                    onChange={(e) => setResearchRefs(e.target.value)}
                    placeholder="doi:10.1109/..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono text-gray-900"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowResearchModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Research"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: DRAFT / EDIT SOLUTION PROPOSAL */}
        {/* ================================================================= */}
        {showSolutionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  Solution Architecture Proposal
                </h3>
                <button
                  onClick={() => setShowSolutionModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveSolution} className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Proposal Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={solutionTitle}
                      onChange={(e) => setSolutionTitle(e.target.value)}
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Review Status</label>
                    <select
                      value={solutionStatus}
                      onChange={(e) => setSolutionStatus(e.target.value as SolutionStatus)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    >
                      <option value="draft">Draft Proposal</option>
                      <option value="under_review">Under Faculty Review</option>
                      <option value="approved">Approved</option>
                      <option value="revision_required">Revision Required</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Problem Statement <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={solutionProblem}
                    onChange={(e) => setSolutionProblem(e.target.value)}
                    placeholder="Specific civic failure, citizen bottleneck, or infrastructure vulnerability..."
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Proposed Solution Architecture <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={solutionProposed}
                    onChange={(e) => setSolutionProposed(e.target.value)}
                    placeholder="Engineering design, component topology, integration workflow..."
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Technical Approach</label>
                  <textarea
                    rows={2}
                    value={solutionTech}
                    onChange={(e) => setSolutionTech(e.target.value)}
                    placeholder="Algorithms, materials selection, protocols..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Expected Outcomes</label>
                    <textarea
                      rows={2}
                      value={solutionOutcomes}
                      onChange={(e) => setSolutionOutcomes(e.target.value)}
                      placeholder="Measurable efficiency gains..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Required Resources</label>
                    <textarea
                      rows={2}
                      value={solutionResources}
                      onChange={(e) => setSolutionResources(e.target.value)}
                      placeholder="Hardware, sensors, cloud compute..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowSolutionModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Proposal"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: CREATE / EDIT PROTOTYPE */}
        {/* ================================================================= */}
        {showPrototypeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  {editingPrototype ? "Edit Prototype Iteration" : "Register Prototype Iteration"}
                </h3>
                <button
                  onClick={() => setShowPrototypeModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePrototype} className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Version</label>
                    <input
                      type="text"
                      value={prototypeVersion}
                      onChange={(e) => setPrototypeVersion(e.target.value)}
                      required
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 font-mono text-gray-900"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={prototypeStatus}
                      onChange={(e) => setPrototypeStatus(e.target.value as PrototypeStatus)}
                      className="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_development">In Development</option>
                      <option value="ready">Build Ready</option>
                      <option value="tested">Bench Tested</option>
                      <option value="rejected">Iteration Shelved</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Iteration Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={prototypeTitle}
                    onChange={(e) => setPrototypeTitle(e.target.value)}
                    placeholder="e.g., Breadboard LoRaWAN Subsystem"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={prototypeDesc}
                    onChange={(e) => setPrototypeDesc(e.target.value)}
                    placeholder="Circuit layout, firmware revision, or mechanical tolerances..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                {/* Cloudinary Artifact Upload */}
                <div className="p-4 bg-slate-50 border border-gray-200 rounded-2xl space-y-2">
                  <label className="block text-xs font-bold text-gray-700">
                    Upload Technical Artifact / Schematic (Cloudinary)
                  </label>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="block w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                  {uploadingArtifact && (
                    <p className="text-[11px] text-purple-600 font-semibold animate-pulse">
                      Uploading to cloud storage...
                    </p>
                  )}
                  {prototypeArtifactUrl && (
                    <div className="text-[11px] text-emerald-700 font-mono break-all pt-1">
                      Uploaded: {prototypeArtifactUrl}
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPrototypeModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || uploadingArtifact}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Prototype"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: CREATE / EDIT PILOT */}
        {/* ================================================================= */}
        {showPilotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  {editingPilot ? "Edit Pilot Deployment" : "Register Field Pilot Deployment"}
                </h3>
                <button
                  onClick={() => setShowPilotModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSavePilot} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Pilot Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={pilotTitle}
                    onChange={(e) => setPilotTitle(e.target.value)}
                    placeholder="e.g., Ward 14 Drainage Junction Trial"
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Field Test Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={pilotLocation}
                      onChange={(e) => setPilotLocation(e.target.value)}
                      placeholder="District / GPS / Facility"
                      required
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select
                      value={pilotStatus}
                      onChange={(e) => setPilotStatus(e.target.value as PilotStatus)}
                      className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20"
                    >
                      <option value="planned">Planned</option>
                      <option value="preparation">Site Preparation</option>
                      <option value="active">Active in Field</option>
                      <option value="completed">Trial Completed</option>
                      <option value="paused">Temporarily Paused</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={pilotStartDate}
                      onChange={(e) => setPilotStartDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={pilotEndDate}
                      onChange={(e) => setPilotEndDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Objectives <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={pilotObjectives}
                    onChange={(e) => setPilotObjectives(e.target.value)}
                    placeholder="Specific test criteria to validate in the field..."
                    required
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Observations</label>
                  <textarea
                    rows={2}
                    value={pilotObservations}
                    onChange={(e) => setPilotObservations(e.target.value)}
                    placeholder="Field conditions, weather variations, citizen interactions..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Trial Results</label>
                  <textarea
                    rows={2}
                    value={pilotResults}
                    onChange={(e) => setPilotResults(e.target.value)}
                    placeholder="Collected sensor data, throughput, accuracy..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Issues & Blockers</label>
                  <textarea
                    rows={2}
                    value={pilotIssues}
                    onChange={(e) => setPilotIssues(e.target.value)}
                    placeholder="Hardware faults, network latency, vandalism..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPilotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Pilot"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* MODAL: EDIT DEPLOYMENT READINESS */}
        {/* ================================================================= */}
        {showReadinessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  Update Municipal Deployment Assessment
                </h3>
                <button
                  onClick={() => setShowReadinessModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-slate-100"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveReadiness} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Readiness Level</label>
                  <select
                    value={readinessStatus}
                    onChange={(e) => setReadinessStatus(e.target.value as ReadinessStatus)}
                    className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="not_ready">Not Ready</option>
                    <option value="assessment">Under Readiness Assessment</option>
                    <option value="ready_for_deployment">Ready for Deployment</option>
                    <option value="deployment_in_progress">Deployment in Progress</option>
                    <option value="deployed">Fully Deployed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Technical Readiness</label>
                  <textarea
                    rows={2}
                    value={techReadiness}
                    onChange={(e) => setTechReadiness(e.target.value)}
                    placeholder="TRL evaluation and hardware stability..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Infrastructure Requirements
                  </label>
                  <textarea
                    rows={2}
                    value={infraReqs}
                    onChange={(e) => setInfraReqs(e.target.value)}
                    placeholder="Grid power, fiber access, cellular backhaul..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Estimated Production & Maintenance Cost
                  </label>
                  <input
                    type="text"
                    value={estCost}
                    onChange={(e) => setEstCost(e.target.value)}
                    placeholder="e.g., $450/node installation, $50/yr maintenance"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Maintenance & Operating Manuals
                  </label>
                  <textarea
                    rows={2}
                    value={maintenanceReqs}
                    onChange={(e) => setMaintenanceReqs(e.target.value)}
                    placeholder="Battery replacement cycles, sensor cleaning intervals..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Active Blockers</label>
                  <textarea
                    rows={2}
                    value={blockers}
                    onChange={(e) => setBlockers(e.target.value)}
                    placeholder="Permitting delays, component supply constraints..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Additional context for stakeholders..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500/20 text-gray-900"
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowReadinessModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 shadow-xs"
                  >
                    {actionLoading ? "Saving..." : "Save Assessment"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
