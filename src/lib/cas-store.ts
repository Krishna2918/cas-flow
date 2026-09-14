import { create } from "zustand";
import type { LaneId, RoleId, Status } from "./cas-data";

export type ViewId = "map" | "lanes" | "register";

type CasState = {
  view: ViewId;
  query: string;
  status: Status | "all";
  lane: LaneId | "all";
  role: RoleId | "all";
  journey: string | null;
  selected: number | null;
  legendOpen: boolean;
  setView: (view: ViewId) => void;
  setQuery: (query: string) => void;
  setStatus: (status: Status | "all") => void;
  setLane: (lane: LaneId | "all") => void;
  setRole: (role: RoleId | "all") => void;
  setJourney: (journey: string | null) => void;
  setSelected: (selected: number | null) => void;
  toggleLegend: () => void;
  resetFilters: () => void;
};

export const useCas = create<CasState>((set) => ({
  view: "map",
  query: "",
  status: "all",
  lane: "all",
  role: "all",
  journey: null,
  selected: null,
  legendOpen: false,
  setView: (view) => set({ view }),
  setQuery: (query) => set({ query }),
  setStatus: (status) => set({ status }),
  setLane: (lane) => set({ lane }),
  setRole: (role) => set({ role }),
  setJourney: (journey) => set({ journey }),
  setSelected: (selected) => set({ selected }),
  toggleLegend: () => set((s) => ({ legendOpen: !s.legendOpen })),
  resetFilters: () =>
    set({
      query: "",
      status: "all",
      lane: "all",
      role: "all",
      journey: null,
    }),
}));
