import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  FolderGit2,
  Building2,
  ChevronRight,
  ExternalLink,
  Target,
  Sparkles,
} from "lucide-react";
import { industryService } from "../../services/industryService";
import { ProjectMentorship } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryMentorship() {
  const [mentorships, setMentorships] = useState<ProjectMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await industryService.getAllMentorships();
      setMentorships(data || []);
    } catch (err: any) {
      console.error("Failed to load mentorship engagements:", err);
      setError(err?.message || "Failed to load mentorship engagements.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Technical Mentorship Portfolio"
        badgeColor="#F59E0B"
        title="Project Mentorship Engagements"
        subtitle="Manage technical advisory relationships between your corporate specialists and university engineering project teams."
      >
        <div className="flex items-center gap-2">
          <Link
            to="/industry/experts"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Users size={14} /> Corporate Experts
          </Link>
          <Link
            to="/industry/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
          >
            <FolderGit2 size={14} /> Discover Projects
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading your corporate mentorship portfolio from database..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Failed to load mentorships</h3>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : mentorships.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Award size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Active Mentorship Engagements</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Once an industry partnership is accepted by a university, you can assign your corporate technical experts to mentor the student-faculty cohort directly on the project workspace.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/industry/partnerships"
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                View My Partnerships
              </Link>
              <Link
                to="/industry/projects"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
              >
                Discover Projects
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentorships.map((m) => (
              <div
                key={m.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          m.status === "active"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : m.status === "completed"
                            ? "bg-blue-50 text-blue-800 border border-blue-200"
                            : m.status === "withdrawn"
                            ? "bg-gray-100 text-gray-600 border border-gray-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {m.status}
                      </span>
                      <h3 className="text-base font-bold text-gray-900 mt-2 leading-snug">
                        {m.expert_name || "Technical Advisor"}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">{m.expert_designation}</p>
                    </div>

                    <Award size={18} className="text-amber-600 shrink-0" />
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-gray-100 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
                      <FolderGit2 size={13} className="text-amber-600" />
                      <span>{m.project_name || "University Project"}</span>
                    </div>
                    {m.university_name && (
                      <div className="flex items-center gap-1.5 text-gray-500 text-[11px]">
                        <Building2 size={12} className="text-gray-400" />
                        <span>{m.university_name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Advisory Objectives
                    </h4>
                    <p className="text-xs text-gray-600 leading-relaxed bg-amber-50/30 p-3 rounded-xl border border-amber-100/60 line-clamp-3">
                      {m.objectives}
                    </p>
                  </div>

                  {m.focus_areas && m.focus_areas.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                        Focus Areas
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {m.focus_areas.map((f, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">
                    Assigned: {new Date(m.created_at).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/industry/projects/${m.project_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
                  >
                    <span>Open Project</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
