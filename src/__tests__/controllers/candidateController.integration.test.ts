import 'reflect-metadata';
import express, { Express } from 'express';
import { CandidateController } from '../../controllers/CandidateController';
import { CandidateService } from '../../services/candidateService';

// Mock the service
jest.mock('../../services/candidateService');

// Mock the auth middleware to add user to request
const mockAuthMiddleware = (_req: any, _res: any, next: any) => {
  // User will be set by the test
  next();
};

jest.mock('../../middleware/auth', () => ({
  requireAuth: jest.fn(mockAuthMiddleware),
}));

describe('CandidateController - Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup express app
    app = express();
    app.use(express.json());

    // Mock user middleware for tests
    app.use((req: any, _res, next) => {
      // This will be overridden by individual tests if needed
      req.user = { id: 'test-company', userType: 'company' };
      next();
    });

    // Setup routes
    app.get('/api/v1/candidates/:id/profile', CandidateController.getCandidateProfile);
  });

  describe('GET /api/v1/candidates/:id/profile', () => {
    it('should return candidate profile for authorized company', async () => {
      const mockProfile = {
        id: 'candidate-123',
        fullName: 'John Doe',
        email: 'john@example.com',
        profileDescription: 'Experienced software developer',
        activeCV: {
          id: 'cv-123',
          fileName: 'john-cv.pdf',
          fileSize: 1024000,
          uploadedAt: new Date(),
        },
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'candidate-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockResolvedValue(mockProfile);

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      expect(CandidateService.getCandidateProfileForCompany).toHaveBeenCalledWith(
        'candidate-123',
        'company-123'
      );
    });

    it('should return 403 if user is not a company', async () => {
      const mockReq: any = {
        user: { id: 'candidate-456', userType: 'candidate' },
        params: { id: 'candidate-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only companies can access candidate profiles',
      });
    });

    it('should return 404 if candidate not found', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'non-existent-candidate' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockRejectedValue(
        new Error('Candidate not found')
      );

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate not found',
      });
    });

    it('should return 404 if user is not a candidate', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'company-456' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockRejectedValue(
        new Error('User is not a candidate')
      );

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Candidate not found',
      });
    });

    it('should return 403 if company has no applications from candidate', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'candidate-789' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockRejectedValue(
        new Error('You do not have permission to view this candidate profile')
      );

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You do not have permission to view this candidate profile. Only companies with applications from this candidate can view their profile.',
      });
    });

    it('should return 500 for unexpected errors', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'candidate-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Internal server error',
      });
    });

    it('should return profile with null activeCV if candidate has no active CV', async () => {
      const mockProfile = {
        id: 'candidate-123',
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        profileDescription: 'Marketing professional',
        activeCV: null,
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'candidate-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (CandidateService.getCandidateProfileForCompany as jest.Mock).mockResolvedValue(mockProfile);

      await CandidateController.getCandidateProfile(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockProfile);
      expect(mockProfile.activeCV).toBeNull();
    });
  });
});
