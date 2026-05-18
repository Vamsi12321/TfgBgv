"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Briefcase, Users, Star, MapPin, Clock,
  ChevronRight, Calendar, UserCheck, Brain, ArrowRight,
  Sparkles, TrendingUp, Zap, Target, Award, Eye,
} from "lucide-react";

const STAGES = [
  { key: "Applied", label: "Applied", icon: Users, gradient: "from-blue-500 to-cyan-500", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-500", desc: "New applications received", emoji: "📥" },
  { key: "Resume Shortlist", label: "Resume Shortlist", icon: Star, gradient: "from-amber-500 to-orange-500", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-500", desc: "AI screened & shortlisted", emoji: "⭐" },
  { key: "Interview", label: "Interview", icon: UserCheck, gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", badge: "bg-violet-500", desc: "In interview rounds", emoji: "🎯" },
];

export default function JobPipelinePage() {
  const params = useParams();
  const jobId = params.jobId;
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId || jobId === "undefined") return;
    const load = async () => {
      try {
        setLoading(true);
        const [jobRes, appsRes] = await Promise.all([
          fetch(`/api/proxy/secure/getJob?jobId=${jobId}`, { credentials: "include" }),
          fetch(`/api/proxy/secure/getApplications?jobId=${jobId}`, { credentials: "include" }),
        ]);
        if (jobRes.ok) { const d = await jobRes.json(); setJob(d.job || d); }
        if (appsRes.ok) {
          const d = await appsRes.json();
          setCandidates((d.applications || []).map(a => ({
            id: a._id || a.id,
            name: a.jobSeekerName || a.candidateName || "Unknown",
            email: a.jobSeekerEmail || a.candidateEmail || "",
            score: a.aiScore || 0,
            stage: a.stage || "Applied",
            skills: a.jobSeekerProfile?.skills || a.candidateProfile?.skills || [],
            source: a.source === "JOB_PORTAL" ? "Portal" : a.source === "AI_SCREENING" ? "AI" : "Manual",
          })));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading pipeline...</p>
        </div>
      </div>
    );
  }

  const JOB = job || { title: "Job", location: "", experience: "", type: "", deadline: "", skills: [], status: "open" };
  const totalCandidates = candidates.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Back link */}
        <Link href="/org/jobs" className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition">
          <ArrowLeft size={16} /> Back to Jobs
        </Link>

        {/* ── Job Header Card ── */}
        <div className="relative bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Top gradient accent */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
          
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">{JOB.title}</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${JOB.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {JOB.status === "open" ? "● Open" : "● Closed"}
                      </span>
                      <span className="text-xs text-gray-400">{totalCandidates} total candidates</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-3">
                  {JOB.location && <span className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {JOB.location}</span>}
                  {JOB.experience && <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {JOB.experience}</span>}
                  {JOB.type && <span className="flex items-center gap-1.5"><Briefcase size={14} className="text-gray-400" /> {JOB.type}</span>}
                  {JOB.deadline && <span className="flex items-center gap-1.5"><Calendar size={14} className="text-gray-400" /> Due: {new Date(JOB.deadline).toLocaleDateString()}</span>}
                </div>

                {JOB.skills && JOB.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {JOB.skills.map(s => (
                      <span key={s} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-lg font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Mini stats */}
              <div className="flex md:flex-col gap-3">
                {STAGES.map(stage => {
                  const count = candidates.filter(c => c.stage === stage.key).length;
                  return (
                    <div key={stage.key} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${stage.bg} border ${stage.border}`}>
                      <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white text-[10px] font-bold`}>{count}</span>
                      <span className={`text-xs font-semibold ${stage.text}`}>{stage.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Pipeline Flow ── */}
        <div className="space-y-1">
          {/* Flow header */}
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16} className="text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900">Hiring Pipeline</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent ml-3" />
          </div>

          {/* Stage Cards */}
          {STAGES.map((stage, stageIdx) => {
            const stageCandidates = candidates.filter(c => c.stage === stage.key);
            const count = stageCandidates.length;
            const preview = stageCandidates.slice(0, 3);
            const Icon = stage.icon;

            return (
              <div key={stage.key}>
                {/* Connector line */}
                {stageIdx > 0 && (
                  <div className="flex justify-center py-1">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full" />
                  </div>
                )}

                {/* Stage Card */}
                <div className={`rounded-2xl border-2 ${stage.border} overflow-hidden hover:shadow-lg transition-all duration-300`}>
                  {/* Stage Header */}
                  <div className={`${stage.bg} px-5 py-4 flex items-center justify-between`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stage.gradient} flex items-center justify-center shadow-md`}>
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-base ${stage.text}`}>{stage.label}</h3>
                          <span className={`${stage.badge} text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm`}>{count}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                    {count > 0 && (
                      <Link href={`/org/jobs/${jobId}/stage/${encodeURIComponent(stage.key)}`}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${stage.text} font-bold text-xs bg-white border ${stage.border} hover:shadow-md transition`}>
                        View All ({count}) <ChevronRight size={14} />
                      </Link>
                    )}
                  </div>

                  {/* Candidate Preview */}
                  <div className="p-4 bg-white">
                    {count === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-3xl mb-2">{stage.emoji}</div>
                        <p className="text-sm text-gray-400 font-medium">No candidates in this stage</p>
                        {stage.key === "Applied" && (
                          <p className="text-xs text-gray-300 mt-1">Candidates will appear here when they apply via the job portal</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {preview.map(c => (
                          <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50/50 border border-gray-100 hover:border-blue-100 transition-all group">
                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stage.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                              {c.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {c.source && (
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.source === "AI" ? "bg-purple-100 text-purple-600" : c.source === "Portal" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                    {c.source}
                                  </span>
                                )}
                                {c.skills && c.skills.length > 0 && (
                                  <span className="text-[10px] text-gray-400 truncate">{c.skills.slice(0, 3).join(", ")}</span>
                                )}
                              </div>
                            </div>
                            {c.score > 0 && (
                              <div className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                c.score >= 70 ? "bg-green-50 text-green-700 border-green-200" :
                                c.score >= 50 ? "bg-amber-50 text-amber-700 border-amber-200" :
                                "bg-red-50 text-red-600 border-red-200"
                              }`}>
                                {Math.round(c.score)}%
                              </div>
                            )}
                          </div>
                        ))}
                        {count > 3 && (
                          <Link href={`/org/jobs/${jobId}/stage/${encodeURIComponent(stage.key)}`}
                            className="block text-center text-xs text-gray-400 hover:text-blue-600 font-medium py-2 transition">
                            +{count - 3} more → View All
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <Link href="/org/AI-screening"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-purple-200 hover:shadow-md transition-all group">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <Brain size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">AI Screening</p>
              <p className="text-xs text-gray-400">Score & rank resumes</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 ml-auto" />
          </Link>
          <Link href="/org/interviews"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-violet-200 hover:shadow-md transition-all group">
            <div className="p-2.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <UserCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Interviews</p>
              <p className="text-xs text-gray-400">Schedule & manage</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 ml-auto" />
          </Link>
          <Link href="/org/manage-candidates"
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-blue-200 hover:shadow-md transition-all group">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-md group-hover:scale-110 transition-transform">
              <Users size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Candidates</p>
              <p className="text-xs text-gray-400">Add or manage</p>
            </div>
            <ChevronRight size={14} className="text-gray-300 ml-auto" />
          </Link>
        </div>
      </div>
    </div>
  );
}
