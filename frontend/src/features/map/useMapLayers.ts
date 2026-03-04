import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Map as LeafletMap, TileLayer } from 'leaflet';
import L from 'leaflet';
import { useLayerStore } from '@/store/layerStore';
import { useAuthStore } from '@/store/authStore';
import { findNodeById } from '@/features/layers/layerUtils';

const GEOSERVER_URL = import.meta.env.VITE_GEOSERVER_URL as string;

type WmsLayerRef = Record<string, TileLayer.WMS>;

interface UseMapLayersOptions {
  mapRef: MutableRefObject<LeafletMap | null>;
}

/**
 * Manages WMS layer lifecycle on the Leaflet map.
 *
 * - Watches `activeLayerIds` from layerStore.
 * - Adds WMS layers for newly activated ids.
 * - Removes WMS layers for deactivated ids.
 * - Maintains a stable ref dictionary to avoid re-creation on every render.
 */
export function useMapLayers({ mapRef }: UseMapLayersOptions) {
  const activeLayerIds = useLayerStore(state => state.activeLayerIds);
  const layerTree      = useLayerStore(state => state.layerTree);
  const role           = useAuthStore(state => state.role);

  // Stable dictionary: layerId → Leaflet WMS instance
  const wmsLayersRef = useRef<WmsLayerRef>({});

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds  = new Set(activeLayerIds);
    const existingIds = new Set(Object.keys(wmsLayersRef.current));

    // ── remove layers that are no longer active ──────────────────────────────
    existingIds.forEach(id => {
      if (!currentIds.has(id)) {
        const layer = wmsLayersRef.current[id];
        map.removeLayer(layer);
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete wmsLayersRef.current[id];
      }
    });

    // ── add layers that are newly active ─────────────────────────────────────
    currentIds.forEach(id => {
      if (existingIds.has(id)) return; // already on map

      const node = findNodeById(layerTree, id);
      if (!node) return;

      // Double-check: guests must never render restricted layers
      if (node.restricted && role === 'guest') return;

      const wmsLayer = L.tileLayer.wms(GEOSERVER_URL, {
        layers: node.geoserverName,
        format: 'image/png',
        transparent: true,
        version: '1.1.1',
        attribution: `© Smart GECI – ${node.name}`,
      });

      wmsLayer.addTo(map);
      wmsLayersRef.current[id] = wmsLayer;
    });
  }, [activeLayerIds, layerTree, role, mapRef]);

  // Cleanup on unmount
  useEffect(() => {
    const layersRef = wmsLayersRef.current;
    const map = mapRef.current;
    return () => {
      if (!map) return;
      Object.values(layersRef).forEach(layer => map.removeLayer(layer));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
