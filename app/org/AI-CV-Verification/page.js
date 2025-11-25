"use client";

import { useState, useEffect } from "react";
import {
  Upload,
  Loader2,
  Sparkles,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_RENDER = "https://maihoo.onrender.com";
const API_BASE_NGROK = "https://c36ae71fbf3d.ngrok-free.app";

export default function OrgAICVVerificationPage() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState("");

  const [orgId, setOrgId] = useState("");   // ⭐ store org id here

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  /* -------------------------------------------- */
  /* STEP 1 — LOAD ORG ID                         */
  /* -------------------------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_RENDER}/secure/getOrganizations`, {
          credentials: "include",
        });

        const data = await res.json();

        // If only one org belongs to this user:
        if (res.ok && data.organizations?.length > 0) {
          setOrgId(data.organizations[0]._id);
        }

      } catch (err) {
        console.error("Error loading orgId:", err);
      }
    })();
  }, []);

  /* -------------------------------------------- */
  /* STEP 2 — LOAD CANDIDATES                     */
  /* -------------------------------------------- */
  useEffect(() => {
    if (!orgId) return;

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE_RENDER}/secure/getCandidates?orgId=${orgId}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (res.ok) setCandidates(data.candidates || []);

      } catch (err) {
        console.error("Error loading candidates:", err);
      }
    })();
  }, [orgId]);

  /* -------------------------------------------- */
  /* STEP 3 — VALIDATE RESUME                     */
  /* -------------------------------------------- */
  const handleValidate = async () => {
    if (!selectedCandidate) return alert("Select a candidate.");
    if (!file) return alert("Upload a resume first.");

    setLoading(true);
    setAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("candidateId", selectedCandidate);
      formData.append("orgId", orgId);              // ⭐ SEND ORG ID
      formData.append("resume", file);

      const cleanBase = API_BASE_NGROK.replace(/\/+$/, "");

      const res = await fetch(`${cleanBase}/secure/ai_resume_validation`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setAnalysis(data);

    } catch (err) {
      console.error("Validation error:", err);
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------- */
  /* UI                                           */
  /* -------------------------------------------- */
  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10 flex justify-center">
      <div className="w-full max-w-3xl space-y-8">
        <h1 className="text-4xl font-bold text-[#ff004f] flex items-center gap-3">
          <Sparkles /> AI CV Validation (Organization)
        </h1>

        {/* Candidate + Upload */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 space-y-6">

          {/* Candidate dropdown */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Select Candidate
            </label>
            <select
              className="w-full p-3 border rounded-xl bg-gray-50"
              value={selectedCandidate}
              onChange={(e) => setSelectedCandidate(e.target.value)}
            >
              <option value="">-- Select Candidate --</option>
              {candidates.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.firstName} {c.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Upload Resume */}
          <div>
            <label className="block mb-2 font-semibold text-gray-700">
              Upload Resume
            </label>

            <label className="cursor-pointer flex items-center gap-3 bg-gray-50 border border-gray-300 p-4 rounded-xl hover:bg-gray-100 transition">
              <Upload size={22} className="text-[#ff004f]" />
              <span className="text-gray-700">Choose Resume File</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </label>

            {file && (
              <p className="text-green-700 text-sm flex items-center gap-1 mt-2">
                <CheckCircle size={16} /> {file.name} selected
              </p>
            )}
          </div>

          {/* Validate Button */}
          <button
            onClick={handleValidate}
            disabled={loading}
            className="bg-[#ff004f] hover:bg-[#e60047] transition text-white font-medium px-6 py-3 rounded-lg flex items-center justify-center gap-2 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Validating Resume…
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Run AI Validation
              </>
            )}
          </button>
        </div>

        {/* AI Result */}
        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 space-y-6"
            >
              {/* Status */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">
                  Validation Result
                </h2>

                {analysis?.validation?.status === "VALID" ? (
                  <div className="flex items-center gap-2 text-green-600 font-semibold">
                    <CheckCircle /> Valid Resume
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600 font-semibold">
                    <XCircle /> Invalid / Suspicious
                  </div>
                )}
              </div>

              {/* Issues List */}
              {analysis?.validation?.issues?.length > 0 && (
                <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                  <p className="font-semibold text-red-700 mb-2">
                    Issues Found
                  </p>

                  <ul className="list-disc ml-5 space-y-2">
                    {analysis.validation.issues.map((issue, idx) => (
                      <li key={idx} className="text-red-700">
                        {typeof issue === "string" ? (
                          <span>{issue}</span>
                        ) : (
                          <>
                            <p className="font-semibold">{issue.issue_type}</p>
                            <p className="text-gray-600">{issue.description}</p>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Explanation */}
              <div>
                <p className="font-semibold text-gray-700 mb-1">Explanation</p>
                <p className="text-gray-600">
                  {analysis?.validation?.explanation}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
