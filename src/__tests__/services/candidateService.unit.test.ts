import 'reflect-metadata';
import { CandidateService } from '../../services/candidateService';
import AppDataSource from '../../config/database';
import { Application } from '../../entities/Application';
import { User, UserType } from '../../entities/User';
import { CV } from '../../entities/CV';

// Mock the database
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(),
  },
}));

describe('CandidateService - Unit Tests', () => {
  let mockApplicationRepository: any;
  let mockUserRepository: any;
  let mockCVRepository: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockApplicationRepository = {
      createQueryBuilder: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    mockCVRepository = {
      findOne: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity: any) => {
      if (entity === Application) return mockApplicationRepository;
      if (entity === User) return mockUserRepository;
      if (entity === CV) return mockCVRepository;
      return null;
    });
  });

  describe('getCandidateProfileForCompany', () => {
    it('should return candidate profile with active CV for authorized company', async () => {
      const candidateId = 'candidate-123';
      const companyId = 'company-456';

      const mockCandidate = {
        id: candidateId,
        email: 'candidate@example.com',
        userType: UserType.CANDIDATE,
        fullName: 'John Doe',
        profileDescription: 'Experienced developer',
      };

      const mockCV = {
        id: 'cv-123',
        fileName: 'john-cv.pdf',
        fileSize: 1024000,
        uploadedAt: new Date('2024-01-15'),
        isActive: true,
        userId: candidateId,
      };

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'app-123' }),
      };

      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCVRepository.findOne.mockResolvedValue(mockCV);

      const result = await CandidateService.getCandidateProfileForCompany(
        candidateId,
        companyId
      );

      expect(result).toEqual({
        id: candidateId,
        fullName: 'John Doe',
        email: 'candidate@example.com',
        profileDescription: 'Experienced developer',
        activeCV: {
          id: 'cv-123',
          fileName: 'john-cv.pdf',
          fileSize: 1024000,
          uploadedAt: new Date('2024-01-15'),
        },
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: candidateId },
      });

      expect(mockApplicationRepository.createQueryBuilder).toHaveBeenCalledWith('application');
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith('application.job', 'job');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('application.candidateId = :candidateId', {
        candidateId,
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('job.companyId = :companyId', {
        companyId,
      });

      expect(mockCVRepository.findOne).toHaveBeenCalledWith({
        where: { userId: candidateId, isActive: true },
      });
    });

    it('should return candidate profile with null activeCV if no active CV exists', async () => {
      const candidateId = 'candidate-123';
      const companyId = 'company-456';

      const mockCandidate = {
        id: candidateId,
        email: 'candidate@example.com',
        userType: UserType.CANDIDATE,
        fullName: 'Jane Smith',
        profileDescription: null,
      };

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'app-123' }),
      };

      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCVRepository.findOne.mockResolvedValue(null);

      const result = await CandidateService.getCandidateProfileForCompany(
        candidateId,
        companyId
      );

      expect(result).toEqual({
        id: candidateId,
        fullName: 'Jane Smith',
        email: 'candidate@example.com',
        profileDescription: null,
        activeCV: null,
      });
    });

    it('should throw error if candidate not found', async () => {
      const candidateId = 'non-existent';
      const companyId = 'company-456';

      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        CandidateService.getCandidateProfileForCompany(candidateId, companyId)
      ).rejects.toThrow('Candidate not found');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: candidateId },
      });
    });

    it('should throw error if user is not a candidate', async () => {
      const userId = 'company-123';
      const companyId = 'company-456';

      const mockUser = {
        id: userId,
        email: 'company@example.com',
        userType: UserType.COMPANY,
        companyName: 'Tech Corp',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        CandidateService.getCandidateProfileForCompany(userId, companyId)
      ).rejects.toThrow('User is not a candidate');
    });

    it('should throw error if company has no applications from candidate', async () => {
      const candidateId = 'candidate-123';
      const companyId = 'company-456';

      const mockCandidate = {
        id: candidateId,
        email: 'candidate@example.com',
        userType: UserType.CANDIDATE,
        fullName: 'John Doe',
      };

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No application found
      };

      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      await expect(
        CandidateService.getCandidateProfileForCompany(candidateId, companyId)
      ).rejects.toThrow('You do not have permission to view this candidate profile');
    });

    it('should handle candidate with null fullName', async () => {
      const candidateId = 'candidate-123';
      const companyId = 'company-456';

      const mockCandidate = {
        id: candidateId,
        email: 'candidate@example.com',
        userType: UserType.CANDIDATE,
        fullName: null,
        profileDescription: 'Some description',
      };

      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 'app-123' }),
      };

      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockApplicationRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockCVRepository.findOne.mockResolvedValue(null);

      const result = await CandidateService.getCandidateProfileForCompany(
        candidateId,
        companyId
      );

      expect(result.fullName).toBeNull();
    });
  });
});
