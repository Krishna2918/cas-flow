import { cn } from "@/lib/utils";
import type { Status } from "@/lib/cas-data";

export const STATUS_LABEL: Record<Status, string> = {
  live: "Built and live",
  pending: "Awaiting owner",
  "not-built": "Not built",
};

export const STATUS_SHORT: Record<Status, string> = {
  live: "Live",
  pending: "Pending",
  "not-built": "Not built",
};

export function StatusDot({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full",
        status === "live" && "bg-live",
        status === "pending" && "bg-pending",
        status === "not-built" && "bg-gap",
        className,
      )}
      aria-hidden
    />
  );
}

export function NoTakeMark({ className }: { className?: string }) {
  return (
    <span
      title="No video take"
      className={cn(
        "inline-block size-2.5 shrink-0 rounded-full border-2 border-ink bg-transparent",
        className,
      )}
      aria-label="No video take"
    />
  );
}
