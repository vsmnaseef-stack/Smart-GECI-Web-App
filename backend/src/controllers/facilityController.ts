import type { Request, Response, NextFunction } from 'express';
import { getFacilitiesByLocation } from '../services/facilityService';
import { AppError }                from '../middleware/errorHandler';
import { successResponse }         from '../utils';

// ─── getFacilitiesByLocation ──────────────────────────────────────────────────

/**
 * GET /api/facilities/by-location?lat=<number>&lng=<number>
 *
 * Returns JSON metadata for every `academic_blocks` feature that spatially
 * contains the supplied WGS-84 coordinate.
 *
 * Query parameters:
 *   lat  — WGS-84 latitude  (required, -90 … 90)
 *   lng  — WGS-84 longitude (required, -180 … 180)
 *
 * Success (200):
 *   { success: true, data: [ { id, name, … } ] }
 *
 * Errors:
 *   400 — lat or lng missing / non-numeric / out of range
 *   404 — no facility contains the point
 *   500 — unexpected DB / PostGIS error
 */
export async function getFacilitiesByLocationHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { lat: rawLat, lng: rawLng } = req.query as {
      lat?: string;
      lng?: string;
    };

    // ── Presence check ──────────────────────────────────────────────────────
    if (rawLat === undefined || rawLat.trim() === '') {
      return next(new AppError('Query parameter "lat" is required', 400));
    }
    if (rawLng === undefined || rawLng.trim() === '') {
      return next(new AppError('Query parameter "lng" is required', 400));
    }

    // ── Numeric parse ───────────────────────────────────────────────────────
    const lat = parseFloat(rawLat);
    const lng = parseFloat(rawLng);

    if (isNaN(lat)) {
      return next(new AppError('Query parameter "lat" must be a valid number', 400));
    }
    if (isNaN(lng)) {
      return next(new AppError('Query parameter "lng" must be a valid number', 400));
    }

    // ── Delegate to service (range validation + spatial query) ──────────────
    const facilities = await getFacilitiesByLocation(lat, lng);

    res.status(200).json(successResponse(facilities));
  } catch (err) {
    next(err);
  }
}
