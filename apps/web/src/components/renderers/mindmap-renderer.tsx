"use client";

import { useMemo, useRef, useEffect, useState, useCallback } from "react";
import { hierarchy, tree, type HierarchyPointNode } from "d3-hierarchy";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

// Color palette — each depth level gets a hue
const DEPTH_STYLES = [
  { bg: "#1e3a5f", text: "#ffffff", border: "#2d5a8e", connector: "#2d5a8e" }, // root — deep blue
  { bg: "#eef4ff", text: "#1e40af", border: "#bfdbfe", connector: "#93bbfd" }, // L1 — blue
  { bg: "#f0fdf4", text: "#166534", border: "#bbf7d0", connector: "#86efac" }, // L2 — green
  { bg: "#fefce8", text: "#854d0e", border: "#fef08a", connector: "#fde047" }, // L3 — amber
  { bg: "#fdf4ff", text: "#86198f", border: "#f5d0fe", connector: "#e879f9" }, // L4 — fuchsia
  { bg: "#fff1f2", text: "#9f1239", border: "#fecdd3", connector: "#fda4af" }, // L5+ — rose
];

function getStyle(depth: number) {
  return DEPTH_STYLES[Math.min(depth, DEPTH_STYLES.length - 1)];
}

// Measure text width using canvas (cached)
let measureCanvas: HTMLCanvasElement | null = null;
function measureText(text: string, fontSize: number, fontWeight: number): number {
  if (typeof document === "undefined") return text.length * fontSize * 0.6;
  if (!measureCanvas) measureCanvas = document.createElement("canvas");
  const ctx = measureCanvas.getContext("2d");
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${fontWeight} ${fontSize}px -apple-system, "Noto Sans SC", sans-serif`;
  return ctx.measureText(text).width;
}

// Node dimensions
const NODE_PADDING_X = 14;
const NODE_PADDING_Y = 6;
const ROOT_PADDING_X = 20;
const ROOT_PADDING_Y = 10;
const NODE_GAP_Y = 8;     // vertical gap between sibling nodes
const LEVEL_GAP_X = 60;   // horizontal gap between depth levels

export function MindMapRenderer({ data }: { data: Record<string, unknown> }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const mapData = data as unknown as MindMapNode;

  // Compute layout
  const layout = useMemo(() => {
    const root = hierarchy(mapData);
    const nodes = root.descendants();
    const nodeCount = nodes.length;

    // Compute each node's width based on text
    const nodeWidths = new Map<HierarchyPointNode<MindMapNode>, number>();
    const nodeHeights = new Map<HierarchyPointNode<MindMapNode>, number>();

    // First pass: calculate sizes
    for (const node of nodes as HierarchyPointNode<MindMapNode>[]) {
      const isRoot = node.depth === 0;
      const fontSize = isRoot ? 15 : node.depth === 1 ? 13 : 12;
      const fontWeight = isRoot ? 700 : node.depth === 1 ? 600 : 400;
      const px = isRoot ? ROOT_PADDING_X : NODE_PADDING_X;
      const py = isRoot ? ROOT_PADDING_Y : NODE_PADDING_Y;
      const textW = measureText(node.data.name, fontSize, fontWeight);
      nodeWidths.set(node, textW + px * 2);
      nodeHeights.set(node, fontSize + py * 2);
    }

    // Calculate max width per depth level for alignment
    const maxWidthPerDepth = new Map<number, number>();
    for (const node of nodes as HierarchyPointNode<MindMapNode>[]) {
      const w = nodeWidths.get(node as HierarchyPointNode<MindMapNode>) || 100;
      const cur = maxWidthPerDepth.get(node.depth) || 0;
      if (w > cur) maxWidthPerDepth.set(node.depth, w);
    }

    // Use d3 tree for vertical positioning, then override horizontal
    const svgHeight = Math.max(nodeCount * (28 + NODE_GAP_Y), 300);
    const treeLayout = tree<MindMapNode>()
      .size([svgHeight, 800])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.3));
    treeLayout(root);

    // Override x positions based on cumulative depth widths
    const depthX = new Map<number, number>();
    let cumX = 0;
    const maxDepth = Math.max(...nodes.map((n) => n.depth));
    for (let d = 0; d <= maxDepth; d++) {
      depthX.set(d, cumX);
      cumX += (maxWidthPerDepth.get(d) || 100) + LEVEL_GAP_X;
    }

    for (const node of nodes as HierarchyPointNode<MindMapNode>[]) {
      node.y = depthX.get(node.depth) || 0;
    }

    const totalWidth = cumX + 40;

    return { root: root as HierarchyPointNode<MindMapNode>, totalWidth, svgHeight, nodeWidths, nodeHeights };
  }, [mapData]);

  const { root, totalWidth, svgHeight, nodeWidths, nodeHeights } = layout;

  const getNodeId = useCallback(
    (node: HierarchyPointNode<MindMapNode>) => `${node.depth}-${node.data.name}`,
    [],
  );

  const marginLeft = 20;
  const marginTop = 20;
  const svgW = totalWidth + marginLeft + 40;
  const svgH = svgHeight + marginTop * 2;

  return (
    <div ref={containerRef} className="mindmap-container">
      <svg width={svgW} height={svgH} className="select-none" style={{ minWidth: svgW }}>
        <defs>
          {/* Glow filter for root */}
          <filter id="root-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1e3a5f" floodOpacity="0.25" />
          </filter>
          {/* Subtle shadow for nodes */}
          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.08" />
          </filter>
        </defs>

        <g transform={`translate(${marginLeft}, ${marginTop})`}>
          {/* Connectors */}
          {root.links().map((link, i) => {
            const sourceNode = link.source as HierarchyPointNode<MindMapNode>;
            const targetNode = link.target as HierarchyPointNode<MindMapNode>;
            const sourceW = nodeWidths.get(sourceNode) || 100;
            const style = getStyle(targetNode.depth);

            // Start from right edge of source node, end at left edge of target node
            const sx = sourceNode.y + sourceW;
            const sy = sourceNode.x;
            const tx = targetNode.y;
            const ty = targetNode.x;

            // Bezier control points for smooth S-curve
            const midX = sx + (tx - sx) * 0.5;

            return (
              <path
                key={`link-${i}`}
                d={`M${sx},${sy} C${midX},${sy} ${midX},${ty} ${tx},${ty}`}
                fill="none"
                stroke={style.connector}
                strokeWidth={2}
                opacity={
                  hoveredId
                    ? hoveredId === getNodeId(sourceNode) || hoveredId === getNodeId(targetNode)
                      ? 0.9
                      : 0.15
                    : 0.5
                }
                className="mindmap-link"
              />
            );
          })}

          {/* Nodes */}
          {root.descendants().map((node, i) => {
            const d = node as HierarchyPointNode<MindMapNode>;
            const style = getStyle(d.depth);
            const isRoot = d.depth === 0;
            const w = nodeWidths.get(d) || 100;
            const h = nodeHeights.get(d) || 28;
            const nodeId = getNodeId(d);
            const isHovered = hoveredId === nodeId;
            const isFaded = hoveredId !== null && !isHovered;

            const fontSize = isRoot ? 15 : d.depth === 1 ? 13 : 12;
            const fontWeight = isRoot ? 700 : d.depth === 1 ? 600 : 400;
            const radius = isRoot ? 10 : 8;

            return (
              <g
                key={`node-${i}`}
                transform={`translate(${d.y},${d.x - h / 2})`}
                onMouseEnter={() => setHoveredId(nodeId)}
                onMouseLeave={() => setHoveredId(null)}
                className="mindmap-node"
                style={{ opacity: isFaded ? 0.3 : 1 }}
              >
                {/* Node background pill */}
                <rect
                  x={0}
                  y={0}
                  width={w}
                  height={h}
                  rx={radius}
                  ry={radius}
                  fill={style.bg}
                  stroke={style.border}
                  strokeWidth={isRoot ? 2 : 1}
                  filter={isRoot ? "url(#root-glow)" : "url(#node-shadow)"}
                />

                {/* Flow indicator dot for L1 nodes */}
                {d.depth === 1 && i > 0 && (
                  <circle
                    cx={-4}
                    cy={h / 2}
                    r={3}
                    fill={style.connector}
                  />
                )}

                {/* Node text */}
                <text
                  x={w / 2}
                  y={h / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fill={style.text}
                  style={{ fontFamily: '-apple-system, "Noto Sans SC", "PingFang SC", sans-serif' }}
                >
                  {d.data.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
