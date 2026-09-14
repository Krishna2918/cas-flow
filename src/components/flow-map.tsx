import { useEffect, useMemo, useRef, useState } from "react";
import { BY_ID, CAPABILITIES, EDGES, PAGE, type Capability } from "@/lib/cas-data";
import { journeySet } from "@/lib/cas-filter";
import { useCas } from "@/lib/cas-store";
import { CapabilityCard } from "./capability-card";
import { Minus, Plus, Maximize2 } from "lucide-react";

const SCALE = 110;
const PAD = 64;

function box(c: Capability) {
  const w = c.w * SCALE;
  const h = c.h * SCALE;
  const left = PAD + (c.x - c.w / 2) * SCALE;
  const top = PAD + (PAGE.height - c.y - c.h / 2) * SCALE;
  return { left, top, w, h, cx: left + w / 2, cy: top + h / 2, right: left + w, bottom: top + h };
}

const CANVAS_W = PAGE.width * SCALE + PAD * 2;
const CANVAS_H = PAGE.height * SCALE + PAD * 2;

function edgePath(from: Capability, to: Capability) {
  const a = box(from);
  const b = box(to);
  const dx = b.cx - a.cx;
  const dy = b.cy - a.cy;
  let x1: number, y1: number, x2: number, y2: number;
  if (Math.abs(dx) > Math.abs(dy) * 0.7) {
    if (dx >= 0) {
      x1 = a.right;
      y1 = a.cy;
      x2 = b.left;
      y2 = b.cy;
    } else {
      x1 = a.left;
      y1 = a.cy;
      x2 = b.right;
      y2 = b.cy;
    }
  } else if (dy >= 0) {
    x1 = a.cx;
    y1 = a.bottom;
    x2 = b.cx;
    y2 = b.top;
  } else {
    x1 = a.cx;
    y1 = a.top;
    x2 = b.cx;
    y2 = b.bottom;
  }
  const mx = (x1 + x2) / 2;
  return {
    d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`,
    lx: mx,
    ly: (y1 + y2) / 2,
  };
}

export function FlowMap({ visibleIds }: { visibleIds: Set<number> }) {
  const selected = useCas((s) => s.selected);
  const setSelected = useCas((s) => s.setSelected);
  const journey = useCas((s) => s.journey);
  const jset = journeySet(journey);
  const viewport = useRef<HTMLDivElement>(null);
  const [cam, setCam] = useState({ x: 40, y: 24, k: 0.88 });
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number } | null>(null);

  const centerOn = (id: number, k = 0.92) => {
    const el = viewport.current;
    const c = BY_ID[id];
    if (!el || !c) return;
    const b = box(c);
    setCam({
      k,
      x: el.clientWidth / 2 - b.cx * k,
      y: el.clientHeight * 0.42 - b.cy * k,
    });
  };

  const fit = () => {
    const el = viewport.current;
    if (!el) return;
    const vw = Math.max(el.clientWidth, 1);
    const vh = Math.max(el.clientHeight, 1);
    const k = Math.max(0.18, Math.min(1.2, Math.min(vw / CANVAS_W, vh / CANVAS_H) * 0.94));
    setCam({
      x: (vw - CANVAS_W * k) / 2,
      y: (vh - CANVAS_H * k) / 2,
      k,
    });
  };

  useEffect(() => {
    const id = window.setTimeout(() => centerOn(11, 0.92), 30);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected == null) return;
    centerOn(selected, Math.max(cam.k, 0.7));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const el = viewport.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const nk = Math.min(1.8, Math.max(0.18, cam.k * factor));
    const wx = (px - cam.x) / cam.k;
    const wy = (py - cam.y) / cam.k;
    setCam({ k: nk, x: px - wx * nk, y: py - wy * nk });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    drag.current = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setCam((c) => ({
      ...c,
      x: drag.current!.cx + (e.clientX - drag.current!.x),
      y: drag.current!.cy + (e.clientY - drag.current!.y),
    }));
  };
  const onPointerUp = () => {
    drag.current = null;
    setDragging(false);
  };

  const zoomBy = (f: number) => {
    const el = viewport.current;
    if (!el) return;
    const px = el.clientWidth / 2;
    const py = el.clientHeight / 2;
    const nk = Math.min(1.8, Math.max(0.18, cam.k * f));
    const wx = (px - cam.x) / cam.k;
    const wy = (py - cam.y) / cam.k;
    setCam({ k: nk, x: px - wx * nk, y: py - wy * nk });
  };

  const paths = useMemo(
    () =>
      EDGES.map((e) => {
        const from = BY_ID[e.from];
        const to = BY_ID[e.to];
        if (!from || !to) return null;
        const p = edgePath(from, to);
        const on =
          visibleIds.has(e.from) &&
          visibleIds.has(e.to) &&
          (!jset || (jset.has(e.from) && jset.has(e.to)));
        const hi = selected != null && (e.from === selected || e.to === selected);
        return { ...e, ...p, on, hi };
      }).filter(Boolean) as Array<{
        from: number;
        to: number;
        label: string | null;
        d: string;
        lx: number;
        ly: number;
        on: boolean;
        hi: boolean;
      }>,
    [visibleIds, jset, selected],
  );

  return (
    <div className="relative h-full min-h-0">
      <div
        ref={viewport}
        className="h-full w-full overflow-hidden touch-none bg-paper"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: dragging ? "grabbing" : "grab" }}
      >
        <div
          className="origin-top-left will-change-transform"
          style={{
            width: CANVAS_W,
            height: CANVAS_H,
            transform: `translate(${cam.x}px, ${cam.y}px) scale(${cam.k})`,
          }}
        >
          <div
            className="absolute font-display text-navy"
            style={{ left: PAD + 1.6 * SCALE, top: PAD + 0.2 * SCALE }}
          >
            <p className="text-[28px] font-semibold tracking-tight leading-none">
              CAS entire product flow
            </p>
            <p className="mt-2 max-w-xl font-sans text-sm font-medium text-muted">
              Drag the paper to pan. Scroll to zoom. Click a box for the row, blocker, and hand-offs.
            </p>
          </div>

          <svg width={CANVAS_W} height={CANVAS_H} className="absolute inset-0 pointer-events-none">
            {paths.map((p) => (
              <g key={`${p.from}-${p.to}`} opacity={p.on ? 1 : 0.08}>
                <path
                  d={p.d}
                  fill="none"
                  stroke={p.hi ? "var(--color-origin)" : "var(--color-navy)"}
                  strokeWidth={p.hi ? 3 : 2.4}
                  strokeOpacity={p.hi ? 1 : 0.55}
                />
                {p.label ? (
                  <text
                    x={p.lx}
                    y={p.ly - 7}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize={13}
                    fontWeight={600}
                    fill="var(--color-ink)"
                  >
                    {p.label}
                  </text>
                ) : null}
              </g>
            ))}
          </svg>

          {CAPABILITIES.map((c) => {
            const b = box(c);
            const vis = visibleIds.has(c.id);
            const dim = !vis || (jset ? !jset.has(c.id) : false);
            return (
              <div
                key={c.id}
                className="absolute"
                style={{ left: b.left, top: b.top, width: b.w, height: b.h }}
              >
                <CapabilityCard
                  cap={c}
                  size="map"
                  active={selected === c.id}
                  dimmed={dim}
                  onSelect={setSelected}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-surface/95 p-1 shadow-[var(--shadow-border)]">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-navy hover:bg-paper-2"
          onClick={() => zoomBy(0.9)}
          aria-label="Zoom out"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center font-mono text-[11px] tabular-nums text-muted">
          {Math.round(cam.k * 100)}%
        </span>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-navy hover:bg-paper-2"
          onClick={() => zoomBy(1.12)}
          aria-label="Zoom in"
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-lg text-navy hover:bg-paper-2"
          onClick={fit}
          aria-label="Fit diagram"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
    </div>
  );
}
