"use client";

import { useState } from "react";
import {
  Briefcase, Search, Building2, Users, CheckCircle2, Clock,
  Eye, Filter, Calendar, MapPin, Star, TrendingUp, ArrowRight,
  ChevronDown, X,
} from "lucide-react";

/* ── DUMMY DATA ── */
const DUMMY_JOBS = [
  { id: "j1", title: "Senior ML Engineer", org: "TFG Technologies", orgId: "o1", department: "Engineering", location: "Hyderabad", type: "Full-time", status: "open", applicants: 24, shortlisted: 8, hired: 1, postedDate: "2026-04-20", deadline: "2026-06-01", skills: ["Python", "TensorFlow", "AWS"] },
  { id: "j2", title: "Full Stack Developer", org: "Maihoo", orgId: "o2", department: "Product", location: "Bangalore", type: "Full-time", status: "open", applicants: 41, shortlisted: 12, hired: 0, postedDate: "2026-04-25", deadline: "2026-05-30", skills: ["React", "Node.js", "PostgreSQL"] },
  { id: "j3", title: "Data Analyst", org: "ABC Corp", orgId: "o3", department: "Analytics", location: "Remote", type: "Full-time", status: "closed", applicants: 18, shortlisted: 5, hired: 2, postedDate: "2026-03-10", deadline: "2026-04-15", skills: ["SQL", "Python", "Tableau"] },
  { id: "j4", title: "DevOps Engineer", org: "TFG Technologies", orgId: "o1", department: "Infrastructure", location: "Hyderabad", type: "Contract", status: "open", applicants: 9, shortlisted: 3, hired: 0, postedDate: "2026-05-01", deadline: "2026-06-15", skills: ["Kubernetes", "Terraform", "AWS"] },
  { id: "j5", title: "Product Manager", org: "Maihoo", orgId: "o2", department: "Product", location: "Bangalore", type: "Full-time", status: "open", applicants: 33, shortlisted: 7, hired: 1, postedDate: "2026-04-15", deadline: "2026-06-01", skills: ["Roadmapping", "Agile", "Analytics"] },
  { id: "j6", title: "QA Engineer", org: "ABC Corp", orgId: "o3", department: "Engineering", location: "Remote", type: "Full-time", status: "closed", applicants: 12, shortlisted: 4, hired: 1, postedDate: "2026-03-01", deadline: "2026-04-01", skills: ["Selenium", "Python", "JIRA"] },
];

const ORGS = ["All Organizations", "TFG Technologies", "Maihoo", "ABC Corp"];

const STATUS_CONFIG = {
  open:   { label: "Open",   color: "bg-green-100 text-green-700 border-green-200" },
  closed: { label: "Closed", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

/* ── JOB DETAIL DRAWER ── */
function JobDetailDrawer({ job, onClose }) {
  if (!job) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold">{job.title}</h2>
              <p className="text-blue-100 text-sm mt-0.5">{job.org} · {job.department}</p>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white mt-1"><X size={20} /></button>
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm text-blue-100">
            <span className="flex items-center gap-1"><MapPin size={13} /> {job.location}</span>
            <span>{job.type}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_CONFIG[job.status].color}`}>
              {STATUS_CONFIG[job.status].label}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Applied", value: job.applicants, color: "text-blue-600" },
              { label: "Shortlisted", value: job.shortlisted, color: "text-purple-600" },
              { label: "Hired", value: job.hired, color: "text-green-600" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map(s => (
                <span key={s} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">{s}</span>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1"><Calendar size={13} /> Posted</span>
              <span className="font-semibold text-gray-800">{job.postedDate}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500 flex items-center gap-1"><Clock size={13} /> Deadline</span>
              <span className="font-semibold text-gray-800">{job.deadline}</span>
            </div>
          </div>

          {/* Read-only note */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700 font-medium">
            👁 SuperAdmin view is read-only. Job management is handled by the organization.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminJobsPage() {
  const [search, setSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState("All Organizations");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedJob, setSelectedJob] = useState(null);

  const filtered = DUMMY_JOBS.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.org.toLowerCase().includes(search.toLowerCase());
    const matchOrg = orgFilter === "All Organizations" || j.org === orgFilter;
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchOrg && matchStatus;
  });

  const stats = {
    totalJobs: DUMMY_JOBS.length,
    openJobs: DUMMY_JOBS.filter(j => j.status === "open").length,
    totalApplicants: DUMMY_JOBS.reduce((s, j) => s + j.applicants, 0),
    totalHired: DUMMY_JOBS.reduce((s, j) => s + j.hired, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-6">
      <JobDetailDrawer job={selectedJob} onClose={() => setSelectedJob(null)} />

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <Briefcase size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jobs Overview</h1>
            <p className="text-sm text-gray-500">Read-only view of all job postings across organizations</p>
          </div>
        </div>
        <div className="bg-amber-100 border border-amber-300 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          👁 Read-Only Access
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Jobs", value: stats.totalJobs, icon: Briefcase, color: "from-blue-500 to-indigo-600" },
          { label: "Open Positions", value: stats.openJobs, icon: CheckCircle2, color: "from-green-500 to-emerald-600" },
          { label: "Total Applicants", value: stats.totalApplicants, icon: Users, color: "from-purple-500 to-pink-600" },
          { label: "Total Hired", value: stats.totalHired, icon: Star, color: "from-amber-500 to-orange-600" },
        ].map((s, i) => (
          <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-white/50 shadow-lg">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-gradient-to-br ${s.color} rounded-lg`}>
                <s.icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-4 mb-6 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by job title or organization..."
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 text-black" />
        </div>
        <select value={orgFilter} onChange={e => setOrgFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
          {ORGS.map(o => <option key={o}>{o}</option>)}
        </select>
        <div className="flex gap-2">
          {["all", "open", "closed"].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition ${
                statusFilter === s ? "bg-blue-500 text-white shadow" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}>
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Job Title</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Organization</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Location</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Applied</th>
                <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Shortlisted</th>
                <th className="text-center p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Hired</th>
                <th className="text-left p-4 text-xs font-bold text-gray-600 uppercase tracking-wide">Deadline</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((job, idx) => (
                <tr key={job.id}
                  className={`hover:bg-blue-50/50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}>
                  <td className="p-4">
                    <p className="font-bold text-gray-900 text-sm">{job.title}</p>
                    <p className="text-xs text-gray-400">{job.department} · {job.type}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {job.org.charAt(0)}
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{job.org}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-gray-600 flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${STATUS_CONFIG[job.status].color}`}>
                      {STATUS_CONFIG[job.status].label}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-blue-600">{job.applicants}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-purple-600">{job.shortlisted}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold text-green-600">{job.hired}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><Calendar size={11} /> {job.deadline}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => setSelectedJob(job)}
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <Briefcase size={40} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-semibold">No jobs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
