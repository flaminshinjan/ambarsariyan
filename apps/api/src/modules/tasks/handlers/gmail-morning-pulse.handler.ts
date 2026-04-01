import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';
import { GeminiService } from '../../gemini/gemini.service';

export class GmailMorningPulseHandler implements TaskHandler {
  constructor(private readonly geminiService: GeminiService) {}

  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const emails = [
        {
          from: 'alice@example.com',
          subject: 'Project Update Q1',
          snippet: 'Here are the latest numbers from the Q1 review...',
        },
        {
          from: 'bob@company.com',
          subject: 'Meeting Tomorrow',
          snippet: 'Just a reminder about our sync tomorrow at 10am...',
        },
        {
          from: 'notifications@github.com',
          subject: 'PR Review Requested',
          snippet: 'You have been requested to review a pull request...',
        },
        {
          from: 'carol@startup.io',
          subject: 'Partnership Opportunity',
          snippet: 'We would love to discuss a potential collaboration...',
        },
        {
          from: 'newsletter@techdigest.com',
          subject: 'Weekly Tech Roundup',
          snippet: 'This week in tech: AI breakthroughs, new frameworks...',
        },
      ];

      const emailContent = emails
        .map((e) => `From: ${e.from}\nSubject: ${e.subject}\n${e.snippet}`)
        .join('\n\n');

      const summary = await this.geminiService.summarize(emailContent);

      return {
        success: true,
        data: { emails, summary },
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
