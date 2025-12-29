"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Loader2,
  AlertCircle,
  ArrowRight,
  Users,
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";

import StatsCard from "../../components/StatsCard";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/ui/Button";
import { useOrgState } from "../../context/OrgStateContext";

// Simple chart components to replace recharts temporarily
const SimpleBarChart = ({ data, colors }) => (
  <div className="h-[260px] sm:h-[300px] flex items-end justify-center gap-4 p-4">
    {Object.entries(data).map(([key, value], index) => (
      <div key={key} className="flex flex-col items-center gap-2">
        <div
          className="w-16 rounded-t-lg transition-all duration-500"
          style={{
            height: `${Math.max((value / Math.max(...Object.values(data))) * 200, 20)}px`,
            backgroundColor: colors[index] || '#0066cc'
          }}
        />
        <span className="text-xs font-medium text-gray-600 capitalize">{key}</span>
        <span className="text-sm font-bold text-gray-800">{value}</span>
      </div>
    ))}
  </div>
);

const SimplePieChart = ({ data, colors }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="h-[260px] sm:h-[300px] flex items-center justify-center">
      <div className="relative">
        <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800">{total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center space-y-2 ml-48">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index] }}
              />
              <span className="text-sm font-medium">{item.name}: {item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};



export default function OrgAdminDashboard() {
  const {
    dashboardData: data,
    setDashboardData: setData,
    dashboardLoading: loading,
    setDashboardLoading: setLoading,
  } = useOrgState();

  const [error, setError] = useState("");

  const [recentActivities, setRecentActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  /* ---------------------------------------------------
     FETCH RECENT ACTIVITY
  --------------------------------------------------- */
  useEffect(() => {
    const fetchRecent = async () => {
      try {
        setActivityLoading(true);

        const res = await fetch(
          `/api/proxy/secure/recentImportantActivity?noOfLogs=200`,
          { credentials: "include" }
        );

        const data = await res.json();

        if (res.ok && Array.isArray(data.logs)) {
          const formatted = data.logs
            .map((log) => {
              return {
                ...log,
                user: log.userName ?? "Unknown User",
                actionText: buildActivityMessage(log),
                time: timeAgo(log.timestamp),
                icon: getLogIcon(log.action).icon,
                iconColor: getLogIcon(log.action).color,
              };
            })
            .slice(0, 10);

          setRecentActivities(formatted);
        }
      } catch (err) {
        console.error("Recent activity error:", err);
      } finally {
        setActivityLoading(false);
      }
    };

    fetchRecent();
    const interval = setInterval(fetchRecent, 60000);
    return () => clearInterval(interval);
  }, []);

  /* ---------------------------------------------------
     FETCH DASHBOARD DATA
  --------------------------------------------------- */
  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only fetch if we don't have cached data
      if (data) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`/api/proxy/dashboard`, {
          credentials: "include",
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.detail || "Failed to load data");
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  /* ---------------------------------------------------
     LOADING UI
  --------------------------------------------------- */
  if (loading)
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 shadow-lg"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
          <div className="absolute inset-2 animate-pulse rounded-full h-12 w-12 bg-gradient-to-br from-blue-400 to-indigo-500 opacity-30"></div>
        </div>
        <p className="mt-8 text-gray-700 font-semibold text-lg animate-pulse">Loading dashboard...</p>
        <div className="mt-2 w-32 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertCircle className="text-red-600 mb-3" size={38} />
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          Error Loading Dashboard
        </h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );

  if (!data)
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <AlertCircle className="text-red-600 mb-3" size={38} />
        <h3 className="text-xl font-semibold text-gray-900 mb-1">
          No Data Available
        </h3>
        <p className="text-gray-600">Failed to load dashboard data.</p>
      </div>
    );

  /* ---------------------------------------------------
     PREPARE DATA
  --------------------------------------------------- */
  const { role, stats } = data;

  const COLORS = {
    completed: "#22c55e",
    ongoing: "#f59e0b",
    failed: "#ef4444",
    primary: "#3b82f6",
    secondary: "#f59e0b",
    final: "#22c55e",
  };

  const summaryStats = [
    {
      label: "Total Employees",
      value: stats?.totalEmployees || 0,
      color: "#5B6C8F",
      icon: Users,
    },
    {
      label: "Total Requests",
      value: stats?.totalRequests || 0,
      color: "#007BFF",
      icon: ClipboardList,
    },
    {
      label: "Ongoing",
      value: stats?.ongoingVerifications || 0,
      color: COLORS.ongoing,
      icon: Clock,
    },
    {
      label: "Completed",
      value: stats?.completedVerifications || 0,
      color: COLORS.completed,
      icon: CheckCircle2,
    },
    {
      label: "Failed",
      value: stats?.failedVerifications || 0,
      color: COLORS.failed,
      icon: XCircle,
    },
  ];

  const pieData = [
    {
      name: "Completed",
      value: stats?.completedVerifications || 0,
    },
    {
      name: "Ongoing",
      value: stats?.ongoingVerifications || 0,
    },
    {
      name: "Failed",
      value: stats?.failedVerifications || 0,
    },
  ];

  const stageData = [
    {
      stage: "Verification Stages",
      primary: stats?.stageBreakdown?.primary || 0,
      secondary: stats?.stageBreakdown?.secondary || 0,
      final: stats?.stageBreakdown?.final || 0,
    },
  ];

  /* ---------------------------------------------------
     ACTIVITY HELPERS
  --------------------------------------------------- */
  function buildActivityMessage(log) {
    const userName = log.userName || "Unknown User";
    const orgName = log.organizationName || "organization";
    const action = log.action || "performed action";
    const description = log.description || "";

    // Parse different types of activities
    if (action === "Verification Check Executed") {
      // Extract check name, stage, status, and candidate from description
      const checkMatch = description.match(/Check: ([^|]+)/);
      const stageMatch = description.match(/Stage: ([^|]+)/);
      const statusMatch = description.match(/Status: ([^|]+)/);
      const candidateMatch = description.match(/candidate: ([^|]+)/);

      const checkName = checkMatch ? checkMatch[1].trim().replace(/_/g, ' ') : 'verification';
      const stage = stageMatch ? stageMatch[1].trim() : '';
      const status = statusMatch ? statusMatch[1].trim() : '';
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';

      // Format check name to be more readable
      const formattedCheckName = formatCheckName(checkName);
      
      // Add status-specific context
      let statusContext = '';
      if (status === 'FAILED') {
        statusContext = ' - requires attention';
      } else if (status === 'PENDING') {
        statusContext = ' - awaiting manual review';
      } else if (status === 'COMPLETED') {
        statusContext = ' - successfully verified';
      }

      return `${userName} executed ${formattedCheckName} for ${candidate} in ${stage} stage (${status})${statusContext}`;
    }

    if (action === "Add Candidate") {
      // Extract candidate name, stopping at " in organization:" or end of string
      const candidateMatch = description.match(/(?:Added candidate: |candidate: )([^|]+?)(?:\s+in organization:|$)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : 'new candidate';
      return `${userName} added candidate ${candidate} to ${orgName}`;
    }

    if (action === "Edit Candidate") {
      // Extract candidate name, stopping at " in organization:" or end of string
      const candidateMatch = description.match(/Updated candidate: ([^|]+?)(?:\s+in organization:|$)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : 'candidate';
      return `${userName} updated candidate ${candidate}'s information in ${orgName}`;
    }

    if (action === "New Verification Initiated") {
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      return `${userName} initiated background verification process for ${candidate}`;
    }

    if (action === "Stage Initialized") {
      const stageMatch = description.match(/Stage: ([^|]+)/);
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const stage = stageMatch ? stageMatch[1].trim() : '';
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      return `${userName} started ${stage} verification stage for ${candidate}`;
    }

    if (action === "Self Verification Email Sent") {
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      return `${userName} sent self-verification email to ${candidate}`;
    }

    if (action === "Login") {
      return `${userName} logged into dashboard`;
    }

    if (action === "Logout") {
      return `${userName} logged out from dashboard`;
    }

    if (action === "Add User") {
      return `${userName} added a new team member`;
    }

    if (action === "Delete Candidate") {
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      return `${userName} removed candidate ${candidate}`;
    }

    if (action === "Retry Check") {
      const checkMatch = description.match(/Check: ([^|]+)/);
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const checkName = checkMatch ? checkMatch[1].trim().replace(/_/g, ' ') : 'check';
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      const formattedCheckName = formatCheckName(checkName);
      return `${userName} retried ${formattedCheckName} verification for ${candidate}`;
    }

    if (action === "Run Stage Failed") {
      const candidateMatch = description.match(/candidate: ([^|]+)/);
      const stageMatch = description.match(/Stage: ([^|]+)/);
      const candidate = candidateMatch ? candidateMatch[1].trim() : '';
      const stage = stageMatch ? stageMatch[1].trim() : '';
      return `${userName} encountered issues running ${stage} stage for ${candidate}`;
    }

    if (action === "Password Reset Failed") {
      return `${userName} attempted password reset - failed`;
    }

    if (action === "Updated Organization") {
      return `${userName} updated organization settings`;
    }

    if (action === "Added Helper User") {
      return `${userName} added a helper user`;
    }

    if (action === "Updated User") {
      return `${userName} updated user information`;
    }

    // Generic fallback for other actions
    return `${userName} performed ${action.toLowerCase()}`;
  }

  // Helper function to format check names
  function formatCheckName(checkName) {
    const checkNameMap = {
      'pan_verification': 'PAN Card verification',
      'pan_aadhaar_seeding': 'PAN-Aadhaar linking verification',
      'verify_pan_to_uan': 'PAN to UAN verification',
      'employment_history': 'Employment history verification',
      'credit_report': 'Credit report verification',
      'court_record': 'Court record verification',
      'address_verification': 'Address verification',
      'supervisory_check_1': 'Supervisory reference check #1',
      'supervisory_check_2': 'Supervisory reference check #2',
      'education_check_manual': 'Education verification',
      'employment_history_manual': 'Employment history verification',
      'employment_history_manual_2': 'Employment history verification #2',
      'ai_education_validation': 'AI-powered education validation',
      'ai_cv_validation': 'AI-powered CV validation'
    };

    return checkNameMap[checkName] || checkName.replace(/_/g, ' ');
  }

  function timeAgo(input) {
    const now = new Date();
    const past = new Date(input);
    const diff = (now - past) / 1000;

    if (diff < 60) return `${Math.floor(diff)}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;

    return past.toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getLogIcon(action) {
    const lower = action.toLowerCase();

    // Verification Check Executed - use status-based colors
    if (lower.includes("verification check executed")) {
      return { icon: "🔍", color: "text-blue-600" };
    }

    // Failed actions
    if (lower.includes("fail") || lower.includes("error")) {
      return { icon: "🔴", color: "text-red-600" };
    }

    // Add/Create actions
    if (lower.includes("add") || lower.includes("create") || lower.includes("new")) {
      return { icon: "➕", color: "text-green-600" };
    }

    // Update/Edit actions
    if (lower.includes("update") || lower.includes("edit")) {
      return { icon: "✏️", color: "text-orange-600" };
    }

    // Delete actions
    if (lower.includes("delete")) {
      return { icon: "🗑️", color: "text-red-600" };
    }

    // Login/Logout
    if (lower.includes("login")) {
      return { icon: "🔑", color: "text-green-600" };
    }
    if (lower.includes("logout")) {
      return { icon: "🚪", color: "text-gray-600" };
    }

    // Email/Communication
    if (lower.includes("email") || lower.includes("sent")) {
      return { icon: "📧", color: "text-blue-600" };
    }

    // Stage/Process actions
    if (lower.includes("stage") || lower.includes("initiat")) {
      return { icon: "🚀", color: "text-purple-600" };
    }

    // Retry actions
    if (lower.includes("retry")) {
      return { icon: "🔄", color: "text-yellow-600" };
    }

    // Default
    return { icon: "📋", color: "text-gray-600" };
  }

  function groupByDate(logs) {
    const today = [];
    const yesterday = [];
    const last7 = [];
    const older = [];

    const now = new Date();

    logs.forEach((log) => {
      const d = new Date(log.timestamp);
      const diffDays = (now - d) / (1000 * 60 * 60 * 24);

      if (diffDays < 1) today.push(log);
      else if (diffDays < 2) yesterday.push(log);
      else if (diffDays < 7) last7.push(log);
      else older.push(log);
    });

    return { today, yesterday, last7, older };
  }

  /* ---------------------------------------------------
     UI STARTS HERE
  --------------------------------------------------- */
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4">
      <PageHeader
        title={role === "ORG_HR" ? "HR Dashboard" : "Verifications Overview"}
        subtitle="Monitor and manage your verification activities in real-time"
        action={
          <Link href="/org/verifications">
            <Button variant="gradient" icon={ArrowRight} iconPosition="right">
              View All Verifications
            </Button>
          </Link>
        }
      />

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-8">
        {summaryStats.map((s, idx) => (
          <StatsCard
            key={idx}
            title={s.label}
            value={s.value}
            color={s.color}
            icon={s.icon}
            iconSize={18} // ⬅️ Option B size
          />
        ))}
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* STAGE BAR CHART */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-blue-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Stage Breakdown
              </h2>
              <p className="text-sm text-gray-600">Verification progress by stage</p>
            </div>
          </div>

          <div className="h-[260px] sm:h-[300px]">
            <SimpleBarChart 
              data={{
                primary: stats?.stageBreakdown?.primary || 0,
                secondary: stats?.stageBreakdown?.secondary || 0,
                final: stats?.stageBreakdown?.final || 0,
              }}
              colors={['#3b82f6', '#f59e0b', '#22c55e']}
            />
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-purple-100 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Status Overview
              </h2>
              <p className="text-sm text-gray-600">Current verification status</p>
            </div>
          </div>

          <div className="h-[260px] sm:h-[300px]">
            <SimplePieChart 
              data={pieData}
              colors={['#22c55e', '#f59e0b', '#ef4444']}
            />
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-indigo-100 hover:shadow-2xl transition-all duration-300">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-indigo-100">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
              Recent Activity
            </h2>
            <p className="text-sm text-gray-600">Latest verification activities</p>
          </div>
        </div>

        {activityLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-indigo-400 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <p className="text-gray-600 font-medium text-sm mt-4">Loading activities...</p>
          </div>
        ) : (
          (() => {
            const grouped = groupByDate(recentActivities);

            return (
              <div className="space-y-6">
                {grouped.today.length > 0 && (
                  <ActivityGroup title="Today" logs={grouped.today} />
                )}
                {grouped.yesterday.length > 0 && (
                  <ActivityGroup title="Yesterday" logs={grouped.yesterday} />
                )}
                {grouped.last7.length > 0 && (
                  <ActivityGroup title="Last 7 Days" logs={grouped.last7} />
                )}
                {grouped.older.length > 0 && (
                  <ActivityGroup title="Older" logs={grouped.older} />
                )}
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------
   ACTIVITY GROUP COMPONENT
--------------------------------------------------- */
function ActivityGroup({ title, logs }) {
  return (
    <div>
      <h3 className="text-xs font-bold bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent uppercase tracking-wider mb-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        {title}
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </h3>

      <div className="space-y-3">
        {logs.map((a, i) => (
          <div
            key={i}
            className="flex justify-between items-start bg-gradient-to-r from-white/80 via-blue-50/50 to-indigo-50/50 backdrop-blur-sm hover:from-blue-50/80 hover:via-indigo-50/60 hover:to-purple-50/60 p-4 rounded-2xl transition-all duration-300 border border-blue-100/50 hover:border-indigo-200 hover:shadow-lg hover:scale-[1.01]"
          >
            <div className="flex items-start gap-3">
              <div className={`text-lg ${a.iconColor} flex-shrink-0 p-2 bg-white/60 rounded-xl shadow-sm`}>
                {a.icon}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {a.actionText}
              </p>
            </div>

            <span className="text-gray-500 text-xs font-medium bg-white/60 px-2 py-1 rounded-lg">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
