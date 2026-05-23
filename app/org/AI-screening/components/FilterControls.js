"use client";

import { useState } from "react";
import { Filter } from "lucide-react";

const PRESETS = [3, 5, 10, 20];

export default function FilterControls({ total, topN, setTopN }) {
  const [customValue, setCustomValue] = useState("");

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customValue);
    if (val > 0 && val <= total) {
      setTopN(val);
      setCustomValue("");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 bg-white rounded-xl px-4 py-2.5 border border-gray-100 shadow-sm">
      <Filter className="w-3 h-3 text-gray-400" />
      <span className="text-[10px] font-bold text-gray-500">Show Top:</span>

      {PRESETS.filter((n) => n <= total).map((n) => (
        <button key={n} onClick={() => setTopN(n)}
          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
            topN === n ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}>
          {n}
        </button>
      ))}

      <button onClick={() => setTopN(total)}
        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition ${
          topN === total ? "bg-indigo-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}>
        All ({total})
      </button>

      <form onSubmit={handleCustomSubmit} className="flex items-center gap-1.5 ml-1">
        <input type="number" min="1" max={total} value={customValue}
          onChange={(e) => setCustomValue(e.target.value)} placeholder="Custom"
          className="w-14 px-2 py-1 text-[10px] border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400" />
        <button type="submit"
          className="px-2 py-1 text-[10px] font-bold bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Go
        </button>
      </form>
    </div>
  );
}
