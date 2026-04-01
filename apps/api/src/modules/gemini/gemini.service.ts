import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly genAI: GoogleGenerativeAI | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
  }

  async summarize(content: string): Promise<string> {
    if (!this.genAI) {
      return `Morning Pulse Summary (mock):\n\nYou have several emails requiring attention. Key highlights include project updates, meeting reminders, pull request reviews, partnership opportunities, and a weekly tech newsletter. Prioritize the meeting reminder and PR review for immediate action.`;
    }

    const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are an executive assistant. Summarize the following emails into a concise morning pulse briefing. Group by priority and highlight action items.\n\n${content}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  }
}
