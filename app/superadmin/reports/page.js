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

/* ----------------------------------------------- */
/* 🔗 API BASE */
/* ----------------------------------------------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

export default function SuperAdminReportsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);

  /* ----------------------------------------------- */
  /* 🔥 Load Organizations */
  /* ----------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/secure/getOrganizations`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) setOrganizations(data.organizations || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ----------------------------------------------- */
  /* 🔥 Fetch Candidates of Selected ORG */
  /* ----------------------------------------------- */
  const fetchCandidates = async (orgId) => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE}/secure/getCandidates?orgId=${orgId}`,
        { credentials: "include" }
      );

      const data = await res.json();
      if (!res.ok) throw new Error("Failed fetching candidates");

      const list = data.candidates || [];

      const enriched = await Promise.all(
        list.map(async (c) => {
          try {
            const verRes = await fetch(
              `${API_BASE}/secure/getVerifications?candidateId=${c._id}`,
              { credentials: "include" }
            );
            const verData = await verRes.json();
            const verification = verData.verifications?.[0] || null;
            return { ...c, verification };
          } catch (err) {
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

  /* ----------------------------------------------- */
  /* 🔥 Download PDF */
  /* ----------------------------------------------- */
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

  /* ----------------------------------------------- */
  /* UI */
  /* ----------------------------------------------- */
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-[#ff004f] flex items-center gap-2">
          <FileText /> Reports Overview
        </h1>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow">
          <Building2 size={18} />
          <span className="font-medium">All Organizations</span>
        </div>
      </div>

      {/* Org Selector */}
      <div className="bg-white  rounded-xl p-4 mb-8 shadow">
        {/* Org Selector */}
        <div className="bg-white border rounded-xl p-4 mb-8 shadow relative">
          <label className="text-sm font-medium mb-2 block">
            Select Organization
          </label>

          {/* Main Selector */}
          <div
            onClick={() => setShowOrgDropdown((prev) => !prev)}
            className="border rounded-lg p-2 w-full bg-gray-50 text-gray-700 cursor-pointer flex justify-between items-center"
          >
            {selectedOrg
              ? organizations.find((o) => o._id === selectedOrg)
                  ?.organizationName
              : "-- Select Organization --"}

            <ChevronDown size={18} className="text-gray-500" />
          </div>

          {/* DROPDOWN */}
          {showOrgDropdown && (
            <div className="absolute bg-white border rounded-lg w-full mt-2 z-20 shadow-xl max-h-72 overflow-hidden">
              {/* Search Input */}
              <div className="p-2 border-b bg-gray-50">
                <input
                  type="text"
                  value={orgSearch}
                  onChange={(e) => setOrgSearch(e.target.value)}
                  placeholder="Search organization..."
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>

              {/* List */}
              <div className="max-h-56 overflow-y-auto">
                {organizations
                  .filter((o) =>
                    o.organizationName
                      .toLowerCase()
                      .includes(orgSearch.toLowerCase())
                  )
                  .map((o) => (
                    <div
                      key={o._id}
                      onClick={() => {
                        setSelectedOrg(o._id);
                        setShowOrgDropdown(false);
                        setOrgSearch("");
                        setCandidates([]);
                        fetchCandidates(o._id);
                      }}
                      className="p-3 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {o.organizationName}
                    </div>
                  ))}

                {/* No results */}
                {organizations.filter((o) =>
                  o.organizationName
                    .toLowerCase()
                    .includes(orgSearch.toLowerCase())
                ).length === 0 && (
                  <div className="p-3 text-gray-400 text-sm text-center">
                    No organizations found
                  </div>
                )}
              </div>
            </div>
          )}
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

          const primaryDone =
            v?.stages?.primary &&
            v.stages.primary.every((ch) => ch.status === "COMPLETED");

          const secondaryDone =
            v?.stages?.secondary &&
            v.stages.secondary.every((ch) => ch.status === "COMPLETED");

          const finalDone =
            v?.stages?.final &&
            v.stages.final.every((ch) => ch.status === "COMPLETED");

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

              {/* Expanded Section */}
              {expanded === c._id && (
                <div className="mt-6 border-t pt-6 space-y-6">
                  {/* Download Buttons */}
                  {/* Download Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Recalculated Correct Logic */}
                    {(() => {
                      const primaryChecks = v?.stages?.primary || [];
                      const secondaryChecks = v?.stages?.secondary || [];
                      const finalChecks = v?.stages?.final || [];

                      const primaryDone =
                        Array.isArray(primaryChecks) &&
                        primaryChecks.length > 0 &&
                        primaryChecks.every((c) => c.status === "COMPLETED");

                      const secondaryDone =
                        Array.isArray(secondaryChecks) &&
                        secondaryChecks.length > 0 &&
                        secondaryChecks.every((c) => c.status === "COMPLETED");

                      const finalDone =
                        Array.isArray(finalChecks) &&
                        finalChecks.length > 0 &&
                        finalChecks.every((c) => c.status === "COMPLETED");

                      return (
                        <>
                          {/* PRIMARY BUTTON */}
                          <button
                            onClick={() => {
                              if (!primaryChecks.length)
                                return alert(
                                  "Primary stage not initiated yet."
                                );
                              if (!primaryDone)
                                return alert(
                                  "Primary stage not completed yet."
                                );
                              handleDownload(`cert-primary-${c._id}`);
                            }}
                            disabled={!primaryDone}
                            className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                              primaryDone
                                ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                                : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Download size={16} /> Primary Report
                          </button>

                          {/* SECONDARY BUTTON */}
                          <button
                            onClick={() => {
                              if (!secondaryChecks.length)
                                return alert(
                                  "Secondary stage not initiated yet."
                                );
                              if (!secondaryDone)
                                return alert(
                                  "Secondary stage not completed yet."
                                );
                              handleDownload(`cert-secondary-${c._id}`);
                            }}
                            disabled={!secondaryDone}
                            className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                              secondaryDone
                                ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                                : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Download size={16} /> Secondary Report
                          </button>

                          {/* FINAL BUTTON */}
                          <button
                            onClick={() => {
                              if (!finalChecks.length)
                                return alert("Final stage not initiated yet.");
                              if (!finalDone)
                                return alert("Final stage not completed yet.");
                              handleDownload(`cert-final-${c._id}`);
                            }}
                            disabled={!finalDone}
                            className={`py-3 rounded-lg flex items-center justify-center gap-2 font-medium ${
                              finalDone
                                ? "bg-[#ff004f] text-white hover:bg-[#e60047]"
                                : "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                            }`}
                          >
                            <Download size={16} /> Final Report
                          </button>
                        </>
                      );
                    })()}
                  </div>

                  {/* Hidden Certificate containers */}
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
                      orgName={c.organizationName}
                    />

                    <SecondaryCertificate
                      id={`cert-secondary-${c._id}`}
                      candidate={c}
                      orgName={c.organizationName}
                    />

                    <FinalCertificate
                      id={`cert-final-${c._id}`}
                      candidate={c}
                      orgName={c.organizationName}
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
   CERTIFICATE WRAPPERS
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
   PREMIUM CERTIFICATE UI
