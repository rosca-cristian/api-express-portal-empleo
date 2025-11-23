import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, Index } from 'typeorm';
import { Application } from './Application';

@Entity('interviews')
export class Interview {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'application_id', type: 'uuid', unique: true })
  @Index()
  applicationId!: string;

  @OneToOne(() => Application, application => application.interview, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application!: Application;

  @Column({ name: 'interview_date', type: 'date' })
  interviewDate!: string;

  @Column({ name: 'interview_time', type: 'time' })
  interviewTime!: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  location?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
