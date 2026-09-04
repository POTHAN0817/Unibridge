import React, { useState, useEffect } from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { StatCard } from "../../components/dashboard/StatCard";
import { TrendingUp, Users, Globe, Award, CheckCircle2 } from "lucide-react";
import { impactService } from "../../services/impactService";
import { ImpactStory } from "../../types";

export default function GovernmentImpact() {
  const [stories, setStories] = useState<ImpactStory[]>([]);

  useEffect(() => {
    async function load() {
      const data = await impactService.getStories();
      setStories(data);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Societal Outcomes"
        badgeColor="#10B981"
        title="National Societal Impact Dashboard"
        subtitle="Audited metrics on citizen beneficiaries, rural economic savings, and replication across districts."
      />

      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Citizens Benefited"
            value="15,000+"
            icon={Users}
            color="#0B63F6"
            subtext="Across 38 districts"
          />
          <StatCard
            label="Deployed Pilots"
            value="34"
            icon={Globe}
            color="#10B981"
            subtext="Operational in field"
          />
          <StatCard
            label="Average Resolution Time"
            value="42 Days"
            icon={TrendingUp}
            color="#F59E0B"
            subtext="From report to prototype"
          />
          <StatCard
            label="Citizen Satisfaction"
            value="91%"
            icon={Award}
            color="#8B5CF6"
            subtext="Verified by District Social Audit"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#071A33] mb-4">
            State-Level Replicable Solutions
          </h3>
          <div className="space-y-4">
            {stories.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-emerald-700 uppercase">{s.category}</span>
                  <h4 className="text-sm font-bold text-gray-900 mt-0.5">{s.title}</h4>
                  <p className="text-xs text-gray-500">{s.location} · {s.university}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
                    Replication: {s.replication.potential} ({s.replication.districts} districts)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
