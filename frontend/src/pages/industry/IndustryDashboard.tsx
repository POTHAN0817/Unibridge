import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Briefcase,
  TrendingUp,
  Cpu,
  Users,
  Coins,
  ArrowRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  FolderPlus,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { projectService } from "../../services/projectService";
import { challengeService } from "../../services/challengeService";
import { Project, Challenge } from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { ActivityTimeline } from "../../components/dashboard/ActivityTimeline";
import { mockActivities } from "../../data/mock/activity";

export default function IndustryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);

  useEffect(() => {
    async function load() {
      const p = await projectService.getAllProjects();
      const c = await challengeService.getAllChallenges();
      setProjects(p);
      setChallenges(c);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge={user?.organization || (user?.profile as Record<string, any>)?.company_name || "CORPORATE INNOVATION PARTNER"}
        badgeColor="#F59E0B"
        title="Industry Partner Innovation Portal"
        subtitle="Empowering university engineering labs through technical mentorship, IoT hardware grants, and pilot scale-up."
      >
        <Link
          to="/industry/funding"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
        >
          <Coins size={15} /> Grant Seed Capital
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active Collaborations"
            value="03 Projects"
            icon={Briefcase}
            color="#F59E0B"
            subtext="With Kalasalingam & Anna Univ"
          />
          <StatCard
            label="Funding Committed"
            value="₹24 Lakhs"
            icon={Coins}
            color="#10B981"
            subtext="CSR & Research Grants"
          />
          <StatCard
            label="Mentorship Hours"
            value="48 Hours"
            icon={Users}
            color="#0B63F6"
            subtext="Engineers mentoring students"
          />
          <StatCard
            label="Commercialization Pipeline"
            value="2 Patents"
            icon={TrendingUp}
            color="#8B5CF6"
            subtext="Joint IP filings"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 columns: Projects needing industry support */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#071A33]">
                    Projects Needing Industry Support
                  </h2>
                  <p className="text-xs text-gray-500">
                    High-impact student prototypes awaiting hardware, cloud credits, or technical advisors
                  </p>
                </div>
                <Link
                  to="/industry/challenges"
                  className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-1"
                >
                  Browse All <ArrowRight size={13} />
                </Link>
              </div>

              <div className="space-y-4">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => navigate(`/industry/projects/${proj.id}`)}
                    className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                          {proj.category}
                        </span>
                        <h3 className="font-bold text-base text-[#071A33] mt-1.5 group-hover:text-amber-600 transition-colors">
                          {proj.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {proj.stage}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{proj.description}</p>

                    <div className="p-3 rounded-2xl bg-amber-50/50 border border-amber-100/80 mb-4 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-900">
                        Requested: Industrial IoT Sensors & Cloud Credits
                      </span>
                      <span className="text-amber-700 font-bold">Open for Sponsor</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span>University: {proj.university}</span>
                      <span className="font-bold text-amber-600 flex items-center gap-1">
                        Sponsor or Mentor <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column: Mentorship slots & Timeline */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-3">
                Corporate CSR & Innovation Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  to="/industry/mentorship"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
                >
                  <span>Open Mentorship Hours</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  to="/industry/funding"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
                >
                  <span>Disburse Prototype Grants</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
                <Link
                  to="/industry/technology"
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-gray-200 text-xs font-bold text-gray-800 transition-colors"
                >
                  <span>Provide Testbeds & Hardware Kits</span>
                  <ArrowRight size={14} className="text-gray-400" />
                </Link>
              </div>
            </div>

            <ActivityTimeline
              items={mockActivities.filter((a) => a.role === "industry" || a.role === "university")}
              title="Industry Collaboration Feed"
            />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
