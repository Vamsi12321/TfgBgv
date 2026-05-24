"use client";

import { useCallback } from "react";
import { Upload, FileText, CheckCircle2, X, Zap, AlertCircle, Brain, Sparkles, Target, Shield, Clock } from "lucide-react";

export default function UploadSection({ jdFile, setJdFile, resumeFiles, setResumeFiles, topN, setTopN, onMatch, error }) {
  const handleJdDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".pdf") || file.name.endsWith(".docx") || file.name.endsWith(".txt"))) {
      setJdFile(file);
    }
  }, [setJdFile]);

  const handleResumeDrop = useCallback((e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (f) => f.name.endsWith(".pdf") || f.name.endsWith(".docx")
    );
    if (files.length > 0) {
      setResumeFiles((prev) => [...prev, ...files]);
    }
  }, [setResumeFiles]);

  const removeResume = (index) => {
    setResumeFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const isReady = jdFile && resumeFiles.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
      {/* LEFT — Upload Panel (3 cols) */}
      <div className="lg:col-span-3 space-y-4">
        {/* JD Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-800">Job Description</h3>
              <p className="text-[9px] text-gray-400">The role you want to hire for</p>
            </div>
          </div>
          <div
            onDrop={handleJdDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
              jdFile ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
            }`}
            onClick={() => document.getElementById("jd-input").click()}
          >
            {jdFile ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-700 truncate">{jdFile.name}</p>
                  <p className="text-[9px] text-gray-400">{(jdFile.size / 1024).toFixed(1)} KB • Click to change</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-gray-200 group-hover:text-blue-400 transition" />
                <p className="text-xs text-gray-500">Drop JD here or <span className="text-blue-600 font-semibold">browse</span></p>
                <p className="text-[9px] text-gray-300">Supports PDF, DOCX, TXT</p>
              </div>
            )}
            <input id="jd-input" type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={(e) => e.target.files[0] && setJdFile(e.target.files[0])} />
          </div>
        </div>

        {/* Resume Upload Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Upload className="w-3.5 h-3.5 text-violet-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-800">Candidate Resumes</h3>
                <p className="text-[9px] text-gray-400">Upload one or multiple resumes</p>
              </div>
            </div>
            {resumeFiles.length > 0 && (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full">
                {resumeFiles.length} file{resumeFiles.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div
            onDrop={handleResumeDrop}
            onDragOver={(e) => e.preventDefault()}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer group ${
              resumeFiles.length > 0 ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 hover:border-violet-300 hover:bg-violet-50/20"
            }`}
            onClick={() => document.getElementById("resume-input").click()}
          >
            {resumeFiles.length > 0 ? (
              <div className="flex items-center justify-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <div className="text-left">
                  <p className="text-xs font-bold text-emerald-700">{resumeFiles.length} resume{resumeFiles.length > 1 ? "s" : ""} uploaded</p>
                  <p className="text-[9px] text-gray-400">Click to add more</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8 text-gray-200 group-hover:text-violet-400 transition" />
                <p className="text-xs text-gray-500">Drop resumes or <span className="text-violet-600 font-semibold">browse</span></p>
                <p className="text-[9px] text-gray-300">PDF or DOCX • Multiple files supported</p>
              </div>
            )}
            <input id="resume-input" type="file" accept=".pdf,.docx" multiple className="hidden"
              onChange={(e) => setResumeFiles((prev) => [...prev, ...Array.from(e.target.files)])} />
          </div>

          {/* File list */}
          {resumeFiles.length > 0 && (
            <div className="mt-3 max-h-28 overflow-y-auto space-y-1">
              {resumeFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-[10px]">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate font-medium">{file.name}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeResume(i); }}
                    className="ml-2 text-gray-300 hover:text-red-500 transition flex-shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-[11px] text-red-600 font-medium">{error}</p>
          </div>
        )}

        {/* Top N + Action */}
        <div className="flex items-center justify-between">
          {resumeFiles.length > 1 ? (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-gray-400">Show Top:</span>
              {[0, 2, 5, 10].map((n) => (
                <button key={n} onClick={() => setTopN(n)}
                  className={`px-2 py-0.5 text-[9px] font-bold rounded-md transition ${
                    topN === n ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}>
                  {n === 0 ? "All" : n}
                </button>
              ))}
              <input
                type="number"
                min="1"
                max={resumeFiles.length}
                placeholder="Custom"
                value={topN > 0 && ![0, 2, 5, 10].includes(topN) ? topN : ""}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setTopN(val > 0 ? val : 0);
                }}
                className="w-14 px-1.5 py-0.5 text-[9px] font-bold text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-100 text-gray-700"
              />
            </div>
          ) : <div />}

          <button onClick={onMatch} disabled={!isReady}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            {isReady ? "Analyze & Rank" : "Upload files first"}
          </button>
        </div>
      </div>

      {/* RIGHT — Info Panel (2 cols) */}
      <div className="lg:col-span-2 space-y-4">
        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="text-xs font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> How it works
          </h3>
          <div className="space-y-2.5">
            {[
              { step: "1", text: "Upload JD & resumes", color: "bg-blue-500" },
              { step: "2", text: "AI extracts skills & experience", color: "bg-violet-500" },
              { step: "3", text: "Semantic + rule-based scoring", color: "bg-indigo-500" },
              { step: "4", text: "Get ranked results with insights", color: "bg-emerald-500" },
            ].map((s) => (
              <div key={s.step} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-md ${s.color} flex items-center justify-center text-[9px] font-bold text-white`}>{s.step}</div>
                <span className="text-[11px] text-gray-600 font-medium">{s.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl border border-indigo-100/50 p-5">
          <h3 className="text-xs font-bold text-indigo-800 mb-3">AI Capabilities</h3>
          <div className="space-y-2">
            {[
              { icon: Brain, text: "Semantic understanding of JD context", color: "text-blue-600" },
              { icon: Target, text: "Role-aware skill matching", color: "text-violet-600" },
              { icon: Shield, text: "Fraud & inconsistency detection", color: "text-emerald-600" },
              { icon: Clock, text: "Results in under 30 seconds", color: "text-amber-600" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2">
                <f.icon className={`w-3.5 h-3.5 ${f.color} flex-shrink-0`} />
                <span className="text-[10px] text-gray-600 font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500">Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600">Ready</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-bold text-gray-800">{jdFile ? "1" : "0"}</p>
              <p className="text-[8px] text-gray-400">JD</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded-lg">
              <p className="text-sm font-bold text-gray-800">{resumeFiles.length}</p>
              <p className="text-[8px] text-gray-400">Resumes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
