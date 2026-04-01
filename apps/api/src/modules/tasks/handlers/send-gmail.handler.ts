import { v4 as uuidv4 } from 'uuid';
import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';
import { GmailService } from '../../gmail/gmail.service';

export class SendGmailHandler implements TaskHandler {
  constructor(private readonly gmailService: GmailService) {}

  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const { to, subject, body } = context.config as {
        to?: string;
        subject?: string;
        body?: string;
      };

      if (!to || !subject) {
        return {
          success: false,
          data: null,
          error: 'Missing required config: to and subject',
          executionTimeMs: Date.now() - start,
        };
      }

      const connected = await this.gmailService.isConnected();

      if (!connected) {
        return {
          success: true,
          data: {
            messageId: uuidv4(),
            to,
            subject,
            body: body || '',
            sentAt: new Date().toISOString(),
            mock: true,
          },
          executionTimeMs: Date.now() - start,
        };
      }

      const result = await this.gmailService.sendEmail(to, subject, body || '');

      return {
        success: true,
        data: {
          messageId: result.messageId,
          to,
          subject,
          sentAt: new Date().toISOString(),
          mock: false,
        },
        executionTimeMs: Date.now() - start,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - start,
      };
    }
  }
}
