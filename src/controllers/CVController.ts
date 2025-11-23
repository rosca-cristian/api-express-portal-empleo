import { Request, Response } from 'express';
import AppDataSource from '../config/database';
import { CV } from '../entities/CV';
import { User } from '../entities/User';
import { extractPDFText, deleteFile } from '../utils/fileService';
import { generateProfileFromCV } from '../services/geminiService';

export class CVController {
  /**
   * Upload CV
   * POST /api/v1/cvs
   */
  static async uploadCV(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const file = req.file;

      if (!file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }

      const cvRepository = AppDataSource.getRepository(CV);

      // Check if this is the user's first CV
      const existingCVs = await cvRepository.find({ where: { userId } });
      const isFirstCV = existingCVs.length === 0;

      // Create CV record
      const cv = cvRepository.create({
        userId,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        isActive: isFirstCV // Set first CV as active by default
      });

      // Extract text from PDF if it's a PDF file
      if (file.mimetype === 'application/pdf') {
        try {
          const extractedText = await extractPDFText(file.path);
          cv.extractedText = extractedText;
        } catch (error) {
          console.error('Error extracting PDF text:', error);
          // Continue without extracted text
        }
      }

      const savedCV = await cvRepository.save(cv);

      // Generate AI profile if we have extracted text
      let generatedProfile: string | null = null;
      if (cv.extractedText && cv.extractedText.length > 100) {
        try {
          generatedProfile = await generateProfileFromCV(cv.extractedText);
        } catch (error) {
          console.error('Error generating AI profile:', error);
          // Continue without AI profile generation
        }
      }

      res.status(201).json({
        id: savedCV.id,
        fileName: savedCV.fileName,
        fileSize: savedCV.fileSize,
        mimeType: savedCV.mimeType,
        isActive: savedCV.isActive,
        uploadedAt: savedCV.uploadedAt,
        extractedText: savedCV.extractedText,
        generatedProfile: generatedProfile
      });
    } catch (error) {
      console.error('Error uploading CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all CVs for current user
   * GET /api/v1/cvs
   */
  static async getCVs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const cvRepository = AppDataSource.getRepository(CV);

      const cvs = await cvRepository.find({
        where: { userId },
        order: { uploadedAt: 'DESC' }
      });

      res.json(cvs);
    } catch (error) {
      console.error('Error getting CVs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete CV
   * DELETE /api/v1/cvs/:id
   */
  static async deleteCV(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const cvRepository = AppDataSource.getRepository(CV);
      const cv = await cvRepository.findOne({ where: { id, userId } });

      if (!cv) {
        res.status(404).json({ message: 'CV not found' });
        return;
      }

      // Delete physical file
      try {
        deleteFile(cv.filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with database deletion even if file deletion fails
      }

      // Delete database record
      await cvRepository.remove(cv);

      res.json({ message: 'CV deleted successfully' });
    } catch (error) {
      console.error('Error deleting CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Download/view CV
   * GET /api/v1/cvs/:id/download
   */
  static async downloadCV(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const cvRepository = AppDataSource.getRepository(CV);
      const cv = await cvRepository.findOne({ where: { id, userId } });

      if (!cv) {
        res.status(404).json({ message: 'CV not found' });
        return;
      }

      res.setHeader('Content-Type', cv.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${cv.fileName}"`);
      res.sendFile(cv.filePath, { root: '/' });
    } catch (error) {
      console.error('Error downloading CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Set CV as active
   * PUT /api/v1/cvs/:id/set-active
   */
  static async setActiveCV(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const cvRepository = AppDataSource.getRepository(CV);

      // Find the CV to activate
      const cv = await cvRepository.findOne({ where: { id, userId } });

      if (!cv) {
        res.status(404).json({ message: 'CV not found' });
        return;
      }

      // Use transaction to ensure atomicity
      await AppDataSource.transaction(async (transactionalEntityManager) => {
        // Set all user's CVs to inactive
        await transactionalEntityManager.update(CV, { userId }, { isActive: false });

        // Set selected CV as active
        await transactionalEntityManager.update(CV, { id }, { isActive: true });
      });

      const updatedCV = await cvRepository.findOne({ where: { id } });

      res.json(updatedCV);
    } catch (error) {
      console.error('Error setting active CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get active CV for current user
   * GET /api/v1/cvs/active
   */
  static async getActiveCV(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const cvRepository = AppDataSource.getRepository(CV);

      const activeCV = await cvRepository.findOne({
        where: { userId, isActive: true }
      });

      if (!activeCV) {
        res.status(404).json({ message: 'No active CV found' });
        return;
      }

      res.json(activeCV);
    } catch (error) {
      console.error('Error getting active CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
