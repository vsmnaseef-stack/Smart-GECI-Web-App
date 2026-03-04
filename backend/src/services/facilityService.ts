import { FacilityRepository } from '../repositories/facilityRepository';
import type { AcademicBlockRow } from '../repositories/facilityRepository';
import { AppError } from '../middleware/errorHandler';

// ─── Public result type ───────────────────────────────────────────────────────

/**
 * Facility metadata returned to the controller layer.
 *
 * The shape mirrors `AcademicBlockRow` but declares an explicit contract so
 * callers are not coupled to the raw DB representation.
 */
export type FacilityMetadata = AcademicBlockRow;

// ─── getFacilitiesByLocation ──────────────────────────────────────────────────

/**
 * Returns all `academic_blocks` features that contain the given WGS-84
 * coordinate, or throws a 404 `AppError` when none match.
 *
 * Coordinate validation is performed here (service boundary) so:
 *   - Longitude must be in [-180, 180]
 *   - Latitude  must be in  [-90,  90]
 *
 * PostGIS receives (longitude, latitude) = (X, Y), which is the standard
 * argument order for `ST_Point`.
 *
 * @param lat - WGS-84 latitude  (-90 … 90)
 * @param lng - WGS-84 longitude (-180 … 180)
 * @throws AppError(400) on invalid coordinates
 * @throws AppError(404) when no facility contains the point
 */
export async function getFacilitiesByLocation(
  lat: number,
  lng: number,
): Promise<FacilityMetadata[]> {
  // ── Coordinate validation ─────────────────────────────────────────────────
  if (!isFinite(lat) || lat < -90 || lat > 90) {
    throw new AppError('lat must be a number between -90 and 90', 400);
  }
  if (!isFinite(lng) || lng < -180 || lng > 180) {
    throw new AppError('lng must be a number between -180 and 180', 400);
  }

  // ── Spatial query ─────────────────────────────────────────────────────────
  const rows = await FacilityRepository.findByLocation(lng, lat);

  if (rows.length === 0) {
    throw new AppError(
      `No facility found at coordinates (${lat}, ${lng})`,
      404,
    );
  }

  return rows;
}
