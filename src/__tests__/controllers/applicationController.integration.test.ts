import 'reflect-metadata';
import request from 'supertest';
import express, { Express } from 'express';
import { ApplicationController } from '../../controllers/ApplicationController';
import { ApplicationService } from '../../services/applicationService';

// Mock the service
jest.mock('../../services/applicationService');

// Mock the auth middleware to add user to request
const mockAuthMiddleware = (_req: any, _res: any, next: any) => {
  // User will be set by the test
  next();
};

jest.mock('../../middleware/auth', () => ({
  requireAuth: jest.fn(mockAuthMiddleware),
}));

describe('ApplicationController - Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup express app
    app = express();
    app.use(express.json());

    // Mock user middleware for tests
    app.use((req: any, _res, next) => {
      // This will be overridden by individual tests if needed
      req.user = { id: 'test-user', userType: 'candidate' };
      next();
    });

    // Setup routes
    app.post('/api/v1/applications', ApplicationController.createApplication);
    app.post('/api/v1/applications/:id/accept', ApplicationController.acceptApplication);
    app.get('/api/v1/applications/check/:jobId', ApplicationController.checkApplication);
    app.get('/api/v1/applications/job/:jobId', ApplicationController.getApplicationByJob);
    app.get('/api/v1/applications', ApplicationController.getMyApplications);
    app.get('/api/v1/applications/for-job/:jobId', ApplicationController.getApplicationsForJob);
    app.get('/api/v1/applications/:id/cv', ApplicationController.getApplicationCV);
  });

  describe('POST /api/v1/applications', () => {
    it('should create application successfully', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'test-user',
        cvId: 'cv-123',
        status: 'pending',
        appliedAt: new Date(),
      };

      (ApplicationService.createApplication as jest.Mock).mockResolvedValue(mockApplication);

      const response = await request(app)
        .post('/api/v1/applications')
        .send({ jobId: 'job-123', cvId: 'cv-123' })
        .expect(201);

      expect(response.body.id).toBe('app-123');
      expect(ApplicationService.createApplication).toHaveBeenCalledWith({
        candidateId: 'test-user',
        jobId: 'job-123',
        cvId: 'cv-123',
        coverLetter: undefined,
      });
    });

    it('should return 403 if user is not a candidate', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        body: { jobId: 'job-123' },
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ApplicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only candidates can apply to jobs',
      });
    });

    it('should return 400 if jobId is missing', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        body: {},
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await ApplicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job ID is required',
      });
    });

    it('should return 409 for duplicate application', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        body: { jobId: 'job-123' },
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (ApplicationService.createApplication as jest.Mock).mockRejectedValue(
        new Error('You have already applied to this job')
      );

      await ApplicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You have already applied to this job',
      });
    });

    it('should return 400 with NO_CV code if candidate has no CV', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        body: { jobId: 'job-123' },
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (ApplicationService.createApplication as jest.Mock).mockRejectedValue(
        new Error('Please upload a CV before applying')
      );

      await ApplicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Please upload a CV before applying',
        code: 'NO_CV',
      });
    });

    it('should return 404 if job not found', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        body: { jobId: 'job-123' },
      };
      const mockRes: any = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      (ApplicationService.createApplication as jest.Mock).mockRejectedValue(
        new Error('Job not found')
      );

      await ApplicationController.createApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job not found',
      });
    });
  });

  describe('GET /api/v1/applications/check/:jobId', () => {
    it('should check if user has applied', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.hasApplied as jest.Mock).mockResolvedValue(true);

      await ApplicationController.checkApplication(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ hasApplied: true });
      expect(ApplicationService.hasApplied).toHaveBeenCalledWith(
        'candidate-123',
        'job-123'
      );
    });
  });

  describe('GET /api/v1/applications/job/:jobId', () => {
    it('should return application for specific job', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
      };

      const mockReq: any = {
        user: { id: 'candidate-123' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationByJobAndCandidate as jest.Mock).mockResolvedValue(
        mockApplication
      );

      await ApplicationController.getApplicationByJob(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockApplication);
    });

    it('should return 404 if application not found', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationByJobAndCandidate as jest.Mock).mockResolvedValue(null);

      await ApplicationController.getApplicationByJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application not found',
      });
    });
  });

  describe('GET /api/v1/applications', () => {
    it('should return all applications for candidate', async () => {
      const mockApplications = [
        { id: 'app-1', candidateId: 'candidate-123' },
        { id: 'app-2', candidateId: 'candidate-123' },
      ];

      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getCandidateApplications as jest.Mock).mockResolvedValue(
        mockApplications
      );

      await ApplicationController.getMyApplications(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
    });

    it('should return applications with interview data for accepted applications', async () => {
      const mockApplications = [
        {
          id: 'app-1',
          candidateId: 'candidate-123',
          jobId: 'job-123',
          status: 'accepted',
          appliedAt: new Date('2024-11-20'),
          job: {
            id: 'job-123',
            title: 'Software Engineer',
            company: { companyName: 'Tech Corp' },
          },
          interview: {
            id: 'interview-123',
            applicationId: 'app-1',
            interviewDate: '2024-11-25',
            interviewTime: '14:00:00',
            location: 'Office - 123 Main St',
            notes: 'Please bring your portfolio',
            createdAt: new Date('2024-11-20'),
            updatedAt: new Date('2024-11-20'),
          },
        },
        {
          id: 'app-2',
          candidateId: 'candidate-123',
          jobId: 'job-456',
          status: 'pending',
          appliedAt: new Date('2024-11-19'),
          job: {
            id: 'job-456',
            title: 'Frontend Developer',
            company: { companyName: 'Startup Inc' },
          },
          interview: undefined,
        },
      ];

      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getCandidateApplications as jest.Mock).mockResolvedValue(
        mockApplications
      );

      await ApplicationController.getMyApplications(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
      expect(ApplicationService.getCandidateApplications).toHaveBeenCalledWith('candidate-123');

      // Verify interview data is included for accepted application
      const returnedApplications = mockRes.json.mock.calls[0][0];
      const acceptedApp = returnedApplications.find((app: any) => app.status === 'accepted');
      expect(acceptedApp.interview).toBeDefined();
      expect(acceptedApp.interview.interviewDate).toBe('2024-11-25');
      expect(acceptedApp.interview.interviewTime).toBe('14:00:00');
      expect(acceptedApp.interview.location).toBe('Office - 123 Main St');
      expect(acceptedApp.interview.notes).toBe('Please bring your portfolio');

      // Verify pending application does not have interview data
      const pendingApp = returnedApplications.find((app: any) => app.status === 'pending');
      expect(pendingApp.interview).toBeUndefined();
    });

    it('should return 403 if user is not a candidate', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.getMyApplications(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only candidates can access this endpoint',
      });
    });
  });

  describe('GET /api/v1/applications/for-job/:jobId', () => {
    it('should return all applications for job (company only)', async () => {
      const mockApplications = [
        { id: 'app-1', jobId: 'job-123' },
        { id: 'app-2', jobId: 'job-123' },
      ];

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getJobApplicationsWithAuth as jest.Mock).mockResolvedValue(mockApplications);

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockApplications);
      expect(ApplicationService.getJobApplicationsWithAuth).toHaveBeenCalledWith(
        'job-123',
        'company-123'
      );
    });

    it('should return 403 if user is not a company', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only companies can access this endpoint',
      });
    });

    it('should return 403 if company does not own the job', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { jobId: 'job-456' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getJobApplicationsWithAuth as jest.Mock).mockRejectedValue(
        new Error('You do not have permission to view these applications')
      );

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You do not have permission to view these applications',
      });
    });

    it('should return 404 if job not found', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { jobId: 'non-existent-job' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getJobApplicationsWithAuth as jest.Mock).mockRejectedValue(
        new Error('Job not found')
      );

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Job not found',
      });
    });
  });

  describe('GET /api/v1/applications/:id/cv', () => {
    it('should return CV file for company that owns the job', async () => {
      const mockCV = {
        id: 'cv-123',
        fileName: 'john-doe-cv.pdf',
        filePath: '/uploads/cvs/user-123/cv-123.pdf',
        mimeType: 'application/pdf',
      };
      const mockCandidate = {
        id: 'candidate-123',
        name: 'John Doe',
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
        setHeader: jest.fn(),
        sendFile: jest.fn(),
      };

      (ApplicationService.getApplicationCVWithAuth as jest.Mock).mockResolvedValue({
        cv: mockCV,
        candidate: mockCandidate,
      });

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(ApplicationService.getApplicationCVWithAuth).toHaveBeenCalledWith(
        'app-123',
        'company-123'
      );
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockRes.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'inline; filename="john-doe-cv.pdf"'
      );
      expect(mockRes.sendFile).toHaveBeenCalledWith('/uploads/cvs/user-123/cv-123.pdf', {
        root: '/',
      });
    });

    it('should return 403 if user is not a company', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        params: { id: 'app-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only companies can access this endpoint',
      });
    });

    it('should return 403 if company does not own the job', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationCVWithAuth as jest.Mock).mockRejectedValue(
        new Error('You do not have permission to view this CV')
      );

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You do not have permission to view this CV',
      });
    });

    it('should return 404 if application not found', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'non-existent-app' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationCVWithAuth as jest.Mock).mockRejectedValue(
        new Error('Application not found')
      );

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application not found',
      });
    });

    it('should return 404 if CV not found', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationCVWithAuth as jest.Mock).mockRejectedValue(
        new Error('CV not found for this application')
      );

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'CV not found for this application',
      });
    });

    it('should return 404 if result is null', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getApplicationCVWithAuth as jest.Mock).mockResolvedValue(null);

      await ApplicationController.getApplicationCV(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application or CV not found',
      });
    });
  });

  describe('POST /api/v1/applications/:id/accept', () => {
    it('should accept application and schedule interview successfully', async () => {
      const mockApplication = {
        id: 'app-123',
        jobId: 'job-123',
        candidateId: 'candidate-123',
        status: 'accepted',
      };
      const mockInterview = {
        id: 'interview-123',
        applicationId: 'app-123',
        interviewDate: '2025-12-01',
        interviewTime: '10:00',
        location: 'Office',
        notes: 'Bring portfolio',
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
          location: 'Office',
          notes: 'Bring portfolio',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockResolvedValue({
        application: mockApplication,
        interview: mockInterview,
      });

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Interview scheduled! Candidate has been notified.',
        application: mockApplication,
        interview: mockInterview,
      });
      expect(ApplicationService.acceptApplicationWithInterview).toHaveBeenCalledWith(
        'app-123',
        'company-123',
        {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
          location: 'Office',
          notes: 'Bring portfolio',
        }
      );
    });

    it('should return 403 if user is not a company', async () => {
      const mockReq: any = {
        user: { id: 'candidate-123', userType: 'candidate' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Only companies can accept applications',
      });
    });

    it('should return 400 if interviewDate is missing', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Interview date and time are required',
      });
    });

    it('should return 400 if interviewTime is missing', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2025-12-01',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Interview date and time are required',
      });
    });

    it('should return 400 if interview date is not in the future', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2020-01-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockRejectedValue(
        new Error('Interview date must be in the future')
      );

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Interview date must be in the future',
      });
    });

    it('should return 404 if application not found', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'non-existent-app' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockRejectedValue(
        new Error('Application not found')
      );

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application not found',
      });
    });

    it('should return 403 if company does not own the job', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockRejectedValue(
        new Error('You do not have permission to accept this application')
      );

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'You do not have permission to accept this application',
      });
    });

    it('should return 400 if application is already accepted', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-123' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockRejectedValue(
        new Error('Application has already been accepted')
      );

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'Application has already been accepted',
      });
    });

    it('should return 409 if job already has an accepted candidate (MVP business rule)', async () => {
      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { id: 'app-456' },
        body: {
          interviewDate: '2025-12-01',
          interviewTime: '10:00',
        },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.acceptApplicationWithInterview as jest.Mock).mockRejectedValue(
        new Error('This job already has an accepted candidate. Only one candidate per posting allowed in MVP.')
      );

      await ApplicationController.acceptApplication(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: 'This job already has an accepted candidate. Only one candidate per posting allowed in MVP.',
      });
    });
  });

  describe('GET /api/v1/applications/for-job/:jobId - hasAcceptedCandidate flag', () => {
    it('should return hasAcceptedCandidate as true when job has accepted candidate', async () => {
      const mockResult = {
        applications: [
          { id: 'app-1', jobId: 'job-123', status: 'accepted', candidate: { name: 'John Doe' } },
          { id: 'app-2', jobId: 'job-123', status: 'pending', candidate: { name: 'Jane Smith' } },
        ],
        hasAcceptedCandidate: true,
        acceptedCandidateName: 'John Doe',
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getJobApplicationsWithAuth as jest.Mock).mockResolvedValue(mockResult);

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('hasAcceptedCandidate', true);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('acceptedCandidateName', 'John Doe');
    });

    it('should return hasAcceptedCandidate as false when job has no accepted candidate', async () => {
      const mockResult = {
        applications: [
          { id: 'app-1', jobId: 'job-123', status: 'pending' },
          { id: 'app-2', jobId: 'job-123', status: 'pending' },
        ],
        hasAcceptedCandidate: false,
        acceptedCandidateName: undefined,
      };

      const mockReq: any = {
        user: { id: 'company-123', userType: 'company' },
        params: { jobId: 'job-123' },
      };
      const mockRes: any = {
        json: jest.fn(),
        status: jest.fn().mockReturnThis(),
      };

      (ApplicationService.getJobApplicationsWithAuth as jest.Mock).mockResolvedValue(mockResult);

      await ApplicationController.getApplicationsForJob(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith(mockResult);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('hasAcceptedCandidate', false);
      expect(mockRes.json.mock.calls[0][0]).toHaveProperty('acceptedCandidateName', undefined);
    });
  });
});
