import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Application } from './Application';

export enum UserType {
  CANDIDATE = 'candidate',
  COMPANY = 'company',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserType,
    name: 'user_type'
  })
  userType!: UserType;

  @Column({ nullable: true, name: 'full_name' })
  fullName?: string;

  @Column({ type: 'text', nullable: true, name: 'profile_description' })
  profileDescription?: string;

  @Column({ nullable: true, name: 'company_name' })
  companyName?: string;

  @Column({ nullable: true, name: 'phone_number' })
  phoneNumber?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Application, application => application.candidate)
  applications!: Application[];
}
