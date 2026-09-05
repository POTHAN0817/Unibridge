import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, ArrowRight, GraduationCap, Brain } from "lucide-react";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { universityService } from "../../services/universityService";
import { UniversityProfile } from "../../types";

export default function UniversityTeams() {
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await universityService.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load university teams:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const faculty = profile?.faculty || [];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Academic Collaboration"
        badgeColor="#8B5CF6"
        title="Faculty & Student Teams"
        subtitle="Interdisciplinary research cohorts and faculty mentorship clusters connected to civic challenge solutions."
      >
        <Link
          to="/university/challenges"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs cursor-pointer"
        >
          <Brain size={15} /> Find Challenges to Adopt
        </Link>
      </DashboardHeader>

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading research teams and faculty clusters..." />
        ) : faculty.length === 0 ? (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Users size={24} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">No active research teams formed yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Research cohorts and student-faculty project teams are established when faculty mentors adopt a recommended civic challenge. First register your faculty leads in the Institutional Profile.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <Link
                to="/university/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                Configure Faculty Leads <ArrowRight size={14} />
              </Link>
              <Link
                to="/university/challenges"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                Browse Matched Challenges
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faculty.map((f, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full">
                      Research Cohort #{idx + 1}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">Mentorship Cluster</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#071A33] mb-1">{f.name}</h3>
                  <p className="text-xs text-gray-400 mb-4">{f.department || "Academic Department"}</p>

                  <div className="space-y-2 text-xs py-3 border-y border-gray-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lead Investigator:</span>
                      <strong className="text-gray-900">{f.name}</strong>
                    </div>
                    {f.designation && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Academic Role:</span>
                        <strong className="text-gray-900">{f.designation}</strong>
                      </div>
                    )}
                    {f.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contact:</span>
                        <span className="text-purple-600 truncate max-w-[150px]">{f.email}</span>
                      </div>
                    )}
                    {f.expertise && f.expertise.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-[11px] text-gray-400 block mb-1">Focus Areas:</span>
                        <div className="flex flex-wrap gap-1">
                          {f.expertise.map((exp, eIdx) => (
                            <span key={eIdx} className="text-[10px] bg-slate-100 text-gray-700 px-1.5 py-0.5 rounded">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  to="/university/challenges"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  Match Civic Challenges <ArrowRight size={13} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
