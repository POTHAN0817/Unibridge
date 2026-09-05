import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import {
  GraduationCap,
  Mail,
  Plus,
  Users,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Filter,
  Sparkles,
  ArrowRight,
  BookOpen,
  Layers,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import { FacultyMember, FacultyCreateInput, UniversityProfile } from "../../types";

interface FacultyFormData {
  name: string;
  email: string;
  designation: string;
  department: string;
  expertiseText: string;
  skillsText: string;
  researchAreasText: string;
  availability: boolean;
}

const INITIAL_FORM: FacultyFormData = {
  name: "",
  email: "",
  designation: "Professor",
  department: "",
  expertiseText: "",
  skillsText: "",
  researchAreasText: "",
  availability: true,
};

export default function UniversityFaculty() {
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyMember | null>(null);
  const [deletingFaculty, setDeletingFaculty] = useState<FacultyMember | null>(null);

  // Form state
  const [formData, setFormData] = useState<FacultyFormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load real faculty roster and university profile
  async function loadData() {
    setLoading(true);
    try {
      const [faculties, prof] = await Promise.all([
        universityService.getFacultyList(),
        universityService.getMyProfile(),
      ]);
      setFacultyList(faculties);
      setProfile(prof);
    } catch (err: any) {
      console.error("Failed to load faculty roster:", err);
      setFeedback({
        type: "error",
        message: err?.response?.data?.detail || "Failed to load faculty members.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Dismiss feedback after 4 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Derive unique department options
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    profile?.departments?.forEach((d) => d.name && set.add(d.name.trim()));
    facultyList.forEach((f) => f.department && set.add(f.department.trim()));
    return Array.from(set).sort();
  }, [profile, facultyList]);

  // Client-side filtering for fast interactive search
  const filteredFaculty = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return facultyList.filter((f) => {
      const matchesDept =
        selectedDepartment === "all" ||
        (f.department && f.department.toLowerCase() === selectedDepartment.toLowerCase());

      if (!matchesDept) return false;
      if (!q) return true;

      const inName = f.name.toLowerCase().includes(q);
      const inEmail = f.email.toLowerCase().includes(q);
      const inDesig = (f.designation || "").toLowerCase().includes(q);
      const inDept = (f.department || "").toLowerCase().includes(q);
      const inExp = (f.expertise || []).some((item) => item.toLowerCase().includes(q));
      const inSkills = (f.skills || []).some((item) => item.toLowerCase().includes(q));
      const inAreas = (f.research_areas || []).some((item) => item.toLowerCase().includes(q));

      return inName || inEmail || inDesig || inDept || inExp || inSkills || inAreas;
    });
  }, [facultyList, searchQuery, selectedDepartment]);

  // Open modal for adding
  const handleOpenAddModal = () => {
    setFormData(INITIAL_FORM);
    setFormError(null);
    setIsAddModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (f: FacultyMember) => {
    setEditingFaculty(f);
    setFormData({
      name: f.name,
      email: f.email,
      designation: f.designation || "Faculty Lead",
      department: f.department || "",
      expertiseText: (f.expertise || []).join(", "),
      skillsText: (f.skills || []).join(", "),
      researchAreasText: (f.research_areas || []).join(", "),
      availability: f.availability !== false,
    });
    setFormError(null);
  };

  // Close modals
  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingFaculty(null);
    setFormError(null);
  };

  // Parse comma-separated strings into cleaned arrays
  const parseTags = (text: string): string[] => {
    return text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  // Save Faculty (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim().toLowerCase();

    if (!cleanName) {
      setFormError("Faculty name is required.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setFormError("A valid institutional email address is required.");
      return;
    }

    const payload: FacultyCreateInput = {
      name: cleanName,
      email: cleanEmail,
      designation: formData.designation.trim() || "Faculty Lead",
      department: formData.department.trim() || undefined,
      expertise: parseTags(formData.expertiseText),
      skills: parseTags(formData.skillsText),
      research_areas: parseTags(formData.researchAreasText),
      availability: formData.availability,
    };

    setSubmitting(true);
    try {
      if (editingFaculty) {
        const updated = await universityService.updateFaculty(editingFaculty.id, payload);
        setFacultyList((prev) =>
          prev.map((item) => (item.id === updated.id ? updated : item))
        );
        setFeedback({
          type: "success",
          message: `Faculty record for ${updated.name} updated successfully.`,
        });
      } else {
        const created = await universityService.createFaculty(payload);
        setFacultyList((prev) => [created, ...prev]);
        setFeedback({
          type: "success",
          message: `${created.name} added to institutional faculty roster.`,
        });
      }
      handleCloseModal();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "Failed to save faculty record. Please verify inputs.";
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Faculty Member
  const handleConfirmDelete = async () => {
    if (!deletingFaculty) return;
    setSubmitting(true);
    try {
      await universityService.deleteFaculty(deletingFaculty.id);
      setFacultyList((prev) => prev.filter((f) => f.id !== deletingFaculty.id));
      setFeedback({
        type: "success",
        message: `${deletingFaculty.name} has been removed from your faculty roster.`,
      });
      setDeletingFaculty(null);
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.detail || "Failed to delete faculty record. Please try again.";
      setFeedback({ type: "error", message: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardHeader
        badge="Institutional Academic Leadership"
        badgeColor="#8B5CF6"
        title="Faculty Management & Mentorship"
        subtitle="Manage principal investigators, department chairs, and research faculty leading civic innovation cohorts."
      >
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Add Faculty Member
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Toast Feedback Notification */}
        {feedback && (
          <div
            className={`mb-6 flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold animate-in fade-in slide-in-from-top-2 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="text-rose-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Controls Toolbar: Search & Department Filter */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search faculty by name, email, department, or research domain..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative min-w-[200px]">
              <Filter
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-8 pr-4 py-2 text-xs rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 cursor-pointer"
              >
                <option value="all">All Academic Departments</option>
                {departmentOptions.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shrink-0">
              {filteredFaculty.length} of {facultyList.length} Mentors
            </span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState message="Loading institutional faculty roster..." />
        ) : facultyList.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#071A33]">No faculty mentors registered yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
              Add professors, research directors, and principal investigators to your institutional roster to lead challenge-solving student teams and supervise real civic implementations.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={15} /> Add Your First Faculty Member
            </button>
          </div>
        ) : filteredFaculty.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <p className="text-xs text-gray-500">
              No faculty members match your current filter: <span className="font-semibold text-gray-700">"{searchQuery || selectedDepartment}"</span>
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDepartment("all");
              }}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 underline cursor-pointer"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((f) => {
              const isAvailable = f.availability !== false;
              const initial = f.name?.trim().charAt(0).toUpperCase() || "F";

              return (
                <div
                  key={f.id}
                  className="bg-white border border-gray-200/90 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Status & Actions */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-base shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#071A33] leading-tight line-clamp-1">
                            {f.name}
                          </h3>
                          <p className="text-xs font-bold text-purple-600">
                            {f.designation || "Faculty Lead"}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {f.department || "Academic Department"}
                          </p>
                        </div>
                      </div>

                      {/* Mentorship Status Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isAvailable
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {isAvailable ? "Available" : "Busy"}
                      </span>
                    </div>

                    {/* Email Contact */}
                    {f.email && (
                      <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-gray-600">
                        <Mail size={13} className="text-gray-400 shrink-0" />
                        <a
                          href={`mailto:${f.email}`}
                          className="truncate hover:text-purple-600 hover:underline"
                        >
                          {f.email}
                        </a>
                      </div>
                    )}

                    {/* Research Domains / Expertise */}
                    {f.expertise && f.expertise.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Core Expertise
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {f.expertise.map((exp, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 px-2.5 py-0.5 rounded-md font-medium"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {f.skills && f.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Technical & Analytical Skills
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {f.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Research Areas */}
                    {f.research_areas && f.research_areas.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Research Focus
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {f.research_areas.map((area, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Added: {f.created_at ? new Date(f.created_at).toLocaleDateString() : "Recently"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(f)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-purple-600 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingFaculty(f)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-700 px-2.5 py-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add or Edit Faculty */}
        {(isAddModalOpen || editingFaculty) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">
                    {editingFaculty ? "Edit Faculty Mentor" : "Add Faculty Member"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {editingFaculty
                      ? "Update academic and mentorship details"
                      : "Register research mentor to supervise student innovation cohorts"}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Institutional Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. r.sharma@iitd.ac.in"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Professor, HOD, Director"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    list="dept-datalist"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Civil Engineering, Computer Science"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                  <datalist id="dept-datalist">
                    {departmentOptions.map((dept) => (
                      <option key={dept} value={dept} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Core Expertise <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.expertiseText}
                    onChange={(e) => setFormData({ ...formData, expertiseText: e.target.value })}
                    placeholder="Water Purification, Sensor Networks, Drone Surveying"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Technical Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.skillsText}
                    onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                    placeholder="GIS Mapping, Embedded C, Python, Data Analytics"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Research Areas <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.researchAreasText}
                    onChange={(e) => setFormData({ ...formData, researchAreasText: e.target.value })}
                    placeholder="Urban Hydrology, Climate Resilience, Smart Infrastructure"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="availability-toggle"
                    checked={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="availability-toggle" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Available to mentor student cohorts on adopted challenges
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : editingFaculty ? "Save Changes" : "Add Faculty Member"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Delete Confirmation */}
        {deletingFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-sm w-full p-6 space-y-4">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={20} />
              </div>
              <div className="text-center space-y-1.5">
                <h4 className="text-base font-bold text-[#071A33]">Remove Faculty Member?</h4>
                <p className="text-xs text-gray-500">
                  Are you sure you want to remove <span className="font-semibold text-gray-800">{deletingFaculty.name}</span> from your institutional faculty roster?
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingFaculty(null)}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={submitting}
                  className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Removing..." : "Remove Faculty"}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
