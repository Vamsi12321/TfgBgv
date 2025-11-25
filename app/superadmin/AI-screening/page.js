"use client";

import { useState } from "react";
import {
  Upload,
  FileText,
  Sparkles,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";

export default function AIMatcherPage() {
  const [jdText, setJdText] = useState("");
  const [resumeFiles, setResumeFiles] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const handleRemoveFile = (name) => {
    setResumeFiles((prev) => prev.filter((f) => f.name !== name));
  };

  const handleGetMatches = async () => {
    if (!jdText.trim()) return alert("Please paste a Job Description.");
    if (resumeFiles.length === 0) return alert("Please upload resumes first.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("jd", jdText);

      resumeFiles.forEach((file) => formData.append("resumes", file));

     const base = "https://c36ae71fbf3d.ngrok-free.app".replace(/\/+$/, "");
const endpoint = "/secure/ai_resume_selection".replace(/^\/+/, "");

const response = await fetch(`${base}/${endpoint}`, {
  method: "POST",
  body: formData,
});


      const data = await response.json();

      const finalList = (data.topFiveResumes || []).slice(0, 5).map((r) => ({
        fileName: r.fileName || "Unknown File",
        similarity: r.similarity,
        extracted: r.extracted,
      }));

      setResults(finalList);
    } catch (err) {
      alert("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 md:p-10 text-gray-900">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* ================= LEFT PANEL – JD + Upload ================= */}
        <div
          className="backdrop-blur-2xl bg-white/70 border border-white/50 
        shadow-2xl rounded-3xl p-8 space-y-6 h-fit sticky top-10"
        >
          <h2 className="text-2xl font-bold flex items-center gap-2 text-[#ff004f]">
            <FileText /> Job Description
          </h2>

          {/* JD BOX */}
          <textarea
            placeholder="Paste job description here..."
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            className="
              w-full border border-gray-300 rounded-xl p-4 min-h-[200px]
              bg-white/60 backdrop-blur-md shadow-inner resize-none
              focus:ring-2 focus:ring-[#ff004f] focus:border-[#ff004f]
            "
          />

          {/* FILE UPLOAD */}
          <label
            className="cursor-pointer flex items-center gap-2 text-sm
            text-[#ff004f] hover:text-[#e60047] transition w-fit"
          >
            <Upload size={18} /> Upload Resumes (PDF)
            <input
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files);
                setResumeFiles((prev) => [...prev, ...files]);
              }}
            />
          </label>

          {/* FILE LIST */}
          {resumeFiles.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm font-semibold text-gray-600">
                Uploaded Resumes:
              </p>

              <div className="space-y-2">
                {resumeFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white/60 backdrop-blur-xl border border-gray-200 shadow-sm p-3 rounded-xl"
                  >
                    <span className="text-sm text-gray-800">{file.name}</span>

                    <button
                      onClick={() => handleRemoveFile(file.name)}
                      className="text-red-500 hover:text-red-600 p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Get Matches Button */}
          <button
            onClick={handleGetMatches}
            disabled={loading}
            className="
              bg-gradient-to-r from-[#ff004f] to-[#ff5f7a]
              hover:opacity-90 active:scale-[0.98]
              text-white font-semibold shadow-lg
              px-6 py-3 rounded-xl w-full flex items-center justify-center gap-2
              transition-all
            "
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Matching…
              </>
            ) : (
              <>
                <Sparkles size={18} /> Get Top Matches
              </>
            )}
          </button>
        </div>

        {/* ================= RIGHT PANEL – RESULTS ================= */}
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-[#ff004f] flex items-center gap-2">
            <Sparkles size={30} className="text-[#ff004f]" />
            AI Resume Matcher
          </h1>

          {results.length === 0 && (
            <p className="text-gray-500 text-lg">
              Your matched resume results will appear here.
            </p>
          )}

          {results.length > 0 && (
            <>
              <h2 className="text-2xl font-bold text-[#ff004f]">
                🎯 Top Matching Resumes
              </h2>

              <div className="space-y-6">
                {results.map((res, idx) => (
                  <div
                    key={idx}
                    className="bg-white/70 backdrop-blur-xl shadow-xl border border-white/40
                      rounded-2xl p-6 transition-all hover:shadow-2xl hover:-translate-y-1"
                  >
                    {/* Header */}
                    <div
                      className="flex justify-between cursor-pointer"
                      onClick={() => setExpanded(expanded === idx ? null : idx)}
                    >
                      <div>
                        <p className="font-semibold text-lg">
                          {idx + 1}. {res.fileName}
                        </p>

                        {/* Score Bar */}
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-[#ff004f] to-[#ff5f7a] rounded-full"
                              style={{
                                width: `${(res.similarity * 100).toFixed(2)}%`,
                              }}
                            />
                          </div>
                          <p className="text-xs mt-1 text-gray-600">
                            Score:{" "}
                            <span className="font-bold text-[#ff004f]">
                              {(res.similarity * 100).toFixed(2)}%
                            </span>
                          </p>
                        </div>
                      </div>

                      {expanded === idx ? <ChevronUp /> : <ChevronDown />}
                    </div>

                    {/* Expanded box */}
                    {expanded === idx && (
                      <div className="mt-5 bg-white/60 backdrop-blur-xl border border-white/40 rounded-xl p-5 space-y-5">
                        <div>
                          <p className="font-semibold text-gray-700 mb-2">
                            Extracted Skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {res.extracted?.split(",")?.map((skill, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-[#ff004f]/10 text-[#ff004f] 
                                  rounded-full text-xs font-medium shadow-sm border border-[#ff004f]/20"
                              >
                                {skill.trim()}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold text-gray-700 mb-1">
                            AI Extracted Summary
                          </p>
                          <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">
                            {res.extracted}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
