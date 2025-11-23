import { Router } from 'express';
import { CandidateController } from '../controllers/CandidateController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/:id/profile', requireAuth, CandidateController.getCandidateProfile);

export default router;
