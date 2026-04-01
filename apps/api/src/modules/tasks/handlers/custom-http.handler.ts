import { TaskHandler, TaskExecutionContext, TaskResult } from '../task-registry';

export class CustomHttpHandler implements TaskHandler {
  async execute(context: TaskExecutionContext): Promise<TaskResult> {
    const start = Date.now();

    try {
      const {
        url,
        method = 'GET',
        headers = {},
        body,
      } = context.config as {
        url?: string;
        method?: string;
        headers?: Record<string, string>;
        body?: unknown;
      };

      if (!url) {
        return {
          success: false,
          data: null,
          error: 'Missing required config: url',
          executionTimeMs: Date.now() - start,
        };
      }

      const fetchOptions: { method: string; headers: Record<string, string>; body?: string } = {
        method,
        headers: headers as Record<string, string>,
      };

      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      return {
        success: response.ok,
        data: {
          status: response.status,
          statusText: response.statusText,
          body: data,
        },
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
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
