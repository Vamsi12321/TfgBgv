"use client";
export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [orgName, setOrgName] = useState("Maihoo");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    
    // Detect organization name from subdomain (skip for localhost and IP addresses)
    if (!(host === "localhost" || host.startsWith("127.") || host.startsWith("192.168.") || /^\d+\.\d+\.\d+\.\d+$/.test(host))) {
      const parts = host.split(".");
      if (parts.length > 2 && parts[0] !== "www") {
        setOrgName(parts[0].toUpperCase());
      }
    }

    const existingUser = localStorage.getItem("bgvUser");
    const sessionCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bgvSession="));

    // ❌ Stale localStorage but no cookie → clear everything
    if (!sessionCookie && existingUser) {
      localStorage.removeItem("bgvUser");
      clearStaleCookies();
    }

    // Logged in → auto redirect
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

  if (!loaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#ff004f] border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }
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
      // SUCCESS LOGIN
      localStorage.setItem("bgvUser", JSON.stringify(data));

      // set bgvUser cookie (required for middleware RBAC)
      document.cookie = `bgvUser=${encodeURIComponent(
        JSON.stringify({
          role: data.role,
          userName: data.userName,
          email: data.email,
          organizationId: data.organizationId,
        })
      )}; Path=/; Max-Age=${60 * 60 * 2}; SameSite=Lax; Secure`;

      // session cookie
      document.cookie = `bgvSession=${data.token}; Path=/; Max-Age=${
        60 * 60 * 2
      }; SameSite=Lax; Secure`;

      setRedirecting(true);

      // role-based redirect
      const role = data.role?.toUpperCase();
      let redirectPath = "/";

      if (["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)) {
        redirectPath = "/superadmin/dashboard";
      } else if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)) {
        redirectPath = "/org/dashboard";
      }

      setTimeout(() => {
        router.replace(redirectPath);
      }, 300);
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Panel - Red Gradient with Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#ff004f] via-[#e60047] to-[#cc0040] relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl"></div>

        {/* Content - Logo at Top, Content Centered */}
        <div className="relative z-10 flex flex-col h-full w-full max-w-lg mx-auto px-12 py-8">
          {/* Logo at Top */}
          <div className="mb-auto">
            <Image
              src="/logos/maihooMain.png"
              alt="Maihoo"
              width={120}
              height={32}
              priority
              className="brightness-0 invert drop-shadow-2xl"
            />
          </div>

          {/* Welcome Message - Centered */}
          <div className="text-white mb-10 mt-auto">
            <h2 className="text-4xl font-black mb-4 leading-tight">
              Welcome to {orgName}
            </h2>
            <p className="text-xl text-white/90 font-semibold mb-2">
              Enterprise Background Verification
            </p>
            <p className="text-base text-white/75 leading-relaxed">
              Secure, Fast, and AI-Powered Platform
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4 w-full">
            {[
              { icon: "🔒", text: "Bank-Grade Security & Compliance" },
              { icon: "⚡", text: "Real-time Status Tracking" },
              { icon: "🤖", text: "AI-Powered Screening & Validation" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 group-hover:scale-110 transition-transform shadow-lg flex-shrink-0">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <span className="text-white/95 text-base font-semibold">{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 pt-8 border-t border-white/20 w-full mb-auto">
            <p className="text-white/60 text-sm font-semibold mb-3">Trusted by 500+ Organizations</p>
            <div className="flex items-center gap-4 text-white/80 text-xs font-bold">
              <span className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">ISO 27001</span>
              <span className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">SOC 2</span>
              <span className="px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">GDPR</span>
            </div>
          </div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Right Panel - White with Login Form */}
      <div className="flex-1 flex items-center justify-center bg-white relative overflow-hidden">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: 'radial-gradient(circle, #ff004f 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}></div>

        <div className="w-full max-w-md px-8 relative z-10 mt-16">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-10 text-center">
            <Image
              src="/logos/maihooMain.png"
              alt="Maihoo"
              width={140}
              height={38}
              priority
              className="mx-auto mb-4 drop-shadow-lg"
            />
            <p className="text-gray-600 text-sm font-semibold">Welcome to {orgName}</p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 font-medium">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    emailFocused ? "text-[#ff004f]" : "text-gray-400"
                  }`}
                >
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 
                    focus:border-[#ff004f] focus:ring-2 focus:ring-[#ff004f]/20 outline-none transition-all
                    hover:border-gray-300 bg-gray-50 focus:bg-white font-medium"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordFocused ? "text-[#ff004f]" : "text-gray-400"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 
                    focus:border-[#ff004f] focus:ring-2 focus:ring-[#ff004f]/20 outline-none transition-all
                    hover:border-gray-300 bg-gray-50 focus:bg-white font-medium"
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ff004f] transition-colors"
                  >
                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800 font-medium">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#ff004f] to-[#e60047] text-white py-3 rounded-lg font-bold
                hover:shadow-lg hover:shadow-[#ff004f]/30 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-500 mb-3">
              <Lock className="w-4 h-4" />
              <p className="text-sm font-semibold">Enterprise-grade encryption</p>
            </div>
            <p className="text-xs text-gray-400">
              Protected by industry-leading security standards
            </p>
          </div>
        </div>
      </div>

      {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#ff004f] border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-[#ff004f]/20 animate-ping"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}
