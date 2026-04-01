import { v4 as uuidv4 } from 'uuid';
import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';
import { GmailService } from '../../gmail/gmail.service';

export class SendGmailHandler implements TaskHandler {
  constructor(private readonly gmailService: GmailService) {}

  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const { to: configTo, subject, body } = context.config as {
        to?: string;
        subject?: string;
        body?: string;
      };

      const to = configTo || await this.gmailService.getConnectedEmail();

      if (!to) {
        return {
          success: false,
          data: null,
          error: 'No recipient: set "to" in task config or connect a Gmail account.',
          executionTimeMs: Date.now() - start,
        };
      }

      const emailSubject = subject || 'Ambarsariyan Morning Pulse';

      let emailBody = body || '';
      if (!emailBody && context.previousResults.length > 0) {
        const lastResult = context.previousResults[context.previousResults.length - 1];
        const data = lastResult.data as Record<string, unknown> | null;
        if (data?.summary) {
          emailBody = String(data.summary);
        } else {
          emailBody = JSON.stringify(data, null, 2);
        }
      }

      const connected = await this.gmailService.isConnected();

      if (!connected) {
        return {
          success: true,
          data: {
            messageId: uuidv4(),
            to,
            subject: emailSubject,
            body: emailBody,
            sentAt: new Date().toISOString(),
            mock: true,
          },
          executionTimeMs: Date.now() - start,
        };
      }

      const result = await this.gmailService.sendEmail(to, emailSubject, emailBody);

      return {
        success: true,
        data: {
          messageId: result.messageId,
          to,
          subject: emailSubject,
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
