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
} from "lucide-react";

import jsPDF from "jspdf";
import { safeHtml2Canvas } from "@/utils/safeHtml2Canvas";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

/* ----------------------------------------------------------
   Helper — check if stage is fully completed
---------------------------------------------------------- */
function isStageFullyCompleted(stageArray) {
  if (!stageArray || stageArray.length === 0) return false;
  return stageArray.every((c) => c.status === "COMPLETED");
}

/* ----------------------------------------------------------
   Helper — check if stage is empty (not initiated)
---------------------------------------------------------- */
function isStageEmpty(stageArray) {
  return !stageArray || stageArray.length === 0;
}

/* ----------------------------------------------------------
   Helper — check if stage has FAILED or IN_PROGRESS
---------------------------------------------------------- */
function isStageIncomplete(stageArray) {
  if (!stageArray || stageArray.length === 0) return true;
  return stageArray.some((c) => c.status !== "COMPLETED");
}

export default function OrgReportsPage() {
  const [orgId, setOrgId] = useState("");
  const [orgName, setOrgName] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ----------------------------------------------------------
     Load logged-in user's org details
  ---------------------------------------------------------- */
  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");
    if (!stored) return;

    try {
      const user = JSON.parse(stored);

      setOrgId(user.organizationId);
      setOrgName(user.organizationName || "Organization");

      if (user.organizationId) {
        fetchCandidates(user.organizationId);
      }
    } catch (err) {
      console.error("BGV User parse error:", err);
    }
  }, []);

  /* ----------------------------------------------------------
     Fetch candidates + verification data
  ---------------------------------------------------------- */
  const fetchCandidates = async (orgId) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/secure/getCandidates?orgId=${orgId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error("Unable to fetch candidates");

      const enriched = await Promise.all(
        (data.candidates || []).map(async (c) => {
          try {
            const verRes = await fetch(
              `${API_BASE}/secure/getVerifications?candidateId=${c._id}`,
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

  const toggle = (id) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  /* ----------------------------------------------------------
     Download PDF
  ---------------------------------------------------------- */
  const handleDownload = async (id) => {
    const element = document.getElementById(id);
    if (!element) return alert("Report not ready.");

    const canvas = await safeHtml2Canvas(element, { scale: 2 });
    const img = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    pdf.addImage(
      img,
      "PNG",
      0,
      0,
      595.28,
      (canvas.height * 595.28) / canvas.width
    );

    pdf.save(id + ".pdf");
  };

  /* ----------------------------------------------------------
     UI
  ---------------------------------------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff004f] flex items-center gap-2">
          <FileText /> BGV Reports
        </h1>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
          <Building2 size={18} />
          <span className="font-medium">{orgName}</span>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="flex justify-center py-20 text-gray-600">
          <Loader2 className="animate-spin mr-2 text-[#ff004f]" />
          Fetching Reports…
        </div>
      )}

      {/* Candidate List */}
      {!loading &&
        candidates.map((c) => {
          const v = c.verification;

          const primaryArr = v?.stages?.primary || [];
          const secondaryArr = v?.stages?.secondary || [];
          const finalArr = v?.stages?.final || [];

          const primaryDone = isStageFullyCompleted(primaryArr);
          const secondaryDone = isStageFullyCompleted(secondaryArr);
          const finalDone = isStageFullyCompleted(finalArr);

          return (
            <div
              key={c._id}
              className="bg-white shadow border rounded-xl p-4 mb-4"
            >
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggle(c._id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === c._id ? (
                    <ChevronDown size={20} />
                  ) : (
                    <ChevronRight size={20} />
                  )}

                  <div>
                    <p className="font-semibold text-lg">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-xs text-gray-500">ID: {c._id}</p>
                  </div>
                </div>
              </div>

              {/* Expanded */}
              {expanded === c._id && (
                <div className="mt-6 border-t pt-6 space-y-6">
                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* PRIMARY BUTTON */}
                    <button
                      onClick={() => {
                        if (!primaryDone)
                          return alert("Primary stage not completed yet.");
                        handleDownload(`cert-primary-${c._id}`);
                      }}
                      className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                        primaryDone
                          ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                          : "bg-white text-gray-700 border border-[#ff004f] cursor-not-allowed"
                      }`}
                    >
                      <Download size={16} /> Primary Report
                    </button>

                    {/* SECONDARY BUTTON */}
                    <button
                      onClick={() => {
                        if (!secondaryDone)
                          return alert("Secondary stage not completed yet.");
                        handleDownload(`cert-secondary-${c._id}`);
                      }}
                      className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                        secondaryDone
                          ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                          : "bg-white text-gray-700 border border-[#ff004f] cursor-not-allowed"
                      }`}
                    >
                      <Download size={16} /> Secondary Report
                    </button>

                    {/* FINAL BUTTON */}
                    <button
                      onClick={() => {
                        if (!finalDone)
                          return alert("Final stage not completed yet.");
                        handleDownload(`cert-final-${c._id}`);
                      }}
                      className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                        finalDone
                          ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                          : "bg-white text-gray-700 border border-[#ff004f] cursor-not-allowed"
                      }`}
                    >
                      <Download size={16} /> Final Report
                    </button>
                  </div>

                  {/* Hidden Certificates */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-99999px",
                      left: "-99999px",
                    }}
                  >
                    <PrimaryCertificate
                      id={`cert-primary-${c._id}`}
                      candidate={c}
                      orgName={orgName}
                    />
                    <SecondaryCertificate
                      id={`cert-secondary-${c._id}`}
                      candidate={c}
                      orgName={orgName}
                    />
                    <FinalCertificate
                      id={`cert-final-${c._id}`}
                      candidate={c}
                      orgName={orgName}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

/* -------------------------------------------------------------
   Certificate Wrappers
------------------------------------------------------------- */

function PrimaryCertificate({ id, candidate, orgName }) {
  const list =
    (candidate.verification?.stages?.primary || []).map((c) => ({
      ...c,
      stage: "primary",
    })) || [];
  return (
    <CertificateBase
      id={id}
      title="Primary Verification Report"
      candidate={candidate}
      orgName={orgName}
      checks={list}
    />
  );
}

function SecondaryCertificate({ id, candidate, orgName }) {
  const list =
    (candidate.verification?.stages?.secondary || []).map((c) => ({
      ...c,
      stage: "secondary",
    })) || [];
  return (
    <CertificateBase
      id={id}
      title="Secondary Verification Report"
      candidate={candidate}
      orgName={orgName}
      checks={list}
    />
  );
}

function FinalCertificate({ id, candidate, orgName }) {
  const list =
    (candidate.verification?.stages?.final || []).map((c) => ({
      ...c,
      stage: "final",
    })) || [];
  return (
    <CertificateBase
      id={id}
      title="Final Verification Report"
      candidate={candidate}
      orgName={orgName}
      checks={list}
    />
  );
}

/* -------------------------------------------------------------
   Certificate UI Component
------------------------------------------------------------- */

function CertificateBase({ id, title, candidate, orgName, checks }) {
  const verification = candidate.verification;

  return (
    <div
      id={id}
      style={{
        width: "860px",
        padding: "40px",
        background: "white",
        border: "2px solid black",
        borderRadius: "16px",
        color: "black",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "#ff004f",
          color: "white",
          padding: "14px 20px",
          borderRadius: "10px",
          textAlign: "center",
          fontSize: "22px",
          fontWeight: "900",
        }}
      >
        {title.toUpperCase()}
      </div>

      {/* Candidate Info */}
      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700" }}>
          {candidate.firstName} {candidate.lastName}
        </h2>
        <p>
          <strong>Candidate ID:</strong> {candidate._id}
        </p>
        <p>
          <strong>Verification ID:</strong> {verification?._id || "—"}
        </p>
        <p>
          <strong>Organization:</strong> {orgName}
        </p>
      </div>

      {/* Table */}
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
          background: "white",
          color: "black",
          fontSize: "14px",
        }}
      >
        <thead>
          <tr>
            <th style={headerCell}>Check</th>
            <th style={headerCell}>Stage</th>
            <th style={headerCell}>Status</th>
            <th style={headerCell}>Submitted</th>
            <th style={headerCell}>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {checks.map((chk, idx) => (
            <tr key={idx}>
              <td style={cell}>{chk.check.replace(/_/g, " ")}</td>
              <td style={cell}>{chk.stage}</td>
              <td style={cell}>
                <strong
                  style={{
                    color:
                      chk.status === "COMPLETED"
                        ? "green"
                        : chk.status === "FAILED"
                        ? "red"
                        : "#d97706",
                  }}
                >
                  {chk.status}
                </strong>
              </td>
              <td style={cell}>
                {chk.submittedAt
                  ? new Date(chk.submittedAt).toLocaleString()
                  : "—"}
              </td>
              <td style={cell}>
                {chk.remarks
                  ? Object.entries(chk.remarks).map(([k, v]) => (
                      <div key={k}>
                        <strong>{k}</strong>: {String(v)}
                      </div>
                    ))
                  : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p
        style={{
          textAlign: "center",
          fontSize: "11px",
          marginTop: "30px",
        }}
      >
        Generated on {new Date().toLocaleString()}
      </p>
    </div>
  );
}

const headerCell = {
  padding: "10px",
  border: "1px solid black",
  fontWeight: "700",
};

const cell = {
  padding: "10px",
  border: "1px solid black",
  fontSize: "13px",
};
