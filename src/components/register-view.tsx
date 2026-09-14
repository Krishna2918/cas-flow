import { useMemo, useState } from "react";
import { CAPABILITIES, LANES, type Capability, type Status } from "@/lib/cas-data";
import { useCas } from "@/lib/cas-store";
import { cn } from "@/lib/utils";
import { NoTakeMark, STATUS_SHORT, StatusDot } from "./status-mark";
import { ChevronDown } from "lucide-react";

type Col = "id" | "title" | "lane" | "status" | "row";

export function RegisterView({ visibleIds }: { visibleIds: Set<number> }) {
  const selected = useCas((s) => s.selected);
  const setSelected = useCas((s) => s.setSelected);
  const [sort, setSort] = useState<{ col: Col; dir: 1 | -1 }>({ col: "id", dir: 1 });

  const rows = useMemo(() => {
    const list = CAPABILITIES.filter((c) => visibleIds.has(c.id));
    const laneLabel = Object.fromEntries(LANES.map((l) => [l.id, l.label]));
    const val = (c: Capability): string | number => {
      if (sort.col === "id") return c.id;
      if (sort.col === "title") return c.title.toLowerCase();
      if (sort.col === "lane") return laneLabel[c.lane] ?? c.lane;
      if (sort.col === "status") return ({ live: 0, pending: 1, "not-built": 2 } as Record<Status, number>)[c.status];
      return c.row;
    };
    return [...list].sort((a, b) => {
      const av = val(a);
      const bv = val(b);
      if (av < bv) return -1 * sort.dir;
      if (av > bv) return 1 * sort.dir;
      return a.id - b.id;
    });
  }, [visibleIds, sort]);

  const Head = ({ col, children, className }: { col: Col; children: string; className?: string }) => (
    <th className={cn("px-3 py-2 text-left font-medium", className)}>
      <button
        type="button"
        className="inline-flex items-center gap-1 text-muted hover:text-ink"
        onClick={() =>
          setSort((s) => ({ col, dir: s.col === col ? (s.dir === 1 ? -1 : 1) : 1 }))
        }
      >
        {children}
        <ChevronDown
          className={cn(
            "size-3.5 transition-transform duration-150",
            sort.col === col ? "opacity-100" : "opacity-0",
            sort.col === col && sort.dir === -1 && "rotate-180",
          )}
        />
      </button>
    </th>
  );

  return (
    <div className="h-full overflow-auto px-4 pb-24 pt-3 sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-surface font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <tr className="border-b border-line">
              <Head col="id" className="w-14">#</Head>
              <Head col="title">Capability</Head>
              <Head col="lane" className="w-40">Lane</Head>
              <Head col="status" className="w-32">Build</Head>
              <Head col="row" className="w-36">Row</Head>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const lane = LANES.find((l) => l.id === c.lane);
              const on = selected === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => setSelected(c.id)}
                  className={cn(
                    "cursor-pointer border-b border-line/70 transition-colors duration-150",
                    on ? "bg-navy text-paper" : "hover:bg-paper",
                    c.origin && !on && "shadow-[inset_3px_0_0_var(--color-origin)]",
                  )}
                >
                  <td className={cn("px-3 py-2.5 font-mono tabular-nums", on ? "text-paper/70" : "text-muted")}>
                    {c.id}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <span className={cn("font-medium leading-snug", c.origin && "font-semibold")}>
                        {c.title}
                      </span>
                      {c.noTake ? (
                        <span className="mt-1.5">
                          <NoTakeMark className={on ? "border-paper/60" : undefined} />
                        </span>
                      ) : null}
                    </div>
                    {c.blocker ? (
                      <p className={cn("mt-0.5 text-[12px]", on ? "text-paper/70" : "text-pending")}>
                        {c.blocker}
                      </p>
                    ) : null}
                  </td>
                  <td className={cn("px-3 py-2.5", on ? "text-paper/80" : "text-muted")}>
                    {lane?.label}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <StatusDot status={c.status} className={on ? "bg-paper" : undefined} />
                      <span
                        className={
                          on
                            ? undefined
                            : c.status === "live"
                              ? "text-live"
                              : c.status === "pending"
                                ? "text-pending"
                                : "text-gap"
                        }
                      >
                        {STATUS_SHORT[c.status]}
                      </span>
                    </span>
                  </td>
                  <td className={cn("px-3 py-2.5 font-mono text-[12px]", on ? "text-paper/70" : "text-muted")}>
                    {c.row || "—"}
                    {c.date ? ` · ${c.date}` : ""}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">No capabilities match these filters.</p>
        ) : null}
      </div>
    </div>
  );
}
