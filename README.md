# DinoDigest

Paste a blog URL, let the dinosaur digest it into knowledge you can absorb.

DinoDigest extracts articles from URLs and runs them through AI-powered "digestive enzyme" modules that produce summaries, key concepts, vocabulary flashcards, and comprehension quizzes.

## Prerequisites

- **Node.js** >= 20
- **pnpm** >= 9 (`npm install -g pnpm`)
- **Docker Desktop** (for local PostgreSQL + Redis)
- **Google Cloud account** with Vertex AI API enabled

## Quick Start

### 1. Clone and install

```bash
cd dinodigest
pnpm install
```

### 2. Start Docker services

```bash
pnpm docker:up
```

This starts:
- PostgreSQL 16 on `localhost:5432`
- Redis 7 on `localhost:6379`

Verify they're running:

```bash
docker compose ps
```

### 3. Push database schema

```bash
pnpm db:push
```

This creates the 4 tables: `devices`, `articles`, `digests`, `flashcards`.

### 4. Configure Vertex AI

#### a) Create a Google Cloud project and enable Vertex AI API

```bash
# If you have gcloud CLI installed:
gcloud services enable aiplatform.googleapis.com --project=YOUR_PROJECT_ID
```

Or enable it in the [Google Cloud Console](https://console.cloud.google.com/apis/library/aiplatform.googleapis.com).

#### b) Create a service account key

```bash
# Create service account
gcloud iam service-accounts create dinodigest-worker \
  --project=YOUR_PROJECT_ID \
  --display-name="DinoDigest Worker"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:dinodigest-worker@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# Download key file
gcloud iam service-accounts keys create service-account.json \
  --iam-account=dinodigest-worker@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Place `service-account.json` in the project root (it's gitignored).

#### c) Edit `.env`

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```
GOOGLE_CLOUD_PROJECT=your-actual-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
```

The `DATABASE_URL` and `REDIS_URL` defaults work with the Docker setup — no changes needed.

### 5. Start the app

You need **two terminals**:

**Terminal 1 — Worker** (processes digest jobs):

```bash
pnpm --filter @dinodigest/worker dev
```

You should see:

```
[DinoDigest Worker] Starting...
[DinoDigest Worker] Database connected
[DinoDigest Worker] LLM client initialized
[ModuleRegistry] Registered: summary (Article Summary)
[ModuleRegistry] Registered: key-points (Key Points Extraction)
[ModuleRegistry] Registered: vocab-flashcard (Vocabulary Flashcards)
[ModuleRegistry] Registered: quiz (Comprehension Quiz)
[DinoDigest Worker] Ready and listening for jobs
```

**Terminal 2 — Web app**:

```bash
pnpm --filter @dinodigest/web dev
```

### 6. Use it

Open [http://localhost:3000](http://localhost:3000)

1. Paste an English blog URL into the dinosaur's mouth
2. Click **Feed**
3. Watch the dinosaur chew (processing takes 10-30 seconds)
4. Browse the digested results across 4 tabs: Summary, Key Points, Flashcards, Quiz
5. Go to `/review` to practice flashcards with spaced repetition

## Project Structure

```
dinodigest/
├── apps/
│   ├── web/              # Next.js 16 frontend + API routes
│   └── worker/           # BullMQ background worker
├── packages/
│   ├── module-sdk/       # Core interfaces (DigestModule, DigestAgent, etc.)
│   ├── db/               # Drizzle ORM schema + database connection
│   └── llm/              # Vertex AI Gemini client
├── modules/
│   ├── summary/          # Chinese article summary
│   ├── key-points/       # Knowledge point extraction
│   ├── vocab-flashcard/  # English vocabulary flashcards
│   └── quiz/             # Comprehension quiz questions
├── docs/                 # Product & architecture documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DEVELOPMENT_PLAN.md
│   └── MODULE_SDK.md
└── docker-compose.yml    # Local PostgreSQL + Redis
```

## Available Commands

| Command | Description |
|---|---|
| `pnpm docker:up` | Start PostgreSQL + Redis containers |
| `pnpm docker:down` | Stop containers |
| `pnpm db:push` | Push schema to database |
| `pnpm db:generate` | Generate migration files |
| `pnpm --filter @dinodigest/web dev` | Start web app (port 3000) |
| `pnpm --filter @dinodigest/worker dev` | Start background worker |
| `pnpm build` | Build all packages |
| `pnpm lint` | Type-check all packages |

## Digest Modules

Each module is an independent package in `modules/` that implements the `DigestModule` interface:

| Module | Input | Output | Trigger |
|---|---|---|---|
| **summary** | Any article | Chinese summary + bullet points | All articles |
| **key-points** | Any article | Knowledge concepts with explanations | All articles |
| **vocab-flashcard** | English article | Vocabulary flashcards (word, IPA, translation) | English only |
| **quiz** | Any article | Multiple-choice comprehension questions | All articles |

See `docs/MODULE_SDK.md` for how to build your own module.

## Troubleshooting

**Worker shows `ECONNREFUSED` for Redis**
→ Docker containers aren't running. Run `pnpm docker:up`.

**`Empty response from Gemini` error**
→ Check your `GOOGLE_CLOUD_PROJECT` and `GOOGLE_APPLICATION_CREDENTIALS` in `.env`.
→ Verify the Vertex AI API is enabled for your project.
→ Make sure `service-account.json` exists and has the `aiplatform.user` role.

**`Could not extract article content from URL`**
→ Some websites block scrapers. Try a different URL.
→ Paywalled or JavaScript-heavy sites may not work.

**Database connection errors**
→ Run `docker compose ps` to verify PostgreSQL is running.
→ Run `pnpm db:push` to ensure tables exist.
