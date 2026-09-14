import {
  CAPABILITIES,
  JOURNEYS,
  type Capability,
  type LaneId,
  type RoleId,
  type Status,
} from "./cas-data";

export function matchesQuery(c: Capability, query: string) {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    c.title.toLowerCase().includes(q) ||
    c.description.toLowerCase().includes(q) ||
    c.row.toLowerCase().includes(q) ||
    (c.blocker?.toLowerCase().includes(q) ?? false) ||
    String(c.id) === q
  );
}

export function filterCapabilities(opts: {
  query: string;
  status: Status | "all";
  lane: LaneId | "all";
  role: RoleId | "all";
  journey: string | null;
}): Capability[] {
  const journeyNodes = opts.journey
    ? new Set(JOURNEYS.find((j) => j.id === opts.journey)?.nodes ?? [])
    : null;

  return CAPABILITIES.filter((c) => {
    if (opts.status !== "all" && c.status !== opts.status) return false;
    if (opts.lane !== "all" && c.lane !== opts.lane) return false;
    if (opts.role !== "all" && !c.roles.includes(opts.role)) return false;
    if (journeyNodes && !journeyNodes.has(c.id)) return false;
    if (!matchesQuery(c, opts.query)) return false;
    return true;
  });
}

export function journeySet(journeyId: string | null): Set<number> | null {
  if (!journeyId) return null;
  const j = JOURNEYS.find((x) => x.id === journeyId);
  return j ? new Set(j.nodes) : null;
}
