"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload, Loader2, Sparkles, CheckCircle, XCircle, FileDown,
  ChevronDown, ChevronUp, AlertCircle, X, User, FileText,
  GraduationCap, Brain, Shield, BarChart3, Award,
} from "lucide-react";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import { useOrgState } from "../../context/OrgStateContext";

/* ----- MODALS ----- */
function Modal({ isOpen, onClose, children, title }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition"><X size={24} /></button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">{children}</div>
      </motion.div>
    </div>
  );
}
function SuccessModal({ isOpen, onClose, message }) {
  return (<Modal isOpen={isOpen} onClose={onClose} title="Success"><div className="text-center space-y-4">
    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-200"><CheckCircle size={40} className="text-white" /></div>
    <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
    <button onClick={onClose} className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Continue</button>
  </div></Modal>);
}
function ErrorModal({ isOpen, onClose, message, details }) {
  return (<Modal isOpen={isOpen} onClose={onClose} title="Error"><div className="text-center space-y-4">
    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-red-400 to-rose-500 flex items-center justify-center shadow-lg shadow-red-200"><XCircle size={40} className="text-white" /></div>
    <h4 className="text-2xl font-bold text-gray-900">{message}</h4>
    {details && <div className="text-left bg-red-50 p-4 rounded-xl border border-red-200"><p className="text-sm text-red-700">{details}</p></div>}
    <button onClick={onClose} className="bg-gradient-to-r from-red-500 to-rose-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all">Close</button>
  </div></Modal>);
}

/* ----- CERTIFICATE FOR PDF ----- */
function EducationCertificateBase({ id, candidate, orgName, ai }) {
  const positives = ai?.positive_findings || [];
  const redflags = ai?.red_flags || [];
  return (
    <div id={id} style={{ width: "794px", minHeight: "1123px", padding: "10px 50px 80px 50px", background: "#fff", fontFamily: "Arial, sans-serif", color: "#000", position: "relative" }}>
      <img src="/logos/tfgLogo.jpeg" alt="watermark" style={{ position: "absolute", top: "320px", left: "50%", transform: "translateX(-50%)", opacity: 0.08, width: "750px", height: "750px", objectFit: "contain", pointerEvents: "none", zIndex: 1 }} />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", gap: "35px", alignItems: "flex-start", marginBottom: "25px" }}>
          <img src="/logos/tfgLogo.jpeg" alt="logo" style={{ maxHeight: "180px", maxWidth: "450px", objectFit: "contain", marginTop: "10px" }} />
          <div style={{ marginTop: "55px" }}><h1 style={{ fontSize: "26px", fontWeight: 900, margin: 0, fontFamily: "Arial Black" }}>Education</h1><h2 style={{ fontSize: "26px", fontWeight: 900, margin: 0, fontFamily: "Arial Black" }}>Verification Report</h2></div>
        </div>
        <div style={{ fontSize: "15px", lineHeight: "28px", marginBottom: "40px" }}>
          <p><b>Candidate Name:</b> {candidate?.firstName} {candidate?.lastName}</p>
          <p><b>Candidate ID:</b> {candidate?._id}</p>
          <p><b>Organization:</b> {orgName}</p>
          <p><b>Degree:</b> {ai?.degree_type || "N/A"}</p>
          <p><b>Field of Study:</b> {ai?.field_of_study || "N/A"}</p>
          <p><b>Institution:</b> {ai?.institution_name || "N/A"}</p>
          <p><b>Board/University:</b> {ai?.board_university || "N/A"}</p>
          <p><b>Duration:</b> {ai?.start_date || "-"} to {ai?.end_date || "-"} ({ai?.duration_years || "N/A"} years)</p>
          <p style={{ display: "flex", gap: "10px", alignItems: "center" }}><b>Status:</b><span style={{ color: "#5cb85c", fontWeight: "bold" }}>✓ Completed</span></p>
        </div>
        <div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}><div style={{ width: "38px", height: "18px", background: "#5cb85c", borderRadius: "5px" }} /><div style={{ height: "4px", background: "#5cb85c", width: "22%", marginLeft: "10px", borderRadius: "2px" }} /></div>
        {positives.length > 0 && <div style={{ marginBottom: "35px" }}>{positives.map((item, i) => <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}><span style={{ fontSize: "18px" }}>✓</span><span>{item}</span></div>)}</div>}
        {redflags.length > 0 && (<><div style={{ display: "flex", alignItems: "center", marginBottom: "18px" }}><div style={{ width: "38px", height: "18px", background: "#d9534f", borderRadius: "5px" }} /><div style={{ height: "4px", background: "#d9534f", width: "22%", marginLeft: "10px", borderRadius: "2px" }} /></div>
        {redflags.map((rf, i) => <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}><span style={{ color: "#d9534f", fontSize: "18px" }}>•</span><span>{rf.issue || rf.description || rf}</span></div>)}</>)}
      </div>
      <div style={{ position: "absolute", bottom: "20px", left: "50px", right: "50px", textAlign: "center" }}>
        <div style={{ height: "2px", background: "#dc3545", marginBottom: "10px" }} />
        <p style={{ fontSize: "12px", color: "#dc3545", fontWeight: 600, margin: 0 }}>TFG AI powered IT solutions, T-Hub 4th floor Plot No 1/C, Sy No 83/1, Raidurgam panmaktha Hyderabad Knowledge City, Serilingampally, Hyderabad, Telangana 500081<br />📞 8886099008 | ✉ naresh@tfgorg.com | 🔗 <a href="https://www.linkedin.com/company/threshing-floor-group/" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>LinkedIn</a> | 🌐 <a href="https://www.tfgorg.com" target="_blank" style={{ color: "#dc3545", textDecoration: "underline" }}>www.tfgorg.com</a></p>
      </div>
    </div>
  );
}

