import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';
import { LlmService } from '../../llm/llm.service';
import { GmailService } from '../../gmail/gmail.service';

export class GmailMorningPulseHandler implements TaskHandler {
  constructor(
    private readonly llmService: LlmService,
    private readonly gmailService: GmailService,
  ) {}

  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const connected = await this.gmailService.isConnected();

      let emails: { from: string; subject: string; snippet: string }[];

      if (connected) {
        const maxResults = (context.config.maxResults as number) || 15;
        const realEmails = await this.gmailService.getEmails(maxResults, 'newer_than:1d');
        emails = realEmails.map((e) => ({
          from: e.from,
          subject: e.subject,
          snippet: e.snippet,
        }));
      } else {
        emails = this.getMockEmails();
      }

      const emailContent = emails
        .map((e) => `From: ${e.from}\nSubject: ${e.subject}\n${e.snippet}`)
        .join('\n\n');

      let summary: string;
      try {
        summary = await this.llmService.summarize(emailContent);
      } catch {
        summary = `Morning Pulse (LLM unavailable):\n\nYou have ${emails.length} emails. Top subjects: ${emails.slice(0, 5).map((e) => e.subject).join(', ')}.`;
      }

      return {
        success: true,
        data: { emails, summary, emailCount: emails.length, mock: !connected },
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
      { from: 'alice@example.com', subject: 'Project Update Q1', snippet: 'Here are the latest numbers from the Q1 review...' },
      { from: 'bob@company.com', subject: 'Meeting Tomorrow', snippet: 'Just a reminder about our sync tomorrow at 10am...' },
      { from: 'notifications@github.com', subject: 'PR Review Requested', snippet: 'You have been requested to review a pull request...' },
      { from: 'carol@startup.io', subject: 'Partnership Opportunity', snippet: 'We would love to discuss a potential collaboration...' },
      { from: 'newsletter@techdigest.com', subject: 'Weekly Tech Roundup', snippet: 'This week in tech: AI breakthroughs, new frameworks...' },
    ];
  }
}
