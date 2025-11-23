import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from './User';
import { Job } from './Job';
import { CV } from './CV';
import { Interview } from './Interview';

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn'
}

@Entity('applications')
@Unique(['jobId', 'candidateId']) // Prevents duplicate applications (FR20)
@Index(['candidateId', 'status'])
@Index(['jobId', 'status'])
export class Application {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'job_id', type: 'uuid' })
  @Index()
  jobId!: string;

  @ManyToOne(() => Job, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'job_id' })
  job!: Job;

  @Column({ name: 'candidate_id', type: 'uuid' })
  @Index()
  candidateId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'candidate_id' })
  candidate!: User;

  @Column({ name: 'cv_id', type: 'uuid' })
  @Index()
  cvId!: string;

  @ManyToOne(() => CV, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'cv_id' })
  cv!: CV;

  @Column({ name: 'cover_letter', type: 'text', nullable: true })
  coverLetter?: string;

  @Column({
    type: 'enum',
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  @Index()
  status!: ApplicationStatus;

  @OneToOne(() => Interview, interview => interview.application, { nullable: true })
  interview?: Interview;

  @CreateDateColumn({ name: 'applied_at' })
  appliedAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
