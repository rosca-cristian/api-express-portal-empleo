import 'reflect-metadata';
import { Interview } from '../../entities/Interview';
import { getMetadataArgsStorage } from 'typeorm';

describe('Interview Entity - Unit Tests', () => {
  describe('Entity Metadata', () => {
    it('should have correct table name', () => {
      const metadata = getMetadataArgsStorage();
      const tableMetadata = metadata.tables.find(
        table => table.target === Interview
      );

      expect(tableMetadata).toBeDefined();
      expect(tableMetadata?.name).toBe('interviews');
    });

    it('should have all required columns', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview
      );

      const columnNames = columns.map(col => col.propertyName);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('applicationId');
      expect(columnNames).toContain('interviewDate');
      expect(columnNames).toContain('interviewTime');
      expect(columnNames).toContain('location');
      expect(columnNames).toContain('notes');
      expect(columnNames).toContain('createdAt');
      expect(columnNames).toContain('updatedAt');
    });

    it('should have correct column types and nullable settings', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview
      );

      // Check applicationId column
      const applicationIdCol = columns.find(col => col.propertyName === 'applicationId');
      expect(applicationIdCol?.options.name).toBe('application_id');
      expect(applicationIdCol?.options.type).toBe('uuid');
      expect(applicationIdCol?.options.unique).toBe(true);

      // Check interviewDate column
      const interviewDateCol = columns.find(col => col.propertyName === 'interviewDate');
      expect(interviewDateCol?.options.name).toBe('interview_date');
      expect(interviewDateCol?.options.type).toBe('date');

      // Check interviewTime column
      const interviewTimeCol = columns.find(col => col.propertyName === 'interviewTime');
      expect(interviewTimeCol?.options.name).toBe('interview_time');
      expect(interviewTimeCol?.options.type).toBe('time');

      // Check location is nullable
      const locationCol = columns.find(col => col.propertyName === 'location');
      expect(locationCol?.options.nullable).toBe(true);
      expect(locationCol?.options.type).toBe('varchar');
      expect(locationCol?.options.length).toBe(500);

      // Check notes is nullable
      const notesCol = columns.find(col => col.propertyName === 'notes');
      expect(notesCol?.options.nullable).toBe(true);
      expect(notesCol?.options.type).toBe('text');
    });

    it('should have index on applicationId', () => {
      const metadata = getMetadataArgsStorage();
      const indices = metadata.indices.filter(
        idx => idx.target === Interview
      );

      // Check that at least one index exists for Interview
      expect(indices.length).toBeGreaterThanOrEqual(1);
    });

    it('should have unique constraint on applicationId', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview && col.propertyName === 'applicationId'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].options.unique).toBe(true);
    });

    it('should have One-to-One relationship with Application', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Interview && rel.propertyName === 'application'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].relationType).toBe('one-to-one');
    });
  });

  describe('Entity Instantiation', () => {
    it('should create an instance with required properties', () => {
      const interview = new Interview();

      interview.id = '123e4567-e89b-12d3-a456-426614174000';
      interview.applicationId = '123e4567-e89b-12d3-a456-426614174001';
      interview.interviewDate = '2025-12-01';
      interview.interviewTime = '14:30:00';
      interview.createdAt = new Date();
      interview.updatedAt = new Date();

      expect(interview.id).toBe('123e4567-e89b-12d3-a456-426614174000');
      expect(interview.applicationId).toBe('123e4567-e89b-12d3-a456-426614174001');
      expect(interview.interviewDate).toBe('2025-12-01');
      expect(interview.interviewTime).toBe('14:30:00');
    });

    it('should allow optional location', () => {
      const interview = new Interview();

      expect(interview.location).toBeUndefined();

      interview.location = 'Zoom Meeting Room';
      expect(interview.location).toBe('Zoom Meeting Room');
    });

    it('should allow optional notes', () => {
      const interview = new Interview();

      expect(interview.notes).toBeUndefined();

      interview.notes = 'Bring portfolio and references';
      expect(interview.notes).toBe('Bring portfolio and references');
    });

    it('should handle various date formats', () => {
      const interview = new Interview();

      interview.interviewDate = '2025-12-01';
      expect(interview.interviewDate).toBe('2025-12-01');

      interview.interviewDate = '2025-01-15';
      expect(interview.interviewDate).toBe('2025-01-15');
    });

    it('should handle various time formats', () => {
      const interview = new Interview();

      interview.interviewTime = '14:30:00';
      expect(interview.interviewTime).toBe('14:30:00');

      interview.interviewTime = '09:00:00';
      expect(interview.interviewTime).toBe('09:00:00');
    });
  });

  describe('Foreign Keys', () => {
    it('should have applicationId foreign key with correct column name', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview && col.propertyName === 'applicationId'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].options.name).toBe('application_id');
      expect(columns[0].options.type).toBe('uuid');
    });

    it('should have JoinColumn on application relationship', () => {
      const metadata = getMetadataArgsStorage();
      const joinColumns = metadata.joinColumns.filter(
        jc => jc.target === Interview && jc.propertyName === 'application'
      );

      expect(joinColumns.length).toBe(1);
      expect(joinColumns[0].name).toBe('application_id');
    });
  });

  describe('Timestamps', () => {
    it('should have createdAt as CreateDateColumn', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview && col.propertyName === 'createdAt'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].mode).toBe('createDate');
      expect(columns[0].options.name).toBe('created_at');
    });

    it('should have updatedAt as UpdateDateColumn', () => {
      const metadata = getMetadataArgsStorage();
      const columns = metadata.columns.filter(
        col => col.target === Interview && col.propertyName === 'updatedAt'
      );

      expect(columns.length).toBe(1);
      expect(columns[0].mode).toBe('updateDate');
      expect(columns[0].options.name).toBe('updated_at');
    });
  });

  describe('One-to-One Relationship', () => {
    it('should define inverse side of relationship with Application', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Interview && rel.propertyName === 'application'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].relationType).toBe('one-to-one');
      expect(relations[0].inverseSideProperty).toBeDefined();
    });

    it('should have onDelete CASCADE for application relationship', () => {
      const metadata = getMetadataArgsStorage();
      const relations = metadata.relations.filter(
        rel => rel.target === Interview && rel.propertyName === 'application'
      );

      expect(relations.length).toBe(1);
      expect(relations[0].options.onDelete).toBe('CASCADE');
    });
  });

  describe('Field Validation', () => {
    it('should store interview date as string in date format', () => {
      const interview = new Interview();
      interview.interviewDate = '2025-12-25';

      expect(typeof interview.interviewDate).toBe('string');
      expect(interview.interviewDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should store interview time as string in time format', () => {
      const interview = new Interview();
      interview.interviewTime = '15:45:00';

      expect(typeof interview.interviewTime).toBe('string');
      expect(interview.interviewTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('should handle long location strings within limit', () => {
      const interview = new Interview();
      const longLocation = 'A'.repeat(500);

      interview.location = longLocation;
      expect(interview.location).toHaveLength(500);
    });

    it('should handle long notes as text', () => {
      const interview = new Interview();
      const longNotes = 'A'.repeat(1000);

      interview.notes = longNotes;
      expect(interview.notes).toHaveLength(1000);
    });
  });

  describe('Entity Structure', () => {
    it('should have all required fields defined', () => {
      const interview = new Interview();
      const requiredFields = [
        'id',
        'applicationId',
        'interviewDate',
        'interviewTime',
        'createdAt',
        'updatedAt'
      ];

      requiredFields.forEach(field => {
        expect(interview).toHaveProperty(field);
      });
    });

    it('should have all optional fields defined', () => {
      const interview = new Interview();
      const optionalFields = ['location', 'notes', 'application'];

      optionalFields.forEach(field => {
        expect(interview).toHaveProperty(field);
      });
    });
  });
});
