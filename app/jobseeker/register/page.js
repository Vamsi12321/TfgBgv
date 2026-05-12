"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Upload, CheckCircle2, ArrowRight, Briefcase, User, Mail, Phone, Lock } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (!agreedToTerms) { setError("Please agree to the terms."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/proxy/jobseeker/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: `${firstName} ${lastName}`, email, phone, password }),
      });

      // If backend not ready yet, fall back to mock for UI testing
      if (res.status === 404 || res.status === 500) {
        localStorage.setItem("jobseekerUser", JSON.stringify({
          name: `${firstName} ${lastName}`, email, phone, role: "jobseeker",
        }));
        router.push("/jobseeker/dashboard");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data?.detail?.[0]?.msg || data?.detail || "Registration failed.");
        return;
      }
      // Register response has: { message, token, jobSeeker: { _id, name, email, phone, profileCompletion } }
      const js = data.jobSeeker || {};
      localStorage.setItem("jobseekerUser", JSON.stringify({
        _id: js._id || "",
        name: js.name || `${firstName} ${lastName}`,
        email: js.email || email,
        phone: js.phone || phone,
        profileCompletion: js.profileCompletion || 0,
        role: "jobseeker",
      }));
      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        await fetch("/api/proxy/jobseeker/uploadResume", {
          method: "POST", credentials: "include", body: fd,
        });
      }
      router.push("/jobseeker/dashboard");
    } catch (err) {
      // Network error — still allow UI testing
      localStorage.setItem("jobseekerUser", JSON.stringify({
        name: `${firstName} ${lastName}`, email, phone, role: "jobseeker",
      }));
      router.push("/jobseeker/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full pl-8 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder-slate-400 text-slate-800";

  return (
    <div className="h-screen overflow-hidden flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[38%] bg-gradient-to-br from-blue-600 to-indigo-700 h-full flex-col justify-between p-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">TFG Jobs</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <CheckCircle2 className="w-3 h-3" /> Join 50K+ Professionals
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Start Your Journey</h1>
          <p className="text-xs text-blue-100 mb-4">Create your free account and unlock thousands of career opportunities.</p>
          <div className="space-y-1.5">
            {["Free access to 10,000+ job listings", "AI-powered job matching technology", "Direct messaging with recruiters", "Resume builder & career tools"].map((b) => (
              <div key={b} className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-200 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-blue-100">{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
          <p className="text-xs italic text-blue-100 mb-2">&ldquo;TFG Jobs helped me land my dream role at a top tech company within 3 weeks!&rdquo;</p>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">S</div>
            <div>
              <p className="text-xs font-semibold text-white">Sarah K.</p>
              <p className="text-xs text-blue-200">Software Engineer at Google</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white h-full overflow-y-auto">
        <div className="min-h-full flex items-start justify-center px-6 py-6">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-800">TFG Jobs</span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Create Account</h2>
            <p className="text-sm text-slate-500 mb-3">
              Already have an account?{" "}
              <Link href="/jobseeker/login" className="text-blue-600 font-semibold hover:underline">Sign in</Link>
            </p>

            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" required value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name</label>
                  <div className="relative">
                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type="text" required value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" className={inp} />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={inp} />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 9876543210" className={inp} />
                </div>
              </div>

              {/* Password row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 chars" className={inp + " pr-8"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm</label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat" className={inp + " pr-8"} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Resume upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resume <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-xl p-3 text-center transition-all cursor-pointer ${
                    dragOver ? "border-blue-400 bg-blue-50" : resumeFile ? "border-green-400 bg-green-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  {resumeFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-green-700 truncate max-w-[200px]">{resumeFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-0.5">
                      <Upload className="w-5 h-5 text-slate-400" />
                      <p className="text-xs text-slate-500"><span className="text-blue-600 font-semibold">Click to upload</span> or drag & drop</p>
                      <p className="text-xs text-slate-400">PDF, DOC, DOCX up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Terms */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} className="w-3.5 h-3.5 mt-0.5 rounded border-slate-300 accent-blue-600 flex-shrink-0" />
                <span className="text-xs text-slate-600">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Terms of Service</a>{" "}and{" "}
                  <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </span>
              </label>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ArrowRight className="w-4 h-4" /> Create Account</>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
