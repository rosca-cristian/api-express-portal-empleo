import 'reflect-metadata';
import { Application, ApplicationStatus } from '../../entities/Application';
import { getMetadataArgsStorage } from 'typeorm';

describe('Application Entity - Unit Tests', () => {
  describe('Entity Metadata', () => {
    it('should have correct table name', () => {
      const metadata = getMetadataArgsStorage();
      const tableMetadata = metadata.tables.find(
        table => table.target === Application
      );

      expect(tableMetadata).toBeDefined();
      expect(tableMetadata?.name).toBe('applications');
    });

    it('should have all required columns', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application
      );

      const columnNames = columns.map(col => col.propertyName);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('jobId');
      expect(columnNames).toContain('candidateId');
      expect(columnNames).toContain('cvId');
      expect(columnNames).toContain('coverLetter');
      expect(columnNames).toContain('status');
      expect(columnNames).toContain('appliedAt');
      expect(columnNames).toContain('updatedAt');
    });

    it('should have correct column types and nullable settings', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application
      );

      // Check coverLetter is nullable
      const coverLetterCol = columns.find(col => col.propertyName === 'coverLetter');
      expect(coverLetterCol?.options.nullable).toBe(true);
      expect(coverLetterCol?.options.type).toBe('text');

      // Check status column
      const statusCol = columns.find(col => col.propertyName === 'status');
      expect(statusCol?.options.type).toBe('enum');
      expect(statusCol?.options.enum).toBe(ApplicationStatus);
      expect(statusCol?.options.default).toBe(ApplicationStatus.PENDING);
    });

    it('should have correct indexes defined', () => {
      const metadata = getMetadataArgsStorage();
      const indices = metadata.indices.filter(
        idx => idx.target === Application
      );

      // Should have composite indexes
      const compositeIndices = indices.filter(idx => Array.isArray(idx.columns));
      expect(compositeIndices.length).toBeGreaterThanOrEqual(2);

      // Check for candidateId + status index
      const candidateStatusIndex = compositeIndices.find(
        idx => JSON.stringify(idx.columns) === JSON.stringify(['candidateId', 'status'])
      );
      expect(candidateStatusIndex).toBeDefined();

      // Check for jobId + status index
      const jobStatusIndex = compositeIndices.find(
        idx => JSON.stringify(idx.columns) === JSON.stringify(['jobId', 'status'])
      );
      expect(jobStatusIndex).toBeDefined();
    });

    it('should have unique constraint on jobId and candidateId', () => {
      const metadata = getMetadataArgsStorage();
      const uniques = metadata.uniques.filter(
        unique => unique.target === Application
      );

      const jobCandidateUnique = uniques.find(
        unique => JSON.stringify(unique.columns) === JSON.stringify(['jobId', 'candidateId'])
      );

      expect(jobCandidateUnique).toBeDefined();
    });

    it('should have Many-to-One relationship with Job', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Application && rel.propertyName === 'job'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].relationType).toBe('many-to-one');
    });

    it('should have Many-to-One relationship with User (candidate)', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Application && rel.propertyName === 'candidate'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].relationType).toBe('many-to-one');
    });

    it('should have Many-to-One relationship with CV', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Application && rel.propertyName === 'cv'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].relationType).toBe('many-to-one');
    });
  });

  describe('ApplicationStatus Enum', () => {
    it('should have all required status values', () => {
      expect(ApplicationStatus.PENDING).toBe('pending');
      expect(ApplicationStatus.REVIEWED).toBe('reviewed');
      expect(ApplicationStatus.ACCEPTED).toBe('accepted');
      expect(ApplicationStatus.REJECTED).toBe('rejected');
      expect(ApplicationStatus.WITHDRAWN).toBe('withdrawn');
    });

    it('should have exactly 5 status values', () => {
      const statusValues = Object.values(ApplicationStatus);
      expect(statusValues).toHaveLength(5);
    });
  });

  describe('Entity Instantiation', () => {
    it('should create an instance with required properties', () => {
      const application = new Application();

      application.id = '123e4567-e89b-12d3-a456-426614174000';
      application.jobId = '123e4567-e89b-12d3-a456-426614174001';
      application.candidateId = '123e4567-e89b-12d3-a456-426614174002';
      application.cvId = '123e4567-e89b-12d3-a456-426614174003';
      application.status = ApplicationStatus.PENDING;
      application.appliedAt = new Date();
      application.updatedAt = new Date();

      expect(application.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(application.jobId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(application.candidateId).toBe('123e4567-e89b-12d3-a456-426614174002');
      expect(application.cvId).toBe('123e4567-e89b-12d3-a456-426614174003');
      expect(application.status).toBe(ApplicationStatus.PENDING);
    });

    it('should allow optional coverLetter', () => {
      const application = new Application();

      expect(application.coverLetter).toBeUndefined();

      application.coverLetter = 'I am very interested in this position';
      expect(application.coverLetter).toBe('I am very interested in this position');
    });

    it('should accept all valid status values', () => {
      const application = new Application();

      application.status = ApplicationStatus.PENDING;
      expect(application.status).toBe(ApplicationStatus.PENDING);

      application.status = ApplicationStatus.REVIEWED;
      expect(application.status).toBe(ApplicationStatus.REVIEWED);

      application.status = ApplicationStatus.ACCEPTED;
      expect(application.status).toBe(ApplicationStatus.ACCEPTED);

      application.status = ApplicationStatus.REJECTED;
      expect(application.status).toBe(ApplicationStatus.REJECTED);

      application.status = ApplicationStatus.WITHDRAWN;
      expect(application.status).toBe(ApplicationStatus.WITHDRAWN);
    });
  });

  describe('Foreign Keys', () => {
    it('should have jobId foreign key with correct column name', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application && col.propertyName === 'jobId'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].options.name).toBe('job_id');
      expect(columns[0].options.type).toBe('uuid');
    });

    it('should have candidateId foreign key with correct column name', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application && col.propertyName === 'candidateId'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].options.name).toBe('candidate_id');
      expect(columns[0].options.type).toBe('uuid');
    });

    it('should have cvId foreign key with correct column name', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application && col.propertyName === 'cvId'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].options.name).toBe('cv_id');
      expect(columns[0].options.type).toBe('uuid');
    });
  });

  describe('Timestamps', () => {
    it('should have appliedAt as CreateDateColumn', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application && col.propertyName === 'appliedAt'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].mode).toBe('createDate');
      expect(columns[0].options.name).toBe('applied_at');
    });

    it('should have updatedAt as UpdateDateColumn', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Application && col.propertyName === 'updatedAt'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].mode).toBe('updateDate');
      expect(columns[0].options.name).toBe('updated_at');
    });
  });
});
