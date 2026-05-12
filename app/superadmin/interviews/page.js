"use client";

import { useState } from "react";
import {
  CalendarCheck,
  Users,
  CheckCircle2,
  Star,
  Search,
  Building2,
  Eye,
  X,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  ChevronDown,
  Filter,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DUMMY DATA  (with orgName added)
───────────────────────────────────────────── */
const DUMMY_INTERVIEWS = [
  {
    id: "i1",
    candidateName: "Mohan Vanukuri",
    candidateEmail: "mohan@gmail.com",
    candidatePhone: "9876543210",
    jobTitle: "Senior ML Engineer",
    orgName: "TFG Technologies",
    stage: "Tech Round",
    interviewerName: "Rahul Sharma",
    scheduledAt: "2026-05-15T10:00:00",
    feedback: "Strong Python skills, good system design knowledge. Needs improvement in MLOps.",
    rating: 4,
    recordingLink: "https://meet.google.com/recording/abc123",
    status: "completed",
    statusHistory: [
      { stage: "Applied",    changedAt: "2026-05-01T09:00:00", changedBy: "System",       notes: "Application received"      },
      { stage: "Screening",  changedAt: "2026-05-05T11:00:00", changedBy: "HR Team",       notes: "Resume shortlisted"        },
      { stage: "HR Round",   changedAt: "2026-05-08T14:00:00", changedBy: "Priya HR",      notes: "HR round cleared"          },
      { stage: "Tech Round", changedAt: "2026-05-12T10:00:00", changedBy: "Rahul Sharma",  notes: "Tech interview scheduled"  },
    ],
  },
  {
    id: "i2",
    candidateName: "Priya Sharma",
    candidateEmail: "priya@gmail.com",
    candidatePhone: "9988776655",
    jobTitle: "Senior ML Engineer",
    orgName: "TFG Technologies",
    stage: "Offer",
    interviewerName: "Anil Kumar",
    scheduledAt: "2026-05-18T14:00:00",
    feedback: "Excellent candidate. Strong in all areas. Highly recommended.",
    rating: 5,
    recordingLink: null,
    status: "completed",
    statusHistory: [
      { stage: "Applied",        changedAt: "2026-04-28T09:00:00", changedBy: "System",      notes: ""                        },
      { stage: "Screening",      changedAt: "2026-05-02T10:00:00", changedBy: "HR Team",      notes: "Top candidate"           },
      { stage: "HR Round",       changedAt: "2026-05-06T11:00:00", changedBy: "Priya HR",     notes: "Excellent communication" },
      { stage: "Tech Round",     changedAt: "2026-05-10T14:00:00", changedBy: "Rahul Sharma", notes: "Perfect score"           },
      { stage: "Manager Round",  changedAt: "2026-05-14T16:00:00", changedBy: "Anil Kumar",   notes: "Great cultural fit"      },
      { stage: "Offer",          changedAt: "2026-05-18T09:00:00", changedBy: "HR Team",      notes: "Offer letter sent"       },
    ],
  },
  {
    id: "i3",
    candidateName: "Irfan Melekkandy",
    candidateEmail: "irfan@gmail.com",
    candidatePhone: "8624233940",
    jobTitle: "Full Stack Developer",
    orgName: "Maihoo",
    stage: "HR Round",
    interviewerName: "Sneha Reddy",
    scheduledAt: "2026-05-20T11:00:00",
    feedback: null,
    rating: null,
    recordingLink: null,
    status: "scheduled",
    statusHistory: [
      { stage: "Applied",   changedAt: "2026-05-10T09:00:00", changedBy: "System",      notes: ""                    },
      { stage: "Screening", changedAt: "2026-05-14T10:00:00", changedBy: "HR Team",      notes: "Good profile"        },
      { stage: "HR Round",  changedAt: "2026-05-17T11:00:00", changedBy: "Sneha Reddy",  notes: "HR round scheduled"  },
    ],
  },
  {
    id: "i4",
    candidateName: "Kavya Patel",
    candidateEmail: "kavya@gmail.com",
    candidatePhone: "9222233333",
    jobTitle: "DevOps Engineer",
    orgName: "ABC Corp",
    stage: "Rejected",
    interviewerName: "Vikram Singh",
    scheduledAt: "2026-05-10T15:00:00",
    feedback: "Lacks hands-on Kubernetes experience. Not suitable for senior role.",
    rating: 2,
    recordingLink: null,
    status: "completed",
    statusHistory: [
      { stage: "Applied",   changedAt: "2026-05-05T09:00:00", changedBy: "System",       notes: ""                      },
      { stage: "Screening", changedAt: "2026-05-07T10:00:00", changedBy: "HR Team",       notes: ""                      },
      { stage: "Tech Round",changedAt: "2026-05-10T15:00:00", changedBy: "Vikram Singh",  notes: "Technical gaps found"  },
      { stage: "Rejected",  changedAt: "2026-05-11T09:00:00", changedBy: "HR Team",       notes: "Not suitable for role" },
    ],
  },
  {
    id: "i5",
    candidateName: "Arjun Nair",
    candidateEmail: "arjun@gmail.com",
    candidatePhone: "9111122222",
    jobTitle: "Senior ML Engineer",
    orgName: "TFG Technologies",
    stage: "Hired",
    interviewerName: "Anil Kumar",
    scheduledAt: "2026-05-05T10:00:00",
    feedback: "Outstanding candidate. Best we have seen this quarter.",
    rating: 5,
    recordingLink: "https://zoom.us/recording/xyz789",
    status: "completed",
    statusHistory: [
      { stage: "Applied",        changedAt: "2026-04-20T09:00:00", changedBy: "System",      notes: ""                      },
      { stage: "Screening",      changedAt: "2026-04-23T10:00:00", changedBy: "HR Team",      notes: ""                      },
      { stage: "HR Round",       changedAt: "2026-04-26T11:00:00", changedBy: "Priya HR",     notes: "Excellent"             },
      { stage: "Tech Round",     changedAt: "2026-04-29T14:00:00", changedBy: "Rahul Sharma", notes: "Perfect"               },
      { stage: "Manager Round",  changedAt: "2026-05-02T16:00:00", changedBy: "Anil Kumar",   notes: "Approved"              },
      { stage: "Offer",          changedAt: "2026-05-04T09:00:00", changedBy: "HR Team",      notes: "Offer accepted"        },
      { stage: "Hired",          changedAt: "2026-05-05T10:00:00", changedBy: "HR Team",      notes: "Joining date confirmed"},
    ],
  },
  {
    id: "i6",
    candidateName: "Sneha Reddy",
    candidateEmail: "sneha@gmail.com",
    candidatePhone: "9000011111",
    jobTitle: "Full Stack Developer",
    orgName: "Maihoo",
    stage: "Manager Round",
    interviewerName: "Anil Kumar",
    scheduledAt: "2026-05-22T16:00:00",
    feedback: "Good technical skills. Awaiting manager approval.",
    rating: 4,
    recordingLink: null,
    status: "scheduled",
    statusHistory: [
      { stage: "Applied",        changedAt: "2026-05-08T09:00:00", changedBy: "System",      notes: ""                          },
      { stage: "Screening",      changedAt: "2026-05-11T10:00:00", changedBy: "HR Team",      notes: ""                          },
      { stage: "HR Round",       changedAt: "2026-05-14T11:00:00", changedBy: "Priya HR",     notes: "Good fit"                  },
      { stage: "Tech Round",     changedAt: "2026-05-17T14:00:00", changedBy: "Rahul Sharma", notes: "Strong React skills"       },
      { stage: "Manager Round",  changedAt: "2026-05-20T09:00:00", changedBy: "Anil Kumar",   notes: "Manager round scheduled"   },
    ],
  },
];

/* ─────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────── */
const ALL_STAGES = [
  "Applied", "Screening", "HR Round", "Tech Round",
  "Manager Round", "Offer", "Hired", "Rejected",
];

const ALL_ORGS = ["TFG Technologies", "Maihoo", "ABC Corp"];

const STAGE_CONFIG = {
  Applied:         { bg: "bg-blue-100",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500"    },
  Screening:       { bg: "bg-cyan-100",    text: "text-cyan-700",    border: "border-cyan-200",    dot: "bg-cyan-500"    },
  "HR Round":      { bg: "bg-purple-100",  text: "text-purple-700",  border: "border-purple-200",  dot: "bg-purple-500"  },
  "Tech Round":    { bg: "bg-indigo-100",  text: "text-indigo-700",  border: "border-indigo-200",  dot: "bg-indigo-500"  },
  "Manager Round": { bg: "bg-amber-100",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-500"   },
  Offer:           { bg: "bg-green-100",   text: "text-green-700",   border: "border-green-200",   dot: "bg-green-500"   },
  Hired:           { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300", dot: "bg-emerald-600" },
  Rejected:        { bg: "bg-red-100",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500"     },
};

const STATUS_CONFIG = {
  scheduled: { bg: "bg-blue-100",  text: "text-blue-700",  label: "Scheduled" },
  completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
  cancelled: { bg: "bg-gray-100",  text: "text-gray-600",  label: "Cancelled" },
};

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

function StarRating({ rating, size = 14 }) {
  if (!rating) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={size}
          className={s <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-gray-100"} />
      ))}
    </div>
  );
}

function StageBadge({ stage }) {
  const cfg = STAGE_CONFIG[stage] || STAGE_CONFIG["Applied"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {stage}
    </span>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG["scheduled"];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

function Avatar({ name, size = "md" }) {
  const initials = name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const sizeClass = size === "lg" ? "w-12 h-12 text-base" : "w-8 h-8 text-xs";
  const colors = ["bg-violet-500","bg-blue-500","bg-emerald-500","bg-amber-500","bg-rose-500","bg-cyan-500","bg-indigo-500","bg-pink-500"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizeClass} ${color} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────
   READ-ONLY DETAIL DRAWER
───────────────────────────────────────────── */
function ReadOnlyDrawer({ interview, onClose }) {
  if (!interview) return null;
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg z-50 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <Avatar name={interview.candidateName} size="lg" />
            <div>
              <h2 className="text-lg font-bold text-gray-900">{interview.candidateName}</h2>
              <p className="text-sm text-gray-500">{interview.jobTitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Stage + Status */}
          <div className="flex items-center gap-3 flex-wrap">
            <StageBadge stage={interview.stage} />
            <StatusBadge status={interview.status} />
          </div>

          {/* Organization */}
          <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <Building2 size={16} className="text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Organization</p>
              <p className="text-sm font-bold text-gray-900">{interview.orgName}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Contact Information</h3>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Mail size={14} className="text-gray-400 flex-shrink-0" />
              <span>{interview.candidateEmail}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Phone size={14} className="text-gray-400 flex-shrink-0" />
              <span>{interview.candidatePhone}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Briefcase size={14} className="text-gray-400 flex-shrink-0" />
              <span>{interview.jobTitle}</span>
            </div>
          </div>

          {/* Interview Details */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Interview Details</h3>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="text-gray-400 text-xs font-medium w-20">Interviewer</span>
              <span className="font-medium text-gray-900">{interview.interviewerName}</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm text-gray-700">
              <Calendar size={14} className="text-gray-400 flex-shrink-0" />
              <span>{fmtDate(interview.scheduledAt)}</span>
            </div>
            {interview.rating && (
              <div className="flex items-center gap-2.5">
                <Star size={14} className="text-gray-400 flex-shrink-0" />
                <StarRating rating={interview.rating} size={15} />
                <span className="text-sm text-gray-500">({interview.rating}/5)</span>
              </div>
            )}
          </div>

          {/* Feedback */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Feedback</h3>
            {interview.feedback ? (
              <p className="text-sm text-gray-700 leading-relaxed">{interview.feedback}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">No feedback recorded.</p>
            )}
          </div>

          {/* Recording */}
          {interview.recordingLink && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <h3 className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Recording</h3>
              <a href={interview.recordingLink} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition">
                View Recording →
              </a>
            </div>
          )}

          {/* Status History Timeline */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Status History</h3>
            <div className="relative">
              {interview.statusHistory.map((h, idx) => {
                const cfg = STAGE_CONFIG[h.stage] || STAGE_CONFIG["Applied"];
                const isLast = idx === interview.statusHistory.length - 1;
                return (
                  <div key={idx} className="flex gap-3 relative">
                    {!isLast && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className={`w-5 h-5 rounded-full flex-shrink-0 mt-0.5 border-2 border-white shadow-sm ${cfg.dot}`} />
                    <div className="flex-1 pb-5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{h.stage}</span>
                        <span className="text-xs text-gray-400">{fmtDate(h.changedAt)}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">By <span className="font-medium text-gray-700">{h.changedBy}</span></p>
                      {h.notes && <p className="text-xs text-gray-600 mt-1 bg-gray-50 rounded px-2 py-1">{h.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Read-only footer note */}
        <div className="px-6 py-4 border-t bg-amber-50 border-amber-100">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-700 font-medium">
              SuperAdmin view is read-only. Actions are managed by the respective organization.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function SuperAdminInterviewsPage() {
  const [interviews] = useState(DUMMY_INTERVIEWS);
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("All");
  const [stageFilter, setStageFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedInterview, setSelectedInterview] = useState(null);

  /* ── Filtered data ── */
  const filtered = interviews.filter((iv) => {
    const q = search.toLowerCase();
    const matchSearch = !q || iv.candidateName.toLowerCase().includes(q) || iv.jobTitle.toLowerCase().includes(q) || iv.orgName.toLowerCase().includes(q);
    const matchOrg = orgFilter === "All" || iv.orgName === orgFilter;
    const matchStage = stageFilter === "All" || iv.stage === stageFilter;
    const matchStatus = statusFilter === "All" || iv.status === statusFilter;
    return matchSearch && matchOrg && matchStage && matchStatus;
  });

  /* ── Stats ── */
  const total = interviews.length;
  const active = interviews.filter((i) => i.stage !== "Hired" && i.stage !== "Rejected").length;
  const hiredThisMonth = interviews.filter((i) => i.stage === "Hired").length;
  const rated = interviews.filter((i) => i.rating);
  const avgRating = rated.length
    ? (rated.reduce((sum, i) => sum + i.rating, 0) / rated.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-gray-200 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-orange-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-slate-400/8 to-gray-400/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 p-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-700 rounded-xl shadow-lg">
              <CalendarCheck size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Interviews Overview</h1>
              <p className="text-sm text-gray-500">Cross-organization interview pipeline visibility</p>
            </div>
          </div>
          {/* Read-only badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 border border-amber-200 rounded-xl">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-sm font-semibold text-amber-700">Read-Only Access</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Interviews",   value: total,           icon: Users,        light: "bg-slate-100",   iconColor: "text-slate-600"   },
            { label: "Active Pipelines",   value: active,          icon: CalendarCheck,light: "bg-blue-50",     iconColor: "text-blue-600"    },
            { label: "Hired This Month",   value: hiredThisMonth,  icon: CheckCircle2, light: "bg-emerald-50",  iconColor: "text-emerald-600" },
            { label: "Avg Rating",         value: avgRating,       icon: Star,         light: "bg-amber-50",    iconColor: "text-amber-500"   },
          ].map((card) => (
            <div key={card.label} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:shadow-md transition">
              <div className={`p-3 rounded-xl ${card.light}`}>
                <card.icon size={22} className={card.iconColor} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 font-medium">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate, job, or organization..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            {/* Org filter */}
            <div className="relative">
              <Building2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none bg-white min-w-[160px]"
              >
                <option value="All">All Organizations</option>
                {ALL_ORGS.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Stage filter */}
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="pl-8 pr-8 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 appearance-none bg-white min-w-[140px]"
              >
                <option value="All">All Stages</option>
                {ALL_STAGES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            {/* Status pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {["All", "scheduled", "completed", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    statusFilter === s
                      ? "bg-slate-700 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {s === "All" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700">All Interviews</h2>
            <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full font-medium">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Candidate", "Job", "Organization", "Stage", "Interviewer", "Scheduled", "Rating", "Status", "View"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <CalendarCheck size={22} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No interviews match your filters</p>
                        <p className="text-gray-400 text-xs">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((iv) => (
                    <tr key={iv.id} className="hover:bg-gray-50/70 transition group">
                      {/* Candidate */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={iv.candidateName} />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{iv.candidateName}</p>
                            <p className="text-xs text-gray-400">{iv.candidateEmail}</p>
                          </div>
                        </div>
                      </td>
                      {/* Job */}
                      <td className="px-4 py-3.5">
                        <span className="text-gray-700 font-medium text-sm">{iv.jobTitle}</span>
                      </td>
                      {/* Organization */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 size={13} className="text-gray-400 flex-shrink-0" />
                          <span className="text-gray-700 text-sm font-medium">{iv.orgName}</span>
                        </div>
                      </td>
                      {/* Stage */}
                      <td className="px-4 py-3.5">
                        <StageBadge stage={iv.stage} />
                      </td>
                      {/* Interviewer */}
                      <td className="px-4 py-3.5 text-gray-600 text-sm whitespace-nowrap">{iv.interviewerName}</td>
                      {/* Scheduled */}
                      <td className="px-4 py-3.5 text-gray-500 text-xs whitespace-nowrap">{fmtDate(iv.scheduledAt)}</td>
                      {/* Rating */}
                      <td className="px-4 py-3.5">
                        <StarRating rating={iv.rating} size={13} />
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <StatusBadge status={iv.status} />
                      </td>
                      {/* View */}
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelectedInterview(iv)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition group-hover:bg-slate-200"
                        >
                          <Eye size={13} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Showing <span className="font-semibold text-gray-700">{filtered.length}</span> of{" "}
                <span className="font-semibold text-gray-700">{interviews.length}</span> interviews
              </p>
              <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                Read-only — no edits permitted
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Read-Only Drawer ── */}
      {selectedInterview && (
        <ReadOnlyDrawer
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
        />
      )}
    </div>
  );
}
