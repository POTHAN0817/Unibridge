import { useState, useEffect } from "react";
import { Brain, CheckCircle2, Zap, ArrowRight, ArrowLeft, MapPin } from "lucide-react";
import type { Page } from "../types";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const analysisSteps = [
  { label: "Reading challenge description", result: "Understanding context" },
  { label: "Searching similar reports", result: "23 similar reports discovered" },
  { label: "Calculating societal priority", result: "Priority score generated: 89/100" },
  { label: "Identifying required expertise", result: "Matching solution ecosystem" },
];

const priorityBreakdown = [
  { label: "Severity", score: 18, max: 20 },
  { label: "People Affected", score: 19, max: 20 },
  { label: "Urgency", score: 17, max: 20 },
  { label: "Repeat Reports", score: 18, max: 20 },
  { label: "Vulnerability", score: 10, max: 10 },
  { label: "Feasibility", score: 7, max: 10 },
];

const similarChallenges = [
  { title: "Post-harvest losses due to lack of cold chain infrastructure", location: "Madurai", similarity: 92, reports: 8 },
  { title: "Farmers unable to sell produce due to storage constraints", location: "Tirunelveli", similarity: 87, reports: 6 },
  { title: "Vegetable waste increasing near Dindigul mandis", location: "Dindigul", similarity: 79, reports: 5 },
];

export default function AIAnalysis({ onNavigate, onBack }: Props) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [scoreAnim, setScoreAnim] = useState(0);

  useEffect(() => {
    const runSteps = async () => {
      for (let i = 0; i < analysisSteps.length; i++) {
        await new Promise((r) => setTimeout(r, 1000 + i * 600));
        setCurrentStep(i + 1);
        setCompletedSteps((prev) => [...prev, i]);
      }
      await new Promise((r) => setTimeout(r, 800));
      setShowResults(true);
      // Animate score
      let n = 0;
      const interval = setInterval(() => {
        n += 3;
        if (n >= 89) { setScoreAnim(89); clearInterval(interval); }
        else setScoreAnim(n);
      }, 20);
    };
    runSteps();
  }, []);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (scoreAnim / 100) * circumference;

  return (
    <div className="min-h-screen pt-16 bg-white" style={{ background: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all mb-6 cursor-pointer"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest" style={{ background: "rgba(11,99,246,0.08)", color: "#0B63F6" }}>
            <Brain size={12} /> CIVIC AI · CHALLENGE ANALYSIS
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
            {showResults ? "Analysis Complete" : "CivicAI is analyzing your challenge"}
          </h1>
          {!showResults && <p className="text-gray-500">Please wait while our AI processes your submission...</p>}
        </div>

        {/* Analysis steps */}
        {!showResults && (
          <div className="max-w-xl mx-auto rounded-2xl p-8 space-y-6 bg-white border border-gray-200 shadow-sm">
            {analysisSteps.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  {completedSteps.includes(i) ? (
                    <CheckCircle2 size={20} className="text-emerald-500" />
                  ) : i === currentStep ? (
                    <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-gray-200"></div>
                  )}
                </div>
                <div className={`transition-all duration-500 ${completedSteps.includes(i) || i === currentStep ? "opacity-100" : "opacity-40"}`}>
                  <div className="text-gray-900 font-semibold">{s.label}</div>
                  {completedSteps.includes(i) && (
                    <div className="text-emerald-600 text-sm mt-0.5 flex items-center gap-1 font-medium">
                      <CheckCircle2 size={12} /> {s.result}
                    </div>
                  )}
                  {i === currentStep && !completedSteps.includes(i) && (
                    <div className="flex gap-1 mt-1">
                      {[0, 1, 2].map((d) => <div key={d} className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: `${d * 100}ms` }}></div>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-6 animate-in" style={{ animation: "count-up 0.6s ease-out" }}>
            {/* Challenge card */}
            <div className="rounded-2xl p-6 md:p-8 bg-white border border-gray-200 shadow-sm">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest" style={{ background: "rgba(11,99,246,0.1)", color: "#0B63F6", border: "1px solid rgba(11,99,246,0.2)" }}>AGRICULTURE</span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest priority-high">HIGH PRIORITY</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold mb-4" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
                    Farmers Losing Vegetables Due to Lack of Cold Storage
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: "Similar Reports", value: "23", color: "#0B63F6" },
                      { label: "People Affected", value: "4,500+", color: "#F59E0B" },
                      { label: "Urgency", value: "HIGH", color: "#EF4444" },
                      { label: "AI Confidence", value: "92%", color: "#10B981" },
                    ].map((s, i) => (
                      <div key={i} className="rounded-xl p-3 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}20` }}>
                        <div className="text-xl font-extrabold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Circular score */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                      <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="#F1F5F9" />
                      <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8" stroke="url(#scoreGrad)" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 0.05s linear" }} />
                      <defs>
                        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="100%" stopColor="#F59E0B" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-4xl font-extrabold" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>{scoreAnim}</div>
                      <div className="text-xs text-gray-400">/ 100</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-red-500 tracking-widest mt-2">PRIORITY SCORE</div>
                </div>
              </div>
            </div>

            {/* Priority breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-5">PRIORITY BREAKDOWN</h3>
                <div className="space-y-4">
                  {priorityBreakdown.map((p, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-gray-600">{p.label}</span>
                        <span className="text-gray-900 font-bold font-mono">{p.score}/{p.max}</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                        <div className="h-full rounded-full" style={{ width: `${(p.score / p.max) * 100}%`, background: "linear-gradient(90deg, #EF4444, #F59E0B)", transition: "width 1s ease-out" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Similar reports */}
              <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-400 tracking-widest mb-5">SIMILAR CHALLENGES DETECTED</h3>
                <div className="space-y-4">
                  {similarChallenges.map((s, i) => (
                    <div key={i} className="p-4 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <p className="text-gray-800 text-sm font-medium leading-snug">{s.title}</p>
                        <span className="flex-shrink-0 text-blue-600 font-bold text-sm font-mono">{s.similarity}%</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><MapPin size={10} />{s.location}</span>
                        <span>{s.reports} reports</span>
                      </div>
                      <div className="h-1 rounded-full mt-2 overflow-hidden bg-gray-200">
                        <div className="h-full rounded-full" style={{ width: `${s.similarity}%`, background: "linear-gradient(90deg, #0B63F6, #00C2FF)" }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row gap-4">
              <button onClick={() => onNavigate("gov-command")} className="flex-1 py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer shadow-md" style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}>
                <Zap size={18} /> View Government Validation
              </button>
              <button onClick={() => onNavigate("citizen-dashboard")} className="flex-1 py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-center gap-2 cursor-pointer border border-gray-200">
                Back to Dashboard <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
