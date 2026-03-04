import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

const router = Router();

/**
 * GET /health
 * Server heartbeat — includes DB connectivity status.
 */
router.get('/', healthCheck);

export default router;
