import { cn } from "@/lib/utils";
import type { Capability } from "@/lib/cas-data";
import { NoTakeMark, STATUS_SHORT } from "./status-mark";

type Size = "map" | "lane" | "list";

export function CapabilityCard({
  cap,
  size = "lane",
  active = false,
  dimmed = false,
  onSelect,
}: {
  cap: Capability;
  size?: Size;
  active?: boolean;
  dimmed?: boolean;
  onSelect?: (id: number) => void;
}) {
  const compact = size === "map";
  return (
    <button
      type="button"
      onClick={() => onSelect?.(cap.id)}
      data-id={cap.id}
      className={cn(
        "group relative w-full border-l-4 text-left transition-[transform,box-shadow,opacity] duration-150 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
        "active:scale-[0.96]",
        compact ? "h-full rounded-[10px] p-2.5" : "rounded-xl p-3.5",
        cap.status === "live" && "border-l-live bg-live-soft",
        cap.status === "pending" && "border-l-pending bg-pending-soft",
        cap.status === "not-built" && "node-hatch border-l-gap",
        cap.origin && "outline outline-2 -outline-offset-1 outline-origin",
        !cap.origin && "shadow-[var(--shadow-border)]",
        active && "z-10 outline outline-2 -outline-offset-1 outline-navy",
        dimmed && "opacity-35",
        !dimmed && "hover:z-10",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "font-mono font-semibold uppercase tracking-[0.14em]",
            compact ? "text-[11px]" : "text-xs",
            cap.status === "live" && "text-live",
            cap.status === "pending" && "text-pending",
            cap.status === "not-built" && "text-gap",
          )}
        >
          {STATUS_SHORT[cap.status]}
        </span>
        <span className="flex items-center gap-1.5">
          {cap.noTake ? <NoTakeMark /> : null}
          {cap.origin ? (
            <span
              className={cn(
                "font-semibold text-origin",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              · 11 Sep
            </span>
          ) : null}
        </span>
      </div>
      <p
        className={cn(
          "mt-1 font-semibold leading-snug text-ink",
          compact ? "line-clamp-3 text-sm" : "text-base",
        )}
      >
        {cap.title}
      </p>
      <p
        className={cn(
          "mt-1 font-mono font-medium text-muted",
          compact ? "text-[11px]" : "text-xs",
        )}
      >
        {cap.row ? `row ${cap.row}` : "—"}
        {cap.date ? ` · ${cap.date}` : ""}
      </p>
      {cap.blocker && !compact ? (
        <p className="mt-2 text-sm font-medium leading-snug text-pending">{cap.blocker}</p>
      ) : null}
    </button>
  );
}
