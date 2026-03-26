"use client";

import { useRef, useEffect, useCallback } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

// Convert our tree data to markdown (indented list)
function treeToMarkdown(node: MindMapNode, depth: number = 0): string {
  const indent = "  ".repeat(depth);
  const prefix = depth === 0 ? "# " : "- ";
  let md = `${indent}${prefix}${node.name}\n`;
  if (node.children) {
    for (const child of node.children) {
      md += treeToMarkdown(child, depth + 1);
    }
  }
  return md;
}

const transformer = new Transformer();

export function MindMapRenderer({ data }: { data: Record<string, unknown> }) {
  const mapData = data as unknown as MindMapNode;
  const svgRef = useRef<SVGSVGElement>(null);
  const mmRef = useRef<Markmap | null>(null);

  // Build markmap data from our tree
  const md = treeToMarkdown(mapData);
  const { root } = transformer.transform(md);

  useEffect(() => {
    if (!svgRef.current) return;

    if (!mmRef.current) {
      mmRef.current = Markmap.create(svgRef.current, {
        autoFit: true,
        duration: 300,
        maxWidth: 240,
        paddingX: 16,
        spacingVertical: 8,
        spacingHorizontal: 80,
      });
    }

    mmRef.current.setData(root);
    mmRef.current.fit();
  }, [root]);

  // Prevent page scroll when wheeling inside the mindmap
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const prevent = (e: WheelEvent) => e.preventDefault();
    svg.addEventListener("wheel", prevent, { passive: false });
    return () => svg.removeEventListener("wheel", prevent);
  }, []);

  const handleFit = useCallback(() => {
    mmRef.current?.fit();
  }, []);

  return (
    <div
      className="relative w-[calc(100vw-2rem)] max-w-[1400px] -translate-x-[calc((100vw-2rem-100%)/2)]"
      style={{ height: "min(85vh, 900px)" }}
    >
      <svg
        ref={svgRef}
        className="w-full h-full rounded-xl border border-gray-200 bg-white"
      />

      {/* Fit button */}
      <div className="absolute bottom-3 right-3 z-10">
        <button
          onClick={handleFit}
          className="px-3 h-8 flex items-center justify-center text-xs text-gray-500 hover:text-gray-800
                     bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm
                     hover:bg-gray-50 font-medium transition-colors"
          title="重置视图"
        >
          适应视图
        </button>
      </div>
    </div>
  );
}
