import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { StatCard } from "../../components/dashboard/StatCard";
import { TrendingUp, Award, Users, CheckCircle2 } from "lucide-react";

export default function UniversityImpact() {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Institutional Metrics"
        badgeColor="#8B5CF6"
        title="University Innovation Impact"
        subtitle="Measuring patents, community deployments, research grants, and student placements."
      />

      <PageContainer>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Pilots Deployed"
            value="14"
            icon={CheckCircle2}
            color="#8B5CF6"
            subtext="Across 3 districts"
          />
          <StatCard
            label="Grants Attracted"
            value="₹42 Lakhs"
            icon={TrendingUp}
            color="#10B981"
            subtext="Industry + SIH Grants"
          />
          <StatCard
            label="Farmers Benefited"
            value="4,500+"
            icon={Users}
            color="#0B63F6"
            subtext="From active cold storages"
          />
          <StatCard
            label="Campus Research Rank"
            value="Top 5%"
            icon={Award}
            color="#F59E0B"
            subtext="State Innovation Index"
          />
        </div>

        {/* Detailed impact cards */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#071A33] mb-4">
            Highlighted Institutional Deployments
          </h3>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-purple-600 uppercase">Agricultural Engineering</span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">Solar-Powered Micro Cold Storage Room</h4>
                <p className="text-xs text-gray-500">Deployed at Srivilliputhur Vegetable Market belt with CoolTech India</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-emerald-600">27% Loss Cut</span>
                <p className="text-[11px] text-gray-400">Verified by District Agriculture Officer</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase">Environmental Systems</span>
                <h4 className="text-sm font-bold text-gray-900 mt-0.5">Automated Fluoride & TDS IoT Sensor Node</h4>
                <p className="text-xs text-gray-500">Testing in 12 overhead tanks in Kovilpatti taluk</p>
              </div>
              <div className="text-right">
                <span className="text-base font-extrabold text-blue-600">8,200 Citizens</span>
                <p className="text-[11px] text-gray-400">Daily potable drinking water monitoring</p>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
