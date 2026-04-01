import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';
import { GmailService } from '../../gmail/gmail.service';

export class ReadGmailHandler implements TaskHandler {
  constructor(private readonly gmailService: GmailService) {}

  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const maxResults = (context.config.maxResults as number) || 10;
      const query = (context.config.query as string) || '';

      const connected = await this.gmailService.isConnected();

      if (!connected) {
        return {
          success: true,
          data: {
            emails: this.getMockEmails(),
            count: 5,
            mock: true,
          },
          executionTimeMs: Date.now() - start,
        };
      }

      const emails = await this.gmailService.getEmails(maxResults, query);

      return {
        success: true,
        data: { emails, count: emails.length, mock: false },
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

  private getMockEmails() {
    return [
      { from: 'alice@example.com', subject: 'Project Update Q1', snippet: 'Here are the latest numbers from the Q1 review...', date: new Date().toISOString() },
      { from: 'bob@company.com', subject: 'Meeting Tomorrow', snippet: 'Just a reminder about our sync tomorrow at 10am...', date: new Date().toISOString() },
      { from: 'notifications@github.com', subject: 'PR Review Requested', snippet: 'You have been requested to review a pull request...', date: new Date().toISOString() },
      { from: 'carol@startup.io', subject: 'Partnership Opportunity', snippet: 'We would love to discuss a potential collaboration...', date: new Date().toISOString() },
      { from: 'newsletter@techdigest.com', subject: 'Weekly Tech Roundup', snippet: 'This week in tech: AI breakthroughs, new frameworks...', date: new Date().toISOString() },
    ];
  }
}
