import { useState, useEffect } from "react";
import { MapPin, Upload, Users, AlertTriangle, Brain, CheckCircle2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import type { Page } from "../types";
import {
  JHARKHAND_STATE_NAME,
  ALL_INDIAN_STATES,
  getJharkhandDistricts,
  getLocalitiesForDistrict,
} from "../data/jharkhandLocations";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const aiCategories = ["Agriculture", "Water & Sanitation", "Healthcare", "Education", "Environment", "Infrastructure", "Energy", "Digital Connectivity"];
const aiKeywords = ["Cold Chain", "IoT", "Agricultural Engineering", "Supply Chain", "Post-Harvest", "Rural Development"];
const aiImpact = "Farmers and local agricultural supply chain in rural Jharkhand";

export default function ReportChallenge({ onNavigate, onBack }: Props) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [state, setState] = useState(JHARKHAND_STATE_NAME);
  const [district, setDistrict] = useState("Ranchi");
  const [locality, setLocality] = useState("");
  const [urgency, setUrgency] = useState("medium");
  const [affectedPeople, setAffectedPeople] = useState("");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiCategory, setAiCategory] = useState("");
  const [aiConfidence, setAiConfidence] = useState(0);

  // Simulate AI analysis as user types
  useEffect(() => {
    if (description.length > 30) {
      setAiAnalyzing(true);
      const t = setTimeout(() => {
        setAiAnalyzing(false);
        setAiDone(true);
        setAiCategory("Agriculture");
        setAiConfidence(92);
      }, 1500);
      return () => clearTimeout(t);
    } else {
      setAiDone(false);
      setAiCategory("");
    }
  }, [description]);

  const handleSubmit = () => {
    onNavigate("ai-analysis");
  };

  const progressLabels = ["Problem", "Location", "Details", "Review"];

  return (
    <div className="min-h-screen pt-16 flex bg-white" style={{ background: "#FFFFFF" }}>
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto px-6 py-8 gap-8 w-full">
        {/* Main form */}
        <div className="flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all mb-6 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              {progressLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${i + 1 < step ? "text-white" : i + 1 === step ? "text-white" : "text-gray-400"}`}
                      style={{ background: i + 1 < step ? "#10B981" : i + 1 === step ? "linear-gradient(135deg, #0B63F6, #00C2FF)" : "#E2E8F0" }}>
                      {i + 1 < step ? <CheckCircle2 size={16} /> : i + 1}
                    </div>
                    <span className={`text-sm font-medium hidden md:block ${i + 1 === step ? "text-navy" : "text-gray-400"}`} style={i + 1 === step ? { color: "#071A33" } : {}}>
                      {label}
                    </span>
                  </div>
                  {i < progressLabels.length - 1 && (
                    <div className="flex-1 h-px min-w-[20px]" style={{ background: i + 1 < step ? "#10B981" : "#E2E8F0" }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-6 md:p-8" style={{ background: "white", border: "1px solid rgba(11,99,246,0.12)", boxShadow: "0 4px 20px rgba(7,26,51,0.03)" }}>
            {/* Step 1: Problem */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest text-electric-500 mb-2" style={{ color: "#0B63F6" }}>STEP 1 OF 4</div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#071A33" }}>
                    Tell us what's happening.
                  </h1>
                  <p className="text-gray-500">CivicAI will help structure and categorize your challenge.</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Challenge Title</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Farmers losing vegetables due to lack of cold storage"
                      className="w-full px-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 outline-none transition-all"
                      style={{ background: "#F6F9FC", border: "1px solid #E2E8F0", fontSize: "15px" }}
                      onFocus={(e) => (e.target.style.borderColor = "#0B63F6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Describe the Problem</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the challenge in detail. What is happening? Who is affected? What causes it? The more you describe, the better CivicAI can understand it."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl text-gray-800 placeholder-gray-400 outline-none resize-none transition-all"
                      style={{ background: "#F6F9FC", border: "1px solid #E2E8F0", fontSize: "15px" }}
                      onFocus={(e) => (e.target.style.borderColor = "#0B63F6")}
                      onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")}
                    />
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-gray-400">{description.length} characters</span>
                      {aiAnalyzing && <span className="text-xs text-cyan-500 flex items-center gap-1"><Sparkles size={10} className="animate-spin" /> AI analyzing...</span>}
                      {aiDone && <span className="text-xs text-emerald-500 flex items-center gap-1"><CheckCircle2 size={10} /> AI detected: Agriculture</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#0B63F6" }}>STEP 2 OF 4</div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#071A33" }}>Where is this happening?</h1>
                  <p className="text-gray-500">Geographic context helps us match the right university and government body.</p>
                </div>

                {/* Map placeholder */}
                <div className="rounded-2xl mb-5 flex flex-col items-center justify-center overflow-hidden" style={{ height: 220, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="pulse-glow w-4 h-4 rounded-full mb-4" style={{ background: "#0B63F6" }}></div>
                  <MapPin size={32} className="text-blue-600 mb-2" />
                  <p className="text-gray-700 text-sm font-semibold">Click to pin location on map</p>
                  <p className="text-blue-600 text-xs mt-1">or enter district below</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">State / UT</label>
                    <select
                      value={state}
                      onChange={(e) => {
                        const s = e.target.value;
                        setState(s);
                        if (s === JHARKHAND_STATE_NAME) {
                          setDistrict("Ranchi");
                        } else {
                          setDistrict("");
                        }
                        setLocality("");
                      }}
                      className="w-full px-4 py-3 rounded-xl text-gray-700 outline-none bg-slate-50 cursor-pointer"
                      style={{ border: "1px solid #E2E8F0" }}
                    >
                      {ALL_INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">District ({state})</label>
                    {state === JHARKHAND_STATE_NAME ? (
                      <select
                        value={district}
                        onChange={(e) => {
                          setDistrict(e.target.value);
                          setLocality("");
                        }}
                        className="w-full px-4 py-3 rounded-xl text-gray-800 outline-none"
                        style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}
                      >
                        {getJharkhandDistricts().map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="e.g. Hyderabad, Bengaluru Urban, Mumbai"
                        className="w-full px-4 py-3 rounded-xl text-gray-800 outline-none"
                        style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}
                      />
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Locality / Area / Town</label>
                    {state === JHARKHAND_STATE_NAME ? (
                      <select
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-gray-800 outline-none"
                        style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}
                      >
                        <option value="">Select Locality in {district}</option>
                        {getLocalitiesForDistrict(district).map((loc) => (
                          <option key={loc} value={loc}>{loc}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="e.g. Madhapur / Hitec City, Ward 4"
                        className="w-full px-4 py-3 rounded-xl text-gray-800 outline-none"
                        style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Details */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#0B63F6" }}>STEP 3 OF 4</div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#071A33" }}>Help us understand better</h1>
                  <p className="text-gray-500">Additional context improves the AI priority score and university matching.</p>
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How many people are affected?</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["Under 100", "100–500", "500–5,000", "5,000+"].map((opt) => (
                        <button key={opt} onClick={() => setAffectedPeople(opt)} className={`py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${affectedPeople === opt ? "text-white" : "text-gray-600 hover:bg-blue-50"}`} style={affectedPeople === opt ? { background: "#0B63F6" } : { background: "#F6F9FC", border: "1px solid #E2E8F0" }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">How urgent is the issue?</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { val: "low", label: "Low", sub: "Can wait months", color: "#10B981" },
                        { val: "medium", label: "Medium", sub: "Needs attention soon", color: "#F59E0B" },
                        { val: "high", label: "High", sub: "Urgent — critical impact", color: "#EF4444" },
                      ].map((u) => (
                        <button key={u.val} onClick={() => setUrgency(u.val)} className="p-4 rounded-xl text-left transition-all cursor-pointer" style={{ background: urgency === u.val ? `${u.color}15` : "#F6F9FC", border: `1px solid ${urgency === u.val ? u.color : "#E2E8F0"}` }}>
                          <div className="text-sm font-bold mb-0.5" style={{ color: urgency === u.val ? u.color : "#374151" }}>{u.label}</div>
                          <div className="text-xs text-gray-400">{u.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Supporting Evidence (optional)</label>
                    <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition-colors" style={{ borderColor: "#CBD5E1" }}>
                      <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Drag & drop photos, videos, or documents</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4, PDF · Max 50MB</p>
                      <button className="mt-3 px-4 py-2 rounded-lg text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">Browse Files</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#0B63F6" }}>STEP 4 OF 4</div>
                  <h1 className="text-2xl md:text-3xl font-extrabold mb-2" style={{ fontFamily: "var(--font-display)", color: "#071A33" }}>Review & Submit</h1>
                  <p className="text-gray-500">CivicAI has pre-processed your challenge. Confirm the details below.</p>
                </div>

                <div className="space-y-4">
                  <div className="rounded-xl p-5" style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">CHALLENGE TITLE</div>
                    <div className="font-bold text-gray-800">{title || "Farmers losing vegetables due to lack of cold storage"}</div>
                  </div>
                  <div className="rounded-xl p-5" style={{ background: "#F6F9FC", border: "1px solid #E2E8F0" }}>
                    <div className="text-xs font-semibold text-gray-400 mb-1">DESCRIPTION</div>
                    <div className="text-gray-700 text-sm">{description || "Farmers losing vegetables because of inadequate cold storage facilities near Ormanjhi, Ranchi."}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl p-4" style={{ background: "rgba(11,99,246,0.06)", border: "1px solid rgba(11,99,246,0.15)" }}>
                      <div className="text-xs text-blue-500 font-semibold mb-1">AI CATEGORY</div>
                      <div className="font-bold text-navy" style={{ color: "#071A33" }}>Agriculture</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                      <div className="text-xs text-red-500 font-semibold mb-1">URGENCY</div>
                      <div className="font-bold text-red-600 capitalize">{urgency}</div>
                    </div>
                    <div className="rounded-xl p-4" style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}>
                      <div className="text-xs text-emerald-600 font-semibold mb-1">AFFECTED</div>
                      <div className="font-bold text-emerald-700">{affectedPeople || "500–5,000"}</div>
                    </div>
                  </div>
                </div>

                <button onClick={handleSubmit} className="w-full mt-8 py-4 rounded-xl font-bold text-white text-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-lg" style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}>
                  Submit to CivicAI <ArrowRight size={20} />
                </button>
              </div>
            )}

            {/* Navigation */}
            {step < 4 && (
              <div className="flex justify-between mt-8 pt-6" style={{ borderTop: "1px solid #F1F5F9" }}>
                <button onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-30 cursor-pointer">
                  <ArrowLeft size={16} /> Previous
                </button>
                <button onClick={() => setStep(Math.min(4, step + 1))} className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white transition-all hover:scale-105 cursor-pointer shadow-md" style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}>
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="w-full lg:w-80 xl:w-96 flex-shrink-0">
          <div className="sticky top-24 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
            <div className="px-5 py-4 flex items-center gap-3" style={{ background: "rgba(11,99,246,0.06)", borderBottom: "1px solid rgba(11,99,246,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(11,99,246,0.15)" }}>
                <Brain size={18} className="text-blue-600" />
              </div>
              <div>
                <div className="text-xs font-bold text-blue-600 tracking-widest">CIVIC AI ASSISTANT</div>
                <div className="text-xs text-gray-400">Real-time analysis</div>
              </div>
              <div className="ml-auto w-2 h-2 rounded-full bg-blue-600 pulse-glow"></div>
            </div>

            <div className="p-5 space-y-4">
              {/* Category */}
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
                  {aiDone ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                  DETECTED CATEGORY
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all ${aiDone ? "opacity-100" : "opacity-30"}`} style={{ background: "rgba(11,99,246,0.06)", border: "1px solid rgba(11,99,246,0.15)" }}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800 font-bold">{aiCategory || "—"}</span>
                    {aiDone && <span className="text-xs text-blue-600 font-mono">{aiConfidence}% conf.</span>}
                  </div>
                </div>
              </div>

              {/* Impact */}
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
                  {aiDone ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                  POSSIBLE IMPACT
                </div>
                <div className={`px-3 py-2 rounded-lg transition-all ${aiDone ? "opacity-100" : "opacity-30"}`} style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span className="text-gray-700 text-sm">{aiDone ? aiImpact : "—"}</span>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-mono">
                  {aiDone ? <CheckCircle2 size={12} className="text-emerald-500" /> : <div className="w-3 h-3 rounded-full border border-gray-300"></div>}
                  REQUIRED EXPERTISE
                </div>
                <div className={`flex flex-wrap gap-2 transition-all ${aiDone ? "opacity-100" : "opacity-30"}`}>
                  {(aiDone ? aiKeywords : ["—"]).map((k, i) => (
                    <span key={i} className="px-2 py-1 rounded-md text-xs font-semibold text-blue-600" style={{ background: "rgba(11,99,246,0.08)", border: "1px solid rgba(11,99,246,0.15)" }}>{k}</span>
                  ))}
                </div>
              </div>

              {/* Similar reports estimate */}
              {aiDone && (
                <div className="rounded-xl p-4 mt-2" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-500 tracking-widest">SIMILAR REPORTS</span>
                  </div>
                  <div className="text-3xl font-extrabold text-gray-800 mb-1" style={{ fontFamily: "var(--font-display)" }}>23</div>
                  <div className="text-xs text-gray-500">similar challenges detected across Jharkhand</div>
                </div>
              )}

              {aiAnalyzing && (
                <div className="flex items-center gap-3 py-3">
                  <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  <span className="text-xs text-blue-600">Analyzing your description...</span>
                </div>
              )}

              {!aiDone && !aiAnalyzing && (
                <div className="text-center py-6 text-gray-400 text-xs">
                  Start typing your challenge description to activate CivicAI
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
