# Ambarsariyan

Workflow automation system for Gmail. Define tasks, chain them into pipelines, and let AI summarize your inbox.

## Stack

| Layer | Tech |
|-------|------|
| Backend | NestJS, TypeORM (SQLite), BullMQ |
| Frontend | Next.js 15, React 19, Zustand, CSS Modules |
| Queue | Redis |
| AI | Groq (Llama 3.3 70B) |
| Monitoring | Prometheus + Grafana |
| Monorepo | npm workspaces |

## Structure

```
ambarsariyan/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Types, enums, DTOs
├── docker-compose.yml
└── prometheus.yml
```

## Setup

```bash
# Clone and install
git clone https://github.com/your-username/ambarsariyan.git
cd ambarsariyan
npm install

# Environment
cp .env.example .env
# Fill in GROQ_API_KEY, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET

# Infrastructure (Redis, Prometheus, Grafana)
npm run infra:up

# Development
npm run dev
```

The API runs on `http://localhost:4000` and the frontend on `http://localhost:3000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GROQ_API_KEY` | Groq API key for LLM summarization |
| `GOOGLE_CLIENT_ID` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 client secret |
| `GOOGLE_REDIRECT_URI` | OAuth callback URL (default: `http://localhost:4000/api/auth/google/callback`) |
| `REDIS_HOST` | Redis host (default: `localhost`) |
| `REDIS_PORT` | Redis port (default: `6379`) |
| `PORT` | API server port (default: `4000`) |

## Built-in Tasks

| Task | Handler | Description |
|------|---------|-------------|
| Read Gmail | `read_gmail` | Fetches latest emails from your inbox |
| Send Gmail | `send_gmail` | Sends an email via Gmail API |
| Gmail Morning Pulse | `gmail_morning_pulse` | AI-generated daily email briefing |

## How It Works

1. **Connect Gmail** — OAuth2 flow links your Google account
2. **Create a workflow** — Chain tasks into a pipeline (e.g., Read Gmail → Morning Pulse → Send Gmail)
3. **Run it** — BullMQ picks up the job, executes tasks sequentially, passes context between steps
4. **Get your briefing** — The Morning Pulse task sends your emails to Groq's LLM, generates a structured summary, and delivers it to your inbox

## Adding Custom Tasks

Create a handler in `apps/api/src/modules/tasks/handlers/`:

```typescript
import { TaskHandler } from '../task-registry';

export const myHandler: TaskHandler = {
  name: 'my_task',
  execute: async (context) => {
    // your logic here
    return { success: true, data: { result: 'done' }, executionTimeMs: 0 };
  },
};
```

Register it in `apps/api/src/modules/tasks/task-registry.ts` and it's immediately available in the workflow builder.

## Scripts

```bash
npm run dev          # Start both API and frontend
npm run dev:api      # Start API only
npm run dev:web      # Start frontend only
npm run build        # Build everything
npm run infra:up     # Start Redis, Prometheus, Grafana
npm run infra:down   # Stop infrastructure
```

## Monitoring

- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (admin/admin)

## License

MIT
