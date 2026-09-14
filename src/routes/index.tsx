import { useLayoutEffect, useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppHeader, FilterBar } from "@/components/app-chrome";
import { DetailPanel } from "@/components/detail-panel";
import { FlowMap } from "@/components/flow-map";
import { LaneView } from "@/components/lane-view";
import { RegisterView } from "@/components/register-view";
import { filterCapabilities } from "@/lib/cas-filter";
import { useCas } from "@/lib/cas-store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const view = useCas((s) => s.view);
  const setView = useCas((s) => s.setView);
  const query = useCas((s) => s.query);
  const status = useCas((s) => s.status);
  const lane = useCas((s) => s.lane);
  const role = useCas((s) => s.role);
  const journey = useCas((s) => s.journey);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      if (mq.matches && useCas.getState().view === "map") setView("lanes");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [setView]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") useCas.getState().setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const visible = useMemo(
    () => filterCapabilities({ query, status, lane, role, journey }),
    [query, status, lane, role, journey],
  );
  const visibleIds = useMemo(() => new Set(visible.map((c) => c.id)), [visible]);

  return (
    <div className="flex h-dvh flex-col bg-paper text-ink">
      <AppHeader />
      <FilterBar />
      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <main className="relative min-h-0 min-w-0 flex-1">
          {view === "map" ? <FlowMap visibleIds={visibleIds} /> : null}
          {view === "lanes" ? <LaneView visibleIds={visibleIds} /> : null}
          {view === "register" ? <RegisterView visibleIds={visibleIds} /> : null}
          {visible.length === 0 ? (
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted shadow-[var(--shadow-border)]">
                Nothing matches. Reset the filters or clear search.
              </p>
            </div>
          ) : null}
        </main>
        <DetailPanel />
      </div>
    </div>
  );
}
