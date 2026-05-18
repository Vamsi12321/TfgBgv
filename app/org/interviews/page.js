"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck, Users, CheckCircle2, XCircle, Clock, Star, X,
  ChevronRight, ChevronDown, Phone, Mail, Briefcase, User,
  Calendar, Loader2, Brain, Edit2, Trash2, UserPlus, Tag,
  Info, FileText,
} from "lucide-react";

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
function fmtDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/* Safely extract error message from API response */
function getErrorMsg(data, fallback = "Something went wrong") {
  if (!data) return fallback;
  if (typeof data.message === "string") return data.message;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    const first = data.detail[0];
    return typeof first === "string" ? first : (first.msg || fallback);
  }
  return fallback;
}

/* Normalize interview object — API returns jobSeekerName, not candidateName */
function normalizeInterview(iv) {
  return {
    ...iv,
    /* The interview ID could be _id, interviewId, or sometimes the backend uses applicationId */
    interviewId: iv._id || iv.interviewId || iv.applicationId || "",
    candidateName: iv.candidateName || iv.jobSeekerName || "Candidate",
    candidateEmail: iv.candidateEmail || iv.jobSeekerEmail || "",
    candidatePhone: iv.candidatePhone || iv.jobSeekerPhone || "",
    resumeUrl: iv.resumeUrl || "",
    resumeDownloadUrl: iv.resumeDownloadUrl || "",
    rounds: Array.isArray(iv.rounds) ? iv.rounds.filter(r => r && typeof r === "object" && r.roundNumber) : [],
  };
}

const ROUND_NAMES = ["Tech Round", "Manager Round", "HR Round", "Final Round"];

const ROUND_STATUS_STYLES = {
  Pending:   "bg-gray-100 text-gray-500",
  Scheduled: "bg-blue-100 text-blue-700",
  Passed:    "bg-green-100 text-green-700",
  Failed:    "bg-red-100 text-red-700",
};

const OVERALL_STATUS_STYLES = {
  "In Progress":     "bg-blue-100 text-blue-700",
  "Offer Extended":  "bg-green-100 text-green-700",
  "Rejected":        "bg-red-100 text-red-700",
  "Hired":           "bg-emerald-100 text-emerald-800",
};

/* ─────────────────────────────────────────────
   TOAST COMPONENT
───────────────────────────────────────────── */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const displayMsg = typeof message === "string" ? message : JSON.stringify(message);

  return (
    <div className={`fixed top-20 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
      type === "error" ? "bg-gradient-to-r from-red-500 to-rose-600" : "bg-gradient-to-r from-green-500 to-emerald-600"
    }`}>
      {displayMsg}
    </div>
  );
}

