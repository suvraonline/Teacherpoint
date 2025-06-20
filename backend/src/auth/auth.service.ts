import {
  JwtService
} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {
  RegisterDto
} from './dto/register.dto';
import {
  LoginDto
} from './dto/login.dto';
import {
  Injectable, ConflictException, UnauthorizedException, Logger
} from '@nestjs/common';
import {
  InjectRepository,
} from '@nestjs/typeorm';
import {
  Repository,
  DeepPartial
} from 'typeorm';
import {
  User
} from '../users/user.entity';
import {
  UserLoginAudit
} from './entities/user-login-audit.entity';
import {
  AuthProvider
} from 'src/common/enums/auth-provider.enum';
import axios from 'axios';
import {
  v4 as uuidv4
} from 'uuid';


@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
     private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserLoginAudit)
    private readonly auditRepo: Repository<UserLoginAudit>
  ) {}

  async register(dto: RegisterDto) {
    this.logger.log(`Attempting to register user with email: ${dto.email}`);

    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      this.logger.warn(`Registration failed. Email already registered: ${dto.email}`);
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    const userData: DeepPartial<User> = {
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role || 'student',
      emailVerified: dto.provider !== 'local',
      provider: dto.provider as AuthProvider || 'local',
      provider_id: dto.providerId || null,
    };

    const user = this.userRepo.create(userData);
    const saved = await this.userRepo.save(user);
    this.logger.log(`User registered successfully with ID: ${saved.id}`);

    if (saved.provider !== 'local') {
      const tokens = await this.generateTokens(saved);
      await this.saveLoginAudit(saved, tokens.refreshToken);

      this.logger.log(`Third-party user auto-logged in: ${saved.email}`);

      return {
        message: 'User registered and logged in via provider',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: saved.id,
          name: saved.name,
          email: saved.email,
          role: saved.role,
        },
      };
    }

    return {
      message: 'User registered successfully. Please verify your email before login.',
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        role: saved.role,
      },
    };
  }

  async login(dto: LoginDto) {
    this.logger.log(`User login attempt: ${dto.email}`);

    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) {
      this.logger.warn(`Login failed. User not found: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      this.logger.warn(`Login failed. Invalid password for: ${dto.email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.generateTokens(user);
    await this.saveLoginAudit(user, tokens.refreshToken);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      message: 'Login successful',
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async generateTokens(user: User) {
    this.logger.debug(`Generating tokens for user ID: ${user.id}`);

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    });

    return { accessToken, refreshToken };
  }

  async saveLoginAudit(user: User, refreshToken: string) {
    this.logger.debug(`Saving login audit for user: ${user.email}`);

    const hashed = await bcrypt.hash(refreshToken, 10);
    const loginRecord = this.auditRepo.create({
      user,
      refreshToken: hashed,
      loginTime: new Date(),
      provider: user.provider,
      ipAddress: null,
      userAgent: null,
      status: 'active',
    });
    await this.auditRepo.save(loginRecord);
  }

  async removeRefreshToken(userId: string) {
    this.logger.log(`Revoking refresh tokens for user ID: ${userId}`);

    await this.auditRepo.update(
      { user: { id: userId }, status: 'active' },
      { status: 'revoked', logoutTime: new Date() }
    );
  }

  async refreshTokens(userId: string, refreshToken: string) {
    this.logger.debug(`Refreshing tokens for user ID: ${userId}`);

    const latest = await this.auditRepo.findOne({
      where: { user: { id: userId }, status: 'active' },
      order: { loginTime: 'DESC' },
      relations: ['user'],
    });

    if (!latest || !latest.refreshToken)
      throw new UnauthorizedException('Session not found or expired');

    const isMatch = await bcrypt.compare(refreshToken, latest.refreshToken);
    if (!isMatch) throw new UnauthorizedException('Refresh token mismatch');

    const tokens = await this.generateTokens(latest.user);
    latest.refreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    await this.auditRepo.save(latest);

    return tokens;
  }

  getProviderAuthUrl(provider: string): string {
    const OAUTH_CONFIG = this.getOAuthConfig(); // fetch latest env values
    const config = OAUTH_CONFIG[provider];
    if (!config) throw new Error('Unsupported provider');
    const queryParams = new URLSearchParams({
      response_type: 'code',
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      access_type: 'offline',
      prompt: 'consent',
    });

    const url = `${config.authUrl}?${queryParams.toString()}`;
    this.logger.debug(`OAuth URL generated for ${provider}: ${url}`);
    return url;
  }

  async handleOAuthCallback(provider: string, code: string) {
    const OAUTH_CONFIG = this.getOAuthConfig(); // fetch latest env values
    const config = OAUTH_CONFIG[provider];
    if (!config) throw new Error('Unsupported provider');

    this.logger.log(`Handling OAuth callback for ${provider}`);

    const tokenResponse = await axios.post(
      config.tokenUrl,
      {
        code,
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const accessToken = tokenResponse.data.access_token;

    const userProfileResponse = await axios.get(config.userInfoUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const profile = userProfileResponse.data;
    const email = profile.email;

    let user = await this.userRepo.findOne({ where: { email } });

    if (!user) {
      this.logger.log(`Registering new OAuth user: ${email}`);

      const userData: DeepPartial<User> = {
        name: profile.name,
        email: profile.email,
        password: undefined,
        role: 'student',
        emailVerified: true,
        provider: provider as AuthProvider,
        provider_id: profile.sub || profile.id || uuidv4(),
      };
      const userEntity = this.userRepo.create(userData);
      const saved = await this.userRepo.save(userEntity);

      const tokens = await this.generateTokens(saved);
      await this.saveLoginAudit(saved, tokens.refreshToken);

      return {
        message: 'User registered and logged in via provider',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: saved.id,
          name: saved.name,
          email: saved.email,
          role: saved.role,
        },
      };
    } else {
      this.logger.log(`OAuth login for existing user: ${email}`);

      const tokens = await this.generateTokens(user);
      await this.saveLoginAudit(user, tokens.refreshToken);

      return {
        message: 'Login successful via provider',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      };
    }
  }

  private getOAuthConfig() {
    return {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
        tokenUrl: 'https://oauth2.googleapis.com/token',
        userInfoUrl: 'https://www.googleapis.com/oauth2/v3/userinfo',
        scope: 'openid profile email',
        authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        redirectUri: process.env.FACEBOOK_REDIRECT_URI,
        tokenUrl: 'https://graph.facebook.com/v10.0/oauth/access_token',
        userInfoUrl: 'https://graph.facebook.com/me?fields=id,name,email',
        scope: 'email public_profile',
        authUrl: 'https://www.facebook.com/v10.0/dialog/oauth',
      },
      twitter: {
        clientId: process.env.TWITTER_CLIENT_ID,
        clientSecret: process.env.TWITTER_CLIENT_SECRET,
        redirectUri: process.env.TWITTER_REDIRECT_URI,
        tokenUrl: 'https://api.twitter.com/2/oauth2/token',
        userInfoUrl: 'https://api.twitter.com/2/users/me',
        scope: 'tweet.read users.read offline.access',
        authUrl: 'https://twitter.com/i/oauth2/authorize',
      },
      linkedin: {
        clientId: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        redirectUri: process.env.LINKEDIN_REDIRECT_URI,
        tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
        userInfoUrl: 'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
        scope: 'r_liteprofile r_emailaddress',
        authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
      },
    };
  }
}
