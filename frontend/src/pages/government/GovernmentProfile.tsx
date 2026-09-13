import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { governmentService } from "../../services/governmentService";
import { GovernmentProfile as GovernmentProfileType, JurisdictionLevel } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import {
  Building2,
  Mail,
  Phone,
  Save,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Tag,
  FileText,
} from "lucide-react";

export default function GovernmentProfile() {
  const { user, logout } = useAuth();

  const [profile, setProfile] = useState<GovernmentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [deptName, setDeptName] = useState("");
  const [deptType, setDeptType] = useState("Urban Development");
  const [designation, setDesignation] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [jurisdictionLevel, setJurisdictionLevel] = useState<JurisdictionLevel>("district");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [areasOfFocus, setAreasOfFocus] = useState("");

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const data = await governmentService.getProfile();
      if (data) {
        setProfile(data);
        setDeptName(data.department_name || "");
        setDeptType(data.department_type || "Urban Development");
        setDesignation(data.designation || "");
        setJurisdiction(data.jurisdiction || "");
        setJurisdictionLevel(data.jurisdiction_level || "district");
        setState(data.state || "");
        setDistrict(data.district || "");
        setCity(data.city || "");
        setOfficialEmail(data.official_email || user?.email || "");
        setPhone(data.phone || "");
        setDescription(data.description || "");
        setAreasOfFocus(data.areas_of_focus ? data.areas_of_focus.join(", ") : "");
      } else {
        // New profile defaults from authenticated user token
        setOfficialEmail(user?.email || "");
        setDeptName(user?.department || (user?.profile as Record<string, any>)?.department_name || "");
        setDesignation(user?.designation || (user?.profile as Record<string, any>)?.designation || "");
        setState(user?.state || "");
        setDistrict(user?.district || "");
      }
    } catch (err: any) {
      console.error("Failed to load government profile:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load government profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!deptName.trim() || !deptType.trim() || !designation.trim() || !jurisdiction.trim() || !officialEmail.trim()) {
      setError("Department name, type, designation, jurisdiction, and official email are required.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const focusList = areasOfFocus
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      if (profile) {
        const updated = await governmentService.updateProfile({
          department_name: deptName.trim(),
          department_type: deptType.trim(),
          designation: designation.trim(),
          jurisdiction: jurisdiction.trim(),
          jurisdiction_level: jurisdictionLevel,
          state: state.trim() || undefined,
          district: district.trim() || undefined,
          city: city.trim() || undefined,
          official_email: officialEmail.trim(),
          phone: phone.trim() || undefined,
          description: description.trim() || undefined,
          areas_of_focus: focusList,
        });
        setProfile(updated);
      } else {
        const created = await governmentService.createProfile({
          department_name: deptName.trim(),
          department_type: deptType.trim(),
          designation: designation.trim(),
          jurisdiction: jurisdiction.trim(),
          jurisdiction_level: jurisdictionLevel,
          state: state.trim() || undefined,
          district: district.trim() || undefined,
          city: city.trim() || undefined,
          official_email: officialEmail.trim(),
          phone: phone.trim() || undefined,
          description: description.trim() || undefined,
          areas_of_focus: focusList,
        });
        setProfile(created);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error("Failed to save government profile:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to save official profile.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading official government credentials..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge={profile ? `${profile.department_name} · ${profile.jurisdiction_level.toUpperCase()}` : "Official Officer Account"}
        badgeColor="#10B981"
        title="Government Nodal Profile & Authorization"
        subtitle="Manage government department credentials, administrative jurisdiction, official contact details, and priority focus areas."
      />

      <PageContainer maxWidth="lg">
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          {/* Administrative Overview KPI Strip */}
          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8 p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Jurisdiction Level
                </span>
                <span className="text-base font-bold text-gray-900 capitalize">
                  {profile.jurisdiction_level}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Official Sector
                </span>
                <span className="text-base font-bold text-gray-900 truncate block">
                  {profile.department_type}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Completed Reviews
                </span>
                <span className="text-base font-bold text-emerald-900 font-mono">
                  {profile.reviews_completed_count ?? 0}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Active Actions
                </span>
                <span className="text-base font-bold text-emerald-900 font-mono">
                  {profile.open_actions_count ?? 0}
                </span>
              </div>
            </div>
          )}

          {saved && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 size={16} /> Official government profile saved to database successfully!
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Department & Ministry */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Building2 size={16} className="text-emerald-600" />
                <span>Department & Ministry Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Department / Ministry Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    placeholder="e.g., Directorate of Municipal Administration"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Department Type / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={deptType}
                    onChange={(e) => setDeptType(e.target.value)}
                    placeholder="e.g., Urban Development, Agriculture, Public Works"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Officer & Jurisdiction */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Officer Designation & Administrative Jurisdiction</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Official Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g., District Collector / Nodal Officer"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Jurisdiction Area *
                  </label>
                  <input
                    type="text"
                    required
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    placeholder="e.g., Madurai District Administration"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Jurisdiction Level *
                  </label>
                  <select
                    value={jurisdictionLevel}
                    onChange={(e) => setJurisdictionLevel(e.target.value as JurisdictionLevel)}
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none cursor-pointer"
                  >
                    <option value="national">National Level</option>
                    <option value="state">State Level</option>
                    <option value="district">District Level</option>
                    <option value="city">City / Municipal</option>
                    <option value="local">Local Panchayat / Block</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section 3: Geographic Coverage */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={16} className="text-emerald-600" />
                <span>Geographic Location</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g., Jharkhand"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g., Ranchi"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    City / Town
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g., Ranchi, Jamshedpur, Dhanbad"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Official Contacts */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-emerald-600" />
                <span>Official Communications</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={officialEmail}
                    onChange={(e) => setOfficialEmail(e.target.value)}
                    placeholder="nodal.officer@gov.in"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Official Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g., 0452-2530000"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Focus Areas & Notes */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={16} className="text-emerald-600" />
                <span>Priority Focus Areas & Mission Description</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Areas of Focus (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={areasOfFocus}
                    onChange={(e) => setAreasOfFocus(e.target.value)}
                    placeholder="Water Supply, Solid Waste Management, Rural Roadways, Agricultural Cold Chain"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Used to match citizen problem clusters and university pilots to your administrative oversight domain.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Department Mandate & Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of department scope, civic oversight mandate, and pilot testing testbeds..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-between border-t border-gray-100">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Save size={15} /> {submitting ? "Saving to Database..." : profile ? "Update Official Profile" : "Create Official Profile"}
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
        </div>
      </PageContainer>
    </div>
  );
}
