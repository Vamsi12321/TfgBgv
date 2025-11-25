/* UPDATED LOGS PAGE – REMOVED USER ID + ADDED CSV DOWNLOAD */

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
import { useRouter } from "next/navigation";

/* CONFIG */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://maihoo.onrender.com";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
const DEFAULT_PAGE_SIZE = 25;

export default function LogsOptimizedPage() {
  /* STATE */
  const [allLogs, setAllLogs] = useState([]);
  const [totalCount, setTotalCount] = useState(null);

  const [filters, setFilters] = useState({
    role: "",
    search: "",
    fromDate: "",
    toDate: "",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [loadingChunk, setLoadingChunk] = useState(false);
  const [error, setError] = useState("");

  const loadedPagesRef = useRef(new Set());
  const sentinelRef = useRef(null);
  const router = useRouter();

  /* ACCESS CHECK */
  useEffect(() => {
    const stored = localStorage.getItem("bgvUser");
    if (!stored) return router.replace("/");

    const user = JSON.parse(stored);
    if (user.role?.toUpperCase() === "SUPER_ADMIN_HELPER") {
      router.replace("/superadmin/dashboard");
    }
  }, []);

  /* FETCH PAGE */
  const fetchPage = useCallback(
    async (pageToFetch) => {
      if (loadedPagesRef.current.has(pageToFetch)) return;

      loadedPagesRef.current.add(pageToFetch);
      setLoadingChunk(true);

      try {
        const qs = new URLSearchParams({
          page: pageToFetch,
          limit,
        }).toString();

        const res = await fetch(`${API_BASE}/secure/activityLogs?${qs}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const logs = data.logs || [];

        setAllLogs((prev) => {
          const seen = new Set();
          return [...prev, ...logs].filter((l) => {
            if (seen.has(l._id)) return false;
            seen.add(l._id);
            return true;
          });
        });

        if (data.totalCount) setTotalCount(data.totalCount);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingChunk(false);
      }
    },
    [limit]
  );

  /* INITIAL LOAD */
  useEffect(() => {
    loadedPagesRef.current.clear();
    setAllLogs([]);
    fetchPage(1);
    setPage(1);
  }, [limit]);

  /* INFINITE SCROLL */
  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || loadingChunk) return;

        const nextPage = loadedPagesRef.current.size + 1;
        if (totalCount !== null && allLogs.length >= totalCount) return;

        fetchPage(nextPage);
      },
      { rootMargin: "200px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [allLogs, loadingChunk]);

  /* FILTERING LOGIC */
  const filteredLogs = allLogs.filter((log) => {
    const search = filters.search.toLowerCase();

    if (filters.role && log.userRole !== filters.role) return false;

    if (search) {
      const hay = `${log.action} ${log.description} ${log.userEmail}`
        .toLowerCase()
        .replace(/\s+/g, " ");
      if (!hay.includes(search)) return false;
    }

    if (filters.fromDate) {
      if (new Date(log.timestamp) < new Date(filters.fromDate)) return false;
    }

    if (filters.toDate) {
      if (new Date(log.timestamp) > new Date(filters.toDate + "T23:59")) {
        return false;
      }
    }

    return true;
  });

  const pageCount = Math.ceil(filteredLogs.length / limit) || 1;
  const visibleLogs = filteredLogs.slice((page - 1) * limit, page * limit);

  /* Helpers */
  const getIcon = (action = "") => {
    const a = action.toLowerCase();
    if (a.includes("create"))
      return <UserPlus size={18} className="text-green-600" />;
    if (a.includes("update"))
      return <Edit3 size={18} className="text-yellow-600" />;
    if (a.includes("delete"))
      return <Trash2 size={18} className="text-red-600" />;
    if (a.includes("approve"))
      return <Shield size={18} className="text-blue-600" />;
    if (a.includes("fail") || a.includes("reject"))
      return <XCircle size={18} className="text-red-600" />;
    return <CheckCircle size={18} className="text-gray-500" />;
  };

  const getStatusColor = (status = "") => {
    const s = status.toLowerCase();
    if (s.includes("success")) return "bg-green-100 text-green-700";
    if (s.includes("error") || s.includes("fail"))
      return "bg-red-100 text-red-700";
    if (s.includes("warning")) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-700";
  };

  const formatDate = (iso) => new Date(iso).toLocaleString();

  /* CSV DOWNLOAD */
  const downloadCSV = () => {
    const rows = [
      ["#", "Action", "Description", "Email", "Role", "Status", "Timestamp"],
      ...visibleLogs.map((log, i) => [
        i + 1,
        log.action,
        log.description || "",
        log.userEmail,
        log.userRole,
        log.status,
        formatDate(log.timestamp),
      ]),
    ];

    const csvString =
      "data:text/csv;charset=utf-8," +
      rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvString);
    link.download = "logs_page.csv";
    link.click();
  };

  /* UI */
  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen text-gray-900">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-[#ff004f]">
          Activity Logs
        </h1>

        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 bg-[#ff004f] text-white px-4 py-2 rounded-lg shadow hover:bg-[#e60047] transition"
        >
          <Download size={18} />
          Download CSV
        </button>
      </div>

      {/* FILTER PANEL */}
      <div className="bg-white border rounded-2xl shadow-lg p-5 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Search size={18} className="text-[#ff004f]" />
            Filters
          </h2>

          {(filters.role ||
            filters.search ||
            filters.fromDate ||
            filters.toDate) && (
            <span className="px-3 py-1 bg-[#ff004f]/10 text-[#ff004f] rounded-full text-xs">
              Active Filters:{" "}
              {[
                filters.role,
                filters.search,
                filters.fromDate,
                filters.toDate,
              ].filter(Boolean).length}
            </span>
          )}
        </div>

        {/* FILTER GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* ROLE */}
          <div>
            <label className="text-xs font-semibold">Role</label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="border rounded-lg w-full p-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="SUPER_SPOC">Super Spoc</option>
              <option value="ORG_HR">Org HR</option>
              <option value="HELPER">Helper</option>
              <option value="USER">User</option>
            </select>
          </div>

          {/* FROM DATE */}
          <div>
            <label className="text-xs font-semibold">From Date</label>
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters({ ...filters, fromDate: e.target.value })
              }
              className="border rounded-lg w-full p-2 text-sm"
            />
          </div>

          {/* TO DATE */}
          <div>
            <label className="text-xs font-semibold">To Date</label>
            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters({ ...filters, toDate: e.target.value })
              }
              className="border rounded-lg w-full p-2 text-sm"
            />
          </div>

          {/* SEARCH */}
          <div>
            <label className="text-xs font-semibold">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-2 top-3 text-gray-500" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                placeholder="Search action, description, email..."
                className="pl-8 border rounded-lg w-full p-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* FILTER FOOTER */}
        <div className="flex justify-between mt-4">
          <button
            onClick={() =>
              setFilters({ role: "", search: "", fromDate: "", toDate: "" })
            }
            className="px-4 py-2 border text-sm rounded-md hover:bg-gray-100"
          >
            Clear Filters
          </button>

          <div className="flex items-center gap-3">
            <span className="text-sm">Page Size</span>

            <select
              value={limit}
              onChange={(e) => {
                const size = Number(e.target.value);
                setLimit(size);
                loadedPagesRef.current.clear();
                setAllLogs([]);
                fetchPage(1);
              }}
              className="border rounded-md p-1"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white shadow border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#ffeef3] text-[#ff004f] sticky top-0">
            <tr>
              <th className="p-3 w-10">#</th>
              <th className="p-3">Action</th>
              <th className="p-3">Description</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Timestamp</th>
            </tr>
          </thead>

          <tbody>
            {visibleLogs.map((log, i) => {
              const idx = (page - 1) * limit + i + 1;
              return (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{idx}</td>
                  <td className="p-3 flex items-center gap-2">
                    {getIcon(log.action)} {log.action}
                  </td>
                  <td className="p-3">{log.description || "—"}</td>
                  <td className="p-3">{log.userEmail}</td>
                  <td className="p-3">{log.userRole}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3">{formatDate(log.timestamp)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {loadingChunk && (
          <div className="text-center p-3 text-gray-500">
            <Loader2 size={16} className="animate-spin inline mr-2" />
            Loading more...
          </div>
        )}
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden space-y-4">
        {visibleLogs.map((log) => (
          <div key={log._id} className="bg-white shadow border rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <div className="flex items-center gap-2 font-semibold text-[#ff004f]">
                {getIcon(log.action)} {log.action}
              </div>
              <span className="text-xs text-gray-600">
                {formatDate(log.timestamp)}
              </span>
            </div>

            <p className="text-gray-700">{log.description || "—"}</p>

            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p>
                <b>Email:</b> {log.userEmail}
              </p>
              <p>
                <b>Role:</b> {log.userRole}
              </p>
            </div>

            <div className="mt-3">
              <span
                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                  log.status
                )}`}
              >
                {log.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION */}
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1 border rounded-md"
          >
            <ChevronLeft size={16} />
          </button>

          {[...Array(pageCount)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded-md ${
                page === i + 1 ? "bg-[#ff004f] text-white" : "border"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={page === pageCount}
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            className="px-3 py-1 border rounded-md"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* SENTINEL */}
      <div ref={sentinelRef} className="h-10" />

      {error && (
        <div className="mt-4 text-red-600 bg-red-100 border border-red-300 p-3 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
