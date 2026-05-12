"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Plus, Search, Users, Clock, CheckCircle2, XCircle,
  Eye, Trash2, MoreVertical, MapPin, Star, TrendingUp, Calendar,
  ArrowRight, X, Loader2, Edit2, Copy, ToggleLeft, ToggleRight,
  AlertTriangle, FileText, ChevronDown, Zap, BarChart2,
} from "lucide-react";

/* 
   DUMMY DATA
 */
const DUMMY_JOBS = [
  {
    id: "job-001",
    title: "Senior ML Engineer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    experience: "5+ years",
    skills: ["Python", "TensorFlow", "PyTorch", "MLOps", "Kubernetes", "AWS"],
    status: "open",
    applicants: 48,
    shortlisted: 12,
    hired: 2,
    postedDate: "2025-05-01",
    deadline: "2025-07-15",
    description:
      "We are looking for a Senior ML Engineer to design, build, and deploy machine learning models at scale. You will collaborate with cross-functional teams to deliver AI-powered features that impact millions of users.",
    salary: "$140,000 – $180,000",
  },
  {
    id: "job-002",
    title: "Full Stack Developer",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    experience: "3+ years",
    skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker"],
    status: "open",
    applicants: 73,
    shortlisted: 18,
    hired: 3,
    postedDate: "2025-04-20",
    deadline: "2025-06-30",
    description:
      "Join our product team as a Full Stack Developer. You will own end-to-end feature development from database schema design to polished UI, working in a fast-paced agile environment.",
    salary: "$110,000 – $145,000",
  },
  {
    id: "job-003",
    title: "Data Analyst",
    department: "Analytics",
    location: "New York, NY",
    type: "Contract",
    experience: "2+ years",
    skills: ["SQL", "Python", "Tableau", "Excel", "dbt"],
    status: "closed",
    applicants: 31,
    shortlisted: 8,
    hired: 1,
    postedDate: "2025-03-10",
    deadline: "2025-05-10",
    description:
      "We need a Data Analyst to transform raw data into actionable insights. You will build dashboards, run ad-hoc analyses, and partner with business stakeholders to drive data-informed decisions.",
    salary: "$75,000 – $95,000",
  },
  {
    id: "job-004",
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Austin, TX",
    type: "Full-time",
    experience: "4+ years",
    skills: ["Kubernetes", "Terraform", "AWS", "CI/CD", "Prometheus", "Helm"],
    status: "draft",
    applicants: 0,
    shortlisted: 0,
    hired: 0,
    postedDate: "2025-06-01",
    deadline: "2025-08-01",
    description:
      "We are hiring a DevOps Engineer to own our cloud infrastructure, CI/CD pipelines, and observability stack. You will ensure high availability and drive automation across the engineering organisation.",
    salary: "$125,000 – $160,000",
  },
];

