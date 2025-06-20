// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './users/user.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserLoginAudit } from './auth/entities/user-login-audit.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV || 'local'}`],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [User,UserLoginAudit],
        synchronize: true, // ❗ Enable only for development
      }),
    }),
    AuthModule,
  ],
  controllers: [AppController],
   providers: [AppService], 
})
export class AppModule {}
