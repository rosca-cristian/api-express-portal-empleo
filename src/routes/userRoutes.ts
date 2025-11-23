import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.get('/:id', requireAuth, UserController.getUser);
router.put('/:id', requireAuth, UserController.updateUser);

export default router;
