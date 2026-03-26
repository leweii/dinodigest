"use client";

import { useState } from "react";

export function KeyPointRenderer({ data }: { data: Record<string, unknown> }) {
  const [expanded, setExpanded] = useState(false);
  const concept = String(data.concept ?? "");
  const explanation = String(data.explanation ?? "");
  const analogy = data.analogy ? String(data.analogy) : null;
  const difficulty = (data.difficulty as number) ?? 3;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-green-200 transition-colors">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="font-semibold text-gray-900">{concept}</h3>
        <div className="flex items-center gap-2">
          {/* Difficulty dots */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`w-1.5 h-1.5 rounded-full ${
                  level <= difficulty ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 animate-fade-in">
          <p className="text-gray-700 text-sm leading-relaxed">{explanation}</p>
          {analogy && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Analogy: </span>
                {analogy}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
