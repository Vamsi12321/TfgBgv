"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
  FileDown,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  X,
  Building2,
  User,
  FileText,
  Shield,
  Phone,
  Mail,
  Brain,
  TrendingUp,
  Award,
  BarChart3,
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import { useOrgState } from "../../context/OrgStateContext";

/* -------------------------------------------------------------
   MODAL COMPONENTS
------------------------------------------------------------- */
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
      >
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </motion.div>
    </div>
  );
}

function SuccessModal({ isOpen, onClose, message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Success">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-200">
            <CheckCircle size={40} className="text-white" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
        <button onClick={onClose} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          Continue
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
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-200">
            <XCircle size={40} className="text-white" />
          </div>
        </div>
        <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
        {details && (
          <div className="text-left bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">{details}</p>
          </div>
        )}
        <button onClick={onClose} className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">
          Close
        </button>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------
   AI-CV CERTIFICATE BASE (PDF EXPORT)
------------------------------------------------------------- */
function CertificateBase({ id, candidate, orgName, ai, analysis }) {
  const positives = ai?.positive_findings || [];
  const redflags = ai?.red_flags || [];
  return (
    <div id={id} style={{ width: "794px", minHeight: "1123px", padding: "10px 50px 60px 50px", background: "#ffffff", fontFamily: "Arial, sans-serif", position: "relative", color: "#000", overflow: "hidden" }}>
      <img src="/logos/tfgLogo.jpeg" alt="watermark" style={{ position: "absolute", top: "300px", left: "50%", transform: "translateX(-50%)", opacity: 0.08, width: "750px", height: "750px", objectFit: "contain", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ position: "relative", zIndex: 2, marginTop: "-10px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "35px", marginBottom: "20px" }}>
          <div style={{ flexShrink: 0, marginTop: "5px" }}>
            <img src="/logos/tfgLogo.jpeg" alt="logo" style={{ maxHeight: "180px", maxWidth: "450px", objectFit: "contain" }} />
          </div>
          <div style={{ marginTop: "50px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "900", margin: 0, lineHeight: "1", fontFamily: "Arial Black, Arial, sans-serif" }}>AI CV</h1>
            <h2 style={{ fontSize: "26px", fontWeight: "900", margin: 0, lineHeight: "1", fontFamily: "Arial Black, Arial, sans-serif" }}>Verification Report</h2>
          </div>
        </div>
        <div style={{ fontSize: "15px", lineHeight: "28px", marginBottom: "5px", marginTop: "-20px" }}>
          <p><b>Candidate Name:</b> {candidate?.firstName} {candidate?.lastName}</p>
          <p><b>Candidate ID:</b> {candidate?._id}</p>
          <p><b>Organization:</b> {orgName}</p>
          <p><b>Verification Timestamp:</b> {new Date().toLocaleString()}</p>
          <p><b>Score:</b> {ai?.authenticity_score}/100</p>
          <p><b>Recommendation:</b> {ai?.recommendation}</p>
          {analysis?.candidateType && <p><b>Candidate Type:</b> {analysis.candidateType.replace(/_/g, " ")}</p>}
          {analysis?.hasUan !== undefined && <p><b>UAN Status:</b> {analysis.hasUan ? "Available" : "Not Available"}</p>}
          <p style={{ display: "flex", alignItems: "center", gap: "10px" }}><b>Status:</b><span style={{ color: "#5cb85c", fontWeight: "bold", fontSize: "16px" }}>✓ Completed</span></p>
        </div>
        <div style={{ width: "100%", height: "3px", background: "#000", margin: "20px 0 40px 0" }} />
        <div style={{ display: "flex", alignItems: "center", marginBottom: "25px" }}>
          <div style={{ width: "60px", height: "28px", background: "#5cb85c", borderRadius: "5px" }} />
          <div style={{ width: "25%", height: "2px", background: "#5cb85c", marginLeft: "10px" }} />
        </div>
        <div style={{ marginBottom: "30px" }}>
          {positives.map((item, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px", marginRight: "10px" }}>✓</span>
              <span style={{ fontSize: "14px" }}>{item}</span>
            </div>
          ))}
        </div>
        {ai?.contact_information && (
          <div style={{ marginBottom: "30px" }}>
            {ai.contact_information.phone_numbers?.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>📱 Phone Numbers Detected & Verified:</div>
                {ai.contact_information.phone_numbers.map((phone, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px", marginRight: "8px", color: "#28a745" }}>✓</span>
                    <span style={{ fontSize: "14px", fontFamily: "monospace" }}>{phone}</span>
                    <span style={{ fontSize: "12px", color: "#28a745", marginLeft: "10px" }}>(Verified)</span>
                  </div>
                ))}
              </div>
            )}
            {ai.contact_information.email_addresses?.length > 0 && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>📧 Email Addresses Detected & Verified:</div>
                {ai.contact_information.email_addresses.map((email, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "18px", marginRight: "8px", color: "#28a745" }}>✓</span>
                    <span style={{ fontSize: "14px", fontFamily: "monospace" }}>{email}</span>
                    <span style={{ fontSize: "12px", color: "#28a745", marginLeft: "10px" }}>(Verified)</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: "12px", color: "#666", marginTop: "10px" }}>Total Contacts Found: {ai.contact_information.total_phones} phone(s), {ai.contact_information.total_emails} email(s)</div>
          </div>
        )}
        {redflags.length > 0 && (
          <>
            <div style={{ display: "flex", alignItems: "center", marginBottom: "25px" }}>
              <div style={{ width: "60px", height: "28px", background: "#d9534f", borderRadius: "5px" }} />
              <div style={{ width: "25%", height: "2px", background: "#d9534f", marginLeft: "10px" }} />
            </div>
            {redflags.map((rf, i) => (
              <div key={i} style={{ display: "flex", marginBottom: "2px" }}>
                <span style={{ marginRight: "10px", fontSize: "18px", color: "#d9534f" }}>✓</span>
                <span style={{ fontSize: "14px" }}><b>{rf.severity}</b> — {rf.description}</span>
              </div>
            ))}
          </>
        )}
      </div>
      <div style={{ position: "absolute", bottom: "10px", left: "50px", right: "50px", textAlign: "center" }}>
        <div style={{ height: "2px", background: "#dc3545", marginBottom: "10px" }} />
        <p style={{ fontSize: "12px", color: "#dc3545", fontWeight: "600", margin: 0 }}>
          TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081
          <br />📞 8886099008 | ✉ naresh@tfgorg.com | 🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>LinkedIn</a> | 🌐 <a href="https://www.tfgorg.com" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>www.tfgorg.com</a>
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------
   MAIN PAGE
------------------------------------------------------------- */
export default function OrgAICVVerificationPage() {
  const router = useRouter();
  const { aiCvVerificationState = {}, setAiCvVerificationState = () => {} } = useOrgState();

  const [currentOrg, setCurrentOrg] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [verificationId, setVerificationId] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [finalRemarks, setFinalRemarks] = useState("");
  const [checkStatus, setCheckStatus] = useState("PENDING");
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [loadingValidation, setLoadingValidation] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [submittingFinal, setSubmittingFinal] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: "" });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "", details: "" });
  const pdfRef = useRef(null);

  useEffect(() => {
    if (aiCvVerificationState.analysis) setAnalysis(aiCvVerificationState.analysis);
    if (aiCvVerificationState.finalRemarks) setFinalRemarks(aiCvVerificationState.finalRemarks);
  }, []);

  useEffect(() => { return () => { setAiCvVerificationState({ analysis, finalRemarks }); }; }, [analysis, finalRemarks]);

  useEffect(() => {
    fetch(`/api/proxy/secure/getOrganizations`, { credentials: "include" })
      .then(r => r.json()).then(d => { if (d.organizations?.length) setCurrentOrg(d.organizations[0]); }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoadingCandidates(true);
    fetch(`/api/proxy/secure/getCandidates`, { credentials: "include" })
      .then(r => r.json()).then(d => setCandidates(d.candidates || []))
      .catch(err => setErrorModal({ isOpen: true, message: "Failed to Load Candidates", details: err.message }))
      .finally(() => setLoadingCandidates(false));
  }, []);

  const fetchVerification = async (candId) => {
    setAnalysis(null); setLoadingResults(true);
    try {
      const res = await fetch(`/api/proxy/secure/getVerifications?candidateId=${candId}`, { credentials: "include" });
      const data = await res.json();
      const ver = data.verifications?.[0];
      if (ver?.ai_cv_results_available) loadResults(ver._id);
    } catch (err) { setErrorModal({ isOpen: true, message: "Error Fetching Verification", details: err.message }); }
    finally { setLoadingResults(false); }
  };

  const runValidation = async () => {
    if (!selectedCandidate) { setErrorModal({ isOpen: true, message: "No Candidate Selected", details: "Please select a candidate first." }); return; }
    if (!resumeFile && !selectedCandidate.resumePath) { setErrorModal({ isOpen: true, message: "No Resume Available", details: "Please upload a resume or ensure candidate has an existing resume." }); return; }
    setLoadingValidation(true); setAnalysis(null);
    try {
      const fd = new FormData();
      fd.append("verificationId", verificationId);
      fd.append("candidateId", selectedCandidate._id);
      fd.append("panNumber", selectedCandidate.panNumber || "");
      if (resumeFile) fd.append("resume", resumeFile);
      const res = await fetch(`/api/proxy/secure/ai_cv_validation`, { method: "POST", credentials: "include", body: fd });
      if (!res.ok) { const errorText = await res.text(); throw new Error(`${res.status}: ${errorText}`); }
      const data = await res.json();
      if (data.verificationId) { setVerificationId(data.verificationId); setAnalysis(data); setSuccessModal({ isOpen: true, message: "Validation Complete!" }); }
      else throw new Error(data.message || "Validation failed");
    } catch (error) { setErrorModal({ isOpen: true, message: "Validation Failed", details: error.message }); }
    finally { setLoadingValidation(false); }
  };

  const loadResults = async (vId) => {
    setLoadingResults(true);
    try {
      const res = await fetch(`/api/proxy/secure/ai_cv_validation_results/${vId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAnalysis(await res.json());
    } catch (error) { setErrorModal({ isOpen: true, message: "Failed to Load Results", details: error.message }); }
    finally { setLoadingResults(false); }
  };

  const submitDecision = async (status) => {
    if (!verificationId) { setErrorModal({ isOpen: true, message: "Missing Verification ID", details: "Cannot submit decision without verification ID." }); return; }
    setSubmittingFinal(true);
    try {
      const body = new URLSearchParams();
      body.append("verificationId", verificationId);
      body.append("candidateId", selectedCandidate._id);
      body.append("final_status", status);
      body.append("staff_remarks", finalRemarks);
      const res = await fetch(`/api/proxy/secure/submit_ai_cv_validation`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setCheckStatus(status);
      setSuccessModal({ isOpen: true, message: `Decision Submitted: ${status}` });
    } catch (error) { setErrorModal({ isOpen: true, message: "Submission Failed", details: error.message }); }
    finally { setSubmittingFinal(false); }
  };

  const exportPDF = async () => {
    try {
      const input = pdfRef.current;
      if (!input) { setErrorModal({ isOpen: true, message: "Nothing to Export", details: "No analysis results available." }); return; }
      const canvas = await safeHtml2Canvas(input, { scale: 2 });
      const jpeg = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = (canvas.height * pageWidth) / canvas.width;
      pdf.addImage(jpeg, "JPEG", 0, 0, pageWidth, pageHeight);
      pdf.save(`AI-CV-${selectedCandidate?.firstName || "report"}.pdf`);
      setSuccessModal({ isOpen: true, message: "PDF Exported Successfully!" });
    } catch (err) { setErrorModal({ isOpen: true, message: "PDF Generation Failed", details: err.message }); }
  };

  const ai = analysis?.aiAnalysis || analysis?.analysis;

  return (
    <>
      <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, message: "" })} message={successModal.message} />
      <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ isOpen: false, message: "", details: "" })} message={errorModal.message} details={errorModal.details} />

      {navigating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
            <p className="text-lg font-semibold text-gray-900">Please wait...</p>
          </div>
        </div>
      )}

      {analysis && selectedCandidate && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "794px", minHeight: "1123px", zIndex: -9999, opacity: 0, pointerEvents: "none" }}>
          <div ref={pdfRef} style={{ background: "#fff" }}>
            <CertificateBase id="ai-cv-cert" candidate={selectedCandidate} orgName={currentOrg?.organizationName || "Organization"} ai={ai} analysis={analysis} />
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  AI CV Verification
                  <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-200">
                    <Sparkles className="w-3 h-3 inline mr-0.5" />AI
                  </span>
                </h1>
                <p className="text-xs text-gray-400">Validate candidate resumes for authenticity & consistency</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-700">System Online</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT PANEL */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-gray-100/80 space-y-5 sticky top-6">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                  Selection Panel
                </h2>

                {/* Candidate Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Candidate <span className="text-red-500">*</span></label>
                  <select
                    className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition text-sm text-gray-900 bg-gray-50/50"
                    value={selectedCandidate?._id || ""}
                    onChange={(e) => {
                      const cand = candidates.find((c) => c._id === e.target.value);
                      setSelectedCandidate(cand); setAnalysis(null); setResumeFile(null); setVerificationId(""); setFinalRemarks(""); setExpanded({});
                      if (cand) fetchVerification(cand._id);
                    }}
                    disabled={loadingCandidates}
                  >
                    <option value="">-- Select Candidate --</option>
                    {candidates.map((c) => (<option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>))}
                  </select>
                  {loadingCandidates && <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Loader2 size={10} className="animate-spin" />Loading...</p>}
                </div>

                {/* Candidate Details Card */}
                {selectedCandidate && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-4 border border-indigo-100 rounded-xl text-xs space-y-2">
                    <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5">
                      <FileText size={12} className="text-indigo-500" /> Details
                    </h3>
                    <div className="space-y-1.5 text-gray-600">
                      <p><span className="font-semibold text-gray-700">Name:</span> {selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                      <p><span className="font-semibold text-gray-700">PAN:</span> {selectedCandidate.panNumber || "—"}</p>
                      <p><span className="font-semibold text-gray-700">Aadhaar:</span> {selectedCandidate.aadhaarNumber || "—"}</p>
                      <p className="flex items-center gap-1">
                        <span className="font-semibold text-gray-700">Resume:</span>
                        {selectedCandidate.resumePath
                          ? <span className="text-emerald-600 font-semibold flex items-center gap-0.5"><CheckCircle size={10} /> Uploaded</span>
                          : <span className="text-red-500 font-semibold flex items-center gap-0.5"><XCircle size={10} /> Not Uploaded</span>}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Resume Upload */}
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Upload Resume (Optional)</label>
                  <label className="cursor-pointer flex items-center justify-center gap-2 bg-gray-50/80 border-2 border-dashed border-gray-200 p-3 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition group">
                    <Upload size={16} className="text-gray-400 group-hover:text-indigo-500 transition" />
                    <span className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium transition">
                      {resumeFile ? resumeFile.name : "Choose File (.pdf, .doc, .docx)"}
                    </span>
                    <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => setResumeFile(e.target.files[0])} />
                  </label>
                  {resumeFile && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-emerald-600 text-[10px] font-semibold">
                      <CheckCircle size={12} /> {resumeFile.name}
                    </div>
                  )}
                </div>

                {/* Run Button */}
                <button onClick={runValidation} disabled={loadingValidation || !selectedCandidate}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-md">
                  {loadingValidation ? (<><Loader2 className="animate-spin" size={16} /> Validating...</>) : (<><Sparkles size={16} /> Run AI Validation</>)}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="lg:col-span-2">
              {loadingResults ? (
                <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500" size={40} />
                  <p className="text-sm text-gray-500 font-medium">Loading analysis results...</p>
                </div>
              ) : analysis && ai ? (
                <ResultsSection ai={ai} analysis={analysis} expanded={expanded} setExpanded={setExpanded} finalRemarks={finalRemarks} setFinalRemarks={setFinalRemarks} submitDecision={submitDecision} exportPDF={exportPDF} submittingFinal={submittingFinal} checkStatus={checkStatus} />
              ) : (
                <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                    <Brain className="text-indigo-400" size={28} />
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No Analysis Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">Select a candidate and click "Run AI Validation" to see the analysis results here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* --------------------------------------------------------------------
   RESULTS SECTION — Enhanced Blue Theme
-------------------------------------------------------------------- */
function ResultsSection({ ai, analysis, expanded, setExpanded, finalRemarks, setFinalRemarks, submitDecision, exportPDF, submittingFinal, checkStatus }) {
  const toggle = (key) => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const score = ai.authenticity_score || 0;
  const scoreColor = score >= 70 ? "emerald" : score >= 40 ? "amber" : "red";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Score Overview Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-base font-bold flex items-center gap-2">
                <Award size={18} /> AI Analysis Results
              </h2>
              <p className="text-indigo-100 text-xs mt-0.5">Comprehensive CV authenticity analysis</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                checkStatus === "COMPLETED" ? "bg-emerald-400/20 text-emerald-100 border-emerald-300/30"
                : checkStatus === "FAILED" ? "bg-red-400/20 text-red-100 border-red-300/30"
                : "bg-white/20 text-white border-white/30"
              }`}>
                {checkStatus === "COMPLETED" ? "✓ Approved" : checkStatus === "FAILED" ? "✗ Rejected" : "⏳ Pending"}
              </div>
              {checkStatus === "COMPLETED" && (
                <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg border border-white/20 transition">
                  <FileDown size={14} /> PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Score + Badges */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-6 mb-4">
            {/* Score Circle */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                <circle cx="18" cy="18" r="15" fill="none" stroke={score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="3" strokeDasharray={`${(score / 100) * 94.2} 94.2`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-lg font-black text-${scoreColor}-600`}>{score}</span>
                <span className="text-[8px] text-gray-400 font-bold">/100</span>
              </div>
            </div>
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                ai.recommendation === "APPROVED" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : ai.recommendation === "REVIEW_REQUIRED" ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-red-50 text-red-700 border-red-200"
              }`}>{ai.recommendation}</span>
              {analysis.candidateType && (
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">{analysis.candidateType.replace(/_/g, " ")}</span>
              )}
              {analysis.hasUan !== undefined && (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${analysis.hasUan ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}>
                  UAN: {analysis.hasUan ? "Available" : "N/A"}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* UAN Verification */}
      {(analysis.hasUan !== undefined || analysis.uanVerificationNote) && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Shield size={14} className="text-indigo-500" /> UAN Verification
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            {analysis.uanNumber && <p><span className="font-semibold">UAN:</span> {analysis.uanNumber}</p>}
            <p><span className="font-semibold">Available:</span> <span className={`ml-1 px-2 py-0.5 rounded text-[10px] font-bold ${analysis.hasUan ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{analysis.hasUan ? "Yes" : "No"}</span></p>
            {analysis.uanVerificationNote && <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2"><p className="text-xs text-indigo-700">{analysis.uanVerificationNote}</p></div>}
          </div>
        </div>
      )}

      {/* Summary */}
      {ai.summary && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText size={14} className="text-indigo-500" /> AI Summary
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">{ai.summary}</p>
        </div>
      )}

      {/* Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleSection title="Positive Findings" list={ai.positive_findings} keyName="positive" expanded={expanded} toggle={toggle} color="green" />
        <CollapsibleSection title="Negative Findings" list={ai.negative_findings} keyName="negative" expanded={expanded} toggle={toggle} color="red" />
      </div>

      <CollapsibleSection title="Red Flags" list={ai.red_flags?.map((rf) => `${rf.severity} — ${rf.description}`)} keyName="redflags" expanded={expanded} toggle={toggle} color="red" />

      {/* Detailed Analysis */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <BarChart3 size={14} className="text-indigo-500" /> Detailed Analysis
        </h3>

        {ai.education_analysis && (
          <AnalysisCard title="Education" score={ai.education_analysis.education_score} entries={ai.education_analysis.education_entries} warning={ai.education_analysis.overlaps_detected ? "Overlaps detected in education timeline" : null} />
        )}
        {ai.employment_analysis && (
          <AnalysisCard title="Employment" score={ai.employment_analysis.employment_score} entries={ai.employment_analysis.employment_entries} warning={ai.employment_analysis.gaps_detected ? ai.employment_analysis.gap_details?.[0] : null} />
        )}
        {ai.timeline_analysis && (
          <AnalysisCard title="Timeline" score={ai.timeline_analysis.timeline_score} entries={ai.timeline_analysis.timeline_issues} warning={!ai.timeline_analysis.timeline_consistent ? "Timeline inconsistencies detected" : null} />
        )}

        {/* Contact Information */}
        {ai.contact_information && (
          <div className="border border-indigo-100 rounded-xl p-4 bg-gradient-to-br from-indigo-50/30 to-blue-50/30">
            <h4 className="text-xs font-bold text-indigo-700 mb-3 flex items-center gap-2"><Phone size={12} /> Contact Verification</h4>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                <p className="text-lg font-bold text-indigo-600">{ai.contact_information.contact_score}/100</p>
                <p className="text-[10px] text-gray-500">Contact Score</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-indigo-100 text-center">
                <p className="text-lg font-bold text-indigo-600">{ai.contact_information.total_phones + ai.contact_information.total_emails}</p>
                <p className="text-[10px] text-gray-500">Total Contacts</p>
              </div>
            </div>
            {ai.contact_information.phone_numbers?.length > 0 && (
              <div className="space-y-1.5 mb-2">
                {ai.contact_information.phone_numbers.map((p, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 text-xs">
                    <span className="font-mono text-gray-700">{p}</span>
                    <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5"><CheckCircle size={10} /> Verified</span>
                  </div>
                ))}
              </div>
            )}
            {ai.contact_information.email_addresses?.length > 0 && (
              <div className="space-y-1.5">
                {ai.contact_information.email_addresses.map((e, i) => (
                  <div key={i} className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100 text-xs">
                    <span className="font-mono text-gray-700">{e}</span>
                    <span className="text-emerald-600 font-bold text-[10px] flex items-center gap-0.5"><CheckCircle size={10} /> Verified</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Remarks + Actions */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        <div>
          <label className="text-xs font-bold text-gray-700 mb-1.5 block">Admin Remarks</label>
          <textarea rows={3} className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-900 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition resize-none" value={finalRemarks} onChange={(e) => setFinalRemarks(e.target.value)} placeholder="Write your review notes…" />
        </div>
        <div className="flex gap-3">
          <button onClick={() => submitDecision("COMPLETED")} disabled={submittingFinal}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-bold shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
            {submittingFinal ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Approve
          </button>
          <button onClick={() => submitDecision("FAILED")} disabled={submittingFinal}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white text-sm font-bold shadow-lg shadow-red-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2">
            {submittingFinal ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />} Reject
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* --------------------------------------------------------------------
   UTILITY COMPONENTS
-------------------------------------------------------------------- */
function AnalysisCard({ title, score, entries, warning }) {
  return (
    <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-bold text-gray-700">{title} Analysis</h4>
        {score !== undefined && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${score >= 70 ? "bg-emerald-100 text-emerald-700" : score >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
            {score}/100
          </span>
        )}
      </div>
      {entries?.length > 0 && (
        <ul className="space-y-1 text-xs text-gray-600">
          {entries.map((e, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-indigo-400 mt-0.5">•</span>{e}</li>)}
        </ul>
      )}
      {warning && <p className="text-xs text-red-600 mt-2 flex items-center gap-1"><AlertCircle size={12} /> {warning}</p>}
    </div>
  );
}

function CollapsibleSection({ title, list, expanded, toggle, keyName, color }) {
  if (!list || list.length === 0) return null;
  const isOpen = expanded[keyName];
  const colorMap = {
    green: { bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400", header: "text-emerald-800" },
    red: { bg: "bg-red-50/50", border: "border-red-100", text: "text-red-700", dot: "bg-red-400", header: "text-red-800" },
  };
  const c = colorMap[color] || colorMap.green;

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border ${c.border} overflow-hidden`}>
      <div className={`flex justify-between items-center cursor-pointer p-4 ${c.bg} hover:opacity-80 transition`} onClick={() => toggle(keyName)}>
        <h3 className={`text-xs font-bold ${c.header} flex items-center gap-2`}>
          <div className={`w-2 h-2 rounded-full ${c.dot}`} />
          {title} ({list.length})
        </h3>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
      {isOpen && (
        <div className="p-4 pt-2 space-y-1.5">
          {list.map((item, i) => (
            <div key={i} className={`text-xs ${c.text} flex items-start gap-2`}>
              <div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
