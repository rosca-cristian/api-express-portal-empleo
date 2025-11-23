import { Request, Response } from 'express';
import AppDataSource from '../config/database';
import { Job, JobStatus, JobType } from '../entities/Job';
import { Like, In, MoreThanOrEqual, LessThanOrEqual, IsNull, Not } from 'typeorm';

export class JobController {
  /**
   * Create new job posting
   * POST /api/v1/jobs
   */
  static async createJob(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;

      // Only companies can create jobs
      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can post jobs' });
        return;
      }

      const { title, description, location, jobType, salaryMin, salaryMax } = req.body;

      // Validation
      if (!title || !description || !location || !jobType) {
        res.status(400).json({ message: 'Missing required fields' });
        return;
      }

      if (!Object.values(JobType).includes(jobType)) {
        res.status(400).json({ message: 'Invalid job type' });
        return;
      }

      const jobRepository = AppDataSource.getRepository(Job);

      const job = jobRepository.create({
        companyId: userId,
        title,
        description,
        location,
        jobType,
        salaryMin,
        salaryMax,
        status: JobStatus.OPEN
      });

      const savedJob = await jobRepository.save(job);

      res.status(201).json(savedJob);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get all open jobs (public)
   * GET /api/v1/jobs
   */
  static async getJobs(req: Request, res: Response): Promise<void> {
    try {
      const { search, jobType, salaryMin, salaryMax } = req.query;

      const jobRepository = AppDataSource.getRepository(Job);
      const queryBuilder = jobRepository.createQueryBuilder('job')
        .leftJoinAndSelect('job.company', 'company')
        .where('job.status = :status', { status: JobStatus.OPEN });

      // Search filter
      if (search && typeof search === 'string') {
        queryBuilder.andWhere('LOWER(job.title) LIKE LOWER(:search)', {
          search: `%${search}%`
        });
      }

      // JobType filter
      if (jobType) {
        const types = Array.isArray(jobType) ? jobType : [jobType];
        queryBuilder.andWhere('job.jobType IN (:...types)', { types });
      }

      // Salary filters
      if (salaryMin) {
        queryBuilder.andWhere(
          '(job.salaryMax IS NULL OR job.salaryMax >= :salaryMin)',
          { salaryMin: Number(salaryMin) }
        );
      }

      if (salaryMax) {
        queryBuilder.andWhere(
          '(job.salaryMin IS NULL OR job.salaryMin <= :salaryMax)',
          { salaryMax: Number(salaryMax) }
        );
      }

      const jobs = await queryBuilder
        .orderBy('job.createdAt', 'DESC')
        .getMany();

      res.json(jobs);
    } catch (error) {
      console.error('Error getting jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get single job by ID
   * GET /api/v1/jobs/:id
   */
  static async getJobById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const jobRepository = AppDataSource.getRepository(Job);

      const job = await jobRepository.findOne({
        where: { id },
        relations: ['company']
      });

      if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      res.json(job);
    } catch (error) {
      console.error('Error getting job:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Get current company's jobs
   * GET /api/v1/jobs/my-jobs
   */
  static async getMyJobs(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const userType = (req as any).user?.userType;

      if (userType !== 'company') {
        res.status(403).json({ message: 'Only companies can access this endpoint' });
        return;
      }

      const jobRepository = AppDataSource.getRepository(Job);

      // Use query builder to include application count
      const jobs = await jobRepository
        .createQueryBuilder('job')
        .leftJoin('job.applications', 'application')
        .where('job.companyId = :userId', { userId })
        .select([
          'job.id',
          'job.title',
          'job.status',
          'job.createdAt',
          'job.updatedAt'
        ])
        .addSelect('COUNT(application.id)', 'applicationCount')
        .groupBy('job.id')
        .orderBy('job.status', 'DESC') // OPEN first
        .addOrderBy('job.createdAt', 'DESC')
        .getRawAndEntities();

      // Map application counts to job objects
      const jobsWithCounts = jobs.entities.map((job, index) => ({
        ...job,
        applicationCount: parseInt(jobs.raw[index].applicationCount) || 0
      }));

      res.json(jobsWithCounts);
    } catch (error) {
      console.error('Error getting my jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Update job
   * PUT /api/v1/jobs/:id
   */
  static async updateJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;
      const { title, description, location, jobType, salaryMin, salaryMax } = req.body;

      const jobRepository = AppDataSource.getRepository(Job);
      const job = await jobRepository.findOne({ where: { id } });

      if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      // Authorization check
      if (job.companyId !== userId) {
        res.status(403).json({ message: 'Forbidden: You can only edit your own jobs' });
        return;
      }

      // Update fields
      if (title !== undefined) job.title = title;
      if (description !== undefined) job.description = description;
      if (location !== undefined) job.location = location;
      if (jobType !== undefined) job.jobType = jobType;
      if (salaryMin !== undefined) job.salaryMin = salaryMin;
      if (salaryMax !== undefined) job.salaryMax = salaryMax;

      const updatedJob = await jobRepository.save(job);

      res.json(updatedJob);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Delete job
   * DELETE /api/v1/jobs/:id
   */
  static async deleteJob(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const jobRepository = AppDataSource.getRepository(Job);
      const job = await jobRepository.findOne({ where: { id } });

      if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      // Authorization check
      if (job.companyId !== userId) {
        res.status(403).json({ message: 'Forbidden: You can only delete your own jobs' });
        return;
      }

      await jobRepository.remove(job);

      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      console.error('Error deleting job:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * Toggle job status (open/close)
   * PUT /api/v1/jobs/:id/status
   */
  static async updateJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.userId;

      const jobRepository = AppDataSource.getRepository(Job);
      const job = await jobRepository.findOne({ where: { id } });

      if (!job) {
        res.status(404).json({ message: 'Job not found' });
        return;
      }

      // Authorization check
      if (job.companyId !== userId) {
        res.status(403).json({ message: 'Forbidden: You can only manage your own jobs' });
        return;
      }

      // Toggle status
      if (job.status === JobStatus.OPEN) {
        job.status = JobStatus.CLOSED;
        job.closedAt = new Date();
      } else {
        job.status = JobStatus.OPEN;
        job.closedAt = null;
      }

      const updatedJob = await jobRepository.save(job);

      res.json(updatedJob);
    } catch (error) {
      console.error('Error updating job status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}
