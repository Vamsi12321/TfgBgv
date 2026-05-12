"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Filter, ChevronDown,
  Bookmark, BookmarkCheck, Clock, DollarSign, Star,
  X, CheckCircle2, SlidersHorizontal, ArrowRight, Building2,
} from "lucide-react";

const dummyJobs = [
  { id: 1, title: "Senior Frontend Engineer", orgName: "Google", location: "Mountain View, CA", salary: "$140k–$180k", type: "Full-time", experience: "Senior", skills: ["React", "TypeScript", "GraphQL", "CSS"], createdAt: "2026-05-07", description: "Build next-gen web experiences for billions of users." },
  { id: 2, title: "Product Designer", orgName: "Figma", location: "San Francisco, CA", salary: "$120k–$155k", type: "Full-time", experience: "Mid", skills: ["Figma", "Prototyping", "User Research"], createdAt: "2026-05-08", description: "Shape the future of design tools." },
  { id: 3, title: "Data Scientist", orgName: "Netflix", location: "Los Gatos, CA", salary: "$130k–$170k", type: "Full-time", experience: "Senior", skills: ["Python", "ML", "SQL", "TensorFlow"], createdAt: "2026-05-06", description: "Drive data-driven decisions at scale." },
  { id: 4, title: "DevOps Engineer", orgName: "Stripe", location: "Remote", salary: "$115k–$150k", type: "Full-time", experience: "Mid", skills: ["Kubernetes", "AWS", "Terraform"], createdAt: "2026-05-04", description: "Build and maintain world-class infrastructure." },
  { id: 5, title: "Marketing Manager", orgName: "HubSpot", location: "Boston, MA", salary: "$90k–$120k", type: "Full-time", experience: "Mid", skills: ["SEO", "Content Strategy", "Analytics"], createdAt: "2026-05-02", description: "Lead growth marketing initiatives." },
  { id: 6, title: "Backend Engineer", orgName: "Shopify", location: "Ottawa, Canada", salary: "$110k–$145k", type: "Full-time", experience: "Senior", skills: ["Ruby", "Rails", "PostgreSQL"], createdAt: "2026-05-05", description: "Scale commerce infrastructure globally." },
  { id: 7, title: "Product Manager", orgName: "Notion", location: "New York, NY", salary: "$125k–$160k", type: "Full-time", experience: "Senior", skills: ["Product Strategy", "Roadmapping", "Agile"], createdAt: "2026-05-07", description: "Define the future of productivity tools." },
  { id: 8, title: "Frontend Developer", orgName: "Vercel", location: "Remote", salary: "$95k–$130k", type: "Contract", experience: "Entry", skills: ["Next.js", "React", "Tailwind"], createdAt: "2026-05-03", description: "Build the web's fastest deployment platform." },
];

const jobTypes = ["Full-time", "Part-time", "Contract", "Internship"];
const experienceLevels = ["Entry", "Mid", "Senior", "Lead"];

