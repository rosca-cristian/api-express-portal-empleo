import 'reflect-metadata';
import { ApplicationService } from '../../services/applicationService';
import AppDataSource from '../../config/database';
import { Application, ApplicationStatus } from '../../entities/Application';
import { CV } from '../../entities/CV';
import { Job, JobStatus } from '../../entities/Job';
import { User } from '../../entities/User';

// Mock the database
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    getRepository: jest.fn(),
  },
}));

describe('ApplicationService - Unit Tests', () => {
  let mockApplicationRepository: any;
  let mockCVRepository: any;
  let mockJobRepository: any;
  let mockUserRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock repositories
    mockApplicationRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    mockCVRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
    };

    mockJobRepository = {
      findOne: jest.fn(),
    };

    mockUserRepository = {
      findOne: jest.fn(),
    };

    // Setup getRepository mock
    (AppDataSource.getRepository as jest.Mock).mockImplementation((entity) => {
      if (entity === Application) return mockApplicationRepository;
      if (entity === CV) return mockCVRepository;
      if (entity === Job) return mockJobRepository;
      if (entity === User) return mockUserRepository;
      return null;
    });
  });

  describe('createApplication', () => {
    const mockCandidateId = 'candidate-123';
    const mockJobId = 'job-123';
    const mockCvId = 'cv-123';

    const mockCandidate = {
      id: mockCandidateId,
      email: 'candidate@test.com',
      userType: 'candidate',
    };

    const mockJob = {
      id: mockJobId,
      title: 'Software Engineer',
      status: JobStatus.OPEN,
      company: {
        id: 'company-123',
        companyName: 'Test Company',
      },
    };

    const mockCV = {
      id: mockCvId,
      userId: mockCandidateId,
      fileName: 'resume.pdf',
      isActive: true,
    };

    it('should create application successfully with provided CV', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue(null); // No duplicate
      mockCVRepository.findOne.mockResolvedValue(mockCV);

      const mockCreatedApp = {
        id: 'app-123',
        jobId: mockJobId,
        candidateId: mockCandidateId,
        cvId: mockCvId,
        status: ApplicationStatus.PENDING,
      };

      mockApplicationRepository.create.mockReturnValue(mockCreatedApp);
      mockApplicationRepository.save.mockResolvedValue(mockCreatedApp);
      mockApplicationRepository.findOne.mockResolvedValueOnce(null) // Duplicate check
        .mockResolvedValueOnce({
          ...mockCreatedApp,
          job: mockJob,
          candidate: mockCandidate,
          cv: mockCV,
        });

      const result = await ApplicationService.createApplication({
        candidateId: mockCandidateId,
        jobId: mockJobId,
        cvId: mockCvId,
      });

      expect(result.id).toBe('app-123');
      expect(result.status).toBe(ApplicationStatus.PENDING);
      expect(mockApplicationRepository.save).toHaveBeenCalled();
    });

    it('should use active CV when cvId not provided', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue(null);
      mockCVRepository.findOne.mockResolvedValue(mockCV);

      const mockCreatedApp = {
        id: 'app-123',
        jobId: mockJobId,
        candidateId: mockCandidateId,
        cvId: mockCvId,
        status: ApplicationStatus.PENDING,
      };

      mockApplicationRepository.create.mockReturnValue(mockCreatedApp);
      mockApplicationRepository.save.mockResolvedValue(mockCreatedApp);
      mockApplicationRepository.findOne.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...mockCreatedApp,
          job: mockJob,
          candidate: mockCandidate,
          cv: mockCV,
        });

      await ApplicationService.createApplication({
        candidateId: mockCandidateId,
        jobId: mockJobId,
      });

      expect(mockCVRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockCandidateId, isActive: true },
      });
    });

    it('should throw error if candidate not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
          cvId: mockCvId,
        })
      ).rejects.toThrow('Candidate not found');
    });

    it('should throw error if user is not a candidate', async () => {
      mockUserRepository.findOne.mockResolvedValue({
        ...mockCandidate,
        userType: 'company',
      });

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
          cvId: mockCvId,
        })
      ).rejects.toThrow('Only candidates can apply to jobs');
    });

    it('should throw error if job not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
          cvId: mockCvId,
        })
      ).rejects.toThrow('Job not found');
    });

    it('should throw error for duplicate application', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 'existing-app',
        jobId: mockJobId,
        candidateId: mockCandidateId,
      });

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
          cvId: mockCvId,
        })
      ).rejects.toThrow('You have already applied to this job');
    });

    it('should throw error if no CV exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue(null);
      mockCVRepository.findOne.mockResolvedValue(null);
      mockCVRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
        })
      ).rejects.toThrow('Please upload a CV before applying');
    });

    it('should throw error if CV does not belong to candidate', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue(null);
      mockCVRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.createApplication({
          candidateId: mockCandidateId,
          jobId: mockJobId,
          cvId: mockCvId,
        })
      ).rejects.toThrow('CV not found or does not belong to you');
    });

    it('should include coverLetter in application', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockCandidate);
      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.findOne.mockResolvedValue(null);
      mockCVRepository.findOne.mockResolvedValue(mockCV);

      const coverLetter = 'I am very interested in this position';
      const mockCreatedApp = {
        id: 'app-123',
        jobId: mockJobId,
        candidateId: mockCandidateId,
        cvId: mockCvId,
        coverLetter,
        status: ApplicationStatus.PENDING,
      };

      mockApplicationRepository.create.mockReturnValue(mockCreatedApp);
      mockApplicationRepository.save.mockResolvedValue(mockCreatedApp);
      mockApplicationRepository.findOne.mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          ...mockCreatedApp,
          job: mockJob,
          candidate: mockCandidate,
          cv: mockCV,
        });

      await ApplicationService.createApplication({
        candidateId: mockCandidateId,
        jobId: mockJobId,
        cvId: mockCvId,
        coverLetter,
      });

      expect(mockApplicationRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ coverLetter })
      );
    });
  });

  describe('hasApplied', () => {
    it('should return true if application exists', async () => {
      mockApplicationRepository.findOne.mockResolvedValue({
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
      });

      const result = await ApplicationService.hasApplied('candidate-123', 'job-123');

      expect(result).toBe(true);
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { jobId: 'job-123', candidateId: 'candidate-123' },
      });
    });

    it('should return false if application does not exist', async () => {
      mockApplicationRepository.findOne.mockResolvedValue(null);

      const result = await ApplicationService.hasApplied('candidate-123', 'job-123');

      expect(result).toBe(false);
    });
  });

  describe('getApplicationByJobAndCandidate', () => {
    it('should return application with relations including interview', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        job: { title: 'Software Engineer' },
        cv: { fileName: 'resume.pdf' },
        interview: null,
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      const result = await ApplicationService.getApplicationByJobAndCandidate(
        'candidate-123',
        'job-123'
      );

      expect(result).toEqual(mockApplication);
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { jobId: 'job-123', candidateId: 'candidate-123' },
        relations: ['job', 'job.company', 'cv', 'interview'],
      });
    });

    it('should return application with interview data when it exists', async () => {
      const mockInterview = {
        id: 'interview-123',
        applicationId: 'app-123',
        interviewDate: '2025-11-25',
        interviewTime: '14:00:00',
        location: 'Conference Room A',
        notes: 'Bring portfolio',
      };

      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        job: { title: 'Software Engineer' },
        cv: { fileName: 'resume.pdf' },
        interview: mockInterview,
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      const result = await ApplicationService.getApplicationByJobAndCandidate(
        'candidate-123',
        'job-123'
      );

      expect(result).toEqual(mockApplication);
      expect(result?.interview).toEqual(mockInterview);
    });

    it('should return null if application not found', async () => {
      mockApplicationRepository.findOne.mockResolvedValue(null);

      const result = await ApplicationService.getApplicationByJobAndCandidate(
        'candidate-123',
        'job-123'
      );

      expect(result).toBeNull();
    });
  });

  describe('getCandidateApplications', () => {
    it('should return all applications for candidate with interview relation', async () => {
      const mockApplications = [
        { id: 'app-1', candidateId: 'candidate-123', interview: null },
        { id: 'app-2', candidateId: 'candidate-123', interview: null },
      ];

      mockApplicationRepository.find.mockResolvedValue(mockApplications);

      const result = await ApplicationService.getCandidateApplications('candidate-123');

      expect(result).toEqual(mockApplications);
      expect(mockApplicationRepository.find).toHaveBeenCalledWith({
        where: { candidateId: 'candidate-123' },
        relations: ['job', 'job.company', 'cv', 'interview'],
        order: { appliedAt: 'DESC' },
      });
    });

    it('should include interview data when scheduled', async () => {
      const mockInterview = {
        id: 'interview-123',
        applicationId: 'app-1',
        interviewDate: '2025-11-25',
        interviewTime: '14:00:00',
        location: 'Office',
        notes: 'Technical interview',
      };

      const mockApplications = [
        {
          id: 'app-1',
          candidateId: 'candidate-123',
          status: 'accepted',
          interview: mockInterview
        },
        {
          id: 'app-2',
          candidateId: 'candidate-123',
          status: 'pending',
          interview: null
        },
      ];

      mockApplicationRepository.find.mockResolvedValue(mockApplications);

      const result = await ApplicationService.getCandidateApplications('candidate-123');

      expect(result).toEqual(mockApplications);
      expect(result[0].interview).toEqual(mockInterview);
      expect(result[1].interview).toBeNull();
    });
  });

  describe('getJobApplications', () => {
    it('should return all applications for job', async () => {
      const mockApplications = [
        { id: 'app-1', jobId: 'job-123' },
        { id: 'app-2', jobId: 'job-123' },
      ];

      mockApplicationRepository.find.mockResolvedValue(mockApplications);

      const result = await ApplicationService.getJobApplications('job-123');

      expect(result).toEqual(mockApplications);
      expect(mockApplicationRepository.find).toHaveBeenCalledWith({
        where: { jobId: 'job-123' },
        relations: ['candidate', 'cv'],
        order: { appliedAt: 'DESC' },
      });
    });
  });

  describe('getJobApplicationsWithAuth', () => {
    it('should return applications when company owns the job', async () => {
      const mockJob = {
        id: 'job-123',
        companyId: 'company-123',
        title: 'Software Engineer',
      };

      const mockApplications = [
        { id: 'app-1', jobId: 'job-123', candidateId: 'candidate-1', status: 'pending' },
        { id: 'app-2', jobId: 'job-123', candidateId: 'candidate-2', status: 'pending' },
      ];

      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.find.mockResolvedValue(mockApplications);

      const result = await ApplicationService.getJobApplicationsWithAuth('job-123', 'company-123');

      expect(result).toEqual({
        applications: mockApplications,
        hasAcceptedCandidate: false,
        acceptedCandidateName: undefined,
      });
      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-123' },
        relations: ['company'],
      });
      expect(mockApplicationRepository.find).toHaveBeenCalledWith({
        where: { jobId: 'job-123' },
        relations: ['candidate', 'cv'],
        order: { appliedAt: 'DESC' },
      });
    });

    it('should throw error if job not found', async () => {
      mockJobRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.getJobApplicationsWithAuth('non-existent-job', 'company-123')
      ).rejects.toThrow('Job not found');

      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-job' },
        relations: ['company'],
      });
      expect(mockApplicationRepository.find).not.toHaveBeenCalled();
    });

    it('should throw error if company does not own the job', async () => {
      const mockJob = {
        id: 'job-123',
        companyId: 'company-456',
        title: 'Software Engineer',
      };

      mockJobRepository.findOne.mockResolvedValue(mockJob);

      await expect(
        ApplicationService.getJobApplicationsWithAuth('job-123', 'company-123')
      ).rejects.toThrow('You do not have permission to view these applications');

      expect(mockJobRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'job-123' },
        relations: ['company'],
      });
      expect(mockApplicationRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty array if job has no applications', async () => {
      const mockJob = {
        id: 'job-123',
        companyId: 'company-123',
        title: 'Software Engineer',
      };

      mockJobRepository.findOne.mockResolvedValue(mockJob);
      mockApplicationRepository.find.mockResolvedValue([]);

      const result = await ApplicationService.getJobApplicationsWithAuth('job-123', 'company-123');

      expect(result).toEqual({
        applications: [],
        hasAcceptedCandidate: false,
        acceptedCandidateName: undefined,
      });
      expect(mockApplicationRepository.find).toHaveBeenCalled();
    });
  });

  describe('getApplicationCVWithAuth', () => {
    it('should return CV and candidate when company owns the job', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        cvId: 'cv-123',
        job: {
          id: 'job-123',
          companyId: 'company-123',
          title: 'Software Engineer',
        },
        candidate: {
          id: 'candidate-123',
          name: 'John Doe',
          email: 'john@example.com',
        },
        cv: {
          id: 'cv-123',
          fileName: 'john-doe-cv.pdf',
          filePath: '/uploads/cvs/candidate-123/cv-123.pdf',
          mimeType: 'application/pdf',
          userId: 'candidate-123',
        },
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      const result = await ApplicationService.getApplicationCVWithAuth('app-123', 'company-123');

      expect(result).toEqual({
        cv: mockApplication.cv,
        candidate: mockApplication.candidate,
      });
      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'app-123' },
        relations: ['job', 'candidate', 'cv'],
      });
    });

    it('should throw error if application not found', async () => {
      mockApplicationRepository.findOne.mockResolvedValue(null);

      await expect(
        ApplicationService.getApplicationCVWithAuth('non-existent-app', 'company-123')
      ).rejects.toThrow('Application not found');

      expect(mockApplicationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'non-existent-app' },
        relations: ['job', 'candidate', 'cv'],
      });
    });

    it('should throw error if company does not own the job', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        cvId: 'cv-123',
        job: {
          id: 'job-123',
          companyId: 'different-company-456',
          title: 'Software Engineer',
        },
        candidate: {
          id: 'candidate-123',
          name: 'John Doe',
        },
        cv: {
          id: 'cv-123',
          fileName: 'john-doe-cv.pdf',
        },
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      await expect(
        ApplicationService.getApplicationCVWithAuth('app-123', 'company-123')
      ).rejects.toThrow('You do not have permission to view this CV');
    });

    it('should throw error if CV not found for application', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        cvId: 'cv-123',
        job: {
          id: 'job-123',
          companyId: 'company-123',
          title: 'Software Engineer',
        },
        candidate: {
          id: 'candidate-123',
          name: 'John Doe',
        },
        cv: null, // CV not found
      };

      mockApplicationRepository.findOne.mockResolvedValue(mockApplication);

      await expect(
        ApplicationService.getApplicationCVWithAuth('app-123', 'company-123')
      ).rejects.toThrow('CV not found for this application');
    });
  });
});
