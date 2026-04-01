import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { GoogleAuthService } from '../google-auth/google-auth.service';

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  body: string;
  date: string;
  labelIds: string[];
}

@Injectable()
export class GmailService {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  private async getGmailClient() {
    const auth = await this.googleAuthService.getAuthenticatedClient();
    if (!auth) {
      throw new Error('Gmail not connected. Please connect your Google account first.');
    }
    return google.gmail({ version: 'v1', auth });
  }

  async getEmails(maxResults = 10, query = ''): Promise<GmailMessage[]> {
    const gmail = await this.getGmailClient();

    const listRes = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query || undefined,
    });

    const messages = listRes.data.messages || [];
    const emails: GmailMessage[] = [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      const getHeader = (name: string) =>
        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

      let body = '';
      const payload = detail.data.payload;
      if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
      } else if (payload?.parts) {
        const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      }

      emails.push({
        id: detail.data.id!,
        threadId: detail.data.threadId!,
        from: getHeader('From'),
        to: getHeader('To'),
        subject: getHeader('Subject'),
        snippet: detail.data.snippet || '',
        body,
        date: getHeader('Date'),
        labelIds: detail.data.labelIds || [],
      });
    }

    return emails;
  }

  async sendEmail(to: string, subject: string, body: string): Promise<{ messageId: string }> {
    const gmail = await this.getGmailClient();

    const raw = Buffer.from(
      `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`,
    ).toString('base64url');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });

    return { messageId: res.data.id! };
  }

  async isConnected(): Promise<boolean> {
    const status = await this.googleAuthService.getConnectionStatus();
    return status.connected;
  }
}
