"use client";

import { useState, useEffect } from "react";
import {
  Briefcase, Users, CheckCircle2, XCircle, Clock, Loader2,
  ChevronDown, ChevronRight, Mail, Phone, FileText, Star,
  TrendingUp, Target, ArrowRight, CalendarCheck, X,
} from "lucide-react";

const STAGE_COLORS = {
  "Applied": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  "Resume Shortlist": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  "Interview": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  "Hired": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  "Rejected": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", dot: "bg-red-500" },
};

const ROUND_STATUS_COLORS = {
  "Pending": "bg-gray-100 text-gray-600",
  "Scheduled": "bg-blue-100 text-blue-700",
  "Passed": "bg-green-100 text-green-700",
  "Failed": "bg-red-100 text-red-700",
};

export default function JobsOverviewPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedJob, setExpandedJob] = useState(null);
  const [selectedStage, setSelectedStage] = useState(null); // { jobId, stage }
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url = statusFilter
          ? `/api/proxy/secure/jobsOverview?status=${statusFilter}`
          : `/api/proxy/secure/jobsOverview`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          const err = await res.json().catch(() => ({}));
          setError(err.detail || "Failed to load data");
        }
      } catch { setError("Network error"); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [statusFilter]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
      <p className="text-sm text-gray-500">Loading jobs overview...</p>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <XCircle size={32} className="text-red-400 mb-3" />
      <p className="text-sm text-red-600 font-medium">{error}</p>
    </div>
  );

  const { summary, jobs } = data || { summary: {}, jobs: [] };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900">Jobs Overview</h1>
              <p className="text-xs text-gray-500">Hiring pipeline analytics & candidate tracking</p>
            </div>
          </div>
          {/* Status filter */}
          <select value={statusFilter} onChange={(e) => { setLoading(true); setStatusFilter(e.target.value); }}
            className="px-3 py-2 text-xs font-medium border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Jobs", value: summary.totalJobs || 0, icon: Briefcase, color: "from-blue-500 to-indigo-600", bg: "bg-blue-50", tc: "text-blue-700" },
            { label: "Open Positions", value: summary.openPositions || 0, icon: Target, color: "from-emerald-500 to-teal-600", bg: "bg-emerald-50", tc: "text-emerald-700" },
            { label: "Total Applicants", value: summary.totalApplicants || 0, icon: Users, color: "from-amber-500 to-orange-600", bg: "bg-amber-50", tc: "text-amber-700" },
            { label: "Total Hired", value: summary.totalHired || 0, icon: CheckCircle2, color: "from-green-500 to-emerald-600", bg: "bg-green-50", tc: "text-green-700" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                  <s.icon size={18} className="text-white" />
                </div>
                <div>
                  <p className={`text-xl font-bold ${s.tc}`}>{s.value}</p>
                  <p className="text-[10px] text-gray-400 font-medium">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
              <Briefcase size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No jobs found</p>
            </div>
          ) : (
            jobs.map((job) => {
              const isExpanded = expandedJob === job.jobId;
              const totalCandidates = Object.values(job.stageBreakdown || {}).reduce((a, b) => a + b, 0);

              return (
                <div key={job.jobId} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition overflow-hidden">
                  {/* Job Header */}
                  <button onClick={() => setExpandedJob(isExpanded ? null : job.jobId)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {(job.title || "J")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{job.title}</h3>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${job.status === "open" ? "bg-green-100 text-green-700" : job.status === "closed" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"}`}>
                            {job.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{job.department} • {job.location} • {totalCandidates} candidates</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      {/* Stage mini pills */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {Object.entries(job.stageBreakdown || {}).map(([stage, count]) => {
                          if (count === 0) return null;
                          const colors = STAGE_COLORS[stage] || STAGE_COLORS["Applied"];
                          return (
                            <span key={stage} className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${colors.bg} ${colors.text}`}>
                              {count} {stage === "Resume Shortlist" ? "Shortlist" : stage}
                            </span>
                          );
                        })}
                      </div>
                      {isExpanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5 space-y-5 bg-gray-50/30">
                      {/* Stage Breakdown */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Candidate Pipeline</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                          {Object.entries(job.stageBreakdown || {}).map(([stage, count]) => {
                            const colors = STAGE_COLORS[stage] || STAGE_COLORS["Applied"];
                            const isSelected = selectedStage?.jobId === job.jobId && selectedStage?.stage === stage;
                            return (
                              <button key={stage} onClick={() => count > 0 && setSelectedStage(isSelected ? null : { jobId: job.jobId, stage })}
                                className={`p-3 rounded-xl border text-center transition-all ${isSelected ? `${colors.bg} ${colors.border} border-2 shadow-md` : "bg-white border-gray-100 hover:border-gray-200"} ${count > 0 ? "cursor-pointer" : "cursor-default opacity-60"}`}>
                                <p className={`text-lg font-bold ${colors.text}`}>{count}</p>
                                <p className="text-[10px] text-gray-500 font-medium">{stage === "Resume Shortlist" ? "Shortlisted" : stage}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Candidate Details (when a stage is selected) */}
                      {selectedStage?.jobId === job.jobId && selectedStage?.stage && (
                        <CandidateList
                          candidates={job.candidates?.[selectedStage.stage] || []}
                          stage={selectedStage.stage}
                          onClose={() => setSelectedStage(null)}
                        />
                      )}

                      {/* Interview Round Breakdown with candidate context */}
                      {job.interviewRoundBreakdown && (
                        <div>
                          <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Interview Rounds</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {Object.entries(job.interviewRoundBreakdown).map(([round, statuses]) => {
                              const total = Object.values(statuses).reduce((a, b) => a + b, 0);
                              if (total === 0) return (
                                <div key={round} className="bg-white rounded-xl p-4 border border-gray-100 opacity-50">
                                  <p className="text-xs font-bold text-gray-400">{round}</p>
                                  <p className="text-[10px] text-gray-300 mt-1">No candidates yet</p>
                                </div>
                              );
                              return (
                                <div key={round} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition">
                                  <div className="flex items-center justify-between mb-2.5">
                                    <p className="text-xs font-bold text-gray-800">{round}</p>
                                    <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{total} total</span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {Object.entries(statuses).map(([status, count]) => (
                                      count > 0 && (
                                        <span key={status} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${ROUND_STATUS_COLORS[status] || "bg-gray-100 text-gray-500"}`}>
                                          {count} {status}
                                        </span>
                                      )
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Auto-show hired candidates if any */}
                      {(job.candidates?.Hired?.length > 0) && !selectedStage && (
                        <div>
                          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <CheckCircle2 size={14} className="text-emerald-500" /> Hired Candidates
                          </h4>
                          <div className="space-y-2">
                            {job.candidates.Hired.map((c, i) => (
                              <div key={c.applicationId || c.interviewId || i} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                    {(c.name || "C")[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800">{c.name || "Unknown"}</p>
                                    <p className="text-[10px] text-gray-400">{c.email} {c.phone ? `• ${c.phone}` : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {c.aiScore != null && (
                                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                      AI: {Math.round(c.aiScore)}%
                                    </span>
                                  )}
                                  {c.hiredAt && (
                                    <span className="text-[9px] font-bold text-emerald-600">
                                      {new Date(c.hiredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                                    </span>
                                  )}
                                  {c.resumeUrl && (
                                    <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer"
                                      className="p-1.5 bg-white hover:bg-blue-50 rounded-lg transition border border-emerald-100" title="Resume">
                                      <FileText size={12} className="text-blue-600" />
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Candidate List Component ─── */
function CandidateList({ candidates, stage, onClose }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="bg-white rounded-xl p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-gray-700">{stage} Candidates</h4>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition"><X size={14} className="text-gray-400" /></button>
        </div>
        <p className="text-xs text-gray-400 text-center py-4">No candidates in this stage</p>
      </div>
    );
  }

  const colors = STAGE_COLORS[stage] || STAGE_COLORS["Applied"];

  return (
    <div className={`rounded-xl p-4 border ${colors.border} ${colors.bg}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-xs font-bold ${colors.text} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
          {stage} — {candidates.length} candidate{candidates.length !== 1 ? "s" : ""}
        </h4>
        <button onClick={onClose} className="p-1 hover:bg-white/60 rounded-lg transition"><X size={14} className="text-gray-400" /></button>
      </div>
      <div className="space-y-2">
        {candidates.map((c, i) => (
          <div key={c.applicationId || c.interviewId || i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {(c.name || "C")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{c.name || "Unknown"}</p>
                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                  {c.email && <span className="flex items-center gap-0.5"><Mail size={9} />{c.email}</span>}
                  {c.phone && <span className="flex items-center gap-0.5"><Phone size={9} />{c.phone}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {c.aiScore != null && (
                <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  AI: {Math.round(c.aiScore)}%
                </span>
              )}
              {c.source && (
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {c.source === "JOB_PORTAL" ? "Portal" : c.source}
                </span>
              )}
              {c.hiredAt && (
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Hired {new Date(c.hiredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                </span>
              )}
              {c.resumeUrl && (
                <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition" title="View Resume">
                  <FileText size={12} className="text-blue-600" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
