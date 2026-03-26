"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import { hierarchy, tree } from "d3-hierarchy";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

// Colors for different depth levels
const DEPTH_COLORS = [
  "#2563eb", // blue-600 — root
  "#16a34a", // green-600 — level 1
  "#d97706", // amber-600 — level 2
  "#9333ea", // purple-600 — level 3
  "#e11d48", // rose-600 — level 4+
];

function getColor(depth: number): string {
  return DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
}

export function MindMapRenderer({ data }: { data: Record<string, unknown> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(700);

  // Observe container width for responsiveness
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const mapData = data as unknown as MindMapNode;

  const layout = useMemo(() => {
    const root = hierarchy(mapData);
    const nodeCount = root.descendants().length;
    const height = Math.max(nodeCount * 28, 300);
    const width = containerWidth - 20;

    const treeLayout = tree<MindMapNode>().size([height, width - 200]);
    treeLayout(root);

    return { root, width, height };
  }, [mapData, containerWidth]);

  const { root, width, height } = layout;
  const svgHeight = height + 40;

  return (
    <div ref={containerRef} className="bg-white border border-gray-200 rounded-xl p-4 overflow-x-auto">
      <svg width={width} height={svgHeight} className="select-none">
        <g transform="translate(100, 20)">
          {/* Edges — curved bezier connectors */}
          {root.links().map((link, i) => {
            const sx = link.source.y ?? 0;
            const sy = link.source.x ?? 0;
            const tx = link.target.y ?? 0;
            const ty = link.target.x ?? 0;
            const mx = (sx + tx) / 2;

            return (
              <path
                key={`link-${i}`}
                d={`M${sx},${sy} C${mx},${sy} ${mx},${ty} ${tx},${ty}`}
                fill="none"
                stroke={getColor(link.target.depth)}
                strokeWidth={1.5}
                opacity={0.4}
              />
            );
          })}

          {/* Nodes */}
          {root.descendants().map((node, i) => {
            const color = getColor(node.depth);
            const isRoot = node.depth === 0;
            const isLeaf = !node.children;

            return (
              <g key={`node-${i}`} transform={`translate(${node.y},${node.x})`}>
                {/* Node dot */}
                <circle
                  r={isRoot ? 6 : isLeaf ? 3 : 4}
                  fill={color}
                />

                {/* Node label */}
                <text
                  dx={isLeaf ? 8 : -8}
                  dy={4}
                  textAnchor={isLeaf ? "start" : "end"}
                  fontSize={isRoot ? 13 : 11}
                  fontWeight={isRoot ? 700 : node.depth === 1 ? 600 : 400}
                  fill="#374151"
                >
                  {node.data.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
