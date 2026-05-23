"use client";

import { useState, useEffect } from "react";
import { Brain, RotateCcw, Sparkles } from "lucide-react";
import HeroSection from "./components/HeroSection";
import UploadSection from "./components/UploadSection";
import ResultsDashboard from "./components/ResultsDashboard";
import LoadingState from "./components/LoadingState";

export default function OrgAIScreeningPage() {
  const [jdFile, setJdFile] = useState(null);
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("upload");
  const [topN, setTopN] = useState(0);

  // Restore results from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("aiScreeningResults");
      if (saved) {
        const parsed = JSON.parse(saved);
        setResults(parsed);
        setStep("results");
      }
    } catch {}
  }, []);

  const handleMatch = async () => {
    if (!jdFile || resumeFiles.length === 0) {
      setError("Please upload a Job Description and at least one resume.");
      return;
    }

    setError(null);
    setLoading(true);
    setStep("loading");

    try {
      const formData = new FormData();
      formData.append("jd_file", jdFile);
      resumeFiles.forEach((file) => {
        formData.append("resume_files", file);
      });
      if (topN > 0) formData.append("top_n", topN.toString());

      const response = await fetch("/api/proxy/secure/externalAiScreening", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        let errMsg = "Matching failed";
        try {
          const errData = await response.json();
          errMsg = errData.detail || (Array.isArray(errData.detail) ? errData.detail[0]?.msg : errMsg);
        } catch {
          errMsg = `Server error (${response.status})`;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      setResults(data);
      setStep("results");
      // Persist results for navigation
      try { sessionStorage.setItem("aiScreeningResults", JSON.stringify(data)); } catch {}
    } catch (err) {
      setError(err.message || "An error occurred during matching.");
      setStep("upload");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setJdFile(null);
    setResumeFiles([]);
    setResults(null);
    setError(null);
    setStep("upload");
    setTopN(0);
    try { sessionStorage.removeItem("aiScreeningResults"); } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                AI ATS Matcher
                <span className="px-1.5 py-0.5 bg-gradient-to-r from-indigo-100 to-violet-100 text-indigo-700 text-[9px] font-bold rounded-md border border-indigo-200">
                  <Sparkles className="w-2.5 h-2.5 inline mr-0.5" />AI
                </span>
              </h1>
              <p className="text-[10px] text-gray-400">Intelligent Resume Ranking</p>
            </div>
          </div>

          {/* Status indicator + reset */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 rounded-full border border-emerald-100">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-emerald-700">System Online</span>
            </div>
            {step === "results" && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition border border-indigo-100">
                <RotateCcw className="w-3 h-3" /> New Analysis
              </button>
            )}
          </div>
        </div>

        {step === "upload" && (
          <>
            <HeroSection />
            <UploadSection
              jdFile={jdFile}
              setJdFile={setJdFile}
              resumeFiles={resumeFiles}
              setResumeFiles={setResumeFiles}
              topN={topN}
              setTopN={setTopN}
              onMatch={handleMatch}
              error={error}
            />
          </>
        )}

        {step === "loading" && <LoadingState />}

        {step === "results" && results && (
          <ResultsDashboard results={results} />
        )}
      </div>
    </div>
  );
}
