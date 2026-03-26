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
    <div className="max-w-3xl mx-auto px-4 pt-12 pb-16">
      {/* Hero section — dino eating the input */}
      <div className="flex flex-col items-center">
        {/* Heading above the dino */}
        <h1 className="text-3xl font-bold text-gray-900 mb-1 text-center">
          DinoDigest
        </h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Feed it anything. Get knowledge back.
        </p>

        {/* Dino + Input composition */}
        <div className="relative w-full max-w-lg flex flex-col items-center">
          {/* The dino — positioned so its mouth hangs over the input */}
          <div
            className={loading ? "" : "animate-float"}
            style={{ marginBottom: "-22px", marginRight: "-80px" }}
          >
            <Dino state={loading ? "chewing" : "idle"} size={180} />
          </div>

          {/* Input card — the "food" being eaten */}
          <div
            className={`relative w-full transition-transform ${
              chomping ? "animate-chomp" : ""
            }`}
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-1.5
                            shadow-sm hover:shadow-md hover:border-gray-300 transition-all
                            focus-within:border-gray-400 focus-within:shadow-md">
              <div className="flex gap-1.5">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !loading && handleFeed()}
                  placeholder="Paste a blog URL here..."
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

            {error && (
              <p className="mt-2 text-sm text-red-500 animate-fade-in text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* How it works — below the fold */}
      <div className="mt-16 grid grid-cols-3 gap-6 text-center">
        <div>
          <div className="text-2xl mb-2">1</div>
          <p className="text-sm text-gray-600 font-medium">Paste a URL</p>
          <p className="text-xs text-gray-400 mt-1">Any English blog or article</p>
        </div>
        <div>
          <div className="text-2xl mb-2">2</div>
          <p className="text-sm text-gray-600 font-medium">Dino chews it</p>
          <p className="text-xs text-gray-400 mt-1">AI breaks it into digestible pieces</p>
        </div>
        <div>
          <div className="text-2xl mb-2">3</div>
          <p className="text-sm text-gray-600 font-medium">You absorb it</p>
          <p className="text-xs text-gray-400 mt-1">Summaries, flashcards, quizzes</p>
        </div>
      </div>
    </div>
  );
}
