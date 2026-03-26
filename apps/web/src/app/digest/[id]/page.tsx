"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Dino } from "@/components/dino/dino";
import { useDigestEvents } from "@/lib/use-digest-events";
import { DigestResultView } from "@/components/renderers/digest-result-view";

interface ArticleData {
  id: string;
  sourceUrl: string;
  title: string | null;
  language: string | null;
  wordCount: number | null;
  status: string;
  createdAt: string;
}

interface DigestData {
  id: string;
  moduleId: string;
  kind: string;
  data: Record<string, unknown>;
}

interface DigestResponse {
  article: ArticleData;
  digests: DigestData[];
}

export default function DigestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { status: sseStatus, progress, latestStatus } = useDigestEvents(id);
  const [data, setData] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch digest data
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/digest/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // retry on next poll
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // Re-fetch when digestion completes
  useEffect(() => {
    if (sseStatus === "done") {
      fetchData();
    }
  }, [sseStatus]);

  const articleStatus = data?.article?.status;
  const isProcessing = articleStatus === "pending" || articleStatus === "processing";
  const isDone = articleStatus === "done" || sseStatus === "done";
  const isFailed = articleStatus === "failed";

  // While processing, show chewing dino
  if (isProcessing && !isDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
        <div className="mb-6">
          <Dino state="chewing" size={160} />
        </div>

        <h2 className="text-xl font-semibold mb-2">Chewing...</h2>
        <p className="text-gray-500 mb-6 text-center">
          {data?.article?.title || latestStatus || "Extracting content..."}
        </p>

        {/* Progress bar */}
        <div className="w-full max-w-md bg-gray-200 rounded-full h-3 mb-4">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-gray-400">{latestStatus}</p>
      </div>
    );
  }

  // Error state
  if (isFailed) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
        <Dino state="idle" size={120} />
        <h2 className="text-xl font-semibold mt-4 mb-2 text-red-600">Digestion failed</h2>
        <p className="text-gray-500 mb-4">Could not extract or process this content.</p>
        <a href="/" className="text-green-600 hover:text-green-700 font-medium">
          Try another URL
        </a>
      </div>
    );
  }

  // Done — show results
  if (isDone && data) {
    if (data.digests.length === 0) {
      // Done but no digests — modules likely failed
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
          <Dino state="idle" size={120} />
          <h2 className="text-xl font-semibold mt-4 mb-2 text-amber-600">
            No results generated
          </h2>
          <p className="text-gray-500 mb-2 text-center">
            The article was extracted ({data.article.wordCount} words) but all digest modules failed.
          </p>
          <p className="text-gray-400 text-sm mb-4 text-center">
            Check the worker terminal for error details.
          </p>
          <a href="/" className="text-green-600 hover:text-green-700 font-medium">
            Try another URL
          </a>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start gap-3 mb-6">
          <Dino state="happy" size={60} />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              {data.article.title || "Untitled"}
            </h1>
            <p className="text-sm text-gray-400 mt-1 truncate">
              {data.article.sourceUrl}
              {data.article.wordCount && ` · ${data.article.wordCount} words`}
            </p>
          </div>
        </div>

        {/* Digest results */}
        <DigestResultView digests={data.digests} />
      </div>
    );
  }

  // Loading
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
      <Dino state="idle" size={120} />
      <p className="mt-4 text-gray-400">Loading...</p>
    </div>
  );
}
