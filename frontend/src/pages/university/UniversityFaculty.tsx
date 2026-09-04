import React from "react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { GraduationCap, Mail, Phone, BookOpen, Award } from "lucide-react";

export default function UniversityFaculty() {
  const facultyList = [
    {
      name: "Dr. Anjali Kumar",
      designation: "Professor & Head of Department",
      department: "Agricultural Engineering",
      email: "anjali.k@kalasalingam.ac.in",
      phone: "+91 94432 78901",
      activeProjects: 3,
      patentsCount: 4,
      expertise: ["Cold Chain Thermodynamics", "Post-Harvest Drying", "Solar Evaporative Coolers"],
    },
    {
      name: "Prof. Rajan Suresh",
      designation: "Associate Professor",
      department: "IoT & Embedded Systems",
      email: "rajan.s@kalasalingam.ac.in",
      phone: "+91 94433 11223",
      activeProjects: 2,
      patentsCount: 2,
      expertise: ["LoRaWAN Telemetry", "Low-Power Firmware", "Sensor Calibration"],
    },
    {
      name: "Dr. Meera Nair",
      designation: "Professor",
      department: "Computer Science & AI",
      email: "meera.n@kalasalingam.ac.in",
      phone: "+91 98402 99887",
      activeProjects: 2,
      patentsCount: 3,
      expertise: ["Edge Computer Vision", "Health Informatics", "Federated Learning"],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Academic Leadership"
        badgeColor="#8B5CF6"
        title="Faculty Management & Mentorship"
        subtitle="Principal Investigators supervising student innovation laboratories."
      />

      <PageContainer>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {facultyList.map((f, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-base mb-4">
                {f.name.split(" ")[1]?.[0] || "F"}
              </div>
              <h3 className="text-base font-bold text-[#071A33]">{f.name}</h3>
              <p className="text-xs font-bold text-purple-600 mb-0.5">{f.designation}</p>
              <p className="text-xs text-gray-400 mb-4">{f.department}</p>

              <div className="space-y-1 text-xs text-gray-500 py-3 border-y border-gray-100 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-gray-400" />
                  <span className="truncate">{f.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-gray-400" />
                  <span>{f.phone}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5">
                  Core Research Domains:
                </span>
                <div className="flex flex-wrap gap-1">
                  {f.expertise.map((exp, idx) => (
                    <span key={idx} className="text-[11px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded-md">
                      {exp}
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
