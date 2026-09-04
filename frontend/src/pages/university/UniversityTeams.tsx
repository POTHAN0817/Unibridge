import React from "react";
import { Link } from "react-router-dom";
import { Users, Plus, ArrowRight, BookOpen, Shield } from "lucide-react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";

export default function UniversityTeams() {
  const teams = [
    {
      id: "TM-01",
      name: "AgriTech & Cold Chain Innovators",
      dept: "Department of Agricultural Engineering",
      facultyLead: "Dr. Anjali Kumar",
      studentLead: "Aarav Krishnan",
      membersCount: 8,
      activeProject: "Smart Cold Chain for Rural Farmers",
      projectId: "PRJ-2026-001",
    },
    {
      id: "TM-02",
      name: "IoT & Sensor Telemetry Lab",
      dept: "Department of Embedded Systems",
      facultyLead: "Prof. Rajan Suresh",
      studentLead: "Priya Venkat",
      membersCount: 6,
      activeProject: "AI Water Quality Monitoring",
      projectId: "PRJ-2026-002",
    },
    {
      id: "TM-03",
      name: "Rural Telemedicine Cluster",
      dept: "Department of Computer Science & AI",
      facultyLead: "Dr. Meera Nair",
      studentLead: "Rahul Mohan",
      membersCount: 5,
      activeProject: "Remote Healthcare Platform",
      projectId: "PRJ-2026-001",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Academic Collaboration"
        badgeColor="#8B5CF6"
        title="Faculty & Student Teams"
        subtitle="Manage interdisciplinary research cohorts building solutions for verified civic challenges."
      >
        <button
          onClick={() => alert("New Team Creator Modal: Assign Faculty PI, Select Students, Connect Challenge.")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Form New Team
        </button>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teams.map((t) => (
            <div
              key={t.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                    {t.id}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">{t.membersCount} Members</span>
                </div>

                <h3 className="text-lg font-bold text-[#071A33] mb-1">{t.name}</h3>
                <p className="text-xs text-gray-400 mb-4">{t.dept}</p>

                <div className="space-y-2 text-xs py-3 border-y border-gray-100 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Faculty PI:</span>
                    <strong className="text-gray-900">{t.facultyLead}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Student Lead:</span>
                    <strong className="text-gray-900">{t.studentLead}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Current Project:</span>
                    <span className="font-semibold text-purple-600 truncate max-w-[150px]">{t.activeProject}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/university/projects/${t.projectId}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                Open Project Workspace <ArrowRight size={13} />
              </Link>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
