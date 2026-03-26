# DinoDigest — Technical Architecture

> Version: 0.1.0 | Last Updated: 2026-03-25

## 1. System Overview

```mermaid
graph TB
    subgraph CLIENT["Browser (Client)"]
        direction TB
        subgraph PAGES["Pages"]
            HOME["Home Page<br/>恐龙投喂入口"]
            PROC["Processing Page<br/>恐龙咀嚼动画"]
            DIGEST["Digest Result Page<br/>Tab: Summary / KeyPoints / Flashcards / Quiz"]
            HISTORY["History Page<br/>知识胃"]
            REVIEW["Review Page<br/>闪卡复习 SM-2"]
        end

        subgraph COMPONENTS["Core Components"]
            DINO_IDLE["dino-idle.tsx<br/>SVG 张嘴状态"]
            DINO_CHEW["dino-chewing.tsx<br/>CSS 咀嚼动画"]
            DINO_HAPPY["dino-happy.tsx<br/>完成状态"]
            FEED_INPUT["feed-input.tsx<br/>URL 输入框"]
            PROC_STATUS["processing-status.tsx<br/>Agent 状态列表"]
            DIGEST_TABS["digest-tabs.tsx<br/>结果 Tab 切换"]
            FLASHCARD["flashcard.tsx<br/>翻转卡片"]
        end

        subgraph RENDERERS["Unified Renderer System"]
            RENDER_REG["rendererMap<br/>kind → Component"]
            R_SUMMARY["SummaryRenderer"]
            R_KEYPOINT["KeyPointRenderer"]
            R_FLASH["FlashcardRenderer"]
            R_QUIZ["QuizRenderer"]
            R_GENERIC["GenericRenderer<br/>(fallback)"]
        end

        subgraph CLIENT_LIB["Client Libraries"]
            SSE_HOOK["useDigestEvents<br/>SSE EventSource hook"]
            API_CLIENT["api-client.ts<br/>fetch wrapper"]
            SM2_LIB["sm2.ts<br/>间隔重复算法"]
            I18N["next-intl<br/>en.json / zh.json"]
        end
    end

    subgraph SERVER["Next.js Server (Vercel)"]
        subgraph API["API Routes"]
            API_INGEST["POST /api/ingest<br/>提交 URL"]
            API_DIGEST["GET /api/digest/:id<br/>查询消化结果"]
            API_EVENTS["GET /api/digest/:id/events<br/>SSE 实时推送"]
            API_HISTORY["GET /api/history<br/>文章列表"]
            API_DUE["GET /api/review/due<br/>到期闪卡"]
            API_SCORE["POST /api/review/score<br/>闪卡评分"]
        end

        COOKIE["Cookie Middleware<br/>设备 ID 识别"]
    end

    subgraph INFRA["Infrastructure"]
        REDIS[("Upstash Redis<br/>BullMQ 队列")]
        DB[("Neon PostgreSQL<br/>Drizzle ORM")]

        subgraph DB_TABLES["Database Tables"]
            T_DEVICE["devices<br/>id, locale, config"]
            T_ARTICLE["articles<br/>id, deviceId, sourceUrl,<br/>title, rawContent,<br/>language, status"]
            T_DIGEST["digests<br/>id, articleId, moduleId,<br/>kind, data (JSONB)"]
            T_FLASH["flashcards<br/>id, deviceId, articleId,<br/>front, back, tags,<br/>SM-2 fields"]
        end
    end

    subgraph WORKER["Worker Process (Railway)"]
        BULL_WORKER["BullMQ Worker<br/>监听 digest 队列"]

        subgraph PIPELINE["Processing Pipeline"]
            FETCHER["Fetcher<br/>URL → HTML → Clean Text<br/>(readability + defuddle)"]
            LANG_DETECT["Language Detector<br/>文本 → 语言代码"]
            ORCHESTRATOR["Orchestrator<br/>Agent 编排器"]
        end

        subgraph MODULE_REG["Module Registry"]
            REGISTRY["ModuleRegistry<br/>模块发现 & 注册<br/>findApplicable(input)"]
        end

        subgraph MODULES["Digest Modules (消化酶)"]
            MOD_SUMMARY["modules/summary<br/>├ index.ts<br/>├ agent.ts<br/>├ prompts.ts<br/>└ schema.ts"]
            MOD_KEYPOINTS["modules/key-points<br/>├ index.ts<br/>├ agent.ts<br/>├ prompts.ts<br/>└ schema.ts"]
            MOD_VOCAB["modules/vocab-flashcard<br/>├ index.ts<br/>├ agent.ts<br/>├ prompts.ts<br/>└ schema.ts"]
            MOD_QUIZ["modules/quiz<br/>├ index.ts<br/>├ agent.ts<br/>├ prompts.ts<br/>└ schema.ts"]
            MOD_FUTURE["modules/???<br/>你朋友开发的<br/>新消化酶"]
        end

        subgraph AGENT_RT["Agent Runtime (注入给每个模块)"]
            RT_LLM["llm<br/>generate()<br/>generateStructured()<br/>generateStream()"]
            RT_TOOLS["tools<br/>webSearch()<br/>fetchUrl()"]
            RT_CONFIG["userConfig<br/>language, level,<br/>moduleConfig"]
            RT_LOG["log<br/>info / warn / error"]
        end
    end

    subgraph PACKAGES["Shared Packages"]
        PKG_SDK["@dinodigest/module-sdk<br/>ModuleManifest, DigestModule,<br/>DigestAgent, AgentRuntime,<br/>DigestEvent, DigestOutput,<br/>ContentInput"]
        PKG_DB["@dinodigest/db<br/>Drizzle schema,<br/>queries, migrations"]
        PKG_LLM["@dinodigest/llm<br/>Gemini client,<br/>structured output,<br/>Zod → Gemini schema"]
    end

    subgraph EXTERNAL["External Services"]
        GEMINI["Google Vertex AI<br/>Gemini 2.0 Flash"]
        WEB["Target Websites<br/>用户提交的 URL"]
    end

    %% Client → Server connections
    HOME -->|"POST URL"| API_INGEST
    PROC -->|"SSE subscribe"| API_EVENTS
    DIGEST -->|"GET results"| API_DIGEST
    HISTORY -->|"GET list"| API_HISTORY
    REVIEW -->|"GET due cards"| API_DUE
    REVIEW -->|"POST score"| API_SCORE
    COOKIE --> API

    %% Server → Infrastructure
    API_INGEST -->|"add job"| REDIS
    API_DIGEST -->|"query"| DB
    API_EVENTS -->|"subscribe events"| REDIS
    API_HISTORY -->|"query"| DB
    API_DUE -->|"query"| DB
    API_SCORE -->|"update"| DB

    %% Worker flow
    REDIS -->|"consume job"| BULL_WORKER
    BULL_WORKER --> FETCHER
    FETCHER -->|"fetch"| WEB
    FETCHER --> LANG_DETECT
    LANG_DETECT --> ORCHESTRATOR
    ORCHESTRATOR --> REGISTRY
    REGISTRY -->|"findApplicable"| MODULES
    ORCHESTRATOR -->|"run agents ∥"| MODULES

    %% Module → Runtime
    MODULES -->|"uses"| AGENT_RT
    RT_LLM -->|"API call"| GEMINI

    %% Module → DB
    ORCHESTRATOR -->|"save results"| DB
    ORCHESTRATOR -->|"publish events"| REDIS

    %% Package dependencies
    MODULES -.->|"implements"| PKG_SDK
    WORKER -.->|"uses"| PKG_DB
    WORKER -.->|"uses"| PKG_LLM
    SERVER -.->|"uses"| PKG_DB

    %% Renderer connections
    DIGEST --> RENDER_REG
    RENDER_REG --> R_SUMMARY
    RENDER_REG --> R_KEYPOINT
    RENDER_REG --> R_FLASH
    RENDER_REG --> R_QUIZ
    RENDER_REG --> R_GENERIC

    %% DB relationships
    T_DEVICE -->|"1:N"| T_ARTICLE
    T_ARTICLE -->|"1:N"| T_DIGEST
    T_ARTICLE -->|"1:N"| T_FLASH
    T_DEVICE -->|"1:N"| T_FLASH

    %% Styling
    classDef page fill:#4A90D9,stroke:#2C5F8A,color:#fff
    classDef component fill:#7B68EE,stroke:#5B48CE,color:#fff
    classDef api fill:#E8A838,stroke:#C8882A,color:#fff
    classDef infra fill:#50C878,stroke:#3BA55D,color:#fff
    classDef module fill:#FF6B6B,stroke:#D94545,color:#fff
    classDef package fill:#A0A0A0,stroke:#707070,color:#fff
    classDef external fill:#DDA0DD,stroke:#BA55D3,color:#fff

    class HOME,PROC,DIGEST,HISTORY,REVIEW page
    class DINO_IDLE,DINO_CHEW,DINO_HAPPY,FEED_INPUT,PROC_STATUS,DIGEST_TABS,FLASHCARD component
    class API_INGEST,API_DIGEST,API_EVENTS,API_HISTORY,API_DUE,API_SCORE api
    class REDIS,DB,T_DEVICE,T_ARTICLE,T_DIGEST,T_FLASH infra
    class MOD_SUMMARY,MOD_KEYPOINTS,MOD_VOCAB,MOD_QUIZ,MOD_FUTURE module
    class PKG_SDK,PKG_DB,PKG_LLM package
    class GEMINI,WEB external
```

