"use client";

import { useEffect, useState, useMemo } from "react";
import { Filter, X, Loader2 } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

export default function SuperAdminVerificationsPage() {
  const [loading, setLoading] = useState(false);
  const [verifications, setVerifications] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filters, setFilters] = useState({
    org: "",
    status: "",
    name: "",
    fromDate: "",
    toDate: "",
  });
  const [openOrgFilter, setOpenOrgFilter] = useState(false);
  const [orgSearch, setOrgSearch] = useState("");

  const uniqueOrgs = useMemo(() => {
    return [...new Set(summary.map((c) => c.organizationName || ""))];
  }, [summary]);

  /* ---------------------- Fetch Verifications ---------------------- */
  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/secure/getVerifications`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Failed to fetch verifications");
      setSummary(data.candidatesSummary || []);
      setVerifications(data.verifications || []);
    } catch (err) {
      alert(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------- Derived Filters ---------------------- */
  const filteredCandidates = useMemo(() => {
    return summary.filter((c) => {
      const matchOrg = filters.org
        ? c.organizationName?.toLowerCase().includes(filters.org.toLowerCase())
        : true;
      const matchStatus = filters.status
        ? (c.overallStatus || "").toLowerCase() === filters.status.toLowerCase()
        : true;
      const matchName = filters.name
        ? c.candidateName?.toLowerCase().includes(filters.name.toLowerCase())
        : true;
      const matchFromDate = filters.fromDate
        ? new Date(c.createdAt || c.date || c.initiatedAt || 0) >=
          new Date(filters.fromDate)
        : true;
      const matchToDate = filters.toDate
        ? new Date(c.createdAt || c.date || c.initiatedAt || 0) <=
          new Date(filters.toDate)
        : true;
      return (
        matchOrg && matchStatus && matchName && matchFromDate && matchToDate
      );
    });
  }, [filters, summary]);

  const getStatusBadge = (status) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap";
    switch ((status || "").toUpperCase()) {
      case "COMPLETED":
        return <span className={`${base} bg-green-600`}>Completed</span>;
      case "FAILED":
        return <span className={`${base} bg-red-600`}>Failed</span>;
      case "PENDING":
        return <span className={`${base} bg-yellow-500`}>Pending</span>;
      case "IN_PROGRESS":
        return <span className={`${base} bg-blue-500`}>In Progress</span>;
      default:
        return (
          <span className={`${base} bg-gray-400`}>{status || "Unknown"}</span>
        );
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const d = new Date(dateString);
      return d.toLocaleString();
    } catch {
      return dateString;
    }
  };

  const openCandidateDetails = (candidate) => {
    // candidate may be from summary (summary items) or from verifications (full object)
    const details = verifications.find(
      (v) => v.candidateId === candidate.candidateId
    );
    setSelectedCandidate(details || candidate);
  };

  /* ---------------------- Main UI ---------------------- */
  return (
    <div className="min-h-screen bg-gray-50 p-6 text-gray-900 transition-all">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#ff004f]">
            Verifications Summary
          </h1>
          <p className="text-gray-600 text-sm">
            Review and track candidate verification statuses across
            organizations.
          </p>
        </div>
        <button
          onClick={fetchVerifications}
          className="px-4 py-2 bg-[#ff004f] hover:bg-[#e60047] text-white rounded-md flex items-center gap-2 shadow"
        >
          <Filter size={16} /> Refresh
        </button>
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Organization Filter */}
          <div className="relative flex-1 min-w-[180px] max-w-[200px]">
            {/* Organization Filter */}
            <div className="relative min-w-[200px]">
              <div
                onClick={() => setOpenOrgFilter(!openOrgFilter)}
                className="border px-3 py-2 rounded-md bg-white cursor-pointer text-sm flex justify-between items-center shadow-sm hover:border-[#ff004f]"
              >
                <span>{filters.org || "All Organizations"}</span>
                <span className="text-gray-500">▾</span>
              </div>

              {openOrgFilter && (
                <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-20 max-h-64 overflow-y-auto">
                  {/* Search Box */}
                  <div className="p-2 border-b sticky top-0 bg-white">
                    <input
                      type="text"
                      placeholder="Search organizations..."
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#ff004f]"
                    />
                  </div>

                  {/* All option */}
                  <div
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                    onClick={() => {
                      setFilters({ ...filters, org: "" });
                      setOpenOrgFilter(false);
                    }}
                  >
                    🌐 All Organizations
                  </div>

                  {/* List */}
                  {uniqueOrgs
                    .filter((org) =>
                      org.toLowerCase().includes(orgSearch.toLowerCase())
                    )
                    .map((org, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => {
                          setFilters({ ...filters, org });
                          setOpenOrgFilter(false);
                        }}
                      >
                        🏢 {org}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[140px]">
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="FAILED">Failed</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>

          {/* Candidate Filter */}
          <div className="flex-1 min-w-[160px] max-w-[200px]">
            <input
              type="text"
              placeholder="Search Candidate"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            />
            <span className="text-gray-600 text-sm">to</span>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white shadow rounded-xl overflow-hidden border border-gray-200">
        {loading ? (
          <div className="p-10 text-center text-gray-600">
            <Loader2 className="mx-auto animate-spin mb-2" size={24} />
            Loading verifications...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-gray-700">
              <thead className="bg-[#ffeef3] text-[#ff004f] border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Organization
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Stage</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((c) => (
                    <tr
                      key={c.candidateId}
                      className="border-t hover:bg-[#fff0f5]
transition cursor-pointer"
                      onClick={() => openCandidateDetails(c)}
                    >
                      <td className="px-4 py-3 font-medium">
                        {c.candidateName}
                      </td>
                      <td className="px-4 py-3">{c.organizationName}</td>
                      <td className="px-4 py-3 capitalize">
                        {c.currentStage || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(c.overallStatus)}
                      </td>
                      <td className="px-4 py-3 w-[120px]">
                        <div className="bg-gray-200 h-2 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              c.completionPercentage === 100
                                ? "bg-green-600"
                                : c.completionPercentage >= 60
                                ? "bg-red-500"
                                : "bg-yellow-500"
                            }`}
                            style={{ width: `${c.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-600">
                          {c.completionPercentage || 0}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-6 text-gray-500 font-medium"
                    >
                      No matching records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="grid md:hidden gap-4">
        {loading ? (
          <div className="text-center py-10 text-gray-600">
            <Loader2 className="animate-spin mx-auto mb-2" /> Loading...
          </div>
        ) : filteredCandidates.length > 0 ? (
          filteredCandidates.map((c) => (
            <div
              key={c.candidateId}
              onClick={() => openCandidateDetails(c)}
              className="bg-white shadow border border-gray-200 rounded-xl p-4 hover:border-red-400 transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-gray-800 text-base">
                  {c.candidateName}
                </h3>
                {getStatusBadge(c.overallStatus)}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Organization:</span>{" "}
                {c.organizationName}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Stage:</span>{" "}
                {c.currentStage || "-"}
              </p>
              <div className="mt-2">
                <div className="bg-gray-200 h-2 rounded-full">
                  <div
                    className={`h-2 rounded-full ${
                      c.completionPercentage === 100
                        ? "bg-green-600"
                        : c.completionPercentage >= 60
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${c.completionPercentage || 0}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {c.completionPercentage || 0}% Complete
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 italic py-6">
            No matching records found.
          </p>
        )}
      </div>

      {/* Drawer */}
      {selectedCandidate && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setSelectedCandidate(null)}
          />
          <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto p-6 ">
            <button
              onClick={() => setSelectedCandidate(null)}
              className="absolute top-4 right-4 text-gray-600 hover:text-red-600"
            >
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-2 text-red-600">
              {selectedCandidate.candidateName}
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Candidate verification details overview
            </p>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Organization:</span>{" "}
                {selectedCandidate.organizationName ||
                  selectedCandidate.organization ||
                  "-"}
              </p>

              <p>
                <span className="font-semibold">Stage:</span>{" "}
                {selectedCandidate.currentStage || "-"}
              </p>

              <p>
                <span className="font-semibold">Status:</span>{" "}
                {getStatusBadge(selectedCandidate.overallStatus)}
              </p>

              <p>
                <span className="font-semibold">Completion:</span>{" "}
                {selectedCandidate.completionPercentage ||
                  selectedCandidate.progress?.completionPercentage ||
                  0}
                %
              </p>

              {/* New: show initiatedBy and initiatedAt if present */}
              {selectedCandidate.initiatedBy && (
                <p>
                  <span className="font-semibold">Initiated By:</span>{" "}
                  {selectedCandidate.initiatedBy}
                </p>
              )}
              {selectedCandidate.initiatedAt && (
                <p>
                  <span className="font-semibold">Initiated At:</span>{" "}
                  {formatDate(selectedCandidate.initiatedAt)}
                </p>
              )}

              {/* sometimes summary objects use different keys (progress / initiatedAt in root) */}
              {selectedCandidate.progress?.totalChecks !== undefined && (
                <p>
                  <span className="font-semibold">Total Checks:</span>{" "}
                  {selectedCandidate.progress.totalChecks}
                </p>
              )}
            </div>

            {/* stages block: SAFE rendering only for array-type stage entries */}
            {selectedCandidate.stages && (
              <div className="mt-5 space-y-4">
                {Object.entries(selectedCandidate.stages)
                  // filter only those entries where value is an array of checks
                  .filter(([stageKey, checks]) => Array.isArray(checks))
                  .map(([stage, checks]) => (
                    <div
                      key={stage}
                      className="bg-red-50 border border-red-100 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-red-700 mb-2 capitalize">
                        {stage} Stage
                      </h3>

                      <ul className="space-y-1 text-sm">
                        {Array.isArray(checks) && checks.length > 0 ? (
                          checks.map((chk, i) => (
                            <li
                              key={i}
                              className="flex justify-between text-gray-700"
                            >
                              <span>
                                {chk?.check || chk?.name || `check-${i + 1}`}
                              </span>
                              {getStatusBadge(
                                chk?.status || chk?.state || "Unknown"
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 italic">
                            No checks present
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
              </div>
            )}

            {/* If selectedCandidate is from summary (not full verifications) and has no stages but verifications list contains it, show initiator/time from verifications */}
            {!selectedCandidate.stages &&
              (() => {
                const full = verifications.find(
                  (v) => v.candidateId === selectedCandidate.candidateId
                );
                if (!full) return null;
                return (
                  <div className="mt-5 space-y-4">
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <h3 className="font-semibold text-red-700 mb-2">
                        Details
                      </h3>
                      <div className="text-sm text-gray-700 space-y-1">
                        <p>
                          <span className="font-semibold">Initiated By:</span>{" "}
                          {full.initiatedBy || "-"}
                        </p>
                        <p>
                          <span className="font-semibold">Initiated At:</span>{" "}
                          {formatDate(full.initiatedAt || full.createdAt)}
                        </p>
                        {full.progress && (
                          <p>
                            <span className="font-semibold">Progress:</span>{" "}
                            {full.progress.completedChecks || 0} /{" "}
                            {full.progress.totalChecks || "-"}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedCandidate(null)}
                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
