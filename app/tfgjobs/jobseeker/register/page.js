"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye, EyeOff, Mail, Lock, ArrowRight, ArrowLeft, Briefcase, User, Phone,
  Upload, CheckCircle2, MapPin, GraduationCap, Code2, FileText, Calendar,
  Globe, Sparkles, Shield,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Account", icon: Lock },
  { id: 2, label: "Personal", icon: User },
  { id: 3, label: "Address & ID", icon: MapPin },
  { id: 4, label: "Education", icon: GraduationCap },
  { id: 5, label: "Experience", icon: Briefcase },
  { id: 6, label: "Skills & Resume", icon: Code2 },
];

export default function JobSeekerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    // Step 1: Account
    email: "", password: "", confirmPassword: "",
    // Step 2: Personal
    firstName: "", lastName: "", phone: "", dob: "", gender: "",
    maritalStatus: "", nationality: "Indian", fatherName: "", motherName: "",
    location: "", linkedin: "", github: "",
    // Step 3: Address & Identity
    permanentAddress: "", currentAddress: "", sameAddress: false,
    panNumber: "", aadhaarNumber: "", passportNumber: "", drivingLicense: "",
    // Step 4: Education (multiple)
    educations: [{ degree: "", institution: "", year: "", grade: "", eduType: "Full-time" }],
    // Step 5: Experience (multiple)
    hasExperience: "fresher",
    experiences: [{ company: "", role: "", duration: "", description: "" }],
    // Step 6: Skills & Resume
    skills: "", bio: "",
  });
  const [resumeFile, setResumeFile] = useState(null);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const updateEdu = (idx, field, value) => {
    setForm(p => ({ ...p, educations: p.educations.map((e, i) => i === idx ? { ...e, [field]: value } : e) }));
  };
  const addEdu = () => setForm(p => ({ ...p, educations: [...p.educations, { degree: "", institution: "", year: "", grade: "", eduType: "Full-time" }] }));
  const removeEdu = (idx) => setForm(p => ({ ...p, educations: p.educations.filter((_, i) => i !== idx) }));

  const updateExp = (idx, field, value) => {
    setForm(p => ({ ...p, experiences: p.experiences.map((e, i) => i === idx ? { ...e, [field]: value } : e) }));
  };
  const addExp = () => setForm(p => ({ ...p, experiences: [...p.experiences, { company: "", role: "", duration: "", description: "" }] }));
  const removeExp = (idx) => setForm(p => ({ ...p, experiences: p.experiences.filter((_, i) => i !== idx) }));

  const nextStep = () => {
    setError("");
    // Validate current step
    if (step === 1) {
      if (!form.email || !form.password) { setError("Email and password are required"); return; }
      if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
      if (form.password !== form.confirmPassword) { setError("Passwords do not match"); return; }
    }
    if (step === 2) {
      if (!form.firstName || !form.lastName) { setError("First and last name are required"); return; }
      if (!form.phone || form.phone.length !== 10) { setError("Valid 10-digit phone number required"); return; }
      if (!form.dob) { setError("Date of birth is required"); return; }
      if (!form.gender) { setError("Gender is required"); return; }
      if (!form.maritalStatus) { setError("Marital status is required"); return; }
      if (!form.fatherName || form.fatherName.length < 2) { setError("Father's name is required"); return; }
    }
    if (step === 3) {
      if (!form.permanentAddress || form.permanentAddress.length < 10) { setError("Permanent address is required (min 10 chars)"); return; }
    }
    if (step < 6) setStep(step + 1);
  };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        phone: form.phone,
        password: form.password,
        dob: form.dob,
        gender: form.gender,
        maritalStatus: form.maritalStatus,
        nationality: form.nationality,
        fatherName: form.fatherName,
        motherName: form.motherName,
        permanentAddress: form.permanentAddress,
        currentAddress: form.sameAddress ? form.permanentAddress : form.currentAddress,
        panNumber: form.panNumber,
        aadhaarNumber: form.aadhaarNumber,
        passportNumber: form.passportNumber,
        drivingLicense: form.drivingLicense,
        location: form.location,
        linkedinUrl: form.linkedin,
        githubUrl: form.github,
        bio: form.bio,
        skills: form.skills.split(",").map(s => s.trim()).filter(Boolean),
        education: form.educations.filter(e => e.degree || e.institution),
        experience: form.hasExperience === "experienced" ? form.experiences.filter(e => e.company || e.role) : [],
      };

      const res = await fetch("/api/proxy/jobseeker/register", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 404 || res.status === 500) {
        localStorage.setItem("jobseekerUser", JSON.stringify({ name: payload.name, email: form.email, phone: form.phone, role: "jobseeker" }));
        router.push("/tfgjobs/jobseeker/dashboard");
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(typeof data?.detail === "string" ? data.detail : Array.isArray(data?.detail) ? data.detail[0]?.msg : "Registration failed.");
        setLoading(false);
        return;
      }

      const js = data.jobSeeker || {};
      localStorage.setItem("jobseekerUser", JSON.stringify({
        _id: js._id || "", name: js.name || payload.name, email: js.email || form.email,
        phone: js.phone || form.phone, profileCompletion: js.profileCompletion || 0, role: "jobseeker",
      }));

      if (resumeFile) {
        const fd = new FormData();
        fd.append("file", resumeFile);
        await fetch("/api/proxy/jobseeker/uploadResume", { method: "POST", credentials: "include", body: fd });
      }
      router.push("/tfgjobs/jobseeker/dashboard");
    } catch {
      localStorage.setItem("jobseekerUser", JSON.stringify({ name: `${form.firstName} ${form.lastName}`, email: form.email, phone: form.phone, role: "jobseeker" }));
      router.push("/tfgjobs/jobseeker/dashboard");
    } finally { setLoading(false); }
  };

  const inputCls = "w-full px-4 py-3 border border-gray-200 bg-white rounded-xl text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition placeholder-gray-400 hover:border-gray-300";
  const labelCls = "block text-xs font-bold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-[38%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-violet-800 flex-col justify-between p-8">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <Link href="/tfgjobs" className="flex items-center gap-2.5 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-extrabold text-white">TFG Jobs</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-white leading-tight mb-3">
            Create your professional profile
          </h1>
          <p className="text-purple-100 text-sm leading-relaxed mb-6">
            Complete your profile to get matched with the best opportunities. The more you fill, the better your matches.
          </p>

          {/* Step progress */}
          <div className="space-y-2">
            {STEPS.map(s => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = s.id < step;
              return (
                <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${isActive ? "bg-white/15 border border-white/20" : isDone ? "opacity-70" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDone ? "bg-green-400/20" : isActive ? "bg-white/20" : "bg-white/10"}`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4 text-green-300" /> : <Icon className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`text-sm font-medium ${isActive ? "text-white" : "text-purple-200"}`}>{s.label}</span>
                  {isActive && <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full text-white">Current</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-2 text-xs text-purple-200">
          <Shield className="w-4 h-4" />
          <span>Your data is encrypted and secure</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50/30">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="lg:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-gray-900">TFG Jobs</span>
          </div>
          <p className="text-sm text-gray-500">
            Already have an account? <Link href="/tfgjobs/jobseeker/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
          <span className="text-xs font-bold text-gray-400">Step {step} of 6</span>
        </div>

        {/* Form content */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-lg">
            {/* Progress bar */}
            <div className="mb-6">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
              </div>
            </div>

            {error && <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{error}</div>}

            {/* STEP 1: Account */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Create your account</h2>
                  <p className="text-sm text-gray-500 mt-1">Start with your login credentials</p>
                </div>
                <div>
                  <label className={labelCls}>Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="email" required value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" className={inputCls + " pl-10"} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type={showPassword ? "text" : "password"} required value={form.password} onChange={e => set("password", e.target.value)} placeholder="Min 6 characters" className={inputCls + " pl-10 pr-10"} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Confirm Password *</label>
                  <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="Re-enter password" className={inputCls} />
                </div>
              </div>
            )}

            {/* STEP 2: Personal */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us about yourself</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>First Name *</label><input required value={form.firstName} onChange={e => set("firstName", e.target.value)} placeholder="John" className={inputCls} /></div>
                  <div><label className={labelCls}>Last Name *</label><input required value={form.lastName} onChange={e => set("lastName", e.target.value)} placeholder="Doe" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Phone * (10 digits)</label><input required value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="9876543210" className={inputCls} /></div>
                  <div><label className={labelCls}>Date of Birth *</label><input type="date" required value={form.dob} onChange={e => set("dob", e.target.value)} className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Gender *</label>
                    <select required value={form.gender} onChange={e => set("gender", e.target.value)} className={inputCls}>
                      <option value="">Select</option><option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Marital Status *</label>
                    <select required value={form.maritalStatus} onChange={e => set("maritalStatus", e.target.value)} className={inputCls}>
                      <option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Nationality</label>
                    <input value={form.nationality} onChange={e => set("nationality", e.target.value)} placeholder="Indian" className={inputCls} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>Father's Name *</label><input required value={form.fatherName} onChange={e => set("fatherName", e.target.value)} placeholder="Father's full name" className={inputCls} /></div>
                  <div><label className={labelCls}>Mother's Name</label><input value={form.motherName} onChange={e => set("motherName", e.target.value)} placeholder="Mother's full name" className={inputCls} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className={labelCls}>LinkedIn URL</label><input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/..." className={inputCls} /></div>
                  <div><label className={labelCls}>GitHub / Portfolio</label><input value={form.github} onChange={e => set("github", e.target.value)} placeholder="github.com/..." className={inputCls} /></div>
                </div>
              </div>
            )}

            {/* STEP 3: Address & Identity */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Address & Identity</h2>
                  <p className="text-sm text-gray-500 mt-1">All fields are optional   you can fill later</p>
                </div>
                <div>
                  <label className={labelCls}>Permanent Address * (min 10 chars)</label>
                  <textarea rows={2} required value={form.permanentAddress} onChange={e => set("permanentAddress", e.target.value)} placeholder="House No, Street, City, State, PIN" className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
                    <input type="checkbox" checked={form.sameAddress} onChange={e => set("sameAddress", e.target.checked)} className="w-4 h-4 rounded accent-indigo-600" />
                    <span className="text-xs font-medium text-gray-600">Current address same as permanent</span>
                  </label>
                  {!form.sameAddress && (
                    <textarea rows={2} value={form.currentAddress} onChange={e => set("currentAddress", e.target.value)} placeholder="Current address (if different)" className={inputCls + " resize-none"} />
                  )}
                </div>
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Shield className="w-3 h-3" /> Identity Documents (Optional)
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className={labelCls}>PAN Number</label><input value={form.panNumber} onChange={e => set("panNumber", e.target.value.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} className={inputCls + " uppercase"} /></div>
                    <div><label className={labelCls}>Aadhaar Number</label><input value={form.aadhaarNumber} onChange={e => set("aadhaarNumber", e.target.value.replace(/\D/g, ""))} placeholder="1234 5678 9012" maxLength={12} className={inputCls} /></div>
                    <div><label className={labelCls}>Passport Number</label><input value={form.passportNumber} onChange={e => set("passportNumber", e.target.value.toUpperCase())} placeholder="A1234567 (optional)" className={inputCls + " uppercase"} /></div>
                    <div><label className={labelCls}>Driving License</label><input value={form.drivingLicense} onChange={e => set("drivingLicense", e.target.value.toUpperCase())} placeholder="DL number (optional)" className={inputCls + " uppercase"} /></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5"><Shield className="w-3 h-3" /> Your documents are encrypted and stored securely</p>
                </div>
              </div>
            )}

            {/* STEP 4: Education */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Education Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Add your qualifications (graduation is important)</p>
                </div>
                {form.educations.map((edu, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 relative">
                    {idx > 0 && (
                      <button type="button" onClick={() => removeEdu(idx)} className="absolute top-3 right-3 text-xs text-red-500 font-bold hover:text-red-700">Remove</button>
                    )}
                    <p className="text-xs font-bold text-indigo-600">{idx === 0 ? "Highest Qualification *" : `Qualification ${idx + 1}`}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className={labelCls}>Degree *</label><input value={edu.degree} onChange={e => updateEdu(idx, "degree", e.target.value)} placeholder="B.Tech in Computer Science" className={inputCls} /></div>
                      <div><label className={labelCls}>Institution *</label><input value={edu.institution} onChange={e => updateEdu(idx, "institution", e.target.value)} placeholder="IIT Hyderabad" className={inputCls} /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div><label className={labelCls}>Year</label><input value={edu.year} onChange={e => updateEdu(idx, "year", e.target.value)} placeholder="2024" className={inputCls} /></div>
                      <div><label className={labelCls}>Grade / CGPA</label><input value={edu.grade} onChange={e => updateEdu(idx, "grade", e.target.value)} placeholder="8.5" className={inputCls} /></div>
                      <div><label className={labelCls}>Type</label>
                        <select value={edu.eduType} onChange={e => updateEdu(idx, "eduType", e.target.value)} className={inputCls}>
                          <option>Full-time</option><option>Part-time</option><option>Distance</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={addEdu} className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition">
                  + Add Another Qualification
                </button>
              </div>
            )}

            {/* STEP 5: Experience */}
            {step === 5 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Work Experience</h2>
                  <p className="text-sm text-gray-500 mt-1">Tell us about your professional background</p>
                </div>
                <div className="flex gap-3">
                  {[
                    { value: "fresher", label: "Fresher", desc: "No work experience" },
                    { value: "experienced", label: "Experienced", desc: "Have work experience" },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => set("hasExperience", opt.value)}
                      className={`flex-1 p-4 rounded-xl border-2 text-left transition-all ${form.hasExperience === opt.value ? "border-indigo-500 bg-indigo-50" : "border-gray-200 hover:border-gray-300"}`}>
                      <p className={`text-sm font-bold ${form.hasExperience === opt.value ? "text-indigo-700" : "text-gray-700"}`}>{opt.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
                {form.hasExperience === "experienced" && (
                  <div className="space-y-4 pt-2">
                    {form.experiences.map((exp, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-3 relative">
                        {idx > 0 && (
                          <button type="button" onClick={() => removeExp(idx)} className="absolute top-3 right-3 text-xs text-red-500 font-bold hover:text-red-700">Remove</button>
                        )}
                        <p className="text-xs font-bold text-indigo-600">Experience {idx + 1}</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div><label className={labelCls}>Company *</label><input value={exp.company} onChange={e => updateExp(idx, "company", e.target.value)} placeholder="Google" className={inputCls} /></div>
                          <div><label className={labelCls}>Role *</label><input value={exp.role} onChange={e => updateExp(idx, "role", e.target.value)} placeholder="Software Engineer" className={inputCls} /></div>
                        </div>
                        <div><label className={labelCls}>Duration</label><input value={exp.duration} onChange={e => updateExp(idx, "duration", e.target.value)} placeholder="Jan 2022 - Present" className={inputCls} /></div>
                        <div><label className={labelCls}>Description</label><textarea rows={2} value={exp.description} onChange={e => updateExp(idx, "description", e.target.value)} placeholder="Key responsibilities..." className={inputCls + " resize-none"} /></div>
                      </div>
                    ))}
                    <button type="button" onClick={addExp} className="w-full py-2.5 border-2 border-dashed border-indigo-200 text-indigo-600 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition">
                      + Add Another Experience
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 6: Skills & Resume */}
            {step === 6 && (
              <div className="space-y-4">
                <div className="mb-2">
                  <h2 className="text-2xl font-extrabold text-gray-900">Skills & Resume</h2>
                  <p className="text-sm text-gray-500 mt-1">Final step   showcase your expertise</p>
                </div>
                <div>
                  <label className={labelCls}>Key Skills * (comma separated)</label>
                  <input value={form.skills} onChange={e => set("skills", e.target.value)} placeholder="React, Python, Node.js, SQL, AWS" className={inputCls} />
                  <p className="text-xs text-gray-400 mt-1">Add at least 3-5 relevant skills</p>
                </div>
                <div>
                  <label className={labelCls}>Professional Summary</label>
                  <textarea rows={3} value={form.bio} onChange={e => set("bio", e.target.value)} placeholder="Brief summary about yourself, your goals, and what you bring to the table..." className={inputCls + " resize-none"} />
                </div>
                <div>
                  <label className={labelCls}>Upload Resume (PDF / DOCX)</label>
                  <label className={`flex items-center justify-center gap-3 px-4 py-5 border-2 border-dashed rounded-xl cursor-pointer transition ${resumeFile ? "border-green-300 bg-green-50" : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30"}`}>
                    <input type="file" accept=".pdf,.docx,.doc" onChange={e => setResumeFile(e.target.files[0] || null)} className="hidden" />
                    {resumeFile ? (
                      <span className="flex items-center gap-2 text-sm text-green-700 font-medium"><CheckCircle2 className="w-5 h-5" /> {resumeFile.name}</span>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload resume</p>
                        <p className="text-xs text-gray-400">PDF or DOCX, max 5MB</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
              {step > 1 ? (
                <button onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-900 transition">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              ) : <div />}

              {step < 6 ? (
                <button onClick={nextStep}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-70">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4" /> Create Account</>}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
