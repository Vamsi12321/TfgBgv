"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Search, CheckCircle2, Star, Users, Mail, Phone,
  ChevronRight, X, Brain, UserCheck, Calendar, Loader2, Eye,
} from "lucide-react";

function ScoreBadge({ score }) {
  if (!score) return null;
  const cls = score >= 80 ? "bg-green-100 text-green-700 border-green-200"
    : score >= 60 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-red-100 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${cls}`}>
      <Star className="w-3 h-3" /> {score}
    </span>
  );
}

function SourceBadge({ source }) {
  const isAI = source === "AI Screening";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${isAI ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
      {isAI ? <Brain className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
      {source}
    </span>
  );
}

export default function StageCandidatesPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId;
  const stage = decodeURIComponent(params.stage);

  const [candidates, setCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("score-desc");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [jobTitle, setJobTitle] = useState("");
  const [aiScreening, setAiScreening] = useState(false);
  const [aiResultsMap, setAiResultsMap] = useState({});
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiConfig, setAiConfig] = useState({ minScore: 60, topN: "" });

  // Load applications from API
  const loadApplications = async () => {
    if (!jobId || jobId === "undefined") return;
    try {
      setLoading(true);
      const [appsRes, jobRes] = await Promise.all([
        fetch(`/api/proxy/secure/getApplications?jobId=${jobId}`, { credentials: "include" }),
        fetch(`/api/proxy/secure/getJob?jobId=${jobId}`, { credentials: "include" }),
      ]);
      if (appsRes.ok) {
        const data = await appsRes.json();
        const all = (data.applications || []).map(a => ({
          id: a._id || a.id,
          jobSeekerId: a.jobSeekerId || "",
          name: a.jobSeekerName || a.candidateName || "Unknown",
          email: a.jobSeekerEmail || a.candidateEmail || "",
          phone: a.jobSeekerPhone || a.candidatePhone || "",
          score: a.aiScore || 0,
          stage: a.stage || "Applied",
          skills: a.jobSeekerProfile?.skills || a.candidateProfile?.skills || [],
          appliedAt: a.appliedAt ? a.appliedAt.split("T")[0] : "",
          source: a.source === "JOB_PORTAL" ? "Portal" : a.source === "AI_SCREENING" ? "AI Screening" : "Manual",
          resumeUrl: a.resumeUrl || a.jobSeekerProfile?.resumeUrl || null,
          resumeDownloadUrl: a.resumeDownloadUrl || a.jobSeekerProfile?.resumeDownloadUrl || null,
          interviewCreated: (a.stageHistory || []).some(h => h.notes && h.notes.includes("Interview process initiated")),
        }));
        // For Interview stage, filter out candidates who already have interviews created
        const filtered = stage === "Interview"
          ? all.filter(c => c.stage === stage && !c.interviewCreated)
          : all.filter(c => c.stage === stage);
        setCandidates(filtered);
      }
      if (jobRes.ok) {
        const jd = await jobRes.json();
        setJobTitle((jd.job || jd).title || "Job");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadApplications(); }, [jobId, stage]);

  // AI Screening — scores Applied candidates
  const handleRunAIScreening = async () => {
    setAiScreening(true);
    setShowAIModal(false);
    try {
      const body = { jobId };
      if (aiConfig.minScore) body.minScorePercentage = parseInt(aiConfig.minScore);
      if (aiConfig.topN) body.topN = parseInt(aiConfig.topN);
      if (selectedIds.length > 0) body.applicationIds = selectedIds;

      const res = await fetch("/api/proxy/secure/runAIScreening", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        const results = data.results || [];
        const map = {};
        results.forEach(r => { map[r.applicationId] = r; });
        setAiResultsMap(prev => ({ ...prev, ...map }));
        setCandidates(prev => prev.map(c => {
          const match = results.find(r => r.applicationId === c.id);
          return match ? { ...c, score: Math.round(match.finalScore || match.llmScore || 0), name: match.jobSeekerName || c.name } : c;
        }));
        showToast(`AI Screening done! ${data.totalProcessed || results.length} processed, ${results.length} results returned.`);
      } else {
        const d = await res.json().catch(() => ({}));
        const errMsg = typeof d?.detail === "string" ? d.detail : Array.isArray(d?.detail) ? d.detail[0]?.msg || "Screening failed" : d?.message || "AI Screening failed";
        showToast(errMsg);
      }
    } catch (err) { showToast(err?.name === "AbortError" ? "Request timed out. AI screening takes time — try again." : "Network error"); }
    finally { setAiScreening(false); }
  };

  // Move single candidate
  const handleSingleMove = async (id) => {
    if (!nextStage) return;
    try {
      const res = await fetch("/api/proxy/secure/updateApplicationStage", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id, stage: nextStage, notes: "" }),
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        showToast(`Moved to ${nextStage}`);
        // Navigate to next stage if no more candidates
        if (candidates.length <= 1) {
          setTimeout(() => {
            router.push(`/org/jobs/${jobId}/stage/${encodeURIComponent(nextStage)}`);
          }, 1000);
        }
      }
    } catch { showToast("Failed"); }
  };

  // Bulk move
  const handleBulkMove = async () => {
    if (selectedIds.length === 0 || !nextStage) return;
    const count = selectedIds.length;
    try {
      const res = await fetch("/api/proxy/secure/bulkUpdateApplicationStage", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationIds: selectedIds, stage: nextStage, notes: "" }),
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
        showToast(`${count} candidate(s) moved to ${nextStage}`);
        // Navigate to next stage after short delay
        setTimeout(() => {
          router.push(`/org/jobs/${jobId}/stage/${encodeURIComponent(nextStage)}`);
        }, 1000);
      }
    } catch { showToast("Bulk move failed"); }
  };

  // Create interview (for Resume Shortlist → Interview)
  const handleCreateInterview = async (id) => {
    try {
      const res = await fetch("/api/proxy/secure/createInterview", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: id }),
      });
      if (res.ok) {
        setCandidates(prev => prev.filter(c => c.id !== id));
        setSelectedIds(prev => prev.filter(x => x !== id));
        showToast("Interview created! Manage in Interviews page.");
      } else {
        const d = await res.json().catch(() => ({}));
        const errMsg = typeof d?.detail === "string" ? d.detail : Array.isArray(d?.detail) ? d.detail[0]?.msg : d?.message || "Failed to create interview";
        showToast(errMsg);
      }
    } catch { showToast("Network error"); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  // Open drawer — fetch individual screening result if not cached
  const handleOpenDrawer = async (c) => {
    setSelectedCandidate(c);
    if (!aiResultsMap[c.id]) {
      try {
        const res = await fetch(`/api/proxy/secure/getScreeningResults?jobId=${jobId}&applicationId=${c.id}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const results = data.results || [];
          if (results.length > 0) {
            setAiResultsMap(prev => ({ ...prev, [c.id]: results[0] }));
          }
        }
      } catch {}
    }
  };

  const nextStage = stage === "Applied" ? "Resume Shortlist" : stage === "Resume Shortlist" ? "Interview" : null;
  const actionLabel = stage === "Applied" ? "Move to Shortlist" : stage === "Resume Shortlist" ? "Move to Interview" : null;

  const filteredCandidates = candidates
    .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "score-desc" ? b.score - a.score : sort === "newest" ? new Date(b.appliedAt) - new Date(a.appliedAt) : a.name.localeCompare(b.name));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-4 md:p-8">
      {toast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toast}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:bg-white/20 rounded-full p-0.5"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link href={`/org/jobs/${jobId}`} className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Pipeline
          </Link>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl shadow-lg ${
              stage === "Applied" ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-blue-200" :
              stage === "Resume Shortlist" ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-200" :
              "bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-200"
            }`}>
              {stage === "Applied" ? <Users className="w-5 h-5 text-white" /> :
               stage === "Resume Shortlist" ? <Star className="w-5 h-5 text-white" /> :
               <UserCheck className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-gray-900">{stage}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                  stage === "Applied" ? "bg-blue-500" : stage === "Resume Shortlist" ? "bg-amber-500" : "bg-violet-500"
                }`}>{filteredCandidates.length}</span>
              </div>
              <p className="text-gray-500 mt-0.5 text-sm">{jobTitle || "Loading..."}</p>
            </div>
          </div>
        </div>

        {/* Stage Navigation Tabs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 flex gap-1 overflow-x-auto">
          {[
            { key: "Applied", icon: "📥", gradient: "from-blue-500 to-cyan-500" },
            { key: "Resume Shortlist", icon: "⭐", gradient: "from-amber-500 to-orange-500" },
            { key: "Interview", icon: "🎯", gradient: "from-violet-500 to-purple-600" },
          ].map((s) => (
            <Link key={s.key} href={`/org/jobs/${jobId}/stage/${encodeURIComponent(s.key)}`}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                s.key === stage
                  ? `bg-gradient-to-r ${s.gradient} text-white shadow-md`
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}>
              <span>{s.icon}</span> {s.key}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : (<>
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by name or email..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 bg-gray-50/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition" />
              </div>

              {/* AI Screening button — only for Applied stage */}
              {stage === "Applied" && (
                <button onClick={() => setShowAIModal(true)} disabled={aiScreening}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-sm font-bold rounded-xl shadow-md shadow-purple-200 hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60">
                  {aiScreening ? <Loader2 size={14} className="animate-spin" /> : <Brain size={14} />}
                  {aiScreening ? "Screening..." : "AI Screen"}
                </button>
              )}

              {/* Move button */}
              {stage !== "Interview" ? (
                <button onClick={handleBulkMove} disabled={selectedIds.length === 0}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    stage === "Applied" ? "bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-200"
                    : "bg-gradient-to-r from-indigo-500 to-blue-600 shadow-indigo-200"
                  }`}>
                  {actionLabel} ({selectedIds.length}) <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <Link href="/org/interviews"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-bold rounded-xl shadow-md shadow-violet-200 hover:shadow-lg hover:scale-[1.02] transition-all">
                  Manage Interviews <ChevronRight className="w-4 h-4" />
                </Link>
              )}

              <label className="flex items-center gap-2.5 text-sm text-gray-600 cursor-pointer whitespace-nowrap bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 hover:border-blue-200 transition">
                <input type="checkbox"
                  checked={filteredCandidates.length > 0 && selectedIds.length === filteredCandidates.length}
                  onChange={() => setSelectedIds(selectedIds.length === filteredCandidates.length ? [] : filteredCandidates.map(c => c.id))}
                  className="w-4 h-4 accent-blue-600 rounded" />
                <span className="font-medium">Select All</span>
              </label>

              <select value={sort} onChange={e => setSort(e.target.value)}
                className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white hover:border-blue-200 transition cursor-pointer">
                <option value="score-desc">Score (High→Low)</option>
                <option value="newest">Newest First</option>
                <option value="name-asc">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Candidate Cards */}
          {filteredCandidates.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No candidates in this stage</h3>
              <Link href={`/org/jobs/${jobId}`} className="text-blue-600 hover:underline text-sm font-medium">← Back to Pipeline</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCandidates.map(c => (
                <div key={c.id} className={`bg-white rounded-2xl border shadow-sm p-5 transition-all duration-300 hover:shadow-lg cursor-pointer group ${selectedIds.includes(c.id) ? "border-blue-300 ring-2 ring-blue-100 shadow-blue-50" : "border-gray-100 hover:border-blue-100"}`}
                  onClick={() => handleOpenDrawer(c)}>
                  <div className="flex items-start gap-4" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" checked={selectedIds.includes(c.id)}
                      onChange={() => setSelectedIds(prev => prev.includes(c.id) ? prev.filter(x => x !== c.id) : [...prev, c.id])}
                      className="w-4 h-4 accent-blue-600 rounded mt-3.5 shrink-0" />
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
                      stage === "Applied" ? "from-blue-400 to-cyan-500" :
                      stage === "Resume Shortlist" ? "from-amber-400 to-orange-500" :
                      "from-violet-400 to-purple-500"
                    } flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                      {c.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Mail className="w-3 h-3 text-gray-400" />{c.email}</span>
                            {c.phone && <span className="inline-flex items-center gap-1 text-xs text-gray-500"><Phone className="w-3 h-3 text-gray-400" />{c.phone}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {c.score > 0 && (
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold border ${
                              c.score >= 70 ? "bg-green-50 text-green-700 border-green-200" :
                              c.score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-red-50 text-red-600 border-red-200"
                            }`}>
                              <Star className="w-3 h-3" /> {c.score}%
                            </span>
                          )}
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            c.source === "AI Screening" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                            c.source === "Portal" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            "bg-gray-50 text-gray-600 border border-gray-100"
                          }`}>
                            {c.source === "AI Screening" ? <Brain className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {c.source}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-3">
                        <div className="flex flex-wrap gap-1.5">
                          {c.skills.slice(0, 4).map(s => (
                            <span key={s} className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[11px] font-medium">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 flex items-center gap-1"><Calendar className="w-3 h-3" />{c.appliedAt}</span>
                          <button onClick={(e) => { e.stopPropagation(); handleOpenDrawer(c); }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition">
                            <Eye className="w-3 h-3" /> AI Details
                          </button>
                          {stage === "Applied" && (
                            <button onClick={() => handleSingleMove(c.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
                              Shortlist <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {stage === "Resume Shortlist" && (
                            <button onClick={() => handleSingleMove(c.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700">
                              Move to Interview <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                          {stage === "Interview" && (
                            <button onClick={(e) => { e.stopPropagation(); handleCreateInterview(c.id); }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-white text-xs font-medium rounded-lg bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700">
                              Create Interview <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>

      {/* ── AI SCREENING DETAIL DRAWER ── */}
      {selectedCandidate && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedCandidate(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-5 text-white flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-xl font-bold">
                    {selectedCandidate.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg">{selectedCandidate.name}</h2>
                    <p className="text-purple-100 text-sm">{selectedCandidate.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCandidate(null)} className="text-white/70 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              {/* Score + Recommendation */}
              {aiResultsMap[selectedCandidate.id] && (
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-2xl font-bold">{Math.round(aiResultsMap[selectedCandidate.id].finalScore || 0)}%</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    aiResultsMap[selectedCandidate.id].recommendation === "GOOD_FIT" ? "bg-green-400/30 text-green-100" :
                    aiResultsMap[selectedCandidate.id].recommendation === "MODERATE_FIT" ? "bg-amber-400/30 text-amber-100" :
                    "bg-red-400/30 text-red-100"
                  }`}>
                    {aiResultsMap[selectedCandidate.id].recommendation?.replace("_", " ")}
                  </span>
                </div>
              )}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {aiResultsMap[selectedCandidate.id] ? (() => {
                const r = aiResultsMap[selectedCandidate.id];
                return (<>
                  {/* Summary */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">AI Summary</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{r.summary}</p>
                  </div>

                  {/* Scores breakdown */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-purple-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-purple-700">{Math.round(r.finalScore || 0)}</p>
                      <p className="text-xs text-purple-500">Final Score</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-blue-700">{Math.round((r.embeddingScore || 0) * 100)}</p>
                      <p className="text-xs text-blue-500">Embedding</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-indigo-700">{r.llmScore || 0}</p>
                      <p className="text-xs text-indigo-500">LLM Score</p>
                    </div>
                  </div>

                  {/* Strengths */}
                  {r.strengths && r.strengths.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                      </h4>
                      <div className="space-y-1.5">
                        {r.strengths.map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Weaknesses */}
                  {r.weaknesses && r.weaknesses.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" /> Weaknesses
                      </h4>
                      <div className="space-y-1.5">
                        {r.weaknesses.map((w, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-red-400 mt-0.5 flex-shrink-0">✗</span>
                            <span>{w}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Explanation */}
                  {r.explanation && (
                    <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2">AI Explanation</h4>
                      <p className="text-sm text-indigo-900 leading-relaxed">{r.explanation}</p>
                    </div>
                  )}

                  {/* Critical Requirements */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${r.meetsCriticalRequirements ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                      {r.meetsCriticalRequirements ? "✓ Meets Critical Requirements" : "✗ Does NOT Meet Critical Requirements"}
                    </span>
                  </div>

                  {/* Resume Link */}
                  {r.resumeUrl && (
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(r.resumeUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${r.jobSeekerName || "resume"}_resume.pdf`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch {
                          window.open(r.resumeUrl, "_blank");
                        }
                      }}
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium bg-blue-50 rounded-xl px-4 py-3 border border-blue-100 transition w-full text-left cursor-pointer"
                    >
                      📄 Download Resume
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </button>
                  )}
                </>);
              })() : (
                <div className="text-center py-10">
                  <Brain className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 font-medium">No AI screening data yet</p>
                  <p className="text-xs text-gray-400 mt-1">Run "AI Screen All" to get detailed analysis</p>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex gap-2 flex-shrink-0">
              {stage === "Applied" && (
                <button onClick={() => { handleSingleMove(selectedCandidate.id); setSelectedCandidate(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition">
                  <CheckCircle2 className="w-4 h-4" /> Shortlist
                </button>
              )}
              {stage === "Resume Shortlist" && (
                <button onClick={() => { handleCreateInterview(selectedCandidate.id); setSelectedCandidate(null); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition">
                  <UserCheck className="w-4 h-4" /> Create Interview
                </button>
              )}
              <button onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition">
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── AI SCREENING CONFIG MODAL ── */}
      {showAIModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Brain size={18} />
                <h3 className="text-base font-bold">AI Screening Config</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} className="text-white/70 hover:text-white"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3">
                <p className="text-xs text-purple-700 font-medium">📄 Job: <span className="font-bold">{jobTitle}</span></p>
                <p className="text-xs text-purple-600 mt-0.5">
                  {selectedIds.length > 0
                    ? `Will screen ${selectedIds.length} selected candidate(s)`
                    : `Will screen all ${candidates.length} applied candidates`
                  }
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Minimum Score (%)</label>
                <div className="flex gap-2">
                  {[0, 30, 40, 50, 60, 75, 85].map(v => (
                    <button key={v} onClick={() => setAiConfig(p => ({ ...p, minScore: v }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-semibold transition ${
                        aiConfig.minScore === v ? "bg-purple-600 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}>
                      {v === 0 ? "All" : `${v}%+`}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">Only return candidates scoring above this threshold</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Max Results (optional)</label>
                <input type="number" min={1} max={100} value={aiConfig.topN}
                  onChange={e => setAiConfig(p => ({ ...p, topN: e.target.value }))}
                  placeholder="Leave empty for all results"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 text-black placeholder-gray-400" />
              </div>

              <button onClick={handleRunAIScreening} disabled={aiScreening}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition disabled:opacity-60 text-sm">
                {aiScreening ? <><Loader2 size={15} className="animate-spin" /> Screening...</> : <><Brain size={15} /> Run AI Screening</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