/* ─────────────────────────────────────────────
   STAR RATING (clickable)
───────────────────────────────────────────── */
function StarRating({ rating, onRate, size = 18, readOnly = false }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <button key={s} type="button" disabled={readOnly}
          onClick={() => onRate && onRate(s)}
          className={`${readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition`}>
          <Star size={size} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"} />
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   SCHEDULE ROUND MODAL
───────────────────────────────────────────── */
function ScheduleModal({ interview, round, onClose, onSuccess }) {
  const [interviewers, setInterviewers] = useState([]);
  const [form, setForm] = useState({ interviewerId: "", scheduledAt: "" });
  const [saving, setSaving] = useState(false);
  const [loadingInterviewers, setLoadingInterviewers] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/proxy/secure/getInterviewers?isActive=true&isAvailable=true", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.interviewers || (Array.isArray(data) ? data : []);
          setInterviewers(Array.isArray(list) ? list.filter(i => i && i.name) : []);
        }
      } catch {}
      finally { setLoadingInterviewers(false); }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/secure/scheduleRound", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          roundNumber: round.roundNumber,
          interviewerId: form.interviewerId,
          scheduledAt: form.scheduledAt,
        }),
      });
      if (res.ok) { onSuccess("Round scheduled successfully"); }
      else {
        const data = await res.json().catch(() => ({}));
        onSuccess(getErrorMsg(data, "Failed to schedule round"), "error");
      }
    } catch { onSuccess("Network error. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative px-7 py-6 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Schedule Round {round.roundNumber}</h3>
              <p className="text-blue-100 text-sm mt-0.5">{round.roundName} • {interview.candidateName}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5">
          {/* Interviewer Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <User size={12} className="text-indigo-500" /> Select Interviewer *
            </label>
            {loadingInterviewers ? (
              <div className="flex items-center gap-2 text-sm text-gray-500 py-3 px-4 bg-gray-50 rounded-xl">
                <Loader2 size={14} className="animate-spin text-indigo-500" /> Loading interviewers...
              </div>
            ) : interviewers.length === 0 ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                <p className="text-sm text-red-600 font-medium">No interviewers available.</p>
                <p className="text-xs text-red-400 mt-0.5">Go to Interviewers tab to add one first.</p>
              </div>
            ) : (
              <select required value={form.interviewerId}
                onChange={(e) => setForm({ ...form, interviewerId: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300 appearance-none cursor-pointer">
                <option value="">— Choose an interviewer —</option>
                {interviewers.map(i => (
                  <option key={i._id || i.interviewerId} value={i._id || i.interviewerId}>
                    {i.name} — {i.designation || i.department || i.email}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Clock size={12} className="text-blue-500" /> Date & Time *
            </label>
            <input required type="datetime-local" value={form.scheduledAt}
              onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300" />
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
            <Info size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-blue-700">The interviewer will be notified and the round status will change to "Scheduled".</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving || !form.interviewerId} className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50">
              {saving && <Loader2 size={14} className="animate-spin" />}
              <Calendar size={14} /> Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   UPDATE ROUND MODAL
───────────────────────────────────────────── */
function UpdateRoundModal({ interview, round, onClose, onSuccess }) {
  const [status, setStatus] = useState("Passed");
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/secure/updateRound", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          roundNumber: round.roundNumber,
          status, rating, feedback,
        }),
      });
      if (res.ok) { onSuccess("Round updated successfully"); }
      else {
        const data = await res.json().catch(() => ({}));
        onSuccess(getErrorMsg(data, "Failed to update round"), "error");
      }
    } catch { onSuccess("Network error. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-lg font-bold text-gray-900">Update Round {round.roundNumber}</h3>
          <p className="text-sm text-gray-500">{round.roundName}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Result *</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStatus("Passed")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${status === "Passed" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                ✓ Passed
              </button>
              <button type="button" onClick={() => setStatus("Failed")}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition ${status === "Failed" ? "border-red-500 bg-red-50 text-red-700" : "border-gray-200 text-gray-500 hover:border-red-300"}`}>
                ✗ Failed
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Rating</label>
            <StarRating rating={rating} onRate={setRating} size={24} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback</label>
            <textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
              placeholder="Provide feedback about the candidate..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />} Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   REJECT MODAL
───────────────────────────────────────────── */
function RejectModal({ interview, onClose, onSuccess }) {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/proxy/secure/rejectCandidate", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: interview.interviewId,
          reason,
          rejectedAtRound: interview.currentRound || 1,
        }),
      });
      if (res.ok) { onSuccess("Candidate rejected"); }
      else {
        const data = await res.json().catch(() => ({}));
        onSuccess(getErrorMsg(data, "Failed to reject candidate"), "error");
      }
    } catch { onSuccess("Network error. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b bg-gradient-to-r from-red-50 to-rose-50">
          <h3 className="text-lg font-bold text-gray-900">Reject Candidate</h3>
          <p className="text-sm text-gray-500">{interview.candidateName}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Reason for Rejection *</label>
            <textarea required rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              placeholder="Provide reason for rejection..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />} Reject
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   DETAIL DRAWER (with candidate info + guidance)
───────────────────────────────────────────── */
function DetailDrawer({ interview, onClose, onAction }) {
  const [scheduleModal, setScheduleModal] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [actionLoading, setActionLoading] = useState("");

  const rounds = interview.rounds || [];
  const hasPassedRound = rounds.some((r) => r.status === "Passed");
  const allPending = rounds.every((r) => r.status === "Pending");
  const currentRoundNum = interview.currentRound || 1;
  const currentRound = rounds.find(r => r.roundNumber === currentRoundNum);

  const handleExtendOffer = async () => {
    setActionLoading("offer");
    try {
      const res = await fetch("/api/proxy/secure/extendOffer", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.interviewId }),
      });
      if (res.ok) { onAction("Offer extended successfully"); }
      else { const data = await res.json().catch(() => ({})); onAction(getErrorMsg(data, "Failed to extend offer"), "error"); }
    } catch { onAction("Network error", "error"); }
    finally { setActionLoading(""); }
  };

  const handleMarkHired = async () => {
    setActionLoading("hired");
    try {
      const res = await fetch("/api/proxy/secure/markAsHired", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.interviewId }),
      });
      if (res.ok) { onAction("Candidate marked as hired!"); }
      else { const data = await res.json().catch(() => ({})); onAction(getErrorMsg(data, "Failed to mark as hired"), "error"); }
    } catch { onAction("Network error", "error"); }
    finally { setActionLoading(""); }
  };

  const handleInitiateBGV = async () => {
    setActionLoading("bgv");
    try {
      const res = await fetch("/api/proxy/secure/initiateBGV", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId: interview.interviewId }),
      });
      if (res.ok) { onAction("BGV initiated successfully!"); }
      else { const data = await res.json().catch(() => ({})); onAction(getErrorMsg(data, "Failed to initiate BGV"), "error"); }
    } catch { onAction("Network error", "error"); }
    finally { setActionLoading(""); }
  };

  const handleModalSuccess = (msg, type) => {
    setScheduleModal(null);
    setUpdateModal(null);
    setRejectModal(false);
    onAction(msg, type);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(interview.candidateName || "C")[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{interview.candidateName}</h2>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${OVERALL_STATUS_STYLES[interview.overallStatus] || "bg-gray-100 text-gray-600"}`}>
                {interview.overallStatus}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition flex-shrink-0">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ── Candidate Contact Info ── */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Candidate Info</h3>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-700">
              {interview.candidateEmail && (
                <a href={`mailto:${interview.candidateEmail}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                  <Mail size={13} className="text-gray-400" /> {interview.candidateEmail}
                </a>
              )}
              {interview.candidatePhone && (
                <a href={`tel:${interview.candidatePhone}`} className="flex items-center gap-1.5 hover:text-blue-600 transition">
                  <Phone size={13} className="text-gray-400" /> {interview.candidatePhone}
                </a>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(interview.resumeUrl || interview.resumeDownloadUrl) && (
                <button
                  onClick={async () => {
                    const url = interview.resumeUrl || interview.resumeDownloadUrl;
                    try {
                      const response = await fetch(url);
                      const blob = await response.blob();
                      const blobUrl = window.URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = blobUrl;
                      a.download = `${interview.candidateName || "resume"}_resume.pdf`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(blobUrl);
                      document.body.removeChild(a);
                    } catch {
                      window.open(url, "_blank");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <FileText size={12} /> Download Resume
                </button>
              )}
              {interview.jobId && (
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch(`/api/proxy/secure/getScreeningResults?jobId=${interview.jobId}&applicationId=${interview.applicationId}`, { credentials: "include" });
                      if (res.ok) {
                        const data = await res.json();
                        const r = data.results?.[0];
                        if (r) {
                          alert(`AI Score: ${r.finalScore || r.llmScore || "N/A"}\nRecommendation: ${r.recommendation || "N/A"}\n\nStrengths:\n${(r.strengths || []).join("\n")}\n\nWeaknesses:\n${(r.weaknesses || []).join("\n")}`);
                        } else {
                          alert("No AI screening results found for this candidate.");
                        }
                      } else {
                        alert("No AI screening results available.");
                      }
                    } catch { alert("Failed to fetch screening results."); }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <Brain size={12} /> AI Screening Results
                </button>
              )}
            </div>
            {interview.jobTitle && (
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                <Briefcase size={12} className="text-gray-400" /> Applied for: <strong>{interview.jobTitle}</strong>
              </p>
            )}
          </div>

          {/* ── Guidance Info Banner ── */}
          {interview.overallStatus === "In Progress" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3">
              <Info size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-blue-700 space-y-1">
                {allPending && (
                  <p><strong>Next step:</strong> Schedule Round 1 (Tech Round) by selecting an interviewer and time slot.</p>
                )}
                {!allPending && currentRound?.status === "Pending" && (
                  <p><strong>Next step:</strong> Schedule Round {currentRoundNum} ({currentRound.roundName}). Previous round must be passed first.</p>
                )}
                {currentRound?.status === "Scheduled" && (
                  <p><strong>Next step:</strong> After the interview, mark Round {currentRoundNum} as Passed or Failed with rating & feedback.</p>
                )}
                <p className="text-blue-500">Rounds must be completed sequentially. You can extend an offer after any round passes.</p>
              </div>
            </div>
          )}

          {interview.overallStatus === "Offer Extended" && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-3.5 flex gap-3">
              <Info size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-green-700 space-y-1">
                <p><strong>Offer extended!</strong> Once the candidate accepts, click "Mark as Hired" below.</p>
                <p className="text-green-500">After hiring, you can initiate Background Verification (BGV).</p>
              </div>
            </div>
          )}

          {interview.overallStatus === "Hired" && !interview.bgvInitiated && (
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex gap-3">
              <Info size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-700">
                <p><strong>Candidate hired!</strong> Click "Initiate BGV" to create a background verification entry for this candidate.</p>
              </div>
            </div>
          )}

          {/* ── Round Cards ── */}
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Interview Rounds</h3>
          {rounds.map((round, idx) => {
            const isCurrentRound = round.roundNumber === currentRoundNum;
            return (
              <div key={idx} className={`rounded-xl p-4 border space-y-3 ${
                isCurrentRound && interview.overallStatus === "In Progress"
                  ? "bg-blue-50/50 border-blue-200"
                  : "bg-gray-50 border-gray-100"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900">{round.roundName || ROUND_NAMES[idx] || `Round ${round.roundNumber}`}</p>
                      {isCurrentRound && interview.overallStatus === "In Progress" && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">CURRENT</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">Round {round.roundNumber}</p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ROUND_STATUS_STYLES[round.status] || "bg-gray-100 text-gray-500"}`}>
                    {round.status}
                  </span>
                </div>

                {round.status === "Scheduled" && (
                  <div className="space-y-1.5 text-xs text-gray-600">
                    {round.interviewer && <div className="flex items-center gap-2"><User size={12} className="text-gray-400" /><span>{round.interviewer}</span></div>}
                    {round.interviewerEmail && <div className="flex items-center gap-2"><Mail size={12} className="text-gray-400" /><span>{round.interviewerEmail}</span></div>}
                    {round.scheduledAt && <div className="flex items-center gap-2"><Calendar size={12} className="text-gray-400" /><span>{fmtDate(round.scheduledAt)}</span></div>}
                  </div>
                )}

                {(round.status === "Passed" || round.status === "Failed") && (
                  <div className="space-y-2">
                    {round.rating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating rating={round.rating} size={14} readOnly />
                        <span className="text-xs text-gray-500">({round.rating}/5)</span>
                      </div>
                    )}
                    {round.feedback && <p className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-gray-100">{round.feedback}</p>}
                    {round.interviewer && <div className="flex items-center gap-2 text-xs text-gray-500"><User size={12} className="text-gray-400" /><span>{round.interviewer}</span></div>}
                    {round.completedAt && <div className="flex items-center gap-2 text-xs text-gray-400"><Calendar size={12} /><span>Completed: {fmtDate(round.completedAt)}</span></div>}
                  </div>
                )}

                {/* Action buttons — only show for current round when In Progress */}
                {interview.overallStatus === "In Progress" && (
                  <div className="flex gap-2 pt-1">
                    {round.status === "Pending" && round.roundNumber === currentRoundNum && (
                      <button onClick={() => setScheduleModal(round)} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600 transition flex items-center gap-1.5">
                        <Calendar size={12} /> Schedule
                      </button>
                    )}
                    {round.status === "Pending" && round.roundNumber !== currentRoundNum && (
                      <span className="text-xs text-gray-400 italic">Complete Round {currentRoundNum} first</span>
                    )}
                    {round.status === "Scheduled" && (
                      <>
                        <button onClick={() => { setUpdateModal(round); }}
                          className="px-3 py-1.5 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600 transition">
                          ✓ Mark Result
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* ── Final Decision Section ── */}
          <div className="border-t border-gray-200 pt-5 space-y-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Decision</h3>

            {hasPassedRound && interview.overallStatus === "In Progress" && (
              <div className="space-y-2">
                <button onClick={handleExtendOffer} disabled={actionLoading === "offer"}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading === "offer" && <Loader2 size={14} className="animate-spin" />}
                  <CheckCircle2 size={16} /> Extend Offer
                </button>
                <p className="text-[11px] text-gray-400 text-center">Sends a formal job offer to the candidate. They haven't been hired yet.</p>
              </div>
            )}

            {!hasPassedRound && interview.overallStatus === "In Progress" && (
              <p className="text-xs text-gray-400 text-center py-2 bg-gray-50 rounded-xl border border-gray-100">
                At least 1 round must be passed before extending an offer.
              </p>
            )}

            {(interview.overallStatus === "In Progress" || interview.overallStatus === "Offer Extended") && (
              <button onClick={() => setRejectModal(true)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2">
                <XCircle size={16} /> Reject Candidate
              </button>
            )}

            {interview.overallStatus === "Offer Extended" && !interview.hired && (
              <div className="space-y-2">
                <button onClick={handleMarkHired} disabled={actionLoading === "hired"}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading === "hired" && <Loader2 size={14} className="animate-spin" />}
                  <CheckCircle2 size={16} /> Mark as Hired
                </button>
                <p className="text-[11px] text-gray-400 text-center">Candidate accepted the offer. This confirms the hire and enables BGV.</p>
              </div>
            )}

            {interview.overallStatus === "Hired" && !interview.bgvInitiated && (
              <div className="space-y-2">
                <button onClick={handleInitiateBGV} disabled={actionLoading === "bgv"}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center justify-center gap-2 disabled:opacity-60">
                  {actionLoading === "bgv" && <Loader2 size={14} className="animate-spin" />}
                  <Brain size={16} /> Initiate BGV
                </button>
                <p className="text-[11px] text-gray-400 text-center">Creates a background verification entry. Candidate details will be pre-filled from their profile.</p>
              </div>
            )}

            {interview.overallStatus === "Hired" && interview.bgvInitiated && (
              <div className="text-center py-3 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-sm font-medium text-emerald-700">✓ Hired & BGV Initiated</p>
              </div>
            )}

            {interview.overallStatus === "Rejected" && (
              <div className="text-center py-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-sm font-medium text-red-700">Candidate Rejected</p>
                {interview.rejectionReason && <p className="text-xs text-red-500 mt-1">{interview.rejectionReason}</p>}
                {interview.rejectedAtRound && <p className="text-xs text-red-400 mt-0.5">Rejected at Round {interview.rejectedAtRound}</p>}
              </div>
            )}

            {/* Flow explanation */}
            <div className="mt-4 bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[11px] text-gray-500 font-semibold mb-1.5">INTERVIEW FLOW</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400 flex-wrap">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">Schedule Rounds</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded font-medium">Extend Offer</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded font-medium">Mark Hired</span>
                <span>→</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded font-medium">Initiate BGV</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {scheduleModal && <ScheduleModal interview={interview} round={scheduleModal} onClose={() => setScheduleModal(null)} onSuccess={handleModalSuccess} />}
      {updateModal && <UpdateRoundModal interview={interview} round={updateModal} onClose={() => setUpdateModal(null)} onSuccess={handleModalSuccess} />}
      {rejectModal && <RejectModal interview={interview} onClose={() => setRejectModal(false)} onSuccess={handleModalSuccess} />}
    </>
  );
}


/* ─────────────────────────────────────────────
   INTERVIEWER FORM MODAL
───────────────────────────────────────────── */
function InterviewerFormModal({ interviewer, onClose, onSuccess }) {
  const isEdit = !!interviewer;
  const [form, setForm] = useState({
    name: interviewer?.name || "",
    email: interviewer?.email || "",
    phone: interviewer?.phone || "",
    designation: interviewer?.designation || "",
    department: interviewer?.department || "",
    expertise: interviewer?.expertise?.join(", ") || "",
    roundPreferences: interviewer?.roundPreferences || [],
    availabilityNotes: interviewer?.availabilityNotes || "",
    isAvailable: interviewer?.isAvailable !== false,
  });
  const [saving, setSaving] = useState(false);

  const toggleRound = (r) => {
    setForm(prev => ({
      ...prev,
      roundPreferences: prev.roundPreferences.includes(r)
        ? prev.roundPreferences.filter(x => x !== r)
        : [...prev.roundPreferences, r],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        designation: form.designation.trim(),
        department: form.department.trim(),
        expertise: form.expertise.split(",").map(s => s.trim()).filter(Boolean),
        roundPreferences: form.roundPreferences,
        availabilityNotes: form.availabilityNotes.trim(),
        isAvailable: form.isAvailable,
      };

      let res;
      if (isEdit) {
        const id = interviewer._id || interviewer.interviewerId;
        res = await fetch(`/api/proxy/secure/updateInterviewer/${id}`, {
          method: "PUT", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/proxy/secure/createInterviewer", {
          method: "POST", credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) { onSuccess(isEdit ? "Interviewer updated" : "Interviewer created"); }
      else {
        const data = await res.json().catch(() => ({}));
        onSuccess(getErrorMsg(data, "Failed to save interviewer"), "error");
      }
    } catch { onSuccess("Network error. Please try again.", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col border border-gray-100">
        {/* Header */}
        <div className="relative px-7 py-6 flex-shrink-0 overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <UserPlus size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-white">{isEdit ? "Edit Interviewer" : "Add Interviewer"}</h3>
                <p className="text-xs text-indigo-100 mt-0.5">{isEdit ? "Update details below" : "This person will appear in scheduling dropdowns"}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-xl p-2 transition">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-7 space-y-5 overflow-y-auto flex-1">
          {/* Personal Info Section */}
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User size={12} /> Personal Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><User size={11} className="text-indigo-500" /> Name *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                  placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Mail size={11} className="text-blue-500" /> Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                  placeholder="email@company.com" />
              </div>
            </div>
          </div>

          {/* Role Section */}
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase size={12} /> Role & Department
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Phone size={11} className="text-green-500" /> Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                  placeholder="+91 9876543210" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Star size={11} className="text-amber-500" /> Designation</label>
              <input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                placeholder="Senior Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Briefcase size={11} className="text-purple-500" /> Department</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                placeholder="Engineering" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag size={11} className="text-cyan-500" /> Expertise (comma separated)</label>
              <input value={form.expertise} onChange={(e) => setForm({ ...form, expertise: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300"
                placeholder="React, Node.js, System Design" />
            </div>
          </div>
          </div>
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CalendarCheck size={12} /> Interview Preferences
            </p>
            <label className="block text-xs font-bold text-gray-700 mb-2">Round Preferences</label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((r) => (
                <button key={r} type="button" onClick={() => toggleRound(r)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all ${
                    form.roundPreferences.includes(r)
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm"
                      : "border-gray-200 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50"
                  }`}>
                  R{r}: {ROUND_NAMES[r - 1]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock size={11} className="text-orange-500" /> Availability Notes</label>
            <textarea rows={2} value={form.availabilityNotes} onChange={(e) => setForm({ ...form, availabilityNotes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition hover:border-gray-300 resize-none"
              placeholder="e.g. Available Mon-Fri 10am-5pm" />
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="sr-only peer" />
              <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
            <div>
              <span className="text-sm text-gray-700 font-bold">Available for interviews</span>
              <p className="text-[10px] text-gray-400">Toggle off if temporarily unavailable</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">Cancel</button>
            <button type="submit" disabled={saving} className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-60">
              {saving && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? "Save Changes" : "Add Interviewer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


/* ─────────────────────────────────────────────
   INTERVIEWERS TAB CONTENT
───────────────────────────────────────────── */
function InterviewersTab({ setToast }) {
  const [interviewers, setInterviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formModal, setFormModal] = useState(null); // null | "new" | interviewer object
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadInterviewers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/proxy/secure/getInterviewers", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = data.interviewers || (Array.isArray(data) ? data : []);
        setInterviewers(Array.isArray(list) ? list.filter(i => i && typeof i === "object" && i.name) : []);
      }
    } catch (err) {
      console.error("Failed to load interviewers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInterviewers(); }, []);

  const handleFormSuccess = (msg, type = "success") => {
    setFormModal(null);
    setToast({ message: msg, type });
    loadInterviewers();
  };

  const handleDelete = async (interviewer) => {
    setDeleting(true);
    try {
      const id = interviewer._id || interviewer.interviewerId;
      const res = await fetch(`/api/proxy/secure/deleteInterviewer/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (res.ok) {
        setToast({ message: "Interviewer deleted", type: "success" });
        loadInterviewers();
      } else {
        const data = await res.json().catch(() => ({}));
        setToast({ message: getErrorMsg(data, "Failed to delete"), type: "error" });
      }
    } catch {
      setToast({ message: "Network error", type: "error" });
    } finally {
      setDeleting(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header + Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Interviewers Panel</h2>
          <p className="text-sm text-gray-500">{interviewers.length} interviewer{interviewers.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={() => setFormModal("new")}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2">
          <UserPlus size={16} /> Add Interviewer
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 flex gap-3">
        <Info size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-indigo-700">
          Interviewers added here will appear in the scheduling dropdown when you schedule interview rounds. Make sure to set their round preferences and availability.
        </p>
      </div>

      {/* List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 size={28} className="animate-spin text-indigo-500" />
          <p className="text-sm text-gray-500">Loading interviewers...</p>
        </div>
      ) : interviewers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center">
            <Users size={24} className="text-indigo-400" />
          </div>
          <p className="text-gray-600 font-medium">No interviewers yet</p>
          <p className="text-sm text-gray-400">Add your first interviewer to start scheduling rounds.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviewers.map((iv) => (
            <div key={iv._id || iv.interviewerId} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(iv.name || "I")[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{iv.name}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        iv.isAvailable !== false ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {iv.isAvailable !== false ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">{iv.designation || iv.department || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => setFormModal(iv)} className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition" title="Edit">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteConfirm(iv)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* Details row */}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-500">
                {iv.email && <span className="flex items-center gap-1.5"><Mail size={12} className="text-gray-400" />{iv.email}</span>}
                {iv.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-gray-400" />{iv.phone}</span>}
                {iv.department && <span className="flex items-center gap-1.5"><Briefcase size={12} className="text-gray-400" />{iv.department}</span>}
              </div>

              {/* Expertise tags */}
              {iv.expertise && iv.expertise.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {iv.expertise.map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-medium">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Round preferences */}
              {iv.roundPreferences && iv.roundPreferences.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {iv.roundPreferences.map((r) => (
                    <span key={r} className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 text-[11px] font-medium">
                      R{r}: {ROUND_NAMES[r - 1]}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats row */}
              {(iv.totalConducted > 0 || iv.avgRating > 0) && (
                <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                  {iv.totalConducted > 0 && <span className="flex items-center gap-1"><CalendarCheck size={12} className="text-gray-400" />{iv.totalConducted} conducted</span>}
                  {iv.avgRating > 0 && <span className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" />{iv.avgRating.toFixed(1)} avg</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {formModal && (
        <InterviewerFormModal
          interviewer={formModal === "new" ? null : formModal}
          onClose={() => setFormModal(null)}
          onSuccess={handleFormSuccess}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Delete Interviewer?</h3>
            <p className="text-sm text-gray-600">Are you sure you want to delete <strong>{deleteConfirm.name}</strong>? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={deleting}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-60">
                {deleting && <Loader2 size={14} className="animate-spin" />} Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function OrgInterviewsPage() {
  const [activeTab, setActiveTab] = useState("interviews");
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [toast, setToast] = useState(null);

  /* ── Load jobs on mount ── */
  useEffect(() => {
    const loadJobs = async () => {
      try {
        setJobsLoading(true);
        const res = await fetch("/api/proxy/secure/getJobs", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const jobList = data.jobs || (Array.isArray(data) ? data : []);
          setJobs(Array.isArray(jobList) ? jobList.filter(j => j && typeof j === "object" && (j._id || j.id)) : []);
        }
      } catch (err) {
        console.error("Failed to load jobs:", err);
      } finally {
        setJobsLoading(false);
      }
    };
    loadJobs();
  }, []);

  /* ── Load interviews ── */
  useEffect(() => {
    if (activeTab !== "interviews") return;
    const loadInterviews = async () => {
      try {
        setLoading(true);
        /* Use getInterviews (with jobId) when a job is selected, getAllInterviews otherwise */
        const url = selectedJobId
          ? `/api/proxy/secure/getInterviews?jobId=${selectedJobId}`
          : `/api/proxy/secure/getAllInterviews`;
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.interviews || (Array.isArray(data) ? data : []);
          setInterviews(Array.isArray(list) ? list.filter(i => i && typeof i === "object" && !i.loc).map(normalizeInterview) : []);
        } else {
          setInterviews([]);
        }
      } catch (err) {
        console.error("Failed to load interviews:", err);
        setInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadInterviews();
  }, [selectedJobId, activeTab]);

  /* ── Refresh interviews ── */
  const refreshInterviews = async () => {
    try {
      const url = selectedJobId
        ? `/api/proxy/secure/getInterviews?jobId=${selectedJobId}`
        : `/api/proxy/secure/getAllInterviews`;
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const list = data.interviews || (Array.isArray(data) ? data : []);
        setInterviews(Array.isArray(list) ? list.filter(i => i && typeof i === "object" && !i.loc).map(normalizeInterview) : []);
      }
    } catch (err) {
      console.error("Failed to refresh interviews:", err);
    }
  };

  /* ── Handle drawer action ── */
  const handleDrawerAction = (msg, type = "success") => {
    setToast({ message: msg, type });
    setSelectedInterview(null);
    refreshInterviews();
  };

  /* ── Stats ── */
  const totalInterviews = interviews.length;
  const inProgress = interviews.filter((i) => i.overallStatus === "In Progress").length;
  const offerExtended = interviews.filter((i) => i.overallStatus === "Offer Extended").length;
  const hired = interviews.filter((i) => i.overallStatus === "Hired").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
              <CalendarCheck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Interview Management</h1>
              <p className="text-sm text-gray-500">Schedule rounds and manage your interviewer panel</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-medium text-blue-700">{totalInterviews} active</span>
          </div>
        </div>

        {/* ── Tab Toggle ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-1.5 inline-flex gap-1">
          <button onClick={() => setActiveTab("interviews")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "interviews"
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
            }`}>
            <span className="flex items-center gap-2"><CalendarCheck size={15} /> Interviews</span>
          </button>
          <button onClick={() => setActiveTab("interviewers")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition ${
              activeTab === "interviewers"
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
            }`}>
            <span className="flex items-center gap-2"><Users size={15} /> Interviewers</span>
          </button>
        </div>

        {/* ── INTERVIEWS TAB ── */}
        {activeTab === "interviews" && (
          <>
            {/* Job Selector */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <label className="block text-xs font-semibold text-gray-600 mb-2">Filter by Job</label>
              {jobsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={16} className="animate-spin" /> Loading jobs...
                </div>
              ) : (
                <div className="relative">
                  <Briefcase size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent appearance-none bg-white">
                    <option value="">All Jobs</option>
                    {jobs.map((job) => (
                      <option key={job._id || job.id} value={job._id || job.id}>
                        {job.title || job.jobTitle || "Untitled Job"}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              )}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total", value: totalInterviews, icon: Users, bg: "bg-blue-50", iconColor: "text-blue-600" },
                { label: "In Progress", value: inProgress, icon: Clock, bg: "bg-amber-50", iconColor: "text-amber-600" },
                { label: "Offer Extended", value: offerExtended, icon: CheckCircle2, bg: "bg-green-50", iconColor: "text-green-600" },
                { label: "Hired", value: hired, icon: CalendarCheck, bg: "bg-emerald-50", iconColor: "text-emerald-600" },
              ].map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${card.bg}`}>
                    <card.icon size={20} className={card.iconColor} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900">{card.value}</p>
                    <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Interview Cards */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
                  <Loader2 size={28} className="animate-spin text-blue-500" />
                  <p className="text-sm text-gray-500">Loading interviews...</p>
                </div>
              ) : interviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                    <CalendarCheck size={24} className="text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">No interviews found</p>
                  <p className="text-sm text-gray-400 text-center max-w-xs">Interviews are created from the Jobs pipeline when candidates reach the Interview stage.</p>
                </div>
              ) : (
                interviews.map((interview, idx) => {
                  const rounds = interview.rounds || [];
                  const passedCount = rounds.filter(r => r.status === "Passed").length;
                  const scheduledCount = rounds.filter(r => r.status === "Scheduled").length;
                  const progress = rounds.length > 0 ? Math.round((passedCount / rounds.length) * 100) : 0;
                  return (
                    <div key={interview._id || interview.id || interview.applicationId || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md group-hover:scale-105 transition-transform">
                            {(interview.candidateName || "C")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{interview.candidateName}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${OVERALL_STATUS_STYLES[interview.overallStatus] || "bg-gray-100 text-gray-600"}`}>
                                {interview.overallStatus}
                              </span>
                              {interview.jobTitle && <span className="text-xs text-gray-400 truncate">• {interview.jobTitle}</span>}
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setSelectedInterview(interview)}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 text-xs font-bold hover:from-blue-100 hover:to-indigo-100 transition flex items-center gap-1.5 flex-shrink-0 border border-blue-100">
                          Manage <ChevronRight size={14} />
                        </button>
                      </div>

                      {/* Round pills + progress bar */}
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-1.5">
                          {rounds.map((round, ridx) => (
                            <span key={ridx}
                              className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${ROUND_STATUS_STYLES[round.status] || "bg-gray-100 text-gray-500"}`}>
                              {round.roundName || ROUND_NAMES[ridx] || `R${round.roundNumber}`}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium flex-shrink-0">
                            {passedCount}/{rounds.length} passed
                            {scheduledCount > 0 && ` • ${scheduledCount} scheduled`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ── INTERVIEWERS TAB ── */}
        {activeTab === "interviewers" && (
          <InterviewersTab setToast={setToast} />
        )}
      </div>

      {/* ── Detail Drawer ── */}
      {selectedInterview && (
        <DetailDrawer
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onAction={handleDrawerAction}
        />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
