// backend/src/users/user.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { AuthProvider } from '../common/enums/auth-provider.enum'; 

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true }) 
  password: string;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'varchar', nullable: true })
  emailVerificationToken: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  emailVerificationTokenExpires: Date | null;

  @Column({ type: 'varchar', nullable: true })
  phone: string | null;

  @Column({ default: false })
  phoneVerified: boolean;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  provider: AuthProvider;

  @Column({ type: 'varchar', nullable: true })
  provider_id: string | null;

  @Column({ default: 'student' }) // Default role
  role: string;

  @CreateDateColumn()
  createdAt: Date;
}