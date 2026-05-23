"use client";

import { useState, useMemo } from "react";
import { Download, Users, Trophy, TrendingUp, BarChart3, Tag, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import CandidateCard from "./CandidateCard";
import CandidateModal from "./CandidateModal";
import FilterControls from "./FilterControls";

// Generate PDF report for a single candidate (TFG branded like verification reports)
async function generateCandidatePDF(candidate, jobTitle, requiredSkills, setDownloadingId) {
  const name = candidate.name || candidate.candidate_name || candidate.jobSeekerName || "Candidate";
  const email = candidate.email || candidate.jobSeekerEmail || "";
  const phone = candidate.phone || "";
  const matchScore = candidate.match_score || candidate.matchScore || candidate.finalScore || 0;
  const recruiterVerdict = candidate.recruiter_verdict || candidate.recruiterVerdict || candidate.recommendation || "";
  const seniorityLevel = candidate.seniority_level || candidate.seniorityLevel || "mid";
  const experienceYears = candidate.experience_years || candidate.experienceYears || 0;
  const matchedSkills = candidate.matched_skills || candidate.matchedSkills || [];
  const missingSkills = candidate.missing_skills || candidate.missingSkills || [];
  const roleType = candidate.role_type || candidate.roleType || "";
  const education = candidate.education || {};
  const strengths = candidate.strengths || [];
  const weaknesses = candidate.weaknesses || [];
  const timestamp = new Date().toLocaleString();

  const statusColor = matchScore >= 70 ? "#22c55e" : matchScore >= 50 ? "#f59e0b" : "#ef4444";
  const statusText = recruiterVerdict === "shortlist" ? "✓ Shortlisted" : recruiterVerdict === "maybe" ? "~ Maybe" : recruiterVerdict === "reject" ? "✗ Rejected" : `${Math.round(matchScore)}% Match`;

  // Build strengths (just green colored text, no bullet/bar)
  const strengthsHtml = strengths.length > 0 ? `<div style="margin-bottom: 18px;">
    <p style="font-size: 13px; font-weight: bold; color: #059669; margin-bottom: 8px;">Strengths:</p>
    ${strengths.map(s => `<p style="font-size: 12px; color: #166534; margin: 0 0 6px 0; line-height: 1.5;">${s}</p>`).join("")}
  </div>` : "";

  // Build weaknesses (just red colored text, no bullet/bar)
  const weaknessesHtml = weaknesses.length > 0 ? `<div style="margin-bottom: 18px;">
    <p style="font-size: 13px; font-weight: bold; color: #dc2626; margin-bottom: 8px;">Weaknesses:</p>
    ${weaknesses.map(w => `<p style="font-size: 12px; color: #991b1b; margin: 0 0 6px 0; line-height: 1.5;">${w}</p>`).join("")}
  </div>` : "";

  const certDiv = document.createElement("div");
  certDiv.style.position = "absolute";
  certDiv.style.left = "-9999px";
  certDiv.style.top = "0";
  document.body.appendChild(certDiv);

  certDiv.innerHTML = `<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">
    <img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />
    <div style="position: relative; z-index: 2; min-height: 1000px; display: flex; flex-direction: column;">
      <!-- Header -->
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 25px;">
        <div style="flex-shrink: 0; margin-top: 5px;">
          <img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 150px; max-width: 380px; height: auto; width: auto; display: block; object-fit: contain;" />
        </div>
        <div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 11px; color: #333; line-height: 1.8;">
          <h2 style="font-size: 20px; font-weight: bold; margin: 0 0 5px 0;">AI Screening Report</h2>
          <p style="margin: 0; font-size: 11px; color: #555;">${timestamp}</p>
        </div>
      </div>

      <!-- Candidate Info -->
      <div style="margin-bottom: 20px;">
        <p style="margin: 6px 0; font-size: 13px;"><strong>Candidate Name:</strong> ${name}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Email:</strong> ${email || "N/A"}</p>
        ${phone ? `<p style="margin: 6px 0; font-size: 13px;"><strong>Phone:</strong> ${phone}</p>` : ""}
        <p style="margin: 6px 0; font-size: 13px;"><strong>Job Title:</strong> ${jobTitle || "N/A"}</p>
        <p style="margin: 6px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></p>
      </div>

      <hr style="border: none; border-top: 2px solid #000; margin: 20px 0;" />

      <!-- Score Progress Bar -->
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 80px; height: 30px; background: ${statusColor}; border-radius: 4px;"></div>
          <div style="flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
            <div style="height: 100%; width: ${Math.round(matchScore)}%; background: ${statusColor}; border-radius: 3px;"></div>
          </div>
        </div>
      </div>

      <!-- AI Summary (FIRST) -->
      ${candidate.summary ? `<div style="margin-bottom: 20px; padding: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <p style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 6px;">AI Summary:</p>
        <p style="font-size: 12px; color: #374151; line-height: 1.7;">${candidate.summary}</p>
      </div>` : ""}

      <!-- Strengths (green lines) -->
      ${strengthsHtml}

      <!-- Weaknesses (red lines) -->
      ${weaknessesHtml}

      <!-- Key Details -->
      <div style="margin-bottom: 18px;">
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>overall_score:</strong> ${Math.round(matchScore)}%</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>seniority_level:</strong> ${seniorityLevel}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>experience_years:</strong> ${experienceYears}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>role_type:</strong> ${roleType || "N/A"}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>education:</strong> ${education.degree || "N/A"}${education.university ? " - " + education.university : ""}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>recruiter_verdict:</strong> ${recruiterVerdict || "N/A"}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>matched_skills:</strong> ${matchedSkills.length > 0 ? matchedSkills.join(", ") : "None"}</p>
        <p style="margin: 7px 0; font-size: 12px;">✓ <strong>missing_skills:</strong> ${missingSkills.length > 0 ? missingSkills.join(", ") : "None"}</p>
      </div>

      <!-- Footer -->
      <div style="margin-top: auto; padding-top: 15px; border-top: 2px solid #272626; font-size: 11px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">
        <p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>
      </div>
    </div>
  </div>`;

  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const canvas = await safeHtml2Canvas(certDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [canvas.width * 0.75, canvas.height * 0.75],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
    pdf.save(`AI_Screening_Report_${name.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  } finally {
    document.body.removeChild(certDiv);
    if (setDownloadingId) setDownloadingId(null);
  }
}

// Generate a combined PDF report for all candidates
async function generateAllCandidatesPDF(results, setDownloadingAll) {
  const allResults = results.results || [];
  const jobTitle = results.job_title || results.jobTitle || "Job";
  const timestamp = new Date().toLocaleString();

  // Build index page
  const indexDiv = document.createElement("div");
  indexDiv.style.position = "absolute";
  indexDiv.style.left = "-9999px";
  indexDiv.style.top = "0";
  document.body.appendChild(indexDiv);

  const tableRows = allResults.map((c, index) => {
    const name = c.name || c.candidate_name || c.jobSeekerName || "Unknown";
    const score = Math.round(c.match_score || c.matchScore || c.finalScore || 0);
    const verdict = c.recruiter_verdict || c.recruiterVerdict || c.recommendation || "N/A";
    const statusColor = score >= 70 ? "#22c55e" : score >= 50 ? "#f59e0b" : "#ef4444";
    return `<tr style="background: ${index % 2 === 0 ? "#ffffff" : "#f9f9f9"};">
      <td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">${c.rank || index + 1}</td>
      <td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">${name}</td>
      <td style="padding: 10px 12px; font-size: 12px; font-weight: bold; color: ${statusColor}; border-bottom: 1px solid #e0e0e0; border-right: 1px solid #e0e0e0;">${score}%</td>
      <td style="padding: 10px 12px; font-size: 12px; color: #000; border-bottom: 1px solid #e0e0e0;">${verdict}</td>
    </tr>`;
  }).join("");

  indexDiv.innerHTML = `<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">
    <img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />
    <div style="position: relative; z-index: 2; min-height: 1000px; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px;">
        <div style="flex-shrink: 0; margin-top: 5px;"><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 150px; max-width: 380px; height: auto; width: auto; display: block; object-fit: contain;" /></div>
        <div style="display: flex; flex-direction: column; justify-content: flex-start; margin-top: 45px; flex: 1; padding: 0 20px;">
          <h1 style="font-size: 22px; font-weight: bold; color: #000; margin: 0 0 6px 0;">AI Screening Summary Report</h1>
          <p style="font-size: 12px; color: #555; margin: 0;">Comprehensive ATS Analysis</p>
        </div>
        <div style="flex-shrink: 0; margin-top: 5px; text-align: right; font-size: 11px; color: #333; line-height: 1.8;">
          <p style="margin: 0 0 4px 0; font-weight: bold;">📞 8886099008</p>
          <p style="margin: 0 0 4px 0;">✉ naresh@tfgorg.com</p>
          <p style="margin: 0;">🌐 <a href="https://www.tfgorg.com" style="color: #0066cc;">www.tfgorg.com</a></p>
        </div>
      </div>

      <div style="background: #f8f9fa; border: 2px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: bold; color: #000; margin: 0 0 12px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Job Details</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: bold; width: 150px;">Job Title:</td><td style="padding: 6px 0; font-size: 13px; color: #000;">${jobTitle}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: bold;">Total Candidates:</td><td style="padding: 6px 0; font-size: 13px; color: #000;">${allResults.length}</td></tr>
          <tr><td style="padding: 6px 0; font-size: 13px; color: #333; font-weight: bold;">Generated On:</td><td style="padding: 6px 0; font-size: 13px; color: #000;">${timestamp}</td></tr>
        </table>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 15px; font-weight: bold; color: #000; margin: 0 0 12px 0; border-bottom: 2px solid #ddd; padding-bottom: 8px;">Candidate Rankings</h2>
        <table style="width: 100%; border-collapse: collapse; border: 2px solid #e0e0e0;">
          <thead><tr style="background: #f0f0f0;">
            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">Rank</th>
            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">Candidate</th>
            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd; border-right: 1px solid #ddd;">Score</th>
            <th style="padding: 10px; text-align: left; font-size: 12px; font-weight: bold; border-bottom: 2px solid #ddd;">Verdict</th>
          </tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>

      <div style="margin-top: auto; padding-top: 15px; border-top: 2px solid #272626; font-size: 11px; color: #dc3545; text-align: center; font-weight: 600; line-height: 1.4;">
        <p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>
      </div>
    </div>
  </div>`;

  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const canvas = await safeHtml2Canvas(indexDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: [canvas.width * 0.75, canvas.height * 0.75],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width * 0.75, canvas.height * 0.75);
    document.body.removeChild(indexDiv);

    // Generate individual pages for each candidate
    for (const c of allResults) {
      const name = c.name || c.candidate_name || c.jobSeekerName || "Candidate";
      const email = c.email || c.jobSeekerEmail || "";
      const matchScore = c.match_score || c.matchScore || c.finalScore || 0;
      const verdict = c.recruiter_verdict || c.recruiterVerdict || c.recommendation || "";
      const seniority = c.seniority_level || c.seniorityLevel || "mid";
      const exp = c.experience_years || c.experienceYears || 0;
      const matched = c.matched_skills || c.matchedSkills || [];
      const missing = c.missing_skills || c.missingSkills || [];
      const role = c.role_type || c.roleType || "";
      const edu = c.education || {};
      const cStrengths = c.strengths || [];
      const cWeaknesses = c.weaknesses || [];
      const scoreColor = matchScore >= 70 ? "#22c55e" : matchScore >= 50 ? "#f59e0b" : "#ef4444";

      // Build strengths/weaknesses HTML for this candidate
      const cStrengthsHtml = cStrengths.length > 0 ? `<div style="margin-bottom: 14px;">
        <p style="font-size: 12px; font-weight: bold; color: #059669; margin-bottom: 6px;">Strengths:</p>
        ${cStrengths.map(s => `<p style="font-size: 11px; color: #166534; margin: 0 0 5px 0; line-height: 1.4;">${s}</p>`).join("")}
      </div>` : "";

      const cWeaknessesHtml = cWeaknesses.length > 0 ? `<div style="margin-bottom: 14px;">
        <p style="font-size: 12px; font-weight: bold; color: #dc2626; margin-bottom: 6px;">Weaknesses:</p>
        ${cWeaknesses.map(w => `<p style="font-size: 11px; color: #991b1b; margin: 0 0 5px 0; line-height: 1.4;">${w}</p>`).join("")}
      </div>` : "";

      const pageDiv = document.createElement("div");
      pageDiv.style.position = "absolute";
      pageDiv.style.left = "-9999px";
      pageDiv.style.top = "0";
      document.body.appendChild(pageDiv);

      pageDiv.innerHTML = `<div style="width: 860px; min-height: 1120px; padding: 40px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; color: #000; position: relative; overflow: hidden;">
        <img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; pointer-events: none; z-index: 1;" />
        <div style="position: relative; z-index: 2; min-height: 1000px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div><img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 120px; max-width: 300px; height: auto; width: auto; display: block; object-fit: contain;" /></div>
            <div style="text-align: right; font-size: 11px; color: #333; line-height: 1.8;">
              <h2 style="font-size: 18px; font-weight: bold; margin: 0 0 5px 0;">AI Screening Report</h2>
              <p style="margin: 0; font-size: 11px; color: #555;">${timestamp}</p>
            </div>
          </div>

          <div style="margin-bottom: 15px;">
            <p style="margin: 5px 0; font-size: 13px;"><strong>Candidate Name:</strong> ${name}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Email:</strong> ${email || "N/A"}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Job Title:</strong> ${jobTitle}</p>
            <p style="margin: 5px 0; font-size: 13px;"><strong>Status:</strong> <span style="color: ${scoreColor}; font-weight: bold;">${Math.round(matchScore)}% Match</span></p>
          </div>

          <hr style="border: none; border-top: 2px solid #000; margin: 15px 0;" />

          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 15px;">
            <div style="width: 70px; height: 25px; background: ${scoreColor}; border-radius: 4px;"></div>
            <div style="flex: 1; height: 5px; background: #e5e7eb; border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; width: ${Math.round(matchScore)}%; background: ${scoreColor}; border-radius: 3px;"></div>
            </div>
          </div>

          <!-- AI Summary first -->
          ${c.summary ? `<div style="margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px;">
            <p style="font-size: 11px; font-weight: bold; margin-bottom: 4px;">AI Summary:</p>
            <p style="font-size: 11px; color: #374151; line-height: 1.5;">${c.summary}</p>
          </div>` : ""}

          <!-- Strengths (green lines) -->
          ${cStrengthsHtml}

          <!-- Weaknesses (red lines) -->
          ${cWeaknessesHtml}

          <!-- Key Details -->
          <div style="margin-bottom: 15px;">
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>overall_score:</strong> ${Math.round(matchScore)}%</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>seniority_level:</strong> ${seniority}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>experience_years:</strong> ${exp}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>role_type:</strong> ${role || "N/A"}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>education:</strong> ${edu.degree || "N/A"}${edu.university ? " - " + edu.university : ""}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>recruiter_verdict:</strong> ${verdict || "N/A"}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>matched_skills:</strong> ${matched.length > 0 ? matched.join(", ") : "None"}</p>
            <p style="margin: 6px 0; font-size: 12px;">✓ <strong>missing_skills:</strong> ${missing.length > 0 ? missing.join(", ") : "None"}</p>
          </div>

          <div style="margin-top: auto; padding-top: 15px; border-top: 2px solid #272626; font-size: 11px; color: #dc3545; text-align: center; font-weight: 600;">
            <p style="margin: 0;">TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081</p>
          </div>
        </div>
      </div>`;

      await new Promise((resolve) => setTimeout(resolve, 300));

      const pageCanvas = await safeHtml2Canvas(pageDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
      });

      const pageImg = pageCanvas.toDataURL("image/png");
      pdf.addPage([pageCanvas.width * 0.75, pageCanvas.height * 0.75]);
      pdf.addImage(pageImg, "PNG", 0, 0, pageCanvas.width * 0.75, pageCanvas.height * 0.75);
      document.body.removeChild(pageDiv);
    }

    pdf.save(`AI_Screening_Complete_Report_${jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`);
  } catch (err) {
    console.error("PDF generation error:", err);
    alert("Failed to generate report. Please try again.");
  } finally {
    setDownloadingAll(false);
  }
}

export default function ResultsDashboard({ results }) {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [topN, setTopN] = useState(results.total_candidates || results.totalCandidates || (results.results || []).length);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

  const filteredResults = useMemo(() => {
    const allResults = results.results || [];
    return allResults.slice(0, topN);
  }, [results.results, topN]);

  const avgScore = useMemo(() => {
    if (filteredResults.length === 0) return 0;
    return (filteredResults.reduce((sum, c) => sum + (c.match_score || c.matchScore || c.finalScore || 0), 0) / filteredResults.length).toFixed(1);
  }, [filteredResults]);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ats-results.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const allResults = results.results || [];
    // Build CSV content
    const headers = [
      "Rank", "Name", "Email", "Phone", "Score (%)", "Recommendation", "Seniority",
      "Experience (yrs)", "Education", "University",
      "Matched Skills", "Missing Skills", "Inferred Skills",
      "Strengths", "Weaknesses", "Summary",
      "Semantic Score", "Skills Score", "Experience Score",
      "Achievement Score", "Education Score", "Certification Score",
      "Role Type", "Fraud Score", "Suspicious", "Fraud Flags"
    ];

    const rows = allResults.map(c => [
      c.rank || "",
      c.name || c.candidate_name || c.jobSeekerName || "",
      c.email || c.jobSeekerEmail || "",
      c.phone || "",
      Math.round(c.matchScore || c.match_score || c.finalScore || 0),
      c.recruiterVerdict || c.recommendation || c.recruiter_verdict || "",
      c.seniorityLevel || c.seniority_level || "",
      c.experienceYears || c.experience_years || "",
      c.education?.degree || "",
      c.education?.university || "",
      (c.matchedSkills || c.matched_skills || []).join("; "),
      (c.missingSkills || c.missing_skills || []).join("; "),
      (c.inferredSkills || c.inferred_skills || []).join("; "),
      (c.strengths || []).join("; "),
      (c.weaknesses || []).join("; "),
      c.summary || "",
      c.semanticScore || c.semantic_similarity_score || "",
      c.skillsScore || c.skills_match_score || "",
      c.experienceScore || c.experience_match_score || "",
      c.achievementScore || c.achievement_score || "",
      c.educationScore || c.education_match_score || "",
      c.certificationScore || c.certification_match_score || "",
      c.roleType || c.role_type || "",
      c.fraudScore || c.fraud_score || 0,
      c.isSuspicious || c.is_suspicious ? "Yes" : "No",
      (c.fraudFlags || c.fraud_flags || []).join("; "),
    ]);

    // Escape CSV values
    const escape = (val) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csv = [headers.map(escape).join(","), ...rows.map(row => row.map(escape).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AI_Screening_Results_${(results.jobTitle || results.job_title || "Report").replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-gray-900">ATS Results</h2>
            {(results.role_type_detected || results.roleTypeDetected) && (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold rounded-md border border-violet-200">
                {(results.role_type_detected || results.roleTypeDetected).replace("_", " ")}
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {results.job_title || results.jobTitle || "Job"} • {results.total_candidates || results.totalCandidates || filteredResults.length} candidates analyzed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setDownloadingAll(true);
              generateAllCandidatesPDF(results, setDownloadingAll);
            }}
            disabled={downloadingAll}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition shadow-sm disabled:opacity-50"
          >
            {downloadingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
            {downloadingAll ? "Generating..." : "Download Report"}
          </button>
          <button onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition shadow-sm">
            <FileSpreadsheet className="w-3 h-3" /> Export Excel
          </button>
          <button onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition shadow-sm">
            <Download className="w-3 h-3" /> JSON
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total", value: results.total_candidates || results.totalCandidates || filteredResults.length, icon: Users, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-100", iconColor: "text-blue-500" },
          { label: "Showing", value: filteredResults.length, icon: BarChart3, color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-100", iconColor: "text-indigo-500" },
          { label: "Top Score", value: `${filteredResults.length > 0 ? Math.round(filteredResults[0].match_score || filteredResults[0].matchScore || filteredResults[0].finalScore || 0) : 0}%`, icon: Trophy, color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-100", iconColor: "text-emerald-500" },
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-100", iconColor: "text-amber-500" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-3 border ${s.border}`}>
            <div className="flex items-center gap-2">
              <s.icon className={`w-3.5 h-3.5 ${s.iconColor}`} />
              <span className="text-[10px] font-medium text-gray-500">{s.label}</span>
            </div>
            <p className={`text-lg font-bold ${s.color} mt-1`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Required skills */}
      {(results.required_skills || results.requiredSkills) && (results.required_skills || results.requiredSkills).length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2.5">
            <Tag className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-bold text-gray-600">Required Skills from JD:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(results.required_skills || results.requiredSkills).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md border border-indigo-100">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <FilterControls total={results.total_candidates || results.totalCandidates || filteredResults.length} topN={topN} setTopN={setTopN} />

      {/* Candidate cards */}
      <div className="space-y-3">
        {filteredResults.map((candidate, i) => (
          <div key={i} className="relative group/card">
            <CandidateCard candidate={candidate} onClick={() => setSelectedCandidate(candidate)} />
            {/* Individual download button overlay */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDownloadingId(i);
                generateCandidatePDF(
                  candidate,
                  results.job_title || results.jobTitle || "Job",
                  results.required_skills || results.requiredSkills || [],
                  setDownloadingId
                );
              }}
              disabled={downloadingId === i}
              className="absolute top-4 right-20 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 text-[10px] font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 shadow-sm z-10"
            >
              {downloadingId === i ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
              {downloadingId === i ? "..." : "PDF"}
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selectedCandidate && (
        <CandidateModal candidate={selectedCandidate} requiredSkills={results.required_skills || results.requiredSkills || []} onClose={() => setSelectedCandidate(null)} />
      )}
    </section>
  );
}
