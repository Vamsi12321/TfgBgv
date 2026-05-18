"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, Trash2, Sparkles, Loader2, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, FileText, AlertCircle, X, Phone, Mail,
  Shield, Target, Brain, Zap, TrendingUp, Award, Users, Star,
  Download, Eye, BarChart3, FileDown,
} from "lucide-react";
import { useOrgState } from "../../context/OrgStateContext";

/* ─────────────────────────────────────────────
   HELPER COMPONENTS
───────────────────────────────────────────── */
function ScoreRing({ score, size = 72 }) {
  const pct = Math.round(score);
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
  const bg = pct >= 70 ? "#d1fae5" : pct >= 50 ? "#fef3c7" : "#fee2e2";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={bg} strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct / 100)} strokeLinecap="round" />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{pct}%</span>
    </div>
  );
}

function RecommendationPill({ rec }) {
  const map = {
    GOOD_FIT: { bg: "bg-green-100 border-green-200", text: "text-green-700", label: "Good Fit", icon: "🟢" },
    STRONG_FIT: { bg: "bg-green-100 border-green-200", text: "text-green-700", label: "Strong Fit", icon: "🟢" },
    MODERATE_FIT: { bg: "bg-amber-100 border-amber-200", text: "text-amber-700", label: "Moderate Fit", icon: "🟡" },
    WEAK_FIT: { bg: "bg-orange-100 border-orange-200", text: "text-orange-700", label: "Weak Fit", icon: "🟠" },
    REJECT: { bg: "bg-red-100 border-red-200", text: "text-red-700", label: "Not Recommended", icon: "🔴" },
  };
  const s = map[rec] || map.REJECT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text}`}>
      {s.icon} {s.label}
    </span>
  );
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className={`fixed top-20 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${
      type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-green-500 to-emerald-600"
    }`}>{message}</div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function OrgAIResumeScreeningPage() {
  const { aiScreeningState = {}, setAiScreeningState = () => {} } = useOrgState();

  // Files
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);

  // Config
  const [topN, setTopN] = useState(aiScreeningState.topN || 5);
  const [mustHave, setMustHave] = useState(aiScreeningState.mustHave || "");
  const [niceToHave, setNiceToHave] = useState(aiScreeningState.niceToHave || "");

  // Results (cached from context)
  const [results, setResults] = useState(aiScreeningState.results || []);
  const [enhancedResults, setEnhancedResults] = useState(aiScreeningState.enhancedResults || []);
  const [expanded, setExpanded] = useState(null);

  // Add from screening
  const [prefillOpen, setPrefillOpen] = useState(aiScreeningState.prefillOpen || {});
  const [prefillForms, setPrefillForms] = useState(aiScreeningState.prefillForms || {});
  const [addedCandidates, setAddedCandidates] = useState(aiScreeningState.addedCandidates || {});

  // Loading & UI
  const [loading, setLoading] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobForPipeline, setSelectedJobForPipeline] = useState({});
  const [activeResultTab, setActiveResultTab] = useState("basic");

  // Refs for state persistence
  const stateRef = useRef({});
  useEffect(() => {
    stateRef.current = { topN, mustHave, niceToHave, results, enhancedResults, prefillOpen, prefillForms, addedCandidates, expanded };
  }, [topN, mustHave, niceToHave, results, enhancedResults, prefillOpen, prefillForms, addedCandidates, expanded]);
  useEffect(() => { return () => { setAiScreeningState(stateRef.current); }; }, [setAiScreeningState]);

  // Load jobs for pipeline option
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/proxy/secure/getJobs", { credentials: "include" });
        if (res.ok) { const d = await res.json(); setJobs(d.jobs || []); }
      } catch {}
    })();
  }, []);

  /* ── File Handlers ── */
  const handleJdUpload = (e) => {
    const f = e.target.files[0];
    if (f && f.type === "application/pdf") setJdFile(f);
    else showToast("Only PDF files accepted for JD", "error");
  };

  const handleResumeUpload = (e) => {
    const files = Array.from(e.target.files).filter(f =>
      f.type === "application/pdf" || f.type.includes("wordprocessingml") || f.type.includes("msword")
    );
    setResumeFiles(prev => [...prev, ...files]);
  };

  const removeResume = (name) => setResumeFiles(prev => prev.filter(f => f.name !== name));
  const clearAll = () => { setJdFile(null); setResumeFiles([]); setResults([]); setEnhancedResults([]); setExpanded(null); };
  const showToast = (msg, type = "success") => setToast({ message: msg, type });

  /* ── Prefill Handlers ── */
  const openPrefill = (res) => {
    const firstName = res.contact_information?.firstName || "";
    const lastName = res.contact_information?.lastName || "";
    setPrefillForms(prev => ({
      ...prev,
      [res.filename]: {
        firstName, lastName,
        email: res.contact_information?.email_addresses?.[0] || "",
        phone: res.contact_information?.phone_numbers?.[0] || "",
      },
    }));
    setPrefillOpen(prev => ({ ...prev, [res.filename]: true }));
  };

  const handlePrefillChange = (filename, field, value) => {
    setPrefillForms(prev => ({ ...prev, [filename]: { ...prev[filename], [field]: value } }));
  };

  const handleAddFromScreening = async (filename, addAs = "candidate", jobId = "") => {
    const form = prefillForms[filename];
    if (!form?.firstName && !form?.email) return;
    setAddedCandidates(prev => ({ ...prev, [filename]: "loading" }));
    try {
      // Find the screening result for this candidate to include AI scores
      const allResults = [...results, ...enhancedResults];
      const screeningResult = allResults.find(r => r.filename === filename);

      const payload = {
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        email: form.email || "",
        phone: form.phone || "",
        resumeFilename: filename,
        addAs,
      };
      if (addAs === "jobseeker" && jobId) payload.jobId = jobId;

      // Include AI screening data if available
      if (screeningResult) {
        if (screeningResult.final_weighted_score !== undefined) payload.finalScore = screeningResult.final_weighted_score;
        else if (screeningResult.match_score !== undefined) payload.finalScore = screeningResult.match_score;
        if (screeningResult.recommendation) payload.recommendation = screeningResult.recommendation;
        if (screeningResult.strengths) payload.strengths = screeningResult.strengths;
        if (screeningResult.weaknesses) payload.weaknesses = screeningResult.weaknesses;
        if (screeningResult.summary) payload.summary = screeningResult.summary;
        if (screeningResult.ranking_explanation) payload.explanation = screeningResult.ranking_explanation;
      }

      const res = await fetch("/api/proxy/secure/addFromScreening", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setAddedCandidates(prev => ({ ...prev, [filename]: addAs === "candidate" ? "added_bgv" : "added_pipeline" }));
        setPrefillOpen(prev => ({ ...prev, [filename]: false }));
        showToast(addAs === "candidate" ? "Added to BGV!" : "Added to job pipeline!");
      } else if (res.status === 409) {
        setAddedCandidates(prev => ({ ...prev, [filename]: "duplicate" }));
      } else {
        setAddedCandidates(prev => ({ ...prev, [filename]: "error" }));
        showToast(typeof data?.detail === "string" ? data.detail : "Failed to add", "error");
      }
    } catch { setAddedCandidates(prev => ({ ...prev, [filename]: "error" })); showToast("Network error", "error"); }
  };

  /* ── Basic Screening ── */
  const handleBasic = async () => {
    if (!jdFile || resumeFiles.length === 0) { showToast("Upload JD and at least one resume", "error"); return; }
    setResults([]); setExpanded(null); setLoading(true);
    const fd = new FormData();
    fd.append("jd_file", jdFile);
    resumeFiles.forEach(f => fd.append("resume_files", f));
    fd.append("top_n", topN);
    try {
      const res = await fetch("/api/proxy/secure/ai_resume_screening", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setResults(data.results?.top_resumes || []);
      setActiveResultTab("basic");
      showToast(`Screening complete! ${data.results?.top_resumes?.length || 0} results`);
    } catch (err) { showToast(err.message || "Screening failed", "error"); }
    finally { setLoading(false); }
  };

  /* ── Enhanced Screening ── */
  const handleEnhanced = async () => {
    if (!jdFile || resumeFiles.length === 0) { showToast("Upload JD and at least one resume", "error"); return; }
    setEnhancedResults([]); setExpanded(null); setEnhancedLoading(true);
    const fd = new FormData();
    fd.append("jd_file", jdFile);
    resumeFiles.forEach(f => fd.append("resume_files", f));
    fd.append("top_n", topN);
    fd.append("must_have_requirements", mustHave);
    fd.append("nice_to_have", niceToHave);
    fd.append("min_embedding_score", "0.5");
    try {
      const res = await fetch("/api/proxy/secure/ai_resume_screening_enhanced", { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setEnhancedResults(data.results?.top_resumes || []);
      setActiveResultTab("enhanced");
      showToast(`Enhanced screening complete! ${data.results?.top_resumes?.length || 0} results`);
    } catch (err) { showToast(err.message || "Enhanced screening failed", "error"); }
    finally { setEnhancedLoading(false); }
  };

  const currentResults = activeResultTab === "basic" ? results : enhancedResults;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-indigo-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-200">
            <Brain size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Resume Screening</h1>
            <p className="text-sm text-gray-500">Upload JD and resumes to find the best candidates using AI</p>
          </div>
        </div>

        {/* ── Info Banner ── */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 flex gap-3">
          <Zap size={18} className="text-indigo-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-indigo-700">
            <span className="font-bold">How it works:</span> Upload a Job Description + Resumes → AI scores and ranks candidates → Add top picks directly to <span className="font-semibold">BGV</span> or a <span className="font-semibold">Job Pipeline</span>.
          </p>
        </div>

        {/* ── Upload Section ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Upload size={16} className="text-purple-500" /> Upload Files
            </h2>
            {(jdFile || resumeFiles.length > 0) && (
              <button onClick={clearAll} className="text-xs text-red-500 font-medium hover:text-red-700 transition">Clear All</button>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* File Upload Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* JD Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Job Description (PDF) *</label>
                <label className={`flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  jdFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                }`}>
                  <input type="file" accept=".pdf" onChange={handleJdUpload} className="hidden" />
                  {jdFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="font-medium text-green-700 truncate max-w-[200px]">{jdFile.name}</span>
                      <button onClick={(e) => { e.preventDefault(); setJdFile(null); }} className="text-gray-400 hover:text-red-500 ml-1"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileText size={16} className="text-purple-400" />
                      <span>Choose JD PDF</span>
                    </div>
                  )}
                </label>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Resumes (PDF / DOCX) *</label>
                <label className={`flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  resumeFiles.length > 0 ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
                }`}>
                  <input type="file" accept=".pdf,.docx,.doc" multiple onChange={handleResumeUpload} className="hidden" />
                  {resumeFiles.length > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="font-medium text-green-700">{resumeFiles.length} file{resumeFiles.length > 1 ? "s" : ""} selected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users size={16} className="text-purple-400" />
                      <span>Choose Resumes (Multiple)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Resume chips */}
            {resumeFiles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resumeFiles.map(f => (
                  <span key={f.name} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                    <FileText size={12} className="text-gray-400" />
                    <span className="max-w-[150px] truncate">{f.name}</span>
                    <button onClick={() => removeResume(f.name)} className="text-gray-400 hover:text-red-500"><X size={12} /></button>
                  </span>
                ))}
              </div>
            )}

            {/* Config Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Top N Results</label>
                <input type="number" min={1} max={50} value={topN} onChange={e => setTopN(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Must Have <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={mustHave} onChange={e => setMustHave(e.target.value)}
                  placeholder="e.g., Python 5+ years, AWS"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nice to Have <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input type="text" value={niceToHave} onChange={e => setNiceToHave(e.target.value)}
                  placeholder="e.g., Docker, Kubernetes"
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button onClick={handleBasic} disabled={loading || !jdFile || resumeFiles.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {loading ? "Screening..." : "Basic Screening"}
              </button>
              <button onClick={handleEnhanced} disabled={enhancedLoading || !jdFile || resumeFiles.length === 0}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-semibold rounded-xl hover:from-indigo-600 hover:to-blue-700 shadow-md hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                {enhancedLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                {enhancedLoading ? "Processing..." : "Enhanced Screening"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Results Section ── */}
        {currentResults.length > 0 && (
          <div className="space-y-4">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Award size={18} className="text-purple-500" /> Screening Results
                </h2>
                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">{currentResults.length} candidates</span>
              </div>
              {/* Tab toggle */}
              {(results.length > 0 || enhancedResults.length > 0) && (
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  {results.length > 0 && (
                    <button onClick={() => setActiveResultTab("basic")}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeResultTab === "basic" ? "bg-white text-purple-700 shadow-sm" : "text-gray-500"}`}>
                      Basic
                    </button>
                  )}
                  {enhancedResults.length > 0 && (
                    <button onClick={() => setActiveResultTab("enhanced")}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${activeResultTab === "enhanced" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}>
                      Enhanced
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Result Cards */}
            {currentResults.map((res, idx) => {
              const isExpanded = expanded === res.filename;
              const score = res.final_weighted_score || res.match_score || 0;
              const rec = res.recommendation || "REJECT";

              return (
                <div key={res.filename || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                  {/* Card Header */}
                  <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : res.filename)}>
                    {/* Rank */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow">
                      #{res.rank || idx + 1}
                    </div>

                    {/* Score Ring */}
                    <ScoreRing score={score} size={56} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-gray-900 truncate">{res.filename}</h3>
                        <RecommendationPill rec={rec} />
                      </div>
                      {/* Contact pills */}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        {res.contact_information?.email_addresses?.[0] && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Mail size={11} />{res.contact_information.email_addresses[0]}</span>
                        )}
                        {res.contact_information?.phone_numbers?.[0] && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Phone size={11} />{res.contact_information.phone_numbers[0]}</span>
                        )}
                      </div>
                    </div>

                    {/* Expand toggle */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 transition">
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-gray-50 pt-4">
                      {/* Summary */}
                      {res.summary && (
                        <div className="bg-slate-50 rounded-xl p-4">
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Summary</h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{res.summary}</p>
                        </div>
                      )}

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {res.strengths && res.strengths.length > 0 && (
                          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                            <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <CheckCircle2 size={12} /> Strengths
                            </h4>
                            <ul className="space-y-1.5">
                              {res.strengths.map((s, i) => (
                                <li key={i} className="text-xs text-green-800 flex items-start gap-1.5">
                                  <span className="text-green-500 mt-0.5">•</span> {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {res.weaknesses && res.weaknesses.length > 0 && (
                          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                              <XCircle size={12} /> Weaknesses
                            </h4>
                            <ul className="space-y-1.5">
                              {res.weaknesses.map((w, i) => (
                                <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                                  <span className="text-red-500 mt-0.5">•</span> {w}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Skills Match */}
                      {res.skills_match && (
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                          <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-2">Skills Analysis</h4>
                          {res.skills_match.matched?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {res.skills_match.matched.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[11px] font-medium">✓ {s}</span>
                              ))}
                            </div>
                          )}
                          {res.skills_match.missing?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {res.skills_match.missing.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[11px] font-medium">✗ {s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Critical Requirements */}
                      {res.critical_requirements_status && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(res.critical_requirements_status).map(([key, val]) => (
                            <span key={key} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                              val === "met" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
                            }`}>
                              {val === "met" ? "✓" : "✗"} {key}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Ranking Explanation */}
                      {res.ranking_explanation && (
                        <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                          <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">AI Explanation</h4>
                          <p className="text-xs text-indigo-900 leading-relaxed">{res.ranking_explanation}</p>
                        </div>
                      )}

                      {/* ── ADD FROM SCREENING (Two Options) ── */}
                      <div className="pt-3 border-t border-gray-100">
                        {addedCandidates[res.filename] === "added_bgv" ? (
                          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
                            <CheckCircle2 size={16} /> Added as Candidate for BGV!
                          </div>
                        ) : addedCandidates[res.filename] === "added_pipeline" ? (
                          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-semibold text-sm">
                            <CheckCircle2 size={16} /> Added to Job Pipeline (Resume Shortlist)!
                          </div>
                        ) : addedCandidates[res.filename] === "duplicate" ? (
                          <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-3 rounded-xl font-semibold text-sm">
                            <AlertCircle size={16} /> Person with this email/phone already exists.
                          </div>
                        ) : prefillOpen[res.filename] ? (
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-gray-800 text-sm">✨ Add from Screening</p>
                              <button onClick={() => setPrefillOpen(prev => ({ ...prev, [res.filename]: false }))} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <input value={prefillForms[res.filename]?.firstName || ""} onChange={e => handlePrefillChange(res.filename, "firstName", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none" placeholder="First Name *" />
                              <input value={prefillForms[res.filename]?.lastName || ""} onChange={e => handlePrefillChange(res.filename, "lastName", e.target.value)}
                                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none" placeholder="Last Name" />
                            </div>
                            <input value={prefillForms[res.filename]?.email || ""} onChange={e => handlePrefillChange(res.filename, "email", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none" placeholder="Email *" />
                            <input value={prefillForms[res.filename]?.phone || ""} onChange={e => handlePrefillChange(res.filename, "phone", e.target.value)}
                              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none" placeholder="Phone" />

                            {/* Two action buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              <button onClick={() => handleAddFromScreening(res.filename, "candidate")}
                                disabled={(!prefillForms[res.filename]?.firstName && !prefillForms[res.filename]?.email) || addedCandidates[res.filename] === "loading"}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl text-sm font-semibold hover:from-emerald-600 hover:to-green-700 transition disabled:opacity-50">
                                {addedCandidates[res.filename] === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Shield size={14} />}
                                Add to BGV
                              </button>
                              <div className="flex gap-1.5">
                                <select value={selectedJobForPipeline[res.filename] || ""} onChange={e => setSelectedJobForPipeline(prev => ({ ...prev, [res.filename]: e.target.value }))}
                                  className="flex-1 px-2 py-2 border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white min-w-0">
                                  <option value="">Select Job</option>
                                  {jobs.map(j => <option key={j._id} value={j._id}>{j.title}</option>)}
                                </select>
                                <button onClick={() => handleAddFromScreening(res.filename, "jobseeker", selectedJobForPipeline[res.filename])}
                                  disabled={!selectedJobForPipeline[res.filename] || (!prefillForms[res.filename]?.firstName && !prefillForms[res.filename]?.email) || addedCandidates[res.filename] === "loading"}
                                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-lg text-xs font-semibold hover:from-indigo-600 hover:to-blue-700 transition disabled:opacity-50 whitespace-nowrap">
                                  Add to Pipeline
                                </button>
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 text-center">BGV = Direct hire & verify | Pipeline = Goes through interviews first</p>
                          </div>
                        ) : (
                          <button onClick={() => openPrefill(res)}
                            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 rounded-xl py-2.5 text-sm font-semibold transition">
                            <span className="text-base">＋</span> Add to BGV or Job Pipeline
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {currentResults.length === 0 && !loading && !enhancedLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={28} className="text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No results yet</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">Upload a Job Description and resumes, then run Basic or Enhanced screening to see AI-ranked candidates here.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
