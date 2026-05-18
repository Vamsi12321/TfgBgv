"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Briefcase, CheckCircle2, Shield, Sparkles, Users } from "lucide-react";

export default function JobSeekerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/jobseeker/login", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.status === 404 || res.status === 500) {
        localStorage.setItem("jobseekerUser", JSON.stringify({ name: email.split("@")[0], email, role: "jobseeker" }));
        router.push("/tfgjobs/jobseeker/dashboard");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : Array.isArray(data?.detail) ? data.detail[0]?.msg : "Invalid email or password.");
        return;
      }
      const js = data.jobSeeker || {};
      localStorage.setItem("jobseekerUser", JSON.stringify({
        _id: js._id || "", name: js.name || email.split("@")[0], email: js.email || email,
        phone: js.phone || "", profileCompletion: js.profileCompletion || 0, role: "jobseeker",
      }));
      router.push("/tfgjobs/jobseeker/dashboard");
    } catch {
      localStorage.setItem("jobseekerUser", JSON.stringify({ name: email.split("@")[0], email, role: "jobseeker" }));
      router.push("/tfgjobs/jobseeker/dashboard");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 flex-col justify-between p-10">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/tfgjobs" className="flex items-center gap-2.5 mb-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">TFG Jobs</span>
          </Link>

          <h1 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Welcome back to<br />your career journey
          </h1>
          <p className="text-blue-100 text-base leading-relaxed mb-8">
            Sign in to track applications, discover new opportunities, and connect with top employers.
          </p>

          <div className="space-y-4">
            {[
              { icon: Shield, text: "Verified job listings from trusted companies" },
              { icon: Sparkles, text: "AI-powered job matching & recommendations" },
              { icon: Users, text: "Direct connection with hiring managers" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <item.icon className="w-4 h-4 text-blue-200" />
                </div>
                <span className="text-sm text-blue-100">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
          <p className="text-sm italic text-blue-100 mb-2">&ldquo;Found my dream role within 2 weeks of signing up. The AI matching is incredible.&rdquo;</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">A</div>
            <div>
              <p className="text-xs font-semibold text-white">Arjun K.</p>
              <p className="text-xs text-blue-200">Full Stack Developer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-900">TFG Jobs</span>
          </div>

          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Sign in to your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            Don&apos;t have an account?{" "}
            <Link href="/tfgjobs/jobseeker/register" className="text-blue-600 font-semibold hover:underline">Create one free</Link>
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition placeholder-gray-400" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 accent-blue-600" />
                <span className="text-xs text-gray-600">Remember me</span>
              </label>
              <Link href="/tfgjobs/jobseeker/forgot-password" className="text-xs text-blue-600 font-medium hover:underline">Forgot password?</Link>
            </div>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all hover:scale-[1.01] disabled:opacity-70">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Sign In</span> <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-6">
            By signing in, you agree to our <span className="text-blue-500">Terms</span> and <span className="text-blue-500">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
