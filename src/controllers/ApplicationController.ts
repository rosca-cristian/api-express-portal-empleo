import { Request, Response } from 'express';
import { ApplicationService } from '../services/applicationService';

export class ApplicationController {
  /**
   * Create new application
   * POST /api/v1/applications
   */
  static async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;

      // Only candidates can apply to jobs
      if (userType !== 'candidate') {
        res.status(403).json({ message: 'Only candidates can apply to jobs' });
        return;
      }

      const { jobId, cvId, coverLetter } = req.body;

      // Validation
      if (!jobId) {
        res.status(400).json({ message: 'Job ID is required' });
        return;
      }

      try {
        const application = await ApplicationService.createApplication({
          candidateId: userId,
          jobId,
          cvId,
          coverLetter
        });

        res.status(201).json(application);
      } catch (error: any) {
        // Handle specific error cases
        if (error.message === 'You have already applied to this job') {
          res.status(409).json({ message: error.message });
          return;
        }

        if (error.message === 'Please upload a CV before applying') {
          res.status(400).json({ message: error.message, code: 'NO_CV' });
          return;
        }

        if (
          error.message === 'Job not found' ||
          error.message === 'CV not found or does not belong to you'
        ) {
          res.status(404).json({ message: error.message });
          return;
        }

        throw error;
      }
    } catch (error) {
      console.error('Error creating application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Check if user has already applied to a job
   * GET /api/v1/applications/check/:jobId
   */
  static async checkApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { jobId } = req.params;

      const hasApplied = await ApplicationService.hasApplied(userId, jobId);

      res.json({ hasApplied });
    } catch (error) {
      console.error('Error checking application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get candidate's application for a specific job
   * GET /api/v1/applications/job/:jobId
   */
  static async getApplicationByJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const { jobId } = req.params;

      const application = await ApplicationService.getApplicationByJobAndCandidate(
        userId,
        jobId
      );

      if (!application) {
        res.status(404).json({ message: 'Application not found' });
        return;
      }

      res.json(application);
    } catch (error) {
      console.error('Error getting application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all applications for current candidate
   * GET /api/v1/applications
   */
  static async getMyApplications(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;

      if (userType !== 'candidate') {
        res.status(403).json({ message: 'Only candidates can access this endpoint' });
        return;
      }

      const applications = await ApplicationService.getCandidateApplications(userId);

      res.json(applications);
    } catch (error) {
      console.error('Error getting applications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all applications for a specific job (company only)
   * GET /api/v1/applications/for-job/:jobId
   */
  static async getApplicationsForJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;
      const { jobId } = req.params;

      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can access this endpoint' });
        return;
      }

      // Verify that the job belongs to the company
      const result = await ApplicationService.getJobApplicationsWithAuth(jobId, userId);

      res.json(result);
    } catch (error: any) {
      if (error.message === 'Job not found') {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      if (error.message === 'You do not have permission to view these applications') {
        res.status(403).json({ message: 'You do not have permission to view these applications' });
        return;
      }

      console.error('Error getting job applications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get CV file for a specific application (company only)
   * GET /api/v1/applications/:id/cv
   * Security: Only company that owns the job can view the CV
   */
  static async getApplicationCV(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;
      const { id } = req.params;

      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can access this endpoint' });
        return;
      }

      // Get CV with authorization check
      const result = await ApplicationService.getApplicationCVWithAuth(id, userId);

      if (!result) {
        res.status(404).json({ message: 'Application or CV not found' });
        return;
      }

      // Set headers for PDF display
      res.setHeader('Content-Type', result.cv.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${result.cv.fileName}"`);
      res.sendFile(result.cv.filePath, { root: '/' });
    } catch (error: any) {
      if (error.message === 'Application not found') {
        res.status(404).json({ message: 'Application not found' });
        return;
      }

      if (error.message === 'You do not have permission to view this CV') {
        res.status(403).json({ message: 'You do not have permission to view this CV' });
        return;
      }

      if (error.message === 'CV not found for this application') {
        res.status(404).json({ message: 'CV not found for this application' });
        return;
      }

      console.error('Error getting application CV:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Accept application and schedule interview
   * POST /api/v1/applications/:id/accept
   * Security: Only company that owns the job can accept
   */
  static async acceptApplication(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;
      const { id } = req.params;
      const { interviewDate, interviewTime, location, notes } = req.body;

      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can accept applications' });
        return;
      }

      // Validation
      if (!interviewDate || !interviewTime) {
        res.status(400).json({ message: 'Interview date and time are required' });
        return;
      }

      try {
        const result = await ApplicationService.acceptApplicationWithInterview(
          id,
          userId,
          { interviewDate, interviewTime, location, notes }
        );

        res.json({
          message: 'Interview scheduled! Candidate has been notified.',
          application: result.application,
          interview: result.interview
        });
      } catch (error: any) {
        // Handle specific error cases
        if (error.message === 'Application not found') {
          res.status(404).json({ message: 'Application not found' });
          return;
        }

        if (error.message === 'You do not have permission to accept this application') {
          res.status(403).json({ message: 'You do not have permission to accept this application' });
          return;
        }

        if (error.message === 'Application has already been accepted') {
          res.status(400).json({ message: 'Application has already been accepted' });
          return;
        }

        if (error.message === 'Interview date and time are required') {
          res.status(400).json({ message: 'Interview date and time are required' });
          return;
        }

        if (error.message === 'Interview date must be in the future') {
          res.status(400).json({ message: 'Interview date must be in the future' });
          return;
        }

        if (error.message === 'This job already has an accepted candidate. Only one candidate per posting allowed in MVP.') {
          res.status(409).json({ message: error.message });
          return;
        }

        throw error;
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
