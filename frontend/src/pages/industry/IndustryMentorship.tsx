import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Users, Calendar, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function IndustryMentorship() {
  const sessions = [
    {
      studentLead: "Aarav Krishnan",
      university: "Kalasalingam Academy",
      project: "Smart Cold Chain for Rural Farmers",
      topic: "Compressor Duty Cycle & Low-Power Firmware Optimization",
      date: "Tomorrow, 3:00 PM IST",
      mentor: "Rajesh Mehta (VP, Tech)",
      status: "Upcoming",
    },
    {
      studentLead: "Priya Venkat",
      university: "Anna University",
      project: "AI Water Quality Monitoring",
      topic: "Optical Sensor Drift Correction & Membrane Longevity",
      date: "Friday, 4:30 PM IST",
      mentor: "Dr. Arvind Rao (R&D Lead)",
      status: "Confirmed",
    },
    {
      studentLead: "Rahul Mohan",
      university: "NIT Trichy",
      project: "Digital Classroom Kiosks",
      topic: "Thermal dissipation in sealed outdoor enclosures",
      date: "Completed on Aug 26",
      mentor: "Rajesh Mehta",
      status: "Completed",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Technical Advisory"
        badgeColor="#F59E0B"
        title="Industry Mentorship Portal"
        subtitle="Connect your engineering specialists with student teams to unblock hardware, software, and design hurdles."
      >
        <button
          onClick={() => alert("New Mentorship Office Hours slot created.")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs cursor-pointer"
        >
          <Calendar size={15} /> Offer Office Hours
        </button>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sessions.map((sess, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    sess.status === "Upcoming" ? "bg-blue-50 text-blue-700" : sess.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {sess.status}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">{sess.date}</span>
                </div>

                <h3 className="text-base font-bold text-[#071A33] mb-1">{sess.topic}</h3>
                <p className="text-xs text-amber-700 font-semibold mb-3">{sess.project}</p>

                <div className="space-y-1.5 text-xs text-gray-500 py-3 border-y border-gray-100 mb-4">
                  <div>Student: <strong className="text-gray-900">{sess.studentLead}</strong> ({sess.university})</div>
                  <div>Industry Advisor: <strong className="text-gray-900">{sess.mentor}</strong></div>
                </div>
              </div>

              <button
                onClick={() => alert("Opening video conferencing link for mentorship call...")}
                className="w-full text-center py-2.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                Join Video Conference
              </button>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
