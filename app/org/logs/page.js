"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

import {
  CheckCircle,
  XCircle,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  Loader2,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import * as XLSX from "xlsx";
import { useRouter } from "next/navigation";

/* ---------------------------------------------------
   CONFIG
-----------------------------------------------------*/
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

const DEFAULT_PAGE_SIZE = 25;

export default function OrgLogsPage() {
  /* ---------------------------------------------------
     ORG DETAILS
  -----------------------------------------------------*/
  const [orgId, setOrgId] = useState("");

  /* ---------------------------------------------------
     RAW LOGS + BACKEND COUNT
  -----------------------------------------------------*/
  const [allLogs, setAllLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const loadedPagesRef = useRef(new Set());

  /* ---------------------------------------------------
     UI STATE
  -----------------------------------------------------*/
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingChunk, setLoadingChunk] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------------------
     FILTER STATE (MINIMIZED)
  -----------------------------------------------------*/
  const [filters, setFilters] = useState({
    role: "",
    fromDate: "",
    toDate: "",
    search: "",
  });

  const debounceRef = useRef(null);

  /* ---------------------------------------------------
     PAGE + LIMIT
  -----------------------------------------------------*/
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);

  /* ---------------------------------------------------
     FILTERED LIST
  -----------------------------------------------------*/
  const [filteredLogs, setFilteredLogs] = useState([]);

  const router = useRouter();

  /* ---------------------------------------------------
     LOAD ORG ID
  -----------------------------------------------------*/
  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");

    if (!stored) {
      router.replace("/");
      return;
    }

    const user = JSON.parse(stored);

    if (user.role?.toUpperCase() === "HELPER") {
      router.replace("/org/dashboard");
      return;
    }

    setOrgId(user.organizationId);
  }, []);

  /* ---------------------------------------------------
     FETCH PAGE (ONLY ONCE PER PAGE)
  -----------------------------------------------------*/
  const fetchPage = useCallback(
    async (pageToFetch) => {
      if (!orgId) return;

      if (loadedPagesRef.current.has(pageToFetch)) return;
      loadedPagesRef.current.add(pageToFetch);

      try {
        if (pageToFetch === 1) setLoadingInitial(true);
        else setLoadingChunk(true);

        const qs = new URLSearchParams({
          page: pageToFetch,
          limit,
          orgId,
        });

        const res = await fetch(`${API_BASE}/secure/activityLogs?${qs}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch logs");

        const logs = data.logs || [];
        const total = data.totalCount ?? null;

        setTotalCount(total);

        setAllLogs((prev) => {
          const merged = [...prev, ...logs];
          const uniq = [];
          const seen = new Set();

          merged.forEach((l) => {
            if (!seen.has(l._id)) {
              seen.add(l._id);
              uniq.push(l);
            }
          });

          return uniq;
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingInitial(false);
        setLoadingChunk(false);
      }
    },
    [limit, orgId]
  );

  /* ---------------------------------------------------
     INITIAL LOAD
  -----------------------------------------------------*/
  useEffect(() => {
    if (!orgId) return;

    loadedPagesRef.current = new Set();
    setAllLogs([]);
    setPage(1);

    fetchPage(1);
  }, [orgId, limit]);

  /* ---------------------------------------------------
     INFINITE SCROLL
  -----------------------------------------------------*/
  const sentinelRef = useRef(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        const nextPage = loadedPagesRef.current.size + 1;

        if (totalCount && allLogs.length >= totalCount) return;

        fetchPage(nextPage);
      },
      { rootMargin: "200px" }
    );

    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [allLogs.length, totalCount]);

  /* ---------------------------------------------------
     FILTER ENGINE
  -----------------------------------------------------*/
  useEffect(() => {
    clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const q = filters.search.toLowerCase();
      const from = filters.fromDate ? new Date(filters.fromDate) : null;
      const to = filters.toDate ? new Date(filters.toDate) : null;

      const fl = allLogs.filter((l) => {
        let hay = `${l.action} ${l.description} ${l.userEmail}`.toLowerCase();

        if (q && !hay.includes(q)) return false;

        const ts = new Date(l.timestamp);

        if (from && ts < from) return false;

        if (to) {
          let end = new Date(to);
          end.setHours(23, 59, 59);
          if (ts > end) return false;
        }

        if (filters.role && l.userRole !== filters.role) return false;

        return true;
      });

      setFilteredLogs(fl);
      setPage(1);
    }, 250);

    return () => clearTimeout(debounceRef.current);
  }, [filters, allLogs]);

  /* ---------------------------------------------------
     PAGINATION
  -----------------------------------------------------*/
  const pageCount = Math.ceil(filteredLogs.length / limit) || 1;

  const visibleLogs = filteredLogs.slice((page - 1) * limit, page * limit);

  /* ---------------------------------------------------
     CSV EXPORT (Includes userId)
  -----------------------------------------------------*/
  const downloadCSV = () => {
    if (!filteredLogs.length) return alert("No logs available.");

    const rows = [
      [
        "Action",
        "Description",
        "User Email",
        "User Role",
        "User ID",
        "Status",
        "Timestamp",
      ],
      ...filteredLogs.map((l) => [
        l.action,
        l.description,
        l.userEmail,
        l.userRole,
        l.userId, // INCLUDED
        l.status,
        l.timestamp,
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");

    XLSX.writeFile(
      wb,
      `org_logs_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  /* ---------------------------------------------------
     ICON HELPERS
  -----------------------------------------------------*/
  const getIcon = (action = "") => {
    const a = action.toLowerCase();

    if (a.includes("view")) return <Search className="text-blue-600" size={18} />;
    if (a.includes("create"))
      return <UserPlus className="text-green-600" size={18} />;
    if (a.includes("update"))
      return <Edit3 className="text-yellow-600" size={18} />;
    if (a.includes("delete"))
      return <Trash2 className="text-red-600" size={18} />;

    return <CheckCircle className="text-gray-500" size={18} />;
  };

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("success")) return "bg-green-100 text-green-700";
    if (s.includes("fail")) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  };

  /* ---------------------------------------------------
     UI
  -----------------------------------------------------*/
  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-[#ff004f]">
            Organization Logs
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Activity logs filtered for your organization.
          </p>
        </div>

        <button
          onClick={downloadCSV}
          className="px-4 py-2 bg-[#ff004f] text-white rounded-lg flex items-center gap-2"
        >
          <Download size={16} /> Download CSV
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl shadow-md p-5 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ROLE */}
          <div>
            <label className="block text-xs font-semibold mb-1">Role</label>
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value })
              }
              className="border rounded-lg p-2 w-full text-sm"
            >
              <option value="">All Roles</option>
              <option value="ORG_ADMIN">ORG_ADMIN</option>
              <option value="ORG_HR">ORG_HR</option>
              <option value="USER">USER</option>
            </select>
          </div>

          {/* FROM DATE */}
          <div>
            <label className="block text-xs font-semibold mb-1">From</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="border rounded-lg p-2 w-full text-sm"
            />
          </div>

          {/* TO DATE */}
          <div>
            <label className="block text-xs font-semibold mb-1">To</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="border rounded-lg p-2 w-full text-sm"
            />
          </div>

          {/* SEARCH */}
          <div>
            <label className="block text-xs font-semibold mb-1">Search</label>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-[10px] text-gray-500"
              />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search logs..."
                className="border rounded-lg p-2 pl-8 w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* CLEAR */}
        <div className="mt-4 text-right">
          <button
            onClick={() =>
              setFilters({ role: "", fromDate: "", toDate: "", search: "" })
            }
            className="px-4 py-2 border rounded-lg text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#ffeef3] text-[#ff004f] text-xs uppercase">
            <tr>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Action</th>
              <th className="p-3">Description</th>
              <th className="p-3">User Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Time</th>
            </tr>
          </thead>

          <tbody>
            {loadingInitial && (
              <tr>
                <td colSpan={7} className="p-8 text-center">
                  <Loader2 className="animate-spin text-[#ff004f] mx-auto" />
                </td>
              </tr>
            )}

            {!loadingInitial &&
              visibleLogs.map((l, i) => (
                <tr key={l._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{(page - 1) * limit + i + 1}</td>
                  <td className="p-3 flex items-center gap-2">
                    {getIcon(l.action)} {l.action}
                  </td>
                  <td className="p-3">{l.description}</td>
                  <td className="p-3">{l.userEmail}</td>
                  <td className="p-3">{l.userRole}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        l.status
                      )}`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatDate(l.timestamp)}
                  </td>
                </tr>
              ))}

            {!loadingInitial && visibleLogs.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No logs found.
                </td>
              </tr>
            )}

            {loadingChunk && (
              <tr>
                <td colSpan={7} className="p-3 text-center">
                  <Loader2 className="animate-spin text-[#ff004f] mx-auto" />
                  <p className="text-xs">Loading more...</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded-md"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: pageCount }).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`px-3 py-1 rounded-md ${
                    page === n
                      ? "bg-[#ff004f] text-white"
                      : "border bg-white"
                  }`}
                >
                  {n}
                </button>
              );
            })}

            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page === pageCount}
              className="px-3 py-1 border rounded-md"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="text-sm text-gray-600">
            Showing <b>{visibleLogs.length}</b> of <b>{filteredLogs.length}</b>{" "}
            filtered logs
          </div>
        </div>
      )}

      {/* INFINITE SCROLL SENTINEL */}
      <div ref={sentinelRef} className="h-10"></div>

      {error && (
        <div className="p-3 bg-red-100 text-red-800 border border-red-300 rounded mt-5">
          {error}
        </div>
      )}
    </div>
  );
}
