import { Controller, Get, Query, Res, Post, HttpCode } from '@nestjs/common';
import { Response } from 'express';
import { GoogleAuthService } from './google-auth.service';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get('connect')
  connect(@Res() res: Response) {
    const url = this.googleAuthService.getAuthUrl();
    res.redirect(url);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Res() res: Response) {
    await this.googleAuthService.handleCallback(code);
    res.redirect('http://localhost:3000/settings?connected=true');
  }

  @Get('status')
  getStatus() {
    return this.googleAuthService.getConnectionStatus();
  }

  @Post('disconnect')
  @HttpCode(200)
  async disconnect() {
    await this.googleAuthService.disconnect();
    return { disconnected: true };
  }
}
