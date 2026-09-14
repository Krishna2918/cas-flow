import { CAPABILITIES, LANES } from "@/lib/cas-data";
import { useCas } from "@/lib/cas-store";
import { CapabilityCard } from "./capability-card";
import { journeySet } from "@/lib/cas-filter";

export function LaneView({ visibleIds }: { visibleIds: Set<number> }) {
  const selected = useCas((s) => s.selected);
  const setSelected = useCas((s) => s.setSelected);
  const journey = useCas((s) => s.journey);
  const jset = journeySet(journey);

  return (
    <div className="h-full overflow-y-auto px-4 pb-24 pt-3 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {LANES.map((lane) => {
          const items = CAPABILITIES.filter((c) => c.lane === lane.id).sort(
            (a, b) => a.x - b.x || b.y - a.y,
          );
          const shown = items.filter((c) => visibleIds.has(c.id));
          if (shown.length === 0) return null;
          const live = items.filter((c) => c.status === "live").length;
          return (
            <section key={lane.id} className="min-w-0">
              <header className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-line pb-2">
                <div>
                  <h2 className="font-display text-xl font-semibold tracking-tight text-navy">
                    {lane.label}
                  </h2>
                  <p className="mt-0.5 text-sm font-medium text-muted">{lane.blurb}</p>
                </div>
                <p className="font-mono text-[11px] tabular-nums text-muted">
                  {shown.length} shown · {live}/{items.length} live
                </p>
              </header>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {shown.map((c) => (
                  <CapabilityCard
                    key={c.id}
                    cap={c}
                    size="lane"
                    active={selected === c.id}
                    dimmed={jset ? !jset.has(c.id) : false}
                    onSelect={setSelected}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
