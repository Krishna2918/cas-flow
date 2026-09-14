import {
  coverage,
  JOURNEYS,
  LANES,
  ROLES,
  type LaneId,
  type RoleId,
  type Status,
} from "@/lib/cas-data";
import { useCas, type ViewId } from "@/lib/cas-store";
import { cn } from "@/lib/utils";
import { LegendCard } from "./legend-card";
import { GitBranch, LayoutGrid, List, Search, X, Info, RotateCcw } from "lucide-react";

const VIEWS: { id: ViewId; label: string; icon: typeof GitBranch }[] = [
  { id: "map", label: "Map", icon: GitBranch },
  { id: "lanes", label: "Lanes", icon: LayoutGrid },
  { id: "register", label: "Register", icon: List },
];

export function AppHeader() {
  const view = useCas((s) => s.view);
  const setView = useCas((s) => s.setView);
  const query = useCas((s) => s.query);
  const setQuery = useCas((s) => s.setQuery);
  const legendOpen = useCas((s) => s.legendOpen);
  const toggleLegend = useCas((s) => s.toggleLegend);
  const cov = coverage();
  const livePct = Math.round((cov.live / cov.total) * 100);

  return (
    <header className="relative z-20 bg-navy text-paper">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-5">
        <div className="min-w-0 shrink-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-paper/80">
            College Admissions System
          </p>
          <h1 className="font-display text-[22px] font-semibold leading-none tracking-tight sm:text-[26px]">
            CAS Flow
          </h1>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-3 md:flex">
          <CoverageMeter live={cov.live} pending={cov.pending} notBuilt={cov.notBuilt} total={cov.total} />
          <p className="truncate font-mono text-xs tabular-nums text-paper">
            <span className="text-live-soft">{cov.live} live</span>
            {" · "}
            <span className="text-pending-soft">{cov.pending} pending</span>
            {" · "}
            <span className="text-gap-soft">{cov.notBuilt} not built</span>
            <span className="text-paper/70"> · {livePct}% of {cov.total}</span>
          </p>
        </div>

        <label className="relative ml-auto w-full max-w-[16rem] min-w-0 sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper/45" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="h-10 w-full rounded-xl bg-navy-deep pl-9 pr-8 text-[13px] text-paper placeholder:text-paper/40 outline-none ring-paper/0 focus:ring-2 focus:ring-paper/25"
          />
          {query ? (
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-paper/50 hover:text-paper"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </label>

        <button
          type="button"
          onClick={toggleLegend}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-xl",
            legendOpen ? "bg-paper text-navy" : "bg-navy-deep text-paper/80 hover:text-paper",
          )}
          aria-pressed={legendOpen}
          aria-label="Toggle legend"
        >
          <Info className="size-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 border-t border-paper/10 px-4 py-2 sm:px-5">
        <nav className="flex rounded-xl bg-navy-deep p-1" aria-label="Views">
          {VIEWS.map((v) => {
            const Icon = v.icon;
            const on = view === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setView(v.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-medium transition-colors duration-150",
                  on ? "bg-paper text-navy" : "text-paper/90 hover:text-paper",
                )}
              >
                <Icon className="size-3.5" />
                {v.label}
              </button>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto md:hidden">
          <CoverageMeter live={cov.live} pending={cov.pending} notBuilt={cov.notBuilt} total={cov.total} />
          <span className="shrink-0 font-mono text-xs font-medium tabular-nums text-paper">
            {livePct}% live
          </span>
        </div>
      </div>

      {legendOpen ? (
        <div className="absolute right-4 top-full z-30 mt-2 w-[min(100vw-2rem,22rem)]">
          <LegendCard />
        </div>
      ) : null}
    </header>
  );
}

function CoverageMeter({
  live,
  pending,
  notBuilt,
  total,
}: {
  live: number;
  pending: number;
  notBuilt: number;
  total: number;
}) {
  return (
    <span className="inline-flex h-2.5 w-28 shrink-0 overflow-hidden rounded-full bg-paper/20 sm:w-44" aria-hidden>
      <span className="h-full bg-live" style={{ width: `${(live / total) * 100}%` }} />
      <span className="h-full bg-pending" style={{ width: `${(pending / total) * 100}%` }} />
      <span className="h-full bg-gap" style={{ width: `${(notBuilt / total) * 100}%` }} />
    </span>
  );
}

export function FilterBar() {
  const status = useCas((s) => s.status);
  const setStatus = useCas((s) => s.setStatus);
  const lane = useCas((s) => s.lane);
  const setLane = useCas((s) => s.setLane);
  const role = useCas((s) => s.role);
  const setRole = useCas((s) => s.setRole);
  const journey = useCas((s) => s.journey);
  const setJourney = useCas((s) => s.setJourney);
  const reset = useCas((s) => s.resetFilters);
  const dirty = status !== "all" || lane !== "all" || role !== "all" || journey !== null;

  return (
    <div className="flex flex-col gap-2 border-b border-line bg-paper-2 px-4 py-2 sm:px-5">
      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          label="Build"
          value={status}
          onChange={(v) => setStatus(v as Status | "all")}
          options={[
            { id: "all", label: "All" },
            { id: "live", label: "Live" },
            { id: "pending", label: "Pending" },
            { id: "not-built", label: "Not built" },
          ]}
        />
        <FilterSelect
          label="Lane"
          value={lane}
          onChange={(v) => setLane(v as LaneId | "all")}
          options={[{ id: "all", label: "All" }, ...LANES.map((l) => ({ id: l.id, label: l.label }))]}
        />
        <FilterSelect
          label="Desk"
          value={role}
          onChange={(v) => setRole(v as RoleId | "all")}
          options={[{ id: "all", label: "All" }, ...ROLES]}
        />
        {dirty ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] text-muted hover:text-ink"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </button>
        ) : null}
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
        {JOURNEYS.map((j) => {
          const on = journey === j.id;
          return (
            <button
              key={j.id}
              type="button"
              title={j.blurb}
              onClick={() => setJourney(on ? null : j.id)}
              className={cn(
                "h-8 shrink-0 rounded-full px-3 text-[12px] font-medium transition-colors duration-150",
                on
                  ? "bg-navy text-paper"
                  : "bg-surface font-medium text-ink shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-ink)_18%,transparent)] hover:bg-paper",
              )}
            >
              {j.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="inline-flex h-9 items-center gap-1.5 rounded-full bg-surface pl-2.5 pr-2 text-sm shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-ink)_18%,transparent)]">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="max-w-[9.5rem] bg-transparent font-medium text-ink outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
