"use client";

import { useMemo, useState } from "react";

interface MindMapNode {
  name: string;
  children?: MindMapNode[];
}

// Color per depth level
const DEPTH_STYLES = [
  { bg: "#1e3a5f", text: "#ffffff", border: "#2d5a8e" }, // root
  { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" }, // L1
  { bg: "#dcfce7", text: "#166534", border: "#86efac" }, // L2
  { bg: "#fef9c3", text: "#713f12", border: "#fde047" }, // L3
  { bg: "#fae8ff", text: "#86198f", border: "#d946ef" }, // L4
  { bg: "#ffe4e6", text: "#9f1239", border: "#fda4af" }, // L5+
];

const CONNECTOR_COLORS = ["#93c5fd", "#86efac", "#fde047", "#d946ef", "#fda4af"];

const NODE_H = 32;
const LEVEL_GAP = 52;   // vertical gap between bottom of parent and top of child
const SIBLING_GAP = 14; // horizontal gap between sibling subtrees
const PAD_X_ROOT = 20;
const PAD_X_NODE = 14;

// Canvas text measurement (client-only, falls back to estimate on SSR)
let _canvas: HTMLCanvasElement | null = null;
function measureText(text: string, size: number, weight: number): number {
  if (typeof document === "undefined") return text.length * size * 0.62;
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return text.length * size * 0.62;
  ctx.font = `${weight} ${size}px -apple-system,"Noto Sans SC",sans-serif`;
  return ctx.measureText(text).width;
}

// Internal layout node
type LNode = {
  data: MindMapNode;
  depth: number;
  children: LNode[];
  w: number;          // node box width
  subtreeW: number;   // total horizontal span of this subtree
  x: number;          // left edge of node box
  y: number;          // top edge of node box
};

function buildTree(node: MindMapNode, depth: number): LNode {
  const fontSize = depth === 0 ? 15 : depth === 1 ? 13 : 12;
  const fontWeight = depth === 0 ? 700 : depth === 1 ? 600 : 400;
  const padX = depth === 0 ? PAD_X_ROOT : PAD_X_NODE;
  const w = Math.max(measureText(node.name, fontSize, fontWeight) + padX * 2, 56);

  const children = (node.children ?? []).map(c => buildTree(c, depth + 1));

  const subtreeW =
    children.length === 0
      ? w
      : Math.max(
          w,
          children.reduce((sum, c) => sum + c.subtreeW, 0) +
            SIBLING_GAP * (children.length - 1),
        );

  return { data: node, depth, children, w, subtreeW, x: 0, y: depth * (NODE_H + LEVEL_GAP) };
}

function placeX(node: LNode, startX: number): void {
  // Center this node over its allocated horizontal span
  node.x = startX + (node.subtreeW - node.w) / 2;

  if (node.children.length > 0) {
    const childrenTotalW =
      node.children.reduce((s, c) => s + c.subtreeW, 0) +
      SIBLING_GAP * (node.children.length - 1);
    let cx = startX + (node.subtreeW - childrenTotalW) / 2;
    for (const child of node.children) {
      placeX(child, cx);
      cx += child.subtreeW + SIBLING_GAP;
    }
  }
}

function flatten(node: LNode): LNode[] {
  return [node, ...node.children.flatMap(flatten)];
}

function links(node: LNode): Array<{ src: LNode; tgt: LNode }> {
  return node.children.flatMap(c => [{ src: node, tgt: c }, ...links(c)]);
}

export function MindMapRenderer({ data }: { data: Record<string, unknown> }) {
  const mapData = data as unknown as MindMapNode;
  const [hovered, setHovered] = useState<string | null>(null);

  const layout = useMemo(() => {
    const root = buildTree(mapData, 0);
    placeX(root, 0);
    const nodes = flatten(root);
    const edges = links(root);
    const totalW = root.subtreeW;
    const totalH = Math.max(...nodes.map(n => n.y)) + NODE_H;
    return { nodes, edges, totalW, totalH };
  }, [mapData]);

  const nodeKey = (n: LNode) => `${n.depth}:${n.x.toFixed(1)}:${n.data.name}`;

  const M = 24; // margin
  const svgW = layout.totalW + M * 2;
  const svgH = layout.totalH + M * 2;

  return (
    <div className="overflow-x-auto w-full">
      <svg
        width={svgW}
        height={svgH}
        className="select-none"
        style={{ minWidth: Math.min(svgW, 320) }}
      >
        <defs>
          <filter id="mm-shadow" x="-10%" y="-20%" width="120%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.07" />
          </filter>
        </defs>

        <g transform={`translate(${M},${M})`}>
          {/* Connectors — vertical S-curves from parent bottom-center to child top-center */}
          {layout.edges.map(({ src, tgt }, i) => {
            const sx = src.x + src.w / 2;
            const sy = src.y + NODE_H;
            const tx = tgt.x + tgt.w / 2;
            const ty = tgt.y;
            const midY = sy + (ty - sy) * 0.5;
            const color =
              CONNECTOR_COLORS[Math.min(tgt.depth - 1, CONNECTOR_COLORS.length - 1)];
            const srcKey = nodeKey(src);
            const tgtKey = nodeKey(tgt);
            const lit = hovered === srcKey || hovered === tgtKey;

            return (
              <path
                key={i}
                d={`M${sx},${sy} C${sx},${midY} ${tx},${midY} ${tx},${ty}`}
                fill="none"
                stroke={color}
                strokeWidth={1.5}
                opacity={hovered ? (lit ? 1 : 0.12) : 0.5}
              />
            );
          })}

          {/* Nodes */}
          {layout.nodes.map((n, i) => {
            const style = DEPTH_STYLES[Math.min(n.depth, DEPTH_STYLES.length - 1)];
            const key = nodeKey(n);
            const faded = hovered !== null && hovered !== key;
            const fontSize = n.depth === 0 ? 15 : n.depth === 1 ? 13 : 12;
            const fontWeight = n.depth === 0 ? 700 : n.depth === 1 ? 600 : 400;

            return (
              <g
                key={i}
                transform={`translate(${n.x},${n.y})`}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
                style={{ opacity: faded ? 0.25 : 1, cursor: "default" }}
              >
                <rect
                  width={n.w}
                  height={NODE_H}
                  rx={n.depth === 0 ? 10 : 7}
                  fill={style.bg}
                  stroke={style.border}
                  strokeWidth={n.depth === 0 ? 2 : 1}
                  filter="url(#mm-shadow)"
                />
                <text
                  x={n.w / 2}
                  y={NODE_H / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontWeight={fontWeight}
                  fill={style.text}
                  style={{
                    fontFamily:
                      '-apple-system,"Noto Sans SC","PingFang SC",sans-serif',
                  }}
                >
                  {n.data.name}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
