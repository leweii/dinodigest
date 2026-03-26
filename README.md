# DinoDigest

Paste a blog URL, let the dinosaur digest it into knowledge you can absorb.

DinoDigest is an AI-powered knowledge digestion tool. It extracts articles from URLs and runs them through parallel AI "digestive enzyme" modules (powered by Google Gemini 2.0 Flash), producing summaries, key concepts, mind maps, vocabulary flashcards, and comprehension quizzes -- all in Chinese, designed for Chinese students reading English technical articles.

## Architecture

```
User pastes URL ──> Next.js API ──> PostgreSQL (article record)
                                  ──> BullMQ/Redis (job queue)
                                          │
                                          v
                                    Worker picks up job
                                          │
                           ┌──────────────┼──────────────┐
                           │              │              │
                      Fetch URL    Detect Language   Filter Modules
                    (Readability)                         │
                           │              │    ┌─────────┼─────────┐
                           v              v    v         v         v
                        Clean Text ──> [Summary] [Key Points] [Flashcards] ...
                                       (Gemini 2.0 Flash, parallel)
                                          │
                                          v
                                   Save to PostgreSQL
                                          │
                                          v
                              SSE notifies client ──> Render results
```

- **Web app** (Next.js 16, App Router) -- handles UI and API routes
- **Worker** (BullMQ) -- processes digest jobs in a separate process
- **PostgreSQL** -- stores articles, digests, flashcards, devices
- **Redis** -- job queue broker between web and worker

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 16 / React 19 / Tailwind CSS 4 |
| Database | PostgreSQL 16 + Drizzle ORM |
| Queue | BullMQ + Redis 7 |
| LLM | Google Gemini 2.0 Flash (@google/genai) |
| Content Extraction | @mozilla/readability + linkedom |
| Validation | Zod |
| Visualization | d3-hierarchy (mind maps) |

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker Desktop** (for local PostgreSQL + Redis)
- **Google Gemini API key** or Google Cloud account with Vertex AI API enabled

## Quick Start

### 1. Install dependencies

```bash
cd dinodigest
pnpm install
```

### 2. Start Docker services

```bash
pnpm docker:up
```

This starts PostgreSQL 16 on `localhost:5432` and Redis 7 on `localhost:6379`.

### 3. Push database schema

```bash
pnpm db:push
```

Creates 4 tables: `devices`, `articles`, `digests`, `flashcards`.

### 4. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

| Variable | Description | Default |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://dinodigest:dinodigest@localhost:5432/dinodigest` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `GEMINI_API_KEY` | Google AI Studio API key (recommended for dev) | -- |
| `GOOGLE_CLOUD_PROJECT` | Vertex AI project ID (alternative to API key) | -- |
| `GOOGLE_CLOUD_LOCATION` | Vertex AI region | `us-central1` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON | -- |
| `NEXT_PUBLIC_APP_URL` | Web app URL | `http://localhost:3000` |

