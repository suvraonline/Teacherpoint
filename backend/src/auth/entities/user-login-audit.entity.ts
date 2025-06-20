// backend/src/auth/entities/user-login-audit.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/user.entity';

@Entity('user_login_audit')
export class UserLoginAudit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'provider', type: 'varchar' })
  provider: 'google' | 'facebook' | 'twitter' | 'linkedin' | 'local';

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken: string | null;

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent: string | null;

  @Column({ name: 'status', type: 'varchar', default: 'active' })
  status: 'active' | 'revoked';

  @CreateDateColumn({ name: 'login_time' })
  loginTime: Date;

  @Column({ name: 'logout_time', type: 'timestamp with time zone', nullable: true })
  logoutTime: Date | null;
}  
