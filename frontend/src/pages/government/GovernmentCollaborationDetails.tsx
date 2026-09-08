import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  Cpu,
  Coins,
  Activity,
  ArrowLeft,
  ExternalLink,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import { GovernmentCollaborationDetail } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentCollaborationDetails() {
  const { partnershipId } = useParams<{ partnershipId: string }>();
  const navigate = useNavigate();
  const [collab, setCollab] = useState<GovernmentCollaborationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!partnershipId) return;
      try {
        setLoading(true);
        setError(null);
        const res = await governmentService.getCollaborationDetail(partnershipId);
        setCollab(res);
      } catch (err: any) {
        console.error("Failed to load collaboration detail", err);
        setError("Unable to load collaboration detail from MongoDB.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [partnershipId]);

  if (loading) {
    return <LoadingState message="Loading industry collaboration dossier..." />;
  }

  if (error || !collab) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <PageContainer>
          <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xs">
            <AlertTriangle size={36} className="text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-black text-slate-900 mb-2">Collaboration File Unavailable</h2>
            <p className="text-xs text-slate-500 mb-6">{error || "Partnership could not be found."}</p>
            <Link
              to="/government/collaborations"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Back to Collaborations
            </Link>
          </div>
        </PageContainer>
      </div>
    );
  }

  const { industry_partner, university, project, mentors, resources, funding_proposals, activity } = collab;

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader
        backTo="/government/collaborations"
        backLabel="Back to Collaborations"
        badge={`Partnership File · ${collab.partnership_id.slice(-8).toUpperCase()}`}
        badgeColor="#10B981"
        title={`${industry_partner.company_name} ↔ ${university.name}`}
        subtitle={`Supporting Project: ${project.name || "University Research"}`}
      >
        <div className="flex items-center gap-2">
          <Link
            to={`/government/actions?new_target_type=partnership&new_target_id=${collab.partnership_id}`}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
          >
            <Flag size={14} />
            Create Action
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Status Strip */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Partnership Status:</span>
            <span
              className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase ${
                collab.status === "accepted"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : collab.status === "pending"
                  ? "bg-amber-50 text-amber-800 border border-amber-200"
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}
            >
              {collab.status}
            </span>
          </div>

          <div className="text-xs text-slate-500 font-mono">
            Agreement Recorded: {collab.created_at ? collab.created_at.slice(0, 10) : "N/A"}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Mentors */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                  <Users size={16} /> Industry Expert Mentorships ({mentors.length})
                </h2>
              </div>
              {mentors.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No industry mentors assigned to this partnership yet.</p>
              ) : (
                <div className="space-y-3">
                  {mentors.map((m) => (
                    <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">{m.expert_name}</strong>
                        {m.expert_designation && <span className="text-[11px] text-slate-500 block">{m.expert_designation}</span>}
                        {m.objectives && <p className="text-xs text-slate-600 mt-2">{m.objectives}</p>}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                        {m.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Resources Contributed */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                  <Cpu size={16} /> Contributed Equipment & Technology ({resources.length})
                </h2>
              </div>
              {resources.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No equipment or software resources registered yet.</p>
              ) : (
                <div className="space-y-3">
                  {resources.map((r) => (
                    <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-xs font-bold text-slate-900">{r.title}</strong>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 uppercase">
                          {r.resource_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{r.description}</p>
                      {r.quantity_or_scope && (
                        <span className="text-[11px] text-slate-500 block mt-2 font-mono">
                          Scope: {r.quantity_or_scope}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Funding Proposals */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-2">
                  <Coins size={16} /> Sponsorship & Funding Proposals ({funding_proposals.length})
                </h2>
              </div>
              {funding_proposals.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No financial sponsorships filed under this partnership.</p>
              ) : (
                <div className="space-y-3">
                  {funding_proposals.map((f) => (
                    <div key={f.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">{f.title}</strong>
                        <p className="text-[11px] text-slate-500 mt-0.5">{f.description}</p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          Type: {f.funding_type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          {f.currency} {f.amount.toLocaleString()}
                        </span>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700 mt-0.5">
                          {f.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar: Partner & Project Details */}
          <div className="space-y-6">
            {/* Industry Partner Profile */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Building2 size={15} /> Industry Partner Dossier
              </h3>
              <p className="text-sm font-extrabold text-slate-900">{industry_partner.company_name}</p>
              {industry_partner.industry_sector && (
                <span className="inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {industry_partner.industry_sector}
                </span>
              )}

              {industry_partner.headquarters_location && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span>{industry_partner.headquarters_location}</span>
                </div>
              )}

              {industry_partner.website && (
                <a
                  href={industry_partner.website}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 truncate"
                >
                  <ExternalLink size={12} /> {industry_partner.website}
                </a>
              )}
            </div>

            {/* Target Project */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <Briefcase size={15} /> Associated University Project
              </h3>
              <strong className="text-xs text-slate-900 block mb-1">{project.name || "Untitled Project"}</strong>
              {project.description && (
                <p className="text-xs text-slate-500 line-clamp-3 mb-3">{project.description}</p>
              )}
              {project.project_id && (
                <Link
                  to={`/government/projects/${project.project_id}`}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                >
                  Inspect Full Project Dossier →
                </Link>
              )}
            </div>

            {/* University */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                <GraduationCap size={15} /> Partner University
              </h3>
              <p className="text-xs font-bold text-slate-900">{university.name}</p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
