import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Users, Award, Code, Cpu, BookOpen } from "lucide-react";

export default function UniversityStudents() {
  const students = [
    {
      name: "Aarav Krishnan",
      year: "Final Year B.Tech",
      branch: "IoT & Embedded Engineering",
      role: "Lead Student Researcher",
      project: "Smart Cold Chain for Rural Farmers",
      skills: ["Embedded C", "ESP32", "LoRaWAN", "Circuit Design"],
      badge: "Lead Researcher",
    },
    {
      name: "Priya Venkat",
      year: "3rd Year B.Tech",
      branch: "Computer Science & Data",
      role: "Sensor Telemetry & Dashboard",
      project: "AI Water Quality Monitoring",
      skills: ["React", "Python FastApi", "MQTT", "Time Series Analysis"],
      badge: "Software Lead",
    },
    {
      name: "Rahul Mohan",
      year: "Final Year B.Tech",
      branch: "Mechanical Engineering",
      role: "Thermal Chamber CAD & CFD",
      project: "Smart Cold Chain for Rural Farmers",
      skills: ["SolidWorks", "ANSYS Thermal", "HVAC Design"],
      badge: "CAD Specialist",
    },
    {
      name: "Kavya Sridhar",
      year: "3rd Year B.Tech",
      branch: "Industrial Biotechnology",
      role: "Produce Spoilage Assay",
      project: "Smart Cold Chain for Rural Farmers",
      skills: ["Crop Shelf-life Testing", "Bacterial Counts", "Post-Harvest"],
      badge: "Field Trialist",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Student Innovators"
        badgeColor="#8B5CF6"
        title="Student Research Corps"
        subtitle="Undergraduate and postgraduate inventors engineering solutions for verified societal challenges."
      />

      <PageContainer>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {students.map((s, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm mb-3">
                  {s.name[0]}
                </div>
                <h4 className="text-base font-bold text-[#071A33]">{s.name}</h4>
                <p className="text-xs text-purple-600 font-semibold">{s.role}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.branch} · {s.year}</p>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Assigned Solution</span>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-1">{s.project}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1.5">Skill Matrix</span>
                <div className="flex flex-wrap gap-1">
                  {s.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-gray-600 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