## 2. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack TS, SSR, API routes, Vercel native |
| Language | TypeScript (strict) | Type safety, best Claude Code support |
| UI Components | shadcn/ui + Tailwind CSS | Accessible, customizable, no runtime cost |
| Animation | CSS transitions + Framer Motion | Lightweight, sufficient for MVP |
| Monorepo | Turborepo + pnpm workspaces | Fast builds, clear package boundaries |
| Database | PostgreSQL via Neon | Free tier, serverless, zero ops |
| ORM | Drizzle ORM | Lightweight, excellent TS inference |
| Queue | BullMQ + Upstash Redis | Mature, retries, priorities, free Redis tier |
| LLM | Google Vertex AI (Gemini 2.0 Flash) | Cost-effective, fast, structured output |
| Content Extraction | @mozilla/readability + defuddle | Proven accuracy for article extraction |
| i18n | next-intl | Standard for Next.js App Router |
| Deployment (Web) | Vercel | Zero-config Next.js hosting |
| Deployment (Worker) | Railway | Simple, affordable container hosting |

## 3. Project Structure

```
dinodigest/
├── apps/
│   ├── web/                          # Next.js frontend + API
│   │   ├── app/
│   │   │   ├── [locale]/            # i18n locale prefix
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx         # Home (dinosaur + URL input)
│   │   │   │   ├── digest/
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx # Digest result page
│   │   │   │   ├── history/
│   │   │   │   │   └── page.tsx     # Knowledge stomach
│   │   │   │   └── review/
│   │   │   │       └── page.tsx     # Flashcard review
│   │   │   └── api/
│   │   │       ├── ingest/
│   │   │       │   └── route.ts     # POST: submit URL
│   │   │       ├── digest/
│   │   │       │   └── [id]/
│   │   │       │       ├── route.ts      # GET: query results
│   │   │       │       └── events/
│   │   │       │           └── route.ts  # SSE: real-time status
│   │   │       └── review/
│   │   │           ├── due/
│   │   │           │   └── route.ts      # GET: due flashcards
│   │   │           └── score/
│   │   │               └── route.ts      # POST: score a card
│   │   ├── components/
│   │   │   ├── dino/                # Dinosaur components
│   │   │   │   ├── dino-idle.tsx    # Idle state (mouth open)
│   │   │   │   ├── dino-chewing.tsx # Chewing animation
│   │   │   │   └── dino-happy.tsx   # Digest complete
│   │   │   ├── feed-input.tsx       # URL input component
│   │   │   ├── digest-tabs.tsx      # Result tab switcher
│   │   │   ├── processing-status.tsx # Agent status list
│   │   │   └── renderers/           # Unified output renderers
│   │   │       ├── index.ts         # Renderer registry
│   │   │       ├── summary-renderer.tsx
│   │   │       ├── key-point-renderer.tsx
│   │   │       ├── flashcard-renderer.tsx
│   │   │       ├── quiz-renderer.tsx
│   │   │       └── generic-renderer.tsx  # Fallback
│   │   ├── lib/
│   │   │   ├── api-client.ts        # Frontend API client
│   │   │   ├── sm2.ts              # SM-2 algorithm
│   │   │   └── use-digest-events.ts # SSE hook
│   │   └── messages/
│   │       ├── en.json              # English translations
│   │       └── zh.json              # Chinese translations
│   │
│   └── worker/                      # Background worker process
│       ├── index.ts                 # BullMQ worker entry point
│       ├── orchestrator.ts          # Agent orchestration
│       ├── fetcher.ts               # URL -> clean text
│       ├── language-detect.ts       # Language detection
│       └── module-registry.ts       # Module discovery & registration
│
├── modules/                         # Digest modules (independently developable)
│   ├── summary/
│   │   ├── package.json
│   │   ├── index.ts                 # Module definition export
│   │   ├── agent.ts                 # Agent implementation
│   │   ├── prompts.ts               # Prompt templates
│   │   ├── schema.ts                # Zod output schemas
│   │   └── __tests__/
│   │       └── agent.test.ts
│   ├── key-points/
│   │   ├── package.json
│   │   ├── index.ts
│   │   ├── agent.ts
│   │   ├── prompts.ts
│   │   └── schema.ts
│   ├── vocab-flashcard/
│   │   ├── package.json
│   │   ├── index.ts
│   │   ├── agent.ts
│   │   ├── prompts.ts
│   │   └── schema.ts
│   └── quiz/
│       ├── package.json
│       ├── index.ts
│       ├── agent.ts
│       ├── prompts.ts
│       └── schema.ts
│
├── packages/
│   ├── module-sdk/                  # Module development SDK
│   │   ├── package.json
│   │   ├── index.ts                 # Re-exports
│   │   └── types.ts                 # All interfaces & types
│   ├── db/                          # Database layer
│   │   ├── package.json
│   │   ├── index.ts                 # Connection + exports
│   │   ├── schema.ts                # Drizzle table definitions
│   │   ├── queries.ts               # Reusable query helpers
│   │   └── migrations/              # SQL migrations
│   └── llm/                         # LLM abstraction layer
│       ├── package.json
│       ├── index.ts
│       ├── gemini-client.ts         # Vertex AI Gemini implementation
│       ├── structured.ts            # Structured output helpers
│       └── prompts/                 # Shared prompt utilities
│           └── utils.ts
│
├── turbo.json                       # Turborepo config
├── package.json                     # Root package.json
├── pnpm-workspace.yaml              # pnpm workspace config
├── .env.example                     # Environment variable template
└── docs/                            # Documentation
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── DEVELOPMENT_PLAN.md
    └── MODULE_SDK.md
```

