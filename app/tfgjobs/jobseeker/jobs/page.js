"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Bookmark, BookmarkCheck, Clock,
  DollarSign, Star, X, CheckCircle2, ArrowRight, Building2,
  Filter, Sparkles, TrendingUp, Users, Zap,
} from "lucide-react";

const FAKE_JOBS = [
  { id: "f1", title: "Senior React Developer", orgName: "Infosys", location: "Hyderabad", salary: "18L - 28L", type: "Full-time", experience: "Senior", skills: ["React", "TypeScript", "Redux", "Node.js"], createdAt: "2026-05-15", description: "Build scalable frontend applications for enterprise clients using modern React patterns." },
  { id: "f2", title: "Python Backend Engineer", orgName: "Wipro", location: "Bangalore", salary: "15L - 22L", type: "Full-time", experience: "Mid", skills: ["Python", "FastAPI", "PostgreSQL", "Docker"], createdAt: "2026-05-14", description: "Design and develop high-performance backend services and RESTful APIs." },
  { id: "f3", title: "DevOps Engineer", orgName: "TCS", location: "Remote", salary: "20L - 30L", type: "Full-time", experience: "Senior", skills: ["AWS", "Kubernetes", "Terraform", "CI/CD"], createdAt: "2026-05-13", description: "Manage cloud infrastructure and automate deployment pipelines at scale." },
  { id: "f4", title: "UI/UX Designer", orgName: "Zoho", location: "Chennai", salary: "12L - 18L", type: "Full-time", experience: "Mid", skills: ["Figma", "User Research", "Prototyping", "Design Systems"], createdAt: "2026-05-12", description: "Create beautiful, intuitive interfaces for millions of users worldwide." },
  { id: "f5", title: "Data Scientist", orgName: "Flipkart", location: "Bangalore", salary: "22L - 35L", type: "Full-time", experience: "Senior", skills: ["Python", "ML", "TensorFlow", "SQL", "Spark"], createdAt: "2026-05-11", description: "Build ML models to drive personalization and recommendation systems." },
  { id: "f6", title: "MERN Stack Developer", orgName: "Razorpay", location: "Hyderabad", salary: "14L - 20L", type: "Full-time", experience: "Mid", skills: ["MongoDB", "Express", "React", "Node.js"], createdAt: "2026-05-10", description: "Full-stack development for fintech payment solutions." },
  { id: "f7", title: "Product Manager", orgName: "PhonePe", location: "Bangalore", salary: "25L - 40L", type: "Full-time", experience: "Senior", skills: ["Product Strategy", "Agile", "Analytics", "Roadmapping"], createdAt: "2026-05-09", description: "Define product vision and drive execution for digital payments platform." },
  { id: "f8", title: "Flutter Developer", orgName: "Swiggy", location: "Remote", salary: "16L - 24L", type: "Contract", experience: "Mid", skills: ["Flutter", "Dart", "Firebase", "REST APIs"], createdAt: "2026-05-08", description: "Build cross-platform mobile experiences for food delivery app." },
  { id: "f9", title: "Cloud Architect", orgName: "HCL Tech", location: "Noida", salary: "30L - 45L", type: "Full-time", experience: "Lead", skills: ["AWS", "Azure", "Microservices", "System Design"], createdAt: "2026-05-07", description: "Design enterprise cloud solutions and lead migration projects." },
  { id: "f10", title: "QA Automation Engineer", orgName: "Freshworks", location: "Chennai", salary: "10L - 16L", type: "Full-time", experience: "Entry", skills: ["Selenium", "Java", "TestNG", "API Testing"], createdAt: "2026-05-06", description: "Build automated test frameworks for SaaS products." },
];
const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const EXP_LEVELS = ["Entry", "Mid", "Senior", "Lead"];

function orgGradient(name = "") {
  const g = ["from-blue-500 to-cyan-500","from-purple-500 to-violet-600","from-rose-500 to-pink-600","from-indigo-500 to-blue-600","from-amber-500 to-orange-500","from-emerald-500 to-teal-600","from-slate-600 to-slate-800","from-cyan-500 to-blue-500"];
  return g[(name.charCodeAt(0) || 0) % g.length];
}

