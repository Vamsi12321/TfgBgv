"use client";

import { Mail, Clock, GraduationCap, CheckCircle2, Star, ChevronRight, Sparkles, FileText } from "lucide-react";

export default function CandidateCard({ candidate, onClick }) {
  const score = candidate.match_score || candidate.matchScore || candidate.finalScore || 0;
  const matchedSkills = candidate.matched_skills || candidate.matchedSkills || [];
  const missingSkills = candidate.missing_skills || candidate.missingSkills || [];
  const education = candidate.education || {};
  const name = candidate.candidate_name || candidate.name || candidate.jobSeekerName || "Unknown";

  const getScoreStyle = (s) => {
    if (s >= 70) return { gradient: "from-emerald-500 to-green-600", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Strong Fit", labelBg: "bg-emerald-100 text-emerald-700" };
    if (s >= 50) return { gradient: "from-blue-500 to-indigo-600", text: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", label: "Good Fit", labelBg: "bg-blue-100 text-blue-700" };
    if (s >= 35) return { gradient: "from-amber-500 to-orange-600", text: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", label: "Moderate", labelBg: "bg-amber-100 text-amber-700" };
    return { gradient: "from-red-500 to-rose-600", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Weak Fit", labelBg: "bg-red-100 text-red-700" };
  };

  const style = getScoreStyle(score);

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-200/50";
    if (rank === 2) return "bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200/50";
    if (rank === 3) return "bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-orange-200/50";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div onClick={onClick}
      className={`bg-white rounded-2xl border ${score >= 70 ? "border-emerald-100" : "border-gray-100"} shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 cursor-pointer overflow-hidden group`}>
      
      {/* Top colored accent line */}
      <div className={`h-0.5 bg-gradient-to-r ${style.gradient}`} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${getRankStyle(candidate.rank)}`}>
            {candidate.rank}
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Name row */}
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-bold text-gray-900 truncate">{name}</h4>
              <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded font-semibold uppercase">
                {candidate.seniority_level || candidate.seniorityLevel || "mid"}
              </span>
              {(candidate.recruiter_verdict || candidate.recruiterVerdict) === "shortlist" && (
                <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Shortlist
                </span>
              )}
              {((candidate.recruiter_verdict || candidate.recruiterVerdict) === "pass" || (candidate.recommendation) === "pass") && (
                <span className="text-[9px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200 font-bold">
                  ✗ Pass
                </span>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 mb-2.5">
              {(candidate.email || candidate.jobSeekerEmail) && (
                <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{candidate.email || candidate.jobSeekerEmail}</span>
              )}
              {(candidate.experience_years || candidate.experienceYears || 0) > 0 && (
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{candidate.experience_years || candidate.experienceYears} yrs</span>
              )}
              {education.degree && (
                <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{education.degree}{education.institution || education.university ? ` • ${education.institution || education.university}` : ""}</span>
              )}
            </div>

            {/* Skills row */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {matchedSkills.slice(0, 5).map((skill, i) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] rounded-md border border-emerald-100 font-semibold">
                  {skill}
                </span>
              ))}
              {matchedSkills.length > 5 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-[9px] rounded-md font-semibold">
                  +{matchedSkills.length - 5} more
                </span>
              )}
              {missingSkills.length > 0 && (
                <span className="px-2 py-0.5 bg-red-50 text-red-500 text-[9px] rounded-md border border-red-100 font-semibold">
                  {missingSkills.length} missing
                </span>
              )}
            </div>

            {/* Summary */}
            {candidate.summary && (
              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-1 group-hover:text-gray-500 transition">
                {candidate.summary}
              </p>
            )}
          </div>

          {/* Score section */}
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            {/* Score circle */}
            <div className="relative w-14 h-14">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke="url(#grad)" strokeWidth="3"
                  strokeDasharray={`${(score / 100) * 94.2} 94.2`} strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={score >= 70 ? "#10b981" : score >= 50 ? "#3b82f6" : score >= 35 ? "#f59e0b" : "#ef4444"} />
                    <stop offset="100%" stopColor={score >= 70 ? "#059669" : score >= 50 ? "#4f46e5" : score >= 35 ? "#ea580c" : "#dc2626"} />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-sm font-black ${style.text}`}>{score}%</span>
              </div>
            </div>
            {/* Fit label */}
            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${style.labelBg}`}>
              {style.label}
            </span>
          </div>
        </div>

        {/* Bottom action hint */}
        <div className="flex items-center justify-end mt-2 pt-2 border-t border-gray-50">
          <span className="text-[9px] text-gray-300 group-hover:text-blue-500 transition flex items-center gap-0.5 font-medium">
            View detailed analysis <ChevronRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </div>
  );
}
