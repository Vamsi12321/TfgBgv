"use client";

import { useEffect, useState } from "react";
import { Loader2, UserPlus, Briefcase, ShieldCheck, FileText, Download } from "lucide-react";

function generateReport(candidate, matchScore, matchedSkills, missingSkills, inferredSkills, recruiterVerdict, roleType) {
  const name = candidate.name || candidate.candidate_name || "Candidate";
  const email = candidate.email || candidate.jobSeekerEmail || "";
  const phone = candidate.phone || "";
  const education = candidate.education || {};
  const experienceYears = candidate.experienceYears || candidate.experience_years || 0;
  const seniorityLevel = candidate.seniorityLevel || candidate.seniority_level || "mid";

  const scoreItems = [
    { label: "Semantic Match", value: candidate.semanticScore || candidate.semantic_similarity_score || 0 },
    { label: "Skills Match", value: candidate.skillsScore || candidate.skills_match_score || 0 },
    { label: "Experience", value: candidate.experienceScore || candidate.experience_match_score || 0 },
    { label: "Achievements", value: candidate.achievementScore || candidate.achievement_score || 0 },
    { label: "Education", value: candidate.educationScore || candidate.education_match_score || 0 },
    { label: "Certifications", value: candidate.certificationScore || candidate.certification_match_score || 0 },
  ];

  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AI Screening Report - ${name}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', -apple-system, sans-serif; color: #1e293b; line-height: 1.6; background: #fff; }
  .page { max-width: 800px; margin: 0 auto; padding: 40px 50px; }
  
  /* Header */
  .report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #4f46e5; }
  .logo-section { flex-shrink: 0; }
  .logo-section img { max-height: 60px; width: auto; }
  .logo-text { font-size: 22px; font-weight: 800; color: #4f46e5; }
  .logo-sub { font-size: 10px; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
  .header-right { text-align: right; font-size: 11px; color: #64748b; line-height: 1.8; }
  .header-right a { color: #4f46e5; text-decoration: none; }
  
  /* Title bar */
  .title-bar { background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 20px 24px; border-radius: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
  .title-bar h1 { font-size: 18px; font-weight: 700; }
  .title-bar .subtitle { font-size: 12px; opacity: 0.8; margin-top: 2px; }
  .score-circle { width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .score-circle .num { font-size: 22px; font-weight: 800; }
  .score-circle .label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }
  
  /* Candidate info */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
  .info-item { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; }
  .info-label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #94a3b8; font-weight: 600; }
  .info-value { font-size: 13px; font-weight: 600; color: #1e293b; margin-top: 2px; }
  
  /* Sections */
  .section { margin-bottom: 22px; }
  .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; }
  
  /* Score bars */
  .score-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .score-label { width: 110px; font-size: 11px; color: #64748b; }
  .score-track { flex: 1; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .score-fill { height: 100%; border-radius: 4px; }
  .score-fill-high { background: linear-gradient(90deg, #10b981, #059669); }
  .score-fill-mid { background: linear-gradient(90deg, #3b82f6, #4f46e5); }
  .score-fill-low { background: linear-gradient(90deg, #f59e0b, #d97706); }
  .score-val { width: 36px; font-size: 11px; font-weight: 700; text-align: right; color: #1e293b; }
  
  /* Pills */
  .pills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .pill { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 10px; font-weight: 600; }
  .pill-green { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .pill-red { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .pill-purple { background: #f5f3ff; color: #7c3aed; border: 1px solid #ddd6fe; }
  
  /* Cards */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .card { border-radius: 10px; padding: 14px; }
  .card-green { background: #ecfdf5; border: 1px solid #a7f3d0; }
  .card-red { background: #fef2f2; border: 1px solid #fecaca; }
  .card-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
  .card-green .card-title { color: #059669; }
  .card-red .card-title { color: #dc2626; }
  .card-item { font-size: 11px; color: #374151; margin-bottom: 6px; padding-left: 14px; position: relative; line-height: 1.5; }
  .card-item::before { content: ''; position: absolute; left: 0; top: 6px; width: 6px; height: 6px; border-radius: 50%; }
  .card-green .card-item::before { background: #10b981; }
  .card-red .card-item::before { background: #ef4444; }
  
  /* Summary box */
  .summary-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; font-size: 13px; color: #374151; line-height: 1.7; }
  .highlight-box { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #3730a3; line-height: 1.6; }
  .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; font-size: 12px; color: #92400e; line-height: 1.6; }
  
  /* Footer */
  .report-footer { margin-top: 30px; padding-top: 16px; border-top: 2px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #94a3b8; }
  .footer-badge { background: #4f46e5; color: white; padding: 4px 12px; border-radius: 12px; font-size: 9px; font-weight: 600; letter-spacing: 0.5px; }
  
  @media print { 
    body { padding: 0; } 
    .page { padding: 30px; }
    .title-bar, .card-green, .card-red, .score-fill, .footer-badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style></head><body>
<div class="page">
  <!-- Header -->
  <div class="report-header">
    <div class="logo-section">
      <div class="logo-text">TFG HireShield</div>
      <div class="logo-sub">AI-Powered Screening Report</div>
    </div>
    <div class="header-right">
      <div>📞 8886099008</div>
      <div>✉ naresh@tfgorg.com</div>
      <div>🌐 <a href="https://www.tfgorg.com">www.tfgorg.com</a></div>
      <div>Generated: ${date}</div>
    </div>
  </div>

  <!-- Title Bar -->
  <div class="title-bar">
    <div>
      <h1>${name}</h1>
      <div class="subtitle">${email}${phone ? ' • ' + phone : ''} • ${seniorityLevel} level • ${experienceYears} yrs exp</div>
    </div>
    <div class="score-circle">
      <div class="num">${Math.round(matchScore)}%</div>
      <div class="label">Match</div>
    </div>
  </div>

  <!-- Candidate Info -->
  <div class="info-grid">
    <div class="info-item"><div class="info-label">Education</div><div class="info-value">${education.degree || 'N/A'}</div></div>
    <div class="info-item"><div class="info-label">University</div><div class="info-value">${education.university || 'N/A'}</div></div>
    <div class="info-item"><div class="info-label">Role Type</div><div class="info-value">${(roleType || 'N/A').replace('_', ' ')}</div></div>
    <div class="info-item"><div class="info-label">Verdict</div><div class="info-value">${(recruiterVerdict || 'N/A').replace('_', ' ').toUpperCase()}</div></div>
  </div>

  <!-- Summary -->
  <div class="section">
    <div class="section-title">AI Summary</div>
    <div class="summary-box">${candidate.summary || 'No summary available'}</div>
  </div>

  <!-- Score Breakdown -->
  <div class="section">
    <div class="section-title">Score Breakdown (7-Factor Analysis)</div>
    ${scoreItems.map(s => {
      const pct = s.value > 1 ? Math.round(s.value) : Math.round(s.value * 100);
      const cls = pct >= 70 ? 'score-fill-high' : pct >= 40 ? 'score-fill-mid' : 'score-fill-low';
      return `<div class="score-row"><span class="score-label">${s.label}</span><div class="score-track"><div class="score-fill ${cls}" style="width:${pct}%"></div></div><span class="score-val">${pct}%</span></div>`;
    }).join('')}
  </div>

  <!-- Skills -->
  <div class="section">
    <div class="section-title">Skills Analysis</div>
    <div style="margin-bottom:10px;"><span style="font-size:10px;color:#64748b;font-weight:600;">MATCHED SKILLS (${matchedSkills.length})</span>
    <div class="pills">${matchedSkills.length > 0 ? matchedSkills.map(s => `<span class="pill pill-green">${s}</span>`).join('') : '<span style="color:#94a3b8;font-size:11px;">None detected</span>'}</div></div>
    <div style="margin-bottom:10px;"><span style="font-size:10px;color:#64748b;font-weight:600;">MISSING SKILLS (${missingSkills.length})</span>
    <div class="pills">${missingSkills.length > 0 ? missingSkills.map(s => `<span class="pill pill-red">${s}</span>`).join('') : '<span style="color:#94a3b8;font-size:11px;">None</span>'}</div></div>
    ${inferredSkills.length > 0 ? `<div><span style="font-size:10px;color:#64748b;font-weight:600;">INFERRED DOMAIN EXPERTISE (${inferredSkills.length})</span><div class="pills">${inferredSkills.map(s => `<span class="pill pill-purple">${s}</span>`).join('')}</div></div>` : ''}
  </div>

  <!-- Strengths & Weaknesses -->
  <div class="two-col">
    <div class="card card-green">
      <div class="card-title">Strengths</div>
      ${(candidate.strengths || []).map(s => `<div class="card-item">${s}</div>`).join('') || '<div style="color:#94a3b8;font-size:11px;">None listed</div>'}
    </div>
    <div class="card card-red">
      <div class="card-title">Weaknesses</div>
      ${(candidate.weaknesses || []).map(w => `<div class="card-item">${w}</div>`).join('') || '<div style="color:#94a3b8;font-size:11px;">None listed</div>'}
    </div>
  </div>

  ${(candidate.whyTopRanked || candidate.why_top_ranked) ? `<div class="section" style="margin-top:16px;"><div class="section-title">Why This Candidate</div><div class="highlight-box">${candidate.whyTopRanked || candidate.why_top_ranked}</div></div>` : ''}
  ${(candidate.improvementSuggestion || candidate.improvement_suggestion) ? `<div class="section"><div class="section-title">Improvement Suggestion</div><div class="warning-box">💡 ${candidate.improvementSuggestion || candidate.improvement_suggestion}</div></div>` : ''}

  <!-- Footer -->
  <div class="report-footer">
    <div>This report was generated by TFG HireShield AI Screening Engine</div>
    <div class="footer-badge">CONFIDENTIAL</div>
  </div>
</div>
</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank");
  if (win) { setTimeout(() => { win.print(); }, 500); }
  URL.revokeObjectURL(url);
}

export default function CandidateModal({ candidate, requiredSkills, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const getScoreBarColor = (score) => {
    if (score >= 0.8) return "bg-green-500";
    if (score >= 0.6) return "bg-amber-500";
    return "bg-red-500";
  };

  const getVerdictStyle = (verdict) => {
    if (verdict === "shortlist") return "bg-green-100 text-green-800 border-green-300";
    if (verdict === "maybe") return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const scoreBreakdown = [
    { label: "Semantic Similarity", value: candidate.semantic_similarity_score || candidate.semanticScore, weight: "30%" },
    { label: "Skills Match (Role-Aware)", value: candidate.skills_match_score || candidate.skillsScore, weight: "25%" },
    { label: "Experience Match", value: candidate.experience_match_score || candidate.experienceScore, weight: "18%" },
    { label: "Project Relevance", value: candidate.project_match_score || candidate.projectScore, weight: "12%" },
    { label: "Achievements/Impact", value: candidate.achievement_score || candidate.achievementScore || 0, weight: "5%" },
    { label: "Education Match", value: candidate.education_match_score || candidate.educationScore, weight: "5%" },
    { label: "Certifications", value: candidate.certification_match_score || candidate.certificationScore, weight: "5%" },
  ];

  const matchScore = candidate.match_score || candidate.matchScore || candidate.finalScore || 0;
  const candidateName = candidate.candidate_name || candidate.name || candidate.jobSeekerName || "Unknown";
  const seniorityLevel = candidate.seniority_level || candidate.seniorityLevel || "mid";
  const experienceYears = candidate.experience_years || candidate.experienceYears || 0;
  const matchedSkills = candidate.matched_skills || candidate.matchedSkills || [];
  const missingSkills = candidate.missing_skills || candidate.missingSkills || [];
  const inferredSkills = candidate.inferred_skills || candidate.inferredSkills || [];
  const recruiterVerdict = candidate.recruiter_verdict || candidate.recruiterVerdict || candidate.recommendation || "";
  const roleType = candidate.role_type || candidate.roleType || "";
  const whyTopRanked = candidate.why_top_ranked || candidate.whyTopRanked || "";
  const relativeStrengths = candidate.relative_strengths || candidate.relativeStrengths || [];
  const fraudFlags = candidate.fraud_flags || candidate.fraudFlags || [];
  const isSuspicious = candidate.is_suspicious || candidate.isSuspicious || false;
  const hasRecentExperience = candidate.has_recent_experience || candidate.hasRecentExperience || false;
  const hasQuantifiedImpact = candidate.has_quantified_impact || candidate.hasQuantifiedImpact || false;
  const improvementSuggestion = candidate.improvement_suggestion || candidate.improvementSuggestion || "";
  const candidateEmail = candidate.email || candidate.jobSeekerEmail || "";
  const candidatePhone = candidate.phone || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 rounded-t-2xl flex items-center justify-between z-10">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-sm font-bold">
                #{candidate.rank}
              </span>
              <h3 className="text-xl font-bold text-gray-900">{candidateName}</h3>
              {recruiterVerdict && (
                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getVerdictStyle(recruiterVerdict)}`}>
                  {recruiterVerdict === "shortlist" ? "✓ Shortlist" : recruiterVerdict === "maybe" ? "~ Maybe" : "✗ Pass"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {candidateEmail && <span>{candidateEmail}</span>}
              {candidatePhone && <span>&middot; {candidatePhone}</span>}
              {roleType && (
                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                  {roleType.replace("_", " ")}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => generateReport(candidate, matchScore, matchedSkills, missingSkills, inferredSkills, recruiterVerdict, roleType)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition"
            >
              <FileText className="w-3.5 h-3.5" /> Report
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Overall Score */}
          <div className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Overall ATS Score</p>
            <p className="text-5xl font-bold text-indigo-600">{Math.round(matchScore)}%</p>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
              <span>{seniorityLevel} &middot; {experienceYears} years</span>
              {hasQuantifiedImpact && (
                <span className="flex items-center gap-1 text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                  Quantified Impact
                </span>
              )}
            </div>
            {/* Percentile + Recency + Fraud badges */}
            <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
              {candidate.percentile !== undefined && (
                <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                  Top {100 - candidate.percentile}% of candidates
                </span>
              )}
              {hasRecentExperience && (
                <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                  Currently Active
                </span>
              )}
              {isSuspicious && (
                <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                  ⚠ Suspicious Signals
                </span>
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Score Breakdown</h4>
            <div className="space-y-3">
              {scoreBreakdown.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-44">{item.label}</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getScoreBarColor(item.value)}`}
                      style={{ width: `${(item.value || 0) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12 text-right">
                    {((item.value || 0) * 100).toFixed(0)}%
                  </span>
                  <span className="text-xs text-gray-400 w-8">({item.weight})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Matched Skills ({matchedSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {matchedSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                    {skill}
                  </span>
                ))}
                {matchedSkills.length === 0 && (
                  <span className="text-sm text-gray-400">None detected</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Missing Skills ({missingSkills.length})
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {missingSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200">
                    {skill}
                  </span>
                ))}
                {missingSkills.length === 0 && (
                  <span className="text-sm text-gray-400">None</span>
                )}
              </div>
            </div>
          </div>

          {/* Inferred Skills */}
          {inferredSkills.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Inferred Domain Expertise
                <span className="text-xs text-gray-400 font-normal">(from skill graph)</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {inferredSkills.map((skill, i) => (
                  <span key={i} className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* All Skills */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">All Candidate Skills ({(candidate.skills || []).length})</h4>
            <div className="flex flex-wrap gap-1.5">
              {(candidate.skills || []).map((skill, i) => {
                const isMatched = matchedSkills.includes(skill);
                return (
                  <span
                    key={i}
                    className={`px-2.5 py-1 text-xs rounded-full border ${
                      isMatched
                        ? "bg-green-50 text-green-700 border-green-200"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {skill}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid sm:grid-cols-2 gap-4">
            {candidate.strengths && candidate.strengths.length > 0 && (
              <div className="bg-green-50 rounded-xl p-4">
                <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
                <ul className="space-y-1.5">
                  {candidate.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {candidate.weaknesses && candidate.weaknesses.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4">
                <h4 className="font-semibold text-red-800 mb-2">Weaknesses</h4>
                <ul className="space-y-1.5">
                  {candidate.weaknesses.map((w, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Why Top Ranked */}
          {whyTopRanked && (
            <div className="bg-indigo-50 rounded-xl p-4">
              <h4 className="font-semibold text-indigo-800 mb-1">Why This Candidate Ranked Highly</h4>
              <p className="text-sm text-indigo-700">{whyTopRanked}</p>
            </div>
          )}

          {/* Relative Strengths */}
          {relativeStrengths.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Stands Out In</h4>
              <div className="flex flex-wrap gap-2">
                {relativeStrengths.map((s, i) => (
                  <span key={i} className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                    ★ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Fraud Flags */}
          {fraudFlags.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4 border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2">⚠ Suspicious Signals</h4>
              <ul className="space-y-1">
                {fraudFlags.map((flag, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Improvement Suggestion */}
          {improvementSuggestion && (
            <div className="bg-amber-50 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-1">💡 Improvement Suggestion</h4>
              <p className="text-sm text-amber-700">{improvementSuggestion}</p>
            </div>
          )}

          {/* Education & Certifications */}
          <div className="grid sm:grid-cols-2 gap-4">
            {candidate.education && (candidate.education.degree || candidate.education.undergrad_degree) && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                <div className="space-y-2">
                  {candidate.education.degree && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm font-medium text-gray-800">{candidate.education.degree}</p>
                      {candidate.education.university && (
                        <p className="text-sm text-gray-600">{candidate.education.university}</p>
                      )}
                      {candidate.education.graduation_year && (
                        <p className="text-xs text-gray-500">Class of {candidate.education.graduation_year}</p>
                      )}
                    </div>
                  )}
                  {candidate.education.undergrad_degree && candidate.education.undergrad_degree !== candidate.education.degree && (
                    <div className="bg-gray-50 rounded-lg p-3 border-l-2 border-gray-300">
                      <p className="text-sm text-gray-700">{candidate.education.undergrad_degree}</p>
                      {candidate.education.undergrad_university && (
                        <p className="text-sm text-gray-500">{candidate.education.undergrad_university}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            {candidate.certifications && candidate.certifications.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Certifications</h4>
                <ul className="space-y-1">
                  {candidate.certifications.map((cert, i) => (
                    <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Projects */}
          {candidate.projects && candidate.projects.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Projects</h4>
              <ul className="space-y-2">
                {candidate.projects.map((proj, i) => (
                  <li key={i} className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">
                    {proj}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Pipeline / BGV */}
          <AddFromScreening candidate={candidate} matchScore={matchScore} matchedSkills={matchedSkills} missingSkills={missingSkills} roleType={roleType} recruiterVerdict={recruiterVerdict} />
        </div>
      </div>
    </div>
  );
}

/* ─── Add From Screening Component ─── */
function AddFromScreening({ candidate, matchScore, matchedSkills, missingSkills, roleType, recruiterVerdict }) {
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [addAs, setAddAs] = useState("jobseeker");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Editable fields
  const [name, setName] = useState(candidate.name || candidate.candidate_name || "");
  const [email, setEmail] = useState(candidate.email || candidate.jobSeekerEmail || "");
  const [phone, setPhone] = useState(candidate.phone || "");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch("/api/proxy/secure/getJobs", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.jobs || (Array.isArray(data) ? data : []);
          setJobs(list.filter(j => j && (j._id || j.id)));
        }
      } catch {} finally { setLoadingJobs(false); }
    };
    fetchJobs();
  }, []);

  const handleAdd = async () => {
    if (!selectedJobId) { setError("Please select a job"); return; }
    if (!name.trim()) { setError("Name is required"); return; }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const body = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resumeUrl: candidate.resumeUrl || candidate.metadata?.resumeUrl || "",
        resumeFilename: candidate.resumeFilename || candidate.metadata?.resumeFilename || "",
        jobId: selectedJobId,
        addAs,
        matchScore: Math.round(matchScore * 10) / 10,
        semanticScore: candidate.semanticScore || candidate.semantic_similarity_score || 0,
        skillsScore: candidate.skillsScore || candidate.skills_match_score || 0,
        experienceScore: candidate.experienceScore || candidate.experience_match_score || 0,
        achievementScore: candidate.achievementScore || candidate.achievement_score || 0,
        educationScore: candidate.educationScore || candidate.education_match_score || 0,
        certificationScore: candidate.certificationScore || candidate.certification_match_score || 0,
        recommendation: recruiterVerdict || candidate.recommendation || "",
        strengths: candidate.strengths || [],
        weaknesses: candidate.weaknesses || [],
        summary: candidate.summary || "",
        matchedSkills: matchedSkills || [],
        missingSkills: missingSkills || [],
        roleType: roleType || "",
      };

      const res = await fetch("/api/proxy/secure/addFromScreening", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message || `Successfully added as ${addAs}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.detail === "string" ? data.detail : Array.isArray(data.detail) ? data.detail[0]?.msg || "Failed" : "Failed to add candidate");
      }
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-blue-600" /> Add to System
      </h4>

      {success ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-sm text-emerald-700 font-medium">
          ✓ {success}
        </div>
      ) : (
        <div className="space-y-3">
          {/* Editable candidate info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" placeholder="Full name" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white" placeholder="9876543210" />
            </div>
          </div>

          {/* Resume info */}
          <div className="flex items-center gap-2 text-[10px] text-gray-400">
            {(candidate.resumeUrl || candidate.metadata?.resumeUrl) ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">✓ Resume available from screening</span>
            ) : (
              <span className="text-amber-600 font-medium">⚠ No resume URL — candidate may need to upload later</span>
            )}
          </div>

          {/* Job selector */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-0.5 block">Select Job *</label>
            {loadingJobs ? (
              <div className="flex items-center gap-2 text-xs text-gray-400"><Loader2 className="w-3 h-3 animate-spin" /> Loading...</div>
            ) : (
              <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-2.5 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white">
                <option value="">Choose a job...</option>
                {jobs.map(j => (
                  <option key={j._id || j.id} value={j._id || j.id}>
                    {j.title || j.jobTitle || "Untitled"} {j.department ? `• ${j.department}` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Add as toggle */}
          <div>
            <label className="text-[10px] font-semibold text-gray-500 mb-1.5 block">Add as</label>
            <div className="flex gap-2">
              <button onClick={() => setAddAs("jobseeker")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition ${
                  addAs === "jobseeker" ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
                }`}>
                <Briefcase className="w-3.5 h-3.5" /> Job Seeker
              </button>
              <button onClick={() => setAddAs("candidate")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition ${
                  addAs === "candidate" ? "bg-indigo-600 text-white border-indigo-600 shadow" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                }`}>
                <ShieldCheck className="w-3.5 h-3.5" /> BGV Candidate
              </button>
            </div>
            <p className="text-[9px] text-gray-400 mt-1">
              {addAs === "jobseeker" ? "Adds to hiring pipeline — creates job seeker + application for selected job" : "Adds to BGV process — creates candidate for background verification"}
            </p>
          </div>

          {error && <p className="text-[11px] text-red-600 font-medium bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <button onClick={handleAdd} disabled={loading || !selectedJobId || !name.trim()}
            className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-lg shadow hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Adding...</> : <><UserPlus className="w-3.5 h-3.5" /> Confirm & Add</>}
          </button>
        </div>
      )}
    </div>
  );
}
