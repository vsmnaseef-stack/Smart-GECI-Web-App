import { Router } from 'express';
import { loginHandler, registerHandler } from '../controllers/authController';
import { requireAuth }   from '../middleware/authMiddleware';
import { requireAdmin }  from '../middleware/roleMiddleware';

const router = Router();

/**
 * POST /api/auth/login
 *
 * Public endpoint. Returns a signed JWT on successful authentication.
 *
 * Body: { "username": string, "password": string }
 */
router.post('/login', loginHandler);

/**
 * POST /api/auth/register
 *
 * Admin-only. Creates a new user account.
 * Requires a valid JWT with role === 'admin'.
 *
 * Body: { "username": string, "password": string, "role": "authorized" | "admin" }
 */
router.post('/register', requireAuth, requireAdmin, registerHandler);

export default router;
