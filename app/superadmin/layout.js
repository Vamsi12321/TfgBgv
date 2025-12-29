"use client";
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useContext } from "react";
import Link from "next/link";
import Image from "next/image";
 import { logout } from "@/utils/logout";
import { usePathname } from "next/navigation";
import { SuperAdminStateProvider } from "../context/SuperAdminStateContext";

import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Receipt,
  ClipboardList,
  UserCheck,
  LogOut,
  UserCircle2,
  Menu,
  X,
  Headset,
  CheckCheck,
  FileBarChart,
  Brain,
  UserSearch,
  ScanSearch,
  Sparkles,
  ClipboardListIcon,
  GraduationCap,
  Award,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export default function SuperAdminLayout({ children }) {
  const pathname = usePathname();
  const { user: ctxUser } = useContext(useAuth) || {};
  const [user, setUser] = useState(ctxUser || null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [logoSrc] = useState("/logos/tfgLogo.jpeg");
  const profileRef = useRef(null);

  /* Load user from localStorage */
  useEffect(() => {
    if (!ctxUser) {
      try {
        const stored = localStorage.getItem("bgvUser");
        if (stored) setUser(JSON.parse(stored));
      } catch (e) {
        console.warn("Error loading user:", e);
      }
    }
  }, [ctxUser]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  /* Navigation Links */
  const links = [
    { name: "Dashboard", href: "/superadmin/dashboard", icon: LayoutDashboard },
    {
      name: "Organizations",
      href: "/superadmin/organizations",
      icon: Building2,
    },
    { name: "Users & Roles", href: "/superadmin/users", icon: Users },
    {
      name: "Candidates",
      href: "/superadmin/manage-candidates",
      icon: UserSearch,
    },
    {
      name: "Verifications",
      href: "/superadmin/verifications",
      icon: CheckCheck,
    },
    {
      name: "BGV Services",
      href: "/superadmin/bgv-requests",
      icon: ClipboardListIcon,
    },
    {
      name: "Self Verification",
      href: "/superadmin/self-verification",
      icon: UserCheck,
    },

    // AI Services
    { name: "AI Screening", href: "/superadmin/AI-screening", icon: Brain },
    {
      name: "AI CV Check",
      href: "/superadmin/AI-CV-Verification",
      icon: ScanSearch,
    },
    {
      name: "AI Edu Check",
      href: "/superadmin/AI-Edu-Verification",
      icon: GraduationCap,
    },

    { name: "Invoices", href: "/superadmin/invoices", icon: Receipt },
    {
      name: "Help Desk",
      href: "/superadmin/help-desk",
      icon: Headset,
    },
    { name: "Activity Logs", href: "/superadmin/logs", icon: FileBarChart },
    { name: "Reports", href: "/superadmin/reports", icon: FileText },
    // { name: "Certificates", href: "/superadmin/certificates", icon: Award },
  ];

  const role = user?.role?.toUpperCase() || "";
  let filteredLinks = [...links];

  if ((role === "HELPER") & (role === "ORG_HR")) {
    filteredLinks = filteredLinks.filter(
      (l) =>
        ![
          "/superadmin/logs",
          "/superadmin/invoices",
          "/superadmin/users",
        ].includes(l.href)
    );
  }

  if (role === "SUPER_ADMIN_HELPER") {
    filteredLinks = filteredLinks.filter(
      (l) =>
        ![
          "/superadmin/invoices",
          "/superadmin/logs",
          "/superadmin/organizations",
              "/superadmin/users",
        ].includes(l.href)
    );
  }

  /* ---------- BADGE STYLING (CONSISTENT & COMPACT) ---------- */
  const AIBadgeInactive = () => (
    <span
      className="ml-auto px-3 py-1.5 text-xs font-bold rounded-full 
      bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 text-blue-700 border border-blue-200 inline-flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 shadow-lg"
    >
      <Sparkles size={12} className="text-blue-600" />
      AI
    </span>
  );

  const AIBadgeActive = () => (
    <span
      className="ml-auto px-3 py-1.5 text-xs font-bold rounded-full 
      bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 text-white inline-flex items-center gap-1.5 shadow-2xl whitespace-nowrap flex-shrink-0 animate-pulse"
    >
      <Sparkles size={12} className="text-white animate-spin" />
      AI
    </span>
  );

  /* ---------- Logout Confirmation ---------- */
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setLoggingOut(true);
    setTimeout(() => logout(), 4000);
  };

  const displayName = user?.userName || user?.email || "Super Admin";

  return (
    <SuperAdminStateProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* ---------------- Sidebar - Compact ---------------- */}
        <aside
          className={`fixed top-0 left-0 z-40 h-full w-64 bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/50 backdrop-blur-sm border-r border-blue-100 shadow-2xl 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0`}
        >
          <div className="h-full flex flex-col">
            {/* Logo - Centered */}
            <header className="w-full px-4 py-4 flex justify-center items-center">
              <Image
                src={logoSrc}
                alt="Logo"
                width={80}
                height={30}
                priority
                className="hover:scale-105 transition-transform duration-300"
              />
            </header>

            {/* Navigation - Optimized Vertical Space */}
            <nav
              className="flex-1 overflow-y-auto sidebar-scroll px-2"
              style={{
                maxHeight: "calc(100vh - 90px)",
                paddingBottom: "4px",
              }}
            >
              {filteredLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                const isAIPage = [
                  "/superadmin/AI-screening",
                  "/superadmin/AI-CV-Verification",
                  "/superadmin/AI-Edu-Verification",
                ].includes(link.href);

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 mb-0.5 rounded-xl transition-all whitespace-nowrap text-sm group
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white font-bold shadow-2xl scale-[1.02] border-l-4 border-blue-300"
                          : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:via-indigo-50 hover:to-purple-50 hover:text-blue-700 font-semibold hover:scale-[1.01] hover:shadow-lg"
                      }`}
                  >
                    {Icon && <Icon size={20} className="flex-shrink-0" />}
                    <span className="flex-1 whitespace-nowrap">
                      {link.name}
                    </span>
                    {isAIPage &&
                      (isActive ? <AIBadgeActive /> : <AIBadgeInactive />)}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="border-t border-blue-100 pt-2 mt-1.5 px-2">
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 
                hover:bg-gradient-to-r hover:from-red-50 hover:via-pink-50 hover:to-red-100 hover:text-red-600 rounded-xl transition-all font-bold shadow-sm hover:shadow-lg hover:scale-[1.01]"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 backdrop-blur-[2px] bg-transparent z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* ---------------- Main Section ---------------- */}
        <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300 relative">
          {/* SUPERB ENHANCED HEADER */}
          <header
            className="fixed top-0 left-0 md:left-64 right-0 bg-gradient-to-r from-white via-blue-50/80 to-indigo-50/80 backdrop-blur-xl px-4 sm:px-6 py-3.5
            flex justify-between items-center shadow-2xl border-b border-blue-100 z-20 h-16"
          >
            <div className="flex items-center gap-4">
              <button
                className="md:hidden text-gray-700 hover:text-[#0066cc] transition-colors p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
              </button>

              <div className="flex items-center gap-3">
                <UserCircle2 
                  size={32} 
                  className="hidden sm:block text-[#0066cc] flex-shrink-0" 
                  strokeWidth={2}
                />
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-800 leading-tight">
                    Welcome back,{" "}
                    <span className="bg-gradient-to-r from-[#0066cc] to-[#0080ff] bg-clip-text text-transparent">
                      {displayName.split(" ")[0]}
                    </span>
                    ! 👋
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block font-medium">Have a productive day</p>
                </div>
              </div>
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-all"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserCircle2 size={20} className="text-white" />
                </div>
                <span className="hidden sm:block text-sm font-semibold text-gray-700">
                  {displayName.split(" ")[0]}
                </span>
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border-2 border-gray-100 rounded-xl shadow-2xl py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b-2 border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <p className="font-bold text-gray-800">{displayName}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{user?.email}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {user?.role || "Admin"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      window.location.href = "/superadmin/manage-profile";
                      setProfileMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2.5 hover:bg-gradient-to-r hover:from-[#0066cc]/10 hover:to-[#0080ff]/10 text-gray-700 hover:text-[#0066cc] transition-all font-medium"
                  >
                    ⚙️ Manage Profile
                  </button>
                </div>
              )}
            </div>
          </header>

          {/* ---- Main Content - Adjusted for New Header ---- */}
          <main
            className="flex-1 overflow-y-auto p-3 sm:p-4 mt-16 custom-scroll"
            style={{ maxHeight: "calc(100vh - 64px)" }}
          >
            {children}
          </main>

          {/* Logout Loading Screen */}
          {loggingOut && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-gray-100 backdrop-blur-sm flex flex-col items-center justify-center z-[9999]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#0066cc] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-gray-800">Logging out...</p>
              </div>
            </div>
          )}

          {/* Logout Confirmation Modal - SUPERB UI */}
          {showLogoutModal && (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm flex items-center justify-center z-[999] animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-[90%] text-center transform animate-in slide-in-from-bottom-4 duration-300 border border-blue-100">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-100 via-pink-100 to-red-200 flex items-center justify-center shadow-lg">
                  <LogOut size={40} className="text-red-600" />
                </div>

                <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Confirm Logout
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Are you sure you want to logout from your account?<br />
                  You'll need to sign in again to access your dashboard.
                </p>

                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 font-semibold hover:from-gray-200 hover:to-gray-300 transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirmLogout}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 via-pink-500 to-red-600 text-white font-semibold hover:from-red-600 hover:via-pink-600 hover:to-red-700 transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
                  >
                    Yes, Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SuperAdminStateProvider>
  );
}
