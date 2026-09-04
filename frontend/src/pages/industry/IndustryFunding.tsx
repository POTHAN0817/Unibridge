import React, { useState } from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Coins, Plus, CheckCircle2, TrendingUp } from "lucide-react";

export default function IndustryFunding() {
  const [pledged, setPledged] = useState(false);

  const grants = [
    {
      grantName: "Rural Cold Chain Innovation Grant",
      recipient: "Kalasalingam Academy (Team Aarav Krishnan)",
      amount: "₹12,00,000",
      status: "Disbursed",
      purpose: "Solar evaporative cold chamber & sensor kits",
      date: "Jul 20, 2026",
    },
    {
      grantName: "Clean Water Community Sensor Fellowship",
      recipient: "Anna University (Team Priya Venkat)",
      amount: "₹6,00,000",
      status: "Approved",
      purpose: "Spectroscopy probes & field calibration testbed",
      date: "Aug 12, 2026",
    },
    {
      grantName: "Canal Trash Robotic Skimmer Seed Fund",
      recipient: "Thiagarajar College of Engineering",
      amount: "₹4,50,000",
      status: "Under Review",
      purpose: "Buoyancy catamaran hull & edge TPU camera",
      date: "Pending Disbursal",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Capital Grants & CSR"
        badgeColor="#F59E0B"
        title="Funding Opportunities & Supported Grants"
        subtitle="Disburse seed research grants, prototype funding, and corporate CSR capital to university projects."
      >
        <button
          onClick={() => setPledged(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Create New CSR Grant Pool
        </button>
      </DashboardHeader>

      <PageContainer>
        {pledged && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> New CSR Grant Pool allocated: ₹10,00,000 available for university pilots.
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
          <h3 className="text-base font-bold text-[#071A33] mb-4">Enterprise Grant Disbursals</h3>

          <div className="space-y-4">
            {grants.map((g, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-gray-900">{g.grantName}</h4>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      g.status === "Disbursed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {g.status}
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 font-semibold">{g.recipient}</p>
                  <p className="text-xs text-gray-500 mt-1">{g.purpose}</p>
                </div>

                <div className="text-left sm:text-right flex-shrink-0">
                  <div className="text-xl font-extrabold text-emerald-600">{g.amount}</div>
                  <span className="text-[11px] text-gray-400">{g.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