/* ----- MAIN PAGE ----- */
export default function OrgAIEducationValidationPage() {
  const router = useRouter();
  const { aiEduVerificationState = {}, setAiEduVerificationState = () => {} } = useOrgState();

  const [currentOrg, setCurrentOrg] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [verificationId, setVerificationId] = useState("");
  const [documentFile, setDocumentFile] = useState(null);
  const [analysis, setAnalysis] = useState(aiEduVerificationState.analysis || null);
  const [finalRemarks, setFinalRemarks] = useState(aiEduVerificationState.finalRemarks || "");
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

  useEffect(() => { return () => { setAiEduVerificationState({ analysis, finalRemarks }); }; }, [analysis, finalRemarks]);
  useEffect(() => { fetch(`/api/proxy/secure/getOrganizations`, { credentials: "include" }).then(r => r.json()).then(d => { if (d.organizations?.length) setCurrentOrg(d.organizations[0]); }).catch(() => {}); }, []);
  useEffect(() => { setLoadingCandidates(true); fetch(`/api/proxy/secure/getCandidates`, { credentials: "include" }).then(r => r.json()).then(d => setCandidates(d.candidates || [])).catch(err => setErrorModal({ isOpen: true, message: "Failed to load candidates", details: err.message })).finally(() => setLoadingCandidates(false)); }, []);

  const fetchVerification = async (candId) => {
    setAnalysis(null); setLoadingResults(true);
    try {
      const res = await fetch(`/api/proxy/secure/getVerifications?candidateId=${candId}`, { credentials: "include" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const ver = data.verifications?.[0];
      if (!ver) { setErrorModal({ isOpen: true, message: "No verification found", details: "This candidate has no active verification." }); return; }
      setVerificationId(ver._id);
      const allChecks = [...(ver.stages?.primary || []), ...(ver.stages?.secondary || []), ...(ver.stages?.final || [])];
      const eduCheck = allChecks.find(c => c.check === "ai_education_validation");
      if (eduCheck) { setCheckStatus(eduCheck.status); if (eduCheck.status !== "PENDING") loadResults(ver._id); }
    } catch (err) { setErrorModal({ isOpen: true, message: "Failed to load verification", details: err.message }); }
    finally { setLoadingResults(false); }
  };

  const runValidation = async () => {
    if (!selectedCandidate) return setErrorModal({ isOpen: true, message: "No Candidate Selected", details: "Select candidate first." });
    if (!documentFile) return setErrorModal({ isOpen: true, message: "Upload Required", details: "Please upload the education document." });
    if (!verificationId) return setErrorModal({ isOpen: true, message: "Missing Verification", details: "No verification found for this candidate." });
    setLoadingValidation(true);
    try {
      const fd = new FormData(); fd.append("verificationId", verificationId); fd.append("educationDocument", documentFile);
      const res = await fetch(`/api/proxy/secure/ai_education_validation`, { method: "POST", credentials: "include", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setAnalysis({ analysis: data.analysis });
      setSuccessModal({ isOpen: true, message: "Education Validation Completed!" });
    } catch (err) { setErrorModal({ isOpen: true, message: "Validation Failed", details: err.message }); }
    finally { setLoadingValidation(false); }
  };

  const loadResults = async (vId) => {
    setLoadingResults(true);
    try { const res = await fetch(`/api/proxy/secure/ai_education_validation_results/${vId}`, { credentials: "include" }); if (!res.ok) throw new Error(await res.text()); setAnalysis(await res.json()); }
    catch (err) { setErrorModal({ isOpen: true, message: "Failed to load results", details: err.message }); }
    finally { setLoadingResults(false); }
  };

  const submitDecision = async (status) => {
    if (!verificationId) return setErrorModal({ isOpen: true, message: "Missing Verification ID", details: "Cannot submit decision." });
    setSubmittingFinal(true);
    try {
      const body = new URLSearchParams(); body.append("verificationId", verificationId); body.append("final_status", status); body.append("staff_remarks", finalRemarks);
      const res = await fetch(`/api/proxy/secure/submit_ai_education_validation`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
      if (!res.ok) throw new Error(await res.text());
      setCheckStatus(status);
      setSuccessModal({ isOpen: true, message: `Education Validation Marked as ${status}` });
    } catch (err) { setErrorModal({ isOpen: true, message: "Submission Failed", details: err.message }); }
    finally { setSubmittingFinal(false); }
  };

  const exportPDF = async () => {
    try {
      const input = pdfRef.current; if (!input) return;
      const canvas = await safeHtml2Canvas(input, { scale: 2 });
      const img = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "pt", "a4");
      const width = pdf.internal.pageSize.getWidth();
      pdf.addImage(img, "JPEG", 0, 0, width, (canvas.height * width) / canvas.width);
      pdf.save("AI-Education-Report.pdf");
      setSuccessModal({ isOpen: true, message: "PDF Exported!" });
    } catch (err) { setErrorModal({ isOpen: true, message: "PDF Export Failed", details: err.message }); }
  };

  const aiData = analysis?.analysis || analysis?.aiAnalysis || analysis;

  return (
    <>
      <SuccessModal isOpen={successModal.isOpen} onClose={() => setSuccessModal({ isOpen: false, message: "" })} message={successModal.message} />
      <ErrorModal isOpen={errorModal.isOpen} onClose={() => setErrorModal({ isOpen: false, message: "", details: "" })} message={errorModal.message} details={errorModal.details} />
      {navigating && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"><div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4"><Loader2 className="animate-spin text-indigo-600" size={48} /><p className="text-lg font-semibold">Please wait...</p></div></div>)}

      {analysis && selectedCandidate && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "794px", minHeight: "1123px", opacity: 0, pointerEvents: "none", zIndex: -9999 }}>
          <div ref={pdfRef}><EducationCertificateBase id="edu-cert" candidate={selectedCandidate} orgName={currentOrg?.organizationName || "Organization"} ai={aiData} /></div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  AI Education Verification
                  <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 text-[10px] font-bold rounded-md border border-indigo-200">
                    <Sparkles className="w-3 h-3 inline mr-0.5" />AI
                  </span>
                </h1>
                <p className="text-xs text-gray-400">Validate education certificates using AI-powered analysis</p>
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
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center"><User size={12} className="text-white" /></div>
                  Selection Panel
                </h2>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Candidate <span className="text-red-500">*</span></label>
                  <select className="w-full p-2.5 border border-gray-200 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition text-sm text-gray-900 bg-gray-50/50"
                    value={selectedCandidate?._id || ""}
                    onChange={(e) => { const c = candidates.find(x => x._id === e.target.value); setSelectedCandidate(c); setAnalysis(null); setDocumentFile(null); if (c) fetchVerification(c._id); }}
                    disabled={loadingCandidates}>
                    <option value="">{loadingCandidates ? "Loading..." : "-- Select Candidate --"}</option>
                    {candidates.map(c => <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>)}
                  </select>
                </div>

                {selectedCandidate && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 p-4 border border-indigo-100 rounded-xl text-xs space-y-1.5">
                    <h3 className="font-bold text-gray-800 text-xs flex items-center gap-1.5"><FileText size={12} className="text-indigo-500" /> Details</h3>
                    <p className="text-gray-600"><span className="font-semibold text-gray-700">Name:</span> {selectedCandidate.firstName} {selectedCandidate.lastName}</p>
                    {selectedCandidate.email && <p className="text-gray-600"><span className="font-semibold text-gray-700">Email:</span> {selectedCandidate.email}</p>}
                  </motion.div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Upload Education Certificate <span className="text-red-500">*</span></label>
                  <label className="cursor-pointer flex flex-col items-center gap-2 bg-gray-50/80 border-2 border-dashed border-gray-200 p-4 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/30 transition group">
                    <Upload size={20} className="text-gray-400 group-hover:text-indigo-500 transition" />
                    <span className="text-xs text-gray-500 group-hover:text-indigo-600 font-medium text-center transition">
                      {documentFile ? <span className="text-indigo-600 font-semibold">{documentFile.name}</span> : <><span className="font-semibold block">Click to upload</span><span className="text-[10px] text-gray-400">PDF, JPG, PNG (Max 10MB)</span></>}
                    </span>
                    <input type="file" accept=".pdf,.jpg,.png,.jpeg" className="hidden" onChange={(e) => setDocumentFile(e.target.files[0])} />
                  </label>
                  {documentFile && <button onClick={() => setDocumentFile(null)} className="mt-1.5 text-[10px] text-red-500 hover:text-red-700 font-medium">Remove file</button>}
                </div>

                <button onClick={runValidation} disabled={loadingValidation || !selectedCandidate || !documentFile}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:shadow-md">
                  {loadingValidation ? (<><Loader2 className="animate-spin" size={16} /> Processing...</>) : (<><Sparkles size={16} /> Run AI Validation</>)}
                </button>
              </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="lg:col-span-2">
              {loadingResults ? (
                <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500" size={40} /><p className="text-sm text-gray-500 font-medium">Loading results...</p>
                </div>
              ) : analysis && aiData ? (
                <ResultsSection ai={aiData} expanded={expanded} setExpanded={setExpanded} finalRemarks={finalRemarks} setFinalRemarks={setFinalRemarks} submitDecision={submitDecision} exportPDF={exportPDF} submittingFinal={submittingFinal} checkStatus={checkStatus} />
              ) : (
                <div className="bg-white/80 backdrop-blur-sm p-12 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center"><GraduationCap className="text-indigo-400" size={28} /></div>
                  <h3 className="text-base font-bold text-gray-900">No Analysis Yet</h3>
                  <p className="text-xs text-gray-400 max-w-sm">Select a candidate, upload their education certificate, then run AI validation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ----- RESULTS SECTION ----- */
function ResultsSection({ ai, expanded, setExpanded, finalRemarks, setFinalRemarks, submitDecision, exportPDF, submittingFinal, checkStatus }) {
  const toggle = (key) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const score = ai?.authenticity_score ?? ai?.score ?? 0;
  const status = ai?.verification_status || ai?.status || "PENDING";
  const summary = ai?.summary || ai?.recommendation || "";
  const recommendation = ai?.recommendation || "";
  const positives = ai?.positive_findings || ai?.verifiedDetails || ai?.strengths || [];
  const redFlags = ai?.red_flags || ai?.weaknesses || [];
  const scoreColor = score >= 70 ? "emerald" : score >= 40 ? "amber" : "red";

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

      {/* Score Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-violet-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-base font-bold flex items-center gap-2"><GraduationCap size={18} /> Education Analysis</h2>
              <p className="text-indigo-100 text-xs mt-0.5">AI-powered education certificate validation</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${checkStatus === "COMPLETED" ? "bg-emerald-400/20 text-emerald-100 border-emerald-300/30" : checkStatus === "FAILED" ? "bg-red-400/20 text-red-100 border-red-300/30" : "bg-white/20 text-white border-white/30"}`}>
                {checkStatus === "COMPLETED" ? "✓ Approved" : checkStatus === "FAILED" ? "✗ Rejected" : "⏳ Pending"}
              </div>
              {checkStatus === "COMPLETED" && (
                <button onClick={exportPDF} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-bold rounded-lg border border-white/20 transition"><FileDown size={14} /> PDF</button>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex items-center gap-6 mb-4">
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
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${status === "VERIFIED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : status === "FAILED" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{status}</span>
              {recommendation && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200">{recommendation}</span>}
              {ai?.extracted_text_quality && <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Quality: {ai.extracted_text_quality}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Education Details */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2"><BarChart3 size={14} className="text-indigo-500" /> Education Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "Degree Type", value: ai?.degree_type },
            { label: "Field of Study", value: ai?.field_of_study },
            { label: "Institution", value: ai?.institution_name },
            { label: "Board/University", value: ai?.board_university },
            { label: "Start Date", value: ai?.start_date },
            { label: "End Date", value: ai?.end_date },
            { label: "Duration", value: ai?.duration_years ? `${ai.duration_years} years` : null },
            { label: "Grade/Class", value: ai?.grade },
            { label: "Document Type", value: ai?.document_type?.replace(/_/g, " ") },
          ].filter(f => f.value && f.value !== "Not Specified").map((f, i) => (
            <div key={i} className="bg-gray-50/50 p-3 rounded-lg border border-gray-100">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">{f.label}</p>
              <p className="text-xs font-semibold text-gray-800">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText size={14} className="text-indigo-500" /> Summary</h3>
          <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
        </div>
      )}

      {/* Findings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CollapsibleSection title="Positive Findings" list={positives} keyName="positive" expanded={expanded} toggle={toggle} color="green" />
        <CollapsibleSection title="Red Flags & Issues" list={redFlags.map(f => typeof f === "string" ? f : `[${f.severity}] ${f.issue || f.description}`)} keyName="redFlags" expanded={expanded} toggle={toggle} color="red" />
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

/* ----- COLLAPSIBLE SECTION ----- */
function CollapsibleSection({ title, list, expanded, toggle, keyName, color }) {
  if (!list || list.length === 0) return null;
  const isOpen = expanded[keyName];
  const styles = {
    green: { bg: "bg-emerald-50/50", border: "border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400", header: "text-emerald-800" },
    red: { bg: "bg-red-50/50", border: "border-red-100", text: "text-red-700", dot: "bg-red-400", header: "text-red-800" },
  };
  const c = styles[color] || styles.green;
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border ${c.border} overflow-hidden`}>
      <div className={`flex justify-between items-center cursor-pointer p-4 ${c.bg} hover:opacity-80 transition`} onClick={() => toggle(keyName)}>
        <h3 className={`text-xs font-bold ${c.header} flex items-center gap-2`}><div className={`w-2 h-2 rounded-full ${c.dot}`} />{title} ({list.length})</h3>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </div>
      {isOpen && (
        <div className="p-4 pt-2 space-y-1.5">
          {list.map((item, i) => <div key={i} className={`text-xs ${c.text} flex items-start gap-2`}><div className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 flex-shrink-0`} />{item}</div>)}
        </div>
      )}
    </div>
  );
}
