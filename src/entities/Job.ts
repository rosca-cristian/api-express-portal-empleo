import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Application } from './Application';

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed'
}

export enum JobType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship'
}

@Entity('jobs')
@Index(['companyId', 'status'])
@Index(['status', 'createdAt'])
export class Job {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'company_id', type: 'uuid' })
  @Index()
  companyId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company!: User;

  @Column({ length: 200 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ length: 200 })
  location!: string;

  @Column({
    type: 'enum',
    enum: JobType,
    name: 'job_type'
  })
  jobType!: JobType;

  @Column({ name: 'salary_min', type: 'int', nullable: true })
  salaryMin?: number;

  @Column({ name: 'salary_max', type: 'int', nullable: true })
  salaryMax?: number;

  @Column({
    type: 'enum',
    enum: JobStatus,
    default: JobStatus.OPEN
  })
  @Index()
  status!: JobStatus;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Application, application => application.job)
  applications!: Application[];
}
