import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  X,
  CheckCircle2,
  AlertCircle,
  Mail,
  Lock,
  Sparkles,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Layers,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import { StudentMember, StudentCreateInput, StudentUpdateInput, UniversityProfile } from "../../types";

interface StudentEnrollFormData {
  name: string;
  email: string;
  department: string;
  degree: string;
  skillsText: string;
  interestsText: string;
  availability: boolean;
}

interface StudentEditFormData {
  name: string;
  department: string;
  degree: string;
  skillsText: string;
  interestsText: string;
  availability: boolean;
}

const INITIAL_ENROLL_FORM: StudentEnrollFormData = {
  name: "",
  email: "",
  department: "",
  degree: "B.Tech Computer Science",
  skillsText: "",
  interestsText: "",
  availability: true,
};

export default function UniversityStudents() {
  const [students, setStudents] = useState<StudentMember[]>([]);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedSkill, setSelectedSkill] = useState("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | "available" | "busy">("all");

  // Modal states
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentMember | null>(null);

  // Form states
  const [enrollForm, setEnrollForm] = useState<StudentEnrollFormData>(INITIAL_ENROLL_FORM);
  const [editForm, setEditForm] = useState<StudentEditFormData>({
    name: "",
    department: "",
    degree: "",
    skillsText: "",
    interestsText: "",
    availability: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Load real student roster from API
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [studentsData, profileData] = await Promise.all([
        universityService.getStudentList(),
        universityService.getMyProfile(),
      ]);
      setStudents(studentsData);
      setProfile(profileData);
    } catch (err: any) {
      console.error("Failed to load student roster:", err);
      setError(err?.response?.data?.detail || "Failed to load student innovators. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Dismiss feedback toast after 4s
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Derived filter options
  const departmentOptions = useMemo(() => {
    const set = new Set<string>();
    profile?.departments?.forEach((d) => d.name && set.add(d.name.trim()));
    students.forEach((s) => s.department && set.add(s.department.trim()));
    return Array.from(set).sort();
  }, [profile, students]);

  const skillOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      s.skills?.forEach((sk) => sk && set.add(sk.trim()));
    });
    profile?.student_skills?.forEach((sk) => sk && set.add(sk.trim()));
    return Array.from(set).sort();
  }, [students, profile]);

  // Filtered students list
  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return students.filter((s) => {
      // Department filter
      if (selectedDepartment !== "all") {
        if (!s.department || s.department.toLowerCase() !== selectedDepartment.toLowerCase()) {
          return false;
        }
      }

      // Skill filter
      if (selectedSkill !== "all") {
        const hasSkill = (s.skills || []).some(
          (sk) => sk.toLowerCase() === selectedSkill.toLowerCase()
        );
        if (!hasSkill) return false;
      }

      // Availability filter
      if (selectedAvailability !== "all") {
        const isAvail = s.availability !== false;
        if (selectedAvailability === "available" && !isAvail) return false;
        if (selectedAvailability === "busy" && isAvail) return false;
      }

      // Text query search (name, email, department, degree, skills, interests)
      if (q) {
        const inName = s.name.toLowerCase().includes(q);
        const inEmail = s.email.toLowerCase().includes(q);
        const inDept = (s.department || "").toLowerCase().includes(q);
        const inDeg = (s.degree || "").toLowerCase().includes(q);
        const inSkills = (s.skills || []).some((sk) => sk.toLowerCase().includes(q));
        const inInterests = (s.interests || []).some((it) => it.toLowerCase().includes(q));
        return inName || inEmail || inDept || inDeg || inSkills || inInterests;
      }

      return true;
    });
  }, [students, searchQuery, selectedDepartment, selectedSkill, selectedAvailability]);

  // Tag parser
  const parseTags = (text: string): string[] => {
    return text
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  // Open Edit Modal
  const handleOpenEdit = (s: StudentMember) => {
    setEditingStudent(s);
    setEditForm({
      name: s.name,
      department: s.department || "",
      degree: s.degree || "",
      skillsText: (s.skills || []).join(", "),
      interestsText: (s.interests || []).join(", "),
      availability: s.availability !== false,
    });
    setModalError(null);
  };

  // Submit Enroll Student Form
  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    const cleanName = enrollForm.name.trim();
    const cleanEmail = enrollForm.email.trim().toLowerCase();

    if (!cleanName) {
      setModalError("Student full name is required.");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setModalError("A valid student email address is required.");
      return;
    }

    const payload: StudentCreateInput = {
      name: cleanName,
      email: cleanEmail,
      department: enrollForm.department.trim() || undefined,
      degree: enrollForm.degree.trim() || undefined,
      skills: parseTags(enrollForm.skillsText),
      interests: parseTags(enrollForm.interestsText),
      availability: enrollForm.availability,
    };

    setSubmitting(true);
    try {
      const created = await universityService.createStudent(payload);
      setStudents((prev) => [created, ...prev]);
      setFeedback({
        type: "success",
        message: `${created.name} registered to your institutional student innovators roster.`,
      });
      setIsEnrollModalOpen(false);
      setEnrollForm(INITIAL_ENROLL_FORM);
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || "Failed to register student record.");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Edit Student Form
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setModalError(null);

    const payload: StudentUpdateInput = {
      name: editForm.name.trim() || undefined,
      department: editForm.department.trim() || undefined,
      degree: editForm.degree.trim() || undefined,
      skills: parseTags(editForm.skillsText),
      interests: parseTags(editForm.interestsText),
      availability: editForm.availability,
    };

    setSubmitting(true);
    try {
      const updated = await universityService.updateStudent(editingStudent.id, payload);
      setStudents((prev) =>
        prev.map((s) => (s.id === updated.id ? updated : s))
      );
      setFeedback({
        type: "success",
        message: `Competencies for ${updated.name} updated successfully.`,
      });
      setEditingStudent(null);
    } catch (err: any) {
      setModalError(err?.response?.data?.detail || "Failed to update student competencies.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedDepartment !== "all" ||
    selectedSkill !== "all" ||
    selectedAvailability !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedDepartment("all");
    setSelectedSkill("all");
    setSelectedAvailability("all");
  };

  // Real metric counts
  const availableCount = students.filter((s) => s.availability !== false).length;
  const distinctDepartmentsCount = new Set(students.map((s) => s.department).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-slate-50/50">
      <DashboardHeader
        badge="Student Innovator Corps"
        badgeColor="#8B5CF6"
        title="Student Innovators & Research Corps"
        subtitle="Manage student researchers, interdisciplinary skill competencies, and civic challenge project readiness."
      >
        <button
          onClick={() => {
            setEnrollForm(INITIAL_ENROLL_FORM);
            setModalError(null);
            setIsEnrollModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs cursor-pointer"
        >
          <Plus size={15} /> Enroll Student Innovator
        </button>
      </DashboardHeader>

      <PageContainer>
        {/* Feedback Toast */}
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

        {/* Real Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Enrolled Students</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071A33]">{students.length}</span>
              <span className="text-[11px] text-purple-600 font-semibold">Institutional Corps</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Available for Cohorts</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{availableCount}</span>
              <span className="text-[11px] text-gray-400">Ready to adopt</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Departments</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#071A33]">{distinctDepartmentsCount}</span>
              <span className="text-[11px] text-gray-400">Academic Units</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200/80 rounded-2xl p-4 shadow-xs">
            <span className="text-xs text-gray-500 font-medium block mb-1">Technical Skills</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-600">{skillOptions.length}</span>
              <span className="text-[11px] text-gray-400">Competency domains</span>
            </div>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white border border-gray-200/80 rounded-2xl p-4 mb-6 shadow-xs flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, email, department, degree, or skill..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Department, Skill, Availability Selectors */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departmentOptions.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Skill Filter */}
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Skills</option>
              {skillOptions.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>

            {/* Availability Filter */}
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value as any)}
              className="text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
            >
              <option value="all">All Availability</option>
              <option value="available">Available for Projects</option>
              <option value="busy">Busy / Inactive</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2.5 py-1.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}

            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-xl shrink-0">
              {filteredStudents.length} of {students.length} Students
            </span>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState message="Loading institutional student innovators..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h4 className="text-sm font-bold text-[#071A33]">Unable to load student innovators</h4>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
              <Users size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#071A33]">No student researchers registered yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
              Register student innovators and researchers to your institutional roster. Once added, students can be aligned with multidisciplinary faculty mentors to engineer solutions for adopted civic challenges.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setEnrollForm(INITIAL_ENROLL_FORM);
                  setModalError(null);
                  setIsEnrollModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
              >
                <Plus size={15} /> Enroll First Student Innovator
              </button>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-10 text-center max-w-md mx-auto space-y-3 shadow-xs">
            <p className="text-xs text-gray-500">
              No students match your active filter criteria.
            </p>
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-purple-600 hover:text-purple-700 underline cursor-pointer"
            >
              Clear filters and view all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((s) => {
              const isAvailable = s.availability !== false;
              const initial = s.name?.trim().charAt(0).toUpperCase() || "S";

              return (
                <div
                  key={s.id}
                  className="bg-white border border-gray-200/90 hover:border-purple-300 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header: Avatar, Name & Availability Badge */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-extrabold text-sm shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#071A33] leading-tight line-clamp-1">
                            {s.name}
                          </h3>
                          <p className="text-xs font-semibold text-purple-600">
                            {s.degree || "Student Innovator"}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {s.department || "Academic Department"}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
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

                    {/* Email Contact (Identity-verified) */}
                    <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-gray-600">
                      <Mail size={13} className="text-gray-400 shrink-0" />
                      <span className="truncate flex-1">{s.email}</span>
                      <span title="Identity-verified academic email">
                        <Lock size={11} className="text-gray-400 shrink-0" />
                      </span>
                    </div>

                    {/* Skills Competencies */}
                    {s.skills && s.skills.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Technical Competencies
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {s.skills.map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Research & Civic Interests */}
                    {s.interests && s.interests.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                          Civic & Research Interests
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {s.interests.map((interest, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-md font-medium"
                            >
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Timestamp & Edit action */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[11px] text-gray-400">
                      Enrolled: {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recently"}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-xl hover:bg-purple-50 transition-colors cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit Competencies
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Enroll Student */}
        {isEnrollModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">Enroll Student Innovator</h3>
                  <p className="text-xs text-gray-500">Register a student to your institutional innovation corps</p>
                </div>
                <button
                  onClick={() => setIsEnrollModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleEnrollSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={enrollForm.name}
                    onChange={(e) => setEnrollForm({ ...enrollForm, name: e.target.value })}
                    placeholder="e.g. Arjun Sharma"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={enrollForm.email}
                    onChange={(e) => setEnrollForm({ ...enrollForm, email: e.target.value })}
                    placeholder="e.g. arjun.sharma@student.university.edu"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Academic Department</label>
                    <input
                      type="text"
                      list="enroll-dept-list"
                      value={enrollForm.department}
                      onChange={(e) => setEnrollForm({ ...enrollForm, department: e.target.value })}
                      placeholder="e.g. Computer Science"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                    <datalist id="enroll-dept-list">
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Degree / Program</label>
                    <input
                      type="text"
                      value={enrollForm.degree}
                      onChange={(e) => setEnrollForm({ ...enrollForm, degree: e.target.value })}
                      placeholder="e.g. B.Tech Computer Science"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Technical Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={enrollForm.skillsText}
                    onChange={(e) => setEnrollForm({ ...enrollForm, skillsText: e.target.value })}
                    placeholder="Python, React, Computer Vision, Embedded IoT"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Civic & Research Interests <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={enrollForm.interestsText}
                    onChange={(e) => setEnrollForm({ ...enrollForm, interestsText: e.target.value })}
                    placeholder="Urban Mobility, Water Quality, Renewable Energy"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="enroll-availability-toggle"
                    checked={enrollForm.availability}
                    onChange={(e) => setEnrollForm({ ...enrollForm, availability: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="enroll-availability-toggle" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Available for multidisciplinary project cohorts
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsEnrollModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Enrolling..." : "Enroll Student"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Student Competencies */}
        {editingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">Edit Student Competencies</h3>
                  <p className="text-xs text-gray-500">Update academic institutional details and technical competencies</p>
                </div>
                <button
                  onClick={() => setEditingStudent(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4">
                {/* Read-Only Identity / Email */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Student Email <span className="text-gray-400 font-normal">(Identity Locked)</span>
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600">
                    <Lock size={13} className="text-gray-400" />
                    <span>{editingStudent.email}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Student email is identity-verified and cannot be altered by institutional managers.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Student Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      list="edit-dept-list"
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      placeholder="e.g. Mechanical Engineering"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                    <datalist id="edit-dept-list">
                      {departmentOptions.map((dept) => (
                        <option key={dept} value={dept} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Degree / Program</label>
                    <input
                      type="text"
                      value={editForm.degree}
                      onChange={(e) => setEditForm({ ...editForm, degree: e.target.value })}
                      placeholder="e.g. M.Tech Robotics"
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Technical Skills <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.skillsText}
                    onChange={(e) => setEditForm({ ...editForm, skillsText: e.target.value })}
                    placeholder="Python, Embedded C, GIS, Sensor Calibration"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Civic & Research Interests <span className="text-gray-400 font-normal">(comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.interestsText}
                    onChange={(e) => setEditForm({ ...editForm, interestsText: e.target.value })}
                    placeholder="Waste Management, Clean Water, Air Quality"
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="edit-availability-toggle"
                    checked={editForm.availability}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.checked })}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <label htmlFor="edit-availability-toggle" className="text-xs font-medium text-gray-700 cursor-pointer">
                    Available for challenge cohorts
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setEditingStudent(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? "Saving..." : "Save Competencies"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
