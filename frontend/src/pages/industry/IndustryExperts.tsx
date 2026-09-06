import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  X,
  Mail,
  Briefcase,
  Award,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryExpert, IndustryExpertCreateInput, IndustryExpertUpdateInput, ProjectMentorship } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryExperts() {
  const [experts, setExperts] = useState<IndustryExpert[]>([]);
  const [mentorships, setMentorships] = useState<ProjectMentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpert, setEditingExpert] = useState<IndustryExpert | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formDesignation, setFormDesignation] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formExpertise, setFormExpertise] = useState("");
  const [formSkills, setFormSkills] = useState("");
  const [formDomainAreas, setFormDomainAreas] = useState("");
  const [formAvailability, setFormAvailability] = useState("available");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [data, mntrs] = await Promise.all([
        industryService.getExperts({
          search: search.trim() || undefined,
          availability: availabilityFilter !== "all" ? availabilityFilter : undefined,
        }),
        industryService.getAllMentorships().catch(() => []),
      ]);
      setExperts(data || []);
      setMentorships(mntrs || []);
    } catch (err: any) {
      console.error("Failed to load industry experts:", err);
      setError(err?.message || "Failed to load corporate experts.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [availabilityFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  function openCreateModal() {
    setEditingExpert(null);
    setFormName("");
    setFormDesignation("");
    setFormEmail("");
    setFormExpertise("");
    setFormSkills("");
    setFormDomainAreas("");
    setFormAvailability("available");
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(exp: IndustryExpert) {
    setEditingExpert(exp);
    setFormName(exp.name);
    setFormDesignation(exp.designation);
    setFormEmail(exp.email);
    setFormExpertise(exp.expertise.join(", "));
    setFormSkills(exp.skills.join(", "));
    setFormDomainAreas(exp.domain_areas.join(", "));
    setFormAvailability(exp.availability || "available");
    setFormError(null);
    setModalOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formName.trim() || !formDesignation.trim() || !formEmail.trim()) {
      setFormError("Name, designation, and corporate email are required.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);
    try {
      const expertiseList = formExpertise.split(",").map((s) => s.trim()).filter(Boolean);
      const skillsList = formSkills.split(",").map((s) => s.trim()).filter(Boolean);
      const domainsList = formDomainAreas.split(",").map((s) => s.trim()).filter(Boolean);

      if (editingExpert) {
        const updated = await industryService.updateExpert(editingExpert.id, {
          name: formName.trim(),
          designation: formDesignation.trim(),
          email: formEmail.trim(),
          expertise: expertiseList,
          skills: skillsList,
          domain_areas: domainsList,
          availability: formAvailability,
        });
        setExperts((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await industryService.createExpert({
          name: formName.trim(),
          designation: formDesignation.trim(),
          email: formEmail.trim(),
          expertise: expertiseList,
          skills: skillsList,
          domain_areas: domainsList,
          availability: formAvailability,
        });
        setExperts((prev) => [created, ...prev]);
      }
      setModalOpen(false);
    } catch (err: any) {
      setFormError(err?.message || "Failed to save expert details.");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(exp: IndustryExpert) {
    if (!window.confirm(`Are you sure you want to remove ${exp.name} from your corporate experts roster?`)) {
      return;
    }

    try {
      await industryService.deleteExpert(exp.id);
      setExperts((prev) => prev.filter((item) => item.id !== exp.id));
    } catch (err: any) {
      alert(err?.message || "Failed to remove expert.");
    }
  }

  const hasFilters = Boolean(search.trim() || availabilityFilter !== "all");

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Corporate Advisory Cohort"
        badgeColor="#F59E0B"
        title="Industry Technical Experts"
        subtitle="Manage your organization's engineering leaders, researchers, and technical specialists available for university project mentorship."
      >
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Add Corporate Expert
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Filter Toolbar */}
        <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search experts by name, designation, email, skill, or expertise..."
                className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Availability Filter */}
            <div>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full py-2.5 px-3 text-xs rounded-xl bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
              >
                <option value="all">All Availability Statuses</option>
                <option value="available">Available for Mentorship</option>
                <option value="limited">Limited Capacity</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState message="Loading expert roster from database..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Failed to load expert roster</h3>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : experts.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Users size={28} />
            </div>
            {hasFilters ? (
              <>
                <h3 className="text-base font-bold text-gray-900">No matching experts found</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try adjusting your search criteria or availability filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setAvailabilityFilter("all");
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </>
            ) : (
              <>
                <h3 className="text-base font-bold text-gray-900">No Corporate Experts Registered</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Add senior engineers, domain architects, and R&D specialists from your organization so they can be assigned to guide university project teams.
                </p>
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs cursor-pointer"
                >
                  <Plus size={14} /> Add First Corporate Expert
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experts.map((exp) => (
              <div
                key={exp.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-snug">{exp.name}</h3>
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
                        <Briefcase size={12} className="text-gray-400 shrink-0" />
                        <span>{exp.designation}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        exp.availability === "available"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : exp.availability === "limited"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-gray-100 text-gray-600 border border-gray-200"
                      }`}
                    >
                      {exp.availability}
                    </span>
                  </div>

                  <div className="text-xs text-gray-500 flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-gray-100">
                    <Mail size={13} className="text-gray-400 shrink-0" />
                    <span className="truncate">{exp.email}</span>
                  </div>

                  {exp.expertise.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Core Expertise
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {exp.expertise.map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {exp.skills.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                        Skills & Tools
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {exp.skills.map((item, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Real Mentorship Metrics */}
                  {(() => {
                    const expertMentorships = mentorships.filter((m) => m.expert_id === exp.id);
                    const activeCount = expertMentorships.filter((m) => m.status === "active").length;
                    const supportedProjects = new Set(expertMentorships.map((m) => m.project_id)).size;

                    return (
                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-center">
                        <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Active Mentorships
                          </span>
                          <span className="text-xs font-black text-indigo-700">{activeCount}</span>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-gray-100">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                            Projects Supported
                          </span>
                          <span className="text-xs font-black text-emerald-700">{supportedProjects}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(exp)}
                    className="p-2 rounded-xl text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                    title="Edit expert"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(exp)}
                    className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete expert"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-gray-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900">
                {editingExpert ? "Edit Corporate Expert" : "Register Corporate Expert"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Expert Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Mehta"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Designation <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formDesignation}
                    onChange={(e) => setFormDesignation(e.target.value)}
                    placeholder="e.g. VP, IoT Architecture"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    Corporate Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="expert@company.com"
                    className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Core Expertise (comma-separated)
                </label>
                <input
                  type="text"
                  value={formExpertise}
                  onChange={(e) => setFormExpertise(e.target.value)}
                  placeholder="e.g. Low-Power Telemetry, Sensor Calibration, SCADA Integration"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Technical Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="e.g. ESP32, LoRaWAN, Python, AWS IoT Core, FreeRTOS"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Availability Status
                </label>
                <select
                  value={formAvailability}
                  onChange={(e) => setFormAvailability(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 bg-white focus:border-amber-500 focus:outline-none cursor-pointer"
                >
                  <option value="available">Available for Mentorship</option>
                  <option value="limited">Limited Capacity</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl font-semibold text-gray-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  {formSubmitting ? "Saving..." : editingExpert ? "Update Expert" : "Register Expert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
