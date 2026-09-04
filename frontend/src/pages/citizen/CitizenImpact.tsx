import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Users, Globe, Award, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { impactService } from "../../services/impactService";
import { ImpactStory } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function CitizenImpact() {
  const [stories, setStories] = useState<ImpactStory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await impactService.getStories();
      setStories(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Citizen Outcomes"
        title="Community Impact Dashboard"
        subtitle="Real challenges reported by citizens, engineered by universities, and deployed locally."
      />

      <PageContainer>
        {/* Metric summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { value: "15,000+", label: "Citizens Benefited", icon: Users, color: "#0B63F6" },
            { value: "34", label: "Deployed Community Pilots", icon: Globe, color: "#10B981" },
            { value: "32", label: "Universities Active", icon: Award, color: "#8B5CF6" },
            { value: "91%", label: "Average Satisfaction Score", icon: TrendingUp, color: "#F59E0B" },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-xs">
              <s.icon size={22} style={{ color: s.color }} className="mx-auto mb-2" />
              <div
                className="text-2xl lg:text-3xl font-extrabold"
                style={{ color: s.color, fontFamily: "var(--font-display)" }}
              >
                {s.value}
              </div>
              <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Stories list */}
        <h2
          className="text-xl font-bold text-[#071A33] mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Verified Community Solution Case Studies
        </h2>

        {loading ? (
          <LoadingState message="Loading impact stories..." />
        ) : (
          <div className="space-y-6">
            {stories.map((story) => (
              <div
                key={story.id}
                className="rounded-3xl overflow-hidden bg-white border border-gray-200 shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div
                  className="px-6 py-5 flex flex-wrap items-center justify-between gap-3 bg-white"
                  style={{ borderBottom: `3px solid ${story.color}` }}
                >
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {story.category}
                    </span>
                    <h3
                      className="text-xl font-extrabold text-[#071A33] mt-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {story.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {story.location} · Solved by {story.university}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Deployed Pilot
                    </span>
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Before & After */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex flex-col justify-between">
                      <div className="text-xs font-bold uppercase text-gray-400 mb-2">Before Solution</div>
                      <div className="text-2xl font-extrabold text-rose-500">{story.before.metric}</div>
                      <div className="text-xs text-gray-600 mt-1">{story.before.label}</div>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex flex-col justify-between">
                      <div className="text-xs font-bold uppercase text-emerald-600 mb-2">After Solution</div>
                      <div className="text-2xl font-extrabold text-emerald-600">{story.after.metric}</div>
                      <div className="text-xs text-emerald-800 mt-1">{story.after.label}</div>
                    </div>

                    {/* Scale and satisfaction */}
                    <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex flex-col justify-between">
                      <div className="text-xs font-bold uppercase text-blue-600 mb-2">Community Scale</div>
                      <div className="text-2xl font-extrabold text-blue-600">{story.impact.benefited}</div>
                      <div className="text-xs text-blue-800 mt-1">
                        Citizens Benefited ({story.impact.satisfaction} satisfaction)
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Replication Potential: <strong className="text-gray-800">{story.replication.potential}</strong> across {story.replication.districts} other districts
                    </div>
                    <Link
                      to={`/citizen/challenges/CF-2026-089`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View Originating Challenge <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
