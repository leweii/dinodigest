"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { Transformer } from "markmap-lib";
import { Markmap } from "markmap-view";
import { zoomIdentity } from "d3";

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
  const [hint, setHint] = useState<string | null>(null);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      // Override d3-zoom's wheel filter: only zoom when Ctrl/Meta is held
      const mm = mmRef.current;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zoomBehavior = (mm as any).zoom;
      if (zoomBehavior) {
        const originalFilter = zoomBehavior.filter();
        zoomBehavior.filter((event: Event) => {
          if (event.type === "wheel") {
            return (event as WheelEvent).ctrlKey || (event as WheelEvent).metaKey;
          }
          // Allow all other interactions (drag, double-click, etc.)
          return originalFilter(event);
        });
        // Re-apply the zoom behavior to the SVG
        mm.svg.call(zoomBehavior);
      }
    }

    mmRef.current.setData(root);
    mmRef.current.fit();
  }, [root]);

  // Show hint when user scrolls without Ctrl, let the page scroll normally
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        // Ctrl/Cmd held — prevent page zoom, let markmap handle it
        e.preventDefault();
      } else {
        // No modifier — show hint, let page scroll through
        setHint(
          navigator.platform.includes("Mac")
            ? "按住 ⌘ 滚轮缩放"
            : "按住 Ctrl 滚轮缩放",
        );
        if (hintTimer.current) clearTimeout(hintTimer.current);
        hintTimer.current = setTimeout(() => setHint(null), 1500);
      }
    };

    svg.addEventListener("wheel", handleWheel, { passive: false });
    return () => svg.removeEventListener("wheel", handleWheel);
  }, []);

  const handleFit = useCallback(() => {
    mmRef.current?.fit();
  }, []);

  const handleZoom = useCallback((factor: number) => {
    const mm = mmRef.current;
    if (!mm || !svgRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const zoomBehavior = (mm as any).zoom;
    if (!zoomBehavior) return;

    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;

    // Get current transform and apply scale
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svgNode = mm.svg.node() as any;
    const currentTransform = svgNode?.["__zoom"] ?? zoomIdentity;
    const newScale = currentTransform.k * factor;
    const newTransform = zoomIdentity
      .translate(cx, cy)
      .scale(newScale)
      .translate(
        -(cx - currentTransform.x) / currentTransform.k,
        -(cy - currentTransform.y) / currentTransform.k,
      );

    mm.svg.transition().duration(300).call(zoomBehavior.transform, newTransform);
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

      {/* Hint overlay */}
      {hint && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div className="bg-black/70 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            {hint}
          </div>
        </div>
      )}

      {/* Controls — bottom-right */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm px-1 py-0.5 z-10">
        <button
          onClick={() => handleZoom(1 / 1.3)}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded text-base font-medium transition-colors"
          title="缩小"
        >
          −
        </button>
        <button
          onClick={handleFit}
          className="px-2 h-7 flex items-center justify-center text-[11px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded font-medium transition-colors"
          title="适应视图"
        >
          适应
        </button>
        <button
          onClick={() => handleZoom(1.3)}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded text-base font-medium transition-colors"
          title="放大"
        >
          +
        </button>
      </div>
    </div>
  );
}
