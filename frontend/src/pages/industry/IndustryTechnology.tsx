import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Cpu, Server, Wifi, Database, CheckCircle2 } from "lucide-react";

export default function IndustryTechnology() {
  const assets = [
    {
      name: "Industrial Refrigeration IoT Sensor Kits",
      category: "Hardware",
      allocatedTo: "Kalasalingam Academy",
      quantity: "10 Probes Deployed",
      status: "Active Telemetry",
      icon: Cpu,
    },
    {
      name: "AWS Cloud IoT Core & TimeSeries DB Credits",
      category: "Cloud Infrastructure",
      allocatedTo: "University Research Pool",
      quantity: "$25,000 Credits",
      status: "Available",
      icon: Server,
    },
    {
      name: "LoRaWAN Gateway Base Station Testbed",
      category: "Connectivity",
      allocatedTo: "Anna University (BIT Campus)",
      quantity: "3 Towers Enabled",
      status: "Active",
      icon: Wifi,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Technology & Infrastructure"
        badgeColor="#F59E0B"
        title="Technology & Infrastructure Support"
        subtitle="Hardware testbeds, cloud compute credits, and sensors provided by enterprise partners."
      />

      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {assets.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <item.icon size={24} />
                </div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{item.category}</span>
                <h3 className="text-base font-bold text-[#071A33] mt-1 mb-2">{item.name}</h3>

                <div className="space-y-1 text-xs text-gray-600 pt-3 border-t border-gray-100">
                  <div>Allocated To: <strong>{item.allocatedTo}</strong></div>
                  <div>Volume: <strong>{item.quantity}</strong></div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-400">Status:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={12} /> {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
