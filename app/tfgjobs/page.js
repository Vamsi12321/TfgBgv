"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search, MapPin, Briefcase, Code2, Palette, TrendingUp, Database,
  Server, DollarSign, Users, ArrowRight, CheckCircle2, Star, Zap,
  Shield, Sparkles, Building2, Clock, Award,
} from "lucide-react";

const categories = [
  { name: "Engineering", icon: Code2, desc: "Software, Backend, Frontend", gradient: "from-blue-500 to-cyan-500" },
  { name: "Design", icon: Palette, desc: "UI/UX, Product, Graphic", gradient: "from-purple-500 to-pink-500" },
  { name: "Marketing", icon: TrendingUp, desc: "Growth, SEO, Content", gradient: "from-rose-500 to-orange-500" },
  { name: "Data Science", icon: Database, desc: "ML, Analytics, AI", gradient: "from-emerald-500 to-teal-500" },
  { name: "DevOps", icon: Server, desc: "Cloud, CI/CD, Infra", gradient: "from-amber-500 to-orange-500" },
  { name: "Finance", icon: DollarSign, desc: "Accounting, Fintech", gradient: "from-green-500 to-emerald-500" },
  { name: "Product", icon: Briefcase, desc: "Strategy, Roadmap, Agile", gradient: "from-indigo-500 to-violet-500" },
  { name: "HR & Ops", icon: Users, desc: "People, Operations", gradient: "from-pink-500 to-rose-500" },
];

