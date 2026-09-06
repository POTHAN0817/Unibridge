import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { industryService } from "../../services/industryService";
import { IndustryProfile as IIndustryProfile } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import {
  Building2,
  Globe,
  MapPin,
  Save,
  CheckCircle2,
  AlertCircle,
  Edit3,
  X,
  Plus,
  Layers,
  Cpu,
  Wrench,
  Database,
  Lightbulb,
  Handshake,
  DollarSign,
  GraduationCap,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  ArrowRight,
} from "lucide-react";

interface TagInputProps {
  label: string;
  tags: string[];
  onChange: (newTags: string[]) => void;
  placeholder?: string;
  helperText?: string;
}

function TagInput({ label, tags, onChange, placeholder = "Type and press Enter...", helperText }: TagInputProps) {
  const [inputVal, setInputVal] = useState("");

  const handleAdd = () => {
    const trimmed = inputVal.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInputVal("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">{label}</label>
        <span className="text-[10px] text-gray-400">{tags.length} items</span>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Plus size={13} /> Add
        </button>
      </div>

      {helperText && <p className="text-[11px] text-gray-400">{helperText}</p>}

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-amber-500 hover:text-rose-600 cursor-pointer ml-0.5"
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function IndustryProfile() {
  const { user } = useAuth();

  const [profile, setProfile] = useState<IIndustryProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [industrySector, setIndustrySector] = useState("");
  const [subSectors, setSubSectors] = useState<string[]>([]);
  const [headquartersLocation, setHeadquartersLocation] = useState("");
  const [operatingLocations, setOperatingLocations] = useState<string[]>([]);
  const [expertise, setExpertise] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [infrastructure, setInfrastructure] = useState<string[]>([]);
  const [resourcesAvailable, setResourcesAvailable] = useState<string[]>([]);
  const [researchInterests, setResearchInterests] = useState<string[]>([]);
  const [collaborationInterests, setCollaborationInterests] = useState<string[]>([]);
  const [fundingCapacity, setFundingCapacity] = useState("");
  const [mentorshipCapacity, setMentorshipCapacity] = useState("");
  const [availability, setAvailability] = useState("available");

  function populateForm(p: IIndustryProfile) {
    setCompanyName(p.company_name || "");
    setShortName(p.short_name || "");
    setDescription(p.description || "");
    setWebsite(p.website || "");
    setIndustrySector(p.industry_sector || "");
    setSubSectors(p.sub_sectors || []);
    setHeadquartersLocation(p.headquarters_location || "");
    setOperatingLocations(p.operating_locations || []);
    setExpertise(p.expertise || []);
    setTechnologies(p.technologies || []);
    setCapabilities(p.capabilities || []);
    setInfrastructure(p.infrastructure || []);
    setResourcesAvailable(p.resources_available || []);
    setResearchInterests(p.research_interests || []);
    setCollaborationInterests(p.collaboration_interests || []);
    setFundingCapacity(p.funding_capacity || "");
    setMentorshipCapacity(p.mentorship_capacity || "");
    setAvailability(p.availability || "available");
  }

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const data = await industryService.getProfile();
      setProfile(data);
      if (data) {
        populateForm(data);
        setIsEditing(false);
      } else {
        // Fallback to initial auth registration metadata for pre-filling
        const userProf = (user?.profile as Record<string, any>) || {};
        setCompanyName(user?.organization || userProf.company_name || "");
        setIndustrySector(userProf.industry_sector || user?.sector || "");
        setHeadquartersLocation(userProf.location || "");
        if (Array.isArray(userProf.expertise)) {
          setExpertise(userProf.expertise);
        }
        if (Array.isArray(userProf.support_capabilities)) {
          setCapabilities(userProf.support_capabilities);
        }
        setIsEditing(true); // Open edit form immediately if profile not yet created
      }
    } catch (err: any) {
      console.error("Failed to load industry profile:", err);
      setError(err?.message || "Failed to load corporate profile from UniBridge database.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!companyName.trim()) {
      setFeedback({ type: "error", message: "Company name is required." });
      return;
    }
    if (!industrySector.trim()) {
      setFeedback({ type: "error", message: "Industry sector is required." });
      return;
    }

    setSaving(true);
    setFeedback(null);

    const payload = {
      company_name: companyName.trim(),
      short_name: shortName.trim() || undefined,
      description: description.trim() || undefined,
      website: website.trim() || undefined,
      industry_sector: industrySector.trim(),
      sub_sectors: subSectors,
      headquarters_location: headquartersLocation.trim() || undefined,
      operating_locations: operatingLocations,
      expertise,
      technologies,
      capabilities,
      infrastructure,
      resources_available: resourcesAvailable,
      research_interests: researchInterests,
      collaboration_interests: collaborationInterests,
      funding_capacity: fundingCapacity.trim() || undefined,
      mentorship_capacity: mentorshipCapacity.trim() || undefined,
      availability,
    };

    try {
      let savedProfile: IIndustryProfile;
      if (profile) {
        savedProfile = await industryService.updateProfile(payload);
      } else {
        savedProfile = await industryService.createProfile(payload as any);
      }
      setProfile(savedProfile);
      populateForm(savedProfile);
      setIsEditing(false);
      setFeedback({ type: "success", message: "Corporate profile saved successfully to MongoDB!" });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      console.error("Failed to save industry profile:", err);
      setFeedback({ type: "error", message: err?.message || "Failed to save corporate profile." });
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (profile) {
      populateForm(profile);
      setIsEditing(false);
    }
    setFeedback(null);
  }

  if (loading) {
    return <LoadingState message="Loading corporate credentials and technological capabilities..." />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Corporate Innovation"
        badgeColor="#F59E0B"
        title={profile?.company_name || companyName || "Corporate Profile"}
        subtitle="Manage company credentials, technological assets, research interests, and collaborative capabilities."
      >
        <div className="flex items-center gap-2">
          {profile && !isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs cursor-pointer"
            >
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : profile ? (
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-white hover:bg-slate-100 border border-gray-200 transition-all shadow-xs cursor-pointer"
            >
              <X size={14} /> Cancel Editing
            </button>
          ) : null}
        </div>
      </DashboardHeader>

      <PageContainer maxWidth="lg">
        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={loadProfile}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Feedback alert */}
        {feedback && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between animate-in fade-in ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ================================================================= */}
        {/* VIEW MODE */}
        {/* ================================================================= */}
        {!isEditing && profile && (
          <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-gray-500 font-medium block mb-1">Industry Sector</span>
                <span className="text-base font-extrabold text-[#071A33] block truncate">
                  {profile.industry_sector}
                </span>
                <span className="text-[11px] text-amber-600 font-semibold mt-0.5 block">
                  {profile.sub_sectors?.length || 0} Sub-sectors
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-gray-500 font-medium block mb-1">Operating Footprint</span>
                <span className="text-base font-extrabold text-[#071A33] block truncate">
                  {profile.headquarters_location || "Headquarters"}
                </span>
                <span className="text-[11px] text-gray-400 font-medium mt-0.5 block">
                  {profile.operating_locations?.length || 0} Operational hubs
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-gray-500 font-medium block mb-1">Technical Assets</span>
                <span className="text-base font-extrabold text-[#071A33] block">
                  {(profile.technologies?.length || 0) + (profile.capabilities?.length || 0)}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
                  {profile.expertise?.length || 0} Core expertises
                </span>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs">
                <span className="text-xs text-gray-500 font-medium block mb-1">Collaboration Readiness</span>
                <span className="text-base font-extrabold text-[#071A33] block capitalize">
                  {profile.availability.replace("_", " ")}
                </span>
                <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">
                  {(profile.research_interests?.length || 0) + (profile.collaboration_interests?.length || 0)} Focus areas
                </span>
              </div>
            </div>

            {/* Section 1: Company Overview */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold text-lg">
                    {profile.company_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#071A33] flex items-center gap-2">
                      {profile.company_name}
                      {profile.short_name && (
                        <span className="text-xs font-bold text-gray-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {profile.short_name}
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {profile.headquarters_location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} /> {profile.headquarters_location}
                        </span>
                      ) : (
                        "Corporate Entity"
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {profile.industry_sector}
                  </span>
                  {profile.website && (
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200"
                    >
                      <Globe size={12} /> Website <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>

              {profile.description && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Company Overview</span>
                  <p className="text-xs text-gray-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-gray-100">
                    {profile.description}
                  </p>
                </div>
              )}

              {/* Sub-sectors and Operating Locations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Specialized Sub-Sectors</span>
                  {profile.sub_sectors && profile.sub_sectors.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.sub_sectors.map((s, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-slate-100 text-gray-800 px-2.5 py-1 rounded-xl border border-gray-200/60"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No sub-sectors specified.</p>
                  )}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Operating Locations</span>
                  {profile.operating_locations && profile.operating_locations.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.operating_locations.map((loc, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-gray-800 px-2.5 py-1 rounded-xl border border-gray-200/60"
                        >
                          <MapPin size={11} className="text-gray-400" /> {loc}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No operating locations specified.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Technical Assets & Capabilities */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Cpu size={18} className="text-amber-600" />
                <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                  Technological Assets & Capabilities
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expertise */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Core Industrial Expertise</span>
                  {profile.expertise && profile.expertise.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.expertise.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No expertise areas listed.</p>
                  )}
                </div>

                {/* Technologies */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Proprietary Technologies & Stacks</span>
                  {profile.technologies && profile.technologies.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.technologies.map((tech, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-sky-50 text-sky-900 border border-sky-200 px-2.5 py-1 rounded-xl"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No technologies listed.</p>
                  )}
                </div>

                {/* Capabilities */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Operational Support Capabilities</span>
                  {profile.capabilities && profile.capabilities.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.capabilities.map((cap, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-xl"
                        >
                          {cap}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No support capabilities listed.</p>
                  )}
                </div>

                {/* Infrastructure */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Labs & Testing Infrastructure</span>
                  {profile.infrastructure && profile.infrastructure.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.infrastructure.map((inf, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-purple-50 text-purple-900 border border-purple-200 px-2.5 py-1 rounded-xl"
                        >
                          {inf}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No laboratory or testing facilities listed.</p>
                  )}
                </div>
              </div>

              {/* Resources Available */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <span className="text-xs font-bold text-gray-700 block">Corporate Resources Available for Cohorts</span>
                {profile.resources_available && profile.resources_available.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.resources_available.map((res, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold bg-slate-100 text-gray-800 border border-gray-200 px-2.5 py-1 rounded-xl"
                      >
                        {res}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No resources listed.</p>
                )}
              </div>
            </div>

            {/* Section 3: Collaborative Engagement & Capacities */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Handshake size={18} className="text-amber-600" />
                <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                  R&D Interests & Collaboration Capacities
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Research Interests */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Civic Research Themes of Interest</span>
                  {profile.research_interests && profile.research_interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.research_interests.map((ri, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200 px-2.5 py-1 rounded-xl"
                        >
                          {ri}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No research interests listed.</p>
                  )}
                </div>

                {/* Collaboration Interests */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 block">Target Collaboration Modes</span>
                  {profile.collaboration_interests && profile.collaboration_interests.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {profile.collaboration_interests.map((ci, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl"
                        >
                          {ci}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 italic">No collaboration modes listed.</p>
                  )}
                </div>
              </div>

              {/* Funding & Mentorship Capacities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <DollarSign size={14} className="text-emerald-600" /> CSR / Grant Funding Capacity
                  </div>
                  <p className="text-xs text-gray-600">
                    {profile.funding_capacity || "Available upon project review and milestone assessment."}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-gray-100 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                    <GraduationCap size={14} className="text-purple-600" /> Industry Mentorship Capacity
                  </div>
                  <p className="text-xs text-gray-600">
                    {profile.mentorship_capacity || "Dedicated technical leads and engineering advisors."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="flex items-center justify-between text-[11px] text-gray-400 px-2">
              <span>Profile ID: {profile.id}</span>
              <span>
                Last Updated: {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Recently"}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* EDIT / CREATE FORM */}
        {/* ================================================================= */}
        {isEditing && (
          <form onSubmit={handleSave} className="space-y-8">
            {/* Header banner for edit */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-base font-extrabold text-[#071A33]">
                  {profile ? "Edit Corporate Profile" : "Create Industry Partner Profile"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Configure corporate details, domain sectors, and technological assets for university research collaboration.
                </p>
              </div>

              {/* 1. Core Corporate Info */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  1. Corporate Identity & Overview
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Company Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. EcoGrid Technologies Ltd."
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Short Name / Brand Abbreviation
                    </label>
                    <input
                      type="text"
                      value={shortName}
                      onChange={(e) => setShortName(e.target.value)}
                      placeholder="e.g. EcoGrid"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Company Description / R&D Mission
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your corporate focus, technological mission, and collaboration objectives with universities..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Official Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Collaboration Availability Status
                    </label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="available">Actively Seeking University Projects (Available)</option>
                      <option value="limited">Selective / Limited Project Capacity</option>
                      <option value="busy">Committed / Current Cohorts Underway</option>
                      <option value="unavailable">Temporarily Unavailable</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Headquarters Location
                    </label>
                    <input
                      type="text"
                      value={headquartersLocation}
                      onChange={(e) => setHeadquartersLocation(e.target.value)}
                      placeholder="e.g. Pune, Maharashtra, India"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <TagInput
                      label="Operating Locations"
                      tags={operatingLocations}
                      onChange={setOperatingLocations}
                      placeholder="e.g. Bengaluru, Hyderabad..."
                    />
                  </div>
                </div>
              </div>

              {/* 2. Industry Sector & Sub-sectors */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  2. Sector Classification & Domain Focus
                </h4>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Primary Industry Sector <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={industrySector}
                    onChange={(e) => setIndustrySector(e.target.value)}
                    placeholder="e.g. Renewable Energy, Healthcare & Life Sciences, Smart Infrastructure..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                  />
                </div>

                <TagInput
                  label="Specialized Sub-Sectors"
                  tags={subSectors}
                  onChange={setSubSectors}
                  placeholder="e.g. Solar Photovoltaics, Water Desalination, IoT Sensors..."
                />
              </div>

              {/* 3. Technological Assets & Infrastructure */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  3. Technological Assets, Infrastructure & Resources
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TagInput
                    label="Core Industrial Expertise"
                    tags={expertise}
                    onChange={setExpertise}
                    placeholder="e.g. Precision Engineering, Embedded Systems, AI Analytics..."
                  />

                  <TagInput
                    label="Technologies & Stacks"
                    tags={technologies}
                    onChange={setTechnologies}
                    placeholder="e.g. SCADA, PyTorch, LoRaWAN, Rust..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TagInput
                    label="Operational Support Capabilities"
                    tags={capabilities}
                    onChange={setCapabilities}
                    placeholder="e.g. Field Testing, Regulatory Compliance, Rapid Prototyping..."
                  />

                  <TagInput
                    label="Labs & Infrastructure"
                    tags={infrastructure}
                    onChange={setInfrastructure}
                    placeholder="e.g. CNC Fabrication Lab, Cleanroom, Hardware Emulation Bed..."
                  />
                </div>

                <TagInput
                  label="Available Resources for Cohorts"
                  tags={resourcesAvailable}
                  onChange={setResourcesAvailable}
                  placeholder="e.g. Anonymized Sensor Data, Microcontroller Kits, Cloud Credits..."
                />
              </div>

              {/* 4. R&D Interests & Capacities */}
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  4. Collaborative R&D Themes & Capacities
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TagInput
                    label="Civic Research Interests"
                    tags={researchInterests}
                    onChange={setResearchInterests}
                    placeholder="e.g. Low-cost water purification, Rural cold-chain storage..."
                  />

                  <TagInput
                    label="Collaboration Modes of Interest"
                    tags={collaborationInterests}
                    onChange={setCollaborationInterests}
                    placeholder="e.g. Joint Field Pilot, Technology Licensing, Student Mentorship..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Funding / CSR Grant Capacity
                    </label>
                    <input
                      type="text"
                      value={fundingCapacity}
                      onChange={(e) => setFundingCapacity(e.target.value)}
                      placeholder="e.g. Seed funding up to ₹15 Lakhs per approved prototype"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Industry Mentorship Capacity
                    </label>
                    <input
                      type="text"
                      value={mentorshipCapacity}
                      onChange={(e) => setMentorshipCapacity(e.target.value)}
                      placeholder="e.g. 4 Principal Engineers available for weekly sprints"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 border border-gray-200 focus:bg-white focus:border-amber-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                {profile ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:text-gray-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                ) : (
                  <span className="text-xs text-gray-400">All information is securely stored in MongoDB.</span>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 transition-all shadow-xs cursor-pointer"
                >
                  <Save size={15} /> {saving ? "Saving Profile..." : "Save Corporate Profile"}
                </button>
              </div>
            </div>
          </form>
        )}
      </PageContainer>
    </div>
  );
}
