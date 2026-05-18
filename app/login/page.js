"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Brain,
  Users,
  FileText,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GitMerge,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const existingUser = localStorage.getItem("bgvUser");
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bgvSession="));

    if (!sessionCookie && existingUser) {
      localStorage.removeItem("bgvUser");
      clearStaleCookies();
    }

    if (sessionCookie && existingUser) {
      try {
        const user = JSON.parse(existingUser);
        const role = user.role?.toUpperCase();
        if (["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role))
          router.replace("/superadmin/dashboard");
        else if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role))
          router.replace("/org/dashboard");
      } catch {
        localStorage.removeItem("bgvUser");
        clearStaleCookies();
      }
    }
    setLoaded(true);
  }, []);

  function clearStaleCookies() {
    document.cookie = "bgvUser=; Path=/; Max-Age=0;";
    document.cookie = "bgvSession=; Path=/; Max-Age=0;";
    document.cookie = "bgvTemp=; Path=/; Max-Age=0;";
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/proxy/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.detail || "Login failed");
        return;
      }

      localStorage.setItem("bgvUser", JSON.stringify(data));
      document.cookie = `bgvUser=${encodeURIComponent(
        JSON.stringify({ role: data.role, userName: data.userName, email: data.email, organizationId: data.organizationId })
      )}; Path=/; Max-Age=${60 * 60 * 2}; SameSite=Lax; Secure`;
      document.cookie = `bgvSession=${data.token}; Path=/; Max-Age=${60 * 60 * 2}; SameSite=Lax; Secure`;

      setRedirecting(true);
      const role = data.role?.toUpperCase();
      let redirectPath = "/";
      if (["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)) redirectPath = "/superadmin/dashboard";
      else if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)) redirectPath = "/org/dashboard";

      setTimeout(() => router.replace(redirectPath), 300);
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #eef2f9 0%, #f0f4fa 50%, #f7f9fc 100%)" }}>
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "linear-gradient(135deg, #eef2f9 0%, #f0f4fa 50%, #f7f9fc 100%)" }}>

      {/* Left Panel - Features Showcase */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-400/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Top - Logo */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-black text-white">TFG Reports</span>
                <p className="text-[10px] text-blue-200 font-medium -mt-0.5">AI-Powered BGV Platform</p>
              </div>
            </Link>
          </div>

          {/* Middle - Hero Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-sm font-medium text-blue-100 mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Trusted by 100+ organizations</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-4">
              Hire, Verify &<br />
              <span className="bg-gradient-to-r from-cyan-300 to-blue-200 bg-clip-text text-transparent">Manage Smarter</span>
            </h1>
            <p className="text-base xl:text-lg text-blue-100/80 max-w-md leading-relaxed mb-8">
              Complete hiring pipeline with AI screening, multi-round interviews, instant BGV, and HRMS auto-onboarding.
            </p>

            {/* Feature Cards */}
            <div className="space-y-3">
              {[
                { icon: Brain, label: "AI Resume Screening", desc: "Score 100+ resumes in 60 seconds" },
                { icon: Users, label: "Smart Interviews", desc: "Multi-round with ratings & feedback" },
                { icon: ShieldCheck, label: "Instant BGV", desc: "12+ verification services, 48hr reports" },
                { icon: GitMerge, label: "Auto HRMS Onboarding", desc: "Hired → Verified → Onboarded seamlessly" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-white/[0.07] backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/[0.12] transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon className="w-4 h-4 text-blue-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{f.label}</p>
                    <p className="text-xs text-blue-200/60">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom - Trust */}
          <div className="flex items-center gap-6 text-xs text-blue-200/60">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>SOC 2 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-sm">

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-200">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-black text-slate-900">TFG Reports</span>
            </div>
          </div>

          {/* Form Header */}
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="text-sm text-slate-500 mt-1">Sign in to access your dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition hover:border-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition hover:border-slate-300"
                />
                {password.length > 0 && (
                  <button type="button" onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <button type="button" onClick={() => router.push("/forgot-password")}
                  className="text-xs font-medium text-blue-600 hover:text-blue-700 transition">
                  Forgot password?
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-700 font-medium">{errorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6 pt-6 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-400">
              Looking for jobs?{" "}
              <Link href="/tfgjobs/jobseeker/login" className="text-blue-600 font-semibold hover:underline">
                Job Seeker Login
              </Link>
            </p>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-[11px] text-slate-400">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>

      {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
          <h3 className="text-lg font-bold text-slate-800">Welcome back!</h3>
          <p className="text-sm text-slate-500 mt-1">Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  );
}