export default function JobSeekerHome() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    router.push(`/jobseeker/jobs?q=${encodeURIComponent(jobTitle)}&loc=${encodeURIComponent(location)}`);
  };

  return (
    <div className="overflow-hidden">
      {/*   HERO   */}
      <section className="relative pt-20 pb-24 lg:pt-28 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-indigo-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white mb-8">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>AI-powered job matching for top talent</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
            Find Your Next{" "}
            <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Career Move
            </span>
          </h1>

          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            Browse thousands of verified opportunities from top companies. Apply with one click and track your progress in real-time.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
            <div className="flex items-center gap-3 flex-1 px-4 py-2">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="Job title, skills, or company" value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="flex-1 text-gray-800 placeholder-gray-400 outline-none text-sm font-medium bg-transparent" />
            </div>
            <div className="w-px bg-gray-200 hidden sm:block self-stretch my-2" />
            <div className="flex items-center gap-3 flex-1 px-4 py-2">
              <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <input type="text" placeholder="City or remote" value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 text-gray-800 placeholder-gray-400 outline-none text-sm font-medium bg-transparent" />
            </div>
            <button type="submit"
              className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2 justify-center whitespace-nowrap">
              <Search className="w-4 h-4" /> Search Jobs
            </button>
          </form>

          {/* Popular */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-blue-200">Popular:</span>
            {["React Developer", "Data Analyst", "Product Manager", "DevOps Engineer"].map(term => (
              <button key={term} onClick={() => setJobTitle(term)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 transition hover:scale-105 text-xs font-medium">
                {term}
              </button>
            ))}
          </div>

          {/* Trust indicators */}
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Verified Companies</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> AI-Powered Matching</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Free Forever</span>
          </div>
        </div>
      </section>

      {/*   CATEGORIES   */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full mb-4">
              <Briefcase className="w-4 h-4" /> Popular Categories
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4">
              Explore by <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Industry</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Tap into opportunities across every major sector</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {categories.map(cat => {
              const Icon = cat.icon;
              return (
                <Link key={cat.name} href={`/jobseeker/jobs?category=${cat.name}`}
                  className={`group relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br ${cat.gradient} min-h-[160px] flex flex-col justify-end`}>
                  {/* Large background icon */}
                  <Icon className="absolute top-3 right-3 w-20 h-20 text-white/10 group-hover:text-white/20 group-hover:scale-125 transition-all duration-500" />
                  {/* Content */}
                  <div className="relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-extrabold text-white text-base mb-0.5">{cat.name}</h3>
                    <p className="text-xs text-white/70">{cat.desc}</p>
                  </div>
                  {/* Bottom shine on hover */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Link href="/tfgjobs/jobseeker/jobs"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-105 transition-all">
              Browse All Jobs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/*   HOW IT WORKS   */}
      <section className="py-24 bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm text-emerald-300 text-sm font-semibold rounded-full mb-4 border border-white/10">
              <Zap className="w-4 h-4" /> Quick & Easy
            </span>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4">Land Your Dream Job in 3 Steps</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">No complicated processes   just sign up, discover, and apply</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Build Your Profile", desc: "Create your free account, add experience & skills, and upload your resume in minutes.", icon: Users, gradient: "from-blue-500 to-cyan-500", glow: "shadow-blue-500/20" },
              { num: "02", title: "Discover Opportunities", desc: "Browse AI-matched jobs or search by title, skill, location. Get your match score instantly.", icon: Search, gradient: "from-purple-500 to-pink-500", glow: "shadow-purple-500/20" },
              { num: "03", title: "Apply & Get Hired", desc: "One-click apply, track your status in real-time, and get hired by top companies.", icon: Award, gradient: "from-emerald-500 to-teal-500", glow: "shadow-emerald-500/20" },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.num} className="relative group">
                  {/* Connector arrow */}
                  {i < 2 && <div className="hidden md:flex absolute top-1/2 -right-3 z-10 w-6 h-6 items-center justify-center"><ArrowRight className="w-4 h-4 text-gray-600" /></div>}
                  <div className={`bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 h-full shadow-2xl ${step.glow}`}>
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <span className="text-xs font-extrabold text-gray-500 uppercase tracking-[0.2em]">Step {step.num}</span>
                    <h3 className="text-xl font-extrabold text-white mt-2 mb-3">{step.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/*   AI SCORE FEATURE   */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left   Mock UI */}
            <div className="relative">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
                {/* Mock score card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 max-w-sm mx-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">AI Match Score</p>
                      <p className="text-xs text-gray-500">Senior React Developer at Infosys</p>
                    </div>
                  </div>
                  {/* Score ring */}
                  <div className="flex items-center justify-center py-4">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="url(#scoreGrad)" strokeWidth="8"
                          strokeDasharray={`${2*Math.PI*42*0.85} ${2*Math.PI*42}`} strokeLinecap="round" />
                        <defs><linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-gray-900">85%</span>
                        <span className="text-[10px] text-gray-500 font-medium">Match</span>
                      </div>
                    </div>
                  </div>
                  {/* Breakdown */}
                  <div className="space-y-2 mt-2">
                    {[
                      { label: "Skills Match", value: 92, color: "bg-green-500" },
                      { label: "Experience Fit", value: 78, color: "bg-blue-500" },
                      { label: "Education", value: 85, color: "bg-purple-500" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-24">{item.label}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.value}%` }} />
                        </div>
                        <span className="text-xs font-bold text-gray-700 w-8">{item.value}%</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-700 font-semibold">Strong match   You should apply!</span>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                AI Powered
              </div>
            </div>

            {/* Right   Text */}
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50 text-purple-600 text-sm font-semibold rounded-full mb-6">
                <Sparkles className="w-4 h-4" /> AI-Powered Feature
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                Know Your Match Score<br />
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Before You Apply</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Our AI analyzes your profile against job requirements and gives you a personalized match score   so you know exactly where you stand before applying.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "See how your skills align with job requirements",
                  "Get personalized improvement suggestions",
                  "Focus on roles where you have the best chance",
                  "Save time by applying to the right jobs",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/tfgjobs/jobseeker/register"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:scale-105 transition-all">
                Try AI Match Score <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/*   WHY TFG   */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60" />
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 text-sm font-semibold rounded-full mb-6 border border-blue-100">
                <Shield className="w-4 h-4" /> Why TFG Jobs
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                Built for <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Serious</span> Job Seekers
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Every company on our platform is verified. Every job is real. No spam, no fake listings   just genuine opportunities from trusted employers.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  { icon: CheckCircle2, text: "All companies verified by TFG", color: "text-green-500", bg: "bg-green-50" },
                  { icon: Sparkles, text: "AI-powered job recommendations", color: "text-purple-500", bg: "bg-purple-50" },
                  { icon: Clock, text: "Real-time application tracking", color: "text-blue-500", bg: "bg-blue-50" },
                  { icon: Shield, text: "Your data is secure and private", color: "text-emerald-500", bg: "bg-emerald-50" },
                  { icon: Star, text: "Free forever for job seekers", color: "text-amber-500", bg: "bg-amber-50" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <span className="text-sm text-gray-700 font-medium">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link href="/tfgjobs/jobseeker/register"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:scale-105 transition-all">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Right   Enhanced mock dashboard */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl transform rotate-2 scale-105 opacity-50" />
              <div className="relative bg-white rounded-3xl border border-gray-200 shadow-2xl p-6 space-y-3">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">JS</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Your Dashboard</p>
                    <p className="text-xs text-gray-500">Track applications in real-time</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  </div>
                </div>
                {[
                  { job: "Senior ML Engineer", company: "TechCorp", status: "Interview", color: "bg-purple-100 text-purple-700", dot: "bg-purple-500" },
                  { job: "Full Stack Developer", company: "StartupXYZ", status: "Applied", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
                  { job: "React Developer", company: "DesignCo", status: "Shortlisted", color: "bg-green-100 text-green-700", dot: "bg-green-500" },
                  { job: "Product Manager", company: "FinTech Inc", status: "Offer", color: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
                ].map((app, i) => (
                  <div key={i} className="flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 transition group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${app.dot}`} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{app.job}</p>
                        <p className="text-xs text-gray-400">{app.company}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${app.color}`}>{app.status}</span>
                  </div>
                ))}
                {/* Mini progress */}
                <div className="pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                    <span className="font-medium">Profile Completion</span>
                    <span className="font-bold text-indigo-600">85%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/*   CTA   */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 lg:p-16 text-center text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-white/10 rounded-full blur-2xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">Ready to Find Your Dream Job?</h2>
              <p className="text-xl text-blue-100 mb-8 max-w-xl mx-auto">Join 50,000+ professionals who found their next opportunity through TFG Jobs.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/tfgjobs/jobseeker/register"
                  className="flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-2xl hover:bg-blue-50 shadow-xl transition-all hover:scale-105">
                  Create Free Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/tfgjobs/jobseeker/jobs"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all">
                  <Search className="w-5 h-5" /> Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
