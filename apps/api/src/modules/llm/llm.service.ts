import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';

@Injectable()
export class LlmService {
  private readonly groq: Groq | null;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    this.groq = apiKey ? new Groq({ apiKey }) : null;
  }

  async summarize(content: string): Promise<string> {
    if (!this.groq) {
      return this.mockSummary(content);
    }

    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an elite executive assistant crafting a Morning Pulse email briefing. Write in a professional yet warm tone. The output will be sent as a plain-text email, so format it beautifully using plain text (dashes, line breaks, indentation — no markdown or HTML).`,
        },
        {
          role: 'user',
          content: `Today is ${today}. Based on the following emails from my inbox, write a detailed Morning Pulse briefing email.

Structure it as:
1. A warm greeting with the date
2. "AT A GLANCE" — one-line count of total emails, how many need action, how many are FYI
3. "PRIORITY ACTION ITEMS" — emails that need a response or decision, each with sender, subject, what's needed, and a suggested action
4. "AWAITING YOUR REVIEW" — items that need reading but aren't urgent
5. "FYI / NEWSLETTERS" — informational items, briefly noted
6. "SUGGESTED SCHEDULE" — a proposed order to tackle the action items with rough time estimates
7. A motivational closing line

Make it detailed, thorough, and genuinely useful. Each section should have clear spacing and visual separation using dashes or equals signs.

EMAILS:
${content}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    return completion.choices[0]?.message?.content || this.mockSummary(content);
  }

  private mockSummary(content: string): string {
    const emailCount = (content.match(/From:/g) || []).length;
    return [
      `AMBARSARIYAN MORNING PULSE`,
      `${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`,
      ``,
      `========================================`,
      `AT A GLANCE`,
      `========================================`,
      `Total emails: ${emailCount}`,
      `Groq API key not configured — showing mock summary.`,
      ``,
      `Configure GROQ_API_KEY in your .env file`,
      `to enable AI-powered email summarization.`,
    ].join('\n');
  }
}
