"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  FileText,
  Edit2,
  TrendingUp,
  Search,
  Eye,
  Sparkles,
  Play,
  ChevronRight,
} from "lucide-react";

const stageColors = {
  Applied: "#2563eb", Screening: "#d97706", "HR Round": "#db2777",
  "Tech Round": "#7c3aed", "Manager Round": "#ea580c", Interview: "#4f46e5",
  Offer: "#059669", Rejected: "#dc2626", Hired: "#16a34a",
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [greeting, setGreeting] = useState("Good morning");
  const [applications, setApplications] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [loadingApps, setLoadingApps] = useState(true);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem("jobseekerUser");
    if (!stored) { router.push("/tfgjobs/jobseeker/login"); return; }
    setUser(JSON.parse(stored));
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    const loadData = async () => {
      try {
        const [profileRes, appsRes, savedRes] = await Promise.all([
          fetch("/api/proxy/jobseeker/profile", { credentials: "include" }),
          fetch("/api/proxy/jobseeker/applications", { credentials: "include" }),
          fetch("/api/proxy/jobseeker/savedJobs", { credentials: "include" }),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          const p = data.profile || data.jobSeeker || data;
          const completion = p.profileCompletion || 0;
          setProfileCompletion(completion);
          const u = JSON.parse(stored);
          const updatedUser = { ...u, name: p.name || u.name, phone: p.phone || u.phone, profileCompletion: completion };
          localStorage.setItem("jobseekerUser", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        if (appsRes.ok) {
          const data = await appsRes.json();
          setApplications(data.applications || data.data || (Array.isArray(data) ? data : []));
        }
        if (savedRes.ok) {
          const data = await savedRes.json();
          const list = data.savedJobs || data.jobs || (Array.isArray(data) ? data : []);
          setSavedCount(list.length);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoadingApps(false);
      }
    };
    loadData();
  }, []);

  const interviewCount = applications.filter(a =>
    ["HR Round","Tech Round","Manager Round","Interview","Screening"].includes(a.stage)
  ).length;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[0] || "User";

  return (
    <div className="min-h-screen bg-white">

      {/* Colored top strip */}
      <div className="h-48 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="max-w-6xl mx-auto px-5 -mt-28 relative z-10 pb-10">

        {/* Welcome + Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-indigo-200 text-sm font-medium">{greeting}</p>
            <h1 className="text-white text-2xl sm:text-3xl font-extrabold mt-0.5">{firstName}&apos;s Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link href="/tfgjobs/jobseeker/profile" className="px-3.5 py-2 text-xs font-semibold text-white/90 bg-white/10 border border-white/20 rounded-lg backdrop-blur-sm hover:bg-white/20 transition">
              <Edit2 className="w-3.5 h-3.5 inline mr-1" />Profile
            </Link>
            <Link href="/tfgjobs/jobseeker/jobs" className="px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-white rounded-lg shadow-sm hover:bg-indigo-50 transition">
              <Search className="w-3.5 h-3.5 inline mr-1" />Find Jobs
            </Link>
          </div>
        </div>

        {/* Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-1">Applications</p>
            <p className="text-3xl font-extrabold text-gray-900">{applications.length || 0}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[10px] text-gray-400">Total sent</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-1">Interviews</p>
            <p className="text-3xl font-extrabold text-gray-900">{interviewCount}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-purple-500" />
              <span className="text-[10px] text-gray-400">Scheduled</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-1">Profile Score</p>
            <p className="text-3xl font-extrabold text-gray-900">{profileCompletion}<span className="text-lg text-gray-400">%</span></p>
            <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-5 border border-gray-100">
            <p className="text-xs font-semibold text-gray-400 mb-1">Saved Jobs</p>
            <p className="text-3xl font-extrabold text-gray-900">{savedCount}</p>
            <div className="mt-3 flex items-center gap-1.5">
              <BookmarkCheck className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[10px] text-gray-400">Bookmarked</span>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Applications List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-800 text-sm">Recent Applications</h2>
                <Link href="/tfgjobs/jobseeker/jobs" className="text-xs text-indigo-600 font-semibold hover:underline">See all</Link>
              </div>

              {loadingApps ? (
                <div className="p-8 flex justify-center">
                  <div className="w-5 h-5 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-7 h-7 text-indigo-300" />
                  </div>
                  <p className="font-semibold text-gray-700">No applications yet</p>
                  <p className="text-xs text-gray-400 mt-1 mb-4">Your job applications will appear here</p>
                  <Link href="/tfgjobs/jobseeker/jobs" className="text-sm text-indigo-600 font-semibold hover:underline">
                    Start applying →
                  </Link>
                </div>
              ) : (
                <div>
                  {applications.slice(0, 5).map((app, idx) => {
                    const jobTitle = app.jobTitle || app.title || app.job?.title || app.jobDetails?.title || "Position";
                    const company = app.companyName || app.orgName || app.organizationName || app.job?.orgName || app.jobDetails?.orgName || "";
                    const stage = app.stage || app.status || "Applied";
                    const appliedAt = app.appliedAt || app.createdAt || app.applied_at;
                    const appId = app._id || app.id || String(Math.random());
                    const color = stageColors[stage] || "#6b7280";

                    return (
                      <div key={appId} className="px-5 py-4 flex items-center gap-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: color, backgroundColor: `${color}20` }} />
                          {idx < Math.min(applications.length - 1, 4) && <div className="w-0.5 h-6 bg-gray-100 rounded-full" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{jobTitle}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{company}{appliedAt ? ` • ${new Date(appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: `${color}12`, color }}>
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">

            {/* Profile CTA */}
            {profileCompletion < 100 && (
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-indigo-200/40">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs font-bold text-indigo-200 uppercase">Complete Profile</span>
                </div>
                <p className="text-sm font-semibold mb-1">You&apos;re {profileCompletion}% there!</p>
                <p className="text-xs text-indigo-200 mb-4">A complete profile gets 3x more views from recruiters.</p>
                <Link href="/tfgjobs/jobseeker/profile"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition shadow-sm">
                  Complete Now <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase">Quick Actions</h3>
              </div>
              <div className="p-2">
                {[
                  { label: "Browse Jobs", sub: "Find new opportunities", icon: Search, color: "text-blue-600 bg-blue-50", href: "/tfgjobs/jobseeker/jobs" },
                  { label: "Update Resume", sub: "Keep it fresh", icon: FileText, color: "text-rose-600 bg-rose-50", href: "/tfgjobs/jobseeker/profile" },
                  { label: "Edit Profile", sub: "Add more details", icon: Edit2, color: "text-teal-600 bg-teal-50", href: "/tfgjobs/jobseeker/profile" },
                ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link key={a.label} href={a.href} className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition group">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${a.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">{a.label}</p>
                        <p className="text-[11px] text-gray-400">{a.sub}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition" />
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA Banner */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
              <Play className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-700">Ready for your next role?</p>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Thousands of companies hiring now</p>
              <Link href="/tfgjobs/jobseeker/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition">
                Explore Jobs <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
