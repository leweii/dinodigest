# DinoDigest — Development Plan

> Version: 0.1.0 | Last Updated: 2026-03-25

## 1. Prerequisites

Before writing any code, complete these setup tasks:

### Service Accounts

| Service | Purpose | URL | Tier |
|---|---|---|---|
| Google Cloud | Vertex AI Gemini | console.cloud.google.com | Free trial / Pay-as-you-go |
| Neon | PostgreSQL database | neon.tech | Free (0.5 GB) |
| Upstash | Redis for BullMQ | upstash.com | Free (10K commands/day) |
| Vercel | Web app deployment | vercel.com | Free (Hobby) |
| Railway | Worker deployment | railway.app | $5/month starter |

### Google Cloud Setup

```bash
# 1. Create project
gcloud projects create dinodigest --name="DinoDigest"

# 2. Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com

# 3. Create service account
gcloud iam service-accounts create dinodigest-worker \
  --display-name="DinoDigest Worker"

# 4. Grant Vertex AI User role
gcloud projects add-iam-policy-binding dinodigest \
  --member="serviceAccount:dinodigest-worker@dinodigest.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# 5. Download key
gcloud iam service-accounts keys create service-account.json \
  --iam-account=dinodigest-worker@dinodigest.iam.gserviceaccount.com

# 6. Test connection
node -e "
  const { VertexAI } = require('@google-cloud/vertexai');
  const v = new VertexAI({ project: 'dinodigest', location: 'us-central1' });
  const m = v.getGenerativeModel({ model: 'gemini-2.0-flash' });
  m.generateContent('Say hello').then(r => console.log(r.response.text()));
"
```

### Dinosaur Illustration

Find or create SVG dinosaur illustrations for 3 states:
- **Idle**: Mouth open, waiting for food
- **Chewing**: Mouth opening/closing
- **Happy**: Satisfied expression

