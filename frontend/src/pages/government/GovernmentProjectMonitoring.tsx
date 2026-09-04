import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Coins,
  MapPin,
  Users,
  Briefcase,
  ArrowLeft,
  TrendingUp,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import { Project } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentProjectMonitoring() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const p = await projectService.getProjectById(projectId || "PRJ-2026-001");
      setProject(p);
      setLoading(false);
    }
    load();
  }, [projectId]);

  if (loading) return <LoadingState message="Loading government monitoring console..." />;

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <Link to="/government/projects" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/government/projects"
        backLabel="Back to Pipeline"
        badge={`National Monitoring Console · ${project.id}`}
        badgeColor="#10B981"
        title={project.title}
        subtitle={`${project.university} · ${project.location}`}
      >
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
          Status: {project.stage}
        </span>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Project Technical Dossier
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">{project.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">Executing Lab</span>
                  <strong className="text-gray-900">{project.university}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">Principal Investigator</span>
                  <strong className="text-gray-900">{project.leadFaculty}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">Target Pilot Date</span>
                  <strong className="text-emerald-600">{project.estimatedCompletion}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">Official Milestone Audit Log</h3>
              <div className="space-y-3">
                {project.milestones.map((m, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={16} className={m.done ? "text-emerald-500" : "text-gray-300"} />
                      <span className={`text-xs font-semibold ${m.done ? "text-gray-900" : "text-gray-400"}`}>
                        {m.title}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">{m.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-emerald-950 mb-2">Government Intervention Actions</h3>
              <p className="text-xs text-emerald-800 leading-relaxed mb-4">
                Verify milestone audits, approve district pilot site clearances, or authorize inter-state scaling.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => alert("District testing permit stamped and transmitted to local District Collector.")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
                >
                  Authorize Village Testing Clearance
                </button>
                <button
                  onClick={() => alert("Scale-up matching notice sent to state industry development agency.")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
                >
                  Flag for State-Wide Scale Up
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Industry Co-Sponsors</h4>
              <div className="space-y-3">
                {project.industrySupport.map((sup, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-xs">
                    <strong className="block text-gray-900">{sup.company}</strong>
                    <span className="text-gray-500">{sup.providing}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
