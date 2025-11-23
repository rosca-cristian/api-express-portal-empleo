import { Router } from 'express';
import { CVController } from '../controllers/CVController';
import { requireAuth } from '../middleware/auth';
import { uploadCV, getUploadErrorMessage } from '../middleware/fileUpload';

const router = Router();

// All CV routes require authentication
router.use(requireAuth);

// Get active CV
router.get('/active', CVController.getActiveCV);

// Upload CV
router.post('/', uploadCV.single('cv'), (req, res, next) => {
  // Handle multer errors
  const error = (req as any).fileValidationError;
  if (error) {
    return res.status(400).json({ message: getUploadErrorMessage(error) });
  }
  next();
}, CVController.uploadCV);

// Get all CVs
router.get('/', CVController.getCVs);

// Download/view CV
router.get('/:id/download', CVController.downloadCV);

// Set active CV
router.put('/:id/set-active', CVController.setActiveCV);

// Delete CV
router.delete('/:id', CVController.deleteCV);

export default router;
