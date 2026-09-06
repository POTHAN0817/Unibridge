import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { Package, Plus, CheckCircle2, TrendingUp, AlertCircle, FolderGit2, Handshake, ChevronRight, Cpu } from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryResource as IndustryResourceType, IndustryPartnership } from "../../types";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryTechnology() {
  const [resources, setResources] = useState<IndustryResourceType[]>([]);
  const [partnerships, setPartnerships] = useState<IndustryPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const parts = await industryService.getMyPartnerships({ status: "accepted" });
      setPartnerships(parts || []);

      if (parts && parts.length > 0) {
        const resourcePromises = parts.map((p) =>
          industryService.getProjectResources(p.project_id).catch(() => [])
        );
        const results = await Promise.all(resourcePromises);
        const allResources = results.flat();
        setResources(allResources);
      } else {
        setResources([]);
      }
    } catch (err: any) {
      console.error("Failed to load contributed technology resources:", err);
      setError(err?.message || "Failed to load corporate technology contributions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const approvedCount = resources.filter((r) => r.status === "approved" || r.status === "provided").length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Technology & Infrastructure Support"
        badgeColor="#F59E0B"
        title="Contributed Technology & Equipment"
        subtitle="Track specialized hardware, software licenses, datasets, and cloud infrastructure contributed to university teams."
      >
        <div className="flex items-center gap-2">
          <Link
            to="/industry/partnerships"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Handshake size={14} /> My Partnerships
          </Link>
          <Link
            to="/industry/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
          >
            <FolderGit2 size={14} /> Discover Projects
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Contributions
            </span>
            <span className="text-2xl font-black text-gray-900">{resources.length}</span>
            <p className="text-[11px] text-gray-400 mt-1">Across all accepted partnerships</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Active / Approved
            </span>
            <span className="text-2xl font-black text-emerald-600">{approvedCount}</span>
            <p className="text-[11px] text-gray-400 mt-1">Approved by university faculty & teams</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Supported Projects
            </span>
            <span className="text-2xl font-black text-indigo-600">
              {new Set(resources.map((r) => r.project_id)).size}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Unique university innovation pipelines</p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading technology contributions from MongoDB..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Failed to load technology contributions</h3>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : resources.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Package size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Technology Contributions Pledged Yet</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {"You can pledge equipment, cloud credits, sensor kits, datasets, and infrastructure directly to accepted university projects from their collaboration workspace."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/industry/partnerships"
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                View Accepted Partnerships
              </Link>
              <Link
                to="/industry/projects"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
              >
                Discover University Projects
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((res) => {
              const statusColors: Record<string, string> = {
                proposed: "bg-amber-50 text-amber-700 border-amber-200",
                approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                rejected: "bg-rose-50 text-rose-700 border-rose-200",
                provided: "bg-blue-50 text-blue-700 border-blue-200",
                withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
              };

              return (
                <div
                  key={res.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {res.resource_type.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          statusColors[res.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900">{res.title}</h4>
                    <p className="text-xs text-gray-600 line-clamp-3">{res.description}</p>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px] uppercase font-bold">Scope / Quantity</span>
                      <p className="text-gray-800 font-semibold mt-0.5">{res.quantity_or_scope}</p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-gray-400">
                      {new Date(res.created_at).toLocaleDateString()}
                    </span>
                    <Link
                      to={`/industry/projects/${res.project_id}`}
                      className="font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                      Workspace <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
