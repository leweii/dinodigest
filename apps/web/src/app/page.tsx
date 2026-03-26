"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dino } from "@/components/dino/dino";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
      {/* Dinosaur */}
      <div className="animate-bounce-gentle mb-6">
        <Dino state="idle" size={180} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
        Feed your dinosaur
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Paste a blog URL and let DinoDigest break it down for you
      </p>

      {/* Input */}
      <div className="w-full max-w-lg">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleFeed()}
            placeholder="https://example.com/blog-post..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-base
                       focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100
                       placeholder:text-gray-400 transition-all"
            disabled={loading}
          />
          <button
            onClick={handleFeed}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl
                       hover:bg-green-700 active:bg-green-800 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed
                       whitespace-nowrap"
          >
            {loading ? "Feeding..." : "Feed"}
          </button>
        </div>

        {error && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">{error}</p>
        )}
      </div>
    </div>
  );
}
