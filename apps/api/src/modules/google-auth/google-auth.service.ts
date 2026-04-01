import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { google, Auth } from 'googleapis';
import { GoogleToken } from '../../database/entities';

@Injectable()
export class GoogleAuthService {
  private oauth2Client: Auth.OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(GoogleToken)
    private readonly tokenRepo: Repository<GoogleToken>,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>(
        'GOOGLE_REDIRECT_URI',
        'http://localhost:4000/api/auth/google/callback',
      ),
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.labels',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
    });
  }

  async handleCallback(code: string): Promise<GoogleToken> {
    const { tokens } = await this.oauth2Client.getToken(code);

    this.oauth2Client.setCredentials(tokens);

    let email: string | undefined;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      email = userInfo.data.email ?? undefined;
    } catch {
      email = undefined;
    }

    const existing = await this.tokenRepo.find();
    if (existing.length > 0) {
      await this.tokenRepo.remove(existing);
    }

    const tokenEntity = this.tokenRepo.create({
      accessToken: tokens.access_token!,
      refreshToken: tokens.refresh_token!,
      scope: tokens.scope ?? '',
      expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      email,
    });

    return this.tokenRepo.save(tokenEntity);
  }

  async getAuthenticatedClient(): Promise<Auth.OAuth2Client | null> {
    const tokens = await this.tokenRepo.find({ order: { updatedAt: 'DESC' }, take: 1 });
    if (tokens.length === 0) return null;

    const token = tokens[0];
    this.oauth2Client.setCredentials({
      access_token: token.accessToken,
      refresh_token: token.refreshToken,
      expiry_date: token.expiryDate?.getTime(),
    });

    if (token.expiryDate && token.expiryDate.getTime() < Date.now()) {
      try {
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        token.accessToken = credentials.access_token!;
        if (credentials.expiry_date) {
          token.expiryDate = new Date(credentials.expiry_date);
        }
        await this.tokenRepo.save(token);
        this.oauth2Client.setCredentials(credentials);
      } catch {
        return null;
      }
    }

    return this.oauth2Client;
  }

  async getConnectionStatus(): Promise<{ connected: boolean; email?: string }> {
    const tokens = await this.tokenRepo.find({ order: { updatedAt: 'DESC' }, take: 1 });
    if (tokens.length === 0) return { connected: false };
    return { connected: true, email: tokens[0].email ?? undefined };
  }

  async disconnect(): Promise<void> {
    const tokens = await this.tokenRepo.find();
    if (tokens.length > 0) {
      try {
        await this.oauth2Client.revokeCredentials();
      } catch {
        // noop
      }
      await this.tokenRepo.remove(tokens);
    }
  }
}
