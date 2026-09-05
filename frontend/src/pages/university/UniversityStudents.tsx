import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { Users, Award, Code, ArrowRight, Sparkles } from "lucide-react";
import { universityService } from "../../services/universityService";
import { UniversityProfile } from "../../types";

export default function UniversityStudents() {
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await universityService.getMyProfile();
        setProfile(data);
      } catch (err) {
        console.error("Failed to load student profiles:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const studentSkills = profile?.student_skills || [];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Student Innovators"
        badgeColor="#8B5CF6"
        title="Student Research Corps"
        subtitle="Undergraduate and postgraduate inventors engineering solutions for verified societal challenges."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading student research corps..." />
        ) : (
          <div className="space-y-8">
            {/* Student Skills from Institutional Profile */}
            {studentSkills.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} className="text-purple-600" />
                  <h3 className="text-base font-bold text-[#071A33]">
                    Registered Student Technical Competencies ({studentSkills.length})
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Domain skills and technical capabilities registered in your institutional profile for student researchers.
                </p>
                <div className="flex flex-wrap gap-2">
                  {studentSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State for Student Cohorts */}
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No student researchers assigned yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Student research cohorts and innovators are formed when your departments adopt verified civic challenges. You can configure expected student skill competencies in your Institutional Profile.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link
                  to="/university/challenges"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                >
                  Browse Matched Challenges <ArrowRight size={14} />
                </Link>
                <Link
                  to="/university/profile"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  Configure Student Skills
                </Link>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
