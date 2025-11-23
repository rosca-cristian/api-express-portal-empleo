import { Request, Response } from 'express';
import { CandidateService } from '../services/candidateService';

export class CandidateController {
  /**
   * Get candidate profile (company only)
   * GET /api/v1/candidates/:id/profile
   * Security: Only companies with applications from the candidate can view the profile
   */
  static async getCandidateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;
      const { id } = req.params;

      // Only companies can access candidate profiles
      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can access candidate profiles' });
        return;
      }

      // Get candidate profile with authorization check
      const profile = await CandidateService.getCandidateProfileForCompany(id, userId);

      res.json(profile);
    } catch (error: any) {
      if (error.message === 'Candidate not found') {
        res.status(404).json({ message: 'Candidate not found' });
        return;
      }

      if (error.message === 'User is not a candidate') {
        res.status(404).json({ message: 'Candidate not found' });
        return;
      }

      if (error.message === 'You do not have permission to view this candidate profile') {
        res.status(403).json({
          message: 'You do not have permission to view this candidate profile. Only companies with applications from this candidate can view their profile.'
        });
        return;
      }

      console.error('Error getting candidate profile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
