"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Code2,
  Palette,
  TrendingUp,
  Database,
  Server,
  Package,
  DollarSign,
  Users,
  ArrowRight,
  CheckCircle2,
  Star,
  Zap,
} from "lucide-react";

const categories = [
  { name: "Engineering", icon: Code2, count: "2,340", color: "from-blue-500 to-blue-600", bg: "bg-blue-50", text: "text-blue-600" },
  { name: "Design", icon: Palette, count: "890", color: "from-purple-500 to-purple-600", bg: "bg-purple-50", text: "text-purple-600" },
  { name: "Marketing", icon: TrendingUp, count: "1,120", color: "from-pink-500 to-rose-500", bg: "bg-pink-50", text: "text-pink-600" },
  { name: "Data Science", icon: Database, count: "760", color: "from-cyan-500 to-teal-500", bg: "bg-cyan-50", text: "text-cyan-600" },
  { name: "DevOps", icon: Server, count: "540", color: "from-orange-500 to-amber-500", bg: "bg-orange-50", text: "text-orange-600" },
  { name: "Product", icon: Package, count: "430", color: "from-indigo-500 to-violet-500", bg: "bg-indigo-50", text: "text-indigo-600" },
  { name: "Finance", icon: DollarSign, count: "670", color: "from-green-500 to-emerald-500", bg: "bg-green-50", text: "text-green-600" },
  { name: "HR", icon: Users, count: "310", color: "from-red-500 to-rose-500", bg: "bg-red-50", text: "text-red-600" },
];

const steps = [
  { num: "01", title: "Create Account", desc: "Sign up in under 2 minutes and set up your professional profile." },
  { num: "02", title: "Build Your Profile", desc: "Add your experience, skills, and upload your resume to stand out." },
  { num: "03", title: "Apply & Get Hired", desc: "Browse thousands of jobs and apply with one click to your dream role." },
];

const testimonials = [
  { name: "Sarah Chen", role: "Software Engineer at Google", text: "Found my dream job in just 2 weeks!", avatar: "SC", rating: 5 },
  { name: "Marcus Johnson", role: "Product Manager at Stripe", text: "The best job platform I've ever used.", avatar: "MJ", rating: 5 },
  { name: "Priya Patel", role: "Data Scientist at Netflix", text: "Landed 3 interviews in my first week!", avatar: "PP", rating: 5 },
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"></div>
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm font-medium mb-8">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>10,000+ new jobs added this week</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              Find Your{" "}
              <span className="relative">
                <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Dream Job
                </span>
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path d="M2 10 Q150 2 298 10" stroke="rgba(253,224,71,0.6)" strokeWidth="3" strokeLinecap="round" fill="none"/>
                </svg>
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with top companies and discover opportunities that match your skills, passion, and career goals.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-2xl max-w-3xl mx-auto flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm font-medium bg-transparent"
                />
              </div>
              <div className="w-px bg-slate-200 hidden sm:block self-stretch my-2"></div>
              <div className="flex items-center gap-3 flex-1 px-4 py-2">
                <MapPin className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="City, state, or remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 text-slate-800 placeholder-slate-400 outline-none text-sm font-medium bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Search Jobs
              </button>
            </form>

            {/* Popular searches */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="text-blue-200">Popular:</span>
              {["React Developer", "Product Manager", "Data Analyst", "UX Designer", "DevOps Engineer"].map((term) => (
                <button
                  key={term}
                  onClick={() => { setJobTitle(term); }}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white/90 transition-all duration-200 hover:scale-105"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-16 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { value: "10,000+", label: "Active Jobs" },
              { value: "500+", label: "Top Companies" },
              { value: "50,000+", label: "Professionals Hired" },
            ].map((stat) => (
              <div key={stat.label} className="text-center bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-5">
                <div className="text-3xl font-extrabold text-white">{stat.value}</div>
                <div className="text-sm text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-semibold rounded-full mb-4">
              Explore Categories
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Browse by Job Category
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Explore thousands of job opportunities across all major industries and find the perfect fit for your career.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/jobseeker/jobs?category=${cat.name}`}
                  className="group p-6 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 ${cat.bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-6 h-6 ${cat.text}`} />
                  </div>
                  <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-slate-500">{cat.count} jobs</p>
                </Link>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/jobseeker/jobs"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-200 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200"
            >
              View All Categories
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block px-4 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-full mb-4">
              Simple Process
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Get hired in three simple steps. It's fast, easy, and completely free for job seekers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-16 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-indigo-200 z-0"></div>

            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center group">
                <div className="relative z-10 w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-300">
                  {step.num}
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-lg hover:border-blue-100 transition-all duration-300">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex absolute top-8 -right-4 z-20 w-8 h-8 bg-white border-2 border-blue-200 rounded-full items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-blue-400" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 bg-yellow-50 text-yellow-600 text-sm font-semibold rounded-full mb-4">
              Success Stories
            </span>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              Loved by Professionals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-2xl p-6 border border-slate-100 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 rounded-3xl p-12 text-center text-white overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm font-medium mb-6">
                <CheckCircle2 className="w-4 h-4" />
                Free for Job Seekers — Always
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-xl text-white/80 mb-8 max-w-xl mx-auto">
                Join over 50,000 professionals who found their dream jobs through TFG Jobs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/jobseeker/register"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:bg-purple-50 transition-all duration-200 hover:scale-105 shadow-xl"
                >
                  Register Now — It's Free
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/jobseeker/jobs"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 border border-white/30 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-200"
                >
                  <Briefcase className="w-5 h-5" />
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
