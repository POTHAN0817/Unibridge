import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, ArrowRight, MapPin, Users, Coins } from "lucide-react";
import { projectService } from "../../services/projectService";
import { Project } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryProjects() {
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
        badge="Enterprise Collaborations"
        badgeColor="#F59E0B"
        title="Supported University Projects"
        subtitle="Active university innovations where CoolTech India provides hardware, grants, or engineering advisors."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading collaborative projects..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/industry/projects/${proj.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                      {proj.category}
                    </span>
                    <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                      {proj.stage}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-lg text-[#071A33] group-hover:text-amber-600 transition-colors mt-2 mb-1">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-2">{proj.description}</p>

                  <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-100 mb-4 space-y-1 text-xs">
                    <span className="text-[10px] font-bold text-amber-900 uppercase">Industry Support Delivered</span>
                    <p className="text-gray-700">IoT Hardware telemetry probes & ₹12 Lakh seed research grant.</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {proj.university}
                  </span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enter Collaboration Hub <ArrowRight size={13} />
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
