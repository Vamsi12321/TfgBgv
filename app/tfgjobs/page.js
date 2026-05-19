"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Code2, Palette, TrendingUp, Database,
  Server, DollarSign, Users, ArrowRight, CheckCircle2, Star, Zap,
  Shield, Sparkles, Building2, Clock, Award, ChevronRight, Globe,
  Rocket, Target, Heart,
} from "lucide-react";

const categories = [
  { name: "Engineering", icon: Code2, jobs: "2.4k+", gradient: "from-blue-500 to-cyan-500", lightBg: "from-blue-50 to-cyan-50", border: "border-blue-200", text: "text-blue-600" },
  { name: "Design", icon: Palette, jobs: "1.2k+", gradient: "from-purple-500 to-pink-500", lightBg: "from-purple-50 to-pink-50", border: "border-purple-200", text: "text-purple-600" },
  { name: "Marketing", icon: TrendingUp, jobs: "980+", gradient: "from-rose-500 to-orange-500", lightBg: "from-rose-50 to-orange-50", border: "border-rose-200", text: "text-rose-600" },
  { name: "Data & AI", icon: Database, jobs: "1.8k+", gradient: "from-emerald-500 to-teal-500", lightBg: "from-emerald-50 to-teal-50", border: "border-emerald-200", text: "text-emerald-600" },
  { name: "DevOps", icon: Server, jobs: "750+", gradient: "from-amber-500 to-orange-500", lightBg: "from-amber-50 to-orange-50", border: "border-amber-200", text: "text-amber-600" },
  { name: "Finance", icon: DollarSign, jobs: "620+", gradient: "from-green-500 to-emerald-500", lightBg: "from-green-50 to-emerald-50", border: "border-green-200", text: "text-green-600" },
  { name: "Product", icon: Briefcase, jobs: "890+", gradient: "from-indigo-500 to-violet-500", lightBg: "from-indigo-50 to-violet-50", border: "border-indigo-200", text: "text-indigo-600" },
  { name: "HR & Ops", icon: Users, jobs: "540+", gradient: "from-pink-500 to-rose-500", lightBg: "from-pink-50 to-rose-50", border: "border-pink-200", text: "text-pink-600" },
];

