import AppDataSource from '../config/database';
import { Application, ApplicationStatus } from '../entities/Application';
import { CV } from '../entities/CV';
import { Job } from '../entities/Job';
import { User } from '../entities/User';
import { Interview } from '../entities/Interview';

interface CreateApplicationParams {
  candidateId: string;
  jobId: string;
  cvId?: string;
  coverLetter?: string;
}

interface ApplicationWithRelations extends Application {
  job: Job;
  candidate: User;
  cv: CV;
}

export class ApplicationService {
  /**
   * Create a new job application
   * @param params - Application creation parameters
   * @returns Created application with relations
   * @throws Error if validation fails or duplicate application
   */
  static async createApplication(params: CreateApplicationParams): Promise<ApplicationWithRelations> {
    const { candidateId, jobId, cvId, coverLetter } = params;

    const applicationRepository = AppDataSource.getRepository(Application);
    const cvRepository = AppDataSource.getRepository(CV);
    const jobRepository = AppDataSource.getRepository(Job);
    const userRepository = AppDataSource.getRepository(User);

    // Validate candidate exists and is of type 'candidate'
    const candidate = await userRepository.findOne({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (candidate.userType !== 'candidate') {
      throw new Error('Only candidates can apply to jobs');
    }

    // Validate job exists
    const job = await jobRepository.findOne({
      where: { id: jobId },
      relations: ['company']
    });

    if (!job) {
      throw new Error('Job not found');
    }

    // Check for duplicate application (jobId + candidateId unique constraint)
    const existingApplication = await applicationRepository.findOne({
      where: { jobId, candidateId }
    });

    if (existingApplication) {
      throw new Error('You have already applied to this job');
    }

    // Determine which CV to use
    let selectedCvId = cvId;

    if (!selectedCvId) {
      // Get active CV if not specified
      const activeCV = await cvRepository.findOne({
        where: { userId: candidateId, isActive: true }
      });

      if (!activeCV) {
        // No active CV, try to get any CV
        const anyCV = await cvRepository.findOne({
          where: { userId: candidateId },
          order: { uploadedAt: 'DESC' }
        });

        if (!anyCV) {
          throw new Error('Please upload a CV before applying');
        }

        selectedCvId = anyCV.id;
      } else {
        selectedCvId = activeCV.id;
      }
    } else {
      // Validate provided CV exists and belongs to candidate
      const cv = await cvRepository.findOne({
        where: { id: selectedCvId, userId: candidateId }
      });

      if (!cv) {
        throw new Error('CV not found or does not belong to you');
      }
    }

    // Create application
    const application = applicationRepository.create({
      jobId,
      candidateId,
      cvId: selectedCvId,
      coverLetter,
      status: ApplicationStatus.PENDING
    });

    const savedApplication = await applicationRepository.save(application);

    // Fetch application with all relations
    const applicationWithRelations = await applicationRepository.findOne({
      where: { id: savedApplication.id },
      relations: ['job', 'job.company', 'candidate', 'cv']
    });

    if (!applicationWithRelations) {
      throw new Error('Failed to retrieve created application');
    }

    return applicationWithRelations as ApplicationWithRelations;
  }

  /**
   * Check if a candidate has already applied to a job
   * @param candidateId - Candidate user ID
   * @param jobId - Job ID
   * @returns True if already applied, false otherwise
   */
  static async hasApplied(candidateId: string, jobId: string): Promise<boolean> {
    const applicationRepository = AppDataSource.getRepository(Application);

    const existingApplication = await applicationRepository.findOne({
      where: { jobId, candidateId }
    });

    return !!existingApplication;
  }

  /**
   * Get candidate's application for a specific job
   * @param candidateId - Candidate user ID
   * @param jobId - Job ID
   * @returns Application if exists, null otherwise
   */
  static async getApplicationByJobAndCandidate(
    candidateId: string,
    jobId: string
  ): Promise<Application | null> {
    const applicationRepository = AppDataSource.getRepository(Application);

    return await applicationRepository.findOne({
      where: { jobId, candidateId },
      relations: ['job', 'job.company', 'cv', 'interview']
    });
  }

  /**
   * Get all applications for a candidate
   * @param candidateId - Candidate user ID
   * @returns List of applications with interview details if scheduled
   */
  static async getCandidateApplications(candidateId: string): Promise<Application[]> {
    const applicationRepository = AppDataSource.getRepository(Application);

    return await applicationRepository.find({
      where: { candidateId },
      relations: ['job', 'job.company', 'cv', 'interview'],
      order: { appliedAt: 'DESC' }
    });
  }

  /**
   * Get all applications for a job
   * @param jobId - Job ID
   * @returns List of applications
   */
  static async getJobApplications(jobId: string): Promise<Application[]> {
    const applicationRepository = AppDataSource.getRepository(Application);

    return await applicationRepository.find({
      where: { jobId },
      relations: ['candidate', 'cv'],
      order: { appliedAt: 'DESC' }
    });
  }

  /**
   * Get all applications for a job with authorization check
   * Enhanced to include hasAcceptedCandidate flag and accepted candidate name
   * @param jobId - Job ID
   * @param companyId - Company user ID
   * @returns Object with applications array and accepted candidate info
   * @throws Error if job not found or company doesn't own the job
   */
  static async getJobApplicationsWithAuth(
    jobId: string,
    companyId: string
  ): Promise<{
    applications: Application[];
    hasAcceptedCandidate: boolean;
    acceptedCandidateName?: string;
  }> {
    const jobRepository = AppDataSource.getRepository(Job);
    const applicationRepository = AppDataSource.getRepository(Application);

    // Verify job exists and belongs to the company
    const job = await jobRepository.findOne({
      where: { id: jobId },
      relations: ['company']
    });

    if (!job) {
      throw new Error('Job not found');
    }

    if (job.companyId !== companyId) {
      throw new Error('You do not have permission to view these applications');
    }

    // Fetch applications with candidate and CV data
    const applications = await applicationRepository.find({
      where: { jobId },
      relations: ['candidate', 'cv'],
      order: { appliedAt: 'DESC' }
    });

    // Check if there's an accepted candidate
    const acceptedApplication = applications.find(
      app => app.status === ApplicationStatus.ACCEPTED
    );

    // Get candidate name - for candidates use fullName, for companies use companyName
    const acceptedCandidateName = acceptedApplication?.candidate
      ? (acceptedApplication.candidate.fullName || acceptedApplication.candidate.companyName)
      : undefined;

    return {
      applications,
      hasAcceptedCandidate: !!acceptedApplication,
      acceptedCandidateName
    };
  }

  /**
   * Get CV for an application with authorization check
   * @param applicationId - Application ID
   * @param companyId - Company user ID
   * @returns CV and candidate info if authorized
   * @throws Error if application not found or company doesn't own the job
   */
  static async getApplicationCVWithAuth(
    applicationId: string,
    companyId: string
  ): Promise<{ cv: CV; candidate: User } | null> {
    const applicationRepository = AppDataSource.getRepository(Application);

    // Fetch application with job, candidate, and CV relations
    const application = await applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['job', 'candidate', 'cv']
    });

    if (!application) {
      throw new Error('Application not found');
    }

    // Verify that the job belongs to the company
    if (application.job.companyId !== companyId) {
      throw new Error('You do not have permission to view this CV');
    }

    // Verify CV exists
    if (!application.cv) {
      throw new Error('CV not found for this application');
    }

    return {
      cv: application.cv,
      candidate: application.candidate
    };
  }

