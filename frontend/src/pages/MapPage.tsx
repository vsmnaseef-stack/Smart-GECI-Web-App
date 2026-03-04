import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MapContainer from '@/features/map/MapContainer';
import LayerPanel from '@/features/layers/LayerPanel';
import MetadataPanel from '@/features/metadata/MetadataPanel';
import { useMapStore } from '@/store/mapStore';
import { useLayerStore } from '@/store/layerStore';
import { useAuthStore } from '@/store/authStore';

export default function MapPage() {
  const isMetadataPanelOpen = useMapStore(state => state.isMetadataPanelOpen);
  const fetchLayers         = useLayerStore(state => state.fetchLayers);
  const token               = useAuthStore(state => state.token);

  // Re-fetch the layer hierarchy whenever the auth token changes
  // (login/logout/role switch triggers a fresh filtered response from backend)
  useEffect(() => {
    fetchLayers();
  }, [fetchLayers, token]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100">
      {/* ── top navbar ── */}
      <Navbar />

      {/* ── main content area ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── left: collapsible layer panel ── */}
        <LayerPanel />

        {/* ── center: map ── */}
        <div className="flex-1 relative overflow-hidden">
          <MapContainer />

          {/* ── right: metadata slide panel (overlays map) ── */}
          {isMetadataPanelOpen && (
            <div className="absolute top-0 right-0 h-full z-20">
              <MetadataPanel />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
