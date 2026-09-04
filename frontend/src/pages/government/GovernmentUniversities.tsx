import React, { useState, useEffect } from "react";
import { GraduationCap, MapPin, Award, Layers } from "lucide-react";
import { universityService } from "../../services/universityService";
import { UniversityItem } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentUniversities() {
  const [unis, setUnis] = useState<UniversityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await universityService.getUniversities();
      setUnis(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Higher Education Network"
        badgeColor="#10B981"
        title="Participating Universities & Engineering Institutes"
        subtitle="Accredited state, central, and private engineering institutions solving community challenges."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading university registry..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {unis.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {u.type}
                    </span>
                    <span className="text-xs font-extrabold text-amber-600">★ {u.rating}</span>
                  </div>

                  <h3 className="font-bold text-base text-[#071A33] mb-1">{u.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{u.district}, {u.state}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-gray-100 mb-4">
                    <div>Active Projects: <strong className="text-purple-600">{u.activeProjects}</strong></div>
                    <div>Completed: <strong className="text-emerald-600">{u.completedSolutions}</strong></div>
                    <div>Faculty: <strong>{u.facultyCount}</strong></div>
                    <div>Students: <strong>{u.studentCount}</strong></div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Key Research Domains</span>
                    <div className="flex flex-wrap gap-1">
                      {u.topDomains.map((dom, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded">
                          {dom}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                  Nodal Representative: <strong className="text-gray-700">{u.contactPerson}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
