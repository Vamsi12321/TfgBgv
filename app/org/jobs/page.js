"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase, Plus, Search, Users, Clock, CheckCircle2, XCircle,
  Eye, Trash2, MoreVertical, MapPin, Star, TrendingUp, Calendar,
  ArrowRight, X, Loader2, Edit2, Copy, ToggleLeft, ToggleRight,
  AlertTriangle, FileText, ChevronDown, Zap, BarChart2, Sparkles,
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
  const [showAiStep, setShowAiStep] = useState(!isEdit); // Show AI step only for new jobs
  const [aiMethod, setAiMethod] = useState("text"); // "text" | "file"
  const [jdText, setJdText] = useState("");
  const [jdFile, setJdFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAiParse = async () => {
    setParsing(true);
    setParseError("");
    try {
      const fd = new FormData();
      if (aiMethod === "file" && jdFile) {
        fd.append("jd_file", jdFile);
      } else if (aiMethod === "text" && jdText.trim()) {
        fd.append("jd_text", jdText.trim());
      } else {
        setParseError("Please provide a JD file or text.");
        setParsing(false);
        return;
      }

      const res = await fetch("/api/proxy/secure/parseJobDescription", {
        method: "POST", credentials: "include", body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        // Auto-fill form with parsed data
        if (data.title) set("title", data.title);
        if (data.department) set("department", data.department);
        if (data.location) set("location", data.location);
        if (data.type) set("type", data.type);
        if (data.experience) set("experience", data.experience);
        if (data.salary) set("salary", data.salary);
        if (data.skills) set("skills", Array.isArray(data.skills) ? data.skills.join(", ") : data.skills);
        if (data.description) set("description", data.description);
        if (data.deadline) set("deadline", data.deadline);
        setShowAiStep(false); // Move to form
      } else {
        const d = await res.json().catch(() => ({}));
        setParseError(typeof d?.detail === "string" ? d.detail : "Failed to parse JD. Try again or fill manually.");
      }
    } catch {
      setParseError("Network error. Try again or fill manually.");
    } finally {
      setParsing(false);
    }
  };

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
    "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:bg-white transition placeholder-gray-400 hover:border-gray-300";
  const labelCls = "block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-7 py-6 flex items-center justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative">
            <h2 className="text-xl font-extrabold text-white">
              {isEdit ? "Edit Job" : "Create New Job"}
            </h2>
            <p className="text-blue-100 text-sm mt-1">
              {isEdit ? "Update the job details below" : "Fill in the details to post a new job posting"}
            </p>
          </div>
          <button onClick={onClose} className="relative text-white/70 hover:text-white hover:bg-white/10 transition rounded-xl p-2">
            <X size={22} />
          </button>
        </div>

        {/* AI Parse Step — only for new jobs */}
        {showAiStep && !isEdit && (
          <div className="flex-1 overflow-y-auto p-7 space-y-5">
            <div className="text-center mb-2">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200 mb-4">
                <Sparkles size={24} className="text-white" />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">AI-Powered Job Creation</h3>
              <p className="text-sm text-gray-500 mt-1">Upload a JD file or paste text — AI will extract all fields automatically</p>
            </div>

            {/* Method toggle */}
            <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
              <button type="button" onClick={() => setAiMethod("text")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${aiMethod === "text" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}>
                ✏️ Paste JD Text
              </button>
              <button type="button" onClick={() => setAiMethod("file")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition ${aiMethod === "file" ? "bg-white text-indigo-700 shadow-sm" : "text-gray-500"}`}>
                📄 Upload File
              </button>
            </div>

            {/* Text input */}
            {aiMethod === "text" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Paste Job Description</label>
                <textarea rows={8} value={jdText} onChange={e => setJdText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent focus:bg-white transition resize-none"
                  placeholder="Paste the full job description here... AI will extract title, skills, experience, location, salary, and more." />
              </div>
            )}

            {/* File upload */}
            {aiMethod === "file" && (
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Upload JD File (PDF / DOCX / TXT)</label>
                <label className={`flex items-center justify-center gap-3 px-4 py-6 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  jdFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"
                }`}>
                  <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={e => setJdFile(e.target.files[0] || null)} className="hidden" />
                  {jdFile ? (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 size={16} className="text-green-500" />
                      <span className="font-medium text-green-700">{jdFile.name}</span>
                      <button type="button" onClick={(e) => { e.preventDefault(); setJdFile(null); }} className="text-gray-400 hover:text-red-500 ml-2"><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <FileText size={24} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 font-medium">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-0.5">PDF, DOCX, or TXT</p>
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* Error */}
            {parseError && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-600">{parseError}</div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setShowAiStep(false)}
                className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition flex items-center gap-2">
                <Edit2 size={14} /> Fill Manually
              </button>
              <button type="button" onClick={handleAiParse} disabled={parsing || (aiMethod === "text" ? !jdText.trim() : !jdFile)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-50">
                {parsing ? <><Loader2 size={14} className="animate-spin" /> Parsing...</> : <><Sparkles size={14} /> Extract with AI</>}
              </button>
            </div>
            </div>
          </div>
        )}

        {/* Body — Form (shown after AI step or for edit) */}
        {(!showAiStep || isEdit) && (
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-7 space-y-5">
          {/* Section: Basic Info */}
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase size={12} /> Basic Information
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><FileText size={12} className="text-blue-500" /> Job Title *</label>
                <input required className={inputCls} placeholder="e.g. Senior ML Engineer" value={form.title} onChange={(e) => set("title", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Briefcase size={12} className="text-purple-500" /> Department *</label>
                <input required className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={(e) => set("department", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><MapPin size={12} className="text-emerald-500" /> Location *</label>
                <input required className={inputCls} placeholder="e.g. Remote / New York, NY" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Clock size={12} className="text-amber-500" /> Job Type</label>
                <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section: Requirements */}
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Star size={12} /> Requirements & Compensation
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}><TrendingUp size={12} className="text-indigo-500" /> Experience Required</label>
                <input className={inputCls} placeholder="e.g. 3+ years" value={form.experience} onChange={(e) => set("experience", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><BarChart2 size={12} className="text-green-500" /> Salary Range</label>
                <input className={inputCls} placeholder="e.g. ₹8L – ₹15L / $80K – $110K" value={form.salary} onChange={(e) => set("salary", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Zap size={12} className="text-orange-500" /> Skills (comma separated)</label>
                <input className={inputCls} placeholder="e.g. React, Node.js, TypeScript" value={form.skills} onChange={(e) => set("skills", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}><Calendar size={12} className="text-red-500" /> Application Deadline</label>
                <input type="date" className={inputCls} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
              </div>
            </div>
          </div>

          {/* Section: Description */}
          <div>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Eye size={12} /> Job Description
            </p>
            <textarea required rows={4} className={inputCls + " resize-none"}
              placeholder="Describe the role, responsibilities, key requirements, and what makes this opportunity exciting..."
              value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <div className="flex gap-2">
              {[
                { value: "open", label: "Open", color: "border-green-300 bg-green-50 text-green-700" },
                { value: "draft", label: "Draft", color: "border-amber-300 bg-amber-50 text-amber-700" },
                { value: "closed", label: "Closed", color: "border-red-300 bg-red-50 text-red-700" },
              ].map(opt => (
                <button key={opt.value} type="button" onClick={() => set("status", opt.value)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border-2 transition ${form.status === opt.value ? opt.color : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all flex items-center gap-2 disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />}
              {isEdit ? "Save Changes" : "Create Job"}
            </button>
          </div>
        </form>
        )}
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex overflow-hidden group relative">
      {/* Left gradient accent */}
      <div className={`w-1.5 flex-shrink-0 ${job.status === "open" ? "bg-gradient-to-b from-emerald-400 via-teal-500 to-cyan-500" : job.status === "closed" ? "bg-gradient-to-b from-red-400 to-rose-500" : "bg-gradient-to-b from-amber-400 to-orange-400"}`} />

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
          <h3 className="text-lg font-extrabold text-gray-900 leading-tight group-hover:text-blue-700 transition">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Briefcase size={11} className="text-gray-400" /> {job.department}</span>
            <span className="flex items-center gap-1"><MapPin size={11} className="text-blue-400" /> {job.location}</span>
            <span className="flex items-center gap-1"><Star size={11} className="text-amber-400" /> {job.experience}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{job.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map((s) => (
            <span key={s} className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-100 text-[11px] font-semibold">
              {s}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 text-[11px] font-semibold">
              +{extraSkills} more
            </span>
          )}
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
            <Users size={12} className="text-blue-500" />
            <span className="text-xs font-bold text-blue-700">{job.applicants}</span>
            <span className="text-[10px] text-blue-400">applied</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
            <CheckCircle2 size={12} className="text-emerald-500" />
            <span className="text-xs font-bold text-emerald-700">{job.shortlisted}</span>
            <span className="text-[10px] text-emerald-400">shortlisted</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
            <Zap size={12} className="text-amber-500" />
            <span className="text-xs font-bold text-amber-700">{job.hired}</span>
            <span className="text-[10px] text-amber-400">hired</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${hiredPct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-gray-400">{hiredPct}%</span>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-gray-400">
              <Calendar size={10} />
              {daysLeft === null
                ? "No deadline"
                : daysLeft < 0
                ? <span className="text-red-500 font-bold">Expired</span>
                : daysLeft === 0
                ? <span className="text-orange-500 font-bold">Due today</span>
                : <span className={daysLeft <= 7 ? "text-orange-500 font-bold" : ""}>{daysLeft}d left</span>}
            </span>
          </div>
          <Link
            href={`/org/jobs/${job.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-500 to-indigo-600 px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition-all"
          >
            Pipeline <ArrowRight size={12} />
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/*  Page header  */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-200">
              <Briefcase size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Jobs & ATS</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage positions and track your hiring pipeline</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm("create")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            <Plus size={17} /> Post New Job
          </button>
        </div>

        {/*  Stats cards  */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-lg hover:border-blue-50 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center flex-shrink-0 text-white shadow-md group-hover:scale-110 transition-transform`}>
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
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
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
