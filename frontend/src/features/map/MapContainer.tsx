import { useEffect, useRef, useCallback } from 'react';
import type { Map as LeafletMap } from 'leaflet';
import L from 'leaflet';
import { useMapLayers } from './useMapLayers';
import { useMapStore } from '@/store/mapStore';
import { fetchFacilityByLocation } from '@/services/metadataService';

// Fix Leaflet's default icon paths broken by bundlers
import iconUrl        from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl  from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl      from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

// ─── map center defaults (override via env if needed) ────────────────────────
const DEFAULT_CENTER: [number, number] = [
  parseFloat(import.meta.env.VITE_MAP_DEFAULT_LAT as string) || 33.8869,
  parseFloat(import.meta.env.VITE_MAP_DEFAULT_LNG as string) || 9.5375,
];
const DEFAULT_ZOOM = parseInt(import.meta.env.VITE_MAP_DEFAULT_ZOOM as string, 10) || 7;

export default function MapContainer() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef    = useRef<LeafletMap | null>(null);

  const setMetadata        = useMapStore(state => state.setMetadata);
  const openMetadataPanel  = useMapStore(state => state.openMetadataPanel);
  const setClickedLocation = useMapStore(state => state.setClickedLocation);
  const setLoadingMetadata = useMapStore(state => state.setLoadingMetadata);
  const setMetadataError   = useMapStore(state => state.setMetadataError);

  // ── map click handler ────────────────────────────────────────────────────
  const handleMapClick = useCallback(
    async (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setClickedLocation({ lat, lng });
      setLoadingMetadata(true);
      setMetadataError(null);
      openMetadataPanel();

      try {
        const data = await fetchFacilityByLocation({ lat, lng });
        setMetadata(data);
      } catch {
        setMetadataError('Failed to load facility data. Please try again.');
        setMetadata(null);
      } finally {
        setLoadingMetadata(false);
      }
    },
    [setClickedLocation, setLoadingMetadata, setMetadataError, openMetadataPanel, setMetadata],
  );

  // ── initialize Leaflet map once ──────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;

    const map = L.map(mapDivRef.current, {
      center: DEFAULT_CENTER,
      zoom:   DEFAULT_ZOOM,
      zoomControl: true,
    });

    // ── base layer (OpenStreetMap) ──────────────────────────────────────────
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    map.on('click', handleMapClick);

    mapRef.current = map;

    return () => {
      map.off('click', handleMapClick);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update click handler when its deps change without re-initializing the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.off('click');
    map.on('click', handleMapClick);
  }, [handleMapClick]);

  // ── WMS layer management (watches activeLayerIds) ────────────────────────
  useMapLayers({ mapRef });

  return (
    <div
      ref={mapDivRef}
      className="w-full h-full"
      style={{ minHeight: 0 }}
      data-testid="map-container"
    />
  );
}
