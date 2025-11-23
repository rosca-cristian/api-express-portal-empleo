import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Application } from './Application';

@Entity('cvs')
@Index(['userId', 'isActive'])
export class CV {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'file_name' })
  fileName!: string;

  @Column({ name: 'file_path' })
  filePath!: string;

  @Column({ name: 'file_size', type: 'int' })
  fileSize!: number;

  @Column({ name: 'mime_type' })
  mimeType!: string;

  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText?: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  @Index()
  isActive!: boolean;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt!: Date;

  @OneToMany(() => Application, application => application.cv)
  applications!: Application[];
}
