import AppDataSource from '../config/database';
import { Application } from '../entities/Application';
import { User } from '../entities/User';
import { CV } from '../entities/CV';

interface CandidateProfileResponse {
  id: string;
  fullName: string | null;
  email: string;
  profileDescription: string | null;
  activeCV: {
    id: string;
    fileName: string;
    fileSize: number;
    uploadedAt: Date;
  } | null;
}

export class CandidateService {
  /**
   * Get candidate profile with authorization check
   * Only companies with applications from the candidate can view the profile
   * @param candidateId - Candidate user ID
   * @param companyId - Company user ID requesting the profile
   * @returns Candidate profile data with active CV
   * @throws Error if unauthorized or candidate not found
   */
  static async getCandidateProfileForCompany(
    candidateId: string,
    companyId: string
  ): Promise<CandidateProfileResponse> {
    const applicationRepository = AppDataSource.getRepository(Application);
    const userRepository = AppDataSource.getRepository(User);
    const cvRepository = AppDataSource.getRepository(CV);

    // Verify candidate exists and is of type 'candidate'
    const candidate = await userRepository.findOne({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    if (candidate.userType !== 'candidate') {
      throw new Error('User is not a candidate');
    }

    // Authorization check: Verify company has at least one application from this candidate
    // to one of their jobs
    const application = await applicationRepository
      .createQueryBuilder('application')
      .innerJoin('application.job', 'job')
      .where('application.candidateId = :candidateId', { candidateId })
      .andWhere('job.companyId = :companyId', { companyId })
      .getOne();

    if (!application) {
      throw new Error('You do not have permission to view this candidate profile');
    }

    // Get active CV
    const activeCV = await cvRepository.findOne({
      where: { userId: candidateId, isActive: true }
    });

    return {
      id: candidate.id,
      fullName: candidate.fullName || null,
      email: candidate.email,
      profileDescription: candidate.profileDescription || null,
      activeCV: activeCV ? {
        id: activeCV.id,
        fileName: activeCV.fileName,
        fileSize: activeCV.fileSize,
        uploadedAt: activeCV.uploadedAt
      } : null
    };
  }
}