Suggested sources:
- [OpenDoodles](https://www.opendoodles.com)
- [unDraw](https://undraw.co)
- AI-generated simple line art, cleaned up as SVG
- Phosphor Icons dinosaur variants

The SVGs should be:
- Simple line art or flat style
- Single color (can be themed via CSS `fill`)
- Lightweight (< 10KB each)
- Consistent style across all 3 states

## 2. Phase Breakdown

### Phase 0: Project Skeleton (Day 1-2)

**Goal**: Monorepo structure, all packages initialized, basic tooling.

```
Tasks:
  [ ] Initialize pnpm + Turborepo monorepo
      - pnpm init
      - Install turbo
      - Configure pnpm-workspace.yaml
      - Configure turbo.json (build, dev, lint, test pipelines)

  [ ] Create packages/module-sdk
      - Define all TypeScript interfaces (types.ts)
      - ModuleManifest, DigestModule, DigestAgent
      - AgentRuntime, LLMClient
      - DigestEvent, DigestOutput, ContentInput
      - Export everything from index.ts

  [ ] Create packages/db
      - Install drizzle-orm, drizzle-kit, @neondatabase/serverless
      - Define schema.ts (devices, articles, digests, flashcards)
      - Create initial migration
      - Test connection to Neon

  [ ] Create packages/llm
      - Install @google-cloud/vertexai
      - Implement gemini-client.ts
      - Implement structured output with Zod schema conversion
      - Test basic generation

  [ ] Create apps/web skeleton
      - npx create-next-app (App Router, TypeScript, Tailwind)
      - Install shadcn/ui
      - Install next-intl, configure en/zh
      - Create basic layout with i18n routing

  [ ] Create apps/worker skeleton
      - TypeScript entry point
      - Install bullmq
      - Basic queue connection test

  [ ] Developer tooling
      - ESLint config (shared)
      - Prettier config
      - .env.example
      - .gitignore
      - tsconfig base + per-package extends

  [ ] Git init + first commit
```

**Claude Code instructions for Phase 0:**

```
Instruction 1: "Initialize a Turborepo monorepo with pnpm workspaces.
  Structure: apps/web, apps/worker, packages/module-sdk, packages/db, packages/llm, modules/
  Use TypeScript strict mode everywhere.
  Add turbo.json with build, dev, lint, test pipelines."

Instruction 2: "Create packages/module-sdk/types.ts with the following interfaces:
  [paste the full interface definitions from MODULE_SDK.md]
  Export everything from index.ts."

Instruction 3: "Create packages/db with Drizzle ORM schema.
  Tables: devices, articles, digests, flashcards.
  [paste the schema definitions from ARCHITECTURE.md section 4]
  Use @neondatabase/serverless driver.
  Create the initial migration."

Instruction 4: "Create packages/llm/gemini-client.ts.
  It must implement the LLMClient interface from @dinodigest/module-sdk.
  Use @google-cloud/vertexai.
  Model: gemini-2.0-flash.
  Support: generate, generateStructured (with Zod schema), generateStream."
```

### Phase 1: Core Pipeline (Day 3-5)

**Goal**: URL → content extraction → module processing → results in database.

```
Tasks:
  [ ] Implement apps/worker/fetcher.ts
      - Accept a URL
      - Fetch HTML
      - Extract clean text using @mozilla/readability
      - Return { title, text, wordCount }

  [ ] Implement apps/worker/language-detect.ts
      - Simple language detection (franc or basic heuristic)
      - Return ISO 639-1 code ('en', 'zh', etc.)

  [ ] Implement apps/worker/module-registry.ts
      - Scan modules/ directory at startup
      - Register each module
      - findApplicable(input) method

  [ ] Implement apps/worker/orchestrator.ts
      - Full pipeline: fetch → parse → find modules → run agents → save results
      - Event emission for each step
      - Error isolation per module
      - Update article status throughout

  [ ] Implement apps/worker/index.ts
      - BullMQ worker listening on 'digest' queue
      - On job received: call orchestrator.orchestrate(articleId)
      - Configure retry: 3 attempts, exponential backoff

  [ ] Create modules/summary
      - Manifest: accepts articles in any language
      - Agent: sends article to Gemini, gets structured summary
      - Output kind: 'summary'
      - Prompt: generate title + 3-5 sentence summary + bullet points in Chinese

  [ ] Create modules/key-points
      - Manifest: accepts articles in any language
      - Agent: extracts 3-8 key concepts from article
      - Output kind: 'key_point'
      - Prompt: for each concept, provide simple explanation + optional analogy

  [ ] End-to-end test
      - Submit a URL programmatically
      - Worker picks up job
      - Two modules run
      - Results appear in database
```

**Claude Code instructions for Phase 1:**

```
Instruction 1: "Implement apps/worker/fetcher.ts.
  It should: fetch a URL, extract clean article text using @mozilla/readability.
  Interface: fetchAndExtract(url: string): Promise<{ title: string, text: string, wordCount: number }>
  Handle errors: invalid URL, fetch failure, empty content."

Instruction 2: "Implement apps/worker/module-registry.ts and apps/worker/orchestrator.ts.
  ModuleRegistry: scans modules/*/index.ts, registers them, provides findApplicable(input).
  DigestOrchestrator: full pipeline as defined in ARCHITECTURE.md section 6.
  The orchestrator should emit events via an EventEmitter for SSE."

Instruction 3: "Create modules/summary as a DigestModule.
  Interface defined in packages/module-sdk/types.ts.
  The agent should use runtime.llm.generateStructured to produce a Chinese summary.
  Output kind: 'summary' with { title, content, bulletPoints }.
  Include a well-crafted prompt in prompts.ts."
```

### Phase 2: Frontend MVP (Day 6-9)

**Goal**: Working web UI — feed URL, see processing, view results.

```
Tasks:
  [ ] Dinosaur SVG assets
      - Source or create 3 SVGs (idle, chewing, happy)
      - Add CSS animations (mouth open/close for chewing)
      - Create dino-idle.tsx, dino-chewing.tsx, dino-happy.tsx components

  [ ] Home page (apps/web/app/[locale]/page.tsx)
      - Dinosaur (idle) centered
      - URL input field positioned at mouth area
      - "Feed" button
      - Recently digested articles list (last 6)
      - "X cards due for review" banner

  [ ] API route: POST /api/ingest
      - Validate URL
      - Get or create device (from cookie)
      - Create article record (status: pending)
      - Add job to BullMQ queue
      - Return { articleId }

  [ ] Processing page (apps/web/app/[locale]/digest/[id]/page.tsx)
      - Dinosaur (chewing) with CSS animation
      - Article title
      - Agent status list (real-time via SSE)
      - Auto-redirect to result page when done

  [ ] API route: GET /api/digest/[id]/events (SSE)
      - Server-Sent Events stream
      - Forward events from Redis pub/sub or in-memory EventEmitter
      - Close stream on completion

  [ ] use-digest-events.ts hook
      - EventSource connection
      - Parse events, maintain state
      - Handle reconnection

  [ ] Digest result page
      - Article metadata header (title, source, word count, time)
      - Tab bar: Summary | Key Points (more tabs added later)
      - Render digests using unified renderer system

  [ ] Unified renderer system
      - renderers/index.ts with rendererMap
      - summary-renderer.tsx
      - key-point-renderer.tsx
      - generic-renderer.tsx (fallback)

  [ ] History page (apps/web/app/[locale]/history/page.tsx)
      - List all articles for current device
      - Each card: title, source, digest stats, timestamp
      - Grouped by date

  [ ] i18n translations
      - messages/en.json — all UI strings
      - messages/zh.json — Chinese translations
```

### Phase 3: Flashcard System (Day 10-12)

**Goal**: Vocabulary extraction module + flashcard review with SM-2.

```
Tasks:
  [ ] Create modules/vocab-flashcard
      - Manifest: accepts English content only
      - Agent: extract 10-15 vocabulary words
      - Each word: word, IPA, Chinese translation, example, original context
      - Output kind: 'flashcard'

  [ ] Flashcard renderer
      - renderers/flashcard-renderer.tsx
      - Card with front/back
      - Click/tap to flip (CSS 3D transform)
      - Show word + IPA on front, translation + examples on back

  [ ] SM-2 implementation
      - lib/sm2.ts — pure function
      - Input: quality score (0-5) + previous state
      - Output: new repetitions, easeFactor, interval

  [ ] Review API routes
      - GET /api/review/due — flashcards where nextReviewAt <= now
      - POST /api/review/score — update card with SM-2 result

  [ ] Review page (apps/web/app/[locale]/review/page.tsx)
      - Full-screen card display
      - Flip interaction
      - 4 rating buttons: Again / Hard / Good / Easy
      - Progress indicator ("X remaining")
      - Dinosaur encouragement text
      - Empty state when no cards due

  [ ] Integration
      - After vocab-flashcard module runs, cards auto-saved to flashcards table
      - Home page shows "X cards due for review" count
      - Digest result page shows flashcard preview with "Start Review" CTA

  [ ] Add Flashcards tab to digest result page
```

### Phase 4: Polish (Day 13-15)

**Goal**: Quiz module, error states, responsive design, animations.

```
Tasks:
  [ ] Create modules/quiz
      - Agent: generate 3-5 comprehension questions per article
      - Multiple choice format
      - Output kind: 'quiz'

  [ ] Quiz renderer
      - renderers/quiz-renderer.tsx
      - Show question + options
      - Click to select, reveal correct answer + explanation
      - Track score (local state, not persisted in MVP)

  [ ] Dinosaur animation polish
      - Smooth CSS transitions between states
      - Eye blink animation (CSS keyframes)
      - Mouth open/close for chewing (CSS transform)
      - Happy bounce when digest completes

  [ ] Error states
      - Content extraction failed: error card with retry button
      - Module failed: partial results shown, failed module greyed out with retry
      - Network error: toast notification
      - Empty URL: inline validation

  [ ] Empty states
      - No articles yet: dinosaur saying "Feed me!"
      - No cards due: dinosaur saying "All caught up!"

  [ ] Responsive design
      - Mobile: stack layout, full-width cards
      - Tablet: 2-column grid
      - Desktop: centered content, max-width container
      - Flashcard review: works great on phone (tap to flip)

  [ ] Loading states
      - Skeleton loaders for article list
      - Skeleton for digest result tabs
      - Spinner for initial page loads

  [ ] Add Quiz tab to digest result page
```

### Phase 5: Deployment (Day 16-17)

**Goal**: Live on the internet.

```
Tasks:
  [ ] Vercel deployment
      - Connect GitHub repo
      - Configure environment variables
      - Set up production database URL
      - Test build and deploy

  [ ] Railway deployment (worker)
      - Create Railway project
      - Configure Dockerfile or nixpacks
      - Set environment variables
      - Connect to same Neon DB and Upstash Redis
      - Verify worker picks up jobs

  [ ] Production checklist
      - [ ] All env vars set in Vercel and Railway
      - [ ] Database migrations applied to production
      - [ ] Gemini API key scoped to production project
      - [ ] CORS configured properly
      - [ ] Cookie secure flag set for production
      - [ ] Error monitoring (Vercel built-in)
      - [ ] Basic rate limiting on /api/ingest

  [ ] Domain (optional)
      - Configure custom domain on Vercel
      - Update NEXT_PUBLIC_APP_URL
```

### Phase 6: Module Developer Experience (Day 18-19)

**Goal**: Your friends can independently develop new modules.

```
Tasks:
  [ ] Module scaffolding
      - Script or template to create new module directory
      - Pre-filled package.json, index.ts, agent.ts, schema.ts
      - README with quick start guide

  [ ] Module development documentation
      - Finalize docs/MODULE_SDK.md
      - Add inline code examples
      - Document how to test modules locally

  [ ] Local development script
      - `pnpm dev` starts web + worker + redis (docker-compose)
      - Hot reload for module changes
      - Seed script to populate test data

  [ ] Example module with extensive comments
      - Pick one module (summary or vocab-flashcard)
      - Add detailed comments explaining each step
      - This becomes the reference implementation
```

## 3. Claude Code Development Strategy

### General Principles

1. **Types first, implementation second**. Always complete `packages/module-sdk/types.ts` before any module implementation. Types are the specification that Claude Code follows.

2. **One package/module per instruction**. Give Claude Code a focused scope:
   - Good: "Implement modules/summary following the DigestModule interface in packages/module-sdk"
   - Bad: "Build the whole backend"

3. **Reference existing interfaces**. Always point Claude Code to the interface file:
   - "Implement X, the interface is defined in packages/module-sdk/types.ts"
   - "The database schema is in packages/db/schema.ts"

4. **Provide context files**. When asking Claude Code to implement something, mention which files it should read first:
   - "Read packages/module-sdk/types.ts and packages/db/schema.ts, then implement apps/worker/orchestrator.ts"

### Instruction Templates

**For implementing a new module:**
```
Create a new digest module at modules/<name>/.
Read the DigestModule interface in packages/module-sdk/types.ts.

This module should:
- Accept: [content types, languages]
- Produce: [output kinds]
- Agent behavior: [describe what the agent does step by step]

Follow the same structure as modules/summary/ for reference.
Include prompts.ts with well-crafted prompts and schema.ts with Zod schemas.
```

**For implementing an API route:**
```
Create API route at apps/web/app/api/<path>/route.ts.
Database schema is in packages/db/schema.ts.
Query helpers are in packages/db/queries.ts.

This route should:
- Method: [GET/POST]
- Input: [params/body]
- Logic: [describe]
- Output: [response shape]
- Error handling: [describe]
```

**For implementing a UI component:**
```
Create component at apps/web/components/<name>.tsx.
Use shadcn/ui components and Tailwind CSS.
The component should support i18n via next-intl useTranslations hook.

Props: [describe]
Behavior: [describe]
Reference design: [point to PRD section]
```

### Testing Strategy

- **Modules**: Unit test the agent with mocked `AgentRuntime`
- **API routes**: Integration test with test database
- **Components**: Visual testing (manual for MVP, Storybook later)
- **Pipeline**: End-to-end test: submit URL → check database results

## 4. Risk Mitigation

| Risk | Mitigation |
|---|---|
| Gemini structured output unreliable | Wrap in Zod parse with fallback retry; consider response post-processing |
| Content extraction fails on some sites | Fallback chain: readability → defuddle → raw HTML strip; show user what was extracted |
| BullMQ/Redis connection issues | Health check endpoint; auto-reconnect; graceful degradation |
| SSE doesn't work behind proxy | Fallback to polling if EventSource fails |
| LLM costs spike | Per-device daily limit; cache same-URL results; monitor spend alerts |
| Module breaks entire pipeline | Error isolation — each module runs in try/catch, failures don't block others |

## 5. Post-MVP Roadmap

```
Month 2: Engagement
  - User authentication (Google OAuth)
  - Browser extension
  - Email digest: daily summary of due reviews
  - Basic analytics

Month 3: Content Expansion
  - PDF support
  - YouTube video transcript digestion
  - Multi-article topic clustering

Month 4: Social + Growth
  - Share digest results via public URL
  - Module marketplace (community modules)
  - WeChat integration

Month 5+: Intelligence
  - Knowledge graph across articles
  - Semantic search (pgvector)
  - Personalized difficulty adjustment
  - Learning path recommendations
```
