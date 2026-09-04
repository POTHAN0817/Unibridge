import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, ArrowRight, MapPin, Users, CheckCircle2 } from "lucide-react";
import { projectService } from "../../services/projectService";
import { Project } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await projectService.getAllProjects();
      setProjects(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="National Innovation Portfolio"
        badgeColor="#10B981"
        title="National & State Project Pipeline"
        subtitle="Tracking live university engineering prototypes, pilot testing timelines, and multi-district rollouts."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading national pipeline..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/government/projects/${proj.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800">
                      {proj.category}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {proj.stage}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#071A33] group-hover:text-emerald-700 transition-colors mt-2 mb-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{proj.description}</p>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Deployment Readiness</span>
                      <strong className="text-gray-900">{proj.progress}%</strong>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-gray-600">
                    <div>Executing University: <strong>{proj.university}</strong></div>
                    <div>Target Pilot: <strong>{proj.estimatedCompletion}</strong></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 mt-4">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {proj.location}
                  </span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Monitor Project <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
