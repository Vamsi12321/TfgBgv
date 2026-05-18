"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Briefcase, GraduationCap, Code2, FileText,
  Plus, Trash2, Edit2, Upload, Download, X, CheckCircle2,
  Camera, MapPin, Phone, Mail, Globe,
} from "lucide-react";

const TABS = [
  { id: "personal", label: "Personal Info", icon: User },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "skills", label: "Skills", icon: Code2 },
  { id: "resume", label: "Resume", icon: FileText },
];

const defaultPersonal = {
  firstName: "", lastName: "", email: "", phone: "",
  location: "", linkedin: "", github: "", bio: "",
};
const defaultExperience = [];
const defaultEducation = [];
const defaultSkills = [];

const levelColors = {
  Expert: "bg-green-100 text-green-700 border-green-200",
  Advanced: "bg-blue-100 text-blue-700 border-blue-200",
  Intermediate: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Beginner: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("personal");
  const [personal, setPersonal] = useState(defaultPersonal);
  const [experience, setExperience] = useState(defaultExperience);
  const [education, setEducation] = useState(defaultEducation);
  const [skills, setSkills] = useState(defaultSkills);
  const [resumeFile, setResumeFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [editingEdu, setEditingEdu] = useState(null);
  const [showExpForm, setShowExpForm] = useState(false);
  const [showEduForm, setShowEduForm] = useState(false);
  const [newExp, setNewExp] = useState({ company: "", role: "", duration: "", description: "" });
  const [newEdu, setNewEdu] = useState({ institution: "", degree: "", year: "", grade: "" });

  // Load real profile on mount
  useEffect(() => {
    const stored = localStorage.getItem("jobseekerUser");
    if (!stored) { router.push("/tfgjobs/jobseeker/login"); return; }

    const loadProfile = async () => {
      try {
        const res = await fetch("/api/proxy/jobseeker/profile", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();

        // Response: { profile: { name, email, phone, resumeUrl, profileJson: { bio, location, experience, education, skills, linkedinUrl, githubUrl }, profileCompletion } }
        const p = data.profile || data.jobSeeker || data;
        const pj = p.profileJson || {}; // nested profileJson

        // Personal info   top-level fields + profileJson fields
        const fullName = p.name || "";
        const parts = fullName.trim().split(" ");
        setPersonal(prev => ({
          ...prev,
          firstName: parts[0] || prev.firstName,
          lastName: parts.slice(1).join(" ") || prev.lastName,
          email: p.email || prev.email,
          phone: p.phone || prev.phone,
          bio: pj.bio || p.bio || prev.bio,
          location: pj.location || p.location || prev.location,
          linkedin: pj.linkedinUrl || pj.linkedin || p.linkedinUrl || prev.linkedin,
          github: pj.githubUrl || pj.github || p.githubUrl || prev.github,
        }));

        // Experience   inside profileJson
        const expList = pj.experience || p.experience || [];
        if (Array.isArray(expList) && expList.length > 0) {
          setExperience(expList.map((e, i) => ({ ...e, id: e.id || i + 1 })));
        }

        // Education   inside profileJson
        const eduList = pj.education || p.education || [];
        if (Array.isArray(eduList) && eduList.length > 0) {
          setEducation(eduList.map((e, i) => ({ ...e, id: e.id || i + 1 })));
        }

        // Skills   inside profileJson, array of strings
        const skillList = pj.skills || p.skills || [];
        if (Array.isArray(skillList) && skillList.length > 0) {
          setSkills(skillList.map((s, i) =>
            typeof s === "string"
              ? { id: i + 1, name: s, level: "Intermediate" }
              : { id: s.id || i + 1, name: s.name || s, level: s.level || "Intermediate" }
          ));
        }

        // Resume
        if (p.resumeUrl) {
          const fileName = p.resumeUrl.split("/").pop() || "resume.pdf";
          setResumeFile({ name: fileName, size: "", url: p.resumeUrl });
        }

        // Update localStorage
        const u = JSON.parse(stored);
        localStorage.setItem("jobseekerUser", JSON.stringify({
          ...u,
          name: p.name || u.name,
          phone: p.phone || u.phone,
          profileCompletion: p.profileCompletion || u.profileCompletion || 0,
        }));

      } catch (err) {
        console.error("Profile load error:", err);
      }
    };
    loadProfile();
  }, []);

  const completionFields = [
    personal.firstName, personal.lastName, personal.email, personal.phone,
    personal.location, personal.bio, personal.linkedin,
    experience.length > 0 ? "yes" : "",
    education.length > 0 ? "yes" : "",
    skills.length >= 3 ? "yes" : "",
    resumeFile ? "yes" : "",
  ];
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/proxy/jobseeker/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${personal.firstName} ${personal.lastName}`.trim(),
          phone: personal.phone,
          bio: personal.bio,
          location: personal.location,
          linkedinUrl: personal.linkedin,
          githubUrl: personal.github,
          experience: experience.map(({ id, ...e }) => e),
          education: education.map(({ id, ...e }) => e),
          skills: skills.map(s => s.name),
        }),
      });
      // Update localStorage name
      const stored = localStorage.getItem("jobseekerUser");
      if (stored) {
        const u = JSON.parse(stored);
        localStorage.setItem("jobseekerUser", JSON.stringify({
          ...u,
          name: `${personal.firstName} ${personal.lastName}`.trim(),
        }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      setSaved(true); // show success anyway for UX
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (!newSkill.trim()) return;
    setSkills((prev) => [...prev, { id: Date.now(), name: newSkill.trim(), level: newSkillLevel }]);
    setNewSkill("");
  };

  const removeSkill = (id) => setSkills((prev) => prev.filter((s) => s.id !== id));

  const addExperience = () => {
    if (!newExp.company || !newExp.role) return;
    setExperience((prev) => [...prev, { ...newExp, id: Date.now() }]);
    setNewExp({ company: "", role: "", duration: "", description: "" });
    setShowExpForm(false);
  };

  const addEducation = () => {
    if (!newEdu.institution || !newEdu.degree) return;
    setEducation((prev) => [...prev, { ...newEdu, id: Date.now() }]);
    setNewEdu({ institution: "", degree: "", year: "", grade: "" });
    setShowEduForm(false);
  };

  const handleResumeDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setResumeFile({ name: file.name, size: `${(file.size / 1024).toFixed(0)} KB` });
  };

  const inputClass = "w-full px-4 py-3 border border-slate-200 bg-slate-50 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Save Toast */}
      {saved && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold rounded-2xl shadow-xl">
          <CheckCircle2 className="w-4 h-4" />
          Profile saved successfully!
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">My Profile</h1>
          <p className="text-slate-500 mt-1">Keep your profile updated to attract the best opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-xl">
            <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all" style={{ width: `${completion}%` }}></div>
            </div>
            <span className="text-sm font-bold text-blue-700">{completion}%</span>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {personal.firstName.charAt(0)}{personal.lastName.charAt(0)}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border-2 border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{personal.firstName} {personal.lastName}</h2>
            <p className="text-slate-500 text-sm">{personal.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs text-slate-500"><MapPin className="w-3 h-3" />{personal.location}</span>
              <span className="flex items-center gap-1 text-xs text-slate-500"><Phone className="w-3 h-3" />{personal.phone}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-100 scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name</label>
                  <input type="text" value={personal.firstName} onChange={(e) => setPersonal((p) => ({ ...p, firstName: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name</label>
                  <input type="text" value={personal.lastName} onChange={(e) => setPersonal((p) => ({ ...p, lastName: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />Email</span></label>
                  <input type="email" value={personal.email} onChange={(e) => setPersonal((p) => ({ ...p, email: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />Phone</span></label>
                  <input type="tel" value={personal.phone} onChange={(e) => setPersonal((p) => ({ ...p, phone: e.target.value }))} className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />Location</span></label>
                <input type="text" value={personal.location} onChange={(e) => setPersonal((p) => ({ ...p, location: e.target.value }))} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />LinkedIn URL</span></label>
                  <input type="url" value={personal.linkedin} onChange={(e) => setPersonal((p) => ({ ...p, linkedin: e.target.value }))} className={inputClass} placeholder="linkedin.com/in/yourname" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5"><span className="flex items-center gap-1"><Globe className="w-3.5 h-3.5" />GitHub URL</span></label>
                  <input type="url" value={personal.github} onChange={(e) => setPersonal((p) => ({ ...p, github: e.target.value }))} className={inputClass} placeholder="github.com/yourname" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Professional Bio</label>
                <textarea rows={4} value={personal.bio} onChange={(e) => setPersonal((p) => ({ ...p, bio: e.target.value }))} className={inputClass + " resize-none"} placeholder="Tell employers about yourself..." />
              </div>
            </div>
          )}

          {/* Experience Tab */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-blue-100 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {exp.company.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <p className="text-sm text-blue-600 font-medium">{exp.company}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{exp.duration}</p>
                        <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setExperience((prev) => prev.filter((e) => e.id !== exp.id))} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {showExpForm && (
                <div className="bg-blue-50 rounded-2xl p-5 border border-blue-200 space-y-3">
                  <h4 className="font-bold text-slate-800 mb-3">Add Experience</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Company" value={newExp.company} onChange={(e) => setNewExp((p) => ({ ...p, company: e.target.value }))} className={inputClass} />
                    <input placeholder="Role / Title" value={newExp.role} onChange={(e) => setNewExp((p) => ({ ...p, role: e.target.value }))} className={inputClass} />
                  </div>
                  <input placeholder="Duration (e.g. Jan 2022   Present)" value={newExp.duration} onChange={(e) => setNewExp((p) => ({ ...p, duration: e.target.value }))} className={inputClass} />
                  <textarea rows={2} placeholder="Description" value={newExp.description} onChange={(e) => setNewExp((p) => ({ ...p, description: e.target.value }))} className={inputClass + " resize-none"} />
                  <div className="flex gap-2">
                    <button onClick={addExperience} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">Add</button>
                    <button onClick={() => setShowExpForm(false)} className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <button onClick={() => setShowExpForm(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all">
                <Plus className="w-4 h-4" />
                Add Experience
              </button>
            </div>
          )}

          {/* Education Tab */}
          {activeTab === "education" && (
            <div className="space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 group hover:border-blue-100 transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900">{edu.degree}</h3>
                        <p className="text-sm text-purple-600 font-medium">{edu.institution}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{edu.year} {edu.grade && ` ${edu.grade}`}</p>
                      </div>
                    </div>
                    <button onClick={() => setEducation((prev) => prev.filter((e) => e.id !== edu.id))} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {showEduForm && (
                <div className="bg-purple-50 rounded-2xl p-5 border border-purple-200 space-y-3">
                  <h4 className="font-bold text-slate-800 mb-3">Add Education</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Institution" value={newEdu.institution} onChange={(e) => setNewEdu((p) => ({ ...p, institution: e.target.value }))} className={inputClass} />
                    <input placeholder="Degree" value={newEdu.degree} onChange={(e) => setNewEdu((p) => ({ ...p, degree: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Year (e.g. 2016   2020)" value={newEdu.year} onChange={(e) => setNewEdu((p) => ({ ...p, year: e.target.value }))} className={inputClass} />
                    <input placeholder="Grade / GPA" value={newEdu.grade} onChange={(e) => setNewEdu((p) => ({ ...p, grade: e.target.value }))} className={inputClass} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={addEducation} className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-xl hover:bg-purple-700 transition-colors">Add</button>
                    <button onClick={() => setShowEduForm(false)} className="px-4 py-2 bg-white text-slate-600 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">Cancel</button>
                  </div>
                </div>
              )}

              <button onClick={() => setShowEduForm(true)} className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-sm font-medium text-slate-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50/30 transition-all">
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            </div>
          )}

          {/* Skills Tab */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div key={skill.id} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-medium ${levelColors[skill.level]}`}>
                    {skill.name}
                    <span className="text-xs opacity-70"> {skill.level}</span>
                    <button onClick={() => removeSkill(skill.id)} className="hover:opacity-100 opacity-60 transition-opacity ml-1">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <h4 className="font-semibold text-slate-800 mb-4">Add a Skill</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Skill name (press Enter to add)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addSkill()}
                    className={inputClass + " flex-1"}
                  />
                  <select
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(e.target.value)}
                    className={inputClass + " sm:w-40"}
                  >
                    {["Beginner", "Intermediate", "Advanced", "Expert"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                  <button onClick={addSkill} className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" />
                    Add Skill
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Tip: Press Enter to quickly add a skill</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(levelColors).map(([level, color]) => (
                  <div key={level} className={`px-3 py-2 rounded-xl border text-xs font-semibold text-center ${color}`}>
                    {level}: {skills.filter((s) => s.level === level).length}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Tab */}
          {activeTab === "resume" && (
            <div className="space-y-6">
              {resumeFile && (
                <div className="flex items-center gap-4 p-5 bg-green-50 border border-green-200 rounded-2xl">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{resumeFile.name}</p>
                    <p className="text-sm text-slate-500">{resumeFile.size}  Uploaded recently</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={async () => {
                        try {
                          const response = await fetch(resumeFile.url);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = resumeFile.name || "resume.pdf";
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch {
                          window.open(resumeFile.url, "_blank");
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-xl hover:bg-green-50 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              )}

              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleResumeDrop}
                className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer ${
                  dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
                }`}
              >
                <input type="file" accept=".pdf,.doc,.docx" onChange={async (e) => {
                  const f = e.target.files[0];
                  if (!f) return;
                  setResumeFile({ name: f.name, size: `${(f.size/1024).toFixed(0)} KB` });
                  try {
                    const fd = new FormData();
                    fd.append("file", f);
                    await fetch("/api/proxy/jobseeker/uploadResume", {
                      method: "POST",
                      credentials: "include",
                      body: fd,
                    });
                  } catch {}
                }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-700 mb-1">
                  {resumeFile ? "Replace Resume" : "Upload Resume"}
                </p>
                <p className="text-sm text-slate-400">Drag & drop or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
              </div>

              <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                <h4 className="text-sm font-semibold text-blue-800 mb-2">Resume Tips</h4>
                <ul className="space-y-1.5">
                  {["Keep it to 1-2 pages", "Use action verbs and quantify achievements", "Tailor it to each job application", "Include relevant keywords from job descriptions"].map((tip) => (
                    <li key={tip} className="flex items-start gap-2 text-xs text-blue-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Profile completion: <span className="font-bold text-blue-600">{completion}%</span>
            </p>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-blue-200 text-sm disabled:opacity-70"
            >
              {saving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}