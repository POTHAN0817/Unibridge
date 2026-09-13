import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import {
  GraduationCap,
  Building,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Layers,
  FlaskConical,
  Users,
  FolderGit2,
  Sparkles,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import type {
  UniversityProfile as UniversityProfileType,
  UniversityDepartmentItem,
  UniversityFacultyItem,
  UniversityProjectItem,
} from "../../types";

export default function UniversityProfile() {
  const { user, logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // University Core Fields
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [availability, setAvailability] = useState<string>("available");

  // Arrays (Comma-separated or Structured)
  const [skillsStr, setSkillsStr] = useState("");
  const [researchAreasStr, setResearchAreasStr] = useState("");
  const [studentSkillsStr, setStudentSkillsStr] = useState("");
  const [infrastructureStr, setInfrastructureStr] = useState("");

  // Structured Lists
  const [departments, setDepartments] = useState<UniversityDepartmentItem[]>([]);
  const [faculty, setFaculty] = useState<UniversityFacultyItem[]>([]);
  const [projects, setProjects] = useState<UniversityProjectItem[]>([]);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const data = await universityService.getMyProfile();
        if (data) {
          setName(data.name || "");
          setShortName(data.short_name || "");
          setDescription(data.description || "");
          setWebsite(data.website || "");
          setCity(data.location?.city || "");
          setState(data.location?.state || "");
          setAvailability(data.availability || "available");

          setSkillsStr(data.skills?.join(", ") || "");
          setResearchAreasStr(data.research_areas?.join(", ") || "");
          setStudentSkillsStr(data.student_skills?.join(", ") || "");
          setInfrastructureStr(data.infrastructure?.join(", ") || "");

          setDepartments(data.departments || []);
          setFaculty(data.faculty || []);
          setProjects(data.previous_projects || []);
        } else if (user) {
          // Fallback to basic registration info if profile hasn't been saved yet
          setName(user.organization || (user.profile as Record<string, any>)?.university_name || "");
          setState(user.state || "");
          setCity(user.district || "");
        }
      } catch (err) {
        console.error("Failed to load university profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("University name is required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const payload: Partial<UniversityProfileType> = {
        name: name.trim(),
        short_name: shortName.trim() || undefined,
        description: description.trim() || undefined,
        website: website.trim() || undefined,
        location: {
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          country: "India",
        },
        skills: skillsStr.split(",").map((s) => s.trim()).filter(Boolean),
        research_areas: researchAreasStr.split(",").map((s) => s.trim()).filter(Boolean),
        student_skills: studentSkillsStr.split(",").map((s) => s.trim()).filter(Boolean),
        infrastructure: infrastructureStr.split(",").map((s) => s.trim()).filter(Boolean),
        departments,
        faculty,
        previous_projects: projects,
        availability,
      };

      await universityService.saveProfile(payload);
      setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err: any) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Department Handlers
  const addDepartment = () => {
    setDepartments([
      ...departments,
      { name: "", description: "", expertise: [], skills: [] },
    ]);
  };
  const updateDepartment = (idx: number, field: keyof UniversityDepartmentItem, val: any) => {
    const updated = [...departments];
    updated[idx] = { ...updated[idx], [field]: val };
    setDepartments(updated);
  };
  const removeDepartment = (idx: number) => {
    setDepartments(departments.filter((_, i) => i !== idx));
  };

  // Faculty Handlers
  const addFaculty = () => {
    setFaculty([
      ...faculty,
      { name: "", department: "", expertise: [], skills: [], research_areas: [] },
    ]);
  };
  const updateFaculty = (idx: number, field: keyof UniversityFacultyItem, val: any) => {
    const updated = [...faculty];
    updated[idx] = { ...updated[idx], [field]: val };
    setFaculty(updated);
  };
  const removeFaculty = (idx: number) => {
    setFaculty(faculty.filter((_, i) => i !== idx));
  };

  // Project Handlers
  const addProject = () => {
    setProjects([
      ...projects,
      { title: "", description: "", domain: "", year: new Date().getFullYear() },
    ]);
  };
  const updateProject = (idx: number, field: keyof UniversityProjectItem, val: any) => {
    const updated = [...projects];
    updated[idx] = { ...updated[idx], [field]: val };
    setProjects(updated);
  };
  const removeProject = (idx: number) => {
    setProjects(projects.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-white pb-16">
      <DashboardHeader
        badge="Institutional Account"
        badgeColor="#8B5CF6"
        title="Institutional Capabilities & Matching Profile"
        subtitle="Maintain verified academic expertise, laboratories, departments, and completed projects for AI challenge matching."
      />

      <PageContainer maxWidth="lg">
        <form onSubmit={handleSave} className="space-y-8">
          {saved && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 shadow-xs">
              <CheckCircle2 size={16} /> University institutional profile updated and matching vector updated!
            </div>
          )}

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2 shadow-xs">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Section 1: Institutional Core Info */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Building size={18} className="text-purple-600" />
              <h2 className="text-base font-bold text-[#071A33]">Institution Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  University / College Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PSG College of Technology"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Acronym / Short Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. PSG Tech"
                  value={shortName}
                  onChange={(e) => setShortName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Overview & Institutional Mandate
              </label>
              <textarea
                rows={3}
                placeholder="Describe your university's research focus, engineering specialties, and regional civic problem solving mission..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  City / Campus District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ranchi, Jamshedpur, Dhanbad"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  placeholder="e.g. Jharkhand"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Official Website
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Adoption Capacity / Availability
                </label>
                <select
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none font-semibold text-gray-800"
                >
                  <option value="available">Available (Accepting new challenges)</option>
                  <option value="limited">Limited (Nearing semester capacity)</option>
                  <option value="unavailable">Unavailable (Exams / Break)</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Broad Research Areas, Skills & Infrastructure */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <Sparkles size={18} className="text-purple-600" />
              <h2 className="text-base font-bold text-[#071A33]">
                University Capabilities, Lab Equipment & Student Skills
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Core Institutional Expertise & Skills (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Water Resources Engineering, IoT, GIS, Structural Analysis, Solar Power"
                  value={skillsStr}
                  onChange={(e) => setSkillsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Used for AI skill-gap matching against citizen problem demands.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Research Centers & Focus Areas (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rural Water Supply, Sustainable Agritech, Waste Water Treatment, Clean Mobility"
                  value={researchAreasStr}
                  onChange={(e) => setResearchAreasStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Dense semantic embedding corpus for problem matching.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Accredited Testing Labs & Infrastructure (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Environmental Testing Lab, Water Quality Spectrometer, CNC Workshop, Drone Test Field"
                  value={infrastructureStr}
                  onChange={(e) => setInfrastructureStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Gives 10% bonus in the explainable matching equation.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Student Skills & Capstone Competencies (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Microcontrollers, React, Python Data Science, CAD SolidWorks, Water Testing Kits"
                  value={studentSkillsStr}
                  onChange={(e) => setStudentSkillsStr(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-purple-600 focus:outline-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Skills available for undergraduate/postgraduate deployment.</p>
              </div>
            </div>
          </div>

          {/* Section 3: Academic Departments */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-purple-600" />
                <h2 className="text-base font-bold text-[#071A33]">Accredited Departments ({departments.length})</h2>
              </div>
              <button
                type="button"
                onClick={addDepartment}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Plus size={14} /> Add Department
              </button>
            </div>

            {departments.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No departments added yet. Add departments like Civil Engineering, Computer Science, or Agritech.
              </p>
            ) : (
              <div className="space-y-4">
                {departments.map((dept, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">Department #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeDepartment(idx)}
                        className="text-xs text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Department Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Civil Engineering"
                          value={dept.name}
                          onChange={(e) => updateDepartment(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Expertise Areas (Comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Water Resources, Structural Design"
                          value={dept.expertise?.join(", ") || ""}
                          onChange={(e) =>
                            updateDepartment(
                              idx,
                              "expertise",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Faculty Roster */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-purple-600" />
                <h2 className="text-base font-bold text-[#071A33]">Faculty Leads & Mentors ({faculty.length})</h2>
              </div>
              <button
                type="button"
                onClick={addFaculty}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Plus size={14} /> Add Faculty Mentor
              </button>
            </div>

            {faculty.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No faculty members registered. Add professors or principal investigators interested in community challenge adoption.
              </p>
            ) : (
              <div className="space-y-4">
                {faculty.map((fac, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">Faculty Member #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeFaculty(idx)}
                        className="text-xs text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Professor Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Dr. K. Ramesh"
                          value={fac.name}
                          onChange={(e) => updateFaculty(idx, "name", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Civil Engineering"
                          value={fac.department || ""}
                          onChange={(e) => updateFaculty(idx, "department", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Domain Research Areas (Comma separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Groundwater Hydrology, Water Filtration"
                          value={fac.research_areas?.join(", ") || ""}
                          onChange={(e) =>
                            updateFaculty(
                              idx,
                              "research_areas",
                              e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Previous Projects */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderGit2 size={18} className="text-purple-600" />
                <h2 className="text-base font-bold text-[#071A33]">
                  Previous Applied / Civic Projects ({projects.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={addProject}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                <Plus size={14} /> Add Project Experience
              </button>
            </div>

            {projects.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No previous projects listed. Adding past projects earns a 15% bonus in AI capability matching.
              </p>
            ) : (
              <div className="space-y-4">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-900">Project #{idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeProject(idx)}
                        className="text-xs text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Project Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Village Water Quality Monitoring System"
                          value={proj.title}
                          onChange={(e) => updateProject(idx, "title", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                          Domain / Sector
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Water & Sanitation"
                          value={proj.domain || ""}
                          onChange={(e) => updateProject(idx, "domain", e.target.value)}
                          className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                        Project Description & Outcomes
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Deployed solar IoT sensors across 4 rural panchayats to test fluoride contamination..."
                        value={proj.description || ""}
                        onChange={(e) => updateProject(idx, "description", e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-xs bg-white border border-gray-200 focus:outline-none focus:border-purple-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Action Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? "Saving Institutional Profile..." : "Save Verified Details"}
            </button>

            <button
              type="button"
              onClick={logout}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              Sign out of account
            </button>
          </div>
        </form>
      </PageContainer>
    </div>
  );
}
