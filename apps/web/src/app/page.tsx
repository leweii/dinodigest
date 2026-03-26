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
    <div className="max-w-3xl mx-auto px-4 pt-10 pb-16">
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-1 text-center">
          乔治恐龙
        </h1>
        <p className="text-gray-400 text-sm mb-10 text-center">
          投喂任何内容，收获满满知识。
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
                  shadow-sm transition-all duration-500
                  border-r-0 ${
                    phase === "eating"
                      ? "border-green-400 shadow-md translate-x-2"
                      : "border-gray-200 hover:shadow-md hover:border-gray-300 focus-within:border-gray-400 focus-within:shadow-md"
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
                    className="flex-1 px-4 py-3 text-base bg-transparent
                               focus:outline-none placeholder:text-gray-400"
                    disabled={isActive}
                  />
                  <button
                    onClick={handleFeed}
                    disabled={isActive}
                    className="px-5 py-3 bg-gray-900 text-white text-sm font-semibold rounded-xl
                               hover:bg-gray-800 active:bg-black transition-colors
                               disabled:opacity-40 disabled:cursor-not-allowed
                               whitespace-nowrap"
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
                size={140}
              />
            </div>
          </div>

          {error && (
            <p className="mt-2 text-sm text-red-500 animate-fade-in text-center">
              {error}
            </p>
          )}

          {/* Eating status text */}
          {phase === "eating" && (
            <p className="mt-3 text-sm text-green-600 text-center animate-fade-in font-medium">
              正在大口咀嚼这篇文章...
            </p>
          )}
          {phase === "swallowed" && (
            <p className="mt-3 text-sm text-green-600 text-center animate-fade-in font-medium">
              咕咚！吞下去了，开始消化...
            </p>
          )}
        </div>
      </div>

      {/* How it works — hidden during animation */}
      <div
        className={`mt-16 grid grid-cols-3 gap-6 text-center transition-opacity duration-500 ${
          isActive ? "opacity-0" : "opacity-100"
        }`}
      >
        <div>
          <div className="text-2xl mb-2">1</div>
          <p className="text-sm text-gray-600 font-medium">粘贴链接</p>
          <p className="text-xs text-gray-400 mt-1">任何博客或技术文章</p>
        </div>
        <div>
          <div className="text-2xl mb-2">2</div>
          <p className="text-sm text-gray-600 font-medium">恐龙咀嚼</p>
          <p className="text-xs text-gray-400 mt-1">AI 把内容拆解成易消化的知识</p>
        </div>
        <div>
          <div className="text-2xl mb-2">3</div>
          <p className="text-sm text-gray-600 font-medium">你来吸收</p>
          <p className="text-xs text-gray-400 mt-1">摘要、闪卡、知识点、测验</p>
        </div>
      </div>
    </div>
  );
}
