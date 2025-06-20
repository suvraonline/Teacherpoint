import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity'; // Add other entities as needed
import * as dotenv from 'dotenv';
import { UserLoginAudit } from './src/auth/entities/user-login-audit.entity'; 

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User , UserLoginAudit], // Add other entities as needed
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
