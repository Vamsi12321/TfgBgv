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
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [orgName, setOrgName] = useState("TFG Reports");
  const [logoSrc, setLogoSrc] = useState("/logos/tfgLogo.jpeg");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    const parts = host.split(".");
    if (parts.length > 2 && parts[0] !== "www") {
      setOrgName(parts[0].toUpperCase());
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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
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
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Left Side - Enhanced Branding & Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 p-6 xl:p-8 flex-col justify-between relative overflow-hidden">
        {/* Enhanced Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 xl:w-96 xl:h-96 bg-gradient-to-br from-white/20 to-cyan-300/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 xl:w-96 xl:h-96 bg-gradient-to-br from-indigo-300/20 to-white/20 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 xl:w-32 xl:h-32 bg-white/10 rounded-full blur-2xl animate-bounce"></div>

        {/* Enhanced Logo */}
        <div className="relative z-10">
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl xl:rounded-3xl p-4 xl:p-6 inline-block shadow-2xl border border-white/20">
            <Image
              src={logoSrc}
              alt={`${orgName} Logo`}
              width={100}
              height={40}
              priority
              className="brightness-0 invert xl:w-[120px] xl:h-[48px]"
            />
          </div>
        </div>

        {/* Enhanced Content */}
        <div className="relative z-10 text-white">
          <h1 className="text-3xl xl:text-5xl 2xl:text-6xl font-black mb-4 xl:mb-6 leading-tight">
            Welcome to
            <br />
            <span className="bg-gradient-to-r from-cyan-200 to-white bg-clip-text text-transparent">
              {orgName}
            </span>
          </h1>
          <p className="text-lg xl:text-xl 2xl:text-2xl text-blue-100 mb-6 xl:mb-8 leading-relaxed font-medium">
            Enterprise Background Verification Platform
          </p>

          {/* Enhanced Features */}
          <div className="space-y-3 xl:space-y-4">
            {[
              { text: "Secure & Compliant Verification", icon: "🔒" },
              { text: "Real-time Status Tracking", icon: "📊" },
              { text: "AI-Powered Screening", icon: "🤖" },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 group">
                <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-xl xl:rounded-2xl bg-gradient-to-br from-white/20 to-cyan-300/20 flex items-center justify-center backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-lg xl:text-xl">{feature.icon}</span>
                </div>
                <span className="text-blue-50 text-sm xl:text-base font-medium group-hover:text-white transition-colors">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Illustration */}
        <div className="absolute bottom-8 right-8 xl:bottom-12 xl:right-12 opacity-30">
          <div className="w-48 h-48 xl:w-80 xl:h-80 rounded-full bg-gradient-to-br from-white/10 to-cyan-300/10 backdrop-blur-sm border border-white/20"></div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-6 text-center">
            <Image
              src={logoSrc}
              alt={`${orgName} Logo`}
              width={120}
              height={32}
              priority
              className="mx-auto mb-3"
            />
            <h2 className="text-xl font-bold text-gray-800">Welcome Back</h2>
            <p className="text-sm text-gray-600 mt-1">Sign in to your account</p>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block mb-6">
            <h2 className="text-2xl xl:text-3xl font-bold text-gray-800 mb-2">Sign In</h2>
            <p className="text-sm xl:text-base text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4 xl:space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-xs xl:text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                    emailFocused ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  className="w-full pl-10 pr-4 py-3 xl:py-3.5 border-2 border-gray-200 rounded-xl xl:rounded-2xl text-sm xl:text-base text-gray-900 placeholder-gray-400 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200
                    hover:border-gray-300 hover:shadow-md"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs xl:text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordFocused ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <Lock size={18} />
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
                  className="w-full pl-10 pr-10 py-3 xl:py-3.5 border-2 border-gray-200 rounded-xl xl:rounded-2xl text-sm xl:text-base text-gray-900 placeholder-gray-400 
                    focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-200
                    hover:border-gray-300 hover:shadow-md"
                />
                {password.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                )}
              </div>
              {/* Forgot Password Link */}
              <div className="text-right mt-2">
                <button
                  type="button"
                  onClick={() => router.push("/forgot-password")}
                  className="text-xs xl:text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg xl:rounded-xl animate-fadeIn">
                <AlertCircle
                  size={16}
                  className="text-red-600 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs xl:text-sm text-red-800">{errorMsg}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 xl:py-3.5 rounded-xl xl:rounded-2xl font-bold text-sm xl:text-base
                hover:shadow-2xl hover:shadow-blue-300 active:scale-[0.98] hover:from-blue-700 hover:to-indigo-700
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
                transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin relative z-10" />
                  <span className="relative z-10">Signing in...</span>
                </>
              ) : (
                <span className="relative z-10">Sign In</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-xs xl:text-sm text-gray-500">
            <p>Secured by enterprise-grade encryption</p>
          </div>
        </div>
      </div>

      {/* Redirecting Overlay */}
      {redirecting && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fadeIn">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Success!</h3>
            <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
          </div>
        </div>
      )}
    </div>
  );
}
