import { Router } from 'express';
import { InterviewController } from '../controllers/InterviewController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.get('/', requireAuth, InterviewController.getCompanyInterviews);

export default router;
