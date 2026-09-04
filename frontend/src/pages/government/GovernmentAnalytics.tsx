import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { monthlyTrends, categoryBreakdown } from "../../data/mock/impactMetrics";

export default function GovernmentAnalytics() {
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Data Intelligence"
        badgeColor="#10B981"
        title="National Innovation Analytics"
        subtitle="Cross-district trend analysis, problem frequency heatmaps, and civic resolution velocity."
      />

      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#071A33] mb-1">Monthly Problem Inflow vs Outflow</h3>
            <p className="text-xs text-gray-400 mb-6">Citizen reports vs university-engineered solutions deployed</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Bar dataKey="challenges" fill="#0B63F6" radius={[4, 4, 0, 0]} name="Reported" />
                  <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <h3 className="text-base font-bold text-[#071A33] mb-1">Citizen Reach Growth Curve</h3>
            <p className="text-xs text-gray-400 mb-6">Cumulative beneficiaries across all active pilots</p>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends}>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Area type="monotone" dataKey="citizens" stroke="#00C2FF" fill="#00C2FF" fillOpacity={0.2} name="Citizens" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#071A33] mb-4">Top Societal Problem Categories</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categoryBreakdown.map((c, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center">
                <div className="text-2xl font-extrabold" style={{ color: c.fill }}>{c.value}</div>
                <div className="text-xs font-semibold text-gray-700 mt-1">{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
