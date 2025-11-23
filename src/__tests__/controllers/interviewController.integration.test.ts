import 'reflect-metadata';
import { InterviewController } from '../../controllers/InterviewController';
import AppDataSource from '../../config/database';

// Mock the AppDataSource
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(),
  },
}));

// Mock the auth middleware
const mockAuthMiddleware = (_req: any, _res: any, next: any) => {
  next();
};

jest.mock('../../middleware/auth', () => ({
  requireAuth: jest.fn(mockAuthMiddleware),
}));

describe('InterviewController - Integration Tests', () => {
  let mockInterviewRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock repository
    mockInterviewRepository = {
      createQueryBuilder: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockInterviewRepository);
  });

  describe('GET /api/v1/interviews', () => {
    it('should return all interviews for company\'s jobs', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          interviewDate: '2025-11-25',
          interviewTime: '14:00:00',
          location: 'Office A',
          notes: 'Bring portfolio',
          applicationId: 'app-1',
          application: {
            id: 'app-1',
            candidate: {
              id: 'candidate-1',
              fullName: 'John Doe',
              email: 'john@example.com',
            },
            job: {
              id: 'job-1',
              title: 'Software Engineer',
            },
          },
          createdAt: new Date('2024-11-20'),
          updatedAt: new Date('2024-11-20'),
        },
        {
          id: 'interview-2',
          interviewDate: '2025-11-26',
          interviewTime: '10:00:00',
          location: 'Office B',
          notes: null,
          applicationId: 'app-2',
          application: {
            id: 'app-2',
            candidate: {
              id: 'candidate-2',
              fullName: 'Jane Smith',
              email: 'jane@example.com',
            },
            job: {
              id: 'job-2',
              title: 'Frontend Developer',
            },
          },
          createdAt: new Date('2024-11-21'),
          updatedAt: new Date('2024-11-21'),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInterviews),
      };

      mockInterviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      expect(mockInterviewRepository.createQueryBuilder).toHaveBeenCalledWith('interview');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('interview.application', 'application');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('application.job', 'job');
      expect(mockQueryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('application.candidate', 'candidate');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('job.companyId = :userId', { userId: 'company-123' });
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('interview.interviewDate', 'ASC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('interview.interviewTime', 'ASC');

      expect(mockRes.json).toHaveBeenCalledWith([
        {
          id: 'interview-1',
          interviewDate: '2025-11-25',
          interviewTime: '14:00:00',
          location: 'Office A',
          notes: 'Bring portfolio',
          applicationId: 'app-1',
          candidate: {
            id: 'candidate-1',
            name: 'John Doe',
          },
          job: {
            id: 'job-1',
            title: 'Software Engineer',
          },
          createdAt: mockInterviews[0].createdAt,
          updatedAt: mockInterviews[0].updatedAt,
        },
        {
          id: 'interview-2',
          interviewDate: '2025-11-26',
          interviewTime: '10:00:00',
          location: 'Office B',
          notes: null,
          applicationId: 'app-2',
          candidate: {
            id: 'candidate-2',
            name: 'Jane Smith',
          },
          job: {
            id: 'job-2',
            title: 'Frontend Developer',
          },
          createdAt: mockInterviews[1].createdAt,
          updatedAt: mockInterviews[1].updatedAt,
        },
      ]);
    });

    it('should return 403 if user is not a company', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only companies can access this endpoint',
      });
    });

    it('should return empty array if company has no interviews', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockInterviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 if database error occurs', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      mockInterviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should sort interviews by date and time ascending (upcoming first)', async () => {
      const mockInterviews = [
        {
          id: 'interview-1',
          interviewDate: '2025-11-25',
          interviewTime: '09:00:00',
          location: 'Office',
          notes: null,
          applicationId: 'app-1',
          application: {
            id: 'app-1',
            candidate: { id: 'c1', fullName: 'Candidate 1', email: 'c1@example.com' },
            job: { id: 'j1', title: 'Job 1' },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'interview-2',
          interviewDate: '2025-11-26',
          interviewTime: '14:00:00',
          location: 'Office',
          notes: null,
          applicationId: 'app-2',
          application: {
            id: 'app-2',
            candidate: { id: 'c2', fullName: 'Candidate 2', email: 'c2@example.com' },
            job: { id: 'j2', title: 'Job 2' },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInterviews),
      };

      mockInterviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      // Verify that orderBy and addOrderBy were called with correct parameters
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('interview.interviewDate', 'ASC');
      expect(mockQueryBuilder.addOrderBy).toHaveBeenCalledWith('interview.interviewTime', 'ASC');

      const returnedData = mockRes.json.mock.calls[0][0];
      expect(returnedData).toHaveLength(2);
      expect(returnedData[0].interviewDate).toBe('2025-11-25');
      expect(returnedData[1].interviewDate).toBe('2025-11-26');
    });

    it('should filter interviews by company\'s jobs only', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockInterviewRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const mockReq: any = {
        user: { id: 'company-specific-id', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await InterviewController.getCompanyInterviews(mockReq, mockRes);

      // Verify the WHERE clause filters by the specific company ID
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'job.companyId = :userId',
        { userId: 'company-specific-id' }
      );
    });
  });
});
