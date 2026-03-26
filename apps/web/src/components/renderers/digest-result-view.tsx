"use client";

import { useState } from "react";
import { SummaryRenderer } from "./summary-renderer";
import { KeyPointRenderer } from "./key-point-renderer";
import { MindMapRenderer } from "./mindmap-renderer";

interface DigestData {
  id: string;
  moduleId: string;
  kind: string;
  data: Record<string, unknown>;
}

const TABS = [
  { kind: "summary", label: "摘要" },
  { kind: "key_point", label: "知识点" },
  { kind: "mind_map", label: "思维导图" },
  { kind: "flashcard", label: "闪卡" },
  { kind: "quiz", label: "测验" },
] as const;

export function DigestResultView({ digests }: { digests: DigestData[] }) {
  // Find which tabs have content
  const availableTabs = TABS.filter((tab) =>
    digests.some((d) => d.kind === tab.kind),
  );

  const [activeTab, setActiveTab] = useState(availableTabs[0]?.kind ?? "summary");

  const activeDigests = digests.filter((d) => d.kind === activeTab);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.kind}
            onClick={() => setActiveTab(tab.kind)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.kind
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-gray-400">
              {digests.filter((d) => d.kind === tab.kind).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {activeDigests.map((digest) => (
          <div key={digest.id} className="animate-fade-in">
            <DigestOutputRenderer kind={digest.kind} data={digest.data} />
          </div>
        ))}

        {activeDigests.length === 0 && (
          <p className="text-gray-400 text-center py-8">暂无内容</p>
        )}
      </div>
    </div>
  );
}

function DigestOutputRenderer({
  kind,
  data,
}: {
  kind: string;
  data: Record<string, unknown>;
}) {
  switch (kind) {
    case "summary":
      return <SummaryRenderer data={data} />;
    case "key_point":
      return <KeyPointRenderer data={data} />;
    case "mind_map":
      return <MindMapRenderer data={data} />;
    case "flashcard":
      return <FlashcardPreview data={data} />;
    case "quiz":
      return <QuizPreview data={data} />;
    default:
      return (
        <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      );
  }
}

function FlashcardPreview({ data }: { data: Record<string, unknown> }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div
      onClick={() => setFlipped(!flipped)}
      className="p-5 bg-white border-2 border-gray-200 rounded-xl cursor-pointer
                 hover:border-green-300 transition-all min-h-[100px] flex items-center justify-center"
    >
      <div className="text-center">
        {!flipped ? (
          <div>
            <p className="text-lg font-semibold text-gray-900">{String(data.front ?? "")}</p>
            <p className="text-xs text-gray-400 mt-2">点击翻转</p>
          </div>
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-line">
            {String(data.back ?? "")}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizPreview({ data }: { data: Record<string, unknown> }) {
  const [selected, setSelected] = useState<number | null>(null);
  const options = (data.options ?? []) as string[];
  const correctIndex = data.correctIndex as number;

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-xl">
      <p className="font-medium text-gray-900 mb-3">{String(data.question ?? "")}</p>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors ${
              selected === null
                ? "border-gray-200 hover:border-green-300 hover:bg-green-50"
                : i === correctIndex
                  ? "border-green-500 bg-green-50 text-green-700"
                  : selected === i
                    ? "border-red-300 bg-red-50 text-red-600"
                    : "border-gray-200 text-gray-400"
            }`}
            disabled={selected !== null}
          >
            {opt}
          </button>
        ))}
      </div>
      {selected !== null && data.explanation ? (
        <p className="mt-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          {String(data.explanation)}
        </p>
      ) : null}
    </div>
  );
}