## 4. Database Schema

### devices

Identifies anonymous users via browser cookie. Future login will link to a real user account.

```typescript
export const devices = pgTable('devices', {
  id:        uuid('id').primaryKey().defaultRandom(),
  locale:    varchar('locale', { length: 10 }).default('en'),
  config:    jsonb('config').default({}),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### articles

Each submitted URL becomes an article record.

```typescript
export const articles = pgTable('articles', {
  id:         uuid('id').primaryKey().defaultRandom(),
  deviceId:   uuid('device_id').references(() => devices.id).notNull(),
  sourceUrl:  text('source_url').notNull(),
  title:      text('title'),
  rawContent: text('raw_content'),
  language:   varchar('language', { length: 10 }),
  wordCount:  integer('word_count'),
  status:     varchar('status', { length: 20 }).default('pending').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
})
// status: 'pending' -> 'processing' -> 'done' | 'failed'
```

### digests

Each module produces one or more digest outputs for an article.

```typescript
export const digests = pgTable('digests', {
  id:         uuid('id').primaryKey().defaultRandom(),
  articleId:  uuid('article_id').references(() => articles.id).notNull(),
  moduleId:   varchar('module_id', { length: 50 }).notNull(),
  kind:       varchar('kind', { length: 30 }).notNull(),
  data:       jsonb('data').notNull(),
  createdAt:  timestamp('created_at').defaultNow(),
})
// kind: 'summary' | 'key_point' | 'flashcard' | 'quiz'
// data: structured JSON, schema depends on kind
```

### flashcards

Extracted from digests for independent review lifecycle (SM-2).

```typescript
export const flashcards = pgTable('flashcards', {
  id:           uuid('id').primaryKey().defaultRandom(),
  deviceId:     uuid('device_id').references(() => devices.id).notNull(),
  articleId:    uuid('article_id').references(() => articles.id).notNull(),
  front:        text('front').notNull(),
  back:         text('back').notNull(),
  tags:         text('tags').array(),
  // SM-2 spaced repetition fields
  repetitions:  integer('repetitions').default(0).notNull(),
  easeFactor:   real('ease_factor').default(2.5).notNull(),
  interval:     integer('interval').default(0).notNull(),
  nextReviewAt: timestamp('next_review_at').defaultNow().notNull(),
  createdAt:    timestamp('created_at').defaultNow(),
})
```

### Entity Relationship

```
devices 1----* articles 1----* digests
   |                |
   |                +----------* flashcards
   +---------------------------/
