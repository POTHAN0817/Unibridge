import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { StatCard } from "../../components/dashboard/StatCard";
import { TrendingUp, Award, Users, CheckCircle2, Coins } from "lucide-react";

export default function IndustryImpact() {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Corporate ESG & ROI"
        badgeColor="#F59E0B"
        title="Industry Impact & ESG Dashboard"
        subtitle="Tracking capital deployment efficiency, student talent recruitment, and social return on investment."
      />

      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Grant Capital"
            value="₹24 Lakhs"
            icon={Coins}
            color="#10B981"
            subtext="100% utilized in lab pilots"
          />
          <StatCard
            label="Lives Benefited"
            value="12,700+"
            icon={Users}
            color="#0B63F6"
            subtext="Across agricultural belts"
          />
          <StatCard
            label="Student Engineers Hired"
            value="8 Students"
            icon={Award}
            color="#8B5CF6"
            subtext="Recruited directly from labs"
          />
          <StatCard
            label="ESG Audit Rating"
            value="98/100"
            icon={TrendingUp}
            color="#F59E0B"
            subtext="Verified by Social Audit Board"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#071A33] mb-4">ESG Impact Report Highlights</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-amber-600 uppercase">Perishable Cold Chain</span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">Srivilliputhur Vegetable Preservation Pilot</h4>
                <p className="text-xs text-gray-500">Provided hardware telemetry and ₹12L grant; reduced post-harvest losses by 27%</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-emerald-600">4,500+ Farmers</span>
                <p className="text-[11px] text-gray-400">CSR Compliance Verified</p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