------------------------------------------------------------- */
function CertificateBase({ id, title, candidate, orgName, checks }) {
  const verification = candidate.verification;

  const stageName = title.toLowerCase().includes("primary")
    ? "primary"
    : title.toLowerCase().includes("secondary")
    ? "secondary"
    : "final";

  const stageChecks = verification?.stages?.[stageName] || [];

  const allCompleted = stageChecks.every((c) => c.status === "COMPLETED");
  const anyFailed = stageChecks.some((c) => c.status === "FAILED");

  const stageStatus = allCompleted
    ? "COMPLETED"
    : anyFailed
    ? "FAILED"
    : "PENDING";

  const badgeColor =
    stageStatus === "COMPLETED"
      ? "#16a34a"
      : stageStatus === "FAILED"
      ? "#dc2626"
      : "#d97706";

  return (
    <div
      id={id}
      style={{
        width: "860px",
        padding: "40px",
        background: "#ffffff",
        border: "2px solid black",
        borderRadius: "16px",
        color: "black",
      }}
    >
      {/* HEADER */}
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

      {/* Candidate Details */}
      <div style={{ textAlign: "center", marginTop: "25px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: "700", color: "black" }}>
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

      {/* STATUS BADGE */}
      <div
        style={{
          marginTop: "30px",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "18px 35px",
            borderRadius: "50px",
            border: "3px solid #ff004f",
            background: "#fff",
            fontWeight: "700",
            fontSize: "18px",
            color: badgeColor,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          {stageStatus === "COMPLETED" && (
            <CheckCircle size={20} color="#16a34a" />
          )}
          {stageStatus === "FAILED" && <XCircle size={20} color="#dc2626" />}
          {stageStatus === "PENDING" && <span>⏳</span>}
          {stageStatus}
        </div>
      </div>

      {/* Section Title */}
      <h3
        style={{
          textAlign: "center",
          marginTop: "35px",
          fontWeight: "800",
          fontSize: "16px",
          color: "#ff004f",
        }}
      >
        VERIFICATION DETAILS
      </h3>

      {/* TABLE */}
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
          <tr style={{ background: "#ffe5ef", color: "black" }}>
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

      <p style={{ textAlign: "center", fontSize: "11px", marginTop: "30px" }}>
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
