import { Router } from 'express';
import { ApplicationController } from '../controllers/ApplicationController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.post('/', requireAuth, ApplicationController.createApplication);
router.post('/:id/accept', requireAuth, ApplicationController.acceptApplication);
router.get('/', requireAuth, ApplicationController.getMyApplications);
router.get('/check/:jobId', requireAuth, ApplicationController.checkApplication);
router.get('/job/:jobId', requireAuth, ApplicationController.getApplicationByJob);
router.get('/for-job/:jobId', requireAuth, ApplicationController.getApplicationsForJob);
router.get('/:id/cv', requireAuth, ApplicationController.getApplicationCV);

export default router;
