import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { GraduationCap, Mail, Phone, Plus, Users, ArrowRight } from "lucide-react";
import { universityService } from "../../services/universityService";
import { UniversityProfile } from "../../types";

export default function UniversityFaculty() {
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await universityService.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load faculty roster:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const facultyList = profile?.faculty || [];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Academic Leadership"
        badgeColor="#8B5CF6"
        title="Faculty Management & Mentorship"
        subtitle="Principal Investigators and research faculty supervising student innovation cohorts."
      >
        <Link
          to="/university/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Add Faculty in Profile
        </Link>
      </DashboardHeader>

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading faculty mentors from institutional profile..." />
        ) : facultyList.length === 0 ? (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <GraduationCap size={24} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">No faculty mentors registered yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Add professors, research directors, and principal investigators to your institutional roster to lead challenge-solving student teams.
            </p>
            <Link
              to="/university/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              Configure Faculty Mentors <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {facultyList.map((f, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-base mb-4">
                    {f.name?.trim().charAt(0) || "F"}
                  </div>
                  <h3 className="text-base font-bold text-[#071A33]">{f.name}</h3>
                  <p className="text-xs font-bold text-purple-600 mb-0.5">{f.designation || "Faculty Lead"}</p>
                  <p className="text-xs text-gray-400 mb-4">{f.department || "Department not specified"}</p>

                  {(f.email || f.phone) && (
                    <div className="space-y-1 text-xs text-gray-500 py-3 border-y border-gray-100 mb-4">
                      {f.email && (
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-gray-400" />
                          <span className="truncate">{f.email}</span>
                        </div>
                      )}
                      {f.phone && (
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-gray-400" />
                          <span>{f.phone}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {f.expertise && f.expertise.length > 0 && (
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
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                  <Link
                    to="/university/profile"
                    className="text-xs font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Edit in Profile →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
