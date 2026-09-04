import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Circle,
  Users,
  Brain,
  TrendingUp,
  Briefcase,
  ArrowLeft,
  FileText,
  Upload,
  Plus,
  Zap,
} from "lucide-react";
import { projectService } from "../../services/projectService";
import { Project } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

const stages = [
  { label: "Challenge Identified", done: true },
  { label: "University Assigned", done: true },
  { label: "Team Formed", done: true },
  { label: "Solution Design", done: true },
  { label: "Prototype Development", active: true, done: false },
  { label: "Pilot Deployment", done: false },
  { label: "Impact Measurement", done: false },
];

const workspaceTabs = ["Overview", "Team Roster", "Milestones", "Industry Support", "Field Documents"];

export default function UniversityProjectWorkspace() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    async function load() {
      const p = await projectService.getProjectById(projectId || "PRJ-2026-001");
      setProject(p);
      setLoading(false);
    }
    load();
  }, [projectId]);

  const handleToggleMilestone = async (index: number) => {
    if (!project) return;
    const currentStatus = project.milestones[index].done;
    const updated = await projectService.updateMilestone(project.id, index, !currentStatus);
    if (updated) setProject(updated);
  };

  if (loading) return <LoadingState message="Opening project workspace..." />;

  if (!project) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Project workspace not found.</p>
        <Link to="/university/projects" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <DashboardHeader
        backTo="/university/projects"
        backLabel="Back to Projects"
        badge={`Project Workspace · ${project.id}`}
        badgeColor="#8B5CF6"
        title={project.title}
        subtitle={`${project.location} · Started ${project.startDate} · ${project.university}`}
      >
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
          {project.stage}
        </span>
      </DashboardHeader>

      {/* Progress Timeline Ribbon */}
      <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center min-w-max">
          {stages.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center border-2 text-xs font-bold ${
                    s.done
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : s.active
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-300 bg-white text-gray-400"
                  }`}
                >
                  {s.done ? <CheckCircle2 size={14} className="text-emerald-600" /> : i + 1}
                </div>
                <span
                  className={`text-[11px] font-semibold whitespace-nowrap ${
                    s.done ? "text-emerald-700" : s.active ? "text-purple-700" : "text-gray-400"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < stages.length - 1 && (
                <div
                  className="w-14 h-0.5 mx-2"
                  style={{ background: s.done ? "#10B981" : "#E2E8F0" }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-1">
          {workspaceTabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`py-3.5 px-4 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                activeTab === t
                  ? "border-purple-600 text-purple-600 bg-purple-50/40"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Content */}
      <PageContainer>
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Project Description
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed mb-6">{project.description}</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase font-bold">Faculty PI</span>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{project.leadFaculty}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase font-bold">Student Lead</span>
                    <p className="text-xs font-bold text-gray-900 mt-0.5">{project.leadStudent}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-400 uppercase font-bold">Target Pilot</span>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">{project.estimatedCompletion}</p>
                  </div>
                </div>
              </div>

              {/* Milestones quick preview */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-[#071A33]">Milestones Checklist</h3>
                  <button
                    onClick={() => setActiveTab("Milestones")}
                    className="text-xs font-bold text-purple-600 hover:underline"
                  >
                    View All & Update
                  </button>
                </div>

                <div className="space-y-3">
                  {project.milestones.slice(0, 4).map((m, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={m.done}
                          onChange={() => handleToggleMilestone(idx)}
                          className="w-4 h-4 rounded text-purple-600"
                        />
                        <span className={`text-xs font-semibold ${m.done ? "line-through text-gray-400" : "text-gray-800"}`}>
                          {m.title}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">{m.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right sidebar: Industry partners */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={18} className="text-amber-500" />
                  <h3 className="text-sm font-bold text-[#071A33]">Industry Partners Attached</h3>
                </div>

                <div className="space-y-3">
                  {project.industrySupport.map((sup, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-900">{sup.company}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                          {sup.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500">{sup.type}</p>
                      <p className="text-[11px] text-amber-700 font-medium mt-1">
                        Providing: {sup.providing}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Team Roster" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {project.teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-base mb-4">
                  {member.avatar}
                </div>
                <h4 className="text-base font-bold text-[#071A33]">{member.name}</h4>
                <p className="text-xs font-bold text-purple-600 mb-1">{member.role}</p>
                <p className="text-xs text-gray-500">{member.domain}</p>
                {member.email && <p className="text-[11px] text-gray-400 mt-3 pt-3 border-t border-gray-100 truncate">{member.email}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === "Milestones" && (
          <div className="max-w-3xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-[#071A33] mb-2">Project Sprint & Milestone Tracker</h3>
            <p className="text-xs text-gray-500 mb-4">Check off milestones as lab and field tests complete.</p>

            <div className="space-y-3">
              {project.milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={m.done}
                      onChange={() => handleToggleMilestone(idx)}
                      className="w-5 h-5 rounded text-purple-600 cursor-pointer"
                    />
                    <div>
                      <span className={`text-sm font-semibold block ${m.done ? "line-through text-gray-400" : "text-gray-900"}`}>
                        {m.title}
                      </span>
                      {m.current && (
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          CURRENT SPRINT TARGET
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-mono">{m.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "Industry Support" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.industrySupport.map((sup, idx) => (
              <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm mb-3">
                    {sup.logo}
                  </div>
                  <h4 className="text-base font-bold text-[#071A33] mb-1">{sup.company}</h4>
                  <span className="text-xs font-semibold text-purple-600 mb-3 block">{sup.type}</span>
                  <p className="text-xs text-gray-600 leading-relaxed">{sup.providing}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400">Status:</span>
                  <span className="font-bold text-emerald-600">{sup.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "Field Documents" && (
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4 max-w-3xl">
            <h3 className="text-base font-bold text-[#071A33]">Project Artifacts & Schematics</h3>
            <div className="space-y-3">
              {[
                { title: "Solar Cold Chamber Thermal CAD Blueprint.dwg", size: "14.2 MB", date: "Aug 02, 2026" },
                { title: "IoT Telemetry Firmware v1.4.bin", size: "1.8 MB", date: "Aug 22, 2026" },
                { title: "Srivilliputhur Panchayat Pilot Site Permission.pdf", size: "420 KB", date: "Jul 28, 2026" },
              ].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                  <div className="flex items-center gap-2.5">
                    <FileText size={18} className="text-purple-600" />
                    <div>
                      <p className="text-xs font-bold text-gray-800">{doc.title}</p>
                      <span className="text-[11px] text-gray-400">{doc.size} · {doc.date}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${doc.title}`)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