  /**
   * Accept application and schedule interview in a single transaction
   * @param applicationId - Application ID
   * @param companyId - Company user ID (for authorization)
   * @param interviewData - Interview scheduling data
   * @returns Accepted application with interview details
   * @throws Error if validation fails or unauthorized
   */
  static async acceptApplicationWithInterview(
    applicationId: string,
    companyId: string,
    interviewData: {
      interviewDate: string;
      interviewTime: string;
      location?: string;
      notes?: string;
    }
  ): Promise<{ application: Application; interview: Interview }> {
    const { interviewDate, interviewTime, location, notes } = interviewData;

    // Validate required fields
    if (!interviewDate || !interviewTime) {
      throw new Error('Interview date and time are required');
    }

    // Validate future date
    const interviewDateTime = new Date(`${interviewDate}T${interviewTime}`);
    const now = new Date();
    if (interviewDateTime <= now) {
      throw new Error('Interview date must be in the future');
    }

    // Use a transaction to ensure atomicity
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const applicationRepository = queryRunner.manager.getRepository(Application);
      const interviewRepository = queryRunner.manager.getRepository(Interview);

      // Fetch application with job relation
      const application = await applicationRepository.findOne({
        where: { id: applicationId },
        relations: ['job']
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Verify that the job belongs to the company
      if (application.job.companyId !== companyId) {
        throw new Error('You do not have permission to accept this application');
      }

      // Check if application is already accepted
      if (application.status === ApplicationStatus.ACCEPTED) {
        throw new Error('Application has already been accepted');
      }

      // MVP Business Rule: Check if job already has an accepted candidate
      const existingAcceptedApplication = await applicationRepository.findOne({
        where: {
          jobId: application.job.id,
          status: ApplicationStatus.ACCEPTED
        },
        relations: ['candidate']
      });

      if (existingAcceptedApplication) {
        throw new Error('This job already has an accepted candidate. Only one candidate per posting allowed in MVP.');
      }

      // Update application status to accepted
      application.status = ApplicationStatus.ACCEPTED;
      await applicationRepository.save(application);

      // Create interview record
      const interview = interviewRepository.create({
        applicationId: application.id,
        interviewDate,
        interviewTime,
        location,
        notes
      });

      const savedInterview = await interviewRepository.save(interview);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Fetch complete application with all relations including interview
      const completeApplication = await AppDataSource.getRepository(Application).findOne({
        where: { id: applicationId },
        relations: ['job', 'candidate', 'cv', 'interview']
      });

      return {
        application: completeApplication!,
        interview: savedInterview
      };
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
