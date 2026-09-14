import { NoTakeMark } from "./status-mark";

export function LegendCard() {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Legend</p>
      <p className="mt-1 font-display text-base font-semibold text-navy">Three independent channels</p>
      <ol className="mt-3 space-y-3 text-[13px] leading-snug text-ink">
        <li className="flex gap-3">
          <span className="font-mono text-[11px] text-muted">1</span>
          <div>
            <p className="font-medium">Build</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5">
                <i className="legend-swatch-live size-4 rounded-[4px]" /> Live — solid
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="legend-swatch-pending size-4 rounded-[4px]" /> Pending — dashed + bar
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="legend-swatch-gap size-4 rounded-[4px]" /> Not built — hatch
              </span>
            </div>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-[11px] text-muted">2</span>
          <div>
            <p className="font-medium">Video</p>
            <p className="mt-1 flex items-center gap-1.5 text-muted">
              <NoTakeMark /> Hollow circle = no take — no video.
            </p>
          </div>
        </li>
        <li className="flex gap-3">
          <span className="font-mono text-[11px] text-muted">3</span>
          <div>
            <p className="font-medium">Origin</p>
            <p className="mt-1 text-muted">
              <span className="mr-1 inline-block rounded px-1 font-medium text-origin shadow-[0_0_0_1.5px_var(--color-origin)]">
                · 11 Sep
              </span>
              Orange outline + heavier weight. Never a fill.
            </p>
          </div>
        </li>
      </ol>
      <p className="mt-3 border-t border-line pt-2 text-[11px] text-muted">
        Row 36: report never raised this.
      </p>
    </div>
  );
}