**Option A -- Gemini API key (simplest):** Get a free key from [Google AI Studio](https://aistudio.google.com/apikey) and set `GEMINI_API_KEY`.

**Option B -- Vertex AI:** Set `GOOGLE_CLOUD_PROJECT`, `GOOGLE_CLOUD_LOCATION`, and `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON with the `aiplatform.user` role.

### 5. Start the app

Two terminals:

```bash
# Terminal 1 -- Worker (processes digest jobs)
pnpm --filter @dinodigest/worker dev

# Terminal 2 -- Web app
pnpm --filter @dinodigest/web dev
```

Or start everything at once:

```bash
pnpm dev
```

### 6. Use it

Open [http://localhost:3000](http://localhost:3000)

1. Paste an article URL into the dinosaur's mouth
2. Click **Feed** (投喂)
3. Watch the dinosaur chew while modules process in parallel (10-30s)
4. Browse digested results across 5 tabs
5. Visit `/history` to see past digests
6. Visit `/review` to practice flashcards with spaced repetition

## Project Structure

```
dinodigest/
├── apps/
│   ├── web/                  # Next.js 16 frontend + API routes
│   │   ├── app/
│   │   │   ├── page.tsx              # Home -- URL input with dino animation
│   │   │   ├── digest/[id]/page.tsx  # Processing view + tabbed results
│   │   │   ├── history/page.tsx      # Article history list
│   │   │   └── review/page.tsx       # Flashcard review (SM-2)
│   │   ├── api/                      # API routes (ingest, digest, history, review)
│   │   ├── components/               # Dino SVG, renderers, UI components
│   │   └── lib/                      # DB/Redis singletons, SM-2 algorithm, hooks
│   └── worker/               # BullMQ background worker
│       ├── index.ts                  # Entry point, module registration
│       ├── orchestrator.ts           # Pipeline: fetch → detect → run modules → save
│       ├── module-registry.ts        # Module storage and filtering
│       ├── fetcher.ts                # URL → clean text (Readability)
│       └── language-detect.ts        # CJK character ratio heuristic
├── packages/
│   ├── module-sdk/           # Core interfaces (DigestModule, DigestAgent, LLMClient)
│   ├── db/                   # Drizzle ORM schema + database connection
│   └── llm/                  # Gemini client with concurrency control (semaphore)
├── modules/
│   ├── summary/              # Chinese article summary
│   ├── key-points/           # Knowledge point extraction
│   ├── vocab-flashcard/      # English vocabulary flashcards
│   ├── quiz/                 # Comprehension quiz questions
│   └── mindmap/              # Hierarchical mind map generation
├── docs/                     # Product & architecture docs
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_PLAN.md
│   └── MODULE_SDK.md
├── docker-compose.yml        # Local PostgreSQL + Redis
├── turbo.json                # Turborepo pipeline config
├── pnpm-workspace.yaml       # Workspace declarations
└── tsconfig.base.json        # Shared TypeScript config
```

## Digest Modules

Each module is an independent package implementing the `DigestModule` interface. Modules run in parallel via `Promise.allSettled` -- if one fails, others still complete.

| Module | Output Kind | Language | Description |
|---|---|---|---|
| **summary** | `summary` | Any | Chinese title, 3-5 sentence summary, 3-6 bullet points |
| **key-points** | `key_point` | Any | 3-8 key concepts with explanations, analogies, difficulty (1-5) |
| **vocab-flashcard** | `flashcard` | English only (min 200 words) | 12 words with IPA, Chinese translation, example sentences |
| **quiz** | `quiz` | Any | 4 multiple-choice comprehension questions in Chinese |
| **mindmap** | `mind_map` | Any | Hierarchical concept tree (15-30 nodes) rendered as SVG |

See `docs/MODULE_SDK.md` for how to build your own module.

## Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start all apps via Turborepo |
| `pnpm build` | Build all packages |
| `pnpm lint` | Type-check all packages (`tsc --noEmit`) |
| `pnpm test` | Run all tests |
| `pnpm docker:up` | Start PostgreSQL + Redis containers |
| `pnpm docker:down` | Stop containers |
| `pnpm db:push` | Push Drizzle schema to database |
| `pnpm db:generate` | Generate SQL migration files |
| `pnpm db:migrate` | Run database migrations |
| `pnpm --filter @dinodigest/web dev` | Start web app only (port 3000) |
| `pnpm --filter @dinodigest/worker dev` | Start worker only |

## Key Design Decisions

- **Separate processes** -- Web and Worker communicate via PostgreSQL + Redis, enabling independent scaling and deployment
- **Anonymous identity** -- Users identified by `dino_device_id` httpOnly cookie (1-year expiry), no login required
- **LLM concurrency control** -- Semaphore in the Gemini client limits concurrent API calls (default 2) to avoid rate limiting
- **Structured LLM output** -- Uses Gemini JSON response mode + Zod schema validation for type-safe results
- **Module isolation** -- `Promise.allSettled` ensures partial results are saved even when individual modules fail
- **SSE polling** -- The digest status endpoint polls PostgreSQL every 1s (simplified; production would use Redis pub/sub)

## Troubleshooting

**Worker shows `ECONNREFUSED` for Redis**
- Docker containers aren't running. Run `pnpm docker:up`.

**`Empty response from Gemini` error**
- Check your `GEMINI_API_KEY` or Vertex AI credentials in `.env`.
- Verify the API is enabled and quotas are not exhausted.

**`Could not extract article content from URL`**
- Some websites block scrapers. Try a different URL.
- Paywalled or JavaScript-heavy SPAs may not work.

**Database connection errors**
- Run `docker compose ps` to verify PostgreSQL is running.
- Run `pnpm db:push` to ensure tables exist.
