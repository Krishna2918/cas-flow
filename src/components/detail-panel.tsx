import { BY_ID, LANES, ROLES, neighbors } from "@/lib/cas-data";
import { useCas } from "@/lib/cas-store";
import { cn } from "@/lib/utils";
import { NoTakeMark, STATUS_LABEL, StatusDot } from "./status-mark";
import { X, ArrowRight, ArrowLeft } from "lucide-react";

export function DetailPanel() {
  const selected = useCas((s) => s.selected);
  const setSelected = useCas((s) => s.setSelected);
  const setLane = useCas((s) => s.setLane);
  const cap = selected != null ? BY_ID[selected] : null;

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-line bg-surface transition-[width,opacity] duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]",
        cap
          ? "w-full max-h-[48vh] border-t md:max-h-none md:w-[360px] md:border-t-0 md:border-l"
          : "pointer-events-none hidden",
      )}
    >
      {cap ? (
        <div className="flex h-full min-h-0 flex-col">
          <header className="flex items-start justify-between gap-3 px-5 pt-4 pb-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                Capability {String(cap.id).padStart(2, "0")}
              </p>
              <h2 className="mt-1 font-display text-[22px] font-semibold leading-tight tracking-tight text-navy">
                {cap.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="grid size-10 shrink-0 place-items-center rounded-lg text-muted hover:bg-paper hover:text-ink"
              aria-label="Close detail"
            >
              <X className="size-4" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold",
                  cap.status === "live" && "bg-live-soft text-live",
                  cap.status === "pending" && "bg-pending-soft text-pending",
                  cap.status === "not-built" && "bg-gap-soft text-gap",
                )}
              >
                <StatusDot status={cap.status} />
                {STATUS_LABEL[cap.status]}
              </span>
              {cap.origin ? (
                <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-medium text-origin shadow-[0_0_0_1px_var(--color-origin)]">
                  Origin · 11 Sep
                </span>
              ) : null}
              {cap.noTake ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 text-[12px] text-muted">
                  <NoTakeMark /> No video take
                </span>
              ) : null}
            </div>

            <p className="mt-4 text-[15px] leading-relaxed text-ink/90">{cap.description}</p>

            {cap.blocker ? (
              <p className="mt-4 rounded-xl bg-pending-soft px-3 py-2.5 text-[13px] leading-snug text-pending">
                Blocker: {cap.blocker}
              </p>
            ) : null}

            <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-[13px]">
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Row</dt>
                <dd className="mt-0.5 font-mono text-ink">{cap.row || "—"}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Lane</dt>
                <dd className="mt-0.5">
                  <button
                    type="button"
                    className="text-navy underline-offset-2 hover:underline"
                    onClick={() => setLane(cap.lane)}
                  >
                    {LANES.find((l) => l.id === cap.lane)?.label}
                  </button>
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">Desks</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {cap.roles.map((r) => (
                    <span key={r} className="rounded-md bg-paper px-2 py-0.5 text-[12px] text-ink">
                      {ROLES.find((x) => x.id === r)?.label}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>

            <Connections id={cap.id} />
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function Connections({ id }: { id: number }) {
  const { upstream, downstream } = neighbors(id);
  const setSelected = useCas((s) => s.setSelected);
  if (upstream.length === 0 && downstream.length === 0) return null;
  return (
    <div className="mt-6 space-y-4">
      {upstream.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <ArrowLeft className="size-3" /> Feeds from
          </p>
          <ul className="space-y-1.5">
            {upstream.map((e) => {
              const n = BY_ID[e.from];
              if (!n) return null;
              return (
                <li key={`u-${e.from}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(e.from)}
                    className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-paper"
                  >
                    <span className="text-[13px] leading-snug text-ink">{n.title}</span>
                    {e.label ? (
                      <span className="shrink-0 font-mono text-[10px] text-muted">{e.label}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
      {downstream.length > 0 ? (
        <div>
          <p className="mb-2 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            <ArrowRight className="size-3" /> Hands off to
          </p>
          <ul className="space-y-1.5">
            {downstream.map((e) => {
              const n = BY_ID[e.to];
              if (!n) return null;
              return (
                <li key={`d-${e.to}`}>
                  <button
                    type="button"
                    onClick={() => setSelected(e.to)}
                    className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-paper"
                  >
                    <span className="text-[13px] leading-snug text-ink">{n.title}</span>
                    {e.label ? (
                      <span className="shrink-0 font-mono text-[10px] text-muted">{e.label}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
