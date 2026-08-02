import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistStore {
  handles: string[];
  toggle: (handle: string) => void;
  has: (handle: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      handles: [],
      toggle: (handle) =>
        set((s) => ({
          handles: s.handles.includes(handle)
            ? s.handles.filter((h) => h !== handle)
            : [handle, ...s.handles],
        })),
      has: (handle) => get().handles.includes(handle),
    }),
    { name: "mi-wishlist", storage: createJSONStorage(() => localStorage) },
  ),
);
