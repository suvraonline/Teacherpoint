import { Controller, Get , UseGuards, Request} from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      message: 'This is a protected profile route',
      user: req.user,
    };
  }

  @Get()
  getHello(): any {
    // You may replace this with actual user data as needed
    const user = { name: 'Guest' };
    return this.appService.getProfile(user);
  }
}