export default function JobSeekerHome() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();
  const [typedText, setTypedText] = useState("");
  const roles = ["React Developer", "Data Scientist", "Product Manager", "DevOps Engineer", "UI/UX Designer"];
  const [roleIdx, setRoleIdx] = useState(0);

  useEffect(() => {
    let charIdx = 0;
    let deleting = false;
    const currentRole = roles[roleIdx];
    const interval = setInterval(() => {
      if (!deleting) {
        setTypedText(currentRole.slice(0, charIdx + 1));
        charIdx++;
        if (charIdx === currentRole.length) { deleting = true; }
      } else {
        setTypedText(currentRole.slice(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) { deleting = false; setRoleIdx((prev) => (prev + 1) % roles.length); clearInterval(interval); }
      }
    }, deleting ? 50 : 100);
    return () => clearInterval(interval);
  }, [roleIdx]);

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/tfgjobs/jobseeker/jobs?q=${encodeURIComponent(jobTitle)}&loc=${encodeURIComponent(location)}`);
  };

  return (
    <div className="overflow-hidden bg-white">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative pt-16 pb-20 lg:pt-24 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-800" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-white/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-5 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-xs font-semibold text-white/90 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              AI-powered job matching • Free forever
            </div>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight mb-5">
            Find Your Next Role as<br />
            <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
              {typedText}<span className="animate-pulse text-white/60">|</span>
            </span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-blue-100/80 max-w-lg mx-auto mb-8 leading-relaxed">
            Browse verified opportunities from top companies. Apply with one click and track your progress in real-time.
          </motion.p>

          {/* Search Bar */}
          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            onSubmit={handleSearch} className="bg-white rounded-2xl p-1.5 shadow-2xl shadow-indigo-900/20 max-w-2xl mx-auto flex flex-col sm:flex-row gap-1.5">
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="Job title, skills, or company" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm font-medium bg-transparent" />
            </div>
            <div className="w-px bg-slate-100 hidden sm:block self-stretch my-2" />
            <div className="flex items-center gap-2.5 flex-1 px-4 py-3">
              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <input type="text" placeholder="City or remote" value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm font-medium bg-transparent" />
            </div>
            <button type="submit"
              className="px-7 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 justify-center whitespace-nowrap">
              <Search className="w-4 h-4" /> Search
            </button>
          </motion.form>

          {/* Trending */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-blue-200/70">Trending:</span>
            {["React", "Python", "Product Manager", "DevOps", "AI/ML"].map(term => (
              <button key={term} onClick={() => setJobTitle(term)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/15 rounded-full text-white/80 transition font-medium">
                {term}
              </button>
            ))}
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-3 max-w-md mx-auto gap-4">
            {[{ val: "10k+", label: "Active Jobs", icon: Briefcase }, { val: "500+", label: "Companies", icon: Building2 }, { val: "50k+", label: "Hired", icon: Award }].map((s, i) => (
              <div key={i} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl py-4 px-3 border border-white/10">
                <s.icon className="w-4 h-4 text-blue-200/60 mx-auto mb-1.5" />
                <p className="text-xl font-black text-white">{s.val}</p>
                <p className="text-[10px] text-blue-200/50 font-medium">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-50/60 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
        <div className="max-w-6xl mx-auto px-5 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-600 text-xs font-bold rounded-full mb-4 border border-indigo-100 shadow-sm">
              <Globe className="w-3.5 h-3.5" /> Explore Opportunities
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
              Browse by <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Category</span>
            </h2>
            <p className="text-base text-slate-400 max-w-lg mx-auto">Discover your perfect role across 8 major industries with thousands of openings</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.05 }}>
                  <Link href={`/tfgjobs/jobseeker/jobs?category=${cat.name}`}
                    className={`group relative block p-5 rounded-2xl bg-gradient-to-br ${cat.lightBg} border ${cat.border} hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden`}>
                    {/* Background decoration */}
                    <div className={`absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br ${cat.gradient} rounded-full opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500`} />
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-800 mb-2">{cat.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg shadow-sm">{cat.jobs} jobs</span>
                        <div className="w-7 h-7 rounded-full bg-white/80 flex items-center justify-center shadow-sm group-hover:bg-blue-500 group-hover:shadow-blue-200 transition-all duration-300">
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="text-center mt-12">
            <Link href="/tfgjobs/jobseeker/jobs"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:scale-105 transition-all">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative">
        <div className="max-w-6xl mx-auto px-5 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-600 text-xs font-bold rounded-full mb-4 border border-emerald-100 shadow-sm">
              <Rocket className="w-3.5 h-3.5" /> Quick Start
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Land Your Dream Job in <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">3 Steps</span></h2>
            <p className="text-base text-slate-400 max-w-lg mx-auto">No complicated processes — create profile, discover roles, and start applying</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-emerald-200 rounded-full" />

            {[
              { num: "01", title: "Build Your Profile", desc: "Create your free account, add your experience, skills, and upload your resume. Takes just 2 minutes.", icon: Users, gradient: "from-blue-500 to-cyan-500", shadow: "shadow-blue-500/20", ring: "ring-blue-100" },
              { num: "02", title: "Discover Opportunities", desc: "Browse AI-matched jobs tailored to your skills. Filter by role, location, salary, and company type.", icon: Target, gradient: "from-violet-500 to-purple-500", shadow: "shadow-violet-500/20", ring: "ring-violet-100" },
              { num: "03", title: "Apply & Get Hired", desc: "One-click apply to multiple roles. Track every application in real-time. Get hired by top companies.", icon: Rocket, gradient: "from-emerald-500 to-teal-500", shadow: "shadow-emerald-500/20", ring: "ring-emerald-100" },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.num} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.15 }}
                  className="relative group">
                  <div className={`bg-white rounded-3xl p-7 border border-slate-100 hover:border-transparent hover:shadow-2xl ${step.shadow} transition-all duration-500 h-full ring-1 ${step.ring} ring-offset-2 hover:ring-offset-4`}>
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <span className="text-3xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">{step.num}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ AI MATCH SCORE ═══════════ */}
      <section className="py-20 bg-white relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-purple-50/50 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/3" />
        <div className="max-w-6xl mx-auto px-5 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Mock UI */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative">
              <div className="bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50 rounded-3xl p-8 border border-indigo-100/50 shadow-inner">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">AI Match Score</p>
                      <p className="text-xs text-slate-400">Sr. React Developer • Infosys</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad2)" strokeWidth="8"
                          strokeDasharray={`${2*Math.PI*42*0.85} ${2*Math.PI*42}`} strokeLinecap="round" />
                        <defs><linearGradient id="scoreGrad2" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-slate-900">85%</span>
                        <span className="text-[10px] text-slate-400 font-medium">Match</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2.5 mt-3">
                    {[{ label: "Skills Match", value: 92, color: "bg-emerald-500" }, { label: "Experience", value: 78, color: "bg-blue-500" }, { label: "Education", value: 85, color: "bg-violet-500" }].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 w-20">{item.label}</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-8">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs text-emerald-600 font-bold">Strong match — You should apply!</span>
                  </div>
                </div>
              </div>
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.5, repeat: Infinity }}
                className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl border border-white/20">
                ✨ AI Powered
              </motion.div>
              <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-2 -left-2 bg-white text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xl border border-emerald-100">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> 85% Match</span>
              </motion.div>
            </motion.div>

            {/* Right — Text */}
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-600 text-xs font-bold rounded-full mb-5 border border-purple-100 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" /> AI-Powered Feature
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">
                Know Your Match Score<br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Before You Apply</span>
              </h2>
              <p className="text-base text-slate-500 mb-6 leading-relaxed">
                Our AI analyzes your profile against job requirements and gives you a personalized match score — so you know exactly where you stand.
              </p>
              <div className="space-y-3.5 mb-8">
                {[
                  { text: "See how your skills align with requirements", icon: Target },
                  { text: "Get personalized improvement suggestions", icon: Sparkles },
                  { text: "Focus on roles where you have the best chance", icon: Star },
                  { text: "Save time by applying to the right jobs", icon: Clock },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <item.icon className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-slate-700 font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </div>
              <Link href="/tfgjobs/jobseeker/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-2xl shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:scale-105 transition-all">
                Try AI Match Score <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY TFG ═══════════ */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="max-w-6xl mx-auto px-5 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-xs font-bold rounded-full mb-4 border border-blue-100 shadow-sm">
              <Heart className="w-3.5 h-3.5" /> Why Choose Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Why Job Seekers <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Love TFG</span></h2>
            <p className="text-base text-slate-400 max-w-lg mx-auto">Built for serious professionals who want real, verified opportunities</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Shield, title: "Verified Companies", desc: "Every employer is vetted and verified before posting", gradient: "from-emerald-500 to-teal-500", bg: "from-emerald-50 to-teal-50", border: "border-emerald-100" },
              { icon: Sparkles, title: "AI Recommendations", desc: "Personalized job matches based on your profile", gradient: "from-purple-500 to-violet-500", bg: "from-purple-50 to-violet-50", border: "border-purple-100" },
              { icon: Clock, title: "Real-time Tracking", desc: "Know your application status at every stage", gradient: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50", border: "border-blue-100" },
              { icon: Zap, title: "One-Click Apply", desc: "Apply to multiple jobs instantly with saved profile", gradient: "from-amber-500 to-orange-500", bg: "from-amber-50 to-orange-50", border: "border-amber-100" },
              { icon: Star, title: "Free Forever", desc: "No hidden charges, no premium walls for seekers", gradient: "from-pink-500 to-rose-500", bg: "from-pink-50 to-rose-50", border: "border-pink-100" },
              { icon: Globe, title: "Remote & Global", desc: "Find remote roles and opportunities worldwide", gradient: "from-indigo-500 to-blue-500", bg: "from-indigo-50 to-blue-50", border: "border-indigo-100" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08 }}
                  className={`group p-6 rounded-2xl bg-gradient-to-br ${item.bg} border ${item.border} hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 mb-1.5">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden shadow-2xl shadow-indigo-500/20">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
                <Rocket className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-black mb-4">Ready to Find Your Dream Job?</h2>
              <p className="text-base text-blue-100/80 mb-8 max-w-lg mx-auto">Join 50,000+ professionals who found their next opportunity through TFG Jobs.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/tfgjobs/jobseeker/register"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 text-sm font-bold rounded-2xl hover:bg-blue-50 shadow-xl transition-all hover:scale-105 hover:shadow-2xl">
                  Create Free Account <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/tfgjobs/jobseeker/jobs"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white text-sm font-semibold rounded-2xl hover:bg-white/20 transition-all backdrop-blur-sm">
                  <Search className="w-4 h-4" /> Browse Jobs
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
