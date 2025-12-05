"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Brain,
  Users,
  FileCheck,
  Lock,
  BarChart3,
  CheckCircle,
  CreditCard,
  MapPin,
  GraduationCap,
  UserCheck,
  FileText,
  Building,
  Sparkles,
  Zap,
  TrendingUp,
  Eye,
  ArrowRight,
  Star,
  Activity,
  Upload,
} from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);
  const [redirecting, setRedirecting] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("bgvUser");
    const tokenCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("bgvTemp="));

    if (storedUser && tokenCookie) {
      try {
        const user = JSON.parse(storedUser);
        const role = user.role?.toUpperCase();

        if (
          ["SUPER_ADMIN", "SUPER_ADMIN_HELPER", "SUPER_SPOC"].includes(role)
        ) {
          router.replace("/superadmin/dashboard");
          return;
        }

        if (["ORG_HR", "HELPER", "SPOC", "ORG_SPOC"].includes(role)) {
          router.replace("/org/dashboard");
          return;
        }
      } catch {
        localStorage.removeItem("bgvUser");
      }
    }

    setShowLanding(true);
    setRedirecting(false);
  }, [router]);

  if (redirecting) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting...</p>
      </div>
    );
  }

  if (!showLanding) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
        <div className="relative">
          <div className="animate-spin h-16 w-16 rounded-full border-4 border-[#ff004f] border-t-transparent"></div>
          <div className="absolute inset-0 animate-ping h-16 w-16 rounded-full border-4 border-[#ff004f] opacity-20"></div>
        </div>
        <p className="mt-6 text-gray-600 font-medium animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  const verificationServices = [
    {
      id: "ai_resume_screening",
      title: "🚀 AI Resume Screening",
      description:
        "Upload 100+ resumes, get top 10-20 candidates based on JD matching in seconds!",
      icon: <Sparkles className="w-6 h-6" />,
      badge: "NEW",
      featured: true,
    },
    {
      id: "pan_aadhaar_seeding",
      title: "PAN-Aadhaar Seeding",
      description: "Verify PAN and Aadhaar linkage status instantly",
      icon: <CreditCard className="w-6 h-6" />,
    },
    {
      id: "pan_verification",
      title: "PAN Verification",
      description: "Validate PAN card details and authenticity",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: "employment_history",
      title: "Employment History",
      description: "Comprehensive employment background verification",
      icon: <Building className="w-6 h-6" />,
    },
    {
      id: "aadhaar_to_uan",
      title: "Aadhaar to UAN",
      description: "Link and verify Aadhaar with UAN number",
      icon: <UserCheck className="w-6 h-6" />,
    },
    {
      id: "credit_report",
      title: "Credit Report",
      description: "Detailed credit history and financial background",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      id: "court_record",
      title: "Court Record Check",
      description: "Criminal and civil court records verification",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      id: "address_verification",
      title: "Address Verification",
      description: "Physical address validation and verification",
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      id: "education_check_manual",
      title: "Education Check (Manual)",
      description: "Manual verification of educational credentials",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      id: "supervisory_check",
      title: "Supervisory Check",
      description: "Reference checks with previous supervisors",
      icon: <Eye className="w-6 h-6" />,
    },
    {
      id: "ai_cv_validation",
      title: "AI CV Validation",
      description: "AI-powered CV authenticity and fraud detection",
      icon: <Brain className="w-6 h-6" />,
    },
    {
      id: "education_check_ai",
      title: "Education Check (AI)",
      description: "Automated AI-driven education verification",
      icon: <Activity className="w-6 h-6" />,
    },
  ];

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "🚀 AI Resume Screening",
      description: "Bulk upload 100+ resumes, get top 10-20 matches instantly with JD matching - Save 100+ hours per hiring cycle",
      badge: "AI",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      icon: <Brain className="w-6 h-6" />,
      title: "🧠 AI CV Validation",
      description: "Automated fraud detection and authenticity verification with 98% accuracy using machine learning",
      badge: "AI",
      gradient: "from-blue-500 to-indigo-600",
    },
    {
      icon: <GraduationCap className="w-6 h-6" />,
      title: "🎓 AI Education Verification",
      description: "AI-powered validation of education certificates and credentials with automated document analysis",
      badge: "AI",
      gradient: "from-purple-500 to-pink-600",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "🛡️ 12+ Verification Services",
      description: "Comprehensive checks: PAN, Aadhaar, Employment, Court Records, Credit Reports & more",
      gradient: "from-red-500 to-rose-600",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "📊 Real-Time Dashboards",
      description: "Live analytics with completion tracking, status monitoring, and actionable insights",
      gradient: "from-orange-500 to-amber-600",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "👥 Multi-Organization Support",
      description: "Manage multiple organizations with role-based access control and custom workflows",
      gradient: "from-cyan-500 to-blue-600",
    },
    {
      icon: <UserCheck className="w-6 h-6" />,
      title: "✅ Self-Verification Portal",
      description: "Candidates can complete verifications independently with guided workflows",
      gradient: "from-teal-500 to-green-600",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "🔒 Secure & Compliant",
      description: "Bank-grade security with consent management, data encryption, and compliance tracking",
      gradient: "from-gray-700 to-gray-900",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* Enhanced Header with Better Navbar */}
        <header className="px-6 py-6 bg-white/95 backdrop-blur-xl sticky top-0 z-50 border-b-2 border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Maihoo Text Logo - Smaller Size */}
            <div className="flex items-center group cursor-pointer">
              <h1 
                className="text-3xl font-black bg-gradient-to-r from-[#ff004f] via-[#ff3366] to-[#ff0066] bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300"
                style={{ 
                  fontFamily: "'Montserrat', 'Poppins', sans-serif", 
                  letterSpacing: '-0.02em'
                }}
              >
                Maihoo
              </h1>
            </div>

            {/* Enhanced Navigation with Better Styling */}
            <nav className="hidden md:flex items-center space-x-2">
              <a
                href="#services"
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#ff004f] hover:to-[#ff3366] font-bold transition-all cursor-pointer text-base flex items-center gap-2 px-5 py-3 rounded-xl hover:shadow-lg group"
              >
                <Shield className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Services
              </a>
              <a
                href="#ai-powered"
                className="text-white bg-gradient-to-r from-purple-600 to-pink-600 font-black transition-all cursor-pointer text-base flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 relative group"
              >
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
                <span>AI-Powered</span>
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs font-black px-2 py-1 rounded-full text-gray-900 animate-bounce shadow-lg">
                  HOT
                </span>
              </a>
              <a
                href="#features"
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#ff004f] hover:to-[#ff3366] font-bold transition-all cursor-pointer text-base flex items-center gap-2 px-5 py-3 rounded-xl hover:shadow-lg group"
              >
                <Star className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Features
              </a>
              <a
                href="#process"
                className="text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-[#ff004f] hover:to-[#ff3366] font-bold transition-all cursor-pointer text-base flex items-center gap-2 px-5 py-3 rounded-xl hover:shadow-lg group"
              >
                <Activity className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Process
              </a>
            </nav>

            <button
              onClick={() => router.push("/login")}
              className="px-10 py-4 bg-gradient-to-r from-[#ff004f] to-[#ff3366] text-white font-black rounded-2xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center gap-3 text-lg shadow-xl"
            >
              Sign In
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <section className="px-6 py-20 lg:py-32">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-block mb-4">
              <span className="bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full">
                ✨ AI-Powered Background Verification
              </span>
            </div>

            <h1 className="text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Hire with{" "}
              <span className="bg-gradient-to-r from-[#ff004f] to-[#ff3366] bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
              Upload 100+ resumes, get top 10-20 candidates instantly with
              AI-powered JD matching. Plus comprehensive background verification
              for modern organizations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-4 bg-gradient-to-r from-[#ff004f] to-[#ff3366] text-white font-semibold rounded-xl hover:shadow-2xl transition-all duration-300 text-lg group"
              >
                Get Started
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </button>
              <button
                onClick={() =>
                  document
                    .getElementById("services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="px-8 py-4 bg-white text-gray-700 font-semibold rounded-xl hover:shadow-xl transition-all duration-300 text-lg border border-gray-200"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ff004f] to-[#ff3366] bg-clip-text text-transparent mb-2">
                  98%
                </div>
                <div className="text-gray-600 font-medium">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#ff004f] to-[#ff3366] bg-clip-text text-transparent mb-2">
                  24hrs
                </div>
                <div className="text-gray-600 font-medium">Avg Turnaround</div>
              </div>
            </div>
          </div>
        </section>

        {/* AI-Powered Section - Enhanced */}
        <section id="ai-powered" className="px-6 py-20 bg-gradient-to-br from-purple-900 via-[#ff004f] to-orange-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto relative z-10">
            {/* Section Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-bold text-base mb-6 animate-pulse shadow-2xl">
                <Sparkles className="w-5 h-5" />
                AI-POWERED VERIFICATION SUITE
              </div>
              <h2 className="text-5xl lg:text-6xl font-extrabold text-white mb-4">
                Next-Gen AI Solutions
              </h2>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Harness the power of artificial intelligence for lightning-fast screening and validation
              </p>
            </div>

            {/* Three AI Features Grid - Smaller Cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-10 max-w-5xl mx-auto">
              {/* AI Resume Screening */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  🚀 AI Resume Screening
                </h3>
                <p className="text-white/80 mb-3 text-xs leading-relaxed">
                  Upload 100+ resumes, get top 10-20 candidates instantly with JD matching
                </p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <span>Bulk upload 100+ resumes</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <span>JD matching & ranking</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                    <span>Results in &lt;60 seconds</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-0.5">100+</div>
                  <div className="text-xs text-white/70">Hours Saved Per Cycle</div>
                </div>
              </div>

              {/* AI CV Validation */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  🧠 AI CV Validation
                </h3>
                <p className="text-white/80 mb-3 text-xs leading-relaxed">
                  Advanced fraud detection and authenticity verification using ML algorithms
                </p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Fraud detection AI</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Authenticity scoring</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                    <span>Instant verification reports</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-0.5">98%</div>
                  <div className="text-xs text-white/70">Fraud Detection Accuracy</div>
                </div>
              </div>

              {/* AI Education Verification */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-300 hover:scale-105">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  🎓 AI Education Verification
                </h3>
                <p className="text-white/80 mb-3 text-xs leading-relaxed">
                  Automated validation of education certificates with AI document analysis
                </p>
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Certificate validation</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Document authenticity check</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/90 text-xs">
                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                    <span>Automated verification</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-2.5 border border-white/20">
                  <div className="text-2xl font-bold text-white mb-0.5">24hrs</div>
                  <div className="text-xs text-white/70">Average Verification Time</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <button
                onClick={() => router.push("/login")}
                className="px-10 py-5 bg-white text-[#ff004f] font-bold rounded-2xl hover:shadow-2xl hover:scale-110 transition-all duration-300 inline-flex items-center gap-3 text-lg shadow-xl"
              >
                <Zap className="w-6 h-6" />
                Experience AI-Powered Verification
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Verification Services - Horizontal Scroll with Smaller Cards */}
        <section id="services" className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg">
                  🛡️ COMPREHENSIVE SERVICES
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                12+ Verification Services
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Complete verification solutions powered by AI and automation
              </p>
            </div>

            {/* Horizontal Scrolling Showcase with Smaller Cards */}
            <div className="relative">
              <div className="flex overflow-x-auto gap-4 pb-6 snap-x snap-mandatory scrollbar-hide">
                {verificationServices.map((service, index) => (
                  <div
                    key={service.id}
                    className={`flex-shrink-0 ${
                      service.featured ? "w-72" : "w-56"
                    } bg-white rounded-xl p-4 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 group hover:-translate-y-2 snap-start animate-fade-in relative ${
                      service.featured
                        ? "border-[#ff004f] bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50"
                        : "border-gray-200 hover:border-[#ff004f]"
                    }`}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {service.badge && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-black px-2.5 py-1 rounded-full shadow-lg animate-pulse z-10">
                        {service.badge}
                      </div>
                    )}
                    
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 text-white shadow-md ${
                        service.featured
                          ? "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 animate-pulse-slow"
                          : "bg-gradient-to-br from-[#ff004f] to-[#ff3366]"
                      }`}
                    >
                      {service.icon}
                    </div>
                    
                    <h3
                      className={`text-base font-bold mb-2 ${
                        service.featured ? "text-[#ff004f]" : "text-gray-900"
                      }`}
                    >
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {service.description}
                    </p>
                    
                    {service.featured && (
                      <div className="mt-3 pt-3 border-t border-orange-200">
                        <div className="flex items-center gap-1.5 text-xs text-[#ff004f] font-bold">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Bulk • JD Match • Instant</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Scroll Indicator */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500 flex items-center justify-center gap-2 animate-pulse">
                  <span>← Scroll to explore all services →</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section - Enhanced */}
        <section
          id="features"
          className="px-6 py-20 bg-gradient-to-b from-white via-red-50 to-white"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-5 py-2 rounded-full shadow-lg">
                  ⭐ POWERFUL FEATURES
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                Why Choose Us
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Industry-leading features powered by AI and automation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-[#ff004f] group hover:-translate-y-2 animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {feature.badge && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-md animate-pulse">
                      {feature.badge}
                    </div>
                  )}
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 text-white shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works - Simple 3-Step Process */}
        <section id="process" className="px-6 py-20 bg-gradient-to-br from-gray-50 via-white to-red-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="inline-block mb-4">
                <span className="bg-gradient-to-r from-[#ff004f] to-[#ff3366] text-white text-sm font-bold px-6 py-2.5 rounded-full shadow-lg">
                  ⚡ SIMPLE 3-STEP PROCESS
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
                How It Works
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get verification reports in 3 simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative max-w-5xl mx-auto">
              {/* Connection Line */}
              <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transform z-0 rounded-full shadow-md"></div>

              {/* Step 1: Upload Candidate Info */}
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 shadow-xl border-3 border-blue-200 hover:shadow-[0_15px_40px_rgba(59,130,246,0.3)] hover:scale-105 transition-all duration-300 animate-fade-in">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xl mx-auto relative transform hover:rotate-6 transition-transform">
                    <Upload className="w-10 h-10" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-base shadow-lg border-3 border-white">
                      1
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-blue-900 text-center mb-2">
                    Upload Candidate Info
                  </h3>
                  <p className="text-blue-800 text-center text-sm font-medium leading-relaxed">
                    Upload candidate details and documents securely
                  </p>
                </div>
              </div>

              {/* Step 2: Select Verification Checks */}
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 rounded-2xl p-6 shadow-xl border-3 border-purple-200 hover:shadow-[0_15px_40px_rgba(168,85,247,0.3)] hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xl mx-auto relative transform hover:rotate-6 transition-transform">
                    <FileCheck className="w-10 h-10" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-base shadow-lg border-3 border-white">
                      2
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-purple-900 text-center mb-2">
                    Select Verification Checks
                  </h3>
                  <p className="text-purple-800 text-center text-sm font-medium leading-relaxed">
                    Choose from 12+ services including AI-powered options
                  </p>
                </div>
              </div>

              {/* Step 3: Get Reports Instantly */}
              <div className="relative z-10">
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-6 shadow-xl border-3 border-green-200 hover:shadow-[0_15px_40px_rgba(34,197,94,0.3)] hover:scale-105 transition-all duration-300 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                  <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl flex items-center justify-center mb-4 text-white shadow-xl mx-auto relative transform hover:rotate-6 transition-transform">
                    <Zap className="w-10 h-10" />
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-gray-900 font-black text-base shadow-lg border-3 border-white">
                      3
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-green-900 text-center mb-2">
                    Get Reports Instantly
                  </h3>
                  <p className="text-green-800 text-center text-sm font-medium leading-relaxed">
                    Receive comprehensive verification reports instantly
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-16">
              <button
                onClick={() => router.push("/login")}
                className="px-12 py-5 bg-gradient-to-r from-[#ff004f] to-[#ff3366] text-white font-black rounded-2xl hover:shadow-2xl hover:scale-110 transition-all duration-300 inline-flex items-center gap-3 text-xl shadow-xl"
              >
                Start Verification Now
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-20 bg-gradient-to-r from-[#ff004f] to-[#ff3366]">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Hiring?
            </h2>
            <p className="text-xl mb-10 opacity-90">
              Join hundreds of organizations using our platform for reliable
              background verification
            </p>
            <button
              onClick={() => router.push("/login")}
              className="px-10 py-4 bg-white text-[#ff004f] font-bold rounded-xl hover:shadow-2xl transition-all duration-300 text-lg"
            >
              Start Verifying Today
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 py-12 bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <img
                    src="/logos/maihooMain.png"
                    alt="Maihoo"
                    className="h-8 w-auto"
                  />
                </div>
                <p className="text-gray-400 text-sm">
                  AI-powered background verification for modern organizations
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Services</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>PAN Verification</li>
                  <li>Employment Check</li>
                  <li>Education Verification</li>
                  <li>AI CV Validation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>About Us</li>
                  <li>Contact</li>
                  <li>Careers</li>
                  <li>Blog</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                  <li>Compliance</li>
                  <li>Security</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
              <p>© 2024 Maihoo. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseSlow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes bounceHorizontal {
          0%,
          100% {
            transform: translateX(0);
          }
          50% {
            transform: translateX(5px);
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
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
        .animate-pulse-slow {
          animation: pulseSlow 3s ease-in-out infinite;
        }
        .animate-bounce-horizontal {
          animation: bounceHorizontal 1.5s ease-in-out infinite;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
