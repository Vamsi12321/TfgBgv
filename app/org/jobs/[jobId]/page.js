"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Briefcase, Users, Star, MapPin, Clock,
  Mail, Phone, CheckCircle2, XCircle, Loader2,
  Search, ChevronRight, X, Eye, Calendar, UserCheck,
  FileText, Brain, ArrowRight,
} from "lucide-react";
import Link from "next/link";

const STAGES = [
  { key: "Applied", label: "Applied", icon: Users, color: "blue", gradient: "from-blue-500 to-blue-600", desc: "Candidates who applied for this role" },
  { key: "Resume Shortlist", label: "Resume Shortlist", icon: Star, color: "amber", gradient: "from-amber-500 to-orange-500", desc: "Shortlisted after AI screening or manual review" },
  { key: "Interview", label: "Interview", icon: UserCheck, color: "indigo", gradient: "from-indigo-500 to-indigo-600", desc: "Moved to interview rounds" },
];

const STAGE_COLORS = {
  blue: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100 text-blue-700" },
  amber: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-700" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", badge: "bg-indigo-100 text-indigo-700" },
};

function ScoreBadge({ score }) {
  if (!score) return null;
  const cls = score >= 80 ? "bg-green-100 text-green-700 border-green-200"
    : score >= 60 ? "bg-amber-100 text-amber-700 border-amber-200"
    : "bg-red-100 text-red-600 border-red-200";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${cls}`}>
      <Star size={10} /> {score}%
    </span>
  );
}

function CandidateCard({ candidate }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {(candidate.name || "?").charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{candidate.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="flex gap-1">
              {candidate.skills.slice(0, 3).map(s => (
                <span key={s} className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <ScoreBadge score={candidate.score} />
    </div>
  );
}

export default function JobPipelinePage() {
  const params = useParams();
  const jobId = params.jobId;

  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load job + applications
  useEffect(() => {
    if (!jobId || jobId === "undefined") return;
    const load = async () => {
      try {
        setLoading(true);
        const [jobRes, appsRes] = await Promise.all([
          fetch(`/api/proxy/secure/getJob?jobId=${jobId}`, { credentials: "include" }),
          fetch(`/api/proxy/secure/getApplications?jobId=${jobId}`, { credentials: "include" }),
        ]);
        if (jobRes.ok) {
          const d = await jobRes.json();
          setJob(d.job || d);
        }
        if (appsRes.ok) {
          const d = await appsRes.json();
          setCandidates((d.applications || []).map(a => ({
            id: a._id || a.id,
            name: a.jobSeekerName || a.candidateName || "Unknown",
            email: a.jobSeekerEmail || a.candidateEmail || "",
            phone: a.jobSeekerPhone || a.candidatePhone || "",
            score: a.aiScore || 0,
            stage: a.stage || "Applied",
            skills: a.jobSeekerProfile?.skills || a.candidateProfile?.skills || [],
          })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const JOB = job || { title: "Job", location: "", experience: "", type: "", deadline: "", skills: [], status: "open", description: "" };
  const appliedCount = candidates.filter(c => c.stage === "Applied").length;
  const shortlistCount = candidates.filter(c => c.stage === "Resume Shortlist").length;
  const interviewCount = candidates.filter(c => c.stage === "Interview").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      {/* Back */}
      <Link href="/org/jobs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-4 transition">
        <ArrowLeft size={16} /> Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-5 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-gray-900">{JOB.title}</h1>
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${JOB.status === "open" ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200"}`}>
                {JOB.status === "open" ? "Open" : "Closed"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
              {JOB.location && <span className="flex items-center gap-1"><MapPin size={13} /> {JOB.location}</span>}
              {JOB.experience && <span className="flex items-center gap-1"><Clock size={13} /> {JOB.experience}</span>}
              {JOB.type && <span className="flex items-center gap-1"><Briefcase size={13} /> {JOB.type}</span>}
              {JOB.deadline && <span className="flex items-center gap-1"><Calendar size={13} /> Deadline: {new Date(JOB.deadline).toLocaleDateString()}</span>}
            </div>
            {JOB.skills && JOB.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {JOB.skills.map(s => (
                  <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
          {/* Stats */}
          <div className="flex gap-3">
            {[
              { label: "Applied", value: appliedCount, color: "text-blue-600" },
              { label: "Shortlisted", value: shortlistCount, color: "text-amber-600" },
              { label: "Interview", value: interviewCount, color: "text-indigo-600" },
            ].map(s => (
              <div key={s.label} className="text-center bg-gray-50 rounded-xl px-4 py-2.5">
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info Banner — AI Screening */}
      <div className="flex items-start gap-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl px-4 py-3 mb-6">
        <Brain size={18} className="text-purple-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-purple-800 font-semibold">Use AI Screening to rank & shortlist candidates</p>
          <p className="text-xs text-purple-600 mt-0.5">Go to AI Screening page → upload resumes or use applied candidates → rank them → add to this job's shortlist</p>
        </div>
        <Link href="/org/AI-screening" className="flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-lg transition whitespace-nowrap">
          AI Screening <ArrowRight size={12} />
        </Link>
      </div>

      {/* Pipeline Stages — 2 candidates preview + View All */}
      <div className="space-y-4">
        {STAGES.map(stage => {
          const c = STAGE_COLORS[stage.color];
          const Icon = stage.icon;
          const stageCandidates = candidates.filter(x => x.stage === stage.key);
          const preview = stageCandidates.slice(0, 2);
          const total = stageCandidates.length;

          return (
            <div key={stage.key} className={`rounded-2xl border-2 ${c.border} overflow-hidden`}>
              {/* Stage Header */}
              <div className={`${c.bg} px-5 py-3.5 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-gradient-to-br ${stage.gradient} rounded-lg shadow-sm`}>
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${c.text}`}>{stage.label}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.badge}`}>{total}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{stage.desc}</p>
                  </div>
                </div>
                {total > 0 && (
                  <Link href={`/org/jobs/${jobId}/stage/${stage.key}`}
                    className={`flex items-center gap-1 text-xs font-bold ${c.text} hover:underline`}>
                    View All ({total}) <ChevronRight size={13} />
                  </Link>
                )}
              </div>

              {/* Preview — 2 candidates */}
              <div className="p-4 bg-white/60">
                {total === 0 ? (
                  <div className="text-center py-6 text-gray-300">
                    <Icon size={28} className="mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No candidates in this stage</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {preview.map(candidate => (
                      <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                    {total > 2 && (
                      <p className="text-xs text-gray-400 text-center pt-1">
                        +{total - 2} more candidate{total - 2 > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link href="/org/AI-screening"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-purple-200 hover:shadow-md transition group">
          <div className="p-2 bg-purple-50 rounded-lg group-hover:bg-purple-100 transition">
            <Brain size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">AI Screening</p>
            <p className="text-xs text-gray-500">Rank resumes with AI</p>
          </div>
        </Link>
        <Link href="/org/interviews"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-indigo-200 hover:shadow-md transition group">
          <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition">
            <UserCheck size={18} className="text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Interviews</p>
            <p className="text-xs text-gray-500">Schedule & manage rounds</p>
          </div>
        </Link>
        <Link href="/org/manage-candidates"
          className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition group">
          <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition">
            <Users size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-800">Manage Candidates</p>
            <p className="text-xs text-gray-500">Add or edit candidates</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
