import { create } from 'zustand';

// ─── types ────────────────────────────────────────────────────────────────────

export interface FacilityMetadata {
  id: string;
  name: string;
  type: string;
  description?: string;
  properties: Record<string, string | number | boolean>;
}

export interface ClickedLocation {
  lat: number;
  lng: number;
}

// ─── store interface ──────────────────────────────────────────────────────────

interface MapState {
  metadata: FacilityMetadata | null;
  isMetadataPanelOpen: boolean;
  clickedLocation: ClickedLocation | null;
  isLoadingMetadata: boolean;
  metadataError: string | null;

  setMetadata: (metadata: FacilityMetadata | null) => void;
  openMetadataPanel: () => void;
  closeMetadataPanel: () => void;
  setClickedLocation: (location: ClickedLocation | null) => void;
  setLoadingMetadata: (loading: boolean) => void;
  setMetadataError: (error: string | null) => void;
}

// ─── store ───────────────────────────────────────────────────────────────────

export const useMapStore = create<MapState>((set) => ({
  metadata: null,
  isMetadataPanelOpen: false,
  clickedLocation: null,
  isLoadingMetadata: false,
  metadataError: null,

  setMetadata: (metadata) => set({ metadata }),
  openMetadataPanel: () => set({ isMetadataPanelOpen: true }),
  closeMetadataPanel: () => set({ isMetadataPanelOpen: false, metadata: null }),
  setClickedLocation: (location) => set({ clickedLocation: location }),
  setLoadingMetadata: (loading) => set({ isLoadingMetadata: loading }),
  setMetadataError: (error) => set({ metadataError: error }),
}));