```

## 5. Module System Architecture

### Module Boundary

Each module is an independent npm package in the `modules/` directory. A module:
- Declares what content it can process (content types, languages, min length)
- Declares what output kinds it produces
- Implements a `DigestAgent` that runs the actual processing
- Has its own tests, prompts, and schemas
- Does NOT include any frontend components (rendering is centralized)

### Module Interface Contract

See `docs/MODULE_SDK.md` for the full interface specification.

Key interfaces:
- `ModuleManifest` — metadata and capability declaration
- `DigestModule` — entry point, creates agents
- `DigestAgent` — processes content, yields events
- `AgentRuntime` — platform capabilities injected into agents
- `DigestEvent` — real-time status/progress/result events
- `DigestOutput` — standardized output types

### Module Registration

At worker startup, the `ModuleRegistry` scans `modules/*/index.ts` and registers all modules. When an article arrives for processing, the registry filters modules by their `accepts` criteria to find applicable ones.

```typescript
class ModuleRegistry {
  private modules = new Map<string, DigestModule>()

  register(mod: DigestModule): void
  findApplicable(input: ContentInput): DigestModule[]
}
```

### Adding a New Module

1. Create `modules/<name>/` with standard structure
2. Implement `DigestModule` interface
3. The module is auto-discovered at worker startup
4. If the module produces a new `kind`, add a renderer in `apps/web/components/renderers/`

## 6. Agent Orchestration

The `DigestOrchestrator` is the brain of the worker. It coordinates the full pipeline:

```
URL submitted
     |
     v
[1. Fetch & Parse]  -- fetcher.ts + readability
     |
     v
[2. Detect Language] -- language-detect.ts
     |
     v
[3. Find Applicable Modules] -- module-registry.ts
     |
     v
[4. Run All Agents in Parallel] -- orchestrator.ts
     |    |    |    |
     v    v    v    v
   Agent Agent Agent Agent  (each module's agent)
     |    |    |    |
     v    v    v    v
[5. Collect Results & Save to DB]
     |
     v
[6. Mark Article as Done]
```

### Orchestrator Implementation

```typescript
class DigestOrchestrator {
  constructor(
    private registry: ModuleRegistry,
    private runtime: AgentRuntime,
    private db: Database,
    private eventBus: EventEmitter,
  ) {}

  async orchestrate(articleId: string): Promise<void> {
    const article = await this.db.getArticle(articleId)
    await this.db.updateArticleStatus(articleId, 'processing')

    try {
      // 1. Extract content
      this.emit(articleId, { type: 'status', message: 'Extracting content...' })
      const content = await this.fetchContent(article.sourceUrl)
      await this.db.updateArticleContent(articleId, content)

      // 2. Build input context
      const input = this.buildContentInput(articleId, content)

      // 3. Find applicable modules
      const modules = this.registry.findApplicable(input)

      // 4. Run all agents in parallel, stream events
      await Promise.allSettled(
        modules.map(mod => this.runAgent(articleId, mod, input))
      )

      // 5. Done
      await this.db.updateArticleStatus(articleId, 'done')
      this.emit(articleId, { type: 'status', message: 'Digestion complete!' })
    } catch (error) {
      await this.db.updateArticleStatus(articleId, 'failed')
      this.emit(articleId, { type: 'error', error: String(error), recoverable: false })
    }
  }

  private async runAgent(articleId: string, mod: DigestModule, input: ContentInput) {
    const agent = mod.createAgent(this.runtime)
    for await (const event of agent.digest(input)) {
      // Forward events to frontend via SSE
      this.emit(articleId, { ...event, moduleId: mod.manifest.id })
      // Save results to database
      if (event.type === 'result') {
        await this.saveDigestOutput(articleId, mod.manifest.id, event.output)
      }
    }
  }
}
```

### Error Isolation

Each module agent runs independently. If one module fails:
- Other modules continue unaffected
- The failed module is marked with error status
- The article still reaches 'done' status (partial results)
- Frontend shows "Module X failed" with retry option

## 7. LLM Integration — Vertex AI Gemini

### Client Architecture

The LLM client is abstracted behind the `AgentRuntime.llm` interface. Modules never call Gemini directly — they use the runtime's LLM client.

```typescript
// packages/llm/gemini-client.ts

import { VertexAI } from '@google-cloud/vertexai'

export function createGeminiClient(config: {
  projectId: string
  location: string
  model?: string
}): LLMClient {
  const vertexAI = new VertexAI({
    project: config.projectId,
    location: config.location,
  })

  const model = vertexAI.getGenerativeModel({
    model: config.model ?? 'gemini-2.0-flash',
  })

  return {
    async generate(prompt: string): Promise<string> {
      const result = await model.generateContent(prompt)
      return result.response.text()
    },

    async generateStructured<T>(
      prompt: string,
      schema: z.ZodSchema<T>
    ): Promise<T> {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: zodToGeminiSchema(schema),
        },
      })
      return schema.parse(JSON.parse(result.response.text()))
    },

    async *generateStream(prompt: string): AsyncGenerator<string> {
      const result = await model.generateContentStream(prompt)
      for await (const chunk of result.stream) {
        yield chunk.text()
      }
    },
  }
}
```

### Cost Estimation (Gemini 2.0 Flash)

| Operation | Input Tokens | Output Tokens | Cost |
|---|---|---|---|
| Summary | ~4,000 | ~500 | ~$0.003 |
| Key Points | ~4,000 | ~1,000 | ~$0.004 |
| Vocab Flashcards | ~4,000 | ~800 | ~$0.003 |
| Quiz | ~4,000 | ~600 | ~$0.003 |
| **Per article total** | | | **~$0.013** |

Gemini Flash is significantly cheaper than Claude Sonnet. 100 users x 3 articles/day x 30 days = ~$117/month.

## 8. Real-Time Status — SSE

### Server Side

```typescript
// apps/web/app/api/digest/[id]/events/route.ts

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const listener = (event: DigestEvent) => {
        const data = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(data))

        if (event.type === 'status' && event.message === 'Digestion complete!') {
          controller.close()
        }
      }

      eventBus.on(`digest:${params.id}`, listener)
      req.signal.addEventListener('abort', () => {
        eventBus.off(`digest:${params.id}`, listener)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

### Client Side

```typescript
// apps/web/lib/use-digest-events.ts

export function useDigestEvents(digestId: string) {
  const [events, setEvents] = useState<DigestEvent[]>([])
  const [status, setStatus] = useState<'connecting' | 'open' | 'done' | 'error'>('connecting')

  useEffect(() => {
    const source = new EventSource(`/api/digest/${digestId}/events`)

    source.onopen = () => setStatus('open')
    source.onmessage = (e) => {
      const event = JSON.parse(e.data) as DigestEvent
      setEvents(prev => [...prev, event])
      if (event.type === 'status' && event.message === 'Digestion complete!') {
        setStatus('done')
        source.close()
      }
    }
    source.onerror = () => {
      setStatus('error')
      source.close()
    }

    return () => source.close()
  }, [digestId])

  return { events, status }
}
```

## 9. Unified Renderer System

Since modules do not include frontend components, the core app maintains a renderer registry that maps output `kind` to React components.

```typescript
// apps/web/components/renderers/index.ts

import { SummaryRenderer } from './summary-renderer'
import { KeyPointRenderer } from './key-point-renderer'
import { FlashcardRenderer } from './flashcard-renderer'
import { QuizRenderer } from './quiz-renderer'
import { GenericRenderer } from './generic-renderer'

const rendererMap: Record<string, React.ComponentType<{ data: any }>> = {
  summary:   SummaryRenderer,
  key_point: KeyPointRenderer,
  flashcard: FlashcardRenderer,
  quiz:      QuizRenderer,
}

export function DigestOutputRenderer({ output }: { output: DigestOutput }) {
  const Renderer = rendererMap[output.kind] ?? GenericRenderer
  return <Renderer data={output.data} />
}
```

### Standard Output Kind Data Contracts

| Kind | Data Shape | Renderer |
|---|---|---|
| `summary` | `{ title: string, content: string, bulletPoints: string[] }` | Heading + paragraph + bullet list |
| `key_point` | `{ concept: string, explanation: string, analogy?: string, difficulty: number }` | Concept card with expandable explanation |
| `flashcard` | `{ front: string, back: string, tags: string[] }` | Flippable card |
| `quiz` | `{ question: string, options: string[], correctIndex: number, explanation: string }` | Multiple choice with reveal |

When a new `kind` is needed:
1. Add the type to `DigestOutput` union in `packages/module-sdk/types.ts`
2. Create a renderer component in `apps/web/components/renderers/`
3. Register it in `rendererMap`

## 10. Flashcard Review — SM-2 Algorithm

```typescript
// apps/web/lib/sm2.ts

interface SM2Result {
  repetitions: number
  easeFactor: number
  interval: number     // days until next review
}

export function sm2(
  quality: 0 | 1 | 2 | 3 | 4 | 5,  // 0=Again, 3=Hard, 4=Good, 5=Easy
  prev: SM2Result
): SM2Result {
  let { repetitions, easeFactor, interval } = prev

  if (quality < 3) {
    // Failed — reset
    repetitions = 0
    interval = 0
  } else {
    // Passed
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(interval * easeFactor)
    }
    repetitions += 1
  }

  // Update ease factor
  easeFactor = Math.max(
    1.3,
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  )

  return { repetitions, easeFactor, interval }
}
```

UI maps 4 buttons to SM-2 quality scores:
- Again → 0
- Hard → 3
- Good → 4
- Easy → 5

## 11. Anonymous User Identification

```
First visit:
  1. Server checks for `dino_device_id` cookie
  2. If absent: generate UUID, set httpOnly cookie (365 days), create device record
  3. If present: look up existing device record

Future login migration:
  1. User signs in via OAuth
  2. System links device UUID to user account
  3. All articles/flashcards transfer to user account
  4. Cookie remains as device identifier
```

## 12. API Routes

| Method | Path | Description |
|---|---|---|
| POST | `/api/ingest` | Submit a URL for digestion. Body: `{ url: string }`. Returns: `{ articleId: string }` |
| GET | `/api/digest/:id` | Get digest results for an article. Returns: `{ article, digests[] }` |
| GET | `/api/digest/:id/events` | SSE stream of processing events |
| GET | `/api/history` | List all articles for current device. Query: `?page=1&limit=20` |
| GET | `/api/review/due` | Get flashcards due for review. Returns: `{ cards[] }` |
| POST | `/api/review/score` | Score a flashcard. Body: `{ cardId, quality }` |

## 13. Error Handling Strategy

| Scenario | Handling |
|---|---|
| Content extraction fails | Article status → 'failed', show error in UI with retry |
| Single module agent fails | Mark module as failed, other modules unaffected, partial results shown |
| LLM API rate limited | BullMQ auto-retry with exponential backoff (max 3 retries) |
| LLM API timeout | Same as rate limit handling |
| Invalid URL submitted | Immediate 400 response, no queue job created |
| SSE connection dropped | Client auto-reconnects, polls for current status |

## 14. Environment Variables

```bash
# .env.example

# Database (Neon)
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dinodigest

# Redis (Upstash)
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# Google Vertex AI
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
COOKIE_SECRET=random-secret-string
```

## 15. Deployment Architecture

```
                    Internet
                       |
              +--------v--------+
              |     Vercel      |
              |                 |
              |  Next.js App    |
              |  (Web + API)    |
              +--------+--------+
                       |
          +------------+------------+
          |                         |
  +-------v-------+    +-----------v---------+
  | Upstash Redis |    | Neon PostgreSQL     |
  | (Queue)       |    | (Database)          |
  +-------+-------+    +---------------------+
          |
  +-------v-------+
  | Railway        |
  |                |
  | Worker Process |
  | (BullMQ)       |
  +-------+-------+
          |
  +-------v-----------+
  | Google Vertex AI   |
  | (Gemini 2.0 Flash) |
  +--------------------+
```

All services have free or low-cost tiers suitable for MVP.

## 16. Data Flow Diagram

```mermaid
flowchart LR
    subgraph INPUT["Input"]
        URL["Blog URL"]
    end

    subgraph EXTRACT["Content Extraction"]
        HTML["Raw HTML"]
        TEXT["Clean Text<br/>+ Title<br/>+ Word Count"]
        LANG["Language Code<br/>(en/zh/...)"]
    end

    subgraph DIGEST_PIPELINE["Digestion Pipeline"]
        CI["ContentInput<br/>{id, title, content,<br/>language, contentType,<br/>wordCount}"]

        subgraph AGENTS["Module Agents (parallel)"]
            direction TB
            AS["Summary Agent<br/>→ Gemini API<br/>→ Zod validate"]
            AK["KeyPoints Agent<br/>→ Gemini API<br/>→ Zod validate"]
            AV["Vocab Agent<br/>→ Gemini API<br/>→ Zod validate"]
            AQ["Quiz Agent<br/>→ Gemini API<br/>→ Zod validate"]
        end
    end

    subgraph OUTPUT["Structured Outputs"]
        O_SUM["kind: summary<br/>{title, content,<br/>bulletPoints}"]
        O_KP["kind: key_point<br/>{concept, explanation,<br/>analogy, difficulty}"]
        O_FC["kind: flashcard<br/>{front, back, tags}"]
        O_QZ["kind: quiz<br/>{question, options,<br/>correctIndex, explanation}"]
    end

    subgraph STORAGE["Database Storage"]
        D_ART[("articles table")]
        D_DIG[("digests table<br/>(JSONB)")]
        D_FLA[("flashcards table<br/>(SM-2 fields)")]
    end

    subgraph RENDER["Frontend Rendering"]
        R_MAP["rendererMap[kind]"]
        R1["SummaryRenderer"]
        R2["KeyPointRenderer"]
        R3["FlashcardRenderer"]
        R4["QuizRenderer"]
    end

    URL --> HTML --> TEXT --> LANG --> CI
    CI --> AS & AK & AV & AQ
    AS --> O_SUM
    AK --> O_KP
    AV --> O_FC
    AQ --> O_QZ

    TEXT -->|"save"| D_ART
    O_SUM -->|"save"| D_DIG
    O_KP -->|"save"| D_DIG
    O_FC -->|"save"| D_DIG
    O_FC -->|"also save"| D_FLA
    O_QZ -->|"save"| D_DIG

    D_DIG -->|"query"| R_MAP
    R_MAP --> R1 & R2 & R3 & R4
```

## 17. Future Architecture Considerations

These are NOT part of MVP but should not be blocked by current design:

- **Vector embeddings (pgvector)**: Add `embeddings` table to `packages/db/schema.ts` for semantic search
- **User authentication**: Replace `deviceId` with `userId`, add OAuth tables
- **Module marketplace**: Add module metadata table, remote module loading
- **WebSocket**: Replace SSE with WebSocket if bidirectional communication needed
- **Multi-LLM support**: `packages/llm/` already abstracts the client; add OpenAI/Claude adapters
- **Rate limiting**: Add per-device rate limiting at API route level
