/**
 * roleContext.ts — superseded by authMiddleware.ts
 *
 * The x-role header approach has been replaced by JWT-based authentication.
 * req.role and req.user are now set by middleware/authMiddleware.ts.
 *
 * This file is kept to avoid breaking any imports during the transition.
 * It is no longer mounted in app.ts.
 */
export {};