function timeAgo(d) {
  if (!d) return "";
  const diff = Math.floor((Date.now() - new Date(d)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff/7)}w ago`;
  return `${Math.floor(diff/30)}mo ago`;
}

export default function JobsPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("browse");
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [savedJobObjects, setSavedJobObjects] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [search, setSearch] = useState("");
  const [locationQ, setLocationQ] = useState("");
  const [typeFilter, setTypeFilter] = useState([]);
  const [expFilter, setExpFilter] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("jobseekerUser");
    setIsLoggedIn(!!stored);
  }, []);

  // Load jobs
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/proxy/jobseeker/jobs", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const list = data.jobs || data.data || (Array.isArray(data) ? data : []);
          if (list.length > 0) setJobs(list.map(j => ({ ...j, id: j._id || j.id })));
          else setJobs(FAKE_JOBS);
        } else { setJobs(FAKE_JOBS); }
      } catch { setJobs(FAKE_JOBS); }
      finally { setLoading(false); }
    })();
  }, []);

  // Load saved + applied (only if logged in)
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        const [savedRes, appsRes] = await Promise.all([
          fetch("/api/proxy/jobseeker/savedJobs", { credentials: "include" }),
          fetch("/api/proxy/jobseeker/applications", { credentials: "include" }),
        ]);
        if (savedRes.ok) {
          const d = await savedRes.json();
          const list = d.savedJobs || d.jobs || (Array.isArray(d) ? d : []);
          if (list.length > 0 && typeof list[0] === "object") {
            const n = list.map(j => ({ ...j, id: j._id || j.id }));
            setSavedJobObjects(n);
            setSavedJobIds(n.map(j => j.id));
          } else { setSavedJobIds(list.map(j => String(j._id || j))); }
        }
        if (appsRes.ok) {
          const d = await appsRes.json();
          const apps = d.applications || d.data || (Array.isArray(d) ? d : []);
          setAppliedJobIds(apps.map(a => String(a.jobId || "")).filter(Boolean));
        }
      } catch {}
    })();
  }, [isLoggedIn]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleSave = async (job) => {
    if (!isLoggedIn) { router.push("/tfgjobs/jobseeker/login"); return; }
    const jobId = String(job.id);
    const isSaved = savedJobIds.includes(jobId);
    if (isSaved) { setSavedJobIds(p => p.filter(id => id !== jobId)); setSavedJobObjects(p => p.filter(j => String(j.id) !== jobId)); }
    else { setSavedJobIds(p => [...p, jobId]); setSavedJobObjects(p => [...p, { ...job, id: jobId }]); }
    try { await fetch("/api/proxy/jobseeker/saveJob", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) }); } catch {}
    showToast(isSaved ? "Removed from saved" : "Job saved!");
  };

  const handleApply = async (job) => {
    if (!isLoggedIn) { router.push("/tfgjobs/jobseeker/login"); return; }
    const jobId = String(job.id);
    if (appliedJobIds.includes(jobId)) return;
    try {
      const res = await fetch("/api/proxy/jobseeker/apply", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) });
      if (res.status === 409) { setAppliedJobIds(p => [...p, jobId]); showToast("Already applied"); return; }
      if (!res.ok) { showToast("Application failed"); return; }
    } catch {}
    setAppliedJobIds(p => [...p, jobId]);
    showToast("Application submitted!");
  };

  const toggleType = (t) => setTypeFilter(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleExp = (e) => setExpFilter(p => p.includes(e) ? p.filter(x => x !== e) : [...p, e]);

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchSearch = !q || (j.title||"").toLowerCase().includes(q) || (j.orgName||j.company||"").toLowerCase().includes(q) || (j.skills||[]).some(s => s.toLowerCase().includes(q));
    const matchLoc = !locationQ || (j.location||"").toLowerCase().includes(locationQ.toLowerCase());
    const matchType = typeFilter.length === 0 || typeFilter.includes(j.type);
    const matchExp = expFilter.length === 0 || expFilter.includes(j.experience);
    return matchSearch && matchLoc && matchType && matchExp;
  });

  const renderCard = (job) => {
    const jobId = String(job.id);
    const isSaved = savedJobIds.includes(jobId);
    const isApplied = appliedJobIds.includes(jobId);
    const company = job.orgName || job.company || "Company";
    const gradient = orgGradient(company);

    return (
      <div key={jobId} className="bg-white rounded-2xl border border-gray-100 p-0 hover:shadow-2xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
        {/* Top gradient line */}
        <div className={`h-1 bg-gradient-to-r ${gradient}`} />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-bold flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              {company.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold text-gray-900 group-hover:text-blue-600 transition leading-tight">{job.title}</h3>
                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" /> {company}
                  </p>
                </div>
                <button onClick={() => toggleSave(job)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${isSaved ? "bg-blue-100 text-blue-600 shadow-sm" : "bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600"}`}>
                  {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-3">
                {job.location && <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg"><MapPin className="w-3.5 h-3.5 text-blue-500" /> {job.location}</span>}
                {job.salary && <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg"><DollarSign className="w-3.5 h-3.5 text-green-500" /> {job.salary}</span>}
                {job.createdAt && <span className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-2.5 py-1 rounded-lg"><Clock className="w-3.5 h-3.5 text-amber-500" /> {timeAgo(job.createdAt)}</span>}
              </div>

              <div className="flex flex-wrap gap-1.5 mt-4">
                {job.type && <span className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border border-purple-100">{job.type}</span>}
                {job.experience && <span className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-100">{job.experience}</span>}
                {(job.skills||[]).slice(0, 4).map(s => (
                  <span key={s} className="px-3 py-1.5 text-[11px] font-medium rounded-lg bg-gray-50 text-gray-700 border border-gray-100">{s}</span>
                ))}
                {(job.skills||[]).length > 4 && <span className="px-3 py-1.5 text-[11px] font-bold rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">+{job.skills.length - 4}</span>}
              </div>
            </div>
          </div>

          {/* Description + Apply */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
            <p className="text-xs text-gray-400 line-clamp-1 flex-1 mr-4">{job.description || ""}</p>
            <button onClick={() => handleApply(job)} disabled={isApplied}
              className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                isApplied ? "bg-green-50 text-green-600 border border-green-200" : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:scale-[1.03]"
              }`}>
              {isApplied ? <><CheckCircle2 className="w-4 h-4" /> Applied</> : <>Apply Now <ArrowRight className="w-4 h-4" /></>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-xl shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-8 mb-6 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white">Explore Opportunities</h1>
                <p className="text-blue-100 mt-1 text-sm">Discover roles that match your skills and career goals</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 backdrop-blur-sm text-white rounded-full font-medium text-xs border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {filtered.length} jobs live
                </span>
                <div className="flex gap-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-1">
                  <button onClick={() => setActiveTab("browse")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition ${activeTab === "browse" ? "bg-white text-indigo-700 shadow" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                    Browse
                  </button>
                  <button onClick={() => setActiveTab("saved")}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${activeTab === "saved" ? "bg-white text-indigo-700 shadow" : "text-white/80 hover:text-white hover:bg-white/10"}`}>
                    <Bookmark className="w-3.5 h-3.5" /> Saved
                    {savedJobIds.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20">{savedJobIds.length}</span>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAVED TAB */}
        {activeTab === "saved" && (
          <div>
            {!isLoggedIn ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">Login to view saved jobs</h3>
                <p className="text-gray-500 text-sm mb-5">Create an account to save and track jobs</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => router.push("/tfgjobs/jobseeker/login")} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl shadow-md">Login</button>
                  <button onClick={() => router.push("/tfgjobs/jobseeker/register")} className="px-5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50">Register</button>
                </div>
              </div>
            ) : savedJobObjects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-700 mb-2">No saved jobs yet</h3>
                <p className="text-gray-500 text-sm mb-4">Click the bookmark icon on any job to save it</p>
                <button onClick={() => setActiveTab("browse")} className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl">Browse Jobs</button>
              </div>
            ) : (
              <div className="space-y-4">{savedJobObjects.map(j => renderCard(j))}</div>
            )}
          </div>
        )}

        {/* BROWSE TAB */}
        {activeTab === "browse" && (
          <div className="flex gap-6">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-gray-900 text-sm flex items-center gap-2"><Filter className="w-4 h-4 text-indigo-600" /> Filters</h3>
                  {(typeFilter.length > 0 || expFilter.length > 0) && (
                    <button onClick={() => { setTypeFilter([]); setExpFilter([]); }} className="text-xs text-red-500 font-bold hover:text-red-700 transition">Clear all</button>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Job Type</h4>
                  <div className="space-y-2">
                    {JOB_TYPES.map(t => (
                      <label key={t} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={typeFilter.includes(t)} onChange={() => toggleType(t)} className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                        <span className="text-sm text-gray-700 font-medium group-hover:text-indigo-600 transition">{t}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-5">
                  <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3">Experience Level</h4>
                  <div className="space-y-2">
                    {EXP_LEVELS.map(e => (
                      <label key={e} className="flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" checked={expFilter.includes(e)} onChange={() => toggleExp(e)} className="w-4 h-4 rounded border-gray-300 accent-indigo-600" />
                        <span className="text-sm text-gray-700 font-medium group-hover:text-indigo-600 transition">{e}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="flex-1 min-w-0 space-y-5">
              {/* Search */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
                <div className="flex items-center gap-2.5 flex-1 px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                  <Search className="w-4 h-4 text-indigo-500" />
                  <input type="text" placeholder="Search by title, skills, or company..." value={search} onChange={e => setSearch(e.target.value)}
                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium" />
                  {search && <button onClick={() => setSearch("")} className="text-gray-400 hover:text-red-500 transition"><X className="w-4 h-4" /></button>}
                </div>
                <div className="flex items-center gap-2.5 flex-1 px-4 py-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-100">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <input type="text" placeholder="City, state, or remote..." value={locationQ} onChange={e => setLocationQ(e.target.value)}
                    className="flex-1 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent font-medium" />
                </div>
                <button className="px-5 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 whitespace-nowrap">
                  <Search className="w-4 h-4" /> Search
                </button>
              </div>

              {/* Results */}
              {loading ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 flex flex-col items-center">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                  <p className="text-sm text-gray-500">Loading jobs...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-700 mb-2">No jobs found</h3>
                  <p className="text-gray-500 text-sm mb-4">Try adjusting your search or filters</p>
                  <button onClick={() => { setSearch(""); setLocationQ(""); setTypeFilter([]); setExpFilter([]); }}
                    className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl">Clear Filters</button>
                </div>
              ) : (
                <div className="space-y-4">{filtered.map(j => renderCard(j))}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
