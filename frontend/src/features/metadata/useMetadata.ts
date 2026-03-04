import { useCallback } from 'react';
import { useMapStore } from '@/store/mapStore';
import { fetchFacilityByLocation } from '@/services/metadataService';

/**
 * Hook that exposes metadata state and a re-fetch action.
 * The initial fetch is triggered directly from MapContainer on map click.
 * This hook is for components that need to read or manually refresh metadata.
 */
export function useMetadata() {
  const metadata          = useMapStore(state => state.metadata);
  const isLoading         = useMapStore(state => state.isLoadingMetadata);
  const error             = useMapStore(state => state.metadataError);
  const clickedLocation   = useMapStore(state => state.clickedLocation);
  const isOpen            = useMapStore(state => state.isMetadataPanelOpen);

  const setMetadata        = useMapStore(state => state.setMetadata);
  const setLoadingMetadata = useMapStore(state => state.setLoadingMetadata);
  const setMetadataError   = useMapStore(state => state.setMetadataError);
  const close              = useMapStore(state => state.closeMetadataPanel);

  const refetch = useCallback(async () => {
    if (!clickedLocation) return;
    setLoadingMetadata(true);
    setMetadataError(null);
    try {
      const data = await fetchFacilityByLocation(clickedLocation);
      setMetadata(data);
    } catch {
      setMetadataError('Failed to reload facility data.');
    } finally {
      setLoadingMetadata(false);
    }
  }, [clickedLocation, setLoadingMetadata, setMetadataError, setMetadata]);

  return { metadata, isLoading, error, isOpen, clickedLocation, close, refetch };
}
