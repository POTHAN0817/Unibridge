import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  GraduationCap,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Milestone,
  Cpu,
  Coins,
  Activity,
  FileText,
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  Layers,
  Flag,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import { GovernmentProjectDossier } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [dossier, setDossier] = useState<GovernmentProjectDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!projectId) return;
      try {
        setLoading(true);
        setError(null);
        const data = await governmentService.getProjectDossier(projectId);
        setDossier(data);
      } catch (err: any) {
        console.error("Failed to load project dossier", err);
        setError("Unable to retrieve university project dossier from MongoDB.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  if (loading) {
    return <LoadingState message="Compiling official project oversight dossier..." />;
  }

  if (error || !dossier) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <PageContainer>
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
            <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-black text-slate-900 mb-2">Project Dossier Unavailable</h2>
            <p className="text-xs text-slate-500 mb-6">{error || "Project record could not be found."}</p>
            <Link
              to="/government/projects"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Back to Project Pipeline
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const {
    overview,
    university,
    linked_challenge,
    team,
    milestones,
    research,
    solution,
    prototypes,
    pilots,
    deployment_readiness,
    industry_collaboration,
    recent_activity,
  } = dossier;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        backTo="/government/projects"
        backLabel="Back to Projects"
        badge={`Project Dossier · ${overview.project_id.slice(-8).toUpperCase()}`}
        badgeColor="#10B981"
        title={overview.name}
        subtitle={`Executing Institution: ${university.name}`}
      >
        <div className="flex items-center gap-2">
          <Link
            to={`/government/actions?new_target_type=project&new_target_id=${overview.project_id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            <Flag size={14} />
            Create Administrative Action
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Stage & Meta Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status:</span>
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase">
              {overview.status.replace("_", " ")}
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-600 font-medium">
              Lifecycle Stage: <strong className="text-slate-900">{overview.lifecycle_stage.replace("_", " ")}</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            {overview.start_date && (
              <span>
                Start: <strong className="text-slate-800 font-mono">{overview.start_date}</strong>
              </span>
            )}
            {overview.target_date && (
              <span>
                Target: <strong className="text-slate-800 font-mono">{overview.target_date}</strong>
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Column: 12-Section Breakdown */}
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Project Overview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-2">
                <Layers size={14} /> 1. Project Overview & Charter
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed mt-2 whitespace-pre-line">
                {overview.description || "No official project description registered by the university."}
              </p>
            </div>

            {/* Section 3: Linked Challenge */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                <AlertTriangle size={14} /> 3. Originating Citizen Challenge
              </h2>
              {linked_challenge ? (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-sm text-slate-900">{linked_challenge.title}</h3>
                    {linked_challenge.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                        {linked_challenge.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mb-3 line-clamp-3 leading-relaxed">
                    {linked_challenge.description}
                  </p>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 pt-3 border-t border-slate-200/60">
                    <span>Priority Level: <strong className="text-slate-800">{linked_challenge.priority_level || "Standard"}</strong></span>
                    {linked_challenge.urgency && <span>Urgency: <strong className="text-slate-800">{linked_challenge.urgency}</strong></span>}
                    {linked_challenge.affected_people && (
                      <span>Impact Scope: <strong className="text-slate-800">{linked_challenge.affected_people.toLocaleString()} citizens</strong></span>
                    )}
                  </div>
                  <div className="mt-3 text-right">
                    <Link
                      to={`/government/challenges/${linked_challenge.challenge_id}`}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      View Challenge File <ExternalLink size={12} />
                    </Link>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No linked citizen challenge associated with this project.</p>
              )}
            </div>

            {/* Section 5: Milestones */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                  <Milestone size={14} /> 5. Project Milestones & Verification
                </h2>
                <span className="text-xs text-slate-400 font-semibold">{milestones.length} defined</span>
              </div>
              {milestones.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No milestones defined yet.</p>
              ) : (
                <div className="space-y-3">
                  {milestones.map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle2
                          size={18}
                          className={`mt-0.5 shrink-0 ${m.status === "completed" ? "text-emerald-500" : "text-slate-300"}`}
                        />
                        <div>
                          <p className={`text-xs font-bold ${m.status === "completed" ? "text-slate-900" : "text-slate-600"}`}>
                            {m.title}
                          </p>
                          {m.description && <p className="text-[11px] text-slate-400 mt-0.5">{m.description}</p>}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                          {m.status}
                        </span>
                        {m.due_date && <p className="text-[10px] text-slate-400 mt-1 font-mono">{m.due_date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 6: Research Findings */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                <FileText size={14} /> 6. Research & Academic Evidence
              </h2>
              {research.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No formal research documents submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {research.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <h4 className="text-xs font-bold text-slate-900 mb-1">{r.title}</h4>
                      {r.description && <p className="text-xs text-slate-600 mb-2">{r.description}</p>}
                      {r.findings && (
                        <div className="mt-2 text-[11px] bg-white p-3 rounded-xl border border-slate-200/80">
                          <strong className="text-slate-700 block mb-1">Key Findings:</strong>
                          <p className="text-slate-600 leading-relaxed">{r.findings}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 7: Solution Proposal */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                <Lightbulb size={14} /> 7. Technical Solution Architecture
              </h2>
              {solution ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Solution Title</h4>
                    <p className="text-xs text-slate-900 font-semibold">{solution.title}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Proposed Architecture</h4>
                    <p className="text-xs text-slate-700 leading-relaxed">{solution.proposed_solution}</p>
                  </div>
                  {solution.technical_approach && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">Technical Approach</h4>
                      <p className="text-xs text-slate-700 leading-relaxed">{solution.technical_approach}</p>
                    </div>
                  )}
                  {solution.risks && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                      <strong className="text-[11px] font-bold text-amber-800 block mb-1">Risk Factors & Mitigation:</strong>
                      <p className="text-xs text-amber-900">{solution.risks}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No formal solution architecture proposal submitted yet.</p>
              )}
            </div>

            {/* Section 8 & 9: Prototypes & Pilots */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prototypes */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                  <Cpu size={14} /> 8. Engineering Prototypes
                </h2>
                {prototypes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No prototypes uploaded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {prototypes.map((p) => (
                      <div key={p.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-xs text-slate-900">{p.title}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                            {p.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pilots */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={14} /> 9. Field Pilots & Testing
                </h2>
                {pilots.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No field pilots recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {pilots.map((pl) => (
                      <div key={pl.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-xs text-slate-900">{pl.title}</strong>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {pl.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                          <MapPin size={11} className="text-slate-400" /> {pl.location}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 10: Deployment Readiness */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-4 flex items-center gap-2">
                <ShieldCheck size={14} /> 10. Deployment Readiness Evaluation
              </h2>
              {deployment_readiness ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Readiness State</span>
                    <strong className="text-slate-900 text-sm">{deployment_readiness.readiness_status.replace("_", " ").toUpperCase()}</strong>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Estimated Cost</span>
                    <strong className="text-slate-900">{deployment_readiness.estimated_cost || "Pending assessment"}</strong>
                  </div>
                  {deployment_readiness.technical_readiness && (
                    <div className="md:col-span-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Technical Assessment</span>
                      <p className="text-slate-700">{deployment_readiness.technical_readiness}</p>
                    </div>
                  )}
                  {deployment_readiness.blockers && (
                    <div className="md:col-span-2 p-3 bg-rose-50 rounded-2xl border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Critical Blockers</span>
                      <p className="text-rose-900 font-semibold">{deployment_readiness.blockers}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No deployment readiness assessment filed yet.</p>
              )}
            </div>
          </div>

          {/* Right Sidebar: University, Team, Industry, Activity */}
          <div className="space-y-6">
            {/* Section 2: University Information */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <GraduationCap size={15} /> 2. Executing University
              </h3>
              <p className="text-sm font-extrabold text-slate-900">{university.name}</p>
              {university.short_name && <p className="text-xs text-slate-500 font-mono mt-0.5">{university.short_name}</p>}

              {university.location && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>
                    {[university.location.city, university.location.state, university.location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}

              {university.website && (
                <a
                  href={university.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 truncate"
                >
                  <ExternalLink size={12} /> {university.website}
                </a>
              )}
            </div>

            {/* Section 4: Team Overview */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Users size={15} /> 4. Research Team
              </h3>
              {team ? (
                <div>
                  <strong className="text-xs text-slate-900 block mb-2">{team.name}</strong>
                  <div className="flex gap-4 text-xs text-slate-600 mb-3">
                    <span>Faculty: <strong>{team.faculty_count}</strong></span>
                    <span>Students: <strong>{team.student_count}</strong></span>
                  </div>
                  {team.faculty_members && team.faculty_members.length > 0 && (
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Faculty Leads</span>
                      {team.faculty_members.map((f: any, i: number) => (
                        <div key={i} className="truncate">• {f.name || f} {f.designation ? `(${f.designation})` : ""}</div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No assigned team details found.</p>
              )}
            </div>

            {/* Section 11: Industry Collaboration */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Building2 size={15} /> 11. Industry Collaboration
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Corporate Partnerships</span>
                  <strong className="text-slate-900">{industry_collaboration.partnerships_count}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Active Mentorships</span>
                  <strong className="text-slate-900">{industry_collaboration.mentorships_count}</strong>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Resource Contributions</span>
                  <strong className="text-slate-900">{industry_collaboration.resources_count}</strong>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Funding Proposals</span>
                  <strong className="text-slate-900">{industry_collaboration.funding_count}</strong>
                </div>
              </div>
            </div>

            {/* Section 12: Recent Project Activity */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Activity size={15} /> 12. Recent Project Activity
              </h3>
              {recent_activity.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No activity logged.</p>
              ) : (
                <div className="space-y-3">
                  {recent_activity.slice(0, 5).map((a) => (
                    <div key={a.id} className="text-xs border-l-2 border-emerald-500 pl-3 py-0.5">
                      <p className="font-semibold text-slate-800">{a.action.replace("_", " ")}</p>
                      <p className="text-[11px] text-slate-500">{a.description}</p>
                      <span className="text-[10px] text-slate-400 font-mono">{a.created_at.slice(0, 10)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
