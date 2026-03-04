import { Router } from 'express';
import { getFacilitiesByLocationHandler } from '../controllers/facilityController';

const router = Router();

/**
 * GET /api/facilities/by-location?lat=<number>&lng=<number>
 *
 * Spatial lookup: returns every academic_block feature that contains the
 * supplied WGS-84 coordinate.
 *
 * Query params:
 *   lat  — latitude  (-90 … 90)
 *   lng  — longitude (-180 … 180)
 *
 * 200 — array of facility metadata
 * 400 — missing or non-numeric / out-of-range coordinates
 * 404 — no facility contains this point
 */
router.get('/by-location', getFacilitiesByLocationHandler);

export default router;