const STATUS_CONFIG = {
  open:   { label: "Open",   color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  closed: { label: "Closed", color: "bg-red-100 text-red-700 border-red-200" },
  draft:  { label: "Draft",  color: "bg-amber-100 text-amber-700 border-amber-200" },
};

/* 
   JOB FORM MODAL (Create + Edit)
 */
function JobFormModal({ initialData, onClose, onSave }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({
    title:       initialData?.title       ?? "",
    department:  initialData?.department  ?? "",
    location:    initialData?.location    ?? "",
    type:        initialData?.type        ?? "Full-time",
    experience:  initialData?.experience  ?? "",
    salary:      initialData?.salary      ?? "",
    skills:      initialData?.skills?.join(", ") ?? "",
    deadline:    initialData?.deadline    ?? "",
    description: initialData?.description ?? "",
    status:      initialData?.status      ?? "draft",
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    const skillsArr = form.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    onSave({ ...form, skills: skillsArr });
    setSaving(false);
  };

  const inputCls =
    "w-full px-3 py-2 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400";
  const labelCls = "block text-xs font-semibold text-gray-600 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {isEdit ? "Edit Job" : "Create New Job"}
            </h2>
            <p className="text-blue-100 text-sm mt-0.5">
              {isEdit ? "Update the job details below" : "Fill in the details to post a new job"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition rounded-lg p-1"
          >
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Job Title *</label>
              <input
                required
                className={inputCls}
                placeholder="e.g. Senior ML Engineer"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Department *</label>
              <input
                required
                className={inputCls}
                placeholder="e.g. Engineering"
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Location *</label>
              <input
                required
                className={inputCls}
                placeholder="e.g. Remote / New York, NY"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Job Type</label>
              <select
                className={inputCls}
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Experience Required</label>
              <input
                className={inputCls}
                placeholder="e.g. 3+ years"
                value={form.experience}
                onChange={(e) => set("experience", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Salary Range</label>
              <input
                className={inputCls}
                placeholder="e.g. $80,000 – $110,000"
                value={form.salary}
                onChange={(e) => set("salary", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Skills (comma separated)</label>
              <input
                className={inputCls}
                placeholder="e.g. React, Node.js, TypeScript"
                value={form.skills}
                onChange={(e) => set("skills", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Application Deadline</label>
              <input
                type="date"
                className={inputCls}
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description *</label>
            <textarea
              required
              rows={4}
              className={inputCls + " resize-none"}
              placeholder="Describe the role, responsibilities, and requirements..."
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select
              className={inputCls}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              <option value="open">Open</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md transition flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : null}
              {isEdit ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* 
   DELETE CONFIRM MODAL
 */
function DeleteConfirmModal({ job, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Delete Job Posting</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-800">&ldquo;{job.title}&rdquo;</span>?
            </p>
            <p className="text-xs text-red-500 mt-2 font-medium">
              This action cannot be undone. All applicant data for this job will be lost.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold shadow transition flex items-center gap-2"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 
   JOB CARD
 */
function JobCard({ job, onEdit, onDelete, onDuplicate, onToggleStatus }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const statusCfg = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.draft;
  const hiredPct = job.applicants > 0 ? Math.round((job.hired / job.applicants) * 100) : 0;
  const visibleSkills = job.skills.slice(0, 4);
  const extraSkills = job.skills.length - 4;

  const daysLeft = (() => {
    if (!job.deadline) return null;
    const diff = Math.ceil((new Date(job.deadline) - new Date()) / 86400000);
    return diff;
  })();

  const typeColors = {
    "Full-time":  "bg-blue-100 text-blue-700",
    "Part-time":  "bg-purple-100 text-purple-700",
    "Contract":   "bg-orange-100 text-orange-700",
    "Internship": "bg-teal-100 text-teal-700",
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg hover:shadow-xl transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top accent bar */}
      <div className={`h-1 w-full ${job.status === "open" ? "bg-gradient-to-r from-emerald-400 to-teal-500" : job.status === "closed" ? "bg-gradient-to-r from-red-400 to-rose-500" : "bg-gradient-to-r from-amber-400 to-orange-400"}`} />

      <div className="p-5 flex flex-col flex-1 gap-3">
        {/* Row 1: badges + menu */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusCfg.color}`}>
              {statusCfg.label}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${typeColors[job.type] ?? "bg-gray-100 text-gray-600"}`}>
              {job.type}
            </span>
          </div>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            >
              <MoreVertical size={17} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-8 z-30 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm">
                <button
                  onClick={() => { setMenuOpen(false); onEdit(job); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  <Edit2 size={14} /> Edit Job
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDuplicate(job); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onToggleStatus(job); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                >
                  {job.status === "open"
                    ? <><ToggleLeft size={14} /> Close Job</>
                    : <><ToggleRight size={14} /> Open Job</>}
                </button>
                <div className="border-t border-gray-100 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(job); }}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Title + department */}
        <div>
          <h3 className="text-base font-bold text-gray-900 leading-tight group-hover:text-blue-700 transition">
            {job.title}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
            <Briefcase size={11} /> {job.department}
          </p>
        </div>

        {/* Location + experience */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <MapPin size={11} className="text-blue-400" /> {job.location}
          </span>
          <span className="flex items-center gap-1">
            <Star size={11} className="text-amber-400" /> {job.experience}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((s) => (
            <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              {s}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-600 text-xs font-medium">
              +{extraSkills}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span className="flex items-center gap-1"><TrendingUp size={11} /> Hiring progress</span>
            <span className="font-semibold text-gray-700">{hiredPct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${hiredPct}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-3">
          {[
            { label: "Applied",     value: job.applicants,  icon: <Users size={13} className="text-blue-500" /> },
            { label: "Shortlisted", value: job.shortlisted, icon: <CheckCircle2 size={13} className="text-emerald-500" /> },
            { label: "Hired",       value: job.hired,       icon: <Zap size={13} className="text-indigo-500" /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-0.5">{icon}</div>
              <div className="text-sm font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Calendar size={11} />
            {daysLeft === null
              ? "No deadline"
              : daysLeft < 0
              ? <span className="text-red-500 font-medium">Expired</span>
              : daysLeft === 0
              ? <span className="text-orange-500 font-medium">Due today</span>
              : <span className={daysLeft <= 7 ? "text-orange-500 font-medium" : ""}>{daysLeft}d left</span>}
          </span>
          <Link
            href={`/org/jobs/${job.id}`}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-indigo-700 transition"
          >
            View Pipeline <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* 
   MAIN PAGE
 */
export default function OrgJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showForm, setShowForm] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const typeDropRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target)) {
        setTypeDropOpen(false);
      }
    }
    if (typeDropOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [typeDropOpen]);

  /* ── Load jobs on mount ── */
  const loadJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (search) params.set("search", search);
      const res = await fetch(`/api/proxy/secure/getJobs?${params}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        // Normalise: backend uses _id, applicantCount etc.
        const normalised = (data.jobs || []).map(j => ({
          ...j,
          id: j._id || j.id || j.jobId,
          applicants: j.applicantCount ?? j.applicants ?? 0,
          shortlisted: j.shortlistedCount ?? j.shortlisted ?? 0,
          hired: j.hiredCount ?? j.hired ?? 0,
          postedDate: j.createdAt ? j.createdAt.split("T")[0] : j.postedDate,
        }));
        setJobs(normalised);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  /* ── Create ── */
  const handleCreate = async (formData) => {
    try {
      const res = await fetch("/api/proxy/secure/createJob", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          experience: formData.experience,
          salary: formData.salary,
          skills: Array.isArray(formData.skills) ? formData.skills.join(", ") : formData.skills,
          description: formData.description,
          status: formData.status || "open",
          deadline: formData.deadline || null,
        }),
      });
      if (res.ok) await loadJobs();
    } catch (err) { console.error(err); }
    setShowForm(null);
  };

  /* ── Edit ── */
  const handleEdit = async (formData) => {
    try {
      const res = await fetch("/api/proxy/secure/updateJob", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: editingJob.id || editingJob._id,
          title: formData.title,
          department: formData.department,
          location: formData.location,
          type: formData.type,
          experience: formData.experience,
          salary: formData.salary,
          skills: Array.isArray(formData.skills) ? formData.skills.join(", ") : formData.skills,
          description: formData.description,
          status: formData.status,
          deadline: formData.deadline || null,
        }),
      });
      if (res.ok) await loadJobs();
    } catch (err) { console.error(err); }
    setEditingJob(null);
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      const res = await fetch("/api/proxy/secure/deleteJob", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: deletingJob.id || deletingJob._id }),
      });
      if (res.ok) await loadJobs();
    } catch (err) { console.error(err); }
    setDeletingJob(null);
  };

  /* ── Duplicate ── */
  const handleDuplicate = async (job) => {
    try {
      const res = await fetch("/api/proxy/secure/duplicateJob", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id || job._id }),
      });
      if (res.ok) await loadJobs();
    } catch (err) { console.error(err); }
  };

  /* ── Toggle Open/Close ── */
  const handleToggleStatus = async (job) => {
    const endpoint = job.status === "open" ? "closeJob" : "reopenJob";
    try {
      const res = await fetch(`/api/proxy/secure/${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id || job._id }),
      });
      if (res.ok) await loadJobs();
    } catch (err) { console.error(err); }
  };

  /*  Derived stats  */
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants, 0);
  const totalHired = jobs.reduce((s, j) => s + j.hired, 0);
  const openJobs = jobs.filter((j) => j.status === "open").length;

  const statsCards = [
    {
      label: "Total Jobs",
      value: jobs.length,
      icon: <Briefcase size={22} />,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      label: "Open Positions",
      value: openJobs,
      icon: <CheckCircle2 size={22} />,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
    },
    {
      label: "Total Applicants",
      value: totalApplicants,
      icon: <Users size={22} />,
      gradient: "from-purple-500 to-violet-600",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    {
      label: "Hired",
      value: totalHired,
      icon: <Zap size={22} />,
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text: "text-amber-600",
    },
  ];

  /*  Filtered jobs  */
  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    const matchType = typeFilter === "all" || j.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const typeOptions = ["All Types", "Full-time", "Part-time", "Contract", "Internship"];
  const selectedTypeLabel =
    typeFilter === "all" ? "All Types" : typeFilter;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/*  Page header  */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow">
                <Briefcase size={18} />
              </span>
              Job Postings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your open positions and track applicant pipelines
            </p>
          </div>
          <button
            onClick={() => setShowForm("create")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus size={17} /> Post New Job
          </button>
        </div>

        {/*  Stats cards  */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-5 flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-xl ${card.bg} ${card.text} flex items-center justify-center flex-shrink-0`}>
                {card.icon}
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900">{card.value}</div>
                <div className="text-xs text-gray-500 font-medium">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/*  Filter bar  */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs, departments, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {["all", "open", "closed", "draft"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  statusFilter === s
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {/* Type dropdown */}
          <div className="relative" ref={typeDropRef}>
            <button
              onClick={() => setTypeDropOpen((p) => !p)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white/70 text-sm text-gray-700 hover:bg-gray-50 transition min-w-[130px] justify-between"
            >
              <span>{selectedTypeLabel}</span>
              <ChevronDown size={14} className={`transition-transform ${typeDropOpen ? "rotate-180" : ""}`} />
            </button>
            {typeDropOpen && (
              <div className="absolute right-0 top-10 z-20 w-44 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-sm">
                {typeOptions.map((opt) => {
                  const val = opt === "All Types" ? "all" : opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => { setTypeFilter(val); setTypeDropOpen(false); }}
                      className={`w-full text-left px-4 py-2 transition ${
                        typeFilter === val
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/*  Job grid  */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={setEditingJob}
                onDelete={setDeletingJob}
                onDuplicate={handleDuplicate}
                onToggleStatus={handleToggleStatus}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-16 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText size={28} className="text-gray-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-700">No jobs found</h3>
            <p className="text-sm text-gray-400 mt-1">
              {search || statusFilter !== "all" || typeFilter !== "all"
                ? "Try adjusting your filters or search query."
                : "Get started by posting your first job."}
            </p>
            {!search && statusFilter === "all" && typeFilter === "all" && (
              <button
                onClick={() => setShowForm("create")}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-semibold shadow hover:shadow-md transition"
              >
                <Plus size={16} /> Post New Job
              </button>
            )}
          </div>
        )}      </div>

      {/*  Modals  */}
      {showForm === "create" && (
        <JobFormModal
          initialData={null}
          onClose={() => setShowForm(null)}
          onSave={handleCreate}
        />
      )}
      {editingJob && (
        <JobFormModal
          initialData={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleEdit}
        />
      )}
      {deletingJob && (
        <DeleteConfirmModal
          job={deletingJob}
          onClose={() => setDeletingJob(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
