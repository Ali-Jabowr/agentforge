# AgentForge

> TypeScript SDK + cloud monitoring dashboard for AI agents. Ship an agent in ~50 lines, deploy it anywhere, and watch every LLM call and tool use light up in a real-time trace viewer.

**CodeReview AI** — an autonomous GitHub PR reviewer built entirely on AgentForge — is the flagship demo that proves the platform works in production.

## What it does

- `npm install @agentforge/sdk` → write an agent → run it
- Every LLM call, tool use, and reasoning step is automatically captured as a span
- Spans stream to the AgentForge dashboard where you see a full trace tree with timing, token counts, and cost
- Agents can pause for human approval mid-run and resume when approved

## Monorepo structure

```
apps/
  web/          Next.js 15 dashboard (App Router + Clerk auth)
  api/          Hono API — trace ingestion, API key management
packages/
  sdk/          @agentforge/sdk — the developer-facing package
  db/           @agentforge/db — Prisma client + schema
  core/         @agentforge/core — LLM router, agent loop, tracer
  ui/           @agentforge/ui — shared shadcn/ui components
examples/
  hello-world/  Minimal SDK example — POSTs one trace, visible in dashboard
```

## Running locally

**Prerequisites:** Node 22, pnpm 9+, a Neon (or Postgres) database, a Clerk account

```bash
# 1. Install
pnpm install

# 2. Set up env vars (copy and fill in each app)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
cp packages/db/.env.example packages/db/.env

# 3. Run DB migrations
pnpm --filter @agentforge/db db:push

# 4. Start everything
pnpm dev
```

The dashboard runs on http://localhost:3000, the API on http://localhost:3001.

## Running the hello-world example

```bash
cp examples/hello-world/.env.example examples/hello-world/.env
# Fill in AGENTFORGE_API_KEY (generate one from the dashboard)
pnpm --filter @agentforge/hello-world dev
```

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui |
| Backend API | Hono on Node 22 |
| Worker | BullMQ + Redis (Upstash) |
| Database | PostgreSQL + Prisma (Neon) |
| Auth | Clerk |
| LLMs | Anthropic SDK, OpenAI SDK, Google Gemini SDK |
| GitHub integration | Octokit + GitHub App |
| Hosting | Vercel (web + api), Fly.io (worker), Upstash (Redis) |
