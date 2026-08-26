import { create } from 'zustand';
import { ChipId, DEFAULT_CHIP, isChipId, StyleId, isStyleId } from '@/lib/catalogFilters';

interface CatalogFilterState {
  chip: ChipId;
  setChip: (chip: ChipId) => void;

  syncFromUrl: (value: string | null) => void;

  style: StyleId | null;
  setStyle: (value: string | null) => void;
}


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
