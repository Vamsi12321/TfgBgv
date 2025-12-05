"use client";

import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Download,
  FileText,
  Building2,
  CheckCircle,
  XCircle,
  Brain,
} from "lucide-react";

import { jsPDF } from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";
import { useOrgState } from "../../context/OrgStateContext";

/* ----------------------------------------------- */
/* 🔗 API BASE */
/* ----------------------------------------------- */


/* ----------------------------------------------- */
/* SERVICE ICONS */
/* ----------------------------------------------- */
const SERVICE_ICONS = {
  pan_aadhaar_seeding: "🪪",
  pan_verification: "📄",
  employment_history: "👔",
  aadhaar_to_uan: "🔗",
  credit_report: "💳",
  court_record: "⚖️",
};

/* ----------------------------------------------- */
const formatServiceName = (raw = "") =>
  raw
    .toLowerCase()
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const isAIValidationCheck = (checkName) => {
  return checkName === "ai_cv_validation" || checkName === "ai_education_validation";
};

const getServiceCertId = (stage, checkName, candId) =>
  `cert-${stage}-${checkName.replace(/[^a-z0-9]/gi, "-")}-${candId}`;

/* ----------------------------------------------- */
/* PDF: Single Certificate */
/* ----------------------------------------------- */
async function downloadSingleCert(id, fileName, setDownloading) {
  try {
    setDownloading(true);
    const element = document.getElementById(id);
    if (!element) return alert("Report not prepared.");

    const canvas = await safeHtml2Canvas(element, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    const pdfWidth = 595.28;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(fileName);
  } finally {
    setDownloading(false);
  }
}

/* ----------------------------------------------- */
/* PDF: Merged All Certificates */
/* ----------------------------------------------- */
async function mergeAllCertificates(ids, fileName, setDownloading) {
  try {
    setDownloading(true);

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(26);
    pdf.text("ALL VERIFICATION REPORTS", 297, 200, { align: "center" });

    for (const id of ids) {
      const el = document.getElementById(id);
      if (!el) continue;

      const canvas = await safeHtml2Canvas(el, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      const pdfWidth = 595.28;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addPage();
      pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
    }

    pdf.save(fileName);
  } finally {
    setDownloading(false);
  }
}

/* ============================================================= */
/* ===================== ORG REPORTS PAGE ======================= */
/* ============================================================= */

export default function OrgReportsPage() {
  const {
    reportsData: candidates,
    setReportsData: setCandidates,
  } = useOrgState();

  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  /* --------------------------------------------- */
  /* Load organization from logged-in user */
  /* --------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");
    if (!stored) return;

    try {
      const user = JSON.parse(stored);
      setOrgId(user.organizationId);
      setOrgName(user.organizationName);

      if (user.organizationId) {
        fetchCandidates(user.organizationId);
      }
    } catch (err) {
      console.error("User parse error:", err);
    }
  }, []);

  /* --------------------------------------------- */
  /* Fetch candidates with verification info */
  /* --------------------------------------------- */
  const fetchCandidates = async (orgId) => {
    // Only fetch if we don't have data already
    if (candidates.length > 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `/api/proxy/secure/getCandidates?orgId=${orgId}`,
        { credentials: "include" }
      );

      const data = await res.json();

      const enriched = await Promise.all(
        (data.candidates || []).map(async (c) => {
          try {
            const verRes = await fetch(
              `/api/proxy/secure/getVerifications?candidateId=${c._id}`,
              { credentials: "include" }
            );
            const verData = await verRes.json();
            return { ...c, verification: verData.verifications?.[0] || null };
          } catch {
            return { ...c, verification: null };
          }
        })
      );

      setCandidates(enriched);
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setExpanded((prev) => (prev === id ? null : id));

  /* --------------------------------------------- */
  /* UI */
  /* --------------------------------------------- */

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={24} className="text-[#ff004f]" /> Reports
          </h1>
          <p className="text-gray-600 text-sm mt-1">Download verification reports</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <Building2 size={18} className="text-[#ff004f]" />
          <span className="font-semibold text-gray-700 text-sm">{orgName}</span>
        </div>
      </div>

      {/* AI VALIDATION NOTICE */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-2 border-purple-300 rounded-xl p-4 mb-6 shadow-md">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-200 rounded-lg flex-shrink-0">
            <Brain size={20} className="text-purple-700" />
          </div>
          <div>
            <h3 className="font-bold text-purple-900 mb-1">AI Validation Reports</h3>
            <p className="text-sm text-purple-800">
              Reports for <strong>AI CV Validation</strong> and <strong>AI Education Validation</strong> can be downloaded from their respective verification pages:
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-semibold">
                📄 AI-CV-Verification Page
              </span>
              <span className="text-xs bg-purple-200 text-purple-900 px-3 py-1 rounded-full font-semibold">
                🎓 AI-Edu-Verification Page
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex justify-center py-20 text-[#ff004f]">
          <Loader2 className="animate-spin mr-2" />
          Fetching Reports…
        </div>
      )}

      {/* CANDIDATE LIST */}
      {!loading &&
        candidates.map((c) => {
          const v = c.verification || {};
          const primary = v.stages?.primary || [];
          const secondary = v.stages?.secondary || [];
          const final = v.stages?.final || [];
          
          const totalChecks = primary.length + secondary.length + final.length;
          const completedChecks = [...primary, ...secondary, ...final].filter(chk => chk.status === "COMPLETED").length;

          return (
            <div
              key={c._id}
              className="bg-gradient-to-br from-white to-gray-50 shadow-lg border-2 border-gray-200 rounded-2xl overflow-hidden mb-6 transition-all hover:shadow-xl hover:border-[#ff004f]/30"
            >
              {/* Candidate Header */}
              <div
                className="bg-gradient-to-r from-[#ff004f]/5 to-purple-500/5 p-6 cursor-pointer hover:from-[#ff004f]/10 hover:to-purple-500/10 transition-all"
                onClick={() => toggle(c._id)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* Avatar Circle */}
                    <div className="w-14 h-14 bg-gradient-to-br from-[#ff004f] to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {c.firstName?.charAt(0)}{c.lastName?.charAt(0)}
                    </div>

                    {/* Candidate Info */}
                    <div>
                      <p className="font-bold text-xl text-gray-900 flex items-center gap-2">
                        {c.firstName} {c.lastName}
                        {v?.overallStatus === "COMPLETED" && (
                          <CheckCircle size={20} className="text-green-600" />
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">ID:</span> {c._id}
                        </p>
                        {totalChecks > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-semibold">
                            {completedChecks}/{totalChecks} Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <div className="flex items-center gap-3">
                    {v?.overallStatus && (
                      <span className={`px-4 py-2 rounded-lg font-bold text-sm ${
                        v.overallStatus === "COMPLETED" ? "bg-green-100 text-green-800" :
                        v.overallStatus === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {v.overallStatus.replace("_", " ")}
                      </span>
                    )}
                    <div className={`p-2 rounded-lg transition-all ${expanded === c._id ? "bg-[#ff004f] text-white" : "bg-gray-200 text-gray-600"}`}>
                      {expanded === c._id ? (
                        <ChevronDown size={24} />
                      ) : (
                        <ChevronRight size={24} />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {expanded === c._id && (
                <div className="mt-6 border-t pt-6 space-y-10">
                  {/* Hidden certificates (excluding AI checks) */}
                  <div className="absolute -left-[9999px] -top-[9999px]">
                    {primary.filter(chk => !isAIValidationCheck(chk.check)).map((chk) => (
                      <ServiceCertificate
                        key={getServiceCertId("primary", chk.check, c._id)}
                        id={getServiceCertId("primary", chk.check, c._id)}
                        candidate={c}
                        orgName={orgName}
                        check={chk}
                        stage="primary"
                      />
                    ))}
                    {secondary.filter(chk => !isAIValidationCheck(chk.check)).map((chk) => (
                      <ServiceCertificate
                        key={getServiceCertId("secondary", chk.check, c._id)}
                        id={getServiceCertId("secondary", chk.check, c._id)}
                        candidate={c}
                        orgName={orgName}
                        check={chk}
                        stage="secondary"
                      />
                    ))}
                    {final.filter(chk => !isAIValidationCheck(chk.check)).map((chk) => (
                      <ServiceCertificate
                        key={getServiceCertId("final", chk.check, c._id)}
                        id={getServiceCertId("final", chk.check, c._id)}
                        candidate={c}
                        orgName={orgName}
                        check={chk}
                        stage="final"
                      />
                    ))}
                  </div>

                  {/* PRIMARY SECTION */}
                  {primary.length > 0 && (
                    <StageSection
                      title="Primary Services"
                      checks={primary}
                      candidate={c}
                      stage="primary"
                      downloading={downloading}
                      setDownloading={setDownloading}
                    />
                  )}

                  {/* SECONDARY SECTION */}
                  {secondary.length > 0 && (
                    <StageSection
                      title="Secondary Services"
                      checks={secondary}
                      candidate={c}
                      stage="secondary"
                      downloading={downloading}
                      setDownloading={setDownloading}
                    />
                  )}

                  {/* FINAL */}
                  {final.length > 0 && (
                    <StageSection
                      title="Final Services"
                      checks={final}
                      candidate={c}
                      stage="final"
                      downloading={downloading}
                      setDownloading={setDownloading}
                    />
                  )}

                  {/* MERGED ALL REPORTS BUTTON */}
                  {primary.every((x) => x.status === "COMPLETED") &&
                    secondary.every((x) => x.status === "COMPLETED") &&
                    final.every((x) => x.status === "COMPLETED") && (
                      <button
                        disabled={downloading}
                        onClick={() => {
                          // Filter out AI validation checks
                          const allIds = [
                            ...primary.filter(chk => !isAIValidationCheck(chk.check)).map((chk) =>
                              getServiceCertId("primary", chk.check, c._id)
                            ),
                            ...secondary.filter(chk => !isAIValidationCheck(chk.check)).map((chk) =>
                              getServiceCertId("secondary", chk.check, c._id)
                            ),
                            ...final.filter(chk => !isAIValidationCheck(chk.check)).map((chk) =>
                              getServiceCertId("final", chk.check, c._id)
                            ),
                          ];

                          mergeAllCertificates(
                            allIds,
                            `${c._id}-all-reports.pdf`,
                            setDownloading
                          );
                        }}
                        className={`w-full bg-[#ff004f] text-white hover:bg-[#e60047] rounded-xl shadow py-4 px-6 font-bold text-lg flex justify-center items-center gap-3 mt-10 ${
                          downloading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {downloading ? (
                          <Loader2 size={22} className="animate-spin" />
                        ) : (
                          <Download size={22} />
                        )}
                        Download ALL Reports (Merged)
                      </button>
                    )}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

/* ------------------------------------------------ */
/* SERVICE CERTIFICATE TEMPLATE */
/* ------------------------------------------------ */
function ServiceCertificate({ id, candidate, orgName, check, stage }) {
  const checks = [{ ...check, stage }];
  const title = `${stage.toUpperCase()} - ${formatServiceName(
    check.check
  )} Verification Report`;

  return (
    <CertificateBase
      id={id}
      title={title}
      candidate={candidate}
      orgName={orgName}
      checks={checks}
    />
  );
}

/* ------------------------------------------------ */
/* STAGE SECTION UI BLOCK */
/* ------------------------------------------------ */
function StageSection({
  title,
  checks,
  candidate,
  stage,
  downloading,
  setDownloading,
}) {
  const [open, setOpen] = useState(false);
  
  // Determine stage number and colors
  const stageConfig = {
    "Primary Services": { num: 1, gradient: "from-red-50 to-pink-50", border: "border-red-200", bg: "bg-[#ff004f]", text: "text-[#ff004f]" },
    "Secondary Services": { num: 2, gradient: "from-orange-50 to-amber-50", border: "border-orange-200", bg: "bg-orange-500", text: "text-orange-600" },
    "Final Services": { num: 3, gradient: "from-green-50 to-emerald-50", border: "border-green-200", bg: "bg-green-500", text: "text-green-600" },
  };
  
  const config = stageConfig[title] || stageConfig["Primary Services"];

  return (
    <div>
      <button
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex justify-between items-center bg-gradient-to-r ${config.gradient} border-2 ${config.border} px-6 py-4 rounded-xl font-bold ${config.text} hover:from-opacity-80 hover:to-opacity-80 transition-all shadow-sm hover:shadow-md`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center text-white font-bold shadow-md`}>
            {config.num}
          </div>
          <span className="text-lg">{title} ({checks.length})</span>
        </div>
        <div className={`transition-transform ${open ? "rotate-180" : ""}`}>
          <ChevronDown size={24} />
        </div>
      </button>

      {open && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {checks.map((chk) => {
            const done = chk.status === "COMPLETED";
            const certId = getServiceCertId(stage, chk.check, candidate._id);
            const isAI = isAIValidationCheck(chk.check);

            return (
              <div
                key={certId}
                className={`bg-white border rounded-xl p-4 shadow flex flex-col ${isAI ? "border-purple-300 bg-purple-50" : ""}`}
              >
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <span className="text-lg">
                    {isAI ? "🤖" : (SERVICE_ICONS[chk.check] || "📝")}
                  </span>
                  {formatServiceName(chk.check)}
                </p>

                {isAI ? (
                  <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                    <p className="text-xs text-purple-900 font-semibold flex items-center gap-1">
                      <Brain size={14} />
                      Download from AI Verification Page
                    </p>
                  </div>
                ) : (
                  <button
                    disabled={!done || downloading}
                    onClick={() =>
                      downloadSingleCert(
                        certId,
                        `${candidate._id}-${stage}-${chk.check}.pdf`,
                        setDownloading
                      )
                    }
                    className={`mt-4 py-2 rounded-lg flex items-center justify-center gap-2 text-sm ${
                      done
                        ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    } ${downloading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {downloading ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    Download
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------ */
/* CERTIFICATE BASE PDF TEMPLATE */
/* ------------------------------------------------ */

function CertificateBase({ id, title, candidate, orgName, checks }) {
  const verification = candidate.verification;
  const serviceName = formatServiceName(checks[0]?.check || "");

  // Prepare remarks
  let bulletItems = [];
  const remarks = checks[0]?.remarks;

  if (!remarks) bulletItems = ["No remarks available"];
  else if (typeof remarks === "string") bulletItems = [remarks];
  else if (Array.isArray(remarks)) bulletItems = remarks.map((r) => String(r));
  else if (typeof remarks === "object") {
    bulletItems = Object.entries(remarks).map(
      ([k, v]) => `${k}: ${String(v)}`
    );
  } else {
    bulletItems = [String(remarks)];
  }

  return (
    <div
      id={id}
      style={{
        width: "860px",
        minHeight: "1120px",
        padding: "10px 50px 60px 50px",
        background: "#ffffff",
        fontFamily: "Arial, sans-serif",
        color: "#000",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* WATERMARK */}
      <img
        src="/logos/maihooMain.png"
        alt="watermark"
        style={{
          position: "absolute",
          top: "400px",
          left: "50%",
          transform: "translateX(-50%)",
          opacity: 0.08,
          width: "750px",
          height: "750px",
          objectFit: "contain",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* CONTENT */}
      <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* HEADER */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "35px",
            marginBottom: "25px",
          }}
        >
          <div style={{ flexShrink: 0 }}>
            <img
              src="/logos/maihooMain.png"
              alt="logo"
              style={{
                maxHeight: "220px",
                maxWidth: "500px",
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
              marginTop: "72px",
            }}
          >
            <h1
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: 0,
                lineHeight: 1,
              }}
            >
              {serviceName}
            </h1>

            <h2
              style={{
                fontSize: "26px",
                fontWeight: "900",
                margin: 0,
                lineHeight: 1,
              }}
            >
              Verification Report
            </h2>
          </div>
        </div>

        {/* DETAILS */}
        <div
          style={{
            fontSize: "15px",
            lineHeight: "28px",
            marginBottom: "60px",
          }}
        >
          <p><strong>Candidate Name:</strong> {candidate.firstName} {candidate.lastName}</p>
          <p><strong>Candidate ID:</strong> {candidate._id}</p>
          <p><strong>Verification ID:</strong> {verification?._id || "—"}</p>
          <p><strong>Organization:</strong> {orgName}</p>
          <p><strong>Service:</strong> {serviceName}</p>
          <p>
            <strong>Timestamp:</strong> {new Date().toLocaleString()}
          </p>

          <p style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <strong>Status:</strong>
            <span style={{ color: "#5cb85c", fontWeight: "bold" }}>
              ✓ Completed
            </span>
          </p>
        </div>

        {/* BLACK LINE */}
        <div
          style={{
            width: "100%",
            height: "3px",
            background: "#000",
            marginBottom: "70px",
          }}
        />

        {/* GREEN STATUS BAR */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "130px" }}>
          <div
            style={{
              width: "60px",
              height: "28px",
              background: "#5cb85c",
              borderRadius: "5px",
            }}
          ></div>

          <div
            style={{
              flexGrow: 1,
              height: "2px",
              background: "#5cb85c",
              marginLeft: "10px",
            }}
          ></div>
        </div>

        {/* BULLET REMARKS */}
        <div>
          {bulletItems.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              <span style={{ fontSize: "14px" }}>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
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
        ></div>

        <p
          style={{
            fontSize: "12px",
            color: "#dc3545",
            fontWeight: "600",
            margin: 0,
          }}
        >
          Maihoo Technologies Private Limited, Vaishnavi's Cynosure, 2-48/5/6,
          8th Floor, Opp RTCC, Telecom Nagar Extension, Gachibowli-500032
        </p>
      </div>
    </div>
  );
}
