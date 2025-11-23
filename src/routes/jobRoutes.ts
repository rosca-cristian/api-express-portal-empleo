import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public routes
router.get('/', JobController.getJobs);

// Protected routes (require authentication)
router.post('/', requireAuth, JobController.createJob);
router.get('/my-jobs', requireAuth, JobController.getMyJobs); // Must be before /:id

// Protected routes with :id param
router.put('/:id/status', requireAuth, JobController.updateJobStatus); // Must be before /:id
router.get('/:id', JobController.getJobById); // Public, no auth required
router.put('/:id', requireAuth, JobController.updateJob);
router.delete('/:id', requireAuth, JobController.deleteJob);

export default router;
