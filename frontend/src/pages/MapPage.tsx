import Navbar from '@/components/Navbar';
import MapContainer from '@/features/map/MapContainer';
import LayerPanel from '@/features/layers/LayerPanel';
import MetadataPanel from '@/features/metadata/MetadataPanel';
import { useMapStore } from '@/store/mapStore';

export default function MapPage() {
  const isMetadataPanelOpen = useMapStore(state => state.isMetadataPanelOpen);

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
