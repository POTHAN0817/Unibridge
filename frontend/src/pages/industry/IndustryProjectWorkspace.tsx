import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Coins,
  Cpu,
  Users,
  ArrowRight,
  TrendingUp,
  MessageSquare,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import { Project } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryProjectWorkspace() {
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

  if (loading) return <LoadingState message="Loading collaboration workspace..." />;

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Project not found.</p>
        <Link to="/industry/projects" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/industry/projects"
        backLabel="Back to Projects"
        badge={`Industry Collaboration Workspace · ${project.id}`}
        badgeColor="#F59E0B"
        title={project.title}
        subtitle={`Partnered with ${project.university} · Faculty PI: ${project.leadFaculty}`}
      >
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
          Active Industry Sponsor
        </span>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Project Overview & Scope
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-6">{project.description}</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">University PI</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{project.leadFaculty}</p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Student Lead</span>
                  <p className="text-xs font-bold text-gray-900 mt-0.5">{project.leadStudent}</p>
                </div>
                <div>
                  <span className="text-[11px] text-gray-400 uppercase font-bold">Field Stage</span>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">{project.stage}</p>
                </div>
              </div>
            </div>

            {/* Milestones status */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">Milestone Progress Verified</h3>
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
            <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-amber-950 mb-2">Industry Support Summary</h3>
              <p className="text-xs text-amber-800 leading-relaxed mb-4">
                CoolTech India is currently providing calibrated temperature probes, AWS IoT Core integration, and ₹12 Lakh seed research support.
              </p>

              <div className="space-y-2 pt-2 border-t border-amber-200/70">
                <button
                  onClick={() => alert("Mentorship session scheduled with student lead Aarav Krishnan.")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs cursor-pointer"
                >
                  Schedule Technical Review Call
                </button>
                <button
                  onClick={() => alert("Additional grant disbursement initiated.")}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-amber-900 bg-white hover:bg-amber-50 border border-amber-200 cursor-pointer"
                >
                  Allocate Additional Hardware Kit
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Student Team Roster</h4>
              <div className="space-y-3">
                {project.teamMembers.slice(0, 3).map((tm, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div>
                      <strong className="block text-gray-900">{tm.name}</strong>
                      <span className="text-gray-400">{tm.role}</span>
                    </div>
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      {tm.domain}
                    </span>
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
