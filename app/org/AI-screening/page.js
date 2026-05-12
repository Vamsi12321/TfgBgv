"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload,
  Trash2,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  Download,
  FileText,
  AlertCircle,
  X,
  FileDown,
  FileSpreadsheet,
  Phone,
  Mail,
  Shield,
  Target,
} from "lucide-react";
import { useOrgState } from "../../context/OrgStateContext";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";

/* -----------------------------------------------------------
   MODAL COMPONENTS
------------------------------------------------------------*/
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
}

function SuccessModal({ isOpen, onClose, message, results }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Success">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle2 size={64} className="text-green-500" />
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
        {results && (
          <div className="text-left bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Total Processed:</span>{" "}
              {results.total_resumes_processed || 0}
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Top Results:</span>{" "}
              {results.top_resumes?.length || 0}
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 transition"
        >
          View Results
        </button>
      </div>
    </Modal>
  );
}

function ErrorModal({ isOpen, onClose, message, details }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Error">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <XCircle size={64} className="text-red-500" />
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
        {details && (
          <div className="text-left bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-mono">{details}</p>
          </div>
        )}
        <button
          onClick={onClose}
          className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

/* -----------------------------------------------------------
   HELPER COMPONENTS
------------------------------------------------------------*/
function ScoreCircle({ score }) {
  const pct = Math.round(score);
  const color = pct >= 70 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r="40"
            className="text-gray-200"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            strokeWidth="8"
            fill="transparent"
            stroke={color}
            strokeDasharray={2 * Math.PI * 40}
            strokeDashoffset={2 * Math.PI * 40 * (1 - pct / 100)}
            strokeLinecap="round"
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-xl font-bold"
          style={{ color }}
        >
          {pct}%
        </div>
      </div>
      <p className="text-xs text-gray-600 mt-2 font-medium">Match Score</p>
    </div>
  );
}

function RequirementBadge({ label, status }) {
  return (
    <div
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 shadow-sm transition
      ${
        status === "met"
          ? "bg-green-50 border-green-400 text-green-700"
          : "bg-red-50 border-red-400 text-red-700"
      }`}
    >
      {label}: {status === "met" ? "✓ Met" : "✗ Not Met"}
    </div>
  );
}

function RecommendationBadge({ recommendation }) {
  const config = {
    GOOD_FIT: { bg: "bg-green-100", text: "text-green-700", label: "Good Fit" },
    MODERATE_FIT: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      label: "Moderate Fit",
    },
    WEAK_FIT: {
      bg: "bg-orange-100",
      text: "text-orange-700",
      label: "Weak Fit",
    },
    REJECT: { bg: "bg-red-100", text: "text-red-700", label: "Reject" },
  };

  const style = config[recommendation] || config.REJECT;

  return (
    <span
      className={`px-4 py-1.5 rounded-full text-sm font-bold ${style.bg} ${style.text}`}
    >
      {style.label}
    </span>
  );
}

/* -----------------------------------------------------------
   CERTIFICATE COMPONENT FOR PDF GENERATION
------------------------------------------------------------*/
function CertificateComponent({ id, result, type, timestamp }) {
  const isPositive = ["GOOD_FIT", "MODERATE_FIT"].includes(result.recommendation);
  
  return (
    <div
      id={id}
      style={{
        width: "794px",
        minHeight: "1123px",
        padding: "10px 50px 60px 50px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        position: "relative",
        color: "#000",
        overflow: "hidden",
      }}
    >
      {/* Watermark */}
      <img
        src="/logos/tfgLogo.jpeg"
        alt="watermark"
        style={{
          position: "absolute",
          top: "300px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.08,
          width: "750px",
          height: "750px",
          objectFit: "contain",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 2, marginTop: "-10px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "35px",
            marginBottom: "25px",
            marginTop: "0",
          }}
        >
          <div style={{ flexShrink: 0, marginTop: "5px" }}>
            <img
              src="/logos/tfgLogo.jpeg"
              alt="logo"
              style={{
                maxHeight: "180px",
                maxWidth: "450px",
                height: "auto",
                width: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              gap: "2px",
              marginTop: "55px",
            }}
          >
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: 0,
                lineHeight: "1",
                fontFamily: "Arial Black, Arial, sans-serif",
              }}
            >
              AI Resume Screening
            </h1>
            <h2
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: 0,
                lineHeight: "1",
                fontFamily: "Arial Black, Arial, sans-serif",
              }}
            >
              {type === "basic" ? "Basic" : "Enhanced"} Report
            </h2>
          </div>
        </div>

        {/* Candidate Details */}
        <div
          style={{
            fontSize: "15px",
            lineHeight: "28px",
            marginBottom: "25px",
            marginTop: "-20px",
          }}
        >
          <p>
            <b>Candidate:</b> {result.filename}
          </p>
          <p>
            <b>Rank:</b> #{result.rank}
          </p>
          <p>
            <b>Score:</b> {result.final_weighted_score || result.match_score}
          </p>
          <p>
            <b>Recommendation:</b> {result.recommendation}
          </p>
          <p>
            <b>Screening Type:</b> {type === "basic" ? "Basic Screening" : "Enhanced Screening"}
          </p>
          <p>
            <b>Generated:</b> {timestamp}
          </p>
          <p style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <b>Status:</b>
            <span
              style={{
                color: isPositive ? "#5cb85c" : "#d9534f",
                fontWeight: "bold",
                fontSize: "16px",
              }}
            >
              {isPositive ? "✓ Recommended" : "✗ Not Recommended"}
            </span>
          </p>
        </div>

        {/* Separator */}
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "#000",
            margin: "20px 0 30px 0",
          }}
        />
       

        {/* Strengths */}
        {result.strengths && result.strengths.length > 0 && (
          <>
            {/* Green Status Bar */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "35px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "28px",
                  background: "#5cb85c",
                  borderRadius: "5px",
                }}
              />
              <div
                style={{
                  width:"25%",
                  height: "2px",
                  background: "#5cb85c",
                  marginLeft: "10px",
                }}
              />
            </div>

           {/* strengths */}
            <div style={{ marginBottom: "30px" }}>
              {result.strengths.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <span style={{ fontSize: "18px", marginRight: "10px" }}>✓</span>
                  <span style={{ fontSize: "14px" }}>{item}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Weaknesses */}
        {result.weaknesses && result.weaknesses.length > 0 && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "30px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "28px",
                  background: "#d9534f",
                  borderRadius: "5px",
                }}
              />
              <div
                style={{
                  width:"25%",
                  height: "2px",
                  background: "#d9534f",
                  marginLeft: "10px",
                }}
              />
            </div>

            {/* weakness */}
            {result.weaknesses.map((item, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  marginBottom: "12px",
                }}
              >
                <span
                  style={{
                    marginRight: "10px",
                    fontSize: "18px",
                    color: "#d9534f",
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: "14px" }}>{item}</span>
              </div>
            ))}
          </>
        )}

        {/* Skills Match */}
        {result.skills_match && (
          <>
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#333",
                marginBottom: "10px",
                marginTop: "30px",
              }}
            >
              Skills Analysis
            </h3>
            {result.skills_match.matched && result.skills_match.matched.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                  Matched Skills:
                </p>
                <p style={{ fontSize: "14px" }}>
                  {result.skills_match.matched.join(", ")}
                </p>
              </div>
            )}
            {result.skills_match.missing && result.skills_match.missing.length > 0 && (
              <div style={{ marginBottom: "15px" }}>
                <p style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                  Missing Skills:
                </p>
                <p style={{ fontSize: "14px", color: "#d9534f" }}>
                  {result.skills_match.missing.join(", ")}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "50px",
          right: "50px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            height: "2px",
            background: "#dc3545",
            width: "100%",
            marginBottom: "10px",
          }}
        />
        <p
          style={{
            fontSize: "12px",
            color: "#dc3545",
            fontWeight: "600",
            margin: 0,
            lineHeight: "1.4",
          }}
        >
          TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081
          <br />
          📞 8886099008 | ✉ naresh@tfgorg.com | 🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>LinkedIn</a> | 🌐 <a href="https://www.tfgorg.com" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>www.tfgorg.com</a>
        </p>
      </div>
    </div>
  );
}

/* -----------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------*/
export default function OrgAIResumeScreeningPage() {
  // State management context
  const { aiScreeningState = {}, setAiScreeningState = () => {} } =
    useOrgState();

  // Local state - Initialize from context
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [topN, setTopN] = useState(aiScreeningState.topN || 5);
  const [mustHave, setMustHave] = useState(aiScreeningState.mustHave || "");
  const [niceToHave, setNiceToHave] = useState(aiScreeningState.niceToHave || "");
  const [results, setResults] = useState(aiScreeningState.results || []);
  const [enhancedResults, setEnhancedResults] = useState(aiScreeningState.enhancedResults || []);
  const [expanded, setExpanded] = useState(aiScreeningState.expanded || null);

  // Prefill / Add Candidate state — restored from context so results survive navigation
  const [prefillOpen, setPrefillOpen] = useState(aiScreeningState.prefillOpen || {});
  const [prefillForms, setPrefillForms] = useState(aiScreeningState.prefillForms || {});
  const [addedCandidates, setAddedCandidates] = useState(aiScreeningState.addedCandidates || {});

  const openPrefill = (res) => {
    const firstName = res.contact_information?.firstName || "";
    const lastName = res.contact_information?.lastName || "";
    setPrefillForms((prev) => ({
      ...prev,
      [res.filename]: {
        firstName,
        lastName,
        email: res.contact_information?.email_addresses?.[0] || "",
        phone: res.contact_information?.phone_numbers?.[0] || "",
      },
    }));
    setPrefillOpen((prev) => ({ ...prev, [res.filename]: true }));
  };

  const closePrefill = (filename) => {
    setPrefillOpen((prev) => ({ ...prev, [filename]: false }));
  };

  const handlePrefillChange = (filename, field, value) => {
    setPrefillForms((prev) => ({
      ...prev,
      [filename]: { ...prev[filename], [field]: value },
    }));
  };

  const handleAddCandidate = async (filename) => {
    const form = prefillForms[filename];
    if (!form?.firstName && !form?.lastName && !form?.email && !form?.phone) return;
    setAddedCandidates((prev) => ({ ...prev, [filename]: "loading" }));

    try {
      const body = new URLSearchParams();
      if (form.firstName)  body.append("firstName",      form.firstName);
      if (form.lastName)   body.append("lastName",       form.lastName);
      if (form.email)      body.append("email",          form.email);
      if (form.phone)      body.append("phone",          form.phone);
      body.append("resumeFilename", filename);
      body.append("source", "ai_screening");

      const res = await fetch("/api/proxy/secure/createCandidateFromScreening", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      const data = await res.json();

      if (res.status === 201 || res.ok) {
        setAddedCandidates((prev) => ({ ...prev, [filename]: "added" }));
        setPrefillOpen((prev) => ({ ...prev, [filename]: false }));
      } else if (res.status === 409) {
        setAddedCandidates((prev) => ({ ...prev, [filename]: "duplicate" }));
      } else {
        setAddedCandidates((prev) => ({ ...prev, [filename]: "error" }));
        setErrorModal({ isOpen: true, message: "Failed to add candidate", details: data?.detail || "Unknown error" });
      }
    } catch (err) {
      setAddedCandidates((prev) => ({ ...prev, [filename]: "error" }));
      setErrorModal({ isOpen: true, message: "Failed to add candidate", details: err.message });
    }
  };

  // Loading states
  const [loading, setLoading] = useState(false);
  const [enhancedLoading, setEnhancedLoading] = useState(false);

  // Modal state
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    message: "",
    results: null,
  });
  const [errorModal, setErrorModal] = useState({
    isOpen: false,
    message: "",
    details: "",
  });

  // Use ref to always have latest values for cleanup
  const stateRef = useRef({ topN, mustHave, niceToHave, results, enhancedResults, prefillOpen, prefillForms, addedCandidates, expanded });
  
  // Update ref whenever state changes
  useEffect(() => {
    stateRef.current = { topN, mustHave, niceToHave, results, enhancedResults, prefillOpen, prefillForms, addedCandidates, expanded };
  }, [topN, mustHave, niceToHave, results, enhancedResults, prefillOpen, prefillForms, addedCandidates, expanded]);

  // Save state on unmount (when navigating away)
  useEffect(() => {
    return () => {
      setAiScreeningState(stateRef.current);
    };
  }, [setAiScreeningState]);

  /* -----------------------------------------------------------
     FILE HANDLERS
  ------------------------------------------------------------*/
  const handleJdUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setJdFile(file);
    } else {
      setErrorModal({
        isOpen: true,
        message: "Invalid File Type",
        details: "Please upload a PDF file for the job description.",
      });
    }
  };

  const handleResumeUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(
      (f) => 
        f.type === "application/pdf" || 
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.type === "application/msword"
    );

    if (validFiles.length !== files.length) {
      setErrorModal({
        isOpen: true,
        message: "Some Files Skipped",
        details: "Only PDF and DOCX files are accepted. Other files were skipped.",
      });
    }

    setResumeFiles((prev) => [...prev, ...validFiles]);
  };

  const removeResume = (name) => {
    setResumeFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const clearAll = () => {
    setJdFile(null);
    setResumeFiles([]);
    setResults([]);
    setEnhancedResults([]);
    setExpanded(null);
  };

  /* -----------------------------------------------------------
     BASIC AI SCREENING
  ------------------------------------------------------------*/
  const handleBasic = async () => {
    if (!jdFile) {
      setErrorModal({
        isOpen: true,
        message: "Missing Job Description",
        details: "Please upload a job description PDF file.",
      });
      return;
    }

    if (resumeFiles.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "Missing Resumes",
        details: "Please upload at least one resume PDF file.",
      });
      return;
    }

    // Clear previous results
    setResults([]);
    setExpanded(null);
    setLoading(true);

    const fd = new FormData();
    fd.append("jd_file", jdFile);
    resumeFiles.forEach((f) => fd.append("resume_files", f));
    fd.append("top_n", topN);

    try {
      const res = await fetch("/api/proxy/secure/ai_resume_screening", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setResults(data.results?.top_resumes || []);

      setSuccessModal({
        isOpen: true,
        message: "Basic Screening Complete!",
        results: data.results,
      });
    } catch (error) {
      console.error("API Error:", error);
      setErrorModal({
        isOpen: true,
        message: "Screening Failed",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     ENHANCED AI SCREENING
  ------------------------------------------------------------*/
  const handleEnhanced = async () => {
    if (!jdFile) {
      setErrorModal({
        isOpen: true,
        message: "Missing Job Description",
        details: "Please upload a job description PDF file.",
      });
      return;
    }

    if (resumeFiles.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "Missing Resumes",
        details: "Please upload at least one resume PDF file.",
      });
      return;
    }

    // Clear previous results
    setEnhancedResults([]);
    setExpanded(null);
    setEnhancedLoading(true);

    const fd = new FormData();
    fd.append("jd_file", jdFile);
    resumeFiles.forEach((f) => fd.append("resume_files", f));
    fd.append("top_n", topN);
    fd.append("must_have_requirements", mustHave);
    fd.append("nice_to_have", niceToHave);
    fd.append("min_embedding_score", "0.5");

    try {
      const res = await fetch(
        "/api/proxy/secure/ai_resume_screening_enhanced",
        {
          method: "POST",
          credentials: "include",
          body: fd,
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`${res.status}: ${errorText}`);
      }

      const data = await res.json();
      setEnhancedResults(data.results?.top_resumes || []);

      setSuccessModal({
        isOpen: true,
        message: "Enhanced Screening Complete!",
        results: data.results,
      });
    } catch (error) {
      console.error("API Error:", error);
      setErrorModal({
        isOpen: true,
        message: "Enhanced Screening Failed",
        details: error.message,
      });
    } finally {
      setEnhancedLoading(false);
    }
  };

  /* -----------------------------------------------------------
     DOWNLOAD ALL RESUMES
  ------------------------------------------------------------*/
  const downloadResumes = async (type) => {
    const data = type === "basic" ? results : enhancedResults;

    if (data.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "No Results to Download",
        details: "Please run screening first to get results.",
      });
      return;
    }

    setLoading(true);

    try {
      // Download each matching resume file
      for (const result of data) {
        const matchingFile = resumeFiles.find(
          (file) => file.name === result.filename
        );

        if (matchingFile) {
          const url = URL.createObjectURL(matchingFile);
          const a = document.createElement("a");
          a.href = url;
          a.download = matchingFile.name;
          a.click();
          URL.revokeObjectURL(url);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }

      setSuccessModal({
        isOpen: true,
        message: `Downloaded ${data.length} resume(s) successfully!`,
      });
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: "Download Failed",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     DOWNLOAD TEXT REPORT
  ------------------------------------------------------------*/
  const downloadReport = (type, data) => {
    let report = `AI RESUME SCREENING REPORT\n`;
    report += `Type: ${type.toUpperCase()}\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `Total Candidates: ${data.length}\n`;
    report += `\n${"=".repeat(80)}\n\n`;

    data.forEach((res, idx) => {
      report += `RANK #${res.rank || idx + 1}: ${res.filename}\n`;
      report += `${"-".repeat(80)}\n`;

      if (res.final_weighted_score !== undefined) {
        report += `Final Score: ${res.final_weighted_score}\n`;
      }
      if (res.match_score !== undefined) {
        report += `Match Score: ${res.match_score}%\n`;
      }
      if (res.recommendation) {
        report += `Recommendation: ${res.recommendation}\n`;
      }

      report += `\n`;

      if (res.ranking_explanation) {
        report += `RANKING EXPLANATION:\n${res.ranking_explanation}\n\n`;
      }

      if (res.summary) {
        report += `SUMMARY:\n${res.summary}\n\n`;
      }

      if (res.critical_requirements_status) {
        report += `CRITICAL REQUIREMENTS:\n`;
        Object.entries(res.critical_requirements_status).forEach(
          ([key, value]) => {
            report += `  ${
              value === "met" ? "✓" : "✗"
            } ${key}: ${value.toUpperCase()}\n`;
          }
        );
        report += `\n`;
      }

      if (res.strengths && res.strengths.length > 0) {
        report += `STRENGTHS:\n`;
        res.strengths.forEach((s) => {
          report += `  ✓ ${s}\n`;
        });
        report += `\n`;
      }

      if (res.weaknesses && res.weaknesses.length > 0) {
        report += `WEAKNESSES:\n`;
        res.weaknesses.forEach((w) => {
          report += `  ✗ ${w}\n`;
        });
        report += `\n`;
      }

      if (res.skills_match) {
        if (res.skills_match.matched && res.skills_match.matched.length > 0) {
          report += `MATCHED SKILLS: ${res.skills_match.matched.join(", ")}\n`;
        }
        if (res.skills_match.missing && res.skills_match.missing.length > 0) {
          report += `MISSING SKILLS: ${res.skills_match.missing.join(", ")}\n`;
        }
        report += `\n`;
      }

      if (res.experience_match) {
        const exp =
          typeof res.experience_match === "string"
            ? res.experience_match
            : res.experience_match.assessment;
        report += `EXPERIENCE: ${exp}\n\n`;
      }

      if (res.education_match) {
        report += `EDUCATION: ${res.education_match}\n\n`;
      }

      if (res.contact_information) {
        report += `CONTACT INFORMATION:\n`;
        report += `  Status: ${res.contact_information.contact_completeness}\n`;
        report += `  Total: ${res.contact_information.total_phones} phone(s), ${res.contact_information.total_emails} email(s)\n`;
        
        if (res.contact_information.phone_numbers && res.contact_information.phone_numbers.length > 0) {
          report += `  Phone Numbers: ${res.contact_information.phone_numbers.join(", ")}\n`;
        }
        
        if (res.contact_information.email_addresses && res.contact_information.email_addresses.length > 0) {
          report += `  Email Addresses: ${res.contact_information.email_addresses.join(", ")}\n`;
        }
        
        if (res.contact_information.regex_detected) {
          report += `  Pattern Detection: ${res.contact_information.regex_detected.total_phones} phone patterns, ${res.contact_information.regex_detected.total_emails} email patterns\n`;
        }
        
        report += `\n`;
      }

      report += `${"=".repeat(80)}\n\n`;
    });

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-screening-${type}-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* -----------------------------------------------------------
     DOWNLOAD EXCEL/CSV REPORT
  ------------------------------------------------------------*/
  const downloadExcelReport = (type) => {
    const data = type === "basic" ? results : enhancedResults;

    if (data.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "No Results to Download",
        details: "Please run screening first to get results.",
      });
      return;
    }

    // Prepare data for Excel
    const excelData = data.map((res) => ({
      "Rank": res.rank || "-",
      "Candidate Name": res.filename,
      "Score": res.final_weighted_score || res.match_score || "-",
      "Recommendation": res.recommendation || "-",
      "Ranking Explanation": res.ranking_explanation || "-",
      "Matched Skills": res.skills_match?.matched?.join(", ") || "-",
      "Missing Skills": res.skills_match?.missing?.join(", ") || "-",
      "Strengths": res.strengths?.join("; ") || "-",
      "Weaknesses": res.weaknesses?.join("; ") || "-",
      "Experience Match": typeof res.experience_match === "string" 
        ? res.experience_match 
        : res.experience_match?.assessment || "-",
      "Education Match": res.education_match || "-",
      "Contact Status": res.contact_information?.contact_completeness || "-",
      "Phone Numbers": res.contact_information?.phone_numbers?.join(", ") || "-",
      "Email Addresses": res.contact_information?.email_addresses?.join(", ") || "-",
      "Contact Total": res.contact_information ? 
        `${res.contact_information.total_phones} phone(s), ${res.contact_information.total_emails} email(s)` : "-",
      "Summary": res.summary || "-",
    }));

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 6 },  // Rank
      { wch: 30 }, // Candidate Name
      { wch: 10 }, // Score
      { wch: 15 }, // Recommendation
      { wch: 60 }, // Ranking Explanation
      { wch: 40 }, // Matched Skills
      { wch: 40 }, // Missing Skills
      { wch: 50 }, // Strengths
      { wch: 50 }, // Weaknesses
      { wch: 40 }, // Experience Match
      { wch: 40 }, // Education Match
      { wch: 15 }, // Contact Status
      { wch: 30 }, // Phone Numbers
      { wch: 40 }, // Email Addresses
      { wch: 25 }, // Contact Total
      { wch: 60 }, // Summary
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AI Screening Results");

    // Download as Excel file
    XLSX.writeFile(wb, `ai-screening-${type}-report-${Date.now()}.xlsx`);

    setSuccessModal({
      isOpen: true,
      message: "Excel Report Downloaded Successfully!",
    });
  };

  /* -----------------------------------------------------------
     DOWNLOAD PDF CERTIFICATES FOR ALL CANDIDATES
  ------------------------------------------------------------*/
  const downloadPDFCertificates = async (type) => {
    const data = type === "basic" ? results : enhancedResults;

    if (data.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "No Results to Download",
        details: "Please run screening first to get results.",
      });
      return;
    }

    setLoading(true);

    try {
      const timestamp = new Date().toLocaleString();

      for (let i = 0; i < data.length; i++) {
        const result = data[i];
        
        // Create a temporary container for the certificate
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "794px";
        container.style.minHeight = "1123px";
        container.style.zIndex = "-9999";
        container.style.opacity = "0";
        container.style.pointerEvents = "none";
        document.body.appendChild(container);

        // Render certificate component
        const certId = `cert-${i}`;
        container.innerHTML = renderCertificateHTML(result, type, timestamp, i);

        // Wait for images to load
        await new Promise(resolve => setTimeout(resolve, 500));

        // Generate PDF - use the container directly instead of searching by ID
        const certElement = container.querySelector(`#cert-${i}`) || container.firstElementChild;
        
        if (!certElement) {
          console.error(`Certificate element not found for result ${i}`);
          continue;
        }
        
        const canvas = await safeHtml2Canvas(certElement, { scale: 2 });
        const canvasWidth = canvas?.width || 1;
        const canvasHeight = canvas?.height || 1;

        const jpeg = canvas.toDataURL("image/jpeg", 1.0);
        const pdf = new jsPDF("p", "pt", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = (canvasHeight * pageWidth) / canvasWidth;

        pdf.addImage(jpeg, "JPEG", 0, 0, pageWidth, pageHeight);
        pdf.save(`AI-Screening-Certificate-${result.filename.replace('.pdf', '')}-${Date.now()}.pdf`);

        // Clean up
        document.body.removeChild(container);

        // Small delay between PDFs
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setSuccessModal({
        isOpen: true,
        message: `Downloaded ${data.length} PDF certificate(s) successfully!`,
      });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      setErrorModal({
        isOpen: true,
        message: "PDF Generation Failed",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     RENDER CERTIFICATE HTML (Helper for PDF generation)
  ------------------------------------------------------------*/
  const renderCertificateHTML = (result, type, timestamp, index = 0) => {
    const isPositive = ["GOOD_FIT", "MODERATE_FIT"].includes(result.recommendation);
    
    return `
      <div id="cert-${index}" style="width: 794px; min-height: 1123px; padding: 10px 50px 60px 50px; background: #ffffff; font-family: Arial, sans-serif; position: relative; color: #000; overflow: hidden;">
        <img src="/logos/tfgLogo.jpeg" alt="watermark" style="position: absolute; top: 300px; left: 50%; transform: translateX(-50%); opacity: 0.08; width: 750px; height: 750px; object-fit: contain; z-index: 1; pointer-events: none;" />
        
        <div style="position: relative; z-index: 2; margin-top: -10px;">
          <div style="display: flex; align-items: flex-start; gap: 35px; margin-bottom: 25px; margin-top: 0;">
            <div style="flex-shrink: 0; margin-top: 5px;">
              <img src="/logos/tfgLogo.jpeg" alt="logo" style="max-height: 180px; max-width: 450px; height: auto; width: auto; display: block; object-fit: contain;" />
            </div>
            <div style="display: flex; flex-direction: column; justify-content: flex-start; gap: 2px; margin-top: 55px;">
              <h1 style="font-size: 26px; font-weight: 900; margin: 0; line-height: 1; font-family: Arial Black, Arial, sans-serif;">AI Resume Screening</h1>
              <h2 style="font-size: 26px; font-weight: 900; margin: 0; line-height: 1; font-family: Arial Black, Arial, sans-serif;">${type === "basic" ? "Basic" : "Enhanced"} Report</h2>
            </div>
          </div>
          
          <div style="font-size: 15px; line-height: 28px; margin-bottom: 25px; margin-top: -20px;">
            <p><b>Candidate:</b> ${result.filename}</p>
            <p><b>Rank:</b> #${result.rank}</p>
            <p><b>Score:</b> ${result.final_weighted_score || result.match_score}</p>
            <p><b>Recommendation:</b> ${result.recommendation}</p>
            <p><b>Screening Type:</b> ${type === "basic" ? "Basic Screening" : "Enhanced Screening"}</p>
            <p><b>Generated:</b> ${timestamp}</p>
            <p style="display: flex; align-items: center; gap: 10px;">
              <b>Status:</b>
              <span style="color: ${isPositive ? "#5cb85c" : "#d9534f"}; font-weight: bold; font-size: 16px;">
                ${isPositive ? "✓ Recommended" : "✗ Not Recommended"}
              </span>
            </p>
          </div>
          
          <div style="width: 100%; height: 3px; background: #000; margin: 20px 0 30px 0;"></div>
          
          ${result.ranking_explanation ? `
            <h3 style="font-size: 20px; font-weight: 700; color: #007bff; margin-bottom: 10px; margin-top: 30px;">
              Ranking Explanation
            </h3>
            <div style="margin-bottom: 20px;">
              <p style="font-size: 14px; line-height: 1.6; color: #333;">
                ${result.ranking_explanation}
              </p>
            </div>
          ` : ''}
          
          ${result.strengths && result.strengths.length > 0 ? `
            <div style="display: flex; align-items: center; margin-bottom: 35px;">
              <div style="width: 60px; height: 28px; background: #5cb85c; border-radius: 5px;"></div>
              <div style=" width:25%; height: 2px; background: #5cb85c; margin-left: 10px;"></div>
            </div>
            
            <div style="margin-bottom: 10px;">
              ${result.strengths.map(item => `
                <div style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                  <span style="font-size: 18px; margin-right: 10px;">✓</span>
                  <span style="font-size: 14px;">${item}</span>
                </div>
              `).join('')}
            </div>
          ` : ''}
          
          ${result.weaknesses && result.weaknesses.length > 0 ? `
            <div style="display: flex; align-items: center; margin-bottom: 30px;">
              <div style="width: 60px; height: 28px; background: #d9534f; border-radius: 5px;"></div>
              <div style=" width:25%; height: 2px; background: #d9534f; margin-left: 10px;"></div>
            </div>
    
            ${result.weaknesses.map(item => `
              <div style="display: flex; margin-bottom: 5px;">
                <span style="margin-right: 10px; font-size: 18px; color: #d9534f;">✓</span>
                <span style="font-size: 14px;">${item}</span>
              </div>
            `).join('')}
          ` : ''}
        </div>
        
        <div style="position: absolute; bottom: 10px; left: 50px; right: 50px; text-align: center;">
          <div style="height: 2px; background: #dc3545; width: 100%; margin-bottom: 10px;"></div>
          <p style="font-size: 12px; color: #dc3545; font-weight: 600; margin: 0; line-height: 1.4;">
            TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081
            <br />
            📞 8886099008 | ✉ naresh@tfgorg.com | 🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style="color: #dc3545; text-decoration: underline;">LinkedIn</a> | 🌐 <a href="https://www.tfgorg.com" target="_blank" style="color: #dc3545; text-decoration: underline;">www.tfgorg.com</a>
          </p>
        </div>
      </div>
    `;
  };

  /* -----------------------------------------------------------
     DOWNLOAD ALL (Resumes + Reports + Certificates + Excel)
  ------------------------------------------------------------*/
  const downloadAll = async (type) => {
    const data = type === "basic" ? results : enhancedResults;

    if (data.length === 0) {
      setErrorModal({
        isOpen: true,
        message: "No Results to Download",
        details: "Please run screening first to get results.",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Download all resumes
      await downloadResumes(type);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 2. Download text report
      downloadReport(type, data);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 3. Download Excel report
      downloadExcelReport(type);
      await new Promise(resolve => setTimeout(resolve, 500));

      // 4. Download PDF certificates
      await downloadPDFCertificates(type);

      setSuccessModal({
        isOpen: true,
        message: "All files downloaded successfully!",
      });
    } catch (error) {
      setErrorModal({
        isOpen: true,
        message: "Download Failed",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------------------------------------
     RENDER RESUME CARD
  ------------------------------------------------------------*/
  const renderResumeCard = (res, idx, type) => {
    const isExpanded = expanded === `${type}-${idx}`;

    return (
      <div
        key={idx}
        className="bg-white shadow-lg border border-gray-200 rounded-2xl overflow-hidden transition-all hover:shadow-2xl"
      >
        {/* Header */}
        <div
          className="flex justify-between items-center p-5 cursor-pointer bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition"
          onClick={() => setExpanded(isExpanded ? null : `${type}-${idx}`)}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="text-[#ff004f]" size={20} />
              <p className="font-bold text-lg text-gray-900">{res.filename}</p>
            </div>

            <div className="flex flex-wrap gap-2 items-center">
              {res.rank && (
                <span className="px-3 py-1 bg-[#ff004f] text-white text-xs font-bold rounded-full">
                  Rank #{res.rank}
                </span>
              )}

              {res.recommendation && (
                <RecommendationBadge recommendation={res.recommendation} />
              )}

              {res.final_weighted_score !== undefined && (
                <span className="text-sm text-gray-600 font-semibold">
                  Score:{" "}
                  <span className="text-[#ff004f]">
                    {res.final_weighted_score}
                  </span>
                </span>
              )}

              {res.match_score !== undefined && (
                <span className="text-sm text-gray-600 font-semibold">
                  Match:{" "}
                  <span className="text-[#ff004f]">{res.match_score}%</span>
                </span>
              )}
            </div>
          </div>

          <div className="ml-4">
            {isExpanded ? (
              <ChevronUp className="text-gray-400" size={24} />
            ) : (
              <ChevronDown className="text-gray-400" size={24} />
            )}
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-6 space-y-6 bg-gray-50 border-t">
            {/* Score Circle */}
            <div className="flex justify-center">
              <ScoreCircle
                score={res.final_weighted_score || res.match_score || 0}
              />
            </div>

            {/* Ranking Explanation */}
            {res.ranking_explanation && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
                  <Target size={18} className="text-blue-600" />
                  Ranking Explanation
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed font-medium">
                  {res.ranking_explanation}
                </p>
              </div>
            )}

            {/* Summary */}
            {res.summary && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <AlertCircle size={18} className="text-blue-500" />
                  Summary
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {res.summary}
                </p>
              </div>
            )}

            {/* Critical Requirements */}
            {res.critical_requirements_status && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3">
                  Critical Requirements
                </h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(res.critical_requirements_status).map(
                    ([key, value], i) => (
                      <RequirementBadge key={i} label={key} status={value} />
                    )
                  )}
                </div>
              </div>
            )}

            {/* Strengths */}
            {res.strengths && res.strengths.length > 0 && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={18} />
                  Strengths
                </h4>
                <ul className="space-y-2">
                  {res.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weaknesses */}
            {res.weaknesses && res.weaknesses.length > 0 && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle size={18} />
                  Weaknesses
                </h4>
                <ul className="space-y-2">
                  {res.weaknesses.map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-700">
                      <span className="text-red-500 font-bold">✗</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills Match */}
            {res.skills_match && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-900 mb-3">Skills Match</h4>

                {res.skills_match.matched &&
                  res.skills_match.matched.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-green-700 mb-2">
                        Matched Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {res.skills_match.matched.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {res.skills_match.missing &&
                  res.skills_match.missing.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-red-700 mb-2">
                        Missing Skills:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {res.skills_match.missing.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Experience Match */}
            {res.experience_match && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">
                  Experience Match
                </h4>
                <p className="text-sm text-gray-700">
                  {typeof res.experience_match === "string"
                    ? res.experience_match
                    : res.experience_match.assessment}
                </p>
              </div>
            )}

            {/* Education Match */}
            {res.education_match && (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <h4 className="font-bold text-gray-900 mb-2">
                  Education Match
                </h4>
                <p className="text-sm text-gray-700">{res.education_match}</p>
              </div>
            )}

            {/* Contact Information */}
            {res.contact_information && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200 shadow-sm">
                <h4 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <Shield size={18} className="text-green-600" />
                  Contact Information Verified
                </h4>

                {/* Full Name */}
                {(res.contact_information.firstName || res.contact_information.lastName) && (
                  <div className="bg-white p-3 rounded-lg border border-green-200 mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {(res.contact_information.firstName || res.contact_information.lastName || "?").charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Extracted Name</p>
                      <p className="font-bold text-gray-900 text-sm">
                        {[res.contact_information.firstName, res.contact_information.lastName].filter(Boolean).join(" ")}
                      </p>
                    </div>
                    <span className="ml-auto text-green-600 font-semibold text-xs flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      AI Extracted
                    </span>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Contact Summary */}
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Contact Status</p>
                    <p className="text-lg font-bold text-green-600">
                      {res.contact_information.contact_completeness}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {res.contact_information.total_phones} phone(s), {res.contact_information.total_emails} email(s)
                    </p>
                  </div>

                  {/* Detection Results */}
                  <div className="bg-white p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1">Pattern Detection</p>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <span className="font-semibold">Regex Phones:</span> {res.contact_information.regex_detected?.total_phones || 0}
                      </p>
                      <p className="text-sm">
                        <span className="font-semibold">Regex Emails:</span> {res.contact_information.regex_detected?.total_emails || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone Numbers */}
                {res.contact_information.phone_numbers && res.contact_information.phone_numbers.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Phone size={14} className="text-green-600" />
                      Phone Numbers ({res.contact_information.phone_numbers.length})
                    </h5>
                    <div className="space-y-1">
                      {res.contact_information.phone_numbers.map((phone, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                          <span className="font-mono text-sm text-gray-800">{phone}</span>
                          <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Email Addresses */}
                {res.contact_information.email_addresses && res.contact_information.email_addresses.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <Mail size={14} className="text-green-600" />
                      Email Addresses ({res.contact_information.email_addresses.length})
                    </h5>
                    <div className="space-y-1">
                      {res.contact_information.email_addresses.map((email, i) => (
                        <div key={i} className="flex items-center justify-between bg-white p-2 rounded border border-green-200">
                          <span className="font-mono text-sm text-gray-800">{email}</span>
                          <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Verified
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── ADD AS CANDIDATE ── */}
                <div className="mt-4 pt-4 border-t border-green-200">
                  {addedCandidates[res.filename] === "added" ? (
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-3 rounded-xl font-semibold text-sm">
                      <CheckCircle2 size={16} />
                      Candidate added successfully!
                    </div>
                  ) : addedCandidates[res.filename] === "duplicate" ? (
                    <div className="flex items-center gap-2 bg-yellow-100 text-yellow-700 px-4 py-3 rounded-xl font-semibold text-sm">
                      <AlertCircle size={16} />
                      Candidate with this email/phone already exists.
                    </div>
                  ) : prefillOpen[res.filename] ? (
                    <div className="bg-white border-2 border-blue-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-blue-800 text-sm flex items-center gap-2">
                          ✨ Pre-filled from Resume — Review &amp; Add
                        </p>
                        <button
                          onClick={() => closePrefill(res.filename)}
                          className="text-gray-400 hover:text-gray-600 transition"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 font-medium mb-1 block">First Name *</label>
                          <input
                            type="text"
                            value={prefillForms[res.filename]?.firstName || ""}
                            onChange={(e) => handlePrefillChange(res.filename, "firstName", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            placeholder="First name"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 font-medium mb-1 block">Last Name</label>
                          <input
                            type="text"
                            value={prefillForms[res.filename]?.lastName || ""}
                            onChange={(e) => handlePrefillChange(res.filename, "lastName", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                            placeholder="Last name"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1 block">Email *</label>
                        <input
                          type="email"
                          value={prefillForms[res.filename]?.email || ""}
                          onChange={(e) => handlePrefillChange(res.filename, "email", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                          placeholder="email@example.com"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-xs text-gray-500 font-medium mb-1 block">Phone</label>
                        <input
                          type="text"
                          value={prefillForms[res.filename]?.phone || ""}
                          onChange={(e) => handlePrefillChange(res.filename, "phone", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <p className="text-xs text-gray-400 italic">
                        ⚠️ Candidate will be added with <span className="font-semibold text-orange-500">Incomplete Profile</span> status. You can fill remaining fields from Manage Candidates.
                      </p>

                      <button
                        onClick={() => handleAddCandidate(res.filename)}
                        disabled={
                          (!prefillForms[res.filename]?.firstName && !prefillForms[res.filename]?.email) ||
                          addedCandidates[res.filename] === "loading"
                        }
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-2.5 font-semibold text-sm flex items-center justify-center gap-2 hover:from-blue-600 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addedCandidates[res.filename] === "loading" ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Adding Candidate...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={15} />
                            Add as Candidate
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => openPrefill(res)}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 rounded-xl py-2.5 text-sm font-semibold transition"
                    >
                      <span className="text-lg">＋</span>
                      Add as Candidate (Pre-fill from Resume)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  /* -----------------------------------------------------------
     RETURN UI
  ------------------------------------------------------------*/
  return (
    <>
      {/* Modals */}
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() =>
          setSuccessModal({ isOpen: false, message: "", results: null })
        }
        message={successModal.message}
        results={successModal.results}
      />

      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() =>
          setErrorModal({ isOpen: false, message: "", details: "" })
        }
        message={errorModal.message}
        details={errorModal.details}
      />

      {/* Loading Overlay for Downloads */}
      {(loading || enhancedLoading) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-md">
            <div className="relative">
              <Loader2 className="animate-spin text-[#ff004f]" size={48} />
              <div className="absolute inset-0 rounded-full bg-[#ff004f]/20 animate-ping"></div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {loading ? "Basic Screening AI Please Wait..." : "Enhanced Screening AI Please Wait..."}
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we process your screening
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={24} className="text-[#ff004f]" />
              AI Resume Screening
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Upload job descriptions and resumes to find best candidates
            </p>
          </div>

          {/* ── INFO BANNER ── */}
          <div className="flex items-start gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3">
            <span className="text-blue-500 mt-0.5 flex-shrink-0">💡</span>
            <p className="text-sm text-blue-800 leading-relaxed">
              <span className="font-bold">Pro tip:</span> After screening, each result card shows extracted contact info (name, email, phone).
              Click <span className="font-semibold text-indigo-700">＋ Add as Candidate</span> to instantly pre-fill and add them to the system — no re-typing needed.
            </p>
          </div>

          {/* Upload Section — compact */}
          <div className="bg-white rounded-2xl shadow-md border p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Upload size={16} className="text-[#ff004f]" />
                Upload Files
              </h2>
              {(jdFile || resumeFiles.length > 0) && (
                <button
                  onClick={clearAll}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 size={13} />
                  Clear All
                </button>
              )}
            </div>

            {/* JD + Resume side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* JD Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Job Description (PDF) <span className="text-red-500">*</span>
                </label>
                <label className={`cursor-pointer flex items-center gap-2 border-2 border-dashed rounded-xl px-3 py-2.5 transition group ${
                  jdFile ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#ff004f] hover:bg-red-50"
                }`}>
                  {jdFile ? (
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Upload size={16} className="text-gray-400 group-hover:text-[#ff004f] flex-shrink-0 transition" />
                  )}
                  <span className={`text-xs font-medium truncate ${jdFile ? "text-green-700" : "text-gray-500 group-hover:text-[#ff004f]"}`}>
                    {jdFile ? jdFile.name : "Choose Job Description PDF"}
                  </span>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleJdUpload} />
                </label>
              </div>

              {/* Resume Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Resumes (PDF / DOCX) <span className="text-red-500">*</span>
                </label>
                <label className={`cursor-pointer flex items-center gap-2 border-2 border-dashed rounded-xl px-3 py-2.5 transition group ${
                  resumeFiles.length > 0 ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50 hover:border-[#ff004f] hover:bg-red-50"
                }`}>
                  {resumeFiles.length > 0 ? (
                    <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  ) : (
                    <Upload size={16} className="text-gray-400 group-hover:text-[#ff004f] flex-shrink-0 transition" />
                  )}
                  <span className={`text-xs font-medium truncate ${resumeFiles.length > 0 ? "text-green-700" : "text-gray-500 group-hover:text-[#ff004f]"}`}>
                    {resumeFiles.length > 0 ? `${resumeFiles.length} file${resumeFiles.length > 1 ? "s" : ""} selected` : "Choose Resumes (Multiple)"}
                  </span>
                  <input type="file" multiple accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
                </label>
              </div>
            </div>

            {/* Resume file chips */}
            {resumeFiles.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {resumeFiles.map((f, i) => (
                  <div key={i} className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded-full px-2.5 py-1 text-xs text-gray-700">
                    <FileText size={11} className="text-gray-400" />
                    <span className="max-w-[140px] truncate">{f.name}</span>
                    <button onClick={() => removeResume(f.name)} className="text-red-400 hover:text-red-600 ml-0.5 transition">
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Config row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Top N</label>
                <input
                  type="number" min="1" max="50"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:border-[#ff004f] focus:outline-none transition text-gray-900"
                  value={topN}
                  onChange={(e) => setTopN(e.target.value)}
                />
              </div>
              <div className="col-span-1 md:col-span-3">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Must Have <span className="font-normal text-gray-400">(comma separated)</span></label>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:border-[#ff004f] focus:outline-none transition text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Python 5+ years, AWS certification"
                  value={mustHave}
                  onChange={(e) => setMustHave(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Nice to Have <span className="font-normal text-gray-400">(comma separated)</span></label>
              <input
                type="text"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:border-[#ff004f] focus:outline-none transition text-gray-900 placeholder:text-gray-400"
                placeholder="e.g., Docker, Kubernetes, Microservices"
                value={niceToHave}
                onChange={(e) => setNiceToHave(e.target.value)}
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                className="bg-gradient-to-r from-[#ff004f] to-[#ff6f6f] text-white py-2.5 rounded-xl shadow flex items-center justify-center gap-2 font-bold text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleBasic}
                disabled={loading || enhancedLoading}
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {loading ? "Processing..." : "Basic Screening"}
              </button>
              <button
                className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-2.5 rounded-xl shadow flex items-center justify-center gap-2 font-bold text-sm hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEnhanced}
                disabled={loading || enhancedLoading}
              >
                {enhancedLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                {enhancedLoading ? "Processing..." : "Enhanced Screening"}
              </button>
            </div>
          </div>

          {/* Results Section */}
          {(results.length > 0 || enhancedResults.length > 0) && (
            <div className="space-y-5">
              {/* Basic Results */}
              {results.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
                  {/* Results Header */}
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#ff004f]"></span>
                      <h2 className="text-sm font-bold text-gray-800">Basic Screening Results</h2>
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {results.length} candidate{results.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Contact Summary — compact pills */}
                    {results.some(r => r.contact_information) && (
                      <div className="flex flex-wrap gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <span className="text-xs font-semibold text-green-700 flex items-center gap-1 mr-1">
                          <Shield size={12} /> Contacts:
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {results.filter(r => r.contact_information?.contact_completeness === 'COMPLETE').length} complete
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          📞 {results.reduce((s, r) => s + (r.contact_information?.total_phones || 0), 0)} phones
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          ✉ {results.reduce((s, r) => s + (r.contact_information?.total_emails || 0), 0)} emails
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          🔍 {results.filter(r => r.contact_information?.regex_detected?.contact_found).length} pattern detected
                        </span>
                      </div>
                    )}

                    {/* Download buttons — compact row */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => downloadResumes("basic")} disabled={loading}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <Download size={13} /> Resume PDFs
                      </button>
                      <button onClick={() => downloadPDFCertificates("basic")} disabled={loading}
                        className="flex items-center gap-1.5 bg-[#ff004f] hover:bg-[#e60047] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileDown size={13} /> Certificates
                      </button>
                      <button onClick={() => downloadExcelReport("basic")} disabled={loading}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileSpreadsheet size={13} /> Excel
                      </button>
                      <button onClick={() => downloadReport("basic", results)} disabled={loading}
                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileText size={13} /> Text
                      </button>
                      <button onClick={() => downloadAll("basic")} disabled={loading}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <Download size={13} /> Full Package
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {results.map((res, idx) => renderResumeCard(res, idx, "basic"))}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Results */}
              {enhancedResults.length > 0 && (
                <div className="bg-white rounded-2xl shadow-md border overflow-hidden">
                  {/* Results Header */}
                  <div className="px-4 py-3 border-b bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-800"></span>
                      <h2 className="text-sm font-bold text-gray-800">Enhanced Screening Results</h2>
                      <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                        {enhancedResults.length} candidate{enhancedResults.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    {/* Contact Summary — compact pills */}
                    {enhancedResults.some(r => r.contact_information) && (
                      <div className="flex flex-wrap gap-2 p-3 bg-green-50 border border-green-100 rounded-xl">
                        <span className="text-xs font-semibold text-green-700 flex items-center gap-1 mr-1">
                          <Shield size={12} /> Contacts:
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          ✓ {enhancedResults.filter(r => r.contact_information?.contact_completeness === 'COMPLETE').length} complete
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          📞 {enhancedResults.reduce((s, r) => s + (r.contact_information?.total_phones || 0), 0)} phones
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          ✉ {enhancedResults.reduce((s, r) => s + (r.contact_information?.total_emails || 0), 0)} emails
                        </span>
                        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          🔍 {enhancedResults.filter(r => r.contact_information?.regex_detected?.contact_found).length} pattern detected
                        </span>
                      </div>
                    )}

                    {/* Download buttons — compact row */}
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => downloadResumes("enhanced")} disabled={loading || enhancedLoading}
                        className="flex items-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <Download size={13} /> Resume PDFs
                      </button>
                      <button onClick={() => downloadPDFCertificates("enhanced")} disabled={loading || enhancedLoading}
                        className="flex items-center gap-1.5 bg-[#ff004f] hover:bg-[#e60047] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileDown size={13} /> Certificates
                      </button>
                      <button onClick={() => downloadExcelReport("enhanced")} disabled={loading || enhancedLoading}
                        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileSpreadsheet size={13} /> Excel
                      </button>
                      <button onClick={() => downloadReport("enhanced", enhancedResults)} disabled={loading || enhancedLoading}
                        className="flex items-center gap-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <FileText size={13} /> Text
                      </button>
                      <button onClick={() => downloadAll("enhanced")} disabled={loading || enhancedLoading}
                        className="flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        <Download size={13} /> Full Package
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="space-y-3">
                      {enhancedResults.map((res, idx) => renderResumeCard(res, idx, "enhanced"))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
