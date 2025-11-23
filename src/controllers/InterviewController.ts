import { Request, Response } from 'express';
import AppDataSource from '../config/database';
import { Interview } from '../entities/Interview';

export class InterviewController {
  /**
   * Get all interviews for company's jobs
   * GET /api/v1/interviews
   */
  static async getCompanyInterviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;

      // Only companies can view their interviews
      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can access this endpoint' });
        return;
      }

      const interviewRepository = AppDataSource.getRepository(Interview);

      // Query interviews with JOIN through applications to jobs
      // Filter by company's jobs
      const interviews = await interviewRepository
        .createQueryBuilder('interview')
        .leftJoinAndSelect('interview.application', 'application')
        .leftJoinAndSelect('application.job', 'job')
        .leftJoinAndSelect('application.candidate', 'candidate')
        .where('job.companyId = :userId', { userId })
        .orderBy('interview.interviewDate', 'ASC')
        .addOrderBy('interview.interviewTime', 'ASC')
        .getMany();

      // Transform to include necessary information
      const interviewsData = interviews.map(interview => ({
        id: interview.id,
        interviewDate: interview.interviewDate,
        interviewTime: interview.interviewTime,
        location: interview.location,
        notes: interview.notes,
        applicationId: interview.applicationId,
        candidate: {
          id: interview.application.candidate.id,
          name: interview.application.candidate.fullName || interview.application.candidate.email
        },
        job: {
          id: interview.application.job.id,
          title: interview.application.job.title
        },
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt
      }));

      res.json(interviewsData);
    } catch (error) {
      console.error('Error getting company interviews:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
