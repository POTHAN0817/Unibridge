import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { StatCard } from "../../components/dashboard/StatCard";
import { TrendingUp, Award, Users, CheckCircle2, DollarSign, Package, FolderGit2, Building2 } from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryDashboardMetrics, IndustryPartnership } from "../../types";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryImpact() {
  const [metrics, setMetrics] = useState<IndustryDashboardMetrics | null>(null);
  const [partnerships, setPartnerships] = useState<IndustryPartnership[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [m, parts] = await Promise.all([
          industryService.getDashboardMetrics().catch(() => null),
          industryService.getMyPartnerships({ status: "accepted" }).catch(() => []),
        ]);
        setMetrics(m);
        setPartnerships(parts || []);
      } catch (err) {
        console.error("Failed to load impact metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white pb-20">
      <DashboardHeader
        badge="Corporate ESG & Collaboration Audit"
        badgeColor="#F59E0B"
        title="Industry Collaboration Impact & Engagement"
        subtitle="Audited tracking of student-faculty partnerships, corporate technical mentorship, and institutional technology deployment."
      >
        <Link
          to="/industry/projects"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
        >
          <FolderGit2 size={14} /> Discover Projects
        </Link>
      </DashboardHeader>

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading collaboration impact metrics from MongoDB..." />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Supported Projects"
                value={metrics ? `${metrics.supported_projects}` : "0"}
                icon={Building2}
                color="#10B981"
                subtext="Academic initiatives partnered"
              />
              <StatCard
                label="Active Mentorships"
                value={metrics ? `${metrics.active_mentorships}` : "0"}
                icon={Users}
                color="#0B63F6"
                subtext="Corporate experts mentoring students"
              />
              <StatCard
                label="Tech Contributions"
                value={metrics ? `${metrics.resources_contributed ?? 0}` : "0"}
                icon={Package}
                color="#8B5CF6"
                subtext="Hardware, software & datasets"
              />
              <StatCard
                label="Funding Proposals"
                value={metrics ? `${metrics.funding_proposals ?? 0}` : "0"}
                icon={DollarSign}
                color="#F59E0B"
                subtext="Capital grants & sponsorships"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">Active Institutional Collaborations</h3>

              {partnerships.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                    <TrendingUp size={24} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-900">No Active Collaborations Recorded</h4>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    {"Institutional impact and engagement metrics populate automatically when your partnership requests are accepted by university engineering cohorts."}
                  </p>
                  <Link
                    to="/industry/projects"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
                  >
                    Discover University Projects
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {partnerships.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <span className="text-xs font-bold text-amber-600 uppercase">
                          {p.challenge_category || "Civic Innovation"}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                          {p.project_name || "University Project"}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Partner Institution: <strong>{p.university_name || "University"}</strong>
                          {p.challenge_title && ` · ${p.challenge_title}`}
                        </p>
                      </div>
                      <div className="text-left sm:text-right">
                        <Link
                          to={`/industry/projects/${p.project_id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800"
                        >
                          Workspace
                        </Link>
                        <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 sm:justify-end mt-0.5">
                          <CheckCircle2 size={12} /> Active Collaboration
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}
