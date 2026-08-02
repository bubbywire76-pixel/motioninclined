import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface RecentlyViewedStore {
  handles: string[];
  push: (handle: string) => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedStore>()(
  persist(
    (set) => ({
      handles: [],
      push: (handle) =>
        set((s) => ({ handles: [handle, ...s.handles.filter((h) => h !== handle)].slice(0, 8) })),
    }),
    { name: "mi-recently-viewed", storage: createJSONStorage(() => localStorage) },
  ),
);
