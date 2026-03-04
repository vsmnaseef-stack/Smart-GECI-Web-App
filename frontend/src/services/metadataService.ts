import api from './api';
import type { FacilityMetadata } from '@/store/mapStore';

interface ByLocationParams {
  lat: number;
  lng: number;
}

/**
 * Fetch facility metadata closest to the clicked map coordinate.
 */
export async function fetchFacilityByLocation(
  params: ByLocationParams,
): Promise<FacilityMetadata | null> {
  const response = await api.get<FacilityMetadata | null>(
    '/facilities/by-location',
    { params },
  );
  return response.data;
}
