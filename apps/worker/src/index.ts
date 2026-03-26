import { Worker } from "bullmq";
import IORedis from "ioredis";
import { createDB } from "@dinodigest/db";
import { createGeminiClient } from "@dinodigest/llm";
import { ModuleRegistry } from "./module-registry.js";
import { DigestOrchestrator } from "./orchestrator.js";

// Import modules
import summaryModule from "@dinodigest/module-summary";
import keyPointsModule from "@dinodigest/module-key-points";
import vocabFlashcardModule from "@dinodigest/module-vocab-flashcard";
import quizModule from "@dinodigest/module-quiz";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://dinodigest:dinodigest@localhost:5432/dinodigest";
const QUEUE_NAME = "digest";

async function main() {
  console.log("[DinoDigest Worker] Starting...");

  // 1. Initialize database
  const db = createDB(DATABASE_URL);
  console.log("[DinoDigest Worker] Database connected");

  // 2. Initialize LLM client
  // Prefer API key (simpler), fall back to Vertex AI
  const apiKey = process.env.GEMINI_API_KEY;
  const llm = createGeminiClient(
    apiKey
      ? { apiKey }
      : {
          projectId: process.env.GOOGLE_CLOUD_PROJECT ?? "",
          location: process.env.GOOGLE_CLOUD_LOCATION ?? "us-central1",
        },
  );
  console.log(
    `[DinoDigest Worker] LLM client initialized (${apiKey ? "API key" : "Vertex AI"})`,
  );

  // 3. Register modules
  const registry = new ModuleRegistry();
  registry.register(summaryModule);
  registry.register(keyPointsModule);
  registry.register(vocabFlashcardModule);
  registry.register(quizModule);

  // 4. Create orchestrator
  const orchestrator = new DigestOrchestrator(registry, llm, db);

  // 5. Start BullMQ worker
  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      const { articleId } = job.data as { articleId: string };
      console.log(`[DinoDigest Worker] Processing article: ${articleId}`);
      await orchestrator.orchestrate(articleId);
    },
    {
      connection,
      concurrency: 3,
    },
  );

  worker.on("completed", (job) => {
    console.log(`[DinoDigest Worker] Job ${job.id} completed`);
  });

  worker.on("failed", (job, err) => {
    console.error(`[DinoDigest Worker] Job ${job?.id} failed:`, err.message);
  });

  worker.on("ready", () => {
    console.log("[DinoDigest Worker] Ready and listening for jobs");
    console.log(
      `[DinoDigest Worker] Registered modules: ${registry.getAll().map((m) => m.manifest.id).join(", ")}`,
    );
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("[DinoDigest Worker] Shutting down...");
    await worker.close();
    await connection.quit();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[DinoDigest Worker] Fatal error:", err);
  process.exit(1);
});
