import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // Local Registration
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`Registering user with email: ${dto.email}`);
    return this.authService.register(dto);
  }

  // Local Login
  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.logger.log(`Login attempt for user: ${dto.email}`);
    return this.authService.login(dto);
  }

  // Refresh Token
  @Post('refresh')
  async refresh(@Body('userId') userId: string, @Body('refreshToken') refreshToken: string) {
    this.logger.log(`Refreshing token for user ID: ${userId}`);
    return this.authService.refreshTokens(userId, refreshToken);
  }

  // Logout (Revoke Refresh Token)
  @Post('logout')
  async logout(@Body('userId') userId: string) {
    this.logger.log(`Logout request for user ID: ${userId}`);
    await this.authService.removeRefreshToken(userId);
    return { message: 'Logout successful' };
  }

  // OAuth Redirect URL Generator
  @Get('oauth/:provider')
  async redirectToProvider(@Param('provider') provider: string, @Res() res: Response) {
    this.logger.log(`Redirecting to OAuth provider: ${provider}`);
    const url = this.authService.getProviderAuthUrl(provider);
    return res.redirect(url);
  }

  // OAuth Callback Handler (called by provider)
  @Get('oauth/:provider/callback')
  async handleOAuthCallback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Res() res: Response
  ) {
    this.logger.log(`Handling OAuth callback from provider: ${provider}`);
    const result = await this.authService.handleOAuthCallback(provider, code);

    // 🔁 Redirect to frontend with access/refresh tokens (mock example)
    const redirectFrontendUrl = `${process.env.FRONTEND_REDIRECT_URI}?accessToken=${result.accessToken}&refreshToken=${result.refreshToken}`;
    return res.redirect(redirectFrontendUrl);
  }
}
