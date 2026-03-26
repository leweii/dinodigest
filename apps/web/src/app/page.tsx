"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dino } from "@/components/dino/dino";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [chomping, setChomping] = useState(false);
  const router = useRouter();

  const handleFeed = async () => {
    setError("");

    if (!url.trim()) {
      setError("Please paste a URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    // Chomp animation
    setChomping(true);
    setTimeout(() => setChomping(false), 300);

    setLoading(true);
    try {
      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit URL");
        setLoading(false);
        return;
      }

      const { articleId } = await res.json();
      router.push(`/digest/${articleId}`);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pt-8 pb-16 flex flex-col items-center">
      {/* Dino + Input — the input sits inside the dino's open mouth */}
      <div className="relative w-full flex flex-col items-center">
        {/* Dino positioned so mouth aligns with input */}
        <div
          className={`relative z-10 ${loading ? "" : "animate-float"}`}
          style={{ marginBottom: "-30px" }}
        >
          <Dino state={loading ? "chewing" : "idle"} size={220} />
        </div>

        {/* Input — visually "inside" the dino's mouth */}
        <div
          className={`relative z-20 w-full max-w-md transition-transform ${
            chomping ? "animate-chomp" : ""
          }`}
        >
          {/* Bite marks — decorative top edge */}
          <div className="flex justify-center gap-1 -mb-1">
            <div className="w-3 h-2 bg-[var(--background)] rounded-b-full border-x border-b border-gray-300" />
            <div className="w-3 h-2 bg-[var(--background)] rounded-b-full border-x border-b border-gray-300" />
            <div className="w-3 h-2 bg-[var(--background)] rounded-b-full border-x border-b border-gray-300" />
            <div className="w-3 h-2 bg-[var(--background)] rounded-b-full border-x border-b border-gray-300" />
            <div className="w-3 h-2 bg-[var(--background)] rounded-b-full border-x border-b border-gray-300" />
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-2xl p-1 shadow-sm hover:border-gray-400 hover:shadow-md transition-all">
            <div className="flex gap-1">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && !loading && handleFeed()}
                placeholder="Paste a URL to feed the dino..."
                className="flex-1 px-4 py-3 text-base bg-transparent
                           focus:outline-none placeholder:text-gray-400"
                disabled={loading}
              />
              <button
                onClick={handleFeed}
                disabled={loading}
                className="px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl
                           hover:bg-gray-800 active:bg-black transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed
                           whitespace-nowrap"
              >
                {loading ? "Chewing..." : "Feed"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-500 animate-fade-in">{error}</p>
        )}
      </div>

      {/* Tagline */}
      <div className="mt-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Feed it anything. Get knowledge back.
        </h1>
        <p className="text-gray-500 text-sm max-w-sm mx-auto">
          Paste a blog URL — your dino chews it into summaries,
          flashcards, key concepts, and quizzes.
        </p>
      </div>
    </div>
  );
}
