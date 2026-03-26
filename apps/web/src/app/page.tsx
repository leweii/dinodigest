"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Dino } from "@/components/dino/dino";

type FeedPhase = "idle" | "eating" | "swallowed";

export default function HomePage() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [phase, setPhase] = useState<FeedPhase>("idle");
  const router = useRouter();
  const articleIdRef = useRef<string | null>(null);

  const handleFeed = async () => {
    setError("");

    if (!url.trim()) {
      setError("请粘贴一个链接");
      return;
    }

    try {
      new URL(url);
    } catch {
      setError("请输入有效的链接");
      return;
    }

    // Phase 1: Eating animation (dino turns head and bites)
    setPhase("eating");

    // Start API call in parallel with animation
    const apiPromise = fetch("/api/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    // Wait at least 1.5s for the eating animation
    const [res] = await Promise.all([
      apiPromise,
      new Promise((r) => setTimeout(r, 1500)),
    ]);

    if (!res.ok) {
      try {
        const data = await res.json();
        setError(data.error || "提交失败");
      } catch {
        setError("提交失败");
      }
      setPhase("idle");
      return;
    }

    try {
      const { articleId } = await res.json();
      articleIdRef.current = articleId;
    } catch {
      setError("响应无效");
      setPhase("idle");
      return;
    }

    // Phase 2: Swallowed — input shrinks away
    setPhase("swallowed");

    // Wait for the swallow animation, then navigate
    setTimeout(() => {
      if (articleIdRef.current) {
        router.push(`/digest/${articleIdRef.current}`);
      }
    }, 600);
  };

  const isActive = phase !== "idle";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-14 pb-20">
      <div className="flex flex-col items-center">
        {/* Hero */}
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-2 text-center">
          乔治恐龙
        </h1>
        <p className="text-gray-400 text-base mb-12 text-center tracking-wide">
          投喂任何内容，收获满满知识
        </p>

        {/* Dino + Input composition */}
        <div className="relative w-full max-w-xl">
          <div className="flex items-center gap-0">
            {/* Input — slides into dino's mouth when eating */}
            <div
              className={`flex-1 relative z-10 transition-all duration-700 ease-in-out ${
                phase === "swallowed"
                  ? "opacity-0 translate-x-8 scale-95"
                  : ""
              }`}
            >
              <div
                className={`bg-white border-2 rounded-2xl rounded-r-none p-1.5
                  transition-all duration-500
                  border-r-0 ${
                    phase === "eating"
                      ? "border-green-400 shadow-lg shadow-green-100/60 translate-x-2"
                      : "border-gray-200/80 shadow-md shadow-gray-100/50 hover:shadow-lg hover:border-gray-300 focus-within:border-green-400 focus-within:shadow-lg focus-within:shadow-green-100/40"
                  }`}
              >
                <div className="flex gap-1.5">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      setError("");
                    }}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !isActive && handleFeed()
                    }
                    placeholder="在这里粘贴博客链接..."
                    className="flex-1 px-4 py-3.5 text-[15px] bg-transparent
                               focus:outline-none placeholder:text-gray-300"
                    disabled={isActive}
                  />
                  <button
                    onClick={handleFeed}
                    disabled={isActive}
                    className="px-6 py-3.5 bg-green-600 text-white text-sm font-semibold rounded-xl
                               hover:bg-green-700 active:bg-green-800 transition-all
                               disabled:opacity-40 disabled:cursor-not-allowed
                               whitespace-nowrap shadow-sm"
                  >
                    {isActive ? "嚼嚼嚼..." : "投喂"}
                  </button>
                </div>
              </div>
            </div>

            {/* Dino — turns toward input when eating */}
            <div
              className={`relative z-20 -ml-3 transition-all ease-in-out ${
                phase === "eating"
                  ? "duration-1000 -translate-x-4 scale-110"
                  : phase === "swallowed"
                    ? "duration-500 scale-110"
                    : "duration-700 animate-float"
              }`}
              style={{ transform: `scaleX(-1) ${phase === "eating" ? "translateX(16px) scale(1.1)" : ""}` }}
            >
              <Dino
                state={
                  phase === "eating"
                    ? "chewing"
                    : phase === "swallowed"
                      ? "happy"
                      : "idle"
                }
                size={180}
              />
            </div>
          </div>

          {error && (
            <p className="mt-3 text-sm text-red-500 animate-fade-in text-center">
              {error}
            </p>
          )}

          {/* Eating status text */}
          {phase === "eating" && (
            <p className="mt-4 text-sm text-green-600 text-center animate-fade-in font-medium">
              正在大口咀嚼这篇文章...
            </p>
          )}
          {phase === "swallowed" && (
            <p className="mt-4 text-sm text-green-600 text-center animate-fade-in font-medium">
              咕咚！吞下去了，开始消化...
            </p>
          )}
        </div>
      </div>

      {/* How it works — hidden during animation */}
      <div
        className={`mt-20 transition-opacity duration-500 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <p className="text-xs text-gray-300 text-center mb-6 tracking-[0.2em] uppercase font-medium">
          使用方法
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {/* Step 1 */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold shadow-sm">
                1
              </span>
              <p className="text-[15px] text-gray-900 font-semibold">粘贴链接</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              任何博客或技术文章的 URL
            </p>
          </div>

          {/* Step 2 */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold shadow-sm">
                2
              </span>
              <p className="text-[15px] text-gray-900 font-semibold">恐龙咀嚼</p>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              AI 将内容拆解为易消化的知识块
            </p>
          </div>

          {/* Step 3 */}
          <div className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className="flex items-center gap-3 mb-3">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-xs font-bold shadow-sm">
                3
              </span>
              <p className="text-[15px] text-gray-900 font-semibold">你来吸收</p>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-1">
              <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-600">摘要</span>
              <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-600">闪卡</span>
              <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-600">知识点</span>
              <span className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-600">测验</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
