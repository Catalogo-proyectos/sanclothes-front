import { create } from 'zustand';
import { ChipId, DEFAULT_CHIP, isChipId, StyleId, isStyleId } from '@/lib/catalogFilters';

interface CatalogFilterState {
  chip: ChipId;
  setChip: (chip: ChipId) => void;
  /** Adopt the chip encoded in a URL (deep link, back/forward) without pushing history. */
  syncFromUrl: (value: string | null) => void;
  /**
   * Style line selected via `?category=` from the header nav. The grid owns the
   * URL→store direction; the header only reads it, so it can mark the active nav
   * link without pulling useSearchParams into the root layout (which would opt
   * every route out of static rendering).
   */
  style: StyleId | null;
  setStyle: (value: string | null) => void;
}

/**
 * Lives outside the router on purpose. The chip rail must repaint the catalog
 * with no navigation at all when the user is already on /catalog — a router
 * push there would remount the Suspense boundary and flash the skeleton. The
 * URL is kept in step with history.replaceState from the rail instead.
 */
export const useCatalogFilter = create<CatalogFilterState>((set) => ({
  chip: DEFAULT_CHIP,
  setChip: (chip) => set({ chip }),
  syncFromUrl: (value) => set({ chip: isChipId(value) ? value : DEFAULT_CHIP }),
  style: null,
  setStyle: (value) =>
    set((s) => {
      const next = isStyleId(value) ? value : null;
      return s.style === next ? s : { style: next };
    }),
}));
