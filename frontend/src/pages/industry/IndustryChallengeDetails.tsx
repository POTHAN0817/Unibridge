import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Users,
  CheckCircle2,
  Coins,
  ArrowRight,
  Cpu,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [sponsored, setSponsored] = useState(false);

  useEffect(() => {
    async function load() {
      if (challengeId) {
        const c = await challengeService.getChallengeById(challengeId);
        setChallenge(c);
      }
      setLoading(false);
    }
    load();
  }, [challengeId]);

  if (loading) return <LoadingState message="Loading challenge support details..." />;

  if (!challenge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Challenge not found.</p>
        <Link to="/industry/challenges" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/industry/challenges"
        backLabel="Back to Challenges"
        badge={`Industry Opportunity · ${challenge.id}`}
        badgeColor="#F59E0B"
        title={challenge.title}
        subtitle={`${challenge.location} · University Assigned: ${challenge.assignedUniversity || "Kalasalingam Academy"}`}
      >
        <PriorityBadge priority={challenge.priority} />
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Problem Description & Commercialization Scope
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
              </p>

              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
                <h4 className="text-xs font-bold text-amber-900 mb-1">
                  Corporate Partnership Value Proposition
                </h4>
                <p className="text-xs text-amber-800/80 leading-relaxed">
                  By providing IoT hardware kits and technical mentorship, your enterprise gains first-look commercialization rights, early talent recruitment pipeline of top student engineers, and verified ESG/CSR compliance metrics.
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">
                Recommended Support Package
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                  <Cpu size={18} className="text-amber-600" />
                  <div className="text-xs">
                    <strong className="block text-gray-900">Hardware & Telemetry Sensors</strong>
                    <span className="text-gray-500">Donate 5 industrial IoT temperature and humidity probes</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                  <Users size={18} className="text-blue-600" />
                  <div className="text-xs">
                    <strong className="block text-gray-900">Bi-Weekly Technical Mentorship</strong>
                    <span className="text-gray-500">Provide 2 hours per week of senior refrigeration engineering advice</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                  <Coins size={18} className="text-emerald-600" />
                  <div className="text-xs">
                    <strong className="block text-gray-900">Prototype Grant Allocation</strong>
                    <span className="text-gray-500">₹5,00,000 seed grant for solar inverter and chamber fabrication</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-amber-500 text-white rounded-3xl p-6 shadow-md">
              <h3 className="text-base font-bold mb-2">Pledge Industry Partnership</h3>
              <p className="text-xs text-amber-100 leading-relaxed mb-6">
                Directly connect with the faculty mentor and student researchers to begin collaborative prototype development.
              </p>

              {sponsored ? (
                <div className="p-3 bg-white/20 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={16} /> Partnership Pledge Logged!
                </div>
              ) : (
                <button
                  onClick={() => setSponsored(true)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-amber-950 bg-white hover:bg-amber-50 transition-colors shadow-xs cursor-pointer"
                >
                  Pledge Support for Project
                </button>
              )}
            </div>

            <Link
              to={`/industry/projects/PRJ-2026-001`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Open Active Workspace <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
