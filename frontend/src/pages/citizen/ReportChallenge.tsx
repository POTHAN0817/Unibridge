import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Upload,
  Users,
  AlertTriangle,
  Brain,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Trash2,
  X,
  Navigation,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { useAuth } from "../../auth/AuthContext";
import {
  JHARKHAND_STATE_NAME,
  ALL_INDIAN_STATES,
  getJharkhandDistricts,
  getLocalitiesForDistrict,
  findClosestJharkhandDistrict,
  isWithinJharkhand,
  reverseGeocodeCoordinates,
  SAMPLE_GPS_PRESETS,
  SampleLocationPreset,
} from "../../data/jharkhandLocations";

const categories = [
  "Agriculture",
  "Water & Sanitation",
  "Healthcare",
  "Education",
  "Environment",
  "Infrastructure",
  "Energy",
  "Digital Connectivity",
];

export default function ReportChallenge() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Agriculture");

  // Location hierarchy state
  const [state, setState] = useState(user?.state || JHARKHAND_STATE_NAME);
  const [district, setDistrict] = useState(user?.district || "Ranchi");
  const [locality, setLocality] = useState("");
  const [customLocality, setCustomLocality] = useState("");
  const [isCustomLocality, setIsCustomLocality] = useState(false);
  const [village, setVillage] = useState("");

  // Geolocation state
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [geoStatus, setGeoStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "error">("idle");
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  const [urgency, setUrgency] = useState<"low" | "medium" | "high" | "">("");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [tags, setTags] = useState("");

  // Photo attachment state
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Simulated AI analysis while typing
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiCategory, setAiCategory] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const requestGeoLocation = (onComplete?: () => void) => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setGeoStatus("error");
      setGeoMessage("Geolocation is not supported by your browser. Please enter your location manually.");
      if (onComplete) onComplete();
      return;
    }

    if (window.isSecureContext === false && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      setGeoStatus("error");
      setGeoMessage("Browser geolocation requires a secure connection (HTTPS or localhost). Please enter your location manually.");
      if (onComplete) onComplete();
      return;
    }

    setGeoStatus("requesting");
    setGeoMessage("Acquiring GPS coordinates and resolving your exact physical location...");

    const handleSuccess = async (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;
      setLatitude(lat);
      setLongitude(lng);
      setAccuracy(acc);
      setGeoStatus("granted");

      // Perform real reverse geocoding to identify exact State, District / City, and Locality
      try {
        const geo = await reverseGeocodeCoordinates(lat, lng);
        if (geo.state) {
          setState(geo.state);
        }
        if (geo.district || geo.city) {
          setDistrict(geo.district || geo.city || "");
        }
        if (geo.locality) {
          setLocality(geo.locality);
          setIsCustomLocality(false);
          setCustomLocality("");
        }

        const resolvedLocation = [geo.locality, geo.district || geo.city, geo.state].filter(Boolean).join(", ");
        const accText = acc ? ` · ±${acc}m accuracy` : "";

        if (resolvedLocation) {
          setGeoMessage(
            `Exact location detected: ${resolvedLocation} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E${accText}). Protected under Citizen Privacy Rules.`
          );
        } else {
          // Fallback if reverse geocoding service returned no name
          if (isWithinJharkhand(lat, lng)) {
            const match = findClosestJharkhandDistrict(lat, lng);
            setState(JHARKHAND_STATE_NAME);
            setDistrict(match.district);
            const districtLocalities = getLocalitiesForDistrict(match.district);
            setLocality(districtLocalities[0] || "");
            setGeoMessage(
              `GPS location tagged: ${match.district}, Jharkhand (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E${accText}).`
            );
          } else {
            setGeoMessage(
              `GPS coordinates tagged: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E${accText}. Please verify your State & District below.`
            );
          }
        }
      } catch (geoErr) {
        console.warn("Reverse geocode failed, falling back:", geoErr);
        if (isWithinJharkhand(lat, lng)) {
          const match = findClosestJharkhandDistrict(lat, lng);
          setState(JHARKHAND_STATE_NAME);
          setDistrict(match.district);
        }
        setGeoMessage(`GPS coordinates tagged: ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E.`);
      }

      if (onComplete) onComplete();
    };

    const handleError = (err: GeolocationPositionError) => {
      console.warn("Geolocation permission error or denied:", err);
      setGeoStatus("denied");
      let msg = "Location access was denied. You can manually enter your State, District, and Locality below.";
      if (err.code === err.PERMISSION_DENIED) {
        msg = "Location permission was denied in your browser. You can manually select or type your State and District below.";
      } else if (err.code === err.POSITION_UNAVAILABLE) {
        msg = "GPS location service is unavailable on your device or network. Please enter your location manually.";
      } else if (err.code === err.TIMEOUT) {
        msg = "Location request timed out. Please enter your location manually.";
      }
      setGeoMessage(msg);
      if (onComplete) onComplete();
    };

    // First try with high accuracy; if it times out on laptop/desktop, retry with standard Wi-Fi accuracy
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      (err) => {
        if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
          navigator.geolocation.getCurrentPosition(
            handleSuccess,
            handleError,
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 120000 }
          );
        } else {
          handleError(err);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 60000,
      }
    );
  };

  const applyPresetLocation = (preset: SampleLocationPreset) => {
    setLatitude(preset.latitude);
    setLongitude(preset.longitude);
    setAccuracy(15);
    setGeoStatus("granted");
    setState(preset.state);
    setDistrict(preset.district);
    setLocality(preset.locality);
    setIsCustomLocality(false);
    setCustomLocality("");
    setGeoMessage(
      `GPS Simulated: ${preset.locality}, ${preset.district}, ${preset.state} (${preset.latitude.toFixed(4)}° N, ${preset.longitude.toFixed(4)}° E · ±15m accuracy).`
    );
  };

  const validateAndSetPhoto = (file: File): boolean => {
    setPhotoError(null);
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    const isAllowedExt = allowedExtensions.includes(ext);
    const isAllowedMime = allowedMimeTypes.includes(file.type.toLowerCase());

    if (!isAllowedExt && !isAllowedMime) {
      setPhotoError("Please upload a JPG, PNG, or WEBP image smaller than 5 MB.");
      return false;
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setPhotoError("Please upload a JPG, PNG, or WEBP image smaller than 5 MB.");
      return false;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setSelectedPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));

    // Request browser geolocation permission when citizen uploads photo
    requestGeoLocation();
    return true;
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetPhoto(e.target.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setSelectedPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (description.length > 25) {
      setAiAnalyzing(true);
      const timer = setTimeout(() => {
        setAiAnalyzing(false);
        setAiDone(true);
        if (description.toLowerCase().includes("water") || description.toLowerCase().includes("drink")) {
          setAiCategory("Water & Sanitation");
          setCategory("Water & Sanitation");
          setAiConfidence(95);
        } else if (description.toLowerCase().includes("school") || description.toLowerCase().includes("student")) {
          setAiCategory("Education");
          setCategory("Education");
          setAiConfidence(91);
        } else if (description.toLowerCase().includes("waste") || description.toLowerCase().includes("plastic")) {
          setAiCategory("Environment");
          setCategory("Environment");
          setAiConfidence(89);
        } else {
          setAiCategory("Agriculture");
          setCategory("Agriculture");
          setAiConfidence(94);
        }
      }, 900);
      return () => clearTimeout(timer);
    } else {
      setAiDone(false);
      setAiCategory("");
    }
  }, [description]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setSubmitError(null);
      const finalAddress = isCustomLocality && customLocality ? customLocality : (locality || village || undefined);
      await challengeService.createChallenge({
        title,
        description,
        category: aiCategory || category,
        location: {
          district: district || undefined,
          state: state || user?.state || JHARKHAND_STATE_NAME,
          address: finalAddress,
          latitude: latitude !== null ? latitude : undefined,
          longitude: longitude !== null ? longitude : undefined,
        },
        state: state || user?.state || JHARKHAND_STATE_NAME,
        district: district || undefined,
        address: finalAddress,
        latitude: latitude !== null ? latitude : undefined,
        longitude: longitude !== null ? longitude : undefined,
        priority: urgency === "high" ? "HIGH" : urgency === "low" ? "LOW" : "MEDIUM",
        urgency: urgency || undefined,
        affected_people: affectedPeople ? parseInt(affectedPeople.replace(/\D/g, ""), 10) || null : null,
        affectedPeople: affectedPeople || "Local Community",
        submittedBy: user?.name || "Citizen Reporter",
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        photo: selectedPhoto,
      } as any);

      navigate("/citizen/dashboard");
    } catch (err: any) {
      console.error("Failed to submit challenge:", err);
      setSubmitError(
        err.message || "Failed to submit challenge. Please check your network and make sure all fields are valid."
      );
    } finally {
      setSubmitting(false);
    }
  };



  const progressLabels = ["1. Problem Description", "2. Location & Scope", "3. Impact Details", "4. AI Review & Submit"];

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back navigation */}
        <Link
          to="/citizen/dashboard"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all mb-6 shadow-xs"
        >
          <ArrowLeft size={14} /> Back to Citizen Dashboard
        </Link>

        {/* Step Progress Bar */}
        <div className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {progressLabels.map((label, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border text-left transition-all ${step === i + 1
                    ? "bg-blue-50 border-blue-200 text-blue-800"
                    : step > i + 1
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1
                        ? "bg-emerald-600 text-white"
                        : step === i + 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span className="text-xs font-bold truncate">{label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-10 shadow-xs">
          {/* Step 1: Problem */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-1">
                  STEP 1 OF 4 · PROBLEM SCOPING
                </div>
                <h2
                  className="text-2xl font-extrabold text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Describe the societal problem affecting your community
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  CivicAI automatically detects problem categories, semantic duplicates, and urgency.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Challenge Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Farmers losing 35% of harvested vegetables due to lack of cold storage"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Detailed Problem Description
                  </label>
                  {aiAnalyzing && (
                    <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                      <Sparkles size={13} className="animate-spin" /> CivicAI Analyzing...
                    </span>
                  )}
                  {aiDone && (
                    <span className="text-xs text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 size={13} /> AI Detected: {aiCategory} ({aiConfidence}%)
                    </span>
                  )}
                </div>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what is happening, why it occurs, and how it impacts people in your village or district. The more details you provide, the better university researchers can design a targeted solution."
                  className="w-full px-4 py-3 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none resize-none transition-all"
                />
                <div className="text-right text-[11px] text-gray-400 mt-1">
                  {description.length} characters
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Category (or accept AI suggestion)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${category === cat
                          ? "bg-blue-50 text-blue-700 border-blue-400 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  disabled={!title || !description}
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  Proceed to Location <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-1">
                  STEP 2 OF 4 · GEOGRAPHIC TARGETING
                </div>
                <h2
                  className="text-2xl font-extrabold text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Where is this challenge located?
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Use GPS detection to pin your exact location automatically, or select your State and District below to match regional university innovators and nodal officers.
                </p>
              </div>

              {/* GPS Detection Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      latitude && longitude
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    <Navigation size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{latitude && longitude ? "GPS Location Locked" : "Auto-Detect Exact Location (GPS)"}</span>
                      {accuracy && (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          ±{Math.round(accuracy)}m
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      {latitude && longitude
                        ? `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E · ${[locality, district, state].filter(Boolean).join(", ")} (Citizen Privacy Protected)`
                        : "Detect your exact physical coordinates, state, and district automatically."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {latitude && longitude && (
                    <button
                      type="button"
                      onClick={() => {
                        setLatitude(null);
                        setLongitude(null);
                        setAccuracy(null);
                        setGeoStatus("idle");
                        setGeoMessage(null);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 bg-gray-100 transition-colors cursor-pointer"
                    >
                      Clear GPS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => requestGeoLocation()}
                    disabled={geoStatus === "requesting"}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 shadow-2xs transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {geoStatus === "requesting" ? (
                      <>
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Detecting...</span>
                      </>
                    ) : latitude && longitude ? (
                      "Re-detect GPS"
                    ) : (
                      "Detect GPS"
                    )}
                  </button>
                </div>
              </div>

              {/* GPS Status / Feedback Message */}
              {geoMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                    geoStatus === "granted"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : geoStatus === "denied" || geoStatus === "error"
                      ? "bg-amber-50 border border-amber-200 text-amber-800"
                      : "bg-blue-50 border border-blue-200 text-blue-800"
                  }`}
                >
                  {geoStatus === "granted" ? (
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                  ) : geoStatus === "denied" || geoStatus === "error" ? (
                    <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">{geoMessage}</div>
                </div>
              )}

              {/* Quick simulation presets for multi-state testing */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-gray-500 mr-1">GPS Test Presets:</span>
                  {SAMPLE_GPS_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => applyPresetLocation(preset)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white hover:bg-blue-50 hover:text-blue-700 text-gray-700 border border-gray-200 transition-colors cursor-pointer shadow-2xs"
                      title={preset.description}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* State and District Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    State / Union Territory
                  </label>
                  <select
                    value={state}
                    onChange={(e) => {
                      const newState = e.target.value;
                      setState(newState);
                      if (newState === JHARKHAND_STATE_NAME) {
                        setDistrict("Ranchi");
                        const locs = getLocalitiesForDistrict("Ranchi");
                        setLocality(locs[0] || "");
                      } else {
                        setDistrict("");
                        setLocality("");
                      }
                      setIsCustomLocality(false);
                      setCustomLocality("");
                    }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer font-medium"
                  >
                    <option value="" disabled>Select State / UT</option>
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    District ({state || "Select State"})
                  </label>
                  {state === JHARKHAND_STATE_NAME ? (
                    <select
                      value={district}
                      onChange={(e) => {
                        const newDist = e.target.value;
                        setDistrict(newDist);
                        const locs = getLocalitiesForDistrict(newDist);
                        setLocality(locs[0] || "");
                        setIsCustomLocality(false);
                        setCustomLocality("");
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer font-medium"
                    >
                      <option value="" disabled>Select District</option>
                      {getJharkhandDistricts().map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. Hyderabad, Bengaluru Urban, Mumbai, etc."
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all font-medium"
                    />
                  )}
                </div>
              </div>

              {/* Locality / Sub-region Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Locality / Town / Ward / Landmark in {district || state || "Region"}
                </label>
                {state === JHARKHAND_STATE_NAME ? (
                  <>
                    <select
                      value={isCustomLocality ? "__custom__" : locality}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomLocality(true);
                        } else {
                          setIsCustomLocality(false);
                          setLocality(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all cursor-pointer font-medium mb-3"
                    >
                      <option value="">Select Locality or Sub-region</option>
                      {getLocalitiesForDistrict(district).map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                      <option value="__custom__">+ Other / Specific Village or Landmark...</option>
                    </select>

                    {(isCustomLocality || !locality) && (
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                          Specific Village / Panchayat / Ward / Landmark
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <MapPin size={16} />
                          </div>
                          <input
                            type="text"
                            value={customLocality}
                            onChange={(e) => setCustomLocality(e.target.value)}
                            placeholder="e.g. Kanke Road Agricultural Zone, Ormanjhi"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <MapPin size={16} />
                    </div>
                    <input
                      type="text"
                      value={locality}
                      onChange={(e) => setLocality(e.target.value)}
                      placeholder="e.g. Madhapur / Hitec City, Sector 4, MG Road"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                >
                  Continue to Impact Details <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details & Urgency */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-1">
                  STEP 3 OF 4 · DEMOGRAPHIC & URGENCY IMPACT
                </div>
                <h2
                  className="text-2xl font-extrabold text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Estimate people affected and urgency
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Data points used by AI to compute national priority score (1-100).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Estimated Affected Citizens / Families
                  </label>
                  <input
                    type="text"
                    value={affectedPeople}
                    onChange={(e) => setAffectedPeople(e.target.value)}
                    placeholder="e.g. 4,500+ farmers"
                    className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Urgency Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "low", label: "Low", color: "text-emerald-700 bg-emerald-50 border-emerald-300" },
                      { id: "medium", label: "Medium", color: "text-amber-700 bg-amber-50 border-amber-300" },
                      { id: "high", label: "High", color: "text-rose-700 bg-rose-50 border-rose-300" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setUrgency(item.id as any)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${urgency === item.id ? item.color + " ring-2 ring-blue-500" : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Keywords / Domain Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. Cold Chain, Solar Power, Post-Harvest Loss"
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Photo upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Attach Evidence Photo (Optional)
                </label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  className="hidden"
                />

                {!selectedPhoto ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        validateAndSetPhoto(e.dataTransfer.files[0]);
                      }
                    }}
                    className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-slate-50/70 hover:bg-blue-50/30 transition-all cursor-pointer group"
                  >
                    <Upload size={28} className="mx-auto text-gray-400 group-hover:text-blue-600 transition-colors mb-2" />
                    <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700">
                      Click to browse or drag & drop photo
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">Supports JPG, PNG, WEBP (Max 5 MB)</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="mt-3 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 shadow-2xs"
                    >
                      Choose Photo
                    </button>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col sm:flex-row items-center gap-4">
                    {photoPreview && (
                      <div className="relative w-24 h-24 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        <img
                          src={photoPreview}
                          alt="Selected evidence preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 text-center sm:text-left">
                      <div className="flex items-center justify-center sm:justify-start gap-1.5">
                        <ImageIcon size={14} className="text-blue-600 flex-shrink-0" />
                        <p className="text-xs font-bold text-[#071A33] truncate">{selectedPhoto.name}</p>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {(selectedPhoto.size / (1024 * 1024)).toFixed(2)} MB · {selectedPhoto.type || "Image"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors shadow-2xs"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 transition-colors"
                      >
                        <Trash2 size={13} className="inline mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {photoError && (
                  <div className="mt-2 text-xs text-rose-600 flex items-center gap-1.5 font-medium">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    <span>{photoError}</span>
                  </div>
                )}

                {/* Geolocation feedback triggered upon photo upload */}
                {geoStatus === "requesting" && (
                  <div className="mt-3 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-3 animate-pulse">
                    <Navigation size={18} className="text-blue-600 flex-shrink-0 mt-0.5 animate-spin" />
                    <div>
                      <div className="font-bold">Requesting Geolocation Access...</div>
                      <div className="text-[11px] text-blue-700 mt-0.5">
                        UniBridge is requesting your browser location permission to associate this challenge photo with your current physical location in Jharkhand.
                      </div>
                    </div>
                  </div>
                )}

                {geoStatus === "granted" && latitude && longitude && (
                  <div className="mt-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Location Permission Granted & GPS Tagged</div>
                        <div className="text-[11px] text-emerald-700 mt-0.5">
                          Coordinates: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E · Associated with {[locality, district, state].filter(Boolean).join(", ")}.
                        </div>
                        <div className="text-[10px] text-emerald-600/90 mt-0.5">
                          🔒 Precise coordinates are protected under Citizen Privacy Rules and never exposed to universities or industry.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white border border-emerald-300 text-emerald-700 hover:bg-emerald-100 whitespace-nowrap shadow-2xs cursor-pointer"
                    >
                      Review Location
                    </button>
                  </div>
                )}

                {geoStatus === "denied" && (
                  <div className="mt-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Location Access Denied / Unavailable</div>
                        <div className="text-[11px] text-amber-800 mt-0.5">
                          {geoMessage || "Location permission was denied. Photo upload continues unaffected. You can manually select or type your State, District & Locality."}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 whitespace-nowrap shadow-2xs cursor-pointer"
                    >
                      Select Manually
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
                >
                  Review Submission <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & AI Submission */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <div className="text-xs font-bold tracking-widest text-emerald-600 uppercase mb-1">
                  STEP 4 OF 4 · CIVIC AI VERIFICATION & SUBMISSION
                </div>
                <h2
                  className="text-2xl font-extrabold text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Review and Submit Challenge
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Once submitted, CivicAI will register your challenge into the national innovation queue.
                </p>
              </div>

              {/* Review Card */}
              <div className="bg-slate-50 border border-gray-200 rounded-2xl p-6 space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Problem Title
                  </div>
                  <h3 className="text-base font-bold text-[#071A33]">{title}</h3>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                    Description
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200/80">
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase">Category</div>
                    <div className="text-xs font-bold text-blue-600 mt-0.5">{aiCategory || category}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase">Location</div>
                    <div className="text-xs font-bold text-gray-800 mt-0.5">
                      {[isCustomLocality && customLocality ? customLocality : locality || village, district, state].filter(Boolean).join(", ") || "Not specified"}
                    </div>
                    {latitude && longitude ? (
                      <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                        <Navigation size={11} className="text-blue-500" />
                        <span>GPS: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E{accuracy ? ` (±${Math.round(accuracy)}m)` : ""} (Protected)</span>
                      </div>
                    ) : (
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        Manual Selection ({state || "Specified"})
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase">Affected</div>
                    <div className="text-xs font-bold text-emerald-600 mt-0.5">
                      {affectedPeople || "Local Community"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase">Urgency</div>
                    <div className="text-xs font-bold uppercase text-rose-600 mt-0.5">
                      {urgency || "Unspecified"}
                    </div>
                  </div>
                </div>

                {photoPreview && (
                  <div className="pt-4 border-t border-gray-200/80">
                    <div className="text-[11px] font-bold text-gray-400 uppercase mb-2">Supporting Evidence Photo</div>
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                      <img
                        src={photoPreview}
                        alt="Photo preview"
                        className="w-14 h-14 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#071A33] truncate">{selectedPhoto?.name}</p>
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Ready to upload to Cloudinary
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Auto-Score Preview */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-start gap-3">
                <Brain size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-blue-900">CivicAI Multi-Stage Processing Pipeline</h4>
                  <p className="text-xs text-blue-700/80 mt-0.5">
                    Upon submission, your challenge will be processed with Semantic Duplicate Detection, Problem Taxonomy Mapping, and an Explainable 5-Factor Priority Score.
                  </p>
                </div>
              </div>


              {submitError && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                  <AlertTriangle size={18} className="flex-shrink-0 text-rose-500 mt-0.5" />
                  <div>
                    <span className="font-bold">Submission Error: </span>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Submitting challenge...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Submit to National Queue
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
