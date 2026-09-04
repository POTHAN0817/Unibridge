import React, { useState, useEffect } from "react";
import { Briefcase, Coins, MapPin, Users } from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryPartnerItem } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentIndustry() {
  const [partners, setPartners] = useState<IndustryPartnerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await industryService.getPartners();
      setPartners(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Corporate & CSR Registry"
        badgeColor="#10B981"
        title="Industry Partners & CSR Coalitions"
        subtitle="Corporates co-investing in university prototypes and providing hardware, cloud credits, and market scale-up."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading industry partners..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                    {p.sector}
                  </span>
                  <h3 className="font-bold text-base text-[#071A33] mt-2 mb-1">{p.name}</h3>
                  <p className="text-xs text-gray-500 mb-4">{p.location}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs py-3 border-y border-gray-100 mb-4">
                    <div>Committed: <strong className="text-emerald-600">{p.fundingCommitted}</strong></div>
                    <div>Active Projects: <strong className="text-purple-600">{p.supportedProjects}</strong></div>
                    <div>Mentorship Slots: <strong>{p.openMentorshipSlots}</strong></div>
                    <div>Liaison: <strong>{p.contactPerson}</strong></div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Corporate Focus</span>
                    <div className="flex flex-wrap gap-1">
                      {p.focusAreas.map((f, i) => (
                        <span key={i} className="text-[10px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400 truncate">
                  Official Email: <strong className="text-gray-700">{p.email}</strong>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
