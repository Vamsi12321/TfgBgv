"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, Loader2, Brain } from "lucide-react";

const STEPS = [
  { label: "Parsing resumes", icon: "📄" },
  { label: "Extracting skills & experience", icon: "🔍" },
  { label: "Generating embeddings", icon: "🧠" },
  { label: "Computing ATS scores", icon: "📊" },
  { label: "Ranking candidates", icon: "🏆" },
  { label: "Generating AI explanations", icon: "💡" },
];

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <section className="max-w-md mx-auto px-4 py-16 text-center">
      {/* Animated brain icon */}
      <div className="relative w-16 h-16 mx-auto mb-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 animate-pulse opacity-20" />
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
          <Brain className="w-7 h-7 text-white animate-pulse" />
        </div>
        <div className="absolute -inset-1 rounded-2xl border-2 border-indigo-300 animate-ping opacity-20" />
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-1">Analyzing Candidates</h3>
      <p className="text-xs text-gray-400 mb-6">AI is processing with hybrid semantic scoring</p>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }} />
      </div>

      {/* Steps */}
      <div className="space-y-2 text-left">
        {STEPS.map((step, i) => (
          <div key={i}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-300 ${
              i < currentStep ? "bg-emerald-50 border border-emerald-100" :
              i === currentStep ? "bg-indigo-50 border border-indigo-100" :
              "bg-gray-50 border border-gray-100 opacity-50"
            }`}>
            <span className="text-sm">{step.icon}</span>
            <span className={`text-[11px] font-medium flex-1 ${
              i < currentStep ? "text-emerald-700" :
              i === currentStep ? "text-indigo-700" : "text-gray-400"
            }`}>{step.label}</span>
            {i < currentStep && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
            {i === currentStep && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
          </div>
        ))}
      </div>
    </section>
  );
}
