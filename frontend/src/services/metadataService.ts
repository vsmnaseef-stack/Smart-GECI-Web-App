import api from './api';
import { getDemoRoleHeaders } from '@/store/authStore';
import type { FacilityMetadata } from '@/store/mapStore';

interface ByLocationParams {
  lat: number;
  lng: number;
}

/**
 * Fetch facility metadata closest to the clicked map coordinate.
 * - Demo mode: sends x-role header.
 * - Real mode: JWT is attached automatically by api.ts interceptor.
 */
export async function fetchFacilityByLocation(
  params: ByLocationParams,
): Promise<FacilityMetadata | null> {
  const response = await api.get<FacilityMetadata | null>(
    '/facilities/by-location',
    {
      params,
      headers: getDemoRoleHeaders(),
    },
  );
  return response.data;
}
