import { Worker } from "bullmq";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
const QUEUE_NAME = "digest";

async function main() {
  console.log("[DinoDigest Worker] Starting...");
  console.log(`[DinoDigest Worker] Connecting to Redis: ${REDIS_URL}`);

  const connection = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,
  });

  const worker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(
        `[DinoDigest Worker] Processing job ${job.id}: ${JSON.stringify(job.data)}`,
      );

      const { articleId } = job.data as { articleId: string };

      // TODO: implement orchestrator.orchestrate(articleId)
      console.log(`[DinoDigest Worker] Would process article: ${articleId}`);
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
