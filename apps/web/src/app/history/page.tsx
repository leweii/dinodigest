"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Dino } from "@/components/dino/dino";

interface ArticleItem {
  id: string;
  sourceUrl: string;
  title: string | null;
  status: string;
  wordCount: number | null;
  createdAt: string;
  digestCounts: Record<string, number>;
}

export default function HistoryPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/history")
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex flex-col items-center">
        <Dino state="idle" size={120} />
        <h2 className="text-xl font-semibold mt-4 mb-2">知识胃是空的</h2>
        <p className="text-gray-500 mb-4">快投喂一些文章给恐龙吧！</p>
        <Link
          href="/"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          去投喂
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">知识胃</h1>

      <div className="space-y-3">
        {articles.map((article) => {
          const totalDigests = Object.values(article.digestCounts).reduce(
            (a, b) => a + b,
            0,
          );

          return (
            <Link
              key={article.id}
              href={`/digest/${article.id}`}
              className="block p-4 bg-white border border-gray-200 rounded-xl
                         hover:border-green-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {article.title || "无标题"}
                  </h3>
                  <p className="text-sm text-gray-400 truncate mt-0.5">
                    {article.sourceUrl}
                  </p>
                </div>

                <div className="flex items-center gap-3 ml-4">
                  {article.status === "done" ? (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {totalDigests} 条结果
                    </span>
                  ) : article.status === "processing" ? (
                    <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                      消化中...
                    </span>
                  ) : article.status === "failed" ? (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                      失败
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      等待中
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
