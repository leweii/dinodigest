"use client";

import { useMemo, useState, useRef, useCallback, useEffect } from "react";

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
const LEVEL_GAP = 52;
const SIBLING_GAP = 14;
const PAD_X_ROOT = 20;
const PAD_X_NODE = 14;

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.5;

// Canvas text measurement
let _canvas: HTMLCanvasElement | null = null;
function measureText(text: string, size: number, weight: number): number {
  if (typeof document === "undefined") return text.length * size * 0.62;
  if (!_canvas) _canvas = document.createElement("canvas");
  const ctx = _canvas.getContext("2d");
  if (!ctx) return text.length * size * 0.62;
  ctx.font = `${weight} ${size}px -apple-system,"Noto Sans SC",sans-serif`;
  return ctx.measureText(text).width;
}

// Layout types & helpers
type LNode = {
  data: MindMapNode;
  depth: number;
  children: LNode[];
  w: number;
  subtreeW: number;
  x: number;
  y: number;
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

function getLinks(node: LNode): Array<{ src: LNode; tgt: LNode }> {
  return node.children.flatMap(c => [{ src: node, tgt: c }, ...getLinks(c)]);
}

export function MindMapRenderer({ data }: { data: Record<string, unknown> }) {
  const mapData = data as unknown as MindMapNode;
  const [hovered, setHovered] = useState<string | null>(null);

  // Pan & zoom state
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const layout = useMemo(() => {
    const root = buildTree(mapData, 0);
    placeX(root, 0);
    const nodes = flatten(root);
    const edges = getLinks(root);
    const totalW = root.subtreeW;
    const totalH = Math.max(...nodes.map(n => n.y)) + NODE_H;
    return { nodes, edges, totalW, totalH };
  }, [mapData]);

  // Center the tree in the viewport on first render
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || !containerRef.current) return;
    initialized.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const contentW = layout.totalW + 48;
    const contentH = layout.totalH + 48;
    // Fit into view
    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const fitZoom = Math.min(scaleX, scaleY, 1); // don't zoom in past 1x
    const scaledW = contentW * fitZoom;
    const scaledH = contentH * fitZoom;
    setZoom(fitZoom);
    setPan({
      x: (rect.width - scaledW) / 2,
      y: (rect.height - scaledH) / 2,
    });
  }, [layout]);

  // Mouse drag handlers
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only left button or touch
      if (e.button !== 0) return;
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    },
    [pan],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPan({ x: dragStart.current.panX + dx, y: dragStart.current.panY + dy });
    },
    [dragging],
  );

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  // Wheel zoom (pinch on trackpad)
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      // Cursor position relative to container
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      // Zoom factor
      const delta = -e.deltaY * 0.001;
      const nextZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom * (1 + delta)));
      const ratio = nextZoom / zoom;

      // Adjust pan so the point under cursor stays in place
      setPan({
        x: cx - (cx - pan.x) * ratio,
        y: cy - (cy - pan.y) * ratio,
      });
      setZoom(nextZoom);
    },
    [zoom, pan],
  );

  // Zoom buttons
  const zoomIn = () => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const nextZoom = Math.min(MAX_ZOOM, zoom * 1.3);
    const ratio = nextZoom / zoom;
    setPan({ x: cx - (cx - pan.x) * ratio, y: cy - (cy - pan.y) * ratio });
    setZoom(nextZoom);
  };

  const zoomOut = () => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const nextZoom = Math.max(MIN_ZOOM, zoom / 1.3);
    const ratio = nextZoom / zoom;
    setPan({ x: cx - (cx - pan.x) * ratio, y: cy - (cy - pan.y) * ratio });
    setZoom(nextZoom);
  };

  const resetView = () => {
    if (!containerRef.current) return;
    initialized.current = false;
    const rect = containerRef.current.getBoundingClientRect();
    const contentW = layout.totalW + 48;
    const contentH = layout.totalH + 48;
    const scaleX = rect.width / contentW;
    const scaleY = rect.height / contentH;
    const fitZoom = Math.min(scaleX, scaleY, 1);
    const scaledW = contentW * fitZoom;
    const scaledH = contentH * fitZoom;
    setZoom(fitZoom);
    setPan({ x: (rect.width - scaledW) / 2, y: (rect.height - scaledH) / 2 });
  };

  const nodeKey = (n: LNode) => `${n.depth}:${n.x.toFixed(1)}:${n.data.name}`;

  const M = 24;
  const svgW = layout.totalW + M * 2;
  const svgH = layout.totalH + M * 2;

  return (
    <div className="relative w-full" style={{ height: Math.min(svgH * zoom + 80, 600) }}>
      {/* Canvas — drag & zoom area */}
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-hidden rounded-xl border border-gray-200 bg-white"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        <svg
          width={svgW}
          height={svgH}
          className="select-none"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <defs>
            <filter id="mm-shadow" x="-10%" y="-20%" width="120%" height="140%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.07" />
            </filter>
          </defs>

          <g transform={`translate(${M},${M})`}>
            {/* Connectors */}
            {layout.edges.map(({ src, tgt }, i) => {
              const sx = src.x + src.w / 2;
              const sy = src.y + NODE_H;
              const tx = tgt.x + tgt.w / 2;
              const ty = tgt.y;
              const midY = sy + (ty - sy) * 0.5;
              const color = CONNECTOR_COLORS[Math.min(tgt.depth - 1, CONNECTOR_COLORS.length - 1)];
              const srcK = nodeKey(src);
              const tgtK = nodeKey(tgt);
              const lit = hovered === srcK || hovered === tgtK;

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
                      fontFamily: '-apple-system,"Noto Sans SC","PingFang SC",sans-serif',
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

      {/* Zoom controls — bottom-right corner */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 shadow-sm px-1 py-0.5 z-10">
        <button
          onClick={zoomOut}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded text-base font-medium transition-colors"
          title="缩小"
        >
          −
        </button>
        <button
          onClick={resetView}
          className="px-1.5 h-7 flex items-center justify-center text-[11px] text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded font-medium tabular-nums transition-colors"
          title="重置视图"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button
          onClick={zoomIn}
          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded text-base font-medium transition-colors"
          title="放大"
        >
          +
        </button>
      </div>
    </div>
  );
}
