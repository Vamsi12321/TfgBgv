"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  User,
  Bell,
  Eye,
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Zap,
  FileText,
  Edit2,
} from "lucide-react";

const statusConfig = {
  Applied:        { color: "bg-blue-100 text-blue-700",   icon: Clock },
  Screening:      { color: "bg-yellow-100 text-yellow-700", icon: Eye },
  "HR Round":     { color: "bg-purple-100 text-purple-700", icon: Calendar },
  "Tech Round":   { color: "bg-indigo-100 text-indigo-700", icon: Calendar },
  "Manager Round":{ color: "bg-amber-100 text-amber-700",  icon: Calendar },
  Interview:      { color: "bg-purple-100 text-purple-700", icon: Calendar },
  Offer:          { color: "bg-green-100 text-green-700",  icon: CheckCircle2 },
  Rejected:       { color: "bg-red-100 text-red-700",      icon: XCircle },
  Hired:          { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
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
    if (!stored) { router.push("/jobseeker/login"); return; }
    setUser(JSON.parse(stored));
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Fetch real profile + applications
    const loadData = async () => {
      try {
        const [profileRes, appsRes, savedRes] = await Promise.all([
          fetch("/api/proxy/jobseeker/profile", { credentials: "include" }),
          fetch("/api/proxy/jobseeker/applications", { credentials: "include" }),
          fetch("/api/proxy/jobseeker/savedJobs", { credentials: "include" }),
        ]);
        if (profileRes.ok) {
          const data = await profileRes.json();
          // Response: { profile: { name, email, phone, profileJson: {...}, profileCompletion } }
          const p = data.profile || data.jobSeeker || data;
          const completion = p.profileCompletion || 0;
          setProfileCompletion(completion);
          const u = JSON.parse(stored);
          const updatedUser = {
            ...u,
            name: p.name || u.name,
            phone: p.phone || u.phone,
            profileCompletion: completion,
          };
          localStorage.setItem("jobseekerUser", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        if (appsRes.ok) {
          const data = await appsRes.json();
          const list = data.applications || data.data || (Array.isArray(data) ? data : []);
          setApplications(list);
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

  const stats = [
    { label: "Applications Sent", value: String(applications.length || 0), icon: Briefcase, bg: "bg-blue-50", text: "text-blue-600" },
    { label: "Interviews", value: String(applications.filter(a => ["HR Round","Tech Round","Manager Round","Interview","Screening"].includes(a.stage)).length || 0), icon: Calendar, bg: "bg-purple-50", text: "text-purple-600" },
    { label: "Profile Complete", value: `${profileCompletion}%`, icon: Eye, bg: "bg-cyan-50", text: "text-cyan-600" },
    { label: "Saved Jobs", value: String(savedCount), icon: BookmarkCheck, bg: "bg-orange-50", text: "text-orange-600" },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {greeting}, {user.name?.split(" ")[0]}! 👋
          </h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your job search today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <Link
            href="/jobseeker/profile"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-blue-200"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-bold text-amber-800">
                Your profile is {profileCompletion}% complete
              </span>
            </div>
            <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${profileCompletion}%` }}
              ></div>
            </div>
            <p className="text-xs text-amber-700">
              Complete your profile to get 3x more recruiter views
            </p>
          </div>
          <Link
            href="/jobseeker/profile"
            className="px-4 py-2 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors whitespace-nowrap"
          >
            Complete Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-200 group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${stat.text}`} />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Recent Applications</h2>
            <Link href="/jobseeker/jobs" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loadingApps ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No applications yet. <Link href="/jobseeker/jobs" className="text-blue-600 font-medium hover:underline">Browse jobs</Link></div>
            ) : (
              applications.slice(0, 5).map((app) => {
                // Handle all possible field names from backend
                // Job seeker applications may have: jobTitle, title, job.title, or just jobId
                const jobTitle = app.jobTitle || app.title || app.job?.title || app.jobDetails?.title || `Job ${(app.jobId || "").slice(-6)}`;
                const company = app.companyName || app.orgName || app.organizationName || app.job?.orgName || app.jobDetails?.orgName || "";
                const stage = app.stage || app.status || "Applied";
                const appliedAt = app.appliedAt || app.createdAt || app.applied_at;
                const appId = app._id || app.id || String(Math.random());

                const StatusIcon = statusConfig[stage]?.icon || Clock;
                const colors = ["from-blue-500 to-blue-600","from-purple-500 to-purple-600","from-pink-500 to-rose-500","from-indigo-500 to-indigo-600","from-green-500 to-emerald-600"];
                const color = colors[(jobTitle).charCodeAt(0) % colors.length];
                return (
                  <div key={appId} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                      {(company !== "—" ? company : jobTitle).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{jobTitle}</p>
                      <p className="text-xs text-slate-500">{company}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig[stage]?.color || "bg-gray-100 text-gray-600"}`}>
                        <StatusIcon className="w-3 h-3" />
                        {stage}
                      </span>
                      <span className="text-xs text-slate-400">
                        {appliedAt ? new Date(appliedAt).toLocaleDateString() : "—"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Completion Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              Profile Completion
            </h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-16 h-16">
                <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke="url(#grad)" strokeWidth="6"
                    strokeDasharray={`${2 * Math.PI * 28 * profileCompletion / 100} ${2 * Math.PI * 28}`}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
                  {profileCompletion}%
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">Almost there!</p>
                <p className="text-xs text-slate-500">Add missing info to boost visibility</p>
              </div>
            </div>
            <Link
              href="/jobseeker/profile"
              className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-xl hover:bg-blue-100 transition-colors"
            >
              Complete Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Quick Actions
            </h3>
            <div className="space-y-2">
              {[
                { label: "Update Resume", icon: FileText, href: "/jobseeker/profile", color: "text-blue-600 bg-blue-50 hover:bg-blue-100" },
                { label: "Browse Jobs", icon: Briefcase, href: "/jobseeker/jobs", color: "text-purple-600 bg-purple-50 hover:bg-purple-100" },
                { label: "Edit Profile", icon: Edit2, href: "/jobseeker/profile", color: "text-green-600 bg-green-50 hover:bg-green-100" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    href={action.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${action.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {action.label}
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Browse Jobs CTA */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white text-center">
        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Ready to find your next opportunity?</h2>
        <p className="text-blue-100 text-sm mb-5">Browse thousands of open positions across top companies</p>
        <Link href="/jobseeker/jobs"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg">
          Browse Jobs <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