// Generate a consistent gradient color from org name
function orgColor(name = "") {
  const colors = [
    "from-blue-500 to-blue-600", "from-purple-500 to-violet-600",
    "from-red-500 to-red-600", "from-indigo-500 to-indigo-600",
    "from-orange-500 to-amber-500", "from-green-500 to-emerald-600",
    "from-slate-600 to-slate-700", "from-slate-800 to-slate-900",
    "from-pink-500 to-rose-500", "from-cyan-500 to-teal-500",
  ];
  return colors[(name.charCodeAt(0) || 0) % colors.length];
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)} week${Math.floor(diff / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(diff / 30)} month${Math.floor(diff / 30) > 1 ? "s" : ""} ago`;
}

const jobTypeFilters = ["Full-time", "Part-time", "Contract", "Internship"];
const experienceFilters = ["Entry", "Mid", "Senior", "Lead"];

export default function JobsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("jobseekerUser");
    setIsLoggedIn(!!stored);
  }, []);

  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "saved"
  const [jobs, setJobs] = useState(dummyJobs);
  const [savedJobObjects, setSavedJobObjects] = useState([]); // full job objects for saved tab
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [sortBy, setSortBy] = useState("Newest");
  const [savedJobIds, setSavedJobIds] = useState([]); // just IDs for bookmark state
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [toast, setToast] = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilters, setActiveFilters] = useState({ jobTypes: [], experience: [] });

  // Load real jobs
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const params = new URLSearchParams({ page: currentPage });
        if (searchQuery) params.set("search", searchQuery);
        if (locationQuery) params.set("location", locationQuery);
        const res = await fetch(`/api/proxy/jobseeker/jobs?${params}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.jobs || data.data || (Array.isArray(data) ? data : []);
          if (list.length > 0) {
            setJobs(list.map(j => ({ ...j, id: j._id || j.id || String(Math.random()) })));
          }
        }
      } catch {}
    };
    loadJobs();
  }, [currentPage]);

  // Load saved jobs (IDs + full objects for saved tab)
  useEffect(() => {
    if (!isLoggedIn) return;
    const loadSaved = async () => {
      try {
        const res = await fetch("/api/proxy/jobseeker/savedJobs", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.savedJobs || data.jobs || (Array.isArray(data) ? data : []);
          if (list.length > 0 && typeof list[0] === "object") {
            const normalised = list.map(j => ({ ...j, id: j._id || j.id }));
            setSavedJobObjects(normalised);
            setSavedJobIds(normalised.map(j => j.id));
          } else {
            setSavedJobIds(list.map(j => String(j._id || j)));
          }
        }
      } catch {}
    };
    loadSaved();
  }, [isLoggedIn]);

  // Load applied jobs to show "Applied" state on reload
  useEffect(() => {
    if (!isLoggedIn) return;
    const loadApplied = async () => {
      try {
        const res = await fetch("/api/proxy/jobseeker/applications", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const apps = data.applications || data.data || (Array.isArray(data) ? data : []);
          const ids = apps.map(a => String(a.jobId || a.job_id || "")).filter(Boolean);
          setAppliedJobIds(ids);
        }
      } catch {}
    };
    loadApplied();
  }, [isLoggedIn]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleFilter = (category, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ jobTypes: [], experience: [] });
    setSearchQuery("");
    setLocationQuery("");
  };

  const toggleSave = async (job) => {
    if (!isLoggedIn) { router.push("/jobseeker/login"); return; }
    const jobId = String(job.id || job._id);
    const isCurrentlySaved = savedJobIds.includes(jobId);
    // Optimistic update
    if (isCurrentlySaved) {
      setSavedJobIds(prev => prev.filter(id => id !== jobId));
      setSavedJobObjects(prev => prev.filter(j => String(j.id) !== jobId));
    } else {
      setSavedJobIds(prev => [...prev, jobId]);
      setSavedJobObjects(prev => [...prev, { ...job, id: jobId }]);
    }
    try {
      await fetch("/api/proxy/jobseeker/saveJob", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
    } catch {}
    showToast(isCurrentlySaved ? "Job removed from saved" : "Job saved!", "success");
  };

  const handleApply = async (job) => {
    if (!isLoggedIn) { router.push("/jobseeker/login"); return; }
    const jobId = String(job.id || job._id);
    if (appliedJobIds.includes(jobId)) return;
    try {
      const res = await fetch("/api/proxy/jobseeker/apply", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (res.status === 409) {
        setAppliedJobIds(prev => [...prev, jobId]);
        showToast("Already applied to this job.");
        return;
      }
      if (!res.ok) {
        const d = await res.json();
        showToast(d?.detail || "Application failed.", "error");
        return;
      }
    } catch {}
    setAppliedJobIds(prev => [...prev, jobId]);
    showToast(`Application submitted to ${job.orgName || job.company || "company"}!`);
  };

  const allActiveFilters = [
    ...activeFilters.jobTypes.map(v => ({ category: "jobTypes", value: v })),
    ...activeFilters.experience.map(v => ({ category: "experience", value: v })),
  ];

  const filteredJobs = jobs.filter(job => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q ||
      (job.title || "").toLowerCase().includes(q) ||
      (job.orgName || job.company || "").toLowerCase().includes(q) ||
      (job.skills || []).some(s => s.toLowerCase().includes(q));
    const matchLoc = !locationQuery || (job.location || "").toLowerCase().includes(locationQuery.toLowerCase());
    const matchType = activeFilters.jobTypes.length === 0 || activeFilters.jobTypes.includes(job.type);
    const matchExp = activeFilters.experience.length === 0 || activeFilters.experience.includes(job.experience);
    return matchSearch && matchLoc && matchType && matchExp;
  });

  // Job card renderer — shared between browse and saved tabs
  const renderJobCard = (job) => {
    const jobId = String(job.id || job._id);
    const isSaved = savedJobIds.includes(jobId);
    const isApplied = appliedJobIds.includes(jobId);
    const company = job.orgName || job.company || "Company";
    const color = job.color || orgColor(company);
    const initial = company.charAt(0).toUpperCase();
    const posted = job.posted || timeAgo(job.createdAt);

    return (
      <div key={jobId} className="bg-white rounded-2xl border border-slate-100 p-5 hover:shadow-lg hover:border-blue-100 transition-all duration-300 group">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-md`}>
            {initial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h3>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> {company}
                </p>
              </div>
              <button
                onClick={() => toggleSave(job)}
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isSaved ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                }`}
              >
                {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {job.location && <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>}
              {job.salary && <span className="flex items-center gap-1 text-xs text-slate-500"><DollarSign className="w-3.5 h-3.5" /> {job.salary}</span>}
              {posted && <span className="flex items-center gap-1 text-xs text-slate-500"><Clock className="w-3.5 h-3.5" /> {posted}</span>}
              {job.type && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700">{job.type}</span>}
              {job.experience && <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-700">{job.experience}</span>}
            </div>
            {(job.skills || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(job.skills || []).slice(0, 5).map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg">{skill}</span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
          <p className="text-xs text-slate-400 line-clamp-1 flex-1 mr-4">{job.description || ""}</p>
          <button
            onClick={() => handleApply(job)}
            disabled={isApplied}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 whitespace-nowrap ${
              isApplied
                ? "bg-green-50 text-green-600 cursor-default"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 hover:shadow-md"
            }`}
          >
            {isApplied ? <><CheckCircle2 className="w-4 h-4" /> Applied</> : <>Apply Now <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all duration-300 ${
          toast.type === "success" ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-red-500"
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header + Tabs */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Jobs</h1>
        <div className="flex items-center gap-1 bg-white rounded-xl border border-slate-200 shadow-sm p-1 w-fit">
          <button onClick={() => setActiveTab("browse")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${activeTab === "browse" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
            Browse Jobs
          </button>
          <button onClick={() => setActiveTab("saved")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${activeTab === "saved" ? "bg-blue-600 text-white shadow" : "text-slate-600 hover:bg-slate-100"}`}>
            <Bookmark className="w-3.5 h-3.5" />
            Saved Jobs
            {savedJobIds.length > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${activeTab === "saved" ? "bg-white/20 text-white" : "bg-blue-100 text-blue-700"}`}>
                {savedJobIds.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* SAVED JOBS TAB */}
      {activeTab === "saved" && (
        <div>
          {!isLoggedIn ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Login to view saved jobs</h3>
              <p className="text-slate-500 text-sm mb-4">Create an account or login to save and track jobs</p>
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => router.push("/jobseeker/login")}
                  className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Login
                </button>
                <button onClick={() => router.push("/jobseeker/register")}
                  className="px-5 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
                  Register
                </button>
              </div>
            </div>
          ) : savedJobObjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">No saved jobs yet</h3>
              <p className="text-slate-500 text-sm mb-4">Browse jobs and click the bookmark icon to save them here</p>
              <button onClick={() => setActiveTab("browse")}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-slate-500 mb-2">{savedJobObjects.length} saved job{savedJobObjects.length !== 1 ? "s" : ""}</p>
              {savedJobObjects.map(job => renderJobCard(job))}
            </div>
          )}
        </div>
      )}

      {/* BROWSE JOBS TAB */}
      {activeTab === "browse" && (
        <>
          {/* Search Bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-3 mb-6 flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3 flex-1 px-3 py-2 bg-slate-50 rounded-xl">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Job title, skills, or company" value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent" />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600"><X className="w-3.5 h-3.5" /></button>}
            </div>
            <div className="flex items-center gap-3 flex-1 px-3 py-2 bg-slate-50 rounded-xl">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Location or remote" value={locationQuery}
                onChange={e => setLocationQuery(e.target.value)}
                className="flex-1 text-sm text-slate-800 placeholder-slate-400 outline-none bg-transparent" />
            </div>
            <button onClick={() => setFilterOpen(!filterOpen)}
              className="sm:hidden flex items-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium">
              <SlidersHorizontal className="w-4 h-4" /> Filters
              {allActiveFilters.length > 0 && <span className="w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">{allActiveFilters.length}</span>}
            </button>
          </div>

          <div className="flex gap-6">
            {/* Filter Sidebar */}
            <aside className={`${filterOpen ? "block" : "hidden"} sm:block w-full sm:w-56 flex-shrink-0`}>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm"><Filter className="w-4 h-4 text-blue-600" /> Filters</h3>
                  {allActiveFilters.length > 0 && <button onClick={clearAllFilters} className="text-xs text-red-500 font-medium">Clear all</button>}
                </div>
                <div className="mb-5">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Job Type</h4>
                  <div className="space-y-1.5">
                    {jobTypeFilters.map(type => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => toggleFilter("jobTypes", type)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${activeFilters.jobTypes.includes(type) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}>
                          {activeFilters.jobTypes.includes(type) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm text-slate-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Experience</h4>
                  <div className="space-y-1.5">
                    {experienceFilters.map(level => (
                      <label key={level} className="flex items-center gap-2 cursor-pointer group">
                        <div onClick={() => toggleFilter("experience", level)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${activeFilters.experience.includes(level) ? "bg-blue-600 border-blue-600" : "border-slate-300 group-hover:border-blue-400"}`}>
                          {activeFilters.experience.includes(level) && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                        </div>
                        <span className="text-sm text-slate-600">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-800">{filteredJobs.length} jobs found</span>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                  className="text-sm font-medium text-slate-700 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-blue-400 bg-white cursor-pointer">
                  {["Newest", "Relevance", "Salary (High to Low)"].map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>

              {/* Active filter chips */}
              {allActiveFilters.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {allActiveFilters.map(({ category, value }) => (
                    <span key={`${category}-${value}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                      {value}
                      <button onClick={() => toggleFilter(category, value)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}

              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
                  <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">No jobs found</h3>
                  <p className="text-slate-500 text-sm mb-4">Try adjusting your filters or search terms</p>
                  <button onClick={clearAllFilters} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Clear Filters</button>
                </div>
              ) : (
                <div className="space-y-4">{filteredJobs.map(job => renderJobCard(job))}</div>
              )}

              {/* Pagination */}
              {filteredJobs.length > 0 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
                  {[1, 2, 3].map(page => (
                    <button key={page} onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 text-sm font-semibold rounded-xl transition-all ${currentPage === page ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "text-slate-600 border border-slate-200 hover:bg-slate-50"}`}>
                      {page}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(p => Math.min(3, p + 1))} disabled={currentPage === 3}
                    className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

