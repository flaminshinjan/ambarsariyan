import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';

export class ReadGmailHandler implements TaskHandler {
  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const emails = [
        {
          from: 'alice@example.com',
          subject: 'Project Update Q1',
          snippet: 'Here are the latest numbers from the Q1 review...',
          date: new Date().toISOString(),
        },
        {
          from: 'bob@company.com',
          subject: 'Meeting Tomorrow',
          snippet: 'Just a reminder about our sync tomorrow at 10am...',
          date: new Date().toISOString(),
        },
        {
          from: 'notifications@github.com',
          subject: 'PR Review Requested',
          snippet: 'You have been requested to review a pull request...',
          date: new Date().toISOString(),
        },
        {
          from: 'carol@startup.io',
          subject: 'Partnership Opportunity',
          snippet: 'We would love to discuss a potential collaboration...',
          date: new Date().toISOString(),
        },
        {
          from: 'newsletter@techdigest.com',
          subject: 'Weekly Tech Roundup',
          snippet: 'This week in tech: AI breakthroughs, new frameworks...',
          date: new Date().toISOString(),
        },
      ];

      return {
        success: true,
        data: { emails, count: emails.length },
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
